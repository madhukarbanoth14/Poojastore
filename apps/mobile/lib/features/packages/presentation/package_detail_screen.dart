import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/payments/payment_flow.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../../marketplace/presentation/kits_screen.dart';
import '../data/packages_api.dart';

class PackageDetailScreen extends ConsumerStatefulWidget {
  const PackageDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<PackageDetailScreen> createState() =>
      _PackageDetailScreenState();
}

class _PackageDetailScreenState extends ConsumerState<PackageDetailScreen> {
  late Future<Map<String, dynamic>> _future;
  bool _includeKit = true;
  bool _includePriest = true;
  bool _includePrasad = false;
  final Set<String> _addons = {};
  String? _slotId;
  String? _addressId;
  List<Map<String, dynamic>> _addresses = [];
  final _service = TextEditingController(text: 'Home Puja');
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _future = ref.read(packagesApiProvider).detail(widget.slug);
    _loadAddresses();
  }

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  Future<void> _loadAddresses() async {
    final items = await ref.read(packagesApiProvider).listAddresses();
    setState(() {
      _addresses = items;
      _addressId = items.isNotEmpty ? items.first['id'] as String : null;
    });
  }

  Future<void> _ensureAddress() async {
    if (_addressId != null) return;
    final created = await ref.read(packagesApiProvider).createAddress({
      'label': 'Home',
      'line1': '12 Temple Street',
      'city': 'Bengaluru',
      'state': 'Karnataka',
      'postalCode': '560001',
      'country': 'IN',
      'isDefault': true,
    });
    _addressId = created['id'] as String;
  }

  String _fmt(String iso) {
    final dt = DateTime.parse(iso).toLocal();
    return '${dt.day}/${dt.month} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _book(Map<String, dynamic> pkg) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _ensureAddress();
      final result = await ref.read(packagesApiProvider).book(
            slug: widget.slug,
            addressId: _addressId!,
            includeKit: pkg['allowsKit'] == true ? _includeKit : false,
            includePriest:
                pkg['allowsPriest'] == true ? _includePriest : false,
            includePrasad:
                pkg['allowsPrasad'] == true ? _includePrasad : false,
            priestSlotId: _includePriest ? _slotId : null,
            serviceName: _service.text.trim(),
            addonSlugs: _addons.toList(),
          );
      final payment = result['payment'] as Map<String, dynamic>;
      await completePayment(
        api: ref.read(marketplaceApiProvider),
        payment: payment,
      );
      if (!mounted) return;
      context.go('/package-bookings');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.packageBooked)),
      );
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return FutureBuilder(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(child: Text('${snapshot.error}')),
          );
        }
        final pkg = snapshot.data!;
        final kit = pkg['kit'] as Map<String, dynamic>?;
        final prasad = pkg['prasad'] as Map<String, dynamic>?;
        final addons =
            (pkg['addons'] as List).cast<Map<String, dynamic>>();
        final priests =
            (pkg['priests'] as List).cast<Map<String, dynamic>>();
        final slots = <Map<String, dynamic>>[];
        for (final p in priests) {
          for (final s in (p['slots'] as List)) {
            final slot = Map<String, dynamic>.from(s as Map);
            slot['priestName'] = p['fullName'];
            slots.add(slot);
          }
        }

        return Scaffold(
          appBar: AppBar(title: Text(pkg['title'] as String)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(pkg['description'] as String),
              const SizedBox(height: 16),
              if (pkg['allowsKit'] == true)
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    '${l10n.pujaKit}${kit != null ? ' — ${kit['name']}' : ''}',
                  ),
                  subtitle: kit != null
                      ? Text('₹${((kit['priceMinor'] as int) / 100).toStringAsFixed(0)}')
                      : null,
                  value: _includeKit,
                  onChanged: (v) => setState(() => _includeKit = v),
                ),
              if (pkg['allowsPrasad'] == true)
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    'Prasad${prasad != null ? ' — ${prasad['name']}' : ''}',
                  ),
                  subtitle: prasad != null
                      ? Text(
                          '₹${((prasad['priceMinor'] as int) / 100).toStringAsFixed(0)}',
                        )
                      : null,
                  value: _includePrasad,
                  onChanged: (v) => setState(() => _includePrasad = v),
                ),
              if (pkg['allowsPriest'] == true) ...[
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(l10n.priestVisit),
                  value: _includePriest,
                  onChanged: (v) => setState(() => _includePriest = v),
                ),
                if (_includePriest) ...[
                  TextField(
                    controller: _service,
                    decoration: const InputDecoration(labelText: 'Service name'),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Choose slot',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  ...slots.take(12).map((slot) {
                    final id = slot['id'] as String;
                    return RadioListTile<String>(
                      dense: true,
                      value: id,
                      groupValue: _slotId,
                      title: Text(
                        '${slot['priestName']} · ${_fmt(slot['startsAt'] as String)}',
                      ),
                      onChanged: (v) => setState(() => _slotId = v),
                    );
                  }),
                ],
              ],
              const SizedBox(height: 8),
              Text(
                l10n.addOns,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              ...addons.map((a) {
                final slug = a['slug'] as String;
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  value: _addons.contains(slug),
                  title: Text(a['title'] as String),
                  subtitle: Text(
                    '₹${((a['priceMinor'] as int) / 100).toStringAsFixed(0)} · ${a['type']}',
                  ),
                  onChanged: (v) {
                    setState(() {
                      if (v == true) {
                        _addons.add(slug);
                      } else {
                        _addons.remove(slug);
                      }
                    });
                  },
                );
              }),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 16),
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.maroon,
                  minimumSize: const Size.fromHeight(48),
                ),
                onPressed: _loading ? null : () => _book(pkg),
                child: Text(_loading ? l10n.booking : l10n.bookPackagePay),
              ),
            ],
          ),
        );
      },
    );
  }
}
