import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/guides_api.dart';

class GuidesHubScreen extends ConsumerStatefulWidget {
  const GuidesHubScreen({super.key});

  @override
  ConsumerState<GuidesHubScreen> createState() => _GuidesHubScreenState();
}

class _GuidesHubScreenState extends ConsumerState<GuidesHubScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  late Future<List<Map<String, dynamic>>> _vrats;
  late Future<List<Map<String, dynamic>>> _upcoming;
  late Future<List<Map<String, dynamic>>> _prasad;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    final api = ref.read(guidesApiProvider);
    _vrats = api.listVrats();
    _upcoming = api.upcomingVrats();
    _prasad = api.listPrasad();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Prasad & Vrat'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'Vrat'),
            Tab(text: 'Prasad'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _VratTab(vrats: _vrats, upcoming: _upcoming),
          _PrasadTab(prasad: _prasad),
        ],
      ),
    );
  }
}

class _VratTab extends StatelessWidget {
  const _VratTab({required this.vrats, required this.upcoming});

  final Future<List<Map<String, dynamic>>> vrats;
  final Future<List<Map<String, dynamic>>> upcoming;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return FutureBuilder(
      future: Future.wait([vrats, upcoming]),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('${snapshot.error}'));
        }
        final lists = snapshot.data!;
        final upcomingItems = lists[1];
        final vratItems = lists[0];
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              l10n.upcoming,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 10),
            if (upcomingItems.isEmpty)
              Text(l10n.noUpcoming)
            else
              ...upcomingItems.take(1).map((o) {
                final v = o['vrat'] as Map<String, dynamic>;
                final date = (o['date'] as String).substring(0, 10);
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.maroonDeep, AppColors.maroon],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'UPCOMING',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: AppColors.goldBright,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        v['title'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16.5,
                          color: AppColors.cream,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        date,
                        style: TextStyle(
                          fontSize: 12.5,
                          color: AppColors.cream.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            const SizedBox(height: 18),
            Text(
              l10n.allVrats,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: AppColors.text,
              ),
            ),
            const SizedBox(height: 10),
            ...vratItems.map((v) {
              return GestureDetector(
                onTap: () => context.push('/guides/vrats/${v['slug']}'),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.fromLTRB(15, 13, 15, 13),
                  decoration: BoxDecoration(
                    color: AppColors.blush,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              v['title'] as String,
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.text,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              v['summary'] as String,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}

class _PrasadTab extends StatelessWidget {
  const _PrasadTab({required this.prasad});

  final Future<List<Map<String, dynamic>>> prasad;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: prasad,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('${snapshot.error}'));
        }
        final items = snapshot.data ?? [];
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final p = items[index];
            return Container(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
              decoration: BoxDecoration(
                color: AppColors.blush,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                        bottomLeft: Radius.circular(28),
                        bottomRight: Radius.circular(28),
                      ),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [AppColors.chipBg, Color(0xFFD9AE55)],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p['title'] as String,
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.text,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          p['summary'] as String,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          p['festivalName'] as String,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.text,
                          ),
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => context.push('/guides/prasad/${p['slug']}'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.saffron,
                      side: const BorderSide(color: AppColors.saffron, width: 1.5),
                      minimumSize: const Size(0, 32),
                      padding: const EdgeInsets.symmetric(horizontal: 13),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    child: const Text('Add'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
