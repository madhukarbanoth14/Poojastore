import 'reflect-metadata';
import { validateEnv } from './env.validation';

const base = {
  NODE_ENV: 'development',
  PORT: 3000,
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  REDIS_URL: 'redis://127.0.0.1:6379',
  JWT_ACCESS_SECRET: 'dev-access-secret-at-least-32-chars!!',
  JWT_REFRESH_SECRET: 'dev-refresh-secret-at-least-32-chars!',
  JWT_ACCESS_TTL_SECONDS: 900,
  JWT_REFRESH_TTL_SECONDS: 604800,
  OTP_LENGTH: 6,
  OTP_TTL_SECONDS: 300,
  OTP_MAX_ATTEMPTS: 5,
  OTP_MAX_REQUESTS_PER_HOUR: 10,
  SMS_PROVIDER: 'console',
  PAYMENT_MODE: 'mock',
};

describe('validateEnv production gates', () => {
  it('allows unsafe defaults in development', () => {
    expect(() => validateEnv(base)).not.toThrow();
  });

  it('rejects mock payments in production', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        PAYMENT_MODE: 'mock',
        SMS_PROVIDER: 'twilio',
        TWILIO_ACCOUNT_SID: 'AC123',
        TWILIO_AUTH_TOKEN: 'token',
        TWILIO_FROM_NUMBER: '+15551234567',
        OTP_RETURN_IN_RESPONSE: 'false',
        SWAGGER_ENABLED: 'false',
      }),
    ).toThrow(/PAYMENT_MODE/);
  });

  it('rejects console SMS in production', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        PAYMENT_MODE: 'live',
        SMS_PROVIDER: 'console',
        OTP_RETURN_IN_RESPONSE: 'false',
        SWAGGER_ENABLED: 'false',
        RAZORPAY_KEY_ID: 'rzp_test',
        RAZORPAY_KEY_SECRET: 'secret',
        RAZORPAY_WEBHOOK_SECRET: 'whsec',
      }),
    ).toThrow(/SMS_PROVIDER/);
  });

  it('rejects twilio without credentials', () => {
    expect(() =>
      validateEnv({
        ...base,
        SMS_PROVIDER: 'twilio',
      }),
    ).toThrow(/Twilio/);
  });

  it('accepts live Razorpay test keys without webhook secret in development', () => {
    expect(() =>
      validateEnv({
        ...base,
        PAYMENT_MODE: 'live',
        RAZORPAY_KEY_ID: 'rzp_test_abc',
        RAZORPAY_KEY_SECRET: 'secret',
      }),
    ).not.toThrow();
  });

  it('rejects live payments without gateway secrets', () => {
    expect(() =>
      validateEnv({
        ...base,
        PAYMENT_MODE: 'live',
      }),
    ).toThrow(/Live payment/);
  });

  it('accepts safe production config', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        PAYMENT_MODE: 'live',
        SMS_PROVIDER: 'twilio',
        TWILIO_ACCOUNT_SID: 'AC123',
        TWILIO_AUTH_TOKEN: 'token',
        TWILIO_FROM_NUMBER: '+15551234567',
        OTP_RETURN_IN_RESPONSE: 'false',
        SWAGGER_ENABLED: 'false',
        RAZORPAY_KEY_ID: 'rzp_live',
        RAZORPAY_KEY_SECRET: 'secret',
        RAZORPAY_WEBHOOK_SECRET: 'whsec',
      }),
    ).not.toThrow();
  });
});
