import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/auth/ensure_logged_in.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/network/fallback_dns.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
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
    _load();
  }

  Future<void> _load() async {
    try {
      final kit =
          await ref.read(marketplaceApiProvider).kitDetail(widget.slug);
      if (!mounted) return;
      final items = (kit['selectableItems'] as List?)
              ?.cast<Map<String, dynamic>>() ??
          (kit['kitItems'] as List?)?.cast<Map<String, dynamic>>() ??
          const [];
      setState(() {
        _kit = kit;
        _loading = false;
        _selectDefaults(items);
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

  int _priceOf(Map<String, dynamic> item) {
    final live = item['priceMinor'];
    final qty = item['quantity'] as int? ?? 1;
    if (live is int) return live * qty;
    return 0;
  }

  int get _totalMinor {
    if (_items.isEmpty) {
      return ((_kit?['priceMinor'] as int?) ?? 0) * _qty;
    }
    final sum = _items.fold<int>(0, (total, item) {
      if (!_selected.contains(_keyOf(item))) return total;
      return total + _priceOf(item);
    });
    return sum * _qty;
  }

  bool get _hasOptional => _items.any(
        (item) => item['optional'] == true || item['isOptional'] == true,
      );

  bool _isOptional(Map<String, dynamic> item) =>
      item['optional'] == true || item['isOptional'] == true;

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
    final loggedIn = await ensureLoggedIn(
      context,
      ref,
      message: 'Sign in to add samagri to your cart',
    );
    if (!loggedIn || !mounted) return;
    final keys = _selected.toList();
    if (_items.isNotEmpty && keys.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.selectAtLeastOneItem)),
      );
      return;
    }
    setState(() => _adding = true);
    try {
      await ref.read(marketplaceApiProvider).addToCart(
            kit['id'] as String,
            qty: _qty,
            selectedItemKeys: _items.isEmpty ? null : keys,
          );
      if (mounted) context.push('/cart');
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
    final l10n = context.l10n;

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
                    ...items
                        .where((item) => !_isOptional(item))
                        .map((item) => _itemTile(item, optional: false)),
                    if (_hasOptional) ...[
                      const SizedBox(height: 18),
                      PpTitle(l10n.chooseOptionalItems, size: 14),
                      const SizedBox(height: 4),
                      Text(
                        l10n.optionalItemsHint,
                        style: const TextStyle(
                          fontSize: 12,
                          height: 1.45,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...items
                          .where(_isOptional)
                          .map((item) => _itemTile(item, optional: true)),
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
                                : l10n.addItemsToCart(_selected.length),
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

  Widget _itemTile(Map<String, dynamic> item, {required bool optional}) {
    final key = _keyOf(item);
    final selected = _selected.contains(key);
    final pack = item['pack'] as String?;
    final linePrice = _priceOf(item);
    return CheckboxListTile(
      contentPadding: EdgeInsets.zero,
      value: selected,
      activeColor: AppColors.maroonDeep,
      onChanged: !optional && _hasOptional
          ? null
          : (value) {
              setState(() {
                if (value == true) {
                  _selected.add(key);
                } else {
                  _selected.remove(key);
                }
              });
            },
      title: Text(
        item['name'] as String? ?? '',
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        [
          if (pack != null && pack.isNotEmpty) pack,
          if (optional) context.l10n.optionalItem,
        ].join(' · '),
        style: const TextStyle(
          fontSize: 12,
          color: AppColors.textMuted,
        ),
      ),
      secondary: linePrice > 0
          ? Text(
              formatInr(linePrice),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.saffron,
              ),
            )
          : null,
      controlAffinity: ListTileControlAffinity.leading,
    );
  }
}
