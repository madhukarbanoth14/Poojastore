import { ConfigService } from '@nestjs/config';

function firstNonEmpty(values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim() ?? '';
    if (trimmed) return trimmed;
  }
  return '';
}

export function razorpayKeyId(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.razorpay.keyId'),
    config.get<string>('RAZORPAY_KEY_ID'),
    process.env.RAZORPAY_KEY_ID,
  ]);
}

export function razorpayKeySecret(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.razorpay.keySecret'),
    config.get<string>('RAZORPAY_KEY_SECRET'),
    process.env.RAZORPAY_KEY_SECRET,
  ]);
}

export function razorpayWebhookSecret(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.razorpay.webhookSecret'),
    config.get<string>('RAZORPAY_WEBHOOK_SECRET'),
    process.env.RAZORPAY_WEBHOOK_SECRET,
  ]);
}

export function razorpayConfigured(config: ConfigService): boolean {
  return Boolean(razorpayKeyId(config) && razorpayKeySecret(config));
}

export function stripeSecretKey(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.stripe.secretKey'),
    config.get<string>('STRIPE_SECRET_KEY'),
    process.env.STRIPE_SECRET_KEY,
  ]);
}

export function stripeWebhookSecret(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.stripe.webhookSecret'),
    config.get<string>('STRIPE_WEBHOOK_SECRET'),
    process.env.STRIPE_WEBHOOK_SECRET,
  ]);
}

export function upiVpa(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.upi.vpa'),
    config.get<string>('UPI_VPA'),
    process.env.UPI_VPA,
  ]);
}

export function upiPayeeName(config: ConfigService): string {
  return (
    firstNonEmpty([
      config.get<string>('payments.upi.payeeName'),
      config.get<string>('UPI_PAYEE_NAME'),
      process.env.UPI_PAYEE_NAME,
    ]) || 'Pavitra Seva'
  );
}

export function upiQrImageUrl(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.upi.qrImageUrl'),
    config.get<string>('UPI_QR_IMAGE_URL'),
    process.env.UPI_QR_IMAGE_URL,
  ]);
}

export function upiConfigured(config: ConfigService): boolean {
  return Boolean(upiVpa(config) || upiQrImageUrl(config));
}

export function payuMerchantKey(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.payu.merchantKey'),
    config.get<string>('PAYU_MERCHANT_KEY'),
    process.env.PAYU_MERCHANT_KEY,
  ]);
}

export function payuMerchantSalt(config: ConfigService): string {
  return firstNonEmpty([
    config.get<string>('payments.payu.merchantSalt'),
    config.get<string>('PAYU_MERCHANT_SALT'),
    process.env.PAYU_MERCHANT_SALT,
  ]);
}

export function payuMode(config: ConfigService): 'test' | 'live' {
  const raw = firstNonEmpty([
    config.get<string>('payments.payu.mode'),
    config.get<string>('PAYU_MODE'),
    process.env.PAYU_MODE,
  ]).toLowerCase();
  return raw === 'live' ? 'live' : 'test';
}

export function payuConfigured(config: ConfigService): boolean {
  return Boolean(payuMerchantKey(config) && payuMerchantSalt(config));
}

/** India checkout uses PayU whenever merchant key + salt are set. */
export function payuEnabled(config: ConfigService): boolean {
  return payuConfigured(config);
}

export function payuPaymentUrl(config: ConfigService): string {
  return payuMode(config) === 'live'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';
}

export function payuPostserviceUrl(config: ConfigService): string {
  return payuMode(config) === 'live'
    ? 'https://info.payu.in/merchant/postservice.php?form=2'
    : 'https://test.payu.in/merchant/postservice.php?form=2';
}
