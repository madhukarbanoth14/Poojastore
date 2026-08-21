import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final vidhiApiProvider = Provider(
  (ref) => VidhiApi(ref.watch(apiClientProvider)),
);

class VidhiApi {
  VidhiApi(this._api);

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> list({
    String? category,
    String? q,
    String? language,
  }) async {
    final res = await _api.dio.get(
      '/vidhi',
      queryParameters: {
        if (category != null) 'category': category,
        if (q != null && q.isNotEmpty) 'q': q,
        if (language != null && language.isNotEmpty) 'language': language,
      },
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> detail(String slug) async {
    final res = await _api.dio.get('/vidhi/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }
}
