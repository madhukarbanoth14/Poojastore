import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import 'kits_screen.dart';

class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen> {
  Map<String, dynamic>? _order;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final order =
          await ref.read(marketplaceApiProvider).orderDetail(widget.orderId);
      if (!mounted) return;
      setState(() => _order = order);
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  String _when(Map<String, dynamic> step) {
    final at = step['at'] as String?;
    final eta = step['eta'] as String?;
    if (at != null && at.length >= 16) {
      return at.substring(0, 16).replaceFirst('T', ' ');
    }
    if (eta != null && eta.length >= 16) {
      return 'Est. ${eta.substring(0, 16).replaceFirst('T', ' ')}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final tracking = _order?['tracking'] as Map<String, dynamic>?;
    final steps =
        ((tracking?['steps'] as List?) ?? const []).cast<Map<String, dynamic>>();

    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Track Order'),
      body: _order == null
          ? Center(
              child: _error != null
                  ? Text(_error!)
                  : const CircularProgressIndicator(),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
              children: [
                PsCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _order?['orderNumber'] as String? ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        [
                          tracking?['courierName'] as String? ?? 'Pooja Store Delivery',
                          if (tracking?['trackingNumber'] != null)
                            tracking!['trackingNumber'] as String,
                          if (tracking?['deliverySlot'] != null)
                            tracking!['deliverySlot'] as String,
                        ].join(' · '),
                        style: TextStyle(fontSize: 12.5, color: t.textMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                ...List.generate(steps.length, (i) {
                  final step = steps[i];
                  final done = step['done'] == true;
                  final last = i == steps.length - 1;
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              color: done ? t.saffron : t.border,
                              shape: BoxShape.circle,
                            ),
                          ),
                          if (!last)
                            Container(
                              width: 2,
                              height: 34,
                              color: done ? t.saffron : t.border,
                            ),
                        ],
                      ),
                      const SizedBox(width: 14),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              step['label'] as String? ?? '',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: done ? t.text : t.textMuted,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _when(step),
                              style: TextStyle(fontSize: 12, color: t.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }),
              ],
            ),
    );
  }
}
