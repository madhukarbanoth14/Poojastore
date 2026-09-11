import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';

class MarketplaceApi {
  MarketplaceApi(this._api);

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listKits({String market = 'IN'}) async {
    final res = await _api.dio.get(
      '/products',
      queryParameters: {'market': market, 'type': 'PUJA_KIT'},
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listFestivalKits({String market = 'IN'}) async {
    final res = await _api.dio.get(
      '/products',
      queryParameters: {
        'market': market,
        'catalog': 'pooja-samagri',
        'type': 'PUJA_KIT',
      },
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<List<Map<String, dynamic>>> listSamagri({String market = 'IN'}) async {
    final res = await _api.dio.get(
      '/products',
      queryParameters: {'market': market, 'catalog': 'pooja-samagri'},
    );
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> kitDetail(String slug) async {
    final res = await _api.dio.get('/products/$slug');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCart() async {
    final res = await _api.dio.get('/cart');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addToCart(
    String productId, {
    int qty = 1,
    List<String>? selectedItemKeys,
    bool replace = false,
  }) async {
    final res = await _api.dio.post(
      '/cart/items',
      data: {
        'productId': productId,
        'quantity': qty,
        if (selectedItemKeys != null) 'selectedItemKeys': selectedItemKeys,
        if (replace) 'replace': true,
      },
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateCartItem(String productId, int qty) async {
    final res = await _api.dio.patch(
      '/cart/items/$productId',
      data: {'quantity': qty},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> removeCartItem(String productId) async {
    await _api.dio.delete('/cart/items/$productId');
  }

  Future<List<Map<String, dynamic>>> listAddresses() async {
    final res = await _api.dio.get('/addresses');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> createAddress(Map<String, dynamic> body) async {
    final res = await _api.dio.post('/addresses', data: body);
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> checkout(
    String shippingAddressId, {
    String? deliverySlot,
    String? contactPhone,
  }) async {
    final res = await _api.dio.post(
      '/orders/checkout',
      data: {
        'shippingAddressId': shippingAddressId,
        if (deliverySlot != null) 'deliverySlot': deliverySlot,
        if (contactPhone != null && contactPhone.isNotEmpty)
          'contactPhone': contactPhone,
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

  Future<void> verifyRazorpay({
    required String paymentId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    await _api.dio.post(
      '/payments/razorpay/verify',
      data: {
        'paymentId': paymentId,
        'razorpayOrderId': razorpayOrderId,
        'razorpayPaymentId': razorpayPaymentId,
        'razorpaySignature': razorpaySignature,
      },
    );
  }

  Future<void> submitUpiUtr({
    required String paymentId,
    required String utr,
    required int amountPaidMinor,
    String? screenshotBase64,
  }) async {
    await _api.dio.post(
      '/payments/$paymentId/upi-submit',
      data: {
        'utr': utr.trim(),
        'amountPaidMinor': amountPaidMinor,
        if (screenshotBase64 != null && screenshotBase64.isNotEmpty)
          'screenshotBase64': screenshotBase64,
      },
    );
  }

  Future<Map<String, dynamic>?> pendingPayment() async {
    final res = await _api.dio.get('/orders/pending-payment');
    return res.data['data'] as Map<String, dynamic>?;
  }

  Future<List<Map<String, dynamic>>> myOrders() async {
    final res = await _api.dio.get('/orders');
    return (res.data['data']['items'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> orderDetail(String id) async {
    final res = await _api.dio.get('/orders/$id');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelOrder(String id, {String? reason}) async {
    final res = await _api.dio.post(
      '/orders/$id/cancel',
      data: {if (reason != null) 'reason': reason},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> refundOrder(String id, {String? reason}) async {
    final res = await _api.dio.post(
      '/orders/$id/refund',
      data: {if (reason != null) 'reason': reason},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> returnOrder(String id, {String? reason}) async {
    final res = await _api.dio.post(
      '/orders/$id/return',
      data: {if (reason != null) 'reason': reason},
    );
    return res.data['data'] as Map<String, dynamic>;
  }
}
