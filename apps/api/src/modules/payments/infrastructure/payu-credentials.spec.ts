import { ConfigService } from '@nestjs/config';
import {
  payuEnabled,
  payuMerchantKey,
  payuMerchantSalt,
} from './payment-credentials';

describe('payu credentials', () => {
  const originalKey = process.env.PAYU_MERCHANT_KEY;
  const originalSalt = process.env.PAYU_MERCHANT_SALT;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.PAYU_MERCHANT_KEY;
    else process.env.PAYU_MERCHANT_KEY = originalKey;
    if (originalSalt === undefined) delete process.env.PAYU_MERCHANT_SALT;
    else process.env.PAYU_MERCHANT_SALT = originalSalt;
  });

  it('enables PayU when merchant key and salt are set', () => {
    process.env.PAYU_MERCHANT_KEY = 'gtKFFx';
    process.env.PAYU_MERCHANT_SALT = 'testsalt';
    const config = { get: () => undefined } as unknown as ConfigService;

    expect(payuMerchantKey(config)).toBe('gtKFFx');
    expect(payuMerchantSalt(config)).toBe('testsalt');
    expect(payuEnabled(config)).toBe(true);
  });

  it('stays enabled in production when keys are set', () => {
    process.env.PAYU_MERCHANT_KEY = 'livekey';
    process.env.PAYU_MERCHANT_SALT = 'livesalt';
    const config = {
      get: (key: string) => (key === 'nodeEnv' ? 'production' : undefined),
    } as ConfigService;

    expect(payuEnabled(config)).toBe(true);
  });

  it('stays disabled without keys', () => {
    delete process.env.PAYU_MERCHANT_KEY;
    delete process.env.PAYU_MERCHANT_SALT;
    const config = { get: () => undefined } as unknown as ConfigService;
    expect(payuEnabled(config)).toBe(false);
  });
});
