import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../marketplace/presentation/kits_screen.dart';
import '../data/wishlist_controller.dart';

class WishlistScreen extends ConsumerStatefulWidget {
  const WishlistScreen({super.key});

  @override
  ConsumerState<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends ConsumerState<WishlistScreen> {
  List<Map<String, dynamic>> _products = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(marketplaceApiProvider);
    final results = await Future.wait([api.listKits(), api.listSamagri()]);
    final all = [...results[0], ...results[1]];
    if (!mounted) return;
    setState(() => _products = all);
    final seeds = all.where((p) {
      final n = (p['name'] as String? ?? '').toLowerCase();
      return n.contains('ganesh') || n.contains('marigold');
    }).map((p) => p['slug'] as String);
    await ref.read(wishlistControllerProvider.notifier).seedIfEmpty(seeds);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.ps;
    final slugs = ref.watch(wishlistControllerProvider);
    final items = _products
        .where((p) => slugs.contains(p['slug'] as String))
        .toList();

    return Scaffold(
      backgroundColor: t.bg,
      appBar: const PsHeader(title: 'Wishlist'),
      body: items.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: t.chipBg,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'No items saved yet',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 17,
                        color: t.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap the heart on any item to save it here',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13.5, color: t.textMuted),
                    ),
                  ],
                ),
              ),
            )
          : GridView.builder(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: 0.78,
              ),
              itemCount: items.length,
              itemBuilder: (context, i) {
                final item = items[i];
                final slug = item['slug'] as String;
                return PsCard(
                  padding: EdgeInsets.zero,
                  onTap: () => context.push('/kits/$slug'),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          StripeBlock(index: i, height: 100),
                          Positioned(
                            top: 8,
                            right: 8,
                            child: GestureDetector(
                              onTap: () => ref
                                  .read(wishlistControllerProvider.notifier)
                                  .toggle(slug),
                              child: Container(
                                width: 28,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.85),
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  '×',
                                  style: TextStyle(color: t.maroon, fontSize: 14),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.all(11),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['name'] as String,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: t.text,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              formatInr(item['priceMinor'] as int),
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: t.text,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
