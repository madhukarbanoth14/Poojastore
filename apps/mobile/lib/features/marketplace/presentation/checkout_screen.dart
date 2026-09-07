import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/payments/upi_pay_sheet.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import 'kits_screen.dart';

const _slots = [
  'Today, 6–8 PM',
  'Tomorrow, 9–11 AM',
  'Tomorrow, 4–6 PM',
];

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  bool _loading = false;
  String? _error;
  String? _selectedAddressId;
  int _slotIdx = 0;
  List<Map<String, dynamic>> _addresses = [];
  Map<String, dynamic>? _cart;

  final _line1 = TextEditingController(text: '4th Cross, Malleshwaram');
  final _city = TextEditingController(text: 'Bengaluru');
  final _state = TextEditingController(text: 'Karnataka');
  final _postal = TextEditingController(text: '560003');
  final _phone = TextEditingController();

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
      final cart = await api.getCart();
      final user = ref.read(authControllerProvider).user;
      final phone = user?.phoneE164 ?? '';
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
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final phone = _phone.text.trim();
      if (phone.isEmpty) {
        throw StateError('Enter your mobile number for delivery updates.');
      }
      await ref.read(authControllerProvider.notifier).updateProfile(phone: phone);
      await _ensureAddress();
      final api = ref.read(marketplaceApiProvider);
      final result = await api.checkout(
        _selectedAddressId!,
        deliverySlot: _slots[_slotIdx],
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
      final pending = payment['provider'] == 'UPI_QR';
      context.go(
        '/order-confirm?id=${Uri.encodeComponent(id)}'
        '&amount=${Uri.encodeComponent(formatInr(total))}'
        '&slot=${Uri.encodeComponent(_slots[_slotIdx])}'
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
          const SizedBox(height: 16),
          const Text(
            'Delivery Slot',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(
              _slots.length,
              (i) => SelectChip(
                label: _slots[i],
                selected: _slotIdx == i,
                onTap: () => setState(() => _slotIdx = i),
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
