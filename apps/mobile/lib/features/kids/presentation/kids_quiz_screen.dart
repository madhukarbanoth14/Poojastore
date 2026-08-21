import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/kids_api.dart';

class KidsQuizScreen extends ConsumerStatefulWidget {
  const KidsQuizScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<KidsQuizScreen> createState() => _KidsQuizScreenState();
}

class _KidsQuizScreenState extends ConsumerState<KidsQuizScreen> {
  late Future<Map<String, dynamic>> _future;
  final Map<String, int> _answers = {};
  bool _submitting = false;
  Map<String, dynamic>? _result;

  @override
  void initState() {
    super.initState();
    _future = ref.read(kidsApiProvider).quiz(widget.slug);
  }

  Future<void> _submit(List<Map<String, dynamic>> questions) async {
    final l10n = context.l10n;
    if (_answers.length < questions.length) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.answerEveryQuestion)),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final payload = _answers.entries
          .map((e) => {'questionId': e.key, 'selectedIndex': e.value})
          .toList();
      final result =
          await ref.read(kidsApiProvider).submitQuiz(widget.slug, payload);
      setState(() => _result = result);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
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
        final quiz = snapshot.data!;
        final questions =
            (quiz['questions'] as List).cast<Map<String, dynamic>>();

        if (_result != null) {
          final passed = _result!['passed'] == true;
          return Scaffold(
            appBar: AppBar(title: Text(l10n.quizResult)),
            body: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    passed ? l10n.quizWellDone : l10n.quizRetry,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: passed ? Colors.green.shade800 : AppColors.maroonDeep,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.quizScore(
                      _result!['score'] as int,
                      _result!['total'] as int,
                      _result!['passScore'] as int,
                    ),
                    style: const TextStyle(fontSize: 18),
                  ),
                  const Spacer(),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.maroon,
                      minimumSize: const Size.fromHeight(48),
                    ),
                    onPressed: () => context.go('/kids'),
                    child: Text(l10n.backToKids),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(title: Text(quiz['title'] as String)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ...questions.map((q) {
                final qid = q['id'] as String;
                final options = (q['options'] as List).cast<String>();
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          q['prompt'] as String,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        ...List.generate(options.length, (i) {
                          return RadioListTile<int>(
                            dense: true,
                            value: i,
                            groupValue: _answers[qid],
                            title: Text(options[i]),
                            onChanged: (v) {
                              if (v == null) return;
                              setState(() => _answers[qid] = v);
                            },
                          );
                        }),
                      ],
                    ),
                  ),
                );
              }),
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.maroon,
                  minimumSize: const Size.fromHeight(48),
                ),
                onPressed: _submitting ? null : () => _submit(questions),
                child: Text(_submitting ? l10n.checking : l10n.submitAnswers),
              ),
            ],
          ),
        );
      },
    );
  }
}
