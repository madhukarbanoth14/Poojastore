import 'package:dio/dio.dart';

/// Moon-sign (Chandra rāśi) + nakshatra from an open Vedic chart API
/// (Bharat Ephemeris — no API key, fair-use).
class RasiChartResult {
  const RasiChartResult({
    required this.rasi,
    required this.rasiLabel,
    required this.nakshatra,
    required this.lagnaLabel,
  });

  final String rasi; // MESHA … MEENA
  final String rasiLabel;
  final String nakshatra;
  final String lagnaLabel;
}

class RasiChartService {
  RasiChartService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                connectTimeout: const Duration(seconds: 20),
                receiveTimeout: const Duration(seconds: 20),
                headers: {'Content-Type': 'application/json'},
              ),
            );

  final Dio _dio;

  static const _rasiByIdx = <String>[
    'MESHA',
    'VRISHABHA',
    'MITHUNA',
    'KARKA',
    'SIMHA',
    'KANYA',
    'TULA',
    'VRISHCHIKA',
    'DHANU',
    'MAKARA',
    'KUMBHA',
    'MEENA',
  ];

  static const _rasiLabels = <String>[
    'Mesha (Aries)',
    'Vrishabha (Taurus)',
    'Mithuna (Gemini)',
    'Karka (Cancer)',
    'Simha (Leo)',
    'Kanya (Virgo)',
    'Tula (Libra)',
    'Vrishchika (Scorpio)',
    'Dhanu (Sagittarius)',
    'Makara (Capricorn)',
    'Kumbha (Aquarius)',
    'Meena (Pisces)',
  ];

  static const _nakshatras = <String>[
    'Ashwini',
    'Bharani',
    'Krittika',
    'Rohini',
    'Mrigashira',
    'Ardra',
    'Punarvasu',
    'Pushya',
    'Ashlesha',
    'Magha',
    'Purva Phalguni',
    'Uttara Phalguni',
    'Hasta',
    'Chitra',
    'Swati',
    'Vishakha',
    'Anuradha',
    'Jyeshtha',
    'Mula',
    'Purva Ashadha',
    'Uttara Ashadha',
    'Shravana',
    'Dhanishta',
    'Shatabhisha',
    'Purva Bhadrapada',
    'Uttara Bhadrapada',
    'Revati',
  ];

  /// Compute janma rāśi (Moon) from birth details.
  Future<RasiChartResult> compute({
    required DateTime dateOfBirth,
    required int hour,
    required int minute,
    required double latitude,
    required double longitude,
    double tzHours = 5.5,
    String? name,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      'https://bharatephemeris.com/api/chart',
      data: {
        if (name != null && name.isNotEmpty) 'name': name,
        'year': dateOfBirth.year,
        'month': dateOfBirth.month,
        'day': dateOfBirth.day,
        'hour': hour,
        'minute': minute,
        'lat': latitude,
        'lon': longitude,
        'tzHours': tzHours,
      },
    );
    final data = res.data;
    if (data == null) {
      throw StateError('Empty chart response');
    }

    final grahas = (data['grahas'] as List?) ?? const [];
    Map<String, dynamic>? moon;
    for (final raw in grahas) {
      final g = Map<String, dynamic>.from(raw as Map);
      final key = (g['key'] as String? ?? '').toLowerCase();
      final iast = (g['iast'] as String? ?? '').toLowerCase();
      if (key.contains('candra') ||
          key.contains('chandra') ||
          iast.contains('candra')) {
        moon = g;
        break;
      }
    }
    if (moon == null) {
      throw StateError('Moon position missing from chart');
    }

    final rashi = Map<String, dynamic>.from(moon['rashi'] as Map? ?? {});
    final idx = (rashi['idx'] as num?)?.toInt() ?? 0;
    final safeIdx = idx.clamp(0, 11);
    final pada = (moon['nakshatra_pada'] as num?)?.toInt();

    // Prefer explicit nakshatra name if present; else derive from sidereal deg.
    String nakshatra = rashi['enName'] as String? ?? '';
    final sidereal = (moon['sidereal_deg'] as num?)?.toDouble();
    if (sidereal != null) {
      final nIdx = ((sidereal % 360) / (360 / 27)).floor().clamp(0, 26);
      nakshatra = _nakshatras[nIdx];
      if (pada != null) nakshatra = '$nakshatra (pada $pada)';
    }

    final lagna = Map<String, dynamic>.from(data['lagna'] as Map? ?? {});
    final lagnaRashi =
        Map<String, dynamic>.from(lagna['rashi'] as Map? ?? {});
    final lagnaLabel = lagnaRashi['enName'] as String? ??
        lagnaRashi['saName'] as String? ??
        '—';

    return RasiChartResult(
      rasi: _rasiByIdx[safeIdx],
      rasiLabel: _rasiLabels[safeIdx],
      nakshatra: nakshatra,
      lagnaLabel: lagnaLabel,
    );
  }
}
