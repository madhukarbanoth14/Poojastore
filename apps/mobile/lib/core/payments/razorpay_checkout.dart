import 'dart:async';

import 'package:razorpay_flutter/razorpay_flutter.dart';

class RazorpayPaymentResult {
  const RazorpayPaymentResult({
    required this.orderId,
    required this.paymentId,
    required this.signature,
    this.error,
  });

  factory RazorpayPaymentResult.failure(String message) {
    return RazorpayPaymentResult(
      orderId: '',
      paymentId: '',
      signature: '',
      error: message,
    );
  }

  final String orderId;
  final String paymentId;
  final String signature;
  final String? error;

  bool get isSuccess => error == null && paymentId.isNotEmpty;
}

class RazorpayCheckout {
  RazorpayCheckout._();

  static Future<RazorpayPaymentResult> open(Map<String, dynamic> payment) async {
    final meta = Map<String, dynamic>.from(
      (payment['metadata'] as Map?) ?? const {},
    );
    final key = meta['keyId'] as String?;
    final orderId = payment['providerOrderId'] as String?;
    if (key == null || key.isEmpty || orderId == null || orderId.isEmpty) {
      throw StateError('Razorpay session is missing key or order id');
    }

    final razorpay = Razorpay();
    final done = Completer<RazorpayPaymentResult>();

    void finish(RazorpayPaymentResult result) {
      if (!done.isCompleted) done.complete(result);
    }

    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, (PaymentSuccessResponse res) {
      finish(
        RazorpayPaymentResult(
          orderId: res.orderId ?? orderId,
          paymentId: res.paymentId ?? '',
          signature: res.signature ?? '',
        ),
      );
    });
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse res) {
      finish(
        RazorpayPaymentResult.failure(res.message ?? 'Payment was cancelled'),
      );
    });
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (_) {});

    razorpay.open({
      'key': key,
      'amount': meta['amount'] ?? payment['amountMinor'],
      'currency': meta['currency'] ?? payment['currency'] ?? 'INR',
      'name': meta['name'] ?? 'Pooja Store',
      'description': meta['description'] ?? 'Pooja Store order',
      'order_id': orderId,
      'prefill': meta['prefill'] ?? const {},
      'theme': {'color': '#6E1423'},
    });

    try {
      return await done.future;
    } finally {
      razorpay.clear();
    }
  }
}
