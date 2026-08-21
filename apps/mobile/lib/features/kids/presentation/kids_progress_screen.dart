import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/kids_api.dart';

class KidsProgressScreen extends ConsumerStatefulWidget {
  const KidsProgressScreen({super.key});

  @override
  ConsumerState<KidsProgressScreen> createState() => _KidsProgressScreenState();
}

class _KidsProgressScreenState extends ConsumerState<KidsProgressScreen> {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(kidsApiProvider).progress();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.kidsProgressTitle)),
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
              child: Text(l10n.kidsProgressEmpty),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = items[index];
              final story = item['story'] as Map<String, dynamic>;
              final score = item['quizScore'];
              final total = item['quizTotal'];
              final passed = item['quizPassed'] == true;
              return Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                child: ListTile(
                  title: Text(
                    story['title'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                  subtitle: Text(
                    [
                      if (item['storyCompletedAt'] != null) 'Story read',
                      if (score != null) 'Quiz $score/$total',
                      if (passed) 'Passed',
                    ].join(' · '),
                  ),
                  trailing: Icon(
                    passed ? Icons.star : Icons.menu_book_outlined,
                    color: AppColors.maroon,
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
