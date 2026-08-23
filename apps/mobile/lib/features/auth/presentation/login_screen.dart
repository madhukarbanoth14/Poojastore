import 'dart:async';
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

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  int _otpTimer = 30;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _otpTimer = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_otpTimer <= 1) {
        timer.cancel();
        setState(() => _otpTimer = 0);
        return;
      }
      setState(() => _otpTimer--);
    });
  }

  Future<void> _requestOtp() async {
    final ok = await ref.read(authControllerProvider.notifier).requestOtp(
          countryCode: '91',
          phone: _phoneController.text.trim(),
        );
    if (ok && mounted) {
      setState(() => _otpSent = true);
      _startTimer();
    }
  }

  Future<void> _verifyOtp() async {
    final ok = await ref.read(authControllerProvider.notifier).verifyOtp(
          countryCode: '91',
          phone: _phoneController.text.trim(),
          code: _otpController.text.trim(),
        );
    if (ok && mounted) context.go('/');
  }

  void _socialUnavailable() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Phone OTP is required to sign in.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          MaroonGradient(
            padding: const EdgeInsets.fromLTRB(28, 54, 28, 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const GarlandDots(alignStart: true),
                const SizedBox(height: 20),
                Row(
                  children: [
                    const DiyaOrb(size: 52),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pooja Panchang',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 20,
                              color: AppColors.cream,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Devotees and pujaris sign in with the same phone OTP',
                            style: TextStyle(
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
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(26, 30, 26, 24),
              child: _otpSent
                  ? _OtpStep(
                      phone: _phoneController.text.trim(),
                      otpController: _otpController,
                      loading: auth.loading,
                      error: auth.error,
                      debugOtp: auth.debugOtp,
                      otpTimer: _otpTimer,
                      onEdit: () {
                        _timer?.cancel();
                        setState(() => _otpSent = false);
                      },
                      onVerify: _verifyOtp,
                      onResend: auth.loading || _otpTimer > 0 ? null : _requestOtp,
                      l10n: l10n,
                    )
                  : _MobileStep(
                      phoneController: _phoneController,
                      loading: auth.loading,
                      error: auth.error,
                      onSend: _requestOtp,
                      onSocial: _socialUnavailable,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileStep extends StatelessWidget {
  const _MobileStep({
    required this.phoneController,
    required this.loading,
    required this.error,
    required this.onSend,
    required this.onSocial,
  });

  final TextEditingController phoneController;
  final bool loading;
  final String? error;
  final VoidCallback onSend;
  final VoidCallback onSocial;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Welcome',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 5),
        const Text(
          'Sign in to continue your seva',
          style: TextStyle(fontSize: 13.5, color: AppColors.textMuted),
        ),
        const SizedBox(height: 26),
        const Text(
          'MOBILE NUMBER',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.inputBorder),
          ),
          child: Row(
            children: [
              const Text(
                '+91',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.text,
                ),
              ),
              Container(
                width: 1,
                height: 18,
                margin: const EdgeInsets.symmetric(horizontal: 10),
                color: AppColors.inputBorder,
              ),
              Expanded(
                child: TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  decoration: const InputDecoration(
                    hintText: '98765 43210',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: EdgeInsets.symmetric(vertical: 11),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        TerracottaButton(label: 'Send OTP', onPressed: onSend, loading: loading),
        if (error != null) ...[
          const SizedBox(height: 12),
          Text(error!, style: const TextStyle(color: Colors.redAccent)),
        ],
        const SizedBox(height: 24),
        const Row(
          children: [
            Expanded(child: Divider(color: AppColors.inputBorder)),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                'or continue with',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ),
            Expanded(child: Divider(color: AppColors.inputBorder)),
          ],
        ),
        const SizedBox(height: 22),
        OutlinedButton(
          onPressed: onSocial,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.text,
            backgroundColor: Colors.white,
            side: const BorderSide(color: AppColors.inputBorder),
            minimumSize: const Size.fromHeight(50),
          ),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                _GoogleDot(),
                SizedBox(width: 10),
                Text(
                  'Continue with Google',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: onSocial,
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFF221013),
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(50),
          ),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 14,
                  height: 17,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Continue with Apple',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => context.push('/poojari/apply'),
          child: const Text(
            'Are you a pujari? Apply to join',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: AppColors.maroonDeep,
            ),
          ),
        ),
        const Spacer(),
        const Text(
          'By continuing you agree to our Terms of Service and Privacy Policy',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11.5,
            color: AppColors.textMuted,
            height: 1.6,
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

class _OtpStep extends StatelessWidget {
  const _OtpStep({
    required this.phone,
    required this.otpController,
    required this.loading,
    required this.error,
    required this.debugOtp,
    required this.otpTimer,
    required this.onEdit,
    required this.onVerify,
    required this.onResend,
    required this.l10n,
  });

  final String phone;
  final TextEditingController otpController;
  final bool loading;
  final String? error;
  final String? debugOtp;
  final int otpTimer;
  final VoidCallback onEdit;
  final VoidCallback onVerify;
  final VoidCallback? onResend;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Verify OTP',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.text,
          ),
        ),
        const SizedBox(height: 5),
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(
              'Sent to +91 ${phone.isEmpty ? '98765 43210' : phone} · ',
              style: const TextStyle(fontSize: 13.5, color: AppColors.textMuted),
            ),
            GestureDetector(
              onTap: onEdit,
              child: const Text(
                'Edit',
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.saffron,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        _OtpBoxes(controller: otpController),
        if (debugOtp != null) ...[
          const SizedBox(height: 10),
          Text(
            l10n.devOtp(debugOtp!),
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.saffron,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
        const SizedBox(height: 22),
        TerracottaButton(
          label: 'Verify & Continue',
          onPressed: onVerify,
          loading: loading,
        ),
        const SizedBox(height: 18),
        Text.rich(
          TextSpan(
            style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
            children: [
              const TextSpan(text: "Didn't receive the code? "),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: GestureDetector(
                  onTap: onResend,
                  child: Text(
                    otpTimer > 0
                        ? 'Resend in 00:${otpTimer.toString().padLeft(2, '0')}'
                        : 'Resend',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: onResend == null
                          ? AppColors.textMuted
                          : AppColors.saffron,
                    ),
                  ),
                ),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
        if (error != null) ...[
          const SizedBox(height: 12),
          Text(error!, style: const TextStyle(color: Colors.redAccent)),
        ],
      ],
    );
  }
}

class _OtpBoxes extends StatefulWidget {
  const _OtpBoxes({required this.controller});

  final TextEditingController controller;

  @override
  State<_OtpBoxes> createState() => _OtpBoxesState();
}

class _OtpBoxesState extends State<_OtpBoxes> {
  final _nodes = List.generate(6, (_) => FocusNode());
  final _fields = List.generate(6, (_) => TextEditingController());

  @override
  void dispose() {
    for (final n in _nodes) {
      n.dispose();
    }
    for (final c in _fields) {
      c.dispose();
    }
    super.dispose();
  }

  void _sync() {
    widget.controller.text = _fields.map((c) => c.text).join();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(6, (i) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: i == 5 ? 0 : 8),
            child: SizedBox(
              height: 58,
              child: TextField(
                controller: _fields[i],
                focusNode: _nodes[i],
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 1,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 20,
                  color: AppColors.text,
                ),
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  counterText: '',
                  contentPadding: EdgeInsets.zero,
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: AppColors.inputBorder,
                      width: 1.5,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: AppColors.inputBorder,
                      width: 1.5,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: AppColors.saffron,
                      width: 1.5,
                    ),
                  ),
                ),
                onChanged: (v) {
                  if (v.isNotEmpty && i < 5) {
                    _nodes[i + 1].requestFocus();
                  }
                  if (v.isEmpty && i > 0) {
                    _nodes[i - 1].requestFocus();
                  }
                  _sync();
                },
              ),
            ),
          ),
        );
      }),
    );
  }
}
