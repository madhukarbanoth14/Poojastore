import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pooja_store_mobile/app.dart';
import 'package:pooja_store_mobile/features/auth/domain/auth_repository.dart';
import 'package:pooja_store_mobile/features/auth/domain/auth_user.dart';
import 'package:pooja_store_mobile/features/auth/presentation/auth_controller.dart';
import 'package:pooja_store_mobile/features/onboarding/onboarding_screen.dart';

class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AuthUser?> restoreSession() async => null;

  @override
  Future<String?> requestOtp({
    required String countryCode,
    required String phone,
  }) async =>
      null;

  @override
  Future<AuthSession> verifyOtp({
    required String countryCode,
    required String phone,
    required String code,
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

Future<void> _pumpUntilFound(
  WidgetTester tester,
  Finder finder, {
  int maxSteps = 40,
  Duration step = const Duration(milliseconds: 200),
}) async {
  for (var i = 0; i < maxSteps; i++) {
    await tester.pump(step);
    if (finder.evaluate().isNotEmpty) return;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({kOnboardingDoneKey: '1'});
  });

  testWidgets('app boots to login when unauthenticated', (tester) async {
    tester.view.physicalSize = const Size(400, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWith((ref) => _FakeAuthRepository()),
        ],
        child: const PoojaStoreApp(),
      ),
    );
    await tester.pump();
    await tester.pump();

    // Splash repeats animations forever — avoid pumpAndSettle; advance its timer.
    await tester.pump(const Duration(milliseconds: 2500));
    await tester.pump();

    await _pumpUntilFound(tester, find.text('Send OTP'));

    expect(find.text('Pooja Store'), findsWidgets);
    expect(find.text('Send OTP'), findsOneWidget);
  });
}
