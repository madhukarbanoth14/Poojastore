import 'package:url_launcher/url_launcher.dart';

import '../../features/marketplace/data/marketplace_api.dart';
import 'razorpay_checkout.dart';

/// Completes MOCK / Razorpay / Stripe payment returned by checkout APIs.
Future<void> completePayment({
  required MarketplaceApi api,
  required Map<String, dynamic> payment,
}) async {
  final provider = payment['provider'] as String? ?? '';

  if (provider == 'MOCK') {
    await api.mockConfirmPayment(payment['id'] as String);
    return;
  }

  if (provider == 'RAZORPAY') {
    final result = await RazorpayCheckout.open(payment);
    if (!result.isSuccess) {
      throw StateError(result.error ?? 'Razorpay payment was not completed');
    }
    await api.verifyRazorpay(
      paymentId: payment['id'] as String,
      razorpayOrderId: result.orderId,
      razorpayPaymentId: result.paymentId,
      razorpaySignature: result.signature,
    );
    return;
  }

  if (provider == 'STRIPE') {
    final url = payment['checkoutUrl'] as String?;
    if (url == null || url.isEmpty) {
      throw StateError('Stripe checkout URL is missing');
    }
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    return;
  }

  throw StateError('Unsupported payment provider: $provider');
}
