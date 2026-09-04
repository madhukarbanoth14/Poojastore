import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class NotificationsApi {
  NotificationsApi(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> list() async {
    final res = await _api.dio.get('/notifications');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> markRead(String id) async {
    await _api.dio.patch('/notifications/$id/read');
  }

  Future<void> markAllRead() async {
    await _api.dio.patch('/notifications/read-all');
  }

  Future<void> registerPushToken({
    required String token,
    required String platform,
    String? deviceId,
  }) async {
    await _api.dio.post(
      '/devices/push-token',
      data: {
        'token': token,
        'platform': platform,
        if (deviceId != null && deviceId.isNotEmpty) 'deviceId': deviceId,
      },
    );
  }

  Future<void> removePushToken(String token) async {
    await _api.dio.delete(
      '/devices/push-token',
      data: {'token': token},
      options: Options(contentType: Headers.jsonContentType),
    );
  }
}
