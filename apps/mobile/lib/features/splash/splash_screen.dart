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

  static const _logoAsset = 'assets/images/pavitra_seva_logo.jpeg';

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _playOmChant();
    Future<void>.delayed(const Duration(milliseconds: 2200), () async {
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
      await _omPlayer.play(AssetSource('audio/om-chant-10s.mp3'));
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
            colors: [Color(0xFFF8F3EB), Color(0xFFF0E6D8), AppColors.maroonDeep],
            stops: [0.0, 0.72, 1.0],
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
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.maroon.withValues(alpha: 0.12),
                            blurRadius: 28,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.asset(
                          _logoAsset,
                          width: 300,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'Divine essentials, delivered',
                      style: TextStyle(
                        fontSize: 14,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w600,
                        color: AppColors.maroon.withValues(alpha: 0.85),
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
                            final scale =
                                1 + (phase < 0.5 ? phase : 1 - phase) * 0.8;
                            final opacity =
                                0.4 + (1 - (phase - 0.5).abs() * 2) * 0.6;
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3.5),
                              width: 8 * scale,
                              height: 8 * scale,
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(
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
            ),
          ],
        ),
      ),
    );
  }
}
