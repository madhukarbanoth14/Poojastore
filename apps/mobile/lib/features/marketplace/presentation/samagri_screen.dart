import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import 'kits_screen.dart';

class SamagriScreen extends ConsumerStatefulWidget {
  const SamagriScreen({super.key, this.festival});

  final String? festival;

  @override
  ConsumerState<SamagriScreen> createState() => _SamagriScreenState();
}

class _SamagriScreenState extends ConsumerState<SamagriScreen> {
  List<Map<String, dynamic>> _kits = [];
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
    final l10n = context.l10n;
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(
        title: l10n.samagriTitle,
        actions: [
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
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
                  itemCount: _kits.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final kit = _kits[i];
                    final count = ((kit['selectableItems'] as List?) ??
                            (kit['kitItems'] as List?) ??
                            const [])
                        .length;
                    return PsCard(
                      onTap: () => context.push('/kits/${kit['slug']}'),
                      child: Row(
                        children: [
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
                                      ? 'Choose items'
                                      : '$count items · tap to choose',
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            formatInr(kit['priceMinor'] as int? ?? 0),
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
