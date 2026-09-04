import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  ApiClient({FlutterSecureStorage? storage, this.localeCode = 'en'})
      : _storage = storage ?? secureStorage,
        dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: const Duration(seconds: 8),
            receiveTimeout: const Duration(seconds: 12),
            sendTimeout: const Duration(seconds: 8),
            headers: {'Content-Type': 'application/json'},
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'access_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          options.headers['Accept-Language'] = localeCode;
          handler.next(options);
        },
      ),
    );
  }

  final Dio dio;
  final FlutterSecureStorage _storage;
  final String localeCode;
}
