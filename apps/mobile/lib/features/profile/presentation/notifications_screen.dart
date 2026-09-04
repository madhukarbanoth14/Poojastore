import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../core/notifications/push_notifications.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<Map<String, dynamic>> _items = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = ref.read(authControllerProvider);
    if (!auth.isAuthenticated) {
      setState(() {
        _loading = false;
        _items = const [];
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final data = await ref.read(notificationsApiProvider).list();
      if (!mounted) return;
      setState(() {
        _items =
            (data['items'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = '$e';
        _loading = false;
      });
    }
  }

  Future<void> _openNotification(Map<String, dynamic> item) async {
    final id = item['id'] as String?;
    if (id != null) {
      try {
        await ref.read(notificationsApiProvider).markRead(id);
      } catch (_) {}
    }

    final data = item['data'] as Map<String, dynamic>? ?? const {};
    final deepLink = data['deepLink'] as String?;
    if (deepLink != null && deepLink.isNotEmpty && mounted) {
      context.push(deepLink);
    }
    await _load();
  }

  Future<void> _markAllRead() async {
    try {
      await ref.read(notificationsApiProvider).markAllRead();
      await _load();
    } catch (_) {}
  }

  String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    final dt = DateTime.tryParse(iso)?.toLocal();
    if (dt == null) return '';
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      backgroundColor: context.ps.bg,
      appBar: PsHeader(
        title: l10n.notifications,
        actions: [
          if (auth.isAuthenticated && _items.any((n) => n['unread'] == true))
            TextButton(
              onPressed: _markAllRead,
              child: Text(l10n.notificationsMarkAllRead),
            ),
        ],
      ),
      body: !auth.isAuthenticated
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  l10n.notificationsSignIn,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted),
                ),
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!))
                  : _items.isEmpty
                      ? Center(
                          child: Text(
                            l10n.notificationsEmpty,
                            style: const TextStyle(color: AppColors.textMuted),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _load,
                          child: ListView.separated(
                            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                            itemCount: _items.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 10),
                            itemBuilder: (context, i) {
                              final n = _items[i];
                              final unread = n['unread'] == true;
                              return PsCard(
                                onTap: () => _openNotification(n),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 38,
                                      height: 38,
                                      decoration: BoxDecoration(
                                        color: unread
                                            ? AppColors.saffron
                                                .withValues(alpha: 0.18)
                                            : AppColors.chipBg,
                                        borderRadius: BorderRadius.circular(11),
                                      ),
                                      child: Icon(
                                        _iconForType(n['type'] as String?),
                                        size: 18,
                                        color: AppColors.maroon,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            n['title'] as String? ?? '',
                                            style: TextStyle(
                                              fontSize: 13.5,
                                              fontWeight: unread
                                                  ? FontWeight.w700
                                                  : FontWeight.w600,
                                            ),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            n['body'] as String? ?? '',
                                            style: const TextStyle(
                                              fontSize: 12.5,
                                              color: AppColors.textMuted,
                                              height: 1.4,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            _formatTime(
                                              n['createdAt'] as String?,
                                            ),
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
    );
  }

  IconData _iconForType(String? type) {
    switch (type) {
      case 'POOJARI_SAMAGRI_LIST':
        return Icons.list_alt_outlined;
      case 'BOOKING_CONFIRMED':
        return Icons.event_available_outlined;
      case 'ORDER_UPDATE':
        return Icons.local_shipping_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }
}
