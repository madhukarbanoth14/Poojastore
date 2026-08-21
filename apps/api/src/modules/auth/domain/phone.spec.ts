import { generateNumericOtp, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('normalizes Indian mobiles', () => {
    expect(normalizePhone('+91', '9876543210')).toEqual({
      countryCode: '91',
      phoneNational: '9876543210',
      phoneE164: '+919876543210',
    });
  });

  it('normalizes US/Canada mobiles', () => {
    expect(normalizePhone('1', '4155552671')).toEqual({
      countryCode: '1',
      phoneNational: '4155552671',
      phoneE164: '+14155552671',
    });
  });

  it('rejects unsupported countries', () => {
    expect(() => normalizePhone('44', '7911123456')).toThrow(
      /Unsupported country code/,
    );
  });

  it('rejects invalid Indian numbers', () => {
    expect(() => normalizePhone('91', '5876543210')).toThrow(/Invalid Indian/);
  });
});

describe('generateNumericOtp', () => {
  it('generates OTP of requested length', () => {
    const otp = generateNumericOtp(6);
    expect(otp).toMatch(/^\d{6}$/);
  });
});
