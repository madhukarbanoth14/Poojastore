import { ConfigService } from '@nestjs/config';
import {
  razorpayConfigured,
  razorpayKeyId,
  razorpayKeySecret,
} from './payment-credentials';

describe('razorpay credentials', () => {
  const originalId = process.env.RAZORPAY_KEY_ID;
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;

  afterEach(() => {
    if (originalId === undefined) delete process.env.RAZORPAY_KEY_ID;
    else process.env.RAZORPAY_KEY_ID = originalId;
    if (originalSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
    else process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  it('falls through empty nested config to process env', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_from_env';
    process.env.RAZORPAY_KEY_SECRET = 'secret_from_env';
    const config = {
      get: (key: string) => {
        if (
          key === 'payments.razorpay.keyId' ||
          key === 'payments.razorpay.keySecret'
        ) {
          return '';
        }
        return undefined;
      },
    } as ConfigService;

    expect(razorpayKeyId(config)).toBe('rzp_test_from_env');
    expect(razorpayKeySecret(config)).toBe('secret_from_env');
    expect(razorpayConfigured(config)).toBe(true);
  });

  it('prefers nested config when it is set', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_from_env';
    const config = {
      get: (key: string) =>
        key === 'payments.razorpay.keyId' ? 'rzp_test_nested' : undefined,
    } as ConfigService;

    expect(razorpayKeyId(config)).toBe('rzp_test_nested');
  });
});
