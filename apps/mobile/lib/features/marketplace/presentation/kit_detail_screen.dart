import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/catalog/kit_item_taxonomy.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import 'kit_shop.dart';
import 'kits_screen.dart';

class KitDetailScreen extends ConsumerStatefulWidget {
  const KitDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<KitDetailScreen> createState() => _KitDetailScreenState();
}

class _KitDetailScreenState extends ConsumerState<KitDetailScreen> {
  bool _adding = false;
  bool _loading = true;
  int _qty = 1;
  final Set<String> _selected = {};
  Map<String, dynamic>? _kit;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (parseGaneshKitSlug(widget.slug) == null) {
      _load();
    } else {
      _loading = false;
    }
  }

  Future<void> _load() async {
    try {
      final kit =
          await ref.read(marketplaceApiProvider).kitDetail(widget.slug);
      if (!mounted) return;
      setState(() {
        _kit = kit;
        _loading = false;
        _appendOptionalExtras();
        _selectDefaults(_items);
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = '$e';
          _loading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> get _items {
    final selectable = (_kit?['selectableItems'] as List?)
        ?.cast<Map<String, dynamic>>();
    if (selectable != null && selectable.isNotEmpty) return selectable;
    return ((_kit?['kitItems'] as List?) ?? const [])
        .cast<Map<String, dynamic>>();
  }

  String _keyOf(Map<String, dynamic> item) =>
      (item['key'] as String?) ??
      (item['id'] as String?) ??
      (item['slug'] as String?) ??
      (item['name'] as String? ?? '');

  int get _totalMinor {
    return ((_kit?['priceMinor'] as int?) ?? 0) * _qty;
  }

  bool get _hasOptional => _items.any(
        (item) => item['optional'] == true || item['isOptional'] == true,
      );

  bool _isOptional(Map<String, dynamic> item) =>
      item['optional'] == true || item['isOptional'] == true;

  void _appendOptionalExtras() {
    final kit = _kit;
    if (kit == null) return;
    final packed = _items
        .where(
          (item) => !_isOptional(item) && _keyOf(item) != 'samagri-copper-pot',
        )
        .toList();
    final keys = packed.map(_keyOf).toSet();
    final names = packed
        .map((item) => (item['name'] as String? ?? '').toLowerCase())
        .toSet();
    final extras = <Map<String, dynamic>>[];
    for (final extra in kitOptionalOfferings) {
      if (keys.contains(extra.slug) ||
          names.contains(extra.nameEn.toLowerCase())) {
        continue;
      }
      extras.add({
        'key': extra.slug,
        'slug': extra.slug,
        'name': extra.nameEn,
        'nameTe': extra.nameTe,
        'quantity': 1,
        'optional': true,
        'priceMinor': extra.priceMinor,
      });
    }
    kit['selectableItems'] = [...packed, ...extras];
  }

  void _selectDefaults(List<Map<String, dynamic>> items) {
    _selected
      ..clear()
      ..addAll(
        items
            .where((item) => !_isOptional(item))
            .map(_keyOf)
            .where((key) => key.isNotEmpty),
      );
    if (_selected.isEmpty) {
      _selected.addAll(items.map(_keyOf).where((key) => key.isNotEmpty));
    }
  }

  Future<void> _add() async {
    final kit = _kit;
    if (kit == null) return;
    context.push(
      '/kits/${widget.slug}/extras?intent=buy&qty=$_qty',
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final ganesh = parseGaneshKitSlug(widget.slug);
    if (ganesh != null) {
      final f = festivalById('ganesh');
      final te = context.isTelugu;
      return Scaffold(
        backgroundColor: AppColors.bg,
        appBar: const PsHeader(title: 'Pooja Samagri'),
        body: KitShopView(
          initialSlug: widget.slug,
          about: f.localizedDescription(te),
          speciality: f.localizedSpeciality(te),
          steps: f.localizedSteps(te),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Pooja Samagri'),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _kit == null
              ? Center(child: Text(_error ?? 'Kit not found'))
              : _buildBody(context, l10n),
    );
  }

  Widget _buildBody(BuildContext context, AppLocalizations l10n) {
    final kit = _kit!;
    final items = _items;
    final name = kit['name'] as String? ?? '';
    final description = kit['description'] as String? ?? '';

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                  children: [
                    CatalogImage(
                      asset: CatalogImages.kitAsset(
                        slug: widget.slug,
                        name: name,
                      ),
                      width: double.infinity,
                      height: 140,
                      radius: 16,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 19,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _KitPrice(
                      priceMinor: (kit['priceMinor'] as int?) ?? 0,
                      mrpMinor: kit['mrpMinor'] as int?,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.55,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 16),
                    PpTitle(l10n.requiredItems, size: 14),
                    const SizedBox(height: 8),
                    if (_error != null)
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                    _KitPhotoGrid(
                      items: items.where((item) => !_isOptional(item)).toList(),
                      selected: _selected,
                      optional: false,
                      keyOf: _keyOf,
                    ),
                    if (_hasOptional) ...[
                      const SizedBox(height: 18),
                      Text(
                        context.isTelugu
                            ? 'ఐచ్ఛిక వస్తువులు కొనుగోలు తర్వాత ఎంచుకోవచ్చు.'
                            : 'Optional extras are offered after you tap Continue to Buy.',
                        style: const TextStyle(
                          fontSize: 12,
                          height: 1.45,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.blush,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    if (_qty > 1) setState(() => _qty--);
                                  },
                                  child: const Text(
                                    '−',
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.maroonDeep,
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                  ),
                                  child: Text(
                                    '$_qty',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => setState(() => _qty++),
                                  child: const Text(
                                    '+',
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.maroonDeep,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Text(
                            formatInr(_totalMinor),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: _adding ? null : _add,
                          child: Text(
                            _adding
                                ? l10n.processing
                                : (context.isTelugu ? 'కొనుగోలుకు కొనసాగించండి' : 'Continue to Buy'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
  }
}

class _KitPhotoGrid extends StatelessWidget {
  const _KitPhotoGrid({
    required this.items,
    required this.selected,
    required this.optional,
    required this.keyOf,
  });

  final List<Map<String, dynamic>> items;
  final Set<String> selected;
  final bool optional;
  final String Function(Map<String, dynamic>) keyOf;

  @override
  Widget build(BuildContext context) {
    final te = context.isTelugu;
    return Column(
      children: [
        for (var i = 0; i < items.length; i += 2)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _card(context, items[i], te)),
                const SizedBox(width: 10),
                Expanded(
                  child: i + 1 < items.length
                      ? _card(context, items[i + 1], te)
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _card(BuildContext context, Map<String, dynamic> item, bool te) {
    final key = keyOf(item);
    final checked = selected.contains(key);
    final name = te
        ? (item['nameTe'] as String? ?? item['name'] as String? ?? '')
        : (item['name'] as String? ?? '');
    final pack = item['pack'] as String?;
    final slug = (item['slug'] as String?) ?? key;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
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
                        asset: CatalogImages.samagriAsset(slug),
                        width: double.infinity,
                        height: 110,
                        radius: 0,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  if (optional)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: checked ? AppColors.maroon : Colors.white,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.maroon),
                        ),
                        child: checked
                            ? const Icon(
                                Icons.check,
                                size: 14,
                                color: AppColors.cream,
                              )
                            : null,
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
                      name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                    if (pack != null && pack.isNotEmpty)
                      Text(
                        pack,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      )
                    else
                      Text(
                        '×${item['quantity'] as int? ?? 1}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
                      ),
                    Text(
                      optional
                          ? (te ? 'ఐచ్ఛికం' : 'Optional')
                          : (te ? 'వినియోగం' : 'Consumable'),
                      style: const TextStyle(
                        fontSize: 10,
                        letterSpacing: 0.6,
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
  }
}

class _KitPrice extends StatelessWidget {
  const _KitPrice({required this.priceMinor, this.mrpMinor});

  final int priceMinor;
  final int? mrpMinor;

  @override
  Widget build(BuildContext context) {
    final mrp = mrpIfHigher(mrpMinor, priceMinor);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          formatInr(priceMinor),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.text,
          ),
        ),
        if (mrp != null) ...[
          const SizedBox(width: 8),
          Text(
            formatInr(mrp),
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textMuted,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        ],
      ],
    );
  }
}
