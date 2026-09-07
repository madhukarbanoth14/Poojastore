import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../l10n/l10n.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import 'kit_shop.dart';
import 'kits_screen.dart';

class FestivalScreen extends ConsumerStatefulWidget {
  const FestivalScreen({super.key, required this.festivalId});

  final String festivalId;

  @override
  ConsumerState<FestivalScreen> createState() => _FestivalScreenState();
}

class _FestivalScreenState extends ConsumerState<FestivalScreen> {
  bool get _isGanesh => widget.festivalId == 'ganesh';

  @override
  Widget build(BuildContext context) {
    final f = festivalById(widget.festivalId);
    final l10n = context.l10n;
    final te = context.isTelugu;

    if (_isGanesh) {
      return Scaffold(
        backgroundColor: AppColors.bg,
        body: KitShopView(
          initialSlug: 'ganesh-mini-home-puja',
          header: _FestivalHeader(festival: f, te: te, l10n: l10n),
          about: f.localizedDescription(te),
          speciality: f.localizedSpeciality(te),
          steps: f.localizedSteps(te),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _FestivalHeader(festival: f, te: te, l10n: l10n),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                  child: CatalogImage(
                    asset: CatalogImages.festivalAsset(widget.festivalId),
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
                      PpTitle(l10n.about, size: 14.5),
                      const SizedBox(height: 6),
                      Text(
                        f.localizedDescription(te),
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.6,
                          color: AppColors.body,
                        ),
                      ),
                      const SizedBox(height: 18),
                      PpTitle(l10n.speciality, size: 14.5),
                      const SizedBox(height: 6),
                      Text(
                        f.localizedSpeciality(te),
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.6,
                          color: AppColors.body,
                        ),
                      ),
                      const SizedBox(height: 18),
                      PpTitle(l10n.howToDoPooja, size: 14.5),
                      const SizedBox(height: 10),
                      ...f.localizedSteps(te).asMap().entries.map(
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
                      PpTitle(l10n.requiredItems, size: 14.5),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: f
                            .localizedItems(te)
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
                      const SizedBox(height: 20),
                      PpTitle(l10n.completePoojaKit, size: 14.5),
                      const SizedBox(height: 10),
                      _KitCard(
                        title: f.localizedKitName(te),
                        priceRupees: f.kitPrice.toDouble(),
                        slug: f.kitSlug,
                        addLabel: l10n.addToCart,
                        onAdd: () => _addKit(f.kitSlug),
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
                    child: Text(l10n.bookPoojari),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () => _addKit(f.kitSlug),
                    child: Text(l10n.addToCart),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _addKit(String? slug) async {
    final ok = await ensureLoggedIn(
      context,
      ref,
      message: context.l10n.signInToAddCart,
    );
    if (!ok || !mounted) return;
    try {
      final guide = festivalById(widget.festivalId);
      Map<String, dynamic>? match;
      if (slug != null) {
        try {
          match = await ref.read(marketplaceApiProvider).kitDetail(slug);
        } catch (_) {}
      }
      if (match == null) {
        final catalog = [
          ...await ref.read(marketplaceApiProvider).listFestivalKits(),
          ...await ref.read(marketplaceApiProvider).listKits(),
        ];
        if (slug != null) {
          for (final raw in catalog) {
            final k = Map<String, dynamic>.from(raw as Map);
            if (k['slug'] == slug) {
              match = k;
              break;
            }
          }
        } else {
          for (final raw in catalog) {
            final k = Map<String, dynamic>.from(raw as Map);
            final n = (k['name'] as String? ?? '').toLowerCase();
            if (n.contains(widget.festivalId) ||
                n.contains(guide.name.split(' ').first.toLowerCase())) {
              match = k;
              break;
            }
          }
          if (match == null && catalog.isNotEmpty) {
            match = Map<String, dynamic>.from(catalog.first as Map);
          }
        }
      }
      if (match == null) {
        if (!mounted) return;
        if (slug != null) {
          context.push('/kits/$slug');
        } else {
          context.go('/shop');
        }
        return;
      }
      await ref.read(marketplaceApiProvider).addToCart(match['id'] as String);
      if (mounted) context.push('/cart');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyNetworkError(e))),
        );
      }
    }
  }
}

class _FestivalHeader extends StatelessWidget {
  const _FestivalHeader({
    required this.festival,
    required this.te,
    required this.l10n,
  });

  final FestivalGuide festival;
  final bool te;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return MaroonGradient(
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
                festivalDaysToLabel(target: festival.target, l10n: l10n),
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.maroon,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              festival.localizedName(te),
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 23,
                color: AppColors.cream,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              festival.localizedDate(te),
              style: TextStyle(
                fontSize: 13,
                color: AppColors.cream.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KitCard extends StatelessWidget {
  const _KitCard({
    required this.title,
    required this.priceRupees,
    required this.slug,
    required this.addLabel,
    required this.onAdd,
  });

  final String title;
  final double priceRupees;
  final String? slug;
  final String addLabel;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.blush,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CatalogImage(
            asset: CatalogImages.kitAsset(slug: slug, name: title),
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
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${priceRupees.toStringAsFixed(0)}',
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
            onPressed: onAdd,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.saffron,
              minimumSize: const Size(0, 36),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              textStyle: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
              ),
            ),
            child: Text(addLabel),
          ),
        ],
      ),
    );
  }
}
