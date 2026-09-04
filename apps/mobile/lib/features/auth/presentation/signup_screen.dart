import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/i18n/language_switcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/diya_mark.dart';
import '../../../core/widgets/pp_ui.dart';
import '../../../l10n/l10n.dart';
import 'auth_controller.dart';
import 'social_sign_in.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  String _countryCode = '91';
  bool _obscure = true;
  bool _finishing = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _finish() {
    if (!mounted || _finishing) return;
    if (!ref.read(authControllerProvider).isAuthenticated) return;
    _finishing = true;
    final next = GoRouterState.of(context).uri.queryParameters['next'];
    if (next != null && next.isNotEmpty) {
      context.go(next);
      return;
    }
    context.go('/');
  }

  Future<void> _createAccount() async {
    final l10n = context.l10n;
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final phone = _phoneController.text.trim();
    if (email.isEmpty || password.length < 8 || phone.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.signUpValidation)),
      );
      return;
    }
    await ref.read(authControllerProvider.notifier).register(
          email: email,
          password: password,
          countryCode: _countryCode,
          phone: phone,
          fullName: _nameController.text.trim().isEmpty
              ? null
              : _nameController.text.trim(),
        );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (previous?.isAuthenticated != true && next.isAuthenticated) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _finish());
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
                        onPressed: () => context.pop(),
                        icon: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          color: AppColors.cream,
                          size: 18,
                        ),
                      ),
                      const Spacer(),
                      const LanguageSwitcher(
                        compact: true,
                        iconColor: AppColors.cream,
                      ),
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
                              l10n.createAccountTitle,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 20,
                                color: AppColors.cream,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              l10n.createAccountSubtitle,
                              style: const TextStyle(
                                fontSize: 12.5,
                                color: Color(0xBFFBF0DC),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(26, 24, 26, 24),
              children: [
                _field(l10n.fullNameOptional, _nameController, l10n.fullNameOptional, TextInputType.name),
                const SizedBox(height: 14),
                _field(l10n.emailLabel, _emailController, l10n.emailHint, TextInputType.emailAddress),
                const SizedBox(height: 14),
                _field(
                  l10n.passwordLabel,
                  _passwordController,
                  l10n.passwordHint,
                  TextInputType.visiblePassword,
                  obscure: _obscure,
                  suffix: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  l10n.mobileNumberLabel,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    SizedBox(
                      width: 118,
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _countryCode,
                            items: const [
                              DropdownMenuItem(value: '91', child: Text('+91')),
                              DropdownMenuItem(value: '1', child: Text('+1')),
                            ],
                            onChanged: (v) => setState(() => _countryCode = v ?? '91'),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        decoration: InputDecoration(hintText: l10n.phoneHint),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TerracottaButton(
                  label: l10n.createAccountButton,
                  onPressed: _createAccount,
                  loading: auth.loading,
                ),
                if (auth.error != null) ...[
                  const SizedBox(height: 12),
                  Text(auth.error!, style: const TextStyle(color: Colors.redAccent)),
                ],
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => context.pop(),
                  child: Text(
                    l10n.haveAccountSignIn,
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
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: auth.loading ? null : () => continueWithGoogle(ref, context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.text,
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: AppColors.inputBorder),
                    minimumSize: const Size.fromHeight(50),
                  ),
                  child: Text(l10n.continueWithGoogle, style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: auth.loading ? null : () => continueWithApple(ref, context),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF221013),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(50),
                  ),
                  child: Text(l10n.continueWithApple, style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController controller,
    String hint,
    TextInputType type, {
    bool obscure = false,
    Widget? suffix,
  }) {
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
          keyboardType: type,
          obscureText: obscure,
          decoration: InputDecoration(hintText: hint, suffixIcon: suffix),
        ),
      ],
    );
  }
}
