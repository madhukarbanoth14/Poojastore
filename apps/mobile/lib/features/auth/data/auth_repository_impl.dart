import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../domain/auth_repository.dart';
import '../domain/auth_user.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._api, {FlutterSecureStorage? storage})
      : _storage = storage ?? secureStorage;

  final ApiClient _api;
  final FlutterSecureStorage _storage;

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
        if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
        'deviceId': 'flutter-mobile',
      },
    );
    return _sessionFromResponse(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<AuthSession> register({
    required String email,
    required String password,
    required String countryCode,
    required String phone,
    String? fullName,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'countryCode': countryCode,
        'phone': phone,
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
    String? subject,
    String? idToken,
    String? email,
    String? fullName,
    String? preferredLanguage,
  }) async {
    final response = await _api.dio.post(
      '/auth/social',
      data: {
        'provider': provider,
        if (subject != null && subject.isNotEmpty) 'subject': subject,
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
  Future<AuthUser> me() async {
    final response = await _api.dio.get('/auth/me');
    return AuthUser.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  @override
  Future<void> updatePreferredLanguage(String language) async {
    await _api.dio.patch('/auth/me', data: {'preferredLanguage': language});
  }

  @override
  Future<AuthUser> updateProfile({String? fullName, String? email, String? phone}) async {
    final response = await _api.dio.patch(
      '/auth/me',
      data: {
        if (fullName != null) 'fullName': fullName,
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
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
      return await me().timeout(const Duration(seconds: 8));
    } on DioException {
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      return null;
    } on TimeoutException {
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
