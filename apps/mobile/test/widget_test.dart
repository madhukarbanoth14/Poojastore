import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pooja_store_mobile/app.dart';

void main() {
  testWidgets('app boots to login when unauthenticated', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: PoojaStoreApp()));
    await tester.pumpAndSettle();
    expect(find.text('Pooja Store'), findsWidgets);
    expect(find.text('Send OTP'), findsOneWidget);
  });
}
