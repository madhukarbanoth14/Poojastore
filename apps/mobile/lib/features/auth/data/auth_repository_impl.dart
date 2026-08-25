import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/api_client.dart';
import '../domain/auth_repository.dart';
import '../domain/auth_user.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._api, {FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  final ApiClient _api;
  final FlutterSecureStorage _storage;

  @override
  Future<String?> requestOtp({
    required String countryCode,
    required String phone,
  }) async {
    final response = await _api.dio.post(
      '/auth/otp/request',
      data: {'countryCode': countryCode, 'phone': phone},
    );
    final data = response.data['data'] as Map<String, dynamic>;
    return data['debugOtp'] as String?;
  }

  @override
  Future<AuthSession> verifyOtp({
    required String countryCode,
    required String phone,
    required String code,
    String? fullName,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/otp/verify',
      data: {
        'countryCode': countryCode,
        'phone': phone,
        'code': code,
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
        'deviceId': 'flutter-mobile',
      },
    );
    return _sessionFromResponse(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<AuthSession> socialLogin({
    required String provider,
    required String subject,
    String? idToken,
    String? email,
    String? fullName,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/social',
      data: {
        'provider': provider,
        'subject': subject,
        if (idToken != null && idToken.isNotEmpty) 'idToken': idToken,
        if (email != null && email.isNotEmpty) 'email': email,
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
        'deviceId': 'flutter-mobile',
      },
    );
    return _sessionFromResponse(response.data['data'] as Map<String, dynamic>);
  }

  Future<AuthSession> _sessionFromResponse(Map<String, dynamic> data) async {
    final tokens = data['tokens'] as Map<String, dynamic>;
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await _persistTokens(
      accessToken: tokens['accessToken'] as String,
      refreshToken: tokens['refreshToken'] as String,
    );
    return AuthSession(
      accessToken: tokens['accessToken'] as String,
      refreshToken: tokens['refreshToken'] as String,
      user: user,
    );
  }

  @override
  Future<AuthSession> socialLogin({
    required String provider,
    String? idToken,
    bool demo = false,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/social',
      data: {
        'provider': provider,
        if (idToken != null && idToken.isNotEmpty) 'idToken': idToken,
        if (demo) 'demo': true,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
        'deviceId': 'flutter-mobile',
      },
    );
    final data = response.data['data'] as Map<String, dynamic>;
    final tokens = data['tokens'] as Map<String, dynamic>;
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await _persistTokens(
      accessToken: tokens['accessToken'] as String,
      refreshToken: tokens['refreshToken'] as String,
    );
    return AuthSession(
      accessToken: tokens['accessToken'] as String,
      refreshToken: tokens['refreshToken'] as String,
      user: user,
    );
  }

  @override
  Future<AuthUser> me() async {
    final response = await _api.dio.get('/auth/me');
    return AuthUser.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<void> updatePreferredLanguage(String language) async {
    await _api.dio.patch('/auth/me', data: {'preferredLanguage': language});
  }

  @override
  Future<AuthUser> updateProfile({String? fullName, String? email}) async {
    final response = await _api.dio.patch(
      '/auth/me',
      data: {
        if (fullName != null) 'fullName': fullName,
        if (email != null && email.isNotEmpty) 'email': email,
      },
    );
    return AuthUser.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<void> logout() async {
    final refresh = await _storage.read(key: 'refresh_token');
    try {
      await _api.dio.post(
        '/auth/logout',
        data: {if (refresh != null) 'refreshToken': refresh},
      );
    } on DioException {
      // Local logout still clears credentials.
    }
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  @override
  Future<AuthUser?> restoreSession() async {
    final token = await _storage.read(key: 'access_token');
    if (token == null || token.isEmpty) return null;
    try {
      return await me();
    } on DioException {
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      return null;
    }
  }

  Future<void> _persistTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }
}
