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
