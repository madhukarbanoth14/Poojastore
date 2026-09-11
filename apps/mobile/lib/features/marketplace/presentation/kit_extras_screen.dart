import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/delivery_slot.dart';
import '../../../core/catalog/kit_item_taxonomy.dart';
import '../../../core/catalog/samagri_catalog.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import 'kits_screen.dart';

class KitExtrasScreen extends ConsumerStatefulWidget {
  const KitExtrasScreen({
    super.key,
    required this.slug,
    this.buyNow = true,
    this.qty = 1,
  });

  final String slug;
  final bool buyNow;
  final int qty;

  @override
  ConsumerState<KitExtrasScreen> createState() => _KitExtrasScreenState();
}

class _KitExtrasScreenState extends ConsumerState<KitExtrasScreen> {
  bool _loading = true;
  bool _adding = false;
  Map<String, dynamic>? _product;
  List<Map<String, dynamic>> _extras = [];
  List<String> _requiredKeys = [];
  final Set<String> _chosen = {};
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  int get _kitPrice => (_product?['priceMinor'] as int?) ??
      (samagriListByKitSlug(widget.slug)?.kitPriceMinor ?? 0);

  int get _extraTotal {
    var sum = 0;
    for (final item in _extras) {
      if (!_chosen.contains(_keyOf(item))) continue;
      final price = item['priceMinor'];
      final qty = item['quantity'] as int? ?? 1;
      if (price is int) sum += price * qty;
    }
    return sum;
  }

  int get _total => (_kitPrice + _extraTotal) * widget.qty;

  String _keyOf(Map<String, dynamic> item) =>
      (item['key'] as String?) ??
      (item['slug'] as String?) ??
      (item['id'] as String?) ??
      (item['name'] as String? ?? '');

  String _nameOf(Map<String, dynamic> item) {
    final te = context.isTelugu;
    if (te) {
      final teName = item['nameTe'] as String?;
      if (teName != null && teName.isNotEmpty) return teName;
    }
    return item['name'] as String? ?? '';
  }

  Future<void> _load() async {
    try {
      final product =
          await ref.read(marketplaceApiProvider).kitDetail(widget.slug);
      if (!mounted) return;
      final selectable = (product['selectableItems'] as List?)
              ?.cast<Map<String, dynamic>>() ??
          const [];
      final requiredKeys = selectable
          .where(
            (item) =>
                item['optional'] != true &&
                item['isOptional'] != true &&
                _keyOf(item) != 'samagri-copper-pot',
          )
          .map(_keyOf)
          .where((key) => key.isNotEmpty)
          .toList();
      var extras = selectable
          .where(
            (item) =>
                item['optional'] == true || item['isOptional'] == true,
          )
          .toList();
      if (extras.isEmpty) {
        final packed = requiredKeys.toSet();
        extras = [
          for (final extra in kitOptionalOfferings)
            if (!packed.contains(extra.slug))
              {
                'key': extra.slug,
                'slug': extra.slug,
                'name': extra.nameEn,
                'nameTe': extra.nameTe,
                'quantity': 1,
                'optional': true,
                'priceMinor': extra.priceMinor,
              },
        ];
      }
      setState(() {
        _product = product;
        _requiredKeys = requiredKeys;
        _extras = extras;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = friendlyNetworkError(e);
        _loading = false;
      });
    }
  }

  Future<void> _continue() async {
    final product = _product;
    final id = product?['id'] as String?;
    if (id == null) return;
    final ok = await ensureLoggedIn(
      context,
      ref,
      message: context.l10n.signInToAddCart,
    );
    if (!ok || !mounted) return;
    setState(() => _adding = true);
    try {
      await ref.read(marketplaceApiProvider).addToCart(
            id,
            qty: widget.qty,
            selectedItemKeys: _chosen.isEmpty
                ? null
                : [..._requiredKeys, ..._chosen],
            replace: widget.buyNow,
          );
      if (mounted) {
        context.push(widget.buyNow ? '/checkout' : '/cart');
      }
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
    final name = _product?['name'] as String? ??
        samagriListByKitSlug(widget.slug)?.title(te) ??
        widget.slug;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(title: te ? 'ఐచ్ఛిక వస్తువులు' : 'Optional extras'),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _product == null
              ? Center(child: Text(_error!))
              : Column(
                  children: [
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                        children: [
                          Text(
                            te ? 'దశ 2 / 2' : 'Step 2 of 2',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.4,
                              color: AppColors.maroon,
                            ),
                          ),
                          const SizedBox(height: 8),
                          PpTitle(
                            te ? 'ఐచ్ఛిక వస్తువులు' : 'Optional extras',
                            size: 26,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            te
                                ? 'కావాలంటే టిక్ చేయండి. ఏదీ ఎంచుకోకపోతే కిట్ ధర అలాగే ఉంటుంది.'
                                : 'Add anything you need. Skip this step to keep the same kit price.',
                            style: const TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.divider),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.maroon,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${te ? 'కిట్ ధర' : 'Kit price'} ${formatInr(_kitPrice)}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.orange.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    deliveryTagline(widget.slug, te: te),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.orange,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),
                          if (_extras.isEmpty)
                            Text(
                              te
                                  ? 'ఈ కిట్‌కు అదనపు వస్తువులు లేవు.'
                                  : 'This kit has no optional extras.',
                              style: const TextStyle(
                                color: AppColors.textMuted,
                              ),
                            )
                          else
                            for (final item in _extras)
                              _ExtraTile(
                                name: _nameOf(item),
                                priceLabel: '+${formatInr(((item['priceMinor'] as int?) ?? 0) * (item['quantity'] as int? ?? 1))}',
                                selected: _chosen.contains(_keyOf(item)),
                                asset: CatalogImages.samagriAsset(_keyOf(item)),
                                onToggle: () {
                                  final key = _keyOf(item);
                                  setState(() {
                                    if (_chosen.contains(key)) {
                                      _chosen.remove(key);
                                    } else {
                                      _chosen.add(key);
                                    }
                                  });
                                },
                              ),
                        ],
                      ),
                    ),
                    Material(
                      color: AppColors.bg,
                      elevation: 8,
                      child: SafeArea(
                        top: false,
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 10, 20, 12),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Text(
                                    te ? 'మొత్తం' : 'Total',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.maroon,
                                    ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    formatInr(_total),
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.saffron,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              SizedBox(
                                width: double.infinity,
                                child: TerracottaButton(
                                  label: _adding
                                      ? (te ? 'జోడిస్తోంది…' : 'Adding…')
                                      : (te ? 'చెల్లింపుకు వెళ్ళండి' : 'Continue to checkout'),
                                  onPressed: _adding ? null : _continue,
                                  loading: _adding,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}

class _ExtraTile extends StatelessWidget {
  const _ExtraTile({
    required this.name,
    required this.priceLabel,
    required this.selected,
    required this.onToggle,
    this.asset,
  });

  final String name;
  final String priceLabel;
  final bool selected;
  final VoidCallback onToggle;
  final String? asset;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: selected ? AppColors.blush : Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onToggle,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: selected ? AppColors.gold : AppColors.divider,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  selected ? Icons.check_box : Icons.check_box_outline_blank,
                  color: AppColors.maroon,
                ),
                const SizedBox(width: 10),
                CatalogImage(
                  asset: asset,
                  width: 56,
                  height: 56,
                  radius: 12,
                  fit: BoxFit.contain,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.maroon,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        priceLabel,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.saffron,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
