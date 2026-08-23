import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/diya_mark.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../marketplace/presentation/kits_screen.dart';
import '../../panchang/data/panchang_api.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Map<String, dynamic>> _kits = [];
  Map<String, dynamic>? _today;
  int _cartCount = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final market = ref.read(marketplaceApiProvider);
      final panchang = ref.read(panchangApiProvider);
      final results = await Future.wait([
        market.listKits(),
        market.getCart().then((c) => c).catchError((_) => <String, dynamic>{}),
        panchang.today().catchError((_) => <String, dynamic>{}),
      ]);
      if (!mounted) return;
      final cart = results[1] as Map<String, dynamic>;
      final items = (cart['items'] as List?) ?? const [];
      setState(() {
        _kits = (results[0] as List).cast<Map<String, dynamic>>();
        _today = (results[2] as Map).isEmpty
            ? null
            : results[2] as Map<String, dynamic>;
        _cartCount = items.fold<int>(
          0,
          (sum, item) => sum + ((item as Map)['quantity'] as int? ?? 0),
        );
      });
    } catch (_) {
      if (mounted) setState(() {});
    }
  }

  String get _firstName {
    final user = ref.read(authControllerProvider).user;
    final full = user?.fullName?.trim();
    if (full == null || full.isEmpty) return 'Aarav';
    return full.split(RegExp(r'\s+')).first;
  }

  String get _initial {
    return _firstName.substring(0, 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final featured = _kits.take(3).toList();

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            MaroonGradient(
              padding: const EdgeInsets.fromLTRB(22, 20, 22, 26),
              child: SafeArea(
                bottom: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const DiyaOrb(size: 34),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: Text(
                            'Pooja Panchang',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                              color: AppColors.cream,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/cart'),
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.cream.withValues(alpha: 0.14),
                                  border: Border.all(
                                    color: AppColors.goldBright.withValues(
                                      alpha: 0.4,
                                    ),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.shopping_bag_outlined,
                                  size: 16,
                                  color: AppColors.goldBright,
                                ),
                              ),
                              if (_cartCount > 0)
                                Positioned(
                                  top: -4,
                                  right: -4,
                                  child: Container(
                                    constraints: const BoxConstraints(
                                      minWidth: 16,
                                      minHeight: 16,
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 3,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.saffron,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      '$_cartCount',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.cream.withValues(alpha: 0.14),
                              border: Border.all(
                                color: AppColors.goldBright.withValues(
                                  alpha: 0.4,
                                ),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              _initial,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.goldBright,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const GarlandDots(alignStart: true),
                    const SizedBox(height: 16),
                    Text(
                      'Namaste, $_firstName',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 24,
                        color: AppColors.cream,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const PpTitle("Today's Panchang"),
                  const SizedBox(height: 10),
                  _PanchangCard(today: _today),
                ],
              ),
            ),
            const SizedBox(height: 22),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: PpTitle('Upcoming Festivals'),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 148,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: upcomingFestivals.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  final f = upcomingFestivals[i];
                  return GestureDetector(
                    onTap: () => context.push('/festival/${f.id}'),
                    child: Container(
                      width: 168,
                      decoration: BoxDecoration(
                        color: AppColors.blush,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                CatalogImage(
                                  asset: CatalogImages.festivalAsset(f.id),
                                  height: 78,
                                  radius: 0,
                                ),
                                Positioned(
                                  left: 10,
                                  top: 10,
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
                                      f.daysTo,
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  f.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13.5,
                                    color: AppColors.text,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  f.date,
                                  style: const TextStyle(
                                    fontSize: 11.5,
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
                },
              ),
            ),
            const SizedBox(height: 22),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  const Expanded(child: PpTitle('Puja Kits')),
                  GestureDetector(
                    onTap: () => context.go('/shop'),
                    child: const Text(
                      'View all',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.saffron,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 196,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: featured.isEmpty ? 3 : featured.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  if (featured.isEmpty) {
                    const fallback = [
                      ('Ganesh Chaturthi Kit', 899, 'ganesh-chaturthi-kit'),
                      ('Satyanarayan Puja Kit', 749, 'satyanarayan-puja-kit'),
                      ('Daily Puja Kit', 399, 'daily-puja-kit'),
                    ];
                    final k = fallback[i];
                    return _KitCard(
                      name: k.$1,
                      price: '₹${k.$2}',
                      imageAsset: CatalogImages.kitAsset(slug: k.$3, name: k.$1),
                      onTap: () => context.go('/shop'),
                    );
                  }
                  final k = featured[i];
                  final name = k['name'] as String;
                  return _KitCard(
                    name: name,
                    price: formatInr(k['priceMinor'] as int),
                    imageAsset: CatalogImages.kitAsset(
                      slug: k['slug'] as String?,
                      name: name,
                    ),
                    onTap: () => context.push('/kits/${k['slug']}'),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const PpTitle('More Services'),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.05,
                    children: const [
                      _ServiceTile(
                        title: 'Puja Vidhi',
                        imageId: 'vidhi',
                        route: '/vidhi',
                      ),
                      _ServiceTile(
                        title: 'Kids Corner',
                        imageId: 'kids',
                        soon: true,
                      ),
                      _ServiceTile(
                        title: 'Book a Priest',
                        imageId: 'priest',
                        route: '/priests',
                      ),
                      _ServiceTile(
                        title: 'Prasad & Vrat',
                        imageId: 'prasad',
                        route: '/guides',
                      ),
                      _ServiceTile(
                        title: 'Puja Packages',
                        imageId: 'packages',
                        route: '/packages',
                      ),
                      _ServiceTile(
                        title: 'Pooja Samagri',
                        imageId: 'samagri',
                        route: '/samagri',
                      ),
                    ],
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

class _PanchangCard extends StatelessWidget {
  const _PanchangCard({this.today});

  final Map<String, dynamic>? today;

  @override
  Widget build(BuildContext context) {
    final dateLine = panchangHeadline(today);
    final place = today?['cityName'] as String? ?? 'Hyderabad';
    final tithi = today?['tithi'] as String? ?? 'Shukla Dwitiya';
    final nakshatra =
        today?['nakshatra'] as String? ?? 'Uttara Phalguni Nakshatra';
    final sunrise = today?['sunrise'] as String? ?? '05:58 am';
    String rahu = '10:45–12:20';
    final rk = today?['rahuKalam'];
    if (rk is Map) {
      rahu = '${rk['start']}–${rk['end']}';
    }

    return GestureDetector(
      onTap: () => context.push('/panchang'),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.maroonDeep, AppColors.maroon],
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFD9AE55)),
        ),
        child: Stack(
          children: [
            Positioned(
              right: -30,
              top: -30,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.goldBright.withValues(alpha: 0.12),
                ),
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$dateLine · $place',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.goldBright,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '$tithi · $nakshatra',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.cream,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Sunrise $sunrise · Rahu Kalam $rahu',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.cream.withValues(alpha: 0.75),
                        ),
                      ),
                    ],
                  ),
                ),
                const Text(
                  '›',
                  style: TextStyle(color: AppColors.goldBright, fontSize: 18),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _KitCard extends StatelessWidget {
  const _KitCard({
    required this.name,
    required this.price,
    required this.onTap,
    this.imageAsset,
  });

  final String name;
  final String price;
  final VoidCallback onTap;
  final String? imageAsset;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 150,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CatalogImage(asset: imageAsset, height: 88, radius: 12),
            const SizedBox(height: 10),
            Text(
              name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13.5,
                height: 1.3,
                color: AppColors.text,
              ),
            ),
            const Spacer(),
            Text(
              price,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.saffron,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServiceTile extends StatelessWidget {
  const _ServiceTile({
    required this.title,
    required this.imageId,
    this.route,
    this.soon = false,
  });

  final String title;
  final String imageId;
  final String? route;
  final bool soon;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: soon ? 0.6 : 1,
      child: GestureDetector(
        onTap: soon || route == null ? null : () => context.push(route!),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.blush,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: CatalogImage(
                  asset: CatalogImages.serviceAsset(imageId),
                  height: 88,
                  radius: 0,
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.text,
                      ),
                    ),
                    if (soon) ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.chipBg,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'SOON',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFA8763B),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
