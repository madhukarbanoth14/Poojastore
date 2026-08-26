import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/archana_catalog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../data/priests_api.dart';

class ArchanaPriestsScreen extends ConsumerStatefulWidget {
  const ArchanaPriestsScreen({super.key, required this.deitySlug});

  final String deitySlug;

  @override
  ConsumerState<ArchanaPriestsScreen> createState() =>
      _ArchanaPriestsScreenState();
}

class _ArchanaPriestsScreenState extends ConsumerState<ArchanaPriestsScreen> {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _future = ref
        .read(priestsApiProvider)
        .listArchanaPriests(deity: widget.deitySlug);
  }

  @override
  Widget build(BuildContext context) {
    final deity =
        archanaDeityBySlug(widget.deitySlug) ?? archanaDeities.last;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(title: 'Temple pujaris · ${deity.name}'),
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
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'No temple pujaris are available for ${deity.name} right now. Try “Any deity” or check back soon.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textMuted),
                ),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final priest = items[index];
              final openSlots = priest['_count']?['slots'] as int? ?? 0;
              final temple = priest['templeName'] as String?;
              return PsCard(
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => context.push(
                    '/priests/${priest['slug']}/book'
                    '?mode=online&kind=archana&deity=${widget.deitySlug}',
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          priest['fullName'] as String,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            color: AppColors.text,
                          ),
                        ),
                        if (temple != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            temple,
                            style: const TextStyle(
                              color: AppColors.saffron,
                              fontWeight: FontWeight.w600,
                              fontSize: 12.5,
                            ),
                          ),
                        ],
                        const SizedBox(height: 6),
                        Text(
                          '${priest['city']}, ${priest['state']}\n'
                          '${formatInr(priest['basePriceMinor'] as int)} · '
                          '$openSlots open slots',
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Text(
                            'Schedule video archana →',
                            style: TextStyle(
                              color: context.ps.saffron,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
