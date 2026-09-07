import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/kit_item_taxonomy.dart';
import '../../../core/catalog/samagri_catalog.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../l10n/l10n.dart';
import 'kits_screen.dart';

class KitShopView extends ConsumerStatefulWidget {
  const KitShopView({
    super.key,
    required this.initialSlug,
    this.header,
    this.about,
    this.speciality,
    this.steps = const [],
  });

  final String initialSlug;
  final Widget? header;
  final String? about;
  final String? speciality;
  final List<String> steps;

  @override
  ConsumerState<KitShopView> createState() => _KitShopViewState();
}

class _KitShopViewState extends ConsumerState<KitShopView> {
  late GaneshKitSize _size;
  late GaneshKitPlace _place;
  final Set<String> _chosenOptional = {};
  KitItemCategoryId? _category;
  final _scrollController = ScrollController();
  final _itemsKey = GlobalKey();
  final Map<String, Map<String, dynamic>> _products = {};
  bool _adding = false;

  @override
  void initState() {
    super.initState();
    _applySlug(widget.initialSlug);
    _loadProducts();
  }

  @override
  void didUpdateWidget(covariant KitShopView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialSlug != widget.initialSlug) {
      _applySlug(widget.initialSlug);
      _chosenOptional.clear();
      _category = null;
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _applySlug(String slug) {
    final parsed = parseGaneshKitSlug(slug);
    _size = parsed?.size ?? GaneshKitSize.mini;
    _place = parsed?.place ?? GaneshKitPlace.home;
  }

  Future<void> _loadProducts() async {
    final api = ref.read(marketplaceApiProvider);
    final loaded = await Future.wait(
      ganeshEcoKitLists.map((list) async {
        try {
          return MapEntry(list.kitSlug, await api.kitDetail(list.kitSlug));
        } catch (_) {
          return MapEntry(list.kitSlug, <String, dynamic>{});
        }
      }),
    );
    if (!mounted) return;
    setState(() {
      for (final entry in loaded) {
        if (entry.value.isNotEmpty) _products[entry.key] = entry.value;
      }
    });
  }

  SamagriFestivalList get _list {
    final slug = ganeshKitSlug(_size, _place);
    return samagriListByKitSlug(slug) ?? ganeshMiniHomeList;
  }

  List<SamagriLine> get _items => withOptionalOfferings(_list.items);

  Map<String, dynamic>? get _product => _products[_list.kitSlug];

  int get _priceMinor => (_product?['priceMinor'] as int?) ?? _list.kitPriceMinor;

  int? get _mrpMinor => mrpIfHigher(
        (_product?['mrpMinor'] as int?) ?? _list.kitMrpMinor,
        _priceMinor,
      );

  List<String> get _selectedKeys => _items
      .where((item) => !item.optional || _chosenOptional.contains(item.slug))
      .map((item) => item.slug)
      .toList();

  int get _includedCount => _items.where((item) => !item.optional).length;

  List<SamagriLine> get _optionalItems =>
      _items.where((item) => item.optional).toList();

  List<SamagriLine> get _visibleItems {
    final included = _items.where((item) => !item.optional).toList();
    final category = _category;
    if (category == null) return included;
    return included
        .where((item) => kitItemCategory(item.slug) == category)
        .toList();
  }

  List<KitItemCategoryId> get _availableCategories {
    final present = _items
        .where((item) => !item.optional)
        .map((item) => kitItemCategory(item.slug))
        .toSet();
    return kitCategoryOrder.where(present.contains).toList();
  }

  void _selectVariant(GaneshKitSize size, GaneshKitPlace place) {
    setState(() {
      _size = size;
      _place = place;
      _chosenOptional.clear();
      _category = null;
    });
  }

  void _scrollToItems() {
    final ctx = _itemsKey.currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(
      ctx,
      duration: const Duration(milliseconds: 380),
      curve: Curves.easeOut,
      alignment: 0.08,
    );
  }

  Future<void> _addKit() async {
    final ok = await ensureLoggedIn(
      context,
      ref,
      message: context.l10n.signInToAddCart,
    );
    if (!ok || !mounted) return;
    setState(() => _adding = true);
    try {
      var match = _product;
      if (match == null || match['id'] == null) {
        try {
          match = await ref.read(marketplaceApiProvider).kitDetail(_list.kitSlug);
          if (match.isNotEmpty) _products[_list.kitSlug] = match;
        } catch (_) {}
      }
      final id = match?['id'] as String?;
      if (id == null) {
        if (mounted) context.push('/kits/${_list.kitSlug}');
        return;
      }
      await ref.read(marketplaceApiProvider).addToCart(
            id,
            selectedItemKeys:
                _chosenOptional.isEmpty ? null : _selectedKeys,
            replace: true,
          );
      if (mounted) context.push('/checkout');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyNetworkError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final te = context.isTelugu;
    final l10n = context.l10n;
    final list = _list;

    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: _scrollController,
            padding: EdgeInsets.zero,
            children: [
              if (widget.header != null) widget.header!,
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _VariantSelector(
                      te: te,
                      size: _size,
                      place: _place,
                      onSelect: _selectVariant,
                    ),
                    const SizedBox(height: 16),
                    _Hero(
                      te: te,
                      slug: list.kitSlug,
                      title: list.title(te),
                      includedCount: _includedCount,
                      size: _size,
                      place: _place,
                      priceMinor: _priceMinor,
                      mrpMinor: _mrpMinor,
                      adding: _adding,
                      addLabel: te ? 'ఇప్పుడే కొనండి' : 'Buy Now',
                      viewLabel: te ? 'అన్ని వస్తువులు' : 'View All Items',
                      onAdd: _adding ? null : _addKit,
                      onViewItems: _scrollToItems,
                    ),
                    const SizedBox(height: 28),
                    KeyedSubtree(
                      key: _itemsKey,
                      child: _ItemsSection(
                        te: te,
                        items: _visibleItems,
                        optionalItems: _optionalItems,
                        includedCount: _includedCount,
                        categories: _availableCategories,
                        category: _category,
                        chosenOptional: _chosenOptional,
                        onCategory: (id) => setState(() => _category = id),
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
                    ),
                    if (widget.about != null || widget.speciality != null) ...[
                      const SizedBox(height: 28),
                      if (widget.about != null) ...[
                        PpTitle(l10n.about, size: 18),
                        const SizedBox(height: 8),
                        Text(
                          widget.about!,
                          style: const TextStyle(
                            fontSize: 13.5,
                            height: 1.6,
                            color: AppColors.body,
                          ),
                        ),
                        const SizedBox(height: 18),
                      ],
                      if (widget.speciality != null) ...[
                        PpTitle(l10n.speciality, size: 18),
                        const SizedBox(height: 8),
                        Text(
                          widget.speciality!,
                          style: const TextStyle(
                            fontSize: 13.5,
                            height: 1.6,
                            color: AppColors.body,
                          ),
                        ),
                      ],
                    ],
                    if (widget.steps.isNotEmpty) ...[
                      const SizedBox(height: 22),
                      PpTitle(te ? 'పూజా విధి' : 'Pooja process', size: 18),
                      const SizedBox(height: 12),
                      ...widget.steps.asMap().entries.map(
                            (e) => Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    alignment: Alignment.center,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: AppColors.maroon,
                                    ),
                                    child: Text(
                                      '${e.key + 1}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.cream,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        e.value,
                                        style: const TextStyle(
                                          fontSize: 13.5,
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
                    ],
                    const SizedBox(height: 22),
                    _PriestBanner(
                      te: te,
                      onBook: () => context.push('/priests'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        _StickyBar(
          te: te,
          includedCount: _includedCount,
          priceMinor: _priceMinor,
          mrpMinor: _mrpMinor,
          adding: _adding,
          onAdd: _adding ? null : _addKit,
        ),
      ],
    );
  }
}

class _VariantSelector extends StatelessWidget {
  const _VariantSelector({
    required this.te,
    required this.size,
    required this.place,
    required this.onSelect,
  });

  final bool te;
  final GaneshKitSize size;
  final GaneshKitPlace place;
  final void Function(GaneshKitSize, GaneshKitPlace) onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: AppColors.chipBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Row(
            children: [
              for (final option in GaneshKitSize.values)
                Expanded(
                  child: GestureDetector(
                    onTap: () => onSelect(option, place),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(
                        color: size == option ? AppColors.maroon : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        ganeshSizeLabel(option, te),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: size == option ? AppColors.cream : AppColors.maroon,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            for (var i = 0; i < GaneshKitPlace.values.length; i++) ...[
              if (i > 0) const SizedBox(width: 8),
              Expanded(
                child: _PlaceCard(
                  te: te,
                  size: size,
                  place: GaneshKitPlace.values[i],
                  active: place == GaneshKitPlace.values[i],
                  onTap: () => onSelect(size, GaneshKitPlace.values[i]),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _PlaceCard extends StatelessWidget {
  const _PlaceCard({
    required this.te,
    required this.size,
    required this.place,
    required this.active,
    required this.onTap,
  });

  final bool te;
  final GaneshKitSize size;
  final GaneshKitPlace place;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
        decoration: BoxDecoration(
          color: active ? Colors.white : AppColors.chipBg.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: active ? AppColors.gold : AppColors.divider,
          ),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: AppColors.maroon.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              ganeshPlaceTitle(place, te).toUpperCase(),
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${ganeshSizeLabel(size, te)} ${ganeshPlaceTitle(place, te)}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                height: 1.2,
                color: AppColors.maroon,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              ganeshPlaceSubtitle(place, te),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10.5,
                height: 1.3,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({
    required this.te,
    required this.slug,
    required this.title,
    required this.includedCount,
    required this.size,
    required this.place,
    required this.priceMinor,
    required this.mrpMinor,
    required this.adding,
    required this.addLabel,
    required this.viewLabel,
    required this.onAdd,
    required this.onViewItems,
  });

  final bool te;
  final String slug;
  final String title;
  final int includedCount;
  final GaneshKitSize size;
  final GaneshKitPlace place;
  final int priceMinor;
  final int? mrpMinor;
  final bool adding;
  final String addLabel;
  final String viewLabel;
  final VoidCallback? onAdd;
  final VoidCallback onViewItems;

  @override
  Widget build(BuildContext context) {
    final checks = [
      te ? 'పూర్తి పూజా మూలాలు' : 'Complete Puja Essentials',
      te ? 'సరైన కొలతలు' : 'Carefully Measured Quantities',
      te ? 'పర్యావరణ అనుకూల ఎంపికలు' : 'Eco-Friendly Options',
      te ? 'వాడటానికి సిద్ధం' : 'Ready-to-Use Kit',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.gold, width: 1.4),
          ),
          child: CatalogImage(
            asset: CatalogImages.kitAsset(slug: slug, name: title),
            width: double.infinity,
            height: 220,
            radius: 18,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          te ? 'గణేశ చతుర్థి పూజా కిట్' : 'GANESH CHATURTHI POOJA KIT',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.6,
            color: AppColors.maroon,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          te
              ? 'మీ గణేశ చతుర్థి పూజకు కావాల్సినవన్నీ'
              : 'Everything You Need for Your Ganesh Chaturthi Puja',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            height: 1.2,
            color: AppColors.maroon,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          te
              ? 'పూర్తి పూజా సామగ్రి — సరైన కొలతలతో, సాంప్రదాయ పూజకు సిద్ధంగా ప్యాక్ చేయబడింది.'
              : 'Complete puja samagri, thoughtfully measured and packed for a simple and traditional celebration.',
          style: const TextStyle(
            fontSize: 13.5,
            height: 1.55,
            color: AppColors.body,
          ),
        ),
        const SizedBox(height: 14),
        ...checks.map(
          (text) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  width: 18,
                  height: 18,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.maroon,
                  ),
                  child: const Text(
                    '✓',
                    style: TextStyle(fontSize: 10, color: AppColors.cream),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    text,
                    style: const TextStyle(fontSize: 13.5, color: AppColors.body),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        Row(
          children: [
            Text(
              te ? '$includedCount వస్తువులు' : '$includedCount Items Included',
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: AppColors.maroon,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              '${ganeshSizeLabel(size, te)} ${ganeshPlaceTitle(place, te)}',
              style: const TextStyle(fontSize: 13.5, color: AppColors.textMuted),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _PriceLine(priceMinor: priceMinor, mrpMinor: mrpMinor, large: true),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: onAdd,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.orange,
              minimumSize: const Size.fromHeight(48),
            ),
            child: Text(adding ? context.l10n.processing : addLabel),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: onViewItems,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.maroon,
              side: const BorderSide(color: AppColors.gold),
              minimumSize: const Size.fromHeight(46),
            ),
            child: Text(viewLabel),
          ),
        ),
      ],
    );
  }
}

class _ItemsSection extends StatelessWidget {
  const _ItemsSection({
    required this.te,
    required this.items,
    required this.optionalItems,
    required this.includedCount,
    required this.categories,
    required this.category,
    required this.chosenOptional,
    required this.onCategory,
    required this.onToggleOptional,
  });

  final bool te;
  final List<SamagriLine> items;
  final List<SamagriLine> optionalItems;
  final int includedCount;
  final List<KitItemCategoryId> categories;
  final KitItemCategoryId? category;
  final Set<String> chosenOptional;
  final ValueChanged<KitItemCategoryId?> onCategory;
  final ValueChanged<String> onToggleOptional;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PpTitle(te ? 'కిట్‌లో ఏముంది' : "What's Inside Your Kit", size: 20),
        const SizedBox(height: 4),
        Text(
          te
              ? '$includedCount వస్తువులు మీ పూజకు ఎంచుకోబడ్డాయి'
              : '$includedCount carefully selected items for this pooja',
          style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
        if (categories.length > 1) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 38,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _Chip(
                  label: te ? 'అన్నీ' : 'All',
                  active: category == null,
                  onTap: () => onCategory(null),
                ),
                for (final id in categories)
                  _Chip(
                    label: kitCategoryLabel(id, te),
                    active: category == id,
                    onTap: () => onCategory(id),
                  ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 14),
        _ItemGrid(
          te: te,
          items: items,
          chosenOptional: chosenOptional,
          onToggleOptional: onToggleOptional,
        ),
        if (optionalItems.isNotEmpty) ...[
          const SizedBox(height: 28),
          PpTitle(te ? 'ఐచ్ఛిక వస్తువులు' : 'Optional extras', size: 20),
          const SizedBox(height: 4),
          Text(
            te
                ? 'ఇవి కిట్‌లో ఉండవు — కావాలంటే టిక్ చేయండి.'
                : 'Not packed unless you select them.',
            style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
          ),
          const SizedBox(height: 14),
          _ItemGrid(
            te: te,
            items: optionalItems,
            chosenOptional: chosenOptional,
            onToggleOptional: onToggleOptional,
          ),
        ],
      ],
    );
  }
}

class _ItemGrid extends StatelessWidget {
  const _ItemGrid({
    required this.te,
    required this.items,
    required this.chosenOptional,
    required this.onToggleOptional,
  });

  final bool te;
  final List<SamagriLine> items;
  final Set<String> chosenOptional;
  final ValueChanged<String> onToggleOptional;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < items.length; i += 2)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _ItemCard(
                    te: te,
                    item: items[i],
                    selected: !items[i].optional ||
                        chosenOptional.contains(items[i].slug),
                    onToggle: items[i].optional
                        ? () => onToggleOptional(items[i].slug)
                        : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: i + 1 < items.length
                      ? _ItemCard(
                          te: te,
                          item: items[i + 1],
                          selected: !items[i + 1].optional ||
                              chosenOptional.contains(items[i + 1].slug),
                          onToggle: items[i + 1].optional
                              ? () => onToggleOptional(items[i + 1].slug)
                              : null,
                        )
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: active ? AppColors.maroon : AppColors.chipBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: active ? AppColors.maroon : AppColors.divider,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: active ? AppColors.cream : AppColors.maroon,
            ),
          ),
        ),
      ),
    );
  }
}

class _ItemCard extends StatelessWidget {
  const _ItemCard({
    required this.te,
    required this.item,
    required this.selected,
    this.onToggle,
  });

  final bool te;
  final SamagriLine item;
  final bool selected;
  final VoidCallback? onToggle;

  @override
  Widget build(BuildContext context) {
    final qty = formatKitQty(item.packLabel(te), item.quantity, te);
    final role = kitItemRole(item.slug);
    final roleLabel = item.optional
        ? (te ? 'ఐచ్ఛికం' : 'Optional')
        : role == KitItemRole.essential
            ? (te ? 'అవసరం' : 'Essential')
            : (te ? 'వినియోగం' : 'Consumable');

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showQuickView(context),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Container(
                    height: 110,
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFF8EF),
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(15),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(15),
                      ),
                      child: CatalogImage(
                        asset: CatalogImages.samagriAsset(item.slug),
                        width: double.infinity,
                        height: 110,
                        radius: 0,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  if (onToggle != null)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: GestureDetector(
                        onTap: onToggle,
                        child: Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: selected ? AppColors.maroon : Colors.white,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.maroon),
                          ),
                          child: selected
                              ? const Icon(
                                  Icons.check,
                                  size: 14,
                                  color: AppColors.cream,
                                )
                              : null,
                        ),
                      ),
                    ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.shortName(te),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        height: 1.25,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      qty,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      roleLabel,
                      style: const TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.2,
                        color: AppColors.maroonDeep,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showQuickView(BuildContext context) {
    final qty = formatKitQty(item.packLabel(te), item.quantity, te);
    final category = kitCategoryLabel(kitItemCategory(item.slug), te);
    final role = kitItemRole(item.slug);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.bg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      item.shortName(te),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.maroon,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(te ? 'మూసివేయి' : 'Close'),
                  ),
                ],
              ),
              Center(
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF8EF),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: CatalogImage(
                    asset: CatalogImages.samagriAsset(item.slug),
                    width: 180,
                    height: 180,
                    radius: 18,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                qty,
                style: const TextStyle(fontSize: 13.5, color: AppColors.textMuted),
              ),
              const SizedBox(height: 4),
              Text(
                category.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                  color: AppColors.maroon,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                role == KitItemRole.essential
                    ? (te
                        ? 'ఈ వస్తువు పూజా అమరికకు అవసరం. కిట్‌లో చేర్చబడింది.'
                        : 'An essential setup item included in this kit.')
                    : (te
                        ? 'పూజలో వాడే వినియోగ వస్తువు. కిట్‌లో కొలతతో చేర్చబడింది.'
                        : 'A measured consumable included for this puja.'),
                style: const TextStyle(
                  fontSize: 13.5,
                  height: 1.55,
                  color: AppColors.body,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PriestBanner extends StatelessWidget {
  const _PriestBanner({required this.te, required this.onBook});

  final bool te;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            te ? 'పూజారి' : 'NEED A PRIEST?',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.4,
              color: AppColors.maroon,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            te ? 'ఈ పూజకు పూజారిని బుక్ చేయండి' : 'Book a poojari for this pooja',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.maroon,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: onBook,
            child: Text(te ? 'పూజారిని బుక్ చేయండి' : 'Book priest'),
          ),
        ],
      ),
    );
  }
}

class _StickyBar extends StatelessWidget {
  const _StickyBar({
    required this.te,
    required this.includedCount,
    required this.priceMinor,
    required this.mrpMinor,
    required this.adding,
    required this.onAdd,
  });

  final bool te;
  final int includedCount;
  final int priceMinor;
  final int? mrpMinor;
  final bool adding;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.bg,
      elevation: 8,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      te ? '$includedCount వస్తువులు' : '$includedCount Items',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.maroon,
                      ),
                    ),
                    _PriceLine(priceMinor: priceMinor, mrpMinor: mrpMinor),
                  ],
                ),
              ),
              FilledButton(
                onPressed: onAdd,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  minimumSize: const Size(0, 44),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: Text(
                  adding
                      ? context.l10n.processing
                      : (te ? 'ఇప్పుడే కొనండి' : 'Buy Now'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PriceLine extends StatelessWidget {
  const _PriceLine({
    required this.priceMinor,
    required this.mrpMinor,
    this.large = false,
  });

  final int priceMinor;
  final int? mrpMinor;
  final bool large;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          formatInr(priceMinor),
          style: TextStyle(
            fontSize: large ? 28 : 16,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.4,
            color: AppColors.text,
          ),
        ),
        if (mrpMinor != null) ...[
          const SizedBox(width: 8),
          Text(
            formatInr(mrpMinor!),
            style: TextStyle(
              fontSize: large ? 16 : 12,
              color: AppColors.textMuted,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        ],
      ],
    );
  }
}
