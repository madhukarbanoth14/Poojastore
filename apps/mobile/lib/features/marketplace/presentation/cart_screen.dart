import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../../l10n/l10n.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/widgets/ps_widgets.dart';
import 'kits_screen.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _future = ref.read(marketplaceApiProvider).getCart();
  }

  Future<void> _remove(String productId) async {
    await ref.read(marketplaceApiProvider).removeCartItem(productId);
    setState(_reload);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(localeControllerProvider, (_, __) => setState(_reload));
    final l10n = context.l10n;
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: PsHeader(title: l10n.cart),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final cart = snapshot.data!;
          final items = (cart['items'] as List).cast<Map<String, dynamic>>();
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(30),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      l10n.emptyCart,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.emptyCartBrowseSamagri,
                      style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: () => context.go('/shop'),
                      child: Text(l10n.browseSamagri),
                    ),
                  ],
                ),
              ),
            );
          }

          final subtotal = cart['subtotalMinor'] as int;
          const delivery = 4000;
          final total = subtotal + delivery;

          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 34),
            children: [
              ...items.map((item) {
                final product = item['product'] as Map<String, dynamic>;
                final qty = item['quantity'] as int;
                final productId = item['productId'] as String;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.blush,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      CatalogImage(
                        asset: CatalogImages.kitAsset(
                          slug: product['slug'] as String?,
                          name: product['name'] as String?,
                        ),
                        width: 52,
                        height: 52,
                        radius: 12,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product['name'] as String,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 13.5,
                                color: AppColors.text,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              l10n.cartQtyLine(qty, formatInr(product['priceMinor'] as int)),
                              style: const TextStyle(
                                fontSize: 12.5,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () => _remove(productId),
                        child: Text(
                          l10n.remove,
                          style: const TextStyle(
                            color: AppColors.saffron,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _row(l10n.itemsSubtotal, formatInr(subtotal)),
                    _row(l10n.deliveryCharge, formatInr(delivery)),
                    const Divider(height: 18, color: AppColors.border),
                    _row(l10n.total, formatInr(total), bold: true),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: () async {
                  if (!ref.read(authControllerProvider).isAuthenticated) {
                    await context.push(
                      '/login?next=${Uri.encodeComponent('/checkout')}',
                    );
                  }
                  if (!context.mounted) return;
                  if (!ref.read(authControllerProvider).isAuthenticated) {
                    return;
                  }
                  context.push('/checkout');
                },
                child: Text(l10n.proceedToCheckout),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _row(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: bold ? 14.5 : 13,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
              color: bold ? AppColors.text : AppColors.textMuted,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: bold ? 15.5 : 13.5,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
