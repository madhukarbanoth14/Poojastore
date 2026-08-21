import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import '../../../l10n/l10n.dart';
import '../data/packages_api.dart';

class PackagesListScreen extends ConsumerStatefulWidget {
  const PackagesListScreen({super.key});

  @override
  ConsumerState<PackagesListScreen> createState() => _PackagesListScreenState();
}

class _PackagesListScreenState extends ConsumerState<PackagesListScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = ref.read(packagesApiProvider).list();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: const PsHeader(title: 'Puja Packages'),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('${snapshot.error}'));
          }
          final data = snapshot.data!;
          final items =
              (data['items'] as List).cast<Map<String, dynamic>>();
          final addons =
              (data['addons'] as List).cast<Map<String, dynamic>>();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                'Bundle kit, priest, prasad, and add-ons in one payment.',
                style: TextStyle(color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),
              ...items.map((p) {
                final parts = <String>[
                  if (p['allowsKit'] == true) 'Kit',
                  if (p['allowsPriest'] == true) 'Priest',
                  if (p['allowsPrasad'] == true) 'Prasad',
                ];
                final discount = p['packageDiscountMinor'] as int? ?? 0;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.blush,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (discount > 0)
                          Align(
                            alignment: Alignment.topRight,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 9,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.saffron,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                'SAVE ${(discount / 100).round()}',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        Padding(
                          padding: EdgeInsets.only(right: discount > 0 ? 70 : 0),
                          child: Text(
                            p['title'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                              color: AppColors.text,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: parts
                              .map(
                                (part) => Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.chipBg,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    part,
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.maroonDeep,
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            const Spacer(),
                            FilledButton(
                              onPressed: () =>
                                  context.push('/packages/${p['slug']}'),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.saffron,
                                minimumSize: const Size(0, 36),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              child: const Text('View Package'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
              if (addons.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  l10n.addOns,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                ...addons.map(
                  (a) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(a['title'] as String),
                    subtitle: Text(a['type'] as String),
                    trailing: Text(
                      formatInr(a['priceMinor'] as int),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.saffron,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
