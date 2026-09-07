import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/catalog/catalog_images.dart';
import '../../../core/catalog/design_catalog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/diya_mark.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../core/widgets/ps_format.dart';
import '../../../core/catalog/catalog_l10n.dart';
import '../../../core/catalog/panchang_terms_l10n.dart';
import '../../../core/i18n/locale_controller.dart';
import '../../../l10n/l10n.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../marketplace/presentation/kits_screen.dart';
import '../../panchang/data/panchang_api.dart';
import '../../panchang/presentation/panchang_almanac_card.dart';

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

  Future<void> _pickPanchangDate() async {
    final iso = _today?['date'] as String?;
    final selected = iso != null && iso.length >= 10
        ? parseIsoDate(iso)
        : DateTime.now();
    final picked = await pickPanchangDate(context, selected: selected);
    if (picked == null || !mounted) return;
    try {
      final data = await ref.read(panchangApiProvider).forDate(isoDate(picked));
      if (!mounted) return;
      setState(() => _today = data);
    } catch (_) {}
  }

  String get _firstName {
    final user = ref.read(authControllerProvider).user;
    final full = user?.fullName?.trim();
    if (full == null || full.isEmpty) return '';
    return full.split(RegExp(r'\s+')).first;
  }

  String get _initial {
    final name = _firstName;
    if (name.isEmpty) return 'G';
    return name.substring(0, 1).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(localeControllerProvider, (_, __) => _load());
    final l10n = context.l10n;
    final te = context.isTelugu;
    final featured = _kits.take(3).toList();
    final loggedIn = ref.watch(authControllerProvider).isAuthenticated;
    final displayName = _firstName.isEmpty ? l10n.guest : _firstName;

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
                        Expanded(
                          child: Text(
                            l10n.appTitle,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                              color: AppColors.cream,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                        if (!loggedIn) ...[
                          GestureDetector(
                            onTap: () => context.push('/login'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.goldBright,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                l10n.signIn,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.maroonDeep,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
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
                      l10n.namasteName(displayName),
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
                  PpTitle(l10n.homeTodayPanchang),
                  const SizedBox(height: 10),
                  _PanchangCard(
                    today: _today,
                    l10n: l10n,
                    onPickDate: _pickPanchangDate,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: PpTitle(l10n.homeUpcomingFestivals),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
              child: Text(
                l10n.homeFestivalsSubtitle,
                style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 210,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: upcomingFestivals.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  final f = upcomingFestivals[i];
                  return Container(
                    width: 188,
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
                          child: GestureDetector(
                            onTap: () => context.push('/festival/${f.id}'),
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                CatalogImage(
                                  asset: CatalogImages.festivalAsset(f.id),
                                  height: 86,
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
                                      festivalDaysToLabel(
                                        target: f.target,
                                        l10n: l10n,
                                      ),
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
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                f.localizedName(te),
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
                                f.localizedDate(te),
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 8),
                              SizedBox(
                                width: double.infinity,
                                child: FilledButton(
                                  onPressed: () =>
                                      context.push('/festival/${f.id}'),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.saffron,
                                    minimumSize: const Size(0, 32),
                                    padding: EdgeInsets.zero,
                                    textStyle: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  child: Text(l10n.bookSamagriKit),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
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
                  Expanded(child: PpTitle(l10n.homeSamagriTitle)),
                  GestureDetector(
                    onTap: () => context.go('/shop'),
                    child: Text(
                      l10n.viewAll,
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.saffron,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
              child: Text(
                l10n.homeSamagriSubtitle,
                style: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 20, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: () => context.push('/poojas'),
                  child: Text(l10n.browsePoojaGuides),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 214,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: featured.isEmpty ? 3 : featured.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  if (featured.isEmpty) {
                    const fallback = [
                      (
                        'Mini Home Pooja Kit',
                        1111,
                        1600,
                        'ganesh-mini-home-puja',
                      ),
                      (
                        'Satyanarayan Puja Samagri',
                        749,
                        0,
                        'satyanarayan-puja-kit',
                      ),
                      ('Basic Pooja Samagri', 1299, 0, 'general-pooja-samagri-kit'),
                    ];
                    final k = fallback[i];
                    return _KitCard(
                      name: k.$1,
                      price: '₹${k.$2}',
                      mrp: k.$3 > k.$2 ? '₹${k.$3}' : null,
                      imageAsset: CatalogImages.kitAsset(slug: k.$4, name: k.$1),
                      onTap: () => context.push('/kits/${k.$4}'),
                    );
                  }
                  final k = featured[i];
                  final name = k['name'] as String;
                  final priceMinor = k['priceMinor'] as int;
                  final mrpMinor = k['mrpMinor'] as int?;
                  return _KitCard(
                    name: name,
                    price: formatInr(priceMinor),
                    mrp: mrpMinor != null && mrpMinor > priceMinor
                        ? formatInr(mrpMinor)
                        : null,
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
                  PpTitle(l10n.homeMoreServices),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.05,
                    children: [
                      _ServiceTile(
                        title: l10n.homeVidhiTitle,
                        imageId: 'vidhi',
                        route: '/vidhi',
                      ),
                      _ServiceTile(
                        title: l10n.homeKidsTitle,
                        imageId: 'kids',
                        soon: true,
                        soonLabel: l10n.comingSoonBadge,
                      ),
                      _ServiceTile(
                        title: l10n.homePriestsTitle,
                        imageId: 'priest',
                        route: '/priests',
                      ),
                      _ServiceTile(
                        title: l10n.homeGuidesTitle,
                        imageId: 'prasad',
                        route: '/guides',
                      ),
                      _ServiceTile(
                        title: l10n.homePackagesTitle,
                        imageId: 'packages',
                        route: '/packages',
                      ),
                      _ServiceTile(
                        title: l10n.panchangShortTitle,
                        imageId: 'samagri',
                        route: '/panchang',
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
  const _PanchangCard({
    this.today,
    required this.l10n,
    required this.onPickDate,
  });

  final Map<String, dynamic>? today;
  final AppLocalizations l10n;
  final VoidCallback onPickDate;

  @override
  Widget build(BuildContext context) {
    final te = context.isTelugu;
    final dateLine = localizedPanchangHeadline(today, te);
    final place = today?['cityName'] as String? ?? 'Hyderabad';
    final tithi = today?['tithi'] as String? ?? 'Shukla Dwitiya';
    final nakshatra =
        today?['nakshatra'] as String? ?? 'Uttara Phalguni Nakshatra';
    final tithiLine = localizeTithiNakshatraLine(tithi, nakshatra, te);
    final sunrise = today?['sunrise'] as String? ?? '05:58 am';
    String rahu = '10:45–12:20';
    final rk = today?['rahuKalam'];
    if (rk is Map) {
      rahu = '${rk['start']}–${rk['end']}';
    }

    return Container(
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
                child: GestureDetector(
                  onTap: () => context.push('/panchang'),
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
                        tithiLine,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.cream,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        l10n.panchangSunriseRahuKalam(sunrise, rahu),
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.cream.withValues(alpha: 0.75),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              IconButton(
                onPressed: onPickDate,
                tooltip: almanacLabel('pickDate', te),
                icon: const Icon(Icons.calendar_month, color: AppColors.goldBright),
              ),
              const Text(
                '›',
                style: TextStyle(color: AppColors.goldBright, fontSize: 18),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _KitCard extends StatelessWidget {
  const _KitCard({
    required this.name,
    required this.price,
    required this.onTap,
    this.mrp,
    this.imageAsset,
  });

  final String name;
  final String price;
  final String? mrp;
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
            if (mrp != null)
              Text(
                mrp!,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textMuted,
                  decoration: TextDecoration.lineThrough,
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
    this.soonLabel = 'SOON',
  });

  final String title;
  final String imageId;
  final String? route;
  final bool soon;
  final String soonLabel;

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
                        child: Text(
                          soonLabel,
                          style: const TextStyle(
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
