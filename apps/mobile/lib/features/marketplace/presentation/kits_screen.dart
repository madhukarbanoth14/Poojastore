import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/marketplace_api.dart';

final marketplaceApiProvider = Provider(
  (ref) => MarketplaceApi(ref.watch(apiClientProvider)),
);

class KitsScreen extends ConsumerStatefulWidget {
  const KitsScreen({super.key, this.initialCategory});

  final String? initialCategory;

  @override
  ConsumerState<KitsScreen> createState() => _KitsScreenState();
}

class _KitsScreenState extends ConsumerState<KitsScreen> {
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
      final kits = await ref.read(marketplaceApiProvider).listKits();
      if (!mounted) return;
      setState(() {
        _kits = kits;
        _loading = false;
        _error = null;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Puja Kits'),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
                  itemCount: _kits.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final k = _kits[i];
                    return GestureDetector(
                      onTap: () => context.push('/kits/${k['slug']}'),
                      child: Container(
                        padding: const EdgeInsets.all(13),
                        decoration: BoxDecoration(
                          color: AppColors.blush,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            const GoldThumb(width: 64, height: 64, radius: 14),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    k['name'] as String,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: AppColors.text,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    k['description'] as String? ??
                                        'Complete samagri kit for the ritual.',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      height: 1.4,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    formatInr(k['priceMinor'] as int),
                                    style: const TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.text,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Text(
                              '›',
                              style: TextStyle(
                                color: AppColors.saffron,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
