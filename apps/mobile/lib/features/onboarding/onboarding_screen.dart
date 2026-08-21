import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/ps_widgets.dart';

const kOnboardingDoneKey = 'ps_onboarding_done';

const _slides = [
  (
    title: 'Complete Pooja Kits',
    desc:
        'Order curated kits for every festival and family function — nothing missing, nothing extra.',
    label: 'FESTIVAL KIT',
  ),
  (
    title: 'Verified Poojaris',
    desc:
        'Book experienced, background-verified priests for home visits or online consultations.',
    label: 'POOJARI PORTRAIT',
  ),
  (
    title: 'Same-Day Delivery',
    desc:
        'Fresh flowers, agarbatti and ritual items from nearby pooja stores, delivered fast.',
    label: 'DELIVERY VAN',
  ),
  (
    title: 'Never Miss a Festival',
    desc:
        'Personalized reminders for every festival and auspicious date, right on time.',
    label: 'CALENDAR',
  ),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _index = 0;

  Future<void> _finish() async {
    const storage = FlutterSecureStorage();
    await storage.write(key: kOnboardingDoneKey, value: '1');
    if (!mounted) return;
    context.go('/login');
  }

  void _next() {
    if (_index >= _slides.length - 1) {
      _finish();
      return;
    }
    setState(() => _index++);
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_index];
    final last = _index == _slides.length - 1;
    final t = context.ps;

    return Scaffold(
      backgroundColor: t.bg,
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.only(top: 14),
              child: OnboardPetals(),
            ),
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 14, 22, 0),
                child: TextButton(
                  onPressed: _finish,
                  child: Text(
                    'Skip',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: t.textMuted,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 34),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AspectRatio(
                      aspectRatio: 1.3,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            return Stack(
                              fit: StackFit.expand,
                              children: [
                                StripeBlock(
                                  index: _index,
                                  height: constraints.maxHeight,
                                ),
                                Center(
                                  child: Text(
                                    slide.label,
                                    style: TextStyle(
                                      fontSize: 12,
                                      letterSpacing: 1,
                                      color: t.maroon.withValues(alpha: 0.55),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      slide.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 23,
                        color: t.text,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      slide.desc,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: t.textMuted,
                        height: 1.55,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(30, 0, 30, 40),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_slides.length, (i) {
                      final active = i == _index;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 3.5),
                        width: active ? 22 : 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: active ? t.saffron : t.border,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  PsSaffronButton(
                    label: last ? 'Get Started' : 'Next',
                    onPressed: _next,
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
