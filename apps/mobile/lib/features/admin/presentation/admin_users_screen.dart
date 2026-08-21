import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _users = [];

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
      final response = await api.dio.get('/admin/users');
      final items =
          (response.data['data']['items'] as List).cast<Map<String, dynamic>>();
      setState(() {
        _users = items;
        _loading = false;
      });
    } on DioException catch (error) {
      setState(() {
        _loading = false;
        _error = error.response?.data?.toString() ?? error.message;
      });
    }
  }

  Future<void> _toggleStatus(Map<String, dynamic> user) async {
    final next = user['status'] == 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    final api = ref.read(apiClientProvider);
    await api.dio.patch('/admin/users/${user['id']}/status', data: {
      'status': next,
    });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.adminUsers)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    itemCount: _users.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final user = _users[index];
                      return ListTile(
                        title: Text(user['fullName']?.toString() ?? 'Unnamed'),
                        subtitle: Text(
                          '${user['phoneE164']} · ${user['role']} · ${user['status']}',
                        ),
                        trailing: TextButton(
                          onPressed: () => _toggleStatus(user),
                          child: Text(
                            user['status'] == 'ACTIVE' ? 'Suspend' : 'Activate',
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
