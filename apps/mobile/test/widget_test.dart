import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pooja_store_mobile/app.dart';
import 'package:pooja_store_mobile/features/auth/presentation/auth_controller.dart';

class _TestAuthController extends StateNotifier<AuthState> {
  _TestAuthController() : super(const AuthState(bootstrapping: false));
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
  testWidgets('app boots to login when unauthenticated', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith((ref) => _TestAuthController()),
        ],
        child: const PoojaStoreApp(),
      ),
    );
    await tester.pump();

    // Splash repeats animations forever — avoid pumpAndSettle; advance its timer.
    await tester.pump(const Duration(milliseconds: 2500));
    await tester.pump();

    if (find.text('Skip').evaluate().isNotEmpty) {
      await tester.tap(find.text('Skip'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    }

    await _pumpUntilFound(tester, find.text('Send OTP'));

    expect(find.text('Pooja Store'), findsWidgets);
    expect(find.text('Send OTP'), findsOneWidget);
  });
}
