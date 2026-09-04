import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/language_switcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/diya_mark.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../l10n/l10n.dart';
import 'auth_controller.dart';
import 'social_sign_in.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;
  bool _finishingLogin = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (ref.read(authControllerProvider).isAuthenticated) {
        _finishLogin();
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _finishLogin() {
    if (!mounted || _finishingLogin) return;
    if (!ref.read(authControllerProvider).isAuthenticated) return;
    _finishingLogin = true;

    final next = GoRouterState.of(context).uri.queryParameters['next'];
    if (next != null && next.isNotEmpty) {
      context.go(next);
      return;
    }
    if (context.canPop()) {
      context.pop(true);
    } else {
      context.go('/');
    }
  }

  Future<void> _signIn() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.signInValidation)),
      );
      return;
    }
    await ref.read(authControllerProvider.notifier).login(
          email: email,
          password: password,
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (previous?.isAuthenticated != true && next.isAuthenticated) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _finishLogin());
      }
    });

    final auth = ref.watch(authControllerProvider);
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          MaroonGradient(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (context.canPop()) {
                            context.pop();
                          } else {
                            context.go('/');
                          }
                        },
                        icon: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          color: AppColors.cream,
                          size: 18,
                        ),
                        tooltip: 'Back',
                      ),
                      const Spacer(),
                    ],
                  ),
                  const GarlandDots(alignStart: true),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const DiyaOrb(size: 52),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.appTitle,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 20,
                                color: AppColors.cream,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              l10n.loginHeaderSubtitle,
                              style: const TextStyle(
                                fontSize: 12.5,
                                color: Color(0xBFFBF0DC),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const LanguageSwitcher(
                        compact: true,
                        iconColor: AppColors.cream,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(26, 30, 26, 24),
              children: [
                Text(
                  l10n.welcome,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 20,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  l10n.loginWelcomeSubtitle,
                  style: const TextStyle(fontSize: 13.5, color: AppColors.textMuted),
                ),
                const SizedBox(height: 26),
                _LabeledField(
                  label: l10n.emailLabel,
                  controller: _emailController,
                  hint: l10n.emailHint,
                  keyboardType: TextInputType.emailAddress,
                  autofill: AutofillHints.email,
                ),
                const SizedBox(height: 14),
                _LabeledField(
                  label: l10n.passwordLabel,
                  controller: _passwordController,
                  hint: l10n.passwordHint,
                  obscure: _obscure,
                  autofill: AutofillHints.password,
                  suffix: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TerracottaButton(
                  label: l10n.signInButton,
                  onPressed: _signIn,
                  loading: auth.loading,
                ),
                if (auth.error != null) ...[
                  const SizedBox(height: 12),
                  Text(auth.error!, style: const TextStyle(color: Colors.redAccent)),
                ],
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    final next = GoRouterState.of(context).uri.queryParameters['next'];
                    context.push(next != null && next.isNotEmpty ? '/signup?next=$next' : '/signup');
                  },
                  child: Text(
                    l10n.noAccountSignUp,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Expanded(child: Divider(color: AppColors.inputBorder)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        l10n.orContinueWith,
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ),
                    const Expanded(child: Divider(color: AppColors.inputBorder)),
                  ],
                ),
                const SizedBox(height: 18),
                OutlinedButton(
                  onPressed: auth.loading ? null : () => continueWithGoogle(ref, context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.text,
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: AppColors.inputBorder),
                    minimumSize: const Size.fromHeight(50),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const _GoogleDot(),
                      const SizedBox(width: 10),
                      Text(
                        l10n.continueWithGoogle,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: auth.loading ? null : () => continueWithApple(ref, context),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF221013),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(50),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.apple, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        l10n.continueWithApple,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.push('/poojari/apply'),
                  child: Text(
                    l10n.pujariApplyPrompt,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.maroonDeep,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.termsPrivacyAgreement,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textMuted,
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({
    required this.label,
    required this.controller,
    required this.hint,
    this.keyboardType,
    this.obscure = false,
    this.autofill,
    this.suffix,
  });

  final String label;
  final TextEditingController controller;
  final String hint;
  final TextInputType? keyboardType;
  final bool obscure;
  final String? autofill;
  final Widget? suffix;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscure,
          autofillHints: autofill == null ? null : [autofill!],
          decoration: InputDecoration(
            hintText: hint,
            suffixIcon: suffix,
          ),
        ),
      ],
    );
  }
}

class _GoogleDot extends StatelessWidget {
  const _GoogleDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 17,
      height: 17,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: SweepGradient(
          colors: [
            Color(0xFF4285F4),
            Color(0xFFEA4335),
            Color(0xFFFBBC05),
            Color(0xFF34A853),
            Color(0xFF4285F4),
          ],
        ),
      ),
    );
  }
}
