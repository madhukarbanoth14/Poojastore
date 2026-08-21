import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../l10n/l10n.dart';
import '../data/guides_api.dart';

class PrasadDetailScreen extends ConsumerStatefulWidget {
  const PrasadDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<PrasadDetailScreen> createState() => _PrasadDetailScreenState();
}

class _PrasadDetailScreenState extends ConsumerState<PrasadDetailScreen> {
  late Future<Map<String, dynamic>> _future;
  bool _adding = false;

  @override
  void initState() {
    super.initState();
    _future = ref.read(guidesApiProvider).prasadDetail(widget.slug);
  }

  Future<void> _order(Map<String, dynamic> product) async {
    setState(() => _adding = true);
    try {
      await ref
          .read(guidesApiProvider)
          .addPrasadToCart(product['id'] as String);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.addedToCart)),
      );
      context.push('/cart');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    } finally {
      if (mounted) setState(() => _adding = false);
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
        final r = snapshot.data!;
        final ingredients = (r['ingredients'] as List).cast<String>();
        final steps = (r['steps'] as List).cast<Map<String, dynamic>>();
        final product = r['product'] as Map<String, dynamic>?;

        return Scaffold(
          appBar: AppBar(title: Text(r['title'] as String)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(
                r['festivalName'] as String,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.maroon,
                ),
              ),
              const SizedBox(height: 6),
              Text(r['summary'] as String),
              const SizedBox(height: 8),
              Text(r['description'] as String),
              const SizedBox(height: 8),
              Text(
                l10n.minServings(
                  r['prepMinutes'] as int,
                  r['servings'] as int,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Ingredients',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              ...ingredients.map((i) => Text('• $i')),
              const SizedBox(height: 16),
              const Text('Steps', style: TextStyle(fontWeight: FontWeight.w700)),
              ...steps.map(
                (s) => Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${s['stepNumber']}. ${s['title'] ?? 'Step'}',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(s['instruction'] as String),
                    ],
                  ),
                ),
              ),
              if (product != null) ...[
                const SizedBox(height: 24),
                FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.maroon,
                    minimumSize: const Size.fromHeight(48),
                  ),
                  onPressed: _adding ? null : () => _order(product),
                  icon: const Icon(Icons.shopping_bag_outlined),
                  label: Text(
                    _adding
                        ? 'Adding…'
                        : 'Order ready prasad · ₹${((product['priceMinor'] as int) / 100).toStringAsFixed(0)}',
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
