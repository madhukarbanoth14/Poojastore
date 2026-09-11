import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/delivery_slot.dart';
import '../../../core/payments/upi_pay_sheet.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import 'kits_screen.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  bool _loading = false;
  String? _error;
  String? _selectedAddressId;
  List<Map<String, dynamic>> _addresses = [];
  Map<String, dynamic>? _cart;

  final _line1 = TextEditingController(text: '4th Cross, Malleshwaram');
  final _city = TextEditingController(text: 'Bengaluru');
  final _state = TextEditingController(text: 'Karnataka');
  final _postal = TextEditingController(text: '560003');
  final _phone = TextEditingController();

  String get _deliverySlot {
    final items = (_cart?['items'] as List?) ?? const [];
    final slugs = items.map((item) {
      final product = item is Map ? item['product'] : null;
      if (product is Map) return product['slug'] as String?;
      return null;
    });
    return deliverySlotForSlugs(slugs);
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _line1.dispose();
    _city.dispose();
    _state.dispose();
    _postal.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(marketplaceApiProvider);
      final addresses = await api.listAddresses();
      var cart = await api.getCart();
      final user = ref.read(authControllerProvider).user;
      final phone = user?.phoneE164 ?? '';
      final itemCount = (cart['itemCount'] as num?)?.toInt() ??
          ((cart['items'] as List?)?.length ?? 0);
      if (itemCount == 0) {
        final pending = await api.pendingPayment();
        if (pending != null &&
            pending['payment'] is Map &&
            (pending['payment'] as Map)['provider'] == 'UPI_QR') {
          cart = await api.getCart();
          if (!mounted) return;
          setState(() {
            _addresses = addresses;
            _cart = cart;
            _selectedAddressId =
                addresses.isNotEmpty ? addresses.first['id'] as String : null;
            if (RegExp(r'^\+91[6-9]\d{9}$').hasMatch(phone)) {
              _phone.text = phone.replaceFirst('+91', '');
            }
          });
          final payment =
              Map<String, dynamic>.from(pending['payment'] as Map);
          final paid = await completeOrCollectUpi(
            context: context,
            api: api,
            payment: payment,
          );
          if (!paid || !mounted) return;
          final order = pending['order'] as Map<String, dynamic>?;
          final id = order?['id'] as String? ?? '';
          final total = (payment['amountMinor'] as num?)?.toInt() ?? 0;
          context.go(
            '/order-confirm?id=${Uri.encodeComponent(id)}'
            '&amount=${Uri.encodeComponent(formatInr(total))}'
            '&slot=${Uri.encodeComponent(_deliverySlot)}'
            '&pending=1',
          );
          return;
        }
      }
      if (!mounted) return;
      setState(() {
        _addresses = addresses;
        _cart = cart;
        _selectedAddressId =
            addresses.isNotEmpty ? addresses.first['id'] as String : null;
        if (RegExp(r'^\+91[6-9]\d{9}$').hasMatch(phone)) {
          _phone.text = phone.replaceFirst('+91', '');
        }
      });
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  Future<void> _ensureAddress() async {
    if (_selectedAddressId != null) return;
    final created = await ref.read(marketplaceApiProvider).createAddress({
      'label': 'Home',
      'line1': _line1.text.trim(),
      'city': _city.text.trim(),
      'state': _state.text.trim(),
      'postalCode': _postal.text.trim(),
      'country': 'IN',
      'isDefault': true,
    });
    _selectedAddressId = created['id'] as String;
  }

  Future<void> _pay() async {
    final items = _cart?['subtotalMinor'] as int? ?? 0;
    final shipping = items >= 100000 ? 0 : 4900;
    if (shipping > 0) {
      final go = await showDialog<bool>(
        context: context,
        builder: (ctx) {
          return AlertDialog(
            title: const Text('Delivery fee of ₹49'),
            content: Text(
              'This order is under ₹1,000, so a delivery fee of ₹49 applies.\n\n'
              'Kit: ${formatInr(items)}\n'
              'Delivery fee: ${formatInr(shipping)}\n'
              'Total to pay: ${formatInr(items + shipping)}\n\n'
              'Free delivery starts at ₹1,000.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Go back'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Continue to pay'),
              ),
            ],
          );
        },
      );
      if (go != true) return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final phone = _phone.text.trim();
      if (phone.isEmpty) {
        throw StateError('Enter your mobile number for delivery updates.');
      }
      await _ensureAddress();
      final api = ref.read(marketplaceApiProvider);
      final result = await api.checkout(
        _selectedAddressId!,
        deliverySlot: _deliverySlot,
        contactPhone: phone,
      );
      final payment = result['payment'] as Map<String, dynamic>;
      if (!mounted) return;
      final paid = await completeOrCollectUpi(
        context: context,
        api: api,
        payment: payment,
      );
      if (!paid || !mounted) return;
      final order = result['order'] as Map<String, dynamic>?;
      final id = order?['id'] as String? ?? '';
      final total = order?['totalMinor'] as int? ??
          (_cart?['subtotalMinor'] as int? ?? 0);
      final pending =
          payment['provider'] == 'UPI_QR' || payment['provider'] == 'PAYU';
      context.go(
        '/order-confirm?id=${Uri.encodeComponent(id)}'
        '&amount=${Uri.encodeComponent(formatInr(total))}'
        '&slot=${Uri.encodeComponent(_deliverySlot)}'
        '${pending ? '&pending=1' : ''}',
      );
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final t = context.ps;
    final total = _cart?['subtotalMinor'] as int? ?? 0;
    final shipping = total >= 100000 ? 0 : 4900;

    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Checkout'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
        children: [
          Text(
            'Delivery Address',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14.5,
              color: t.text,
            ),
          ),
          const SizedBox(height: 10),
          if (_addresses.isNotEmpty)
            ..._addresses.map(
              (a) => AddressPickCard(
                label: a['label'] as String,
                detail:
                    '${a['line1']}, ${a['city']}, ${a['state']} ${a['postalCode']}',
                selected: _selectedAddressId == a['id'],
                onTap: () =>
                    setState(() => _selectedAddressId = a['id'] as String),
              ),
            )
          else ...[
            TextField(
              controller: _line1,
              decoration: const InputDecoration(labelText: 'Address line'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _city,
              decoration: const InputDecoration(labelText: 'City'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _state,
              decoration: const InputDecoration(labelText: 'State'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _postal,
              decoration: const InputDecoration(labelText: 'Postal code'),
            ),
          ],
          const SizedBox(height: 10),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Mobile number',
              hintText: 'Required for delivery (Google / Apple login)',
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Delivery',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              color: AppColors.maroonDeep,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _deliverySlot,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'Payment',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Pay securely with Razorpay (UPI, cards, netbanking). Test keys are used in this build.',
            style: TextStyle(fontSize: 12.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 20),
          const Text(
            'Order Summary',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: AppColors.blush,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _sum('Items', formatInr(total)),
                _sum('Delivery', shipping == 0 ? 'Free' : formatInr(shipping)),
                const Divider(height: 18, color: AppColors.border),
                _sum('Total', formatInr(total + shipping), bold: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          FilledButton(
            onPressed: _loading ? null : _pay,
            child: Text(_loading ? l10n.processing : 'Pay now'),
          ),
        ],
      ),
    );
  }

  Widget _sum(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: bold ? 14.5 : 13,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
              color: bold ? AppColors.text : AppColors.textMuted,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: bold ? 15 : 13,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
