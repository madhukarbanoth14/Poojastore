import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../data/kids_api.dart';

class KidsListScreen extends ConsumerStatefulWidget {
  const KidsListScreen({super.key});

  @override
  ConsumerState<KidsListScreen> createState() => _KidsListScreenState();
}

class _KidsListScreenState extends ConsumerState<KidsListScreen> {
  Future<List<Map<String, dynamic>>>? _future;
  String? _ageBand;
  String? _loadedLanguage;

  void _reload(String language) {
    _loadedLanguage = language;
    _future = ref.read(kidsApiProvider).listStories(
          ageBand: _ageBand,
          language: language,
        );
  }

  String _ageLabel(AppLocalizations l10n, String? band) {
    switch (band) {
      case 'LITTLE':
        return l10n.ageLittle;
      case 'JUNIOR':
        return l10n.ageJunior;
      case 'TEEN':
        return l10n.ageTeen;
      default:
        return band ?? '';
    }
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
      appBar: AppBar(
        title: Text(l10n.kidsTitle),
        actions: [
          IconButton(
            tooltip: l10n.myProgress,
            onPressed: () => context.push('/kids/progress'),
            icon: const Icon(Icons.emoji_events_outlined),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Text(
              'Stories and quizzes for grandparents and kids to enjoy together.',
              style: TextStyle(color: AppColors.textMuted),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                _chip(l10n.categoryAll, null),
                _chip(l10n.ageLittle, 'LITTLE'),
                _chip(l10n.ageJunior, 'JUNIOR'),
                _chip(l10n.ageTeen, 'TEEN'),
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
                  return Center(child: Text(l10n.noStories));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    final pages = (item['_count'] as Map?)?['pages'] ?? 0;
                    final hasQuiz = item['quiz'] != null;
                    return PsCard(
                      onTap: () => context.push('/kids/${item['slug']}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['title'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['festivalName'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.maroon,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            item['summary'] as String,
                            style: const TextStyle(color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            '${_ageLabel(l10n, item['ageBand'] as String?)} · $pages pages${hasQuiz ? ' · quiz' : ''}',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 12.5,
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
    return PsChoiceChip(
      label: label,
      selected: _ageBand == value,
      onSelected: () {
        setState(() {
          _ageBand = value;
          _reload(ref.read(localeControllerProvider).languageCode);
        });
      },
    );
  }
}
