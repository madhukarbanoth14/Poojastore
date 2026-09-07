import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/payments/upi_pay_sheet.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../../marketplace/presentation/kits_screen.dart';
import '../data/priests_api.dart';

const _times = ['9–11 AM', '11 AM–1 PM', '4–6 PM', '6–8 PM'];
const _rituals = [
  'Griha Pravesh',
  'Satyanarayan Puja',
  'Ganesh Puja',
  'General Consultation',
];
const _payments = ['UPI', 'Card', 'Cash on Delivery'];

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({super.key, required this.slug, required this.mode});

  final String slug;
  final String mode;

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  late Future<Map<String, dynamic>> _future;
  int _dateIdx = 0;
  int? _timeIdx = 0;
  int? _ritualIdx = 0;
  int _payIdx = 0;
  bool _loading = false;
  String? _error;
  String? _addressId;

  bool get _online => widget.mode == 'online';

  @override
  void initState() {
    super.initState();
    _future = ref.read(priestsApiProvider).detail(widget.slug);
    _loadAddress();
  }

  Future<void> _loadAddress() async {
    final items = await ref.read(priestsApiProvider).listAddresses();
    if (!mounted) return;
    setState(() {
      _addressId = items.isNotEmpty ? items.first['id'] as String : null;
    });
  }

  Future<void> _ensureAddress() async {
    if (_addressId != null) return;
    final created = await ref.read(priestsApiProvider).createAddress({
      'label': 'Home',
      'line1': '4th Cross, Malleshwaram',
      'city': 'Bengaluru',
      'state': 'Karnataka',
      'postalCode': '560003',
      'country': 'IN',
      'isDefault': true,
    });
    _addressId = created['id'] as String;
  }

  Future<void> _confirm(Map<String, dynamic> priest) async {
    final slots = (priest['slots'] as List).cast<Map<String, dynamic>>();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _ensureAddress();
      if (slots.isEmpty) {
        if (mounted) {
          context.go(
            '/booking-confirm?name=${Uri.encodeComponent(priest['fullName'] as String)}'
            '&mode=${widget.mode}',
          );
        }
        return;
      }
      final slotId = slots.first['id'] as String;
      final result = await ref.read(priestsApiProvider).book(
            slug: widget.slug,
            slotId: slotId,
            addressId: _addressId!,
            serviceName: _ritualIdx == null
                ? (_online ? 'Online consultation' : 'Home Visit')
                : _rituals[_ritualIdx!],
            serviceMode: _online ? 'ONLINE' : 'HOME_VISIT',
          );
      final payment = result['payment'] as Map<String, dynamic>?;
      if (payment != null) {
        if (!mounted) return;
        final paid = await completeOrCollectUpi(
          context: context,
          api: ref.read(marketplaceApiProvider),
          payment: payment,
        );
        if (!paid || !mounted) return;
      }
      if (!mounted) return;
      final booking = result['booking'] as Map<String, dynamic>?;
      final id = booking?['id'] as String? ?? 'PB-70542';
      final dateLabel = _dateIdx == 0
          ? 'Today'
          : _dateIdx == 1
              ? 'Tomorrow'
              : 'Day $_dateIdx';
      final timeLabel = _times[_timeIdx ?? 0];
      final ritual = _rituals[_ritualIdx ?? 0];
      final pending = payment?['provider'] == 'UPI_QR';
      context.go(
        '/booking-confirm?name=${Uri.encodeComponent(priest['fullName'] as String)}'
        '&mode=${widget.mode}'
        '&date=${Uri.encodeComponent(dateLabel)}'
        '&time=${Uri.encodeComponent(timeLabel)}'
        '&id=${Uri.encodeComponent(id)}'
        '&ritual=${Uri.encodeComponent(ritual)}'
        '&fee=${Uri.encodeComponent(formatInr((priest['basePriceMinor'] as int) + (priest['travelFeeMinor'] as int)))}'
        '${pending ? '&pending=1' : ''}',
      );
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    return FutureBuilder(
      future: _future,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return Scaffold(
            backgroundColor: t.bg,
            appBar: const PsHeader(title: 'Book Priest'),
            body: const Center(child: CircularProgressIndicator()),
          );
        }
        final priest = snapshot.data!;
        final name = priest['fullName'] as String;
        final feeMinor =
            (priest['basePriceMinor'] as int) + (priest['travelFeeMinor'] as int);

        return Scaffold(
          backgroundColor: t.bg,
          appBar: PsHeader(
            title: _online ? 'Book Online Consultation' : 'Book Home Visit',
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 32),
            children: [
              Text(
                'with $name',
                style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
              ),
              const SizedBox(height: 14),
              const Text(
                'Date',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: List.generate(4, (i) {
                  final labels = [
                    'Today',
                    'Tomorrow',
                    'Sat 16',
                    'Sun 17',
                  ];
                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(right: i == 3 ? 0 : 8),
                      child: SelectChip(
                        label: labels[i],
                        selected: _dateIdx == i,
                        onTap: () => setState(() => _dateIdx = i),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 18),
              const Text(
                'Time',
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
                  _times.length,
                  (i) => SelectChip(
                    label: _times[i],
                    selected: _timeIdx == i,
                    onTap: () => setState(() => _timeIdx = i),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              if (!_online) ...[
                const Text(
                  'Address',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 10),
                AddressPickCard(
                  label: 'Home',
                  detail: '12-3-45, Jubilee Hills, Hyderabad 500033',
                  selected: true,
                  onTap: () {},
                ),
                const SizedBox(height: 18),
              ],
              const Text(
                'Ritual Type',
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
                  _rituals.length,
                  (i) => SelectChip(
                    label: _rituals[i],
                    selected: _ritualIdx == i,
                    onTap: () => setState(() => _ritualIdx = i),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Payment Method',
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
                  _payments.length,
                  (i) => SelectChip(
                    label: _payments[i],
                    selected: _payIdx == i,
                    onTap: () => setState(() => _payIdx = i),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: AppColors.blush,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Consultation Fee',
                      style: TextStyle(fontSize: 13.5, color: AppColors.textMuted),
                    ),
                    Text(
                      formatInr(feeMinor),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14.5,
                        color: AppColors.text,
                      ),
                    ),
                  ],
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 18),
              FilledButton(
                onPressed: _loading ? null : () => _confirm(priest),
                child: Text(
                  _loading
                      ? context.l10n.booking
                      : 'Confirm Booking',
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
