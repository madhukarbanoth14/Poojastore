import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../auth/presentation/auth_controller.dart';

final priestsApiProvider = Provider(
  (ref) => PriestsApi(ref.watch(apiClientProvider)),
);

class PriestsApi {
  PriestsApi(this._api);

  final ApiClient _api;

  Future<Map<String, dynamic>> applyAsPujari(Map<String, dynamic> body) async {
    final res = await _api.dio.post('/priests/applications', data: body);
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> list({String? city}) async {
    final res = await _api.dio.get(
      '/priests',
      queryParameters: {if (city != null) 'city': city},
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> detail(String slug) async {
    final res = await _api.dio.get('/priests/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> book({
    required String slug,
    required String slotId,
    required String addressId,
    required String serviceName,
    String? notes,
    String serviceMode = 'HOME_VISIT',
    String? consultationMedia,
  }) async {
    final res = await _api.dio.post(
      '/priests/$slug/bookings',
      data: {
        'slotId': slotId,
        'addressId': addressId,
        'serviceName': serviceName,
        'serviceMode': serviceMode,
        if (consultationMedia != null) 'consultationMedia': consultationMedia,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> bookingDetail(String id) async {
    final res = await _api.dio.get('/bookings/$id');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> poojariAppointments() async {
    final res = await _api.dio.get('/poojari/appointments');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinBooking(String id) async {
    final res = await _api.dio.post('/bookings/$id/join');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> joinPoojariMeeting(String id) async {
    final res = await _api.dio.post('/poojari/appointments/$id/join');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> myBookings() async {
    final res = await _api.dio.get('/bookings');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> cancelBooking(
    String id, {
    String? reason,
  }) async {
    final res = await _api.dio.post(
      '/bookings/$id/cancel',
      data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> rescheduleBooking(
    String id, {
    required String newSlotId,
    String? reason,
  }) async {
    final res = await _api.dio.post(
      '/bookings/$id/reschedule',
      data: {
        'newSlotId': newSlotId,
        if (reason != null && reason.isNotEmpty) 'reason': reason,
      },
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
