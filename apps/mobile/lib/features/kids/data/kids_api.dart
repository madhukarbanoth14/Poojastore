import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final kidsApiProvider = Provider(
  (ref) => KidsApi(ref.watch(apiClientProvider)),
);

class KidsApi {
  KidsApi(this._api);

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listStories({
    String? ageBand,
    String? language,
  }) async {
    final res = await _api.dio.get(
      '/kids/stories',
      queryParameters: {
        if (ageBand != null) 'ageBand': ageBand,
        if (language != null && language.isNotEmpty) 'language': language,
      },
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> story(String slug) async {
    final res = await _api.dio.get('/kids/stories/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> quiz(String slug) async {
    final res = await _api.dio.get('/kids/stories/$slug/quiz');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> completeStory(String slug) async {
    await _api.dio.post('/kids/stories/$slug/complete');
  }

  Future<Map<String, dynamic>> submitQuiz(
    String slug,
    List<Map<String, dynamic>> answers,
  ) async {
    final res = await _api.dio.post(
      '/kids/stories/$slug/quiz/submit',
      data: {'answers': answers},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> progress() async {
    final res = await _api.dio.get('/kids/progress');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }
}
