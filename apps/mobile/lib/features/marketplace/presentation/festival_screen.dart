import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../l10n/l10n.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/catalog/samagri_catalog.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import 'kits_screen.dart';

class FestivalScreen extends ConsumerStatefulWidget {
  const FestivalScreen({super.key, required this.festivalId});

  final String festivalId;

  @override
  ConsumerState<FestivalScreen> createState() => _FestivalScreenState();
}

class _FestivalScreenState extends ConsumerState<FestivalScreen> {
  /// 0 = Ganesh Pooja items (default), 1 = Homam.
  int _ganeshTab = 0;
  final Set<String> _chosenOptional = {};

  bool get _isGanesh => widget.festivalId == 'ganesh';

  SamagriFestivalList get _ganeshList =>
      _ganeshTab == 0 ? ganeshPoojaList : ganeshHomamList;

  List<String> get _ganeshSelectedKeys => _ganeshList.items
      .where((item) => !item.optional || _chosenOptional.contains(item.slug))
      .map((item) => item.slug)
      .toList();

  int get _ganeshSelectedTotalMinor => _ganeshList.items
      .where((item) => !item.optional || _chosenOptional.contains(item.slug))
      .fold<int>(0, (sum, item) => sum + item.lineTotalMinor);

  @override
  Widget build(BuildContext context) {
    final f = festivalById(widget.festivalId);
    final l10n = context.l10n;
    final te = context.isTelugu;

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
                            festivalDaysToLabel(target: f.target, l10n: l10n),
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.maroon,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          f.localizedName(te),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 23,
                            color: AppColors.cream,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          f.localizedDate(te),
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
                      if (_isGanesh) ...[
                        _GaneshTabs(
                          poojaLabel: l10n.ganeshPoojaItemsTab,
                          homamLabel: l10n.ganeshHomamTab,
                          index: _ganeshTab,
                          onChanged: (i) => setState(() => _ganeshTab = i),
                        ),
                        const SizedBox(height: 16),
                        PpTitle(
                          _ganeshTab == 0
                              ? l10n.ganeshPoojaListTitle
                              : l10n.ganeshHomamListTitle,
                          size: 14.5,
                        ),
                        const SizedBox(height: 10),
                        _PricedSamagriList(
                          items: _ganeshList.items,
                          te: te,
                          optionalLabel: l10n.optionalItem,
                          requiredLabel: l10n.requiredItems,
                          chooseOptionalLabel: l10n.chooseOptionalItems,
                          optionalHint: l10n.optionalItemsHint,
                          chosenOptional: _chosenOptional,
                          onToggleOptional: (slug) {
                            setState(() {
                              if (_chosenOptional.contains(slug)) {
                                _chosenOptional.remove(slug);
                              } else {
                                _chosenOptional.add(slug);
                              }
                            });
                          },
                        ),
                        const SizedBox(height: 20),
                        _KitCard(
                          title: _ganeshList.title(te),
                          priceRupees: _ganeshSelectedTotalMinor / 100,
                          slug: _ganeshList.kitSlug,
                          addLabel: l10n.addToCart,
                          onAdd: () => _addKit(
                            _ganeshList.kitSlug,
                            selectedItemKeys: _ganeshSelectedKeys,
                          ),
                        ),
                        const SizedBox(height: 22),
                      ],
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
                      if (!_isGanesh) ...[
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
                    onPressed: () => _addKit(
                      _isGanesh ? _ganeshList.kitSlug : f.kitSlug,
                      selectedItemKeys: _isGanesh ? _ganeshSelectedKeys : null,
                    ),
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

  Future<void> _addKit(
    String? slug, {
    List<String>? selectedItemKeys,
  }) async {
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
      await ref.read(marketplaceApiProvider).addToCart(
            match['id'] as String,
            selectedItemKeys: selectedItemKeys,
          );
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

class _GaneshTabs extends StatelessWidget {
  const _GaneshTabs({
    required this.poojaLabel,
    required this.homamLabel,
    required this.index,
    required this.onChanged,
  });

  final String poojaLabel;
  final String homamLabel;
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.blush,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _tab(poojaLabel, 0),
          _tab(homamLabel, 1),
        ],
      ),
    );
  }

  Widget _tab(String label, int value) {
    final selected = index == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppColors.maroon : Colors.transparent,
            borderRadius: BorderRadius.circular(11),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: selected ? AppColors.cream : AppColors.maroonDeep,
            ),
          ),
        ),
      ),
    );
  }
}

class _PricedSamagriList extends StatelessWidget {
  const _PricedSamagriList({
    required this.items,
    required this.te,
    required this.optionalLabel,
    required this.requiredLabel,
    required this.chooseOptionalLabel,
    required this.optionalHint,
    required this.chosenOptional,
    required this.onToggleOptional,
  });

  final List<SamagriLine> items;
  final bool te;
  final String optionalLabel;
  final String requiredLabel;
  final String chooseOptionalLabel;
  final String optionalHint;
  final Set<String> chosenOptional;
  final ValueChanged<String> onToggleOptional;

  @override
  Widget build(BuildContext context) {
    final requiredItems = items.where((item) => !item.optional).toList();
    final optionalItems = items.where((item) => item.optional).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          requiredLabel,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.maroonDeep,
          ),
        ),
        const SizedBox(height: 8),
        ...requiredItems.map((item) => _line(item, optional: false)),
        if (optionalItems.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text(
            chooseOptionalLabel,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.maroonDeep,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            optionalHint,
            style: const TextStyle(
              fontSize: 12,
              height: 1.45,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 8),
          ...optionalItems.map((item) => _optionalLine(item)),
        ],
      ],
    );
  }

  Widget _line(SamagriLine item, {required bool optional}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.displayName(te),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
                if (optional)
                  Text(
                    optionalLabel,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
              ],
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
    );
  }

  Widget _optionalLine(SamagriLine item) {
    final selected = chosenOptional.contains(item.slug);
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: CheckboxListTile(
        contentPadding: EdgeInsets.zero,
        dense: true,
        value: selected,
        activeColor: AppColors.maroonDeep,
        onChanged: (_) => onToggleOptional(item.slug),
        title: Text(
          item.displayName(te),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.text,
          ),
        ),
        subtitle: Text(
          optionalLabel,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textMuted,
          ),
        ),
        secondary: Text(
          formatInr(item.lineTotalMinor),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: AppColors.saffron,
          ),
        ),
        controlAffinity: ListTileControlAffinity.leading,
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
