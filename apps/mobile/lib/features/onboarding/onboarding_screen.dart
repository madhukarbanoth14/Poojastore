import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../l10n/l10n.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/ps_widgets.dart';

const kOnboardingDoneKey = 'ps_onboarding_done';

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
    context.go('/');
  }

  void _next() {
    final slideCount = _slideCount(context);
    if (_index >= slideCount - 1) {
      _finish();
      return;
    }
    setState(() => _index++);
  }

  int _slideCount(BuildContext context) => 4;

  ({String title, String desc, String label}) _slideAt(
    BuildContext context,
    int index,
  ) {
    final l10n = context.l10n;
    return switch (index) {
      0 => (
          title: l10n.onboardingSlide1Title,
          desc: l10n.onboardingSlide1Desc,
          label: l10n.onboardingSlide1Label,
        ),
      1 => (
          title: l10n.onboardingSlide2Title,
          desc: l10n.onboardingSlide2Desc,
          label: l10n.onboardingSlide2Label,
        ),
      2 => (
          title: l10n.onboardingSlide3Title,
          desc: l10n.onboardingSlide3Desc,
          label: l10n.onboardingSlide3Label,
        ),
      _ => (
          title: l10n.onboardingSlide4Title,
          desc: l10n.onboardingSlide4Desc,
          label: l10n.onboardingSlide4Label,
        ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slideAt(context, _index);
    final slideCount = _slideCount(context);
    final last = _index == slideCount - 1;
    final t = context.ps;
    final l10n = context.l10n;

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
                    l10n.skip,
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
                    children: List.generate(slideCount, (i) {
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
                    label: last ? l10n.getStarted : l10n.next,
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
