import 'auth_user.dart';

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final AuthUser user;
}

abstract class AuthRepository {
  Future<String?> requestOtp({
    required String countryCode,
    required String phone,
  });

  Future<AuthSession> verifyOtp({
    required String countryCode,
    required String phone,
    required String code,
    String? fullName,
    String? preferredLanguage,
  });

  Future<void> updatePreferredLanguage(String language);

  Future<AuthUser> updateProfile({String? fullName, String? email});

  Future<AuthUser> me();

  Future<void> logout();

  Future<AuthUser?> restoreSession();
}
