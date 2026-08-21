import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import 'kits_screen.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  Map<String, dynamic>? _order;
  String? _error;
  bool _busy = false;

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
      setState(() {
        _order = order;
        _error = null;
      });
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  Future<void> _run(
    Future<Map<String, dynamic>> Function() action,
    String success,
  ) async {
    setState(() => _busy = true);
    try {
      final order = await action();
      if (!mounted) return;
      setState(() => _order = order);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(success)));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final order = _order;
    final tracking = order?['tracking'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Order details'),
      body: order == null
          ? Center(
              child: _error != null
                  ? Text(_error!)
                  : const CircularProgressIndicator(),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
              children: [
                Text(
                  order['orderNumber'] as String,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${order['status']} · ${formatInr(order['totalMinor'] as int)}',
                  style: const TextStyle(color: AppColors.textMuted),
                ),
                const SizedBox(height: 16),
                ...((order['items'] as List?) ?? const [])
                    .cast<Map<String, dynamic>>()
                    .map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: PsCard(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '${item['productName']} × ${item['quantity']}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Text(formatInr(item['totalMinor'] as int)),
                            ],
                          ),
                        ),
                      ),
                    ),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: () => context.push('/tracking/${widget.orderId}'),
                  child: const Text('Track delivery'),
                ),
                const SizedBox(height: 10),
                if (tracking?['canCancel'] == true)
                  OutlinedButton(
                    onPressed: _busy
                        ? null
                        : () => _run(
                              () => ref
                                  .read(marketplaceApiProvider)
                                  .cancelOrder(widget.orderId),
                              'Order cancelled',
                            ),
                    child: const Text('Cancel order'),
                  ),
                if (tracking?['canRefund'] == true) ...[
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: _busy
                        ? null
                        : () => _run(
                              () => ref
                                  .read(marketplaceApiProvider)
                                  .refundOrder(widget.orderId),
                              'Refund started',
                            ),
                    child: const Text('Request refund'),
                  ),
                ],
                if (tracking?['canReturn'] == true) ...[
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: _busy
                        ? null
                        : () => _run(
                              () => ref
                                  .read(marketplaceApiProvider)
                                  .returnOrder(widget.orderId),
                              'Return and refund submitted',
                            ),
                    child: const Text('Return order'),
                  ),
                ],
              ],
            ),
    );
  }
}
