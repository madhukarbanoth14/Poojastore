import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import '../../../core/config/app_config.dart';
import '../../../core/theme/app_theme.dart';
import 'auth_controller.dart';

bool get showAppleSignInButton =>
    !kIsWeb && defaultTargetPlatform == TargetPlatform.iOS;

class AppleSignInButton extends StatelessWidget {
  const AppleSignInButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.enabled = true,
  });

  final String label;
  final VoidCallback onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: enabled ? onPressed : null,
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.text,
        backgroundColor: Colors.white,
        side: const BorderSide(color: AppColors.inputBorder),
        minimumSize: const Size.fromHeight(50),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.apple, size: 22),
          const SizedBox(width: 10),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5),
          ),
        ],
      ),
    );
  }
}

bool _googleReady = false;

Future<void> continueWithGoogle(WidgetRef ref, BuildContext context) async {
  final auth = ref.read(authControllerProvider.notifier);
  try {
    if (!_googleReady) {
      await GoogleSignIn.instance.initialize(
        serverClientId: AppConfig.googleServerClientId.isEmpty
            ? null
            : AppConfig.googleServerClientId,
      );
      _googleReady = true;
    }
    if (!GoogleSignIn.instance.supportsAuthenticate()) {
      throw StateError('Google Sign-In is not supported on this device');
    }
    final account = await GoogleSignIn.instance.authenticate(
      scopeHint: const ['email', 'profile'],
    );
    await auth.socialLogin(
      provider: 'GOOGLE',
      idToken: account.authentication.idToken,
      subject: account.id,
      email: account.email,
      fullName: account.displayName,
    );
  } on GoogleSignInException catch (e) {
    if (e.code == GoogleSignInExceptionCode.canceled) return;
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          AppConfig.allowDemoSocial
              ? 'Google Sign-In failed. Configure GOOGLE_SERVER_CLIENT_ID or use email and password.'
              : 'Google Sign-In is not configured. Use email and password.',
        ),
      ),
    );
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Google Sign-In failed. Use email and password.')),
    );
  }
}

Future<void> continueWithApple(WidgetRef ref, BuildContext context) async {
  final auth = ref.read(authControllerProvider.notifier);
  try {
    final available = await SignInWithApple.isAvailable();
    if (!available) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Apple Sign-In is not available on this device.')),
      );
      return;
    }
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    final given = credential.givenName;
    final family = credential.familyName;
    final fullName = [given, family].whereType<String>().join(' ').trim();
    await auth.socialLogin(
      provider: 'APPLE',
      idToken: credential.identityToken,
      subject: credential.userIdentifier,
      email: credential.email,
      fullName: fullName.isEmpty ? null : fullName,
    );
  } on SignInWithAppleAuthorizationException catch (e) {
    if (e.code == AuthorizationErrorCode.canceled) return;
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Apple Sign-In failed. Use email and password.')),
    );
  }
}
