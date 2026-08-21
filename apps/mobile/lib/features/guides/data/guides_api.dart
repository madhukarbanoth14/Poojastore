import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final guidesApiProvider = Provider(
  (ref) => GuidesApi(ref.watch(apiClientProvider)),
);

class GuidesApi {
  GuidesApi(this._api);

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listVrats() async {
    final res = await _api.dio.get('/vrats');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> upcomingVrats() async {
    final res = await _api.dio.get('/vrats/upcoming');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> vratDetail(String slug) async {
    final res = await _api.dio.get('/vrats/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> setVratReminder(
    String slug, {
    int remindDaysBefore = 1,
    bool enabled = true,
  }) async {
    await _api.dio.put(
      '/vrats/$slug/reminder',
      data: {
        'remindDaysBefore': remindDaysBefore,
        'enabled': enabled,
      },
    );
  }

  Future<List<Map<String, dynamic>>> listPrasad({String? festival}) async {
    final res = await _api.dio.get(
      '/prasad',
      queryParameters: {if (festival != null) 'festival': festival},
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> prasadDetail(String slug) async {
    final res = await _api.dio.get('/prasad/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> addPrasadToCart(String productId) async {
    await _api.dio.post(
      '/cart/items',
      data: {'productId': productId, 'quantity': 1},
    );
  }
}
