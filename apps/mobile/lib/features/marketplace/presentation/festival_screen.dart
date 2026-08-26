import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import 'kits_screen.dart';

class FestivalScreen extends ConsumerWidget {
  const FestivalScreen({super.key, required this.festivalId});

  final String festivalId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final f = festivalById(festivalId);

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                MaroonGradient(
                  padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
                  child: SafeArea(
                    bottom: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GestureDetector(
                          onTap: () {
                            if (context.canPop()) {
                              context.pop();
                            } else {
                              context.go('/');
                            }
                          },
                          child: const Text(
                            '←',
                            style: TextStyle(
                              fontSize: 20,
                              color: AppColors.goldBright,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 9,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.goldBright,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            f.daysTo,
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.maroon,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          f.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 23,
                            color: AppColors.cream,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          f.date,
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.cream.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                  child: CatalogImage(
                    asset: CatalogImages.festivalAsset(festivalId),
                    width: double.infinity,
                    height: 150,
                    radius: 16,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const PpTitle('About', size: 14.5),
                      const SizedBox(height: 6),
                      Text(
                        f.description,
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.6,
                          color: AppColors.body,
                        ),
                      ),
                      const SizedBox(height: 18),
                      const PpTitle('Speciality', size: 14.5),
                      const SizedBox(height: 6),
                      Text(
                        f.speciality,
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.6,
                          color: AppColors.body,
                        ),
                      ),
                      const SizedBox(height: 18),
                      const PpTitle('How to do the Pooja', size: 14.5),
                      const SizedBox(height: 10),
                      ...f.steps.asMap().entries.map(
                        (e) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                alignment: Alignment.center,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.chipBg,
                                ),
                                child: Text(
                                  '${e.key + 1}',
                                  style: const TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.maroonDeep,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 1),
                                  child: Text(
                                    e.value,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      height: 1.55,
                                      color: AppColors.body,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const PpTitle('Required Items', size: 14.5),
                      if (f.pricedItems != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Individual prices · kit ${formatInr(f.kitPrice * 100)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                      const SizedBox(height: 10),
                      if (f.pricedItems != null)
                        ...f.pricedItems!.map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Text(
                                    item.displayName(false),
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.text,
                                    ),
                                  ),
                                ),
                                Text(
                                  formatInr(item.lineTotalMinor),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.saffron,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: f.items
                              .map(
                                (item) => Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.chipBg,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    item,
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
                      if (f.pricedItemsTotalMinor != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'If bought separately',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ),
                            Text(
                              formatInr(f.pricedItemsTotalMinor!),
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMuted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 20),
                      const PpTitle('Complete Pooja Kit', size: 14.5),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.blush,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            CatalogImage(
                              asset: CatalogImages.kitAsset(
                                slug: f.kitSlug,
                                name: f.kitName,
                              ),
                              width: 56,
                              height: 56,
                              radius: 14,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    f.kitName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: AppColors.text,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '₹${f.kitPrice}',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.saffron,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            FilledButton(
                              onPressed: () => _addKit(context, ref),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.saffron,
                                minimumSize: const Size(0, 36),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              child: const Text('Add to Cart'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.push('/priests'),
                    child: const Text('Book Poojari'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () => _addKit(context, ref),
                    child: const Text('Add to Cart'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _addKit(BuildContext context, WidgetRef ref) async {
    final ok = await ensureLoggedIn(
      context,
      ref,
      message: 'Sign in to add samagri to your cart',
    );
    if (!ok || !context.mounted) return;
    try {
      final guide = festivalById(festivalId);
      final slug = guide.kitSlug;
      final kits = await ref.read(marketplaceApiProvider).listKits();
      Map<String, dynamic>? match;
      for (final raw in kits) {
        final k = Map<String, dynamic>.from(raw as Map);
        if (slug != null && k['slug'] == slug) {
          match = k;
          break;
        }
      }
      if (match == null) {
        for (final raw in kits) {
          final k = Map<String, dynamic>.from(raw as Map);
          final n = (k['name'] as String? ?? '').toLowerCase();
          if (n.contains(festivalId) ||
              n.contains(guide.name.split(' ').first.toLowerCase())) {
            match = k;
            break;
          }
        }
      }
      if (match == null && kits.isNotEmpty) {
        match = Map<String, dynamic>.from(kits.first as Map);
      }
      if (match == null) {
        if (!context.mounted) return;
        if (slug != null) {
          context.push('/kits/$slug');
        } else {
          context.go('/shop');
        }
        return;
      }
      await ref.read(marketplaceApiProvider).addToCart(match['id'] as String);
      if (context.mounted) context.push('/cart');
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyNetworkError(e))),
        );
      }
    }
  }
}
