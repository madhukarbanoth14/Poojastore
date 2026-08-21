import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/guides_api.dart';

class VratDetailScreen extends ConsumerStatefulWidget {
  const VratDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<VratDetailScreen> createState() => _VratDetailScreenState();
}

class _VratDetailScreenState extends ConsumerState<VratDetailScreen> {
  late Future<Map<String, dynamic>> _future;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = ref.read(guidesApiProvider).vratDetail(widget.slug);
  }

  Future<void> _remind() async {
    setState(() => _saving = true);
    try {
      await ref.read(guidesApiProvider).setVratReminder(widget.slug);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reminder saved (1 day before)')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
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
        final v = snapshot.data!;
        final allowed = (v['allowedFoods'] as List).cast<String>();
        final avoid = (v['avoidFoods'] as List).cast<String>();
        final occurrences =
            (v['occurrences'] as List).cast<Map<String, dynamic>>();
        final vidhi = v['relatedVidhiSlug'] as String?;

        return Scaffold(
          appBar: AppBar(title: Text(v['title'] as String)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                v['summary'] as String,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.maroonDeep,
                ),
              ),
              const SizedBox(height: 8),
              Text(v['description'] as String),
              const SizedBox(height: 12),
              Text('${l10n.duration}: ${v['durationHint']}'),
              if (v['associatedPuja'] != null)
                Text('Associated puja: ${v['associatedPuja']}'),
              const SizedBox(height: 16),
              const Text('Allowed', style: TextStyle(fontWeight: FontWeight.w700)),
              Text(allowed.join(', ')),
              const SizedBox(height: 12),
              const Text('Avoid', style: TextStyle(fontWeight: FontWeight.w700)),
              Text(avoid.join(', ')),
              const SizedBox(height: 12),
              const Text(
                'How to break the fast',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              Text(v['breakFastHow'] as String),
              const SizedBox(height: 16),
              Text(
                l10n.upcoming,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              ...occurrences.map(
                (o) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text((o['date'] as String).substring(0, 10)),
                  subtitle: o['note'] != null ? Text(o['note'] as String) : null,
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: AppColors.maroon),
                onPressed: _saving ? null : _remind,
                child: Text(_saving ? l10n.saving : 'Remind me 1 day before'),
              ),
              if (vidhi != null) ...[
                const SizedBox(height: 8),
                OutlinedButton(
                  onPressed: () => context.push('/vidhi/$vidhi'),
                  child: const Text('Open related vidhi'),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
