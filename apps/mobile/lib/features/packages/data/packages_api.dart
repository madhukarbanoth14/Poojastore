import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final packagesApiProvider = Provider(
  (ref) => PackagesApi(ref.watch(apiClientProvider)),
);

class PackagesApi {
  PackagesApi(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> list() async {
    final res = await _api.dio.get('/packages');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> detail(String slug) async {
    final res = await _api.dio.get('/packages/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> book({
    required String slug,
    required String addressId,
    required bool includeKit,
    required bool includePriest,
    required bool includePrasad,
    String? priestSlotId,
    String? serviceName,
    String? notes,
    List<String> addonSlugs = const [],
  }) async {
    final res = await _api.dio.post(
      '/packages/$slug/book',
      data: {
        'addressId': addressId,
        'includeKit': includeKit,
        'includePriest': includePriest,
        'includePrasad': includePrasad,
        if (priestSlotId != null) 'priestSlotId': priestSlotId,
        if (serviceName != null) 'serviceName': serviceName,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        'addonSlugs': addonSlugs,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> myBookings() async {
    final res = await _api.dio.get('/package-bookings');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> cancelBooking(
    String id, {
    String? reason,
  }) async {
    final res = await _api.dio.post(
      '/package-bookings/$id/cancel',
      data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> mockConfirmPayment(String paymentId) async {
    if (!AppConfig.allowMockPayments) {
      throw StateError(
        'Mock payment confirm is disabled. Use live gateway checkout.',
      );
    }
    await _api.dio.post('/payments/$paymentId/mock-confirm');
  }

  Future<List<Map<String, dynamic>>> listAddresses() async {
    final res = await _api.dio.get('/addresses');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> createAddress(Map<String, dynamic> body) async {
    final res = await _api.dio.post('/addresses', data: body);
    return res.data['data'] as Map<String, dynamic>;
  }
}
