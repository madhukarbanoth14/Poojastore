import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/packages_api.dart';

class PackageBookingsScreen extends ConsumerStatefulWidget {
  const PackageBookingsScreen({super.key});

  @override
  ConsumerState<PackageBookingsScreen> createState() =>
      _PackageBookingsScreenState();
}

class _PackageBookingsScreenState extends ConsumerState<PackageBookingsScreen> {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _future = ref.read(packagesApiProvider).myBookings();
  }

  Future<void> _cancel(String id) async {
    final l10n = context.l10n;
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.cancelPackageTitle),
        content: Text(l10n.cancelPackageBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.keep),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l10n.cancelPackage),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await ref
          .read(packagesApiProvider)
          .cancelBooking(id, reason: 'Cancelled by customer');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.packageCancelled)),
      );
      setState(_reload);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myPackageBookings)),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('${snapshot.error}'));
          }
          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return Center(child: Text(l10n.noPackageBookings));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final b = items[index];
              final pkg = b['package'] as Map<String, dynamic>;
              final parts = <String>[
                if (b['includeKit'] == true) 'Kit',
                if (b['includePriest'] == true) 'Priest',
                if (b['includePrasad'] == true) 'Prasad',
                ...((b['addonSlugs'] as List?) ?? []).cast<String>(),
              ];
              final status = b['status'] as String;
              final canCancel =
                  status == 'CONFIRMED' || status == 'PENDING_PAYMENT';
              return Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                child: ListTile(
                  title: Text(
                    pkg['title'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                  subtitle: Text(
                    '${b['bookingNumber']} · $status\n'
                    '${parts.join(' + ')} · ₹${((b['totalMinor'] as int) / 100).toStringAsFixed(0)}',
                  ),
                  isThreeLine: true,
                  trailing: canCancel
                      ? TextButton(
                          onPressed: () => _cancel(b['id'] as String),
                          child: Text(l10n.cancel),
                        )
                      : null,
                ),
              );
            },
          );
        },
      ),
    );
  }
}
