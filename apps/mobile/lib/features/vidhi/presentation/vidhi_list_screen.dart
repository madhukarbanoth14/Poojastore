import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../data/vidhi_api.dart';

class VidhiListScreen extends ConsumerStatefulWidget {
  const VidhiListScreen({super.key});

  @override
  ConsumerState<VidhiListScreen> createState() => _VidhiListScreenState();
}

class _VidhiListScreenState extends ConsumerState<VidhiListScreen> {
  Future<List<Map<String, dynamic>>>? _future;
  String? _category;
  String? _loadedLanguage;

  void _reload(String language) {
    _loadedLanguage = language;
    _future = ref.read(vidhiApiProvider).list(
          category: _category,
          language: language,
        );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final language = ref.watch(localeControllerProvider).languageCode;
    if (_loadedLanguage != language) {
      _reload(language);
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Puja Vidhi'),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
            child: Row(
              children: [
                _chip(l10n.categoryAll, null),
                _chip(l10n.categoryOccasion, 'OCCASION'),
                _chip(l10n.categoryFestival, 'FESTIVAL'),
                _chip(l10n.categoryDaily, 'DAILY'),
                _chip(l10n.categoryVrat, 'VRAT'),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder(
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
                  return Center(child: Text(l10n.noVidhis));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return PsCard(
                      onTap: () => context.push('/vidhi/${item['slug']}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 9,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.chipBg,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  '${item['category'] ?? 'VIDHI'}',
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFFA8763B),
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '${item['durationMinutes'] ?? 10} min read',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 9),
                          Text(
                            item['title'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['summary'] as String,
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 12.5,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, String? value) {
    final selected = _category == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: SelectChip(
        label: label,
        selected: selected,
        onTap: () {
          setState(() {
            _category = value;
            _reload(ref.read(localeControllerProvider).languageCode);
          });
        },
      ),
    );
  }
}
