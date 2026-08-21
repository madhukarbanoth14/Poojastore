import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const maroon = Color(0xFF4A0F1D);
  static const maroonDeep = Color(0xFF6E1423);
  static const saffron = Color(0xFFB5563B);
  static const orange = Color(0xFFE85D04);
  static const gold = Color(0xFFC9A227);
  static const goldBright = Color(0xFFE9CE6E);
  static const cream = Color(0xFFFBF0DC);
  static const bg = Color(0xFFFFF7EA);
  static const surface = Color(0xFFFFFFFF);
  static const blush = Color(0xFFFCEBE1);
  static const headerBar = Color(0xFFFFF3E1);
  static const text = Color(0xFF4A0F1D);
  static const body = Color(0xFF5A4038);
  static const textMuted = Color(0xFF8A6B63);
  static const chipBg = Color(0xFFF3DCC0);
  static const success = Color(0xFF2E7D46);
  static const border = Color(0xFFF0D2C0);
  static const divider = Color(0xFFEFDBB8);
  static const inputBorder = Color(0xFFE8D8B8);

  static const stripes = [
    Color(0xFFFFE8D1),
    Color(0xFFF6E3B4),
    Color(0xFFF3D9DC),
    Color(0xFFE7E2D6),
  ];

  static Color stripe(int index) => stripes[index.abs() % stripes.length];

  static const avatarPalette = [saffron, maroon, gold];

  static Color avatar(int index) =>
      avatarPalette[index % avatarPalette.length];
}

@immutable
class PsPalette extends ThemeExtension<PsPalette> {
  const PsPalette({
    required this.bg,
    required this.surface,
    required this.text,
    required this.textMuted,
    required this.textDark,
    required this.border,
    required this.saffron,
    required this.gold,
    required this.goldBright,
    required this.maroon,
    required this.maroonDeep,
    required this.chipBg,
    required this.success,
    required this.cream,
    required this.stripes,
  });

  final Color bg;
  final Color surface;
  final Color text;
  final Color textMuted;
  final Color textDark;
  final Color border;
  final Color saffron;
  final Color gold;
  final Color goldBright;
  final Color maroon;
  final Color maroonDeep;
  final Color chipBg;
  final Color success;
  final Color cream;
  final List<Color> stripes;

  Color stripe(int index) => stripes[index.abs() % stripes.length];

  static const light = PsPalette(
    bg: Color(0xFFFFF7EA),
    surface: Color(0xFFFCEBE1),
    text: Color(0xFF4A0F1D),
    textMuted: Color(0xFF8A6B63),
    textDark: Color(0xFF221013),
    border: Color(0xFFF0D2C0),
    saffron: Color(0xFFB5563B),
    gold: Color(0xFFC9A227),
    goldBright: Color(0xFFE9CE6E),
    maroon: Color(0xFF4A0F1D),
    maroonDeep: Color(0xFF6E1423),
    chipBg: Color(0xFFF3DCC0),
    success: Color(0xFF2E7D46),
    cream: Color(0xFFFBF0DC),
    stripes: [
      Color(0xFFF3DCC0),
      Color(0xFFD9AE55),
      Color(0xFFFCEBE1),
      Color(0xFFE9CE6E),
    ],
  );

  static const dark = PsPalette(
    bg: Color(0xFF1B1310),
    surface: Color(0xFF241A16),
    text: Color(0xFFF5EBE2),
    textMuted: Color(0xFFB39A8C),
    textDark: Color(0xFF000000),
    border: Color(0x2ED4AF37),
    saffron: Color(0xFFFF8A47),
    gold: Color(0xFFE3C46B),
    goldBright: Color(0xFFD4AF37),
    maroon: Color(0xFFD97583),
    maroonDeep: Color(0xFF5A171F),
    chipBg: Color(0xFF2E211B),
    success: Color(0xFF4CAF6D),
    cream: Color(0xFF241A16),
    stripes: [
      Color(0xFF3A2A18),
      Color(0xFF3C331A),
      Color(0xFF3A2226),
      Color(0xFF332C22),
    ],
  );

  @override
  PsPalette copyWith({
    Color? bg,
    Color? surface,
    Color? text,
    Color? textMuted,
    Color? textDark,
    Color? border,
    Color? saffron,
    Color? gold,
    Color? goldBright,
    Color? maroon,
    Color? maroonDeep,
    Color? chipBg,
    Color? success,
    Color? cream,
    List<Color>? stripes,
  }) {
    return PsPalette(
      bg: bg ?? this.bg,
      surface: surface ?? this.surface,
      text: text ?? this.text,
      textMuted: textMuted ?? this.textMuted,
      textDark: textDark ?? this.textDark,
      border: border ?? this.border,
      saffron: saffron ?? this.saffron,
      gold: gold ?? this.gold,
      goldBright: goldBright ?? this.goldBright,
      maroon: maroon ?? this.maroon,
      maroonDeep: maroonDeep ?? this.maroonDeep,
      chipBg: chipBg ?? this.chipBg,
      success: success ?? this.success,
      cream: cream ?? this.cream,
      stripes: stripes ?? this.stripes,
    );
  }

  @override
  PsPalette lerp(ThemeExtension<PsPalette>? other, double t) {
    if (other is! PsPalette) return this;
    return t < 0.5 ? this : other;
  }
}

extension PsThemeX on BuildContext {
  PsPalette get ps => Theme.of(this).extension<PsPalette>() ?? PsPalette.light;
}

TextTheme _textThemeFor(Locale? locale, TextTheme base) {
  if (locale?.languageCode == 'te') {
    return GoogleFonts.notoSansTeluguTextTheme(base);
  }
  return GoogleFonts.interTextTheme(base);
}

TextStyle _titleStyle(Locale? locale, {double size = 18, required Color color}) {
  final style = TextStyle(
    fontWeight: FontWeight.w700,
    fontSize: size,
    color: color,
  );
  if (locale?.languageCode == 'te') {
    return GoogleFonts.notoSansTelugu(textStyle: style);
  }
  return GoogleFonts.poppins(textStyle: style);
}

ThemeData buildLightTheme([Locale? locale]) =>
    _buildTheme(PsPalette.light, Brightness.light, locale);

ThemeData buildDarkTheme([Locale? locale]) =>
    _buildTheme(PsPalette.dark, Brightness.dark, locale);

ThemeData _buildTheme(PsPalette p, Brightness brightness, Locale? locale) {
  final base = ThemeData(
    useMaterial3: true,
    brightness: brightness,
    scaffoldBackgroundColor: p.bg,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: p.maroon,
      onPrimary: Colors.white,
      secondary: p.saffron,
      onSecondary: Colors.white,
      error: const Color(0xFFD64545),
      onError: Colors.white,
      surface: p.surface,
      onSurface: p.text,
    ),
    extensions: [p],
  );
  final textTheme = _textThemeFor(locale, base.textTheme).apply(
    bodyColor: p.text,
    displayColor: p.text,
  );
  return base.copyWith(
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.headerBar,
      foregroundColor: p.text,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: _titleStyle(locale, size: 18.5, color: p.text),
    ),
    cardTheme: CardThemeData(
      color: p.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: p.border),
      ),
    ),
    dividerColor: p.border,
    tabBarTheme: TabBarThemeData(
      labelColor: p.maroonDeep,
      unselectedLabelColor: p.textMuted,
      indicatorColor: p.maroonDeep,
      indicatorSize: TabBarIndicatorSize.label,
      dividerColor: Colors.transparent,
      labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14),
      unselectedLabelStyle:
          GoogleFonts.inter(fontWeight: FontWeight.w500, fontSize: 14),
    ),
    chipTheme: ChipThemeData(
      selectedColor: p.maroonDeep,
      backgroundColor: p.surface,
      disabledColor: p.chipBg,
      side: BorderSide(color: p.border),
      labelStyle: TextStyle(
        color: p.text,
        fontWeight: FontWeight.w600,
        fontSize: 13,
      ),
      secondaryLabelStyle: const TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.w600,
        fontSize: 13,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: p.maroonDeep,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(52),
        textStyle: GoogleFonts.poppins(
          fontWeight: FontWeight.w700,
          fontSize: 14.5,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: p.maroonDeep,
        side: BorderSide(color: p.maroonDeep, width: 1.5),
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      hintStyle: TextStyle(color: p.textMuted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: p.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: p.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: p.saffron, width: 1.5),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: p.maroonDeep,
      contentTextStyle: GoogleFonts.inter(color: p.cream),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(color: p.saffron),
  );
}
