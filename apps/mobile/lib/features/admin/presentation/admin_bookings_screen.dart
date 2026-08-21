import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';

class AdminBookingsScreen extends ConsumerStatefulWidget {
  const AdminBookingsScreen({super.key});

  @override
  ConsumerState<AdminBookingsScreen> createState() =>
      _AdminBookingsScreenState();
}

class _AdminBookingsScreenState extends ConsumerState<AdminBookingsScreen> {
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
      final response = await api.dio.get('/admin/bookings');
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

  Future<void> _cancel(String id) async {
    try {
      final api = ref.read(apiClientProvider);
      await api.dio.post(
        '/admin/bookings/$id/cancel',
        data: {'reason': 'Cancelled by admin'},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.bookingCancelled)),
      );
      _load();
    } on DioException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error.response?.data?['message']?.toString() ?? '$error',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.adminBookingsTitle)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final b = _items[index];
                    final priest = b['priest'] as Map<String, dynamic>?;
                    final user = b['user'] as Map<String, dynamic>?;
                    final status = b['status'] as String;
                    final canCancel =
                        status == 'CONFIRMED' || status == 'PENDING_PAYMENT';
                    return Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      child: ListTile(
                        title: Text(
                          '${priest?['fullName'] ?? 'Priest'} · ${b['bookingNumber']}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.maroonDeep,
                          ),
                        ),
                        subtitle: Text(
                          '${user?['phoneE164'] ?? ''} · $status',
                        ),
                        trailing: canCancel
                            ? TextButton(
                                onPressed: () => _cancel(b['id'] as String),
                                child: Text(l10n.cancel),
                              )
                            : null,
                      ),
                    );
                  },
                ),
    );
  }
}
