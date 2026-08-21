import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/kids_api.dart';

class KidsStoryScreen extends ConsumerStatefulWidget {
  const KidsStoryScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<KidsStoryScreen> createState() => _KidsStoryScreenState();
}

class _KidsStoryScreenState extends ConsumerState<KidsStoryScreen> {
  late Future<Map<String, dynamic>> _future;
  int _pageIndex = 0;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _future = ref.read(kidsApiProvider).story(widget.slug);
  }

  Future<void> _finish(Map<String, dynamic> story) async {
    final l10n = context.l10n;
    setState(() => _saving = true);
    try {
      await ref.read(kidsApiProvider).completeStory(widget.slug);
      if (!mounted) return;
      final hasQuiz = story['quiz'] != null;
      if (hasQuiz) {
        context.push('/kids/${widget.slug}/quiz');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.storyCompleted)),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e')),
        );
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
        final story = snapshot.data!;
        final pages =
            (story['pages'] as List).cast<Map<String, dynamic>>();
        final page = pages[_pageIndex.clamp(0, pages.length - 1)];

        return Scaffold(
          appBar: AppBar(title: Text(story['title'] as String)),
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Page ${_pageIndex + 1} of ${pages.length}',
                  style: const TextStyle(color: Colors.black54),
                ),
                const SizedBox(height: 8),
                if (page['title'] != null)
                  Text(
                    page['title'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 22,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                const SizedBox(height: 12),
                Expanded(
                  child: SingleChildScrollView(
                    child: Text(
                      page['body'] as String,
                      style: const TextStyle(fontSize: 18, height: 1.5),
                    ),
                  ),
                ),
                if (_pageIndex == 0) ...[
                  const SizedBox(height: 8),
                  Text(
                    '${l10n.whyCelebrated}: ${story['whyCelebrated']}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  if (story['importance'] != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '${l10n.importance}: ${story['importance']}',
                      style: const TextStyle(color: Colors.black87),
                    ),
                  ],
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    OutlinedButton(
                      onPressed: _pageIndex > 0
                          ? () => setState(() => _pageIndex -= 1)
                          : null,
                      child: Text(l10n.back),
                    ),
                    const Spacer(),
                    FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.maroon,
                      ),
                      onPressed: _saving
                          ? null
                          : () {
                              if (_pageIndex < pages.length - 1) {
                                setState(() => _pageIndex += 1);
                              } else {
                                _finish(story);
                              }
                            },
                      child: Text(
                        _pageIndex < pages.length - 1
                            ? l10n.next
                            : (story['quiz'] != null
                                ? l10n.takeQuiz
                                : l10n.markComplete),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
