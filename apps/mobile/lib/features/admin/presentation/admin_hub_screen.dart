import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';

class AdminHubScreen extends ConsumerStatefulWidget {
  const AdminHubScreen({super.key});

  @override
  ConsumerState<AdminHubScreen> createState() => _AdminHubScreenState();
}

class _AdminHubScreenState extends ConsumerState<AdminHubScreen> {
  Map<String, dynamic>? _summary;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.dio.get('/admin/ops/summary');
      setState(() {
        _summary = response.data['data'] as Map<String, dynamic>;
        _loading = false;
      });
    } on DioException catch (error) {
      setState(() {
        _loading = false;
        _error = error.response?.data?['message']?.toString() ?? '$error';
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = '$e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final summary = _summary;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.adminOps),
        actions: [
          IconButton(
            tooltip: l10n.refresh,
            onPressed: _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(
                      'Live counters',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppColors.maroonDeep,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 12),
                    if (summary != null) ...[
                      _stat(
                        'Active users',
                        '${summary['usersActive']}',
                      ),
                      _stat(
                        'Orders paid',
                        '${(summary['orders'] as Map)['paid']}',
                      ),
                      _stat(
                        'Orders pending pay',
                        '${(summary['orders'] as Map)['pendingPayment']}',
                      ),
                      _stat(
                        'Priest confirmed',
                        '${(summary['priestBookings'] as Map)['confirmed']}',
                      ),
                      _stat(
                        'Packages confirmed',
                        '${(summary['packageBookings'] as Map)['confirmed']}',
                      ),
                    ],
                    const SizedBox(height: 24),
                    ListTile(
                      tileColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      leading: const Icon(Icons.people_outline),
                      title: Text(l10n.adminUsers),
                      subtitle: Text(l10n.adminUsersSubtitle),
                      onTap: () => context.push('/admin/users'),
                    ),
                    const SizedBox(height: 10),
                    ListTile(
                      tileColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      leading: const Icon(Icons.receipt_long_outlined),
                      title: Text(l10n.adminOrders),
                      subtitle: Text(l10n.adminOrdersSubtitle),
                      onTap: () => context.push('/admin/orders'),
                    ),
                    const SizedBox(height: 10),
                    ListTile(
                      tileColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      leading: const Icon(Icons.event_available_outlined),
                      title: Text(l10n.adminBookings),
                      subtitle: Text(l10n.adminBookingsSubtitle),
                      onTap: () => context.push('/admin/bookings'),
                    ),
                  ],
                ),
    );
  }

  Widget _stat(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
