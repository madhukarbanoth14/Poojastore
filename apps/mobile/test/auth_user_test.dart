import 'package:flutter_test/flutter_test.dart';
import 'package:pooja_store_mobile/features/auth/domain/auth_user.dart';

void main() {
  test('parses auth user and detects admin', () {
    final user = AuthUser.fromJson({
      'id': 'u1',
      'phoneE164': '+919999999999',
      'role': 'ADMIN',
      'status': 'ACTIVE',
      'fullName': 'Platform Admin',
      'preferredLanguage': 'en',
    });

    expect(user.isAdmin, isTrue);
    expect(user.isPoojari, isFalse);
    expect(user.phoneE164, '+919999999999');
  });

  test('detects pujari role', () {
    final user = AuthUser.fromJson({
      'id': 'p1',
      'phoneE164': '+919888888888',
      'role': 'POOJARI',
      'status': 'ACTIVE',
    });
    expect(user.isPoojari, isTrue);
    expect(user.isAdmin, isFalse);
  });
}
