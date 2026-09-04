export class InvalidPhoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPhoneError';
  }
}

const SUPPORTED_COUNTRY_CODES = new Set(['91', '1']);

export interface NormalizedPhone {
  countryCode: string;
  phoneNational: string;
  phoneE164: string;
}

/**
 * Normalizes phone numbers for India (+91) and USA/Canada (+1).
 * Accepts countryCode with or without leading +, and national digits only.
 */
export function normalizePhone(
  countryCodeRaw: string,
  nationalRaw: string,
): NormalizedPhone {
  const countryCode = countryCodeRaw.replace(/^\+/, '').replace(/\D/g, '');
  const phoneNational = nationalRaw.replace(/\D/g, '');

  if (!SUPPORTED_COUNTRY_CODES.has(countryCode)) {
    throw new InvalidPhoneError(
      'Unsupported country code. Supported: +91 (India), +1 (USA/Canada).',
    );
  }

  if (countryCode === '91' && !/^[6-9]\d{9}$/.test(phoneNational)) {
    throw new InvalidPhoneError(
      'Invalid Indian mobile number. Expected 10 digits starting with 6-9.',
    );
  }

  if (countryCode === '1' && !/^\d{10}$/.test(phoneNational)) {
    throw new InvalidPhoneError(
      'Invalid US/Canada number. Expected 10 digits.',
    );
  }

  return {
    countryCode,
    phoneNational,
    phoneE164: `+${countryCode}${phoneNational}`,
  };
}

/** Accepts +91…, 91…, or a 10-digit Indian mobile; also +1 US/Canada. */
export function parseMobileInput(raw: string): NormalizedPhone {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new InvalidPhoneError('Phone number is required');
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return normalizePhone('91', digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return normalizePhone('91', digits.slice(2));
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return normalizePhone('1', digits.slice(1));
  }
  throw new InvalidPhoneError(
    'Enter a valid Indian (+91) or US (+1) mobile number',
  );
}

export function generateNumericOtp(length: number): string {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}
