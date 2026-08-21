import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';

class AdminOrdersScreen extends ConsumerStatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  ConsumerState<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends ConsumerState<AdminOrdersScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

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
      final response = await api.dio.get('/admin/orders');
      setState(() {
        _items =
            (response.data['data']['items'] as List).cast<Map<String, dynamic>>();
        _loading = false;
      });
    } on DioException catch (error) {
      setState(() {
        _loading = false;
        _error = error.response?.data?['message']?.toString() ?? '$error';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.adminOrdersTitle)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final o = _items[index];
                    final user = o['user'] as Map<String, dynamic>?;
                    final total = ((o['totalMinor'] as int) / 100).toStringAsFixed(0);
                    return Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      child: ListTile(
                        title: Text(
                          o['orderNumber'] as String,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.maroonDeep,
                          ),
                        ),
                        subtitle: Text(
                          '${user?['phoneE164'] ?? ''} · ${o['status']}\n₹$total · ${o['currency']}',
                        ),
                        isThreeLine: true,
                      ),
                    );
                  },
                ),
    );
  }
}
