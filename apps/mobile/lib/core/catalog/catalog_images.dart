import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Local product / festival / service artwork bundled with the app.
class CatalogImages {
  const CatalogImages._();

  static const kitsPrefix = 'assets/images/kits';
  static const festivalsPrefix = 'assets/images/festivals';
  static const servicesPrefix = 'assets/images/services';

  static const _kitFallbacks = <String, String>{
    'ganesh-mini': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh-mega': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh-chaturthi': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh-chaturthi-home': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh-chaturthi-pooja': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'mandapam': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'ganesh-puja-homam': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'homam': '$kitsPrefix/ganesh-chaturthi-kit.png',
    'satyanarayan': '$kitsPrefix/satyanarayan-puja-kit.png',
    'griha-pravesh': '$kitsPrefix/griha-pravesh-kit.png',
    'vehicle': '$kitsPrefix/vehicle-puja-kit.png',
    'daily': '$kitsPrefix/daily-puja-kit.png',
  };

  static String? kitAsset({String? slug, String? name}) {
    final key = (slug ?? '').trim().toLowerCase();
    if (key.isNotEmpty) {
      final direct = '$kitsPrefix/$key.png';
      if (_knownKitFiles.contains(key)) return direct;
      for (final entry in _kitFallbacks.entries) {
        if (key.contains(entry.key)) return entry.value;
      }
    }
    final n = (name ?? '').toLowerCase();
    for (final entry in _kitFallbacks.entries) {
      if (n.contains(entry.key)) return entry.value;
    }
    return '$kitsPrefix/daily-puja-kit.png';
  }

  static String festivalAsset(String id) {
    final key = id.trim().toLowerCase();
    return '$festivalsPrefix/$key.png';
  }

  static String serviceAsset(String id) => '$servicesPrefix/$id.png';

  static const _knownKitFiles = {
    'satyanarayan-puja-kit',
    'satyanarayan-puja-kit-us',
    'griha-pravesh-kit',
    'vehicle-puja-kit',
    'ganesh-chaturthi-kit',
    'ganesh-mini-home-puja',
    'ganesh-mini-office-puja',
    'ganesh-mini-mandapam',
    'ganesh-mega-home-puja',
    'ganesh-mega-office-puja',
    'ganesh-mega-mandapam',
    'daily-puja-kit',
  };

  static const samagriPrefix = 'assets/images/samagri';

  static const _knownSamagriFiles = {
    'samagri-21-patri',
    'samagri-akhanda-deepam',
    'samagri-akshatalu',
    'samagri-asanam',
    'samagri-astagandham',
    'samagri-attar',
    'samagri-backdrop',
    'samagri-betel-leaves',
    'samagri-betel-nuts',
    'samagri-blouse-pieces',
    'samagri-bukka',
    'samagri-camphor',
    'samagri-cardamom',
    'samagri-cloves',
    'samagri-coconuts',
    'samagri-cotton-wicks',
    'samagri-dates',
    'samagri-dhoop-cups',
    'samagri-dona-cups',
    'samagri-flowers',
    'samagri-fruits',
    'samagri-eco-ganesh-idol',
    'samagri-gandham',
    'samagri-gangajal',
    'samagri-garland',
    'samagri-ghee',
    'samagri-god-asanam',
    'samagri-gomutra',
    'samagri-gulal',
    'samagri-head-band',
    'samagri-honey',
    'samagri-incense',
    'samagri-isthari-leaves',
    'samagri-jaggery',
    'samagri-javadhu',
    'samagri-jenu',
    'samagri-jileda-wicks',
    'samagri-kankana-thread',
    'samagri-khandwa',
    'samagri-kumkum',
    'samagri-laddu',
    'samagri-leaf-cups',
    'samagri-markatam-ganesh',
    'samagri-matchbox',
    'samagri-moli-thread',
    'samagri-muggu-colours',
    'samagri-oil',
    'samagri-pacha-karpuram',
    'samagri-panchamritam',
    'samagri-paper-umbrella',
    'samagri-peacock-feathers',
    'samagri-poha',
    'samagri-pooja-book',
    'samagri-puja-vastras',
    'samagri-puvvu-wicks',
    'samagri-rava',
    'samagri-red-cloth',
    'samagri-rice',
    'samagri-rice-flour',
    'samagri-rose-water',
    'samagri-shubh-labh',
    'samagri-sindoor',
    'samagri-sugar-crystals',
    'samagri-sutli',
    'samagri-turmeric',
    'samagri-turmeric-roots',
    'samagri-umbrella',
    'samagri-undrallu',
    'samagri-white-thread',
    'samagri-yajnopavita',
  };

  static const _samagriAliases = {
    'samagri-durva': 'samagri-isthari-leaves',
    'samagri-sandal-paste': 'samagri-gandham',
    'samagri-prasadam-leaf-cups': 'samagri-leaf-cups',
  };

  static String? samagriAsset(String? slug) {
    final key = (slug ?? '').trim().toLowerCase();
    if (key.isEmpty) return null;
    final mapped = _samagriAliases[key] ?? key;
    if (_knownSamagriFiles.contains(mapped)) return '$samagriPrefix/$mapped.png';
    return null;
  }
}

class CatalogImage extends StatelessWidget {
  const CatalogImage({
    super.key,
    required this.asset,
    this.width,
    required this.height,
    this.radius = 12,
    this.fit = BoxFit.cover,
  });

  final String? asset;
  final double? width;
  final double height;
  final double radius;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final path = asset;
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: SizedBox(
        width: width,
        height: height,
        child: path == null
            ? const _GoldFallback()
            : Image.asset(
                path,
                width: width,
                height: height,
                fit: fit,
                errorBuilder: (_, __, ___) => const _GoldFallback(),
              ),
      ),
    );
  }
}

class _GoldFallback extends StatelessWidget {
  const _GoldFallback();

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.chipBg, Color(0xFFD9AE55)],
        ),
      ),
    );
  }
}
