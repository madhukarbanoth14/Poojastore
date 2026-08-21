import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/vidhi_api.dart';

class VidhiDetailScreen extends ConsumerStatefulWidget {
  const VidhiDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<VidhiDetailScreen> createState() => _VidhiDetailScreenState();
}

class _VidhiDetailScreenState extends ConsumerState<VidhiDetailScreen>
    with SingleTickerProviderStateMixin {
  late Future<Map<String, dynamic>> _future;
  late final TabController _tabs;
  int _stepIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _future = ref.read(vidhiApiProvider).detail(widget.slug);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
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
        final vidhi = snapshot.data!;
        final steps =
            (vidhi['steps'] as List).cast<Map<String, dynamic>>();
        final mantras =
            (vidhi['mantras'] as List).cast<Map<String, dynamic>>();
        final kitSlug = vidhi['relatedProductSlug'] as String?;

        return Scaffold(
          appBar: AppBar(
            title: Text(vidhi['title'] as String),
            bottom: TabBar(
              controller: _tabs,
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Steps'),
                Tab(text: 'Mantras'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabs,
            children: [
              ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    vidhi['summary'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(vidhi['description'] as String),
                  const SizedBox(height: 16),
                  _info(l10n.bestTime, vidhi['bestTimeHint']),
                  _info(
                    l10n.duration,
                    '${vidhi['durationMinutes']} minutes · ${vidhi['difficulty']}',
                  ),
                  if (vidhi['kathaText'] != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      l10n.katha,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    Text(vidhi['kathaText'] as String),
                  ],
                  if (kitSlug != null) ...[
                    const SizedBox(height: 20),
                    FilledButton.icon(
                      onPressed: () => context.push('/kits/$kitSlug'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.maroon,
                      ),
                      icon: const Icon(Icons.inventory_2_outlined),
                      label: Text(l10n.getRelatedKit),
                    ),
                  ],
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      setState(() => _stepIndex = 0);
                      _tabs.animateTo(1);
                    },
                    child: Text(l10n.startSteps(steps.length)),
                  ),
                ],
              ),
              _StepsPager(
                steps: steps,
                index: _stepIndex,
                onChanged: (i) => setState(() => _stepIndex = i),
              ),
              ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: mantras.length,
                separatorBuilder: (_, _) => const Divider(height: 28),
                itemBuilder: (context, index) {
                  final m = mantras[index];
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m['title'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.maroonDeep,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        m['sanskritText'] as String,
                        style: const TextStyle(fontSize: 18, height: 1.4),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        m['transliteration'] as String,
                        style: const TextStyle(fontStyle: FontStyle.italic),
                      ),
                      const SizedBox(height: 6),
                      Text(m['meaning'] as String),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _info(String label, Object? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('$value'),
        ],
      ),
    );
  }
}

class _StepsPager extends StatelessWidget {
  const _StepsPager({
    required this.steps,
    required this.index,
    required this.onChanged,
  });

  final List<Map<String, dynamic>> steps;
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    if (steps.isEmpty) {
      return Center(child: Text(l10n.noSteps));
    }
    final step = steps[index.clamp(0, steps.length - 1)];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Step ${step['stepNumber']} of ${steps.length}',
            style: const TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 8),
          Text(
            step['title'] as String,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 20,
              color: AppColors.maroonDeep,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    step['instruction'] as String,
                    style: const TextStyle(fontSize: 16, height: 1.45),
                  ),
                  if (step['transliteration'] != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      l10n.transliteration,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    Text(step['transliteration'] as String),
                  ],
                  if (step['meaning'] != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      l10n.meaning,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    Text(step['meaning'] as String),
                  ],
                ],
              ),
            ),
          ),
          Row(
            children: [
              OutlinedButton(
                onPressed: index > 0 ? () => onChanged(index - 1) : null,
                child: Text(l10n.previous),
              ),
              const Spacer(),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: AppColors.maroon),
                onPressed: index < steps.length - 1
                    ? () => onChanged(index + 1)
                    : null,
                child: Text(index < steps.length - 1 ? l10n.next : l10n.done),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
