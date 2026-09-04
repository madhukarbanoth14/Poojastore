import 'dart:io';

import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';

class SamagriScanApi {
  SamagriScanApi(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> scanText(String text) async {
    final res = await _api.dio.post(
      '/samagri-scan/text',
      data: {'text': text},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> scanImage(File file) async {
    final fileName = file.path.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        file.path,
        filename: fileName.isEmpty ? 'poojari-list.jpg' : fileName,
      ),
    });
    final res = await _api.dio.post(
      '/samagri-scan/image',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> listSavedLists() async {
    final res = await _api.dio.get('/samagri-scan/saved-lists');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> loadSavedList(String id) async {
    final res = await _api.dio.get('/samagri-scan/saved-lists/$id');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> saveList({
    required String title,
    String? rawText,
    required List<Map<String, dynamic>> items,
  }) async {
    final res = await _api.dio.post(
      '/samagri-scan/saved-lists',
      data: {
        'title': title,
        if (rawText != null && rawText.isNotEmpty) 'rawText': rawText,
        'items': items,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> deleteSavedList(String id) async {
    await _api.dio.delete('/samagri-scan/saved-lists/$id');
  }

  Future<List<Map<String, dynamic>>> listReceivedLists() async {
    final res = await _api.dio.get('/samagri-scan/received-lists');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> loadReceivedList(String id) async {
    final res = await _api.dio.get('/samagri-scan/received-lists/$id');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> listSentForBooking(String bookingId) async {
    final res = await _api.dio.get(
      '/poojari/samagri-lists',
      queryParameters: {'bookingId': bookingId},
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> sendPoojariListFromText({
    required String bookingId,
    required String text,
    String? title,
  }) async {
    final res = await _api.dio.post(
      '/poojari/samagri-lists/from-text',
      data: {
        'bookingId': bookingId,
        'text': text,
        if (title != null && title.isNotEmpty) 'title': title,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendPoojariListFromItems({
    required String bookingId,
    required List<Map<String, dynamic>> items,
    String? title,
    String? rawText,
  }) async {
    final res = await _api.dio.post(
      '/poojari/samagri-lists/from-items',
      data: {
        'bookingId': bookingId,
        if (title != null && title.isNotEmpty) 'title': title,
        if (rawText != null && rawText.isNotEmpty) 'rawText': rawText,
        'items': items,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }
}
