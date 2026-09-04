import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Local product / festival / service artwork bundled with the app.
class CatalogImages {
  const CatalogImages._();

  static const kitsPrefix = 'assets/images/kits';
  static const festivalsPrefix = 'assets/images/festivals';
  static const servicesPrefix = 'assets/images/services';

  static const _kitFallbacks = <String, String>{
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
    'daily-puja-kit',
  };
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
