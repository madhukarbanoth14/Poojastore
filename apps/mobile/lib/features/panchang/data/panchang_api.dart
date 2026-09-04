import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final panchangApiProvider = Provider(
  (ref) => PanchangApi(ref.watch(apiClientProvider)),
);

class PanchangApi {
  PanchangApi(this._api);

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> cities() async {
    final res = await _api.dio.get('/panchang/cities');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> today({String? city}) async {
    final res = await _api.dio.get(
      '/panchang/today',
      queryParameters: {if (city != null) 'city': city},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> forDate(String date, {String? city}) async {
    final res = await _api.dio.get(
      '/panchang/$date',
      queryParameters: {if (city != null) 'city': city},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> calendar({
    required int year,
    required int month,
    String? city,
  }) async {
    final res = await _api.dio.get(
      '/panchang/calendar',
      queryParameters: {
        'year': year,
        'month': month,
        if (city != null) 'city': city,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>?> getBirthProfile() async {
    try {
      final res = await _api.dio.get('/profile/birth');
      return res.data['data'] as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> saveBirthProfile(Map<String, dynamic> body) async {
    final res = await _api.dio.put('/profile/birth', data: body);
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> guidanceToday() async {
    final res = await _api.dio.get('/guidance/today');
    return res.data['data'] as Map<String, dynamic>;
  }
}
