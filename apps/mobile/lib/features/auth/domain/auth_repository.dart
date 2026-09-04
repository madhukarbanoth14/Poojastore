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
  Future<AuthSession> login({
    required String email,
    required String password,
    String? preferredLanguage,
  });

  Future<AuthSession> register({
    required String email,
    required String password,
    required String countryCode,
    required String phone,
    String? fullName,
    String? preferredLanguage,
  });

  Future<AuthSession> socialLogin({
    required String provider,
    String? subject,
    String? idToken,
    String? email,
    String? fullName,
    String? preferredLanguage,
  });

  Future<void> updatePreferredLanguage(String language);

  Future<AuthUser> updateProfile({String? fullName, String? email});

  Future<AuthUser> me();

  Future<void> logout();

  Future<AuthUser?> restoreSession();
}
