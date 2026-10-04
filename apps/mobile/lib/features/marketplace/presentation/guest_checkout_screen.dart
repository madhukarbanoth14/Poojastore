import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/delivery_zone.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/payments/upi_pay_sheet.dart';
import '../../../core/pending_cart.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../auth/presentation/auth_controller.dart';
import 'kits_screen.dart';

const _deliverySlot = 'Within 6 hours';

class GuestCheckoutScreen extends ConsumerStatefulWidget {
  const GuestCheckoutScreen({super.key});

  @override
  ConsumerState<GuestCheckoutScreen> createState() =>
      _GuestCheckoutScreenState();
}

class _GuestCheckoutScreenState extends ConsumerState<GuestCheckoutScreen> {
  PendingCartAdd? _pending;
  bool _ready = false;
  bool _busy = false;
  String? _error;

  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _line1 = TextEditingController();
  final _city = TextEditingController(text: 'Hyderabad');
  final _state = TextEditingController(text: 'Telangana');
  final _postal = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _line1.dispose();
    _city.dispose();
    _state.dispose();
    _postal.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final pending = await peekPendingCart();
    if (!mounted) return;
    setState(() {
      _pending = pending;
      _ready = true;
    });
  }

  Future<void> _submit() async {
    final pending = _pending;
    if (pending == null || pending.productId.isEmpty) {
      setState(() => _error = 'Choose a kit first, then continue to checkout.');
      return;
    }
    final name = _name.text.trim();
    final phone = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (name.isEmpty ||
        phone.length != 10 ||
        _line1.text.trim().isEmpty ||
        _postal.text.trim().isEmpty) {
      setState(
        () => _error = 'Enter your name, 10-digit mobile, street, and PIN.',
      );
      return;
    }
    if (!isHyderabadDelivery(postalCode: _postal.text)) {
      setState(() => _error = hyderabadDeliveryMessage);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final api = ref.read(marketplaceApiProvider);
      final result = await api.guestCheckout(
        productId: pending.productId,
        selectedItemKeys: pending.selectedItemKeys,
        fullName: name,
        phone: phone,
        line1: _line1.text.trim(),
        city: _city.text.trim(),
        state: _state.text.trim(),
        postalCode: _postal.text.trim(),
        deliverySlot: _deliverySlot,
      );
      final session = await ref
          .read(authRepositoryProvider)
          .applyTokenPayload(result);
      await ref.read(authControllerProvider.notifier).applySession(session);
      await takePendingCart();
      if (!mounted) return;
      final payment = Map<String, dynamic>.from(result['payment'] as Map);
      final paid = await completeOrCollectUpi(
        context: context,
        api: api,
        payment: payment,
      );
      if (!paid || !mounted) return;
      final order = result['order'] as Map<String, dynamic>?;
      final id = order?['id'] as String? ?? '';
      final total = (payment['amountMinor'] as num?)?.toInt() ??
          (pending.priceMinor ?? 0);
      context.go(
        '/order-confirm?id=${Uri.encodeComponent(id)}'
        '&amount=${Uri.encodeComponent(formatInr(total))}'
        '&slot=${Uri.encodeComponent(_deliverySlot)}'
        '&pending=1',
      );
    } catch (e) {
      if (mounted) setState(() => _error = friendlyNetworkError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const Scaffold(
        backgroundColor: AppColors.bg,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final pending = _pending;
    if (pending == null) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: const PsHeader(title: 'Checkout'),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          child: Column(
            children: [
              const PpTitle('Choose a kit'),
              const SizedBox(height: 10),
              const Text(
                'Add a Pooja kit, then enter your name, mobile, and Hyderabad address to book. No Google login needed.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted, height: 1.45),
              ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: () => context.go('/shop'),
                child: const Text('Browse kits'),
              ),
            ],
          ),
        ),
      );
    }

    final pinComplete = _postal.text.replaceAll(RegExp(r'\D'), '').length >= 6;
    final showZone =
        pinComplete && !isHyderabadDelivery(postalCode: _postal.text);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Checkout'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          const Text(
            'QUICK CHECKOUT',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.6,
              color: AppColors.maroon,
            ),
          ),
          const SizedBox(height: 8),
          const PpTitle('Book your kit'),
          const SizedBox(height: 8),
          const Text(
            'Enter your name, mobile, and Hyderabad address to pay. No Google login needed.',
            style: TextStyle(color: AppColors.textMuted, height: 1.45),
          ),
          const SizedBox(height: 16),
          PsCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pending.itemName ?? 'Pooja kit',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.maroonDeep,
                  ),
                ),
                if (pending.priceMinor != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Kit ${formatInr(pending.priceMinor!)} · delivery extra if under ₹1,000',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'Full name'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(10),
            ],
            decoration: const InputDecoration(labelText: 'Mobile number'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _line1,
            decoration: const InputDecoration(labelText: 'House / street'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _city,
            decoration: const InputDecoration(labelText: 'City (Hyderabad)'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _state,
            decoration: const InputDecoration(labelText: 'State'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _postal,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(6),
            ],
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(labelText: 'PIN (500xxx)'),
          ),
          if (showZone) ...[
            const SizedBox(height: 10),
            Text(
              hyderabadDeliveryMessage,
              style: const TextStyle(color: AppColors.saffron, fontSize: 13),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 10),
            Text(_error!, style: const TextStyle(color: AppColors.saffron)),
          ],
          const SizedBox(height: 18),
          FilledButton(
            onPressed: _busy ? null : _submit,
            child: Text(_busy ? 'Placing order…' : 'Pay now'),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () => context.push('/login?next=/checkout'),
            child: const Text('Already have an account? Sign in'),
          ),
        ],
      ),
    );
  }
}
