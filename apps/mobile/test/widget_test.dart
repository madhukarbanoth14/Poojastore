import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pooja_store_mobile/core/theme/app_theme.dart';
import 'package:pooja_store_mobile/features/auth/domain/auth_repository.dart';
import 'package:pooja_store_mobile/features/auth/domain/auth_user.dart';
import 'package:pooja_store_mobile/features/auth/presentation/auth_controller.dart';
import 'package:pooja_store_mobile/features/auth/presentation/login_screen.dart';
import 'package:pooja_store_mobile/l10n/l10n.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AuthUser?> restoreSession() async => null;

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
    String? preferredLanguage,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthSession> register({
    required String email,
    required String password,
    required String countryCode,
    required String phone,
    String? fullName,
    String? preferredLanguage,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthSession> socialLogin({
    required String provider,
    String? subject,
    String? idToken,
    String? email,
    String? fullName,
    String? preferredLanguage,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> updatePreferredLanguage(String language) async {}

  @override
  Future<AuthUser> updateProfile({String? fullName, String? email}) async =>
      throw UnimplementedError();

  @override
  Future<AuthUser> me() async => throw UnimplementedError();

  @override
  Future<void> logout() async {}
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('login screen shows email sign-in when unauthenticated', (tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWith((ref) => _FakeAuthRepository()),
        ],
        child: MaterialApp(
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          theme: buildLightTheme(const Locale('en')),
          home: const LoginScreen(),
        ),
      ),
    );
    await tester.pump();
    await tester.pump();

    expect(find.text('Pavitra Seva'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.text('Continue with Apple'), findsOneWidget);
  });
}
