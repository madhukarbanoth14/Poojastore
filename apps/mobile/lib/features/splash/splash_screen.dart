import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/diya_mark.dart';
import '../onboarding/onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;
  final AudioPlayer _omPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _playOmChant();
    Future<void>.delayed(const Duration(milliseconds: 2800), () async {
      if (!mounted) return;
      const storage = FlutterSecureStorage();
      final done = await storage.read(key: kOnboardingDoneKey);
      if (!mounted) return;
      await _omPlayer.stop();
      if (!mounted) return;
      context.go(done == '1' ? '/' : '/onboarding');
    });
  }

  Future<void> _playOmChant() async {
    try {
      await _omPlayer.setReleaseMode(ReleaseMode.stop);
      await _omPlayer.setVolume(0.85);
      await _omPlayer.play(AssetSource('audio/om-chant-5s.mp3'));
    } catch (_) {
      // Splash should still advance if audio fails.
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    _omPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.maroonDeep, AppColors.maroon],
          ),
        ),
        child: Stack(
          children: [
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: GarlandDots(count: 10),
                ),
              ),
            ),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 220,
                    height: 220,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 220,
                          height: 220,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.goldBright.withValues(alpha: 0.35),
                              style: BorderStyle.solid,
                            ),
                          ),
                        ),
                        CustomPaint(
                          size: const Size(220, 220),
                          painter: _DashedCirclePainter(
                            color: AppColors.goldBright.withValues(alpha: 0.35),
                          ),
                        ),
                        CustomPaint(
                          size: const Size(178, 178),
                          painter: _DashedCirclePainter(
                            color: AppColors.goldBright.withValues(alpha: 0.5),
                          ),
                        ),
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.goldBright.withValues(alpha: 0.45),
                                blurRadius: 36,
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: Image.asset(
                              'assets/images/OM.jpg',
                              fit: BoxFit.cover,
                              width: 120,
                              height: 120,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  const Text(
                    'Pooja Store',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 30,
                      color: AppColors.cream,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Divine essentials, delivered',
                    style: TextStyle(
                      fontSize: 14,
                      letterSpacing: 1.5,
                      color: AppColors.cream.withValues(alpha: 0.75),
                    ),
                  ),
                  const SizedBox(height: 28),
                  AnimatedBuilder(
                    animation: _pulse,
                    builder: (context, _) {
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(3, (i) {
                          final phase = (_pulse.value + i * 0.2) % 1;
                          final scale = 1 + (phase < 0.5 ? phase : 1 - phase) * 0.8;
                          final opacity = 0.4 + (1 - (phase - 0.5).abs() * 2) * 0.6;
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 3.5),
                            width: 8 * scale,
                            height: 8 * scale,
                            decoration: BoxDecoration(
                              color: AppColors.goldBright.withValues(
                                alpha: opacity.clamp(0.4, 1),
                              ),
                              shape: BoxShape.circle,
                            ),
                          );
                        }),
                      );
                    },
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

class _DashedCirclePainter extends CustomPainter {
  _DashedCirclePainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    const dash = 5.0;
    const gap = 4.0;
    final radius = size.width / 2;
    final circ = 2 * 3.14159 * radius;
    final count = (circ / (dash + gap)).floor();
    final sweep = (dash / circ) * 2 * 3.14159;
    final skip = (gap / circ) * 2 * 3.14159;
    var start = 0.0;
    for (var i = 0; i < count; i++) {
      canvas.drawArc(
        Rect.fromCircle(center: Offset(radius, radius), radius: radius),
        start,
        sweep,
        false,
        paint,
      );
      start += sweep + skip;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedCirclePainter oldDelegate) =>
      oldDelegate.color != color;
}
