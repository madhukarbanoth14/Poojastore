import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../l10n/l10n.dart';
import 'kits_screen.dart';
import 'samagri_scan_screen.dart';

class SamagriScreen extends ConsumerStatefulWidget {
  const SamagriScreen({super.key, this.festival});

  final String? festival;

  @override
  ConsumerState<SamagriScreen> createState() => _SamagriScreenState();
}

class _SamagriScreenState extends ConsumerState<SamagriScreen> {
  List<Map<String, dynamic>> _kits = [];
  List<Map<String, dynamic>> _receivedLists = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(marketplaceApiProvider);
      final kits = await api.listKits();
      final samagri = await api.listSamagri();
      final seen = <String>{};
      final merged = <Map<String, dynamic>>[];
      for (final kit in [...samagri, ...kits]) {
        final slug = kit['slug'] as String?;
        if (slug == null || !seen.add(slug)) continue;
        merged.add(kit);
      }
      List<Map<String, dynamic>> received = const [];
      if (ref.read(authControllerProvider).isAuthenticated) {
        try {
          received = await ref.read(samagriScanApiProvider).listReceivedLists();
        } catch (_) {}
      }
      if (!mounted) return;
      final festival = widget.festival;
      if (festival != null && festival.isNotEmpty) {
        merged.sort((a, b) {
          final aHit = (a['slug'] as String? ?? '').contains(festival);
          final bHit = (b['slug'] as String? ?? '').contains(festival);
          if (aHit == bHit) return 0;
          return aHit ? -1 : 1;
        });
      }
      setState(() {
        _kits = merged;
        _receivedLists = received;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = '$e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(localeControllerProvider, (_, __) => _load());
    final l10n = context.l10n;
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: l10n.samagriTitle,
        actions: [
          IconButton(
            tooltip: l10n.scanListAction,
            onPressed: () => context.push('/samagri/scan'),
            icon: const Icon(Icons.document_scanner_outlined,
                color: AppColors.maroonDeep),
          ),
          IconButton(
            tooltip: l10n.cart,
            onPressed: () => context.push('/cart'),
            icon: const Icon(Icons.shopping_cart_outlined, color: AppColors.maroonDeep),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
                  children: [
                    Text(
                      l10n.samagriTwoOptionsIntro,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        height: 1.45,
                        fontSize: 13.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/poojas'),
                      icon: const Icon(Icons.menu_book_outlined, size: 18),
                      label: Text(l10n.browsePoojaGuides),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/samagri/scan'),
                      icon: const Icon(Icons.document_scanner_outlined, size: 18),
                      label: Text(l10n.scanListAction),
                    ),
                    if (_receivedLists.isNotEmpty) ...[
                      const SizedBox(height: 22),
                      Text(
                        l10n.receivedSamagriLists,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                          color: AppColors.maroon,
                        ),
                      ),
                      const SizedBox(height: 10),
                      ..._receivedLists.map((item) {
                        final isNew = item['status'] == 'SENT';
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: PsCard(
                            onTap: () async {
                              await context.push('/samagri/received/${item['id']}');
                              if (mounted) _load();
                            },
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['title'] as String? ?? '',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14.5,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        l10n.receivedSamagriFrom(
                                          item['priestName'] as String? ?? '',
                                        ),
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isNew)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 3,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.saffron,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      l10n.receivedSamagriNew,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                    const SizedBox(height: 22),
                    Text(
                      l10n.samagriTitle,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.maroon,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...List.generate(_kits.length, (i) {
                      final kit = _kits[i];
                      final count = ((kit['selectableItems'] as List?) ??
                              (kit['kitItems'] as List?) ??
                              const [])
                          .length;
                      return Padding(
                        padding: EdgeInsets.only(bottom: i == _kits.length - 1 ? 0 : 12),
                        child: PsCard(
                          onTap: () => context.push('/kits/${kit['slug']}'),
                          child: Row(
                            children: [
                              CatalogImage(
                                asset: CatalogImages.kitAsset(
                                  slug: kit['slug'] as String?,
                                  name: kit['name'] as String?,
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
                                      kit['name'] as String? ?? '',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      count == 0
                                          ? context.l10n.completeFestivalSamagri
                                          : context.l10n.itemsIncluded(count),
                                      style: const TextStyle(
                                        fontSize: 12.5,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Builder(
                                builder: (context) {
                                  final price = kit['priceMinor'] as int? ?? 0;
                                  final mrp = kit['mrpMinor'] as int?;
                                  return Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        formatInr(price),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      if (mrp != null && mrp > price)
                                        Text(
                                          formatInr(mrp),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textMuted,
                                            decoration:
                                                TextDecoration.lineThrough,
                                          ),
                                        ),
                                    ],
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
    );
  }
}
