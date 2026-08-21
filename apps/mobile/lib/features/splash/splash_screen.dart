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

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    Future<void>.delayed(const Duration(milliseconds: 2400), () async {
      if (!mounted) return;
      const storage = FlutterSecureStorage();
      final done = await storage.read(key: kOnboardingDoneKey);
      if (!mounted) return;
      context.go(done == '1' ? '/' : '/onboarding');
    });
  }

  @override
  void dispose() {
    _pulse.dispose();
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
                        const Positioned(
                          top: 6,
                          child: TwinkleDot(
                            size: 5,
                            color: AppColors.goldBright,
                          ),
                        ),
                        const Positioned(
                          left: 36,
                          bottom: 18,
                          child: TwinkleDot(
                            size: 4,
                            color: AppColors.cream,
                            delay: Duration(milliseconds: 500),
                          ),
                        ),
                        const Positioned(
                          right: 28,
                          top: 24,
                          child: TwinkleDot(
                            size: 4,
                            color: AppColors.saffron,
                            delay: Duration(milliseconds: 1000),
                          ),
                        ),
                        const Positioned(
                          right: 18,
                          bottom: 36,
                          child: TwinkleDot(
                            size: 5,
                            color: AppColors.goldBright,
                            delay: Duration(milliseconds: 1300),
                          ),
                        ),
                        const DiyaOrb(),
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
