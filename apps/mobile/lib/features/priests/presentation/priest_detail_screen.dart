import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../data/priests_api.dart';

class PriestDetailScreen extends ConsumerStatefulWidget {
  const PriestDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<PriestDetailScreen> createState() => _PriestDetailScreenState();
}

class _PriestDetailScreenState extends ConsumerState<PriestDetailScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(priestsApiProvider).detail(widget.slug);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final l10n = context.l10n;

    return FutureBuilder(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            backgroundColor: AppColors.bg,
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Scaffold(
            backgroundColor: t.bg,
            appBar: const PsHeader(title: 'Priest Profile'),
            body: Center(child: Text('${snapshot.error}')),
          );
        }
        final priest = snapshot.data!;
        final specs = (priest['specializations'] as List).cast<dynamic>();
        final langs = (priest['languages'] as List).join(', ');
        final name = priest['fullName'] as String;
        final rating = (priest['ratingAvg'] as num?) ?? 4.8;
        final reviews = priest['ratingCount'] as int? ?? 120;
        final years = priest['yearsExperience'] as int? ?? 10;

        return Scaffold(
          backgroundColor: AppColors.bg,
          body: Column(
            children: [
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    MaroonGradient(
                      padding: const EdgeInsets.fromLTRB(18, 16, 18, 26),
                      child: SafeArea(
                        bottom: false,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GestureDetector(
                              onTap: () => context.pop(),
                              child: const Text(
                                '←',
                                style: TextStyle(
                                  fontSize: 20,
                                  color: AppColors.goldBright,
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                GoldAvatar(
                                  initials: initialsFrom(name),
                                  size: 64,
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 17,
                                          color: AppColors.cream,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        '${l10n.yearsExp(years)} · $langs',
                                        style: TextStyle(
                                          fontSize: 12.5,
                                          color: AppColors.cream
                                              .withValues(alpha: 0.8),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '★ ${rating.toStringAsFixed(1)} ($reviews reviews)',
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.goldBright,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const PpTitle('Biography', size: 14),
                          const SizedBox(height: 6),
                          Text(
                            priest['bio'] as String? ??
                                'A warm, patient priest popular for festival poojas and first-time home ceremonies.',
                            style: const TextStyle(
                              fontSize: 13,
                              height: 1.6,
                              color: AppColors.body,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const PpTitle('Ritual Expertise', size: 14),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: specs
                                .map(
                                  (e) => Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.chipBg,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      '$e',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.maroonDeep,
                                      ),
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                          const SizedBox(height: 16),
                          const PpTitle('Availability', size: 14),
                          const SizedBox(height: 8),
                          const Text(
                            'Available Mon–Sat, 7 AM – 8 PM. Sundays by prior request only.',
                            style: TextStyle(
                              fontSize: 13,
                              height: 1.5,
                              color: AppColors.body,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const PpTitle('Reviews', size: 14),
                          const SizedBox(height: 8),
                          _review(
                            'Sunitha R.',
                            '5.0',
                            'Very thorough and explained every ritual step clearly.',
                          ),
                          _review(
                            'Vikram P.',
                            '4.8',
                            'On time and conducted the ceremony beautifully.',
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => context.push(
                                    '/priests/${widget.slug}/book?mode=online',
                                  ),
                                  child: const Text('Book Online'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: FilledButton(
                                  onPressed: () => context.push(
                                    '/priests/${widget.slug}/book?mode=home',
                                  ),
                                  child: const Text('Book Home Visit'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _review(String name, String rating, String text) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: AppColors.blush,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: '$name · ',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
                TextSpan(
                  text: '★ $rating',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.gold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12.5,
              height: 1.5,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
