import { BadRequestException } from '@nestjs/common';
import {
  assertPaidAmountMatches,
  assertValidUpiUtr,
  normalizeUtr,
} from './upi-utr';

describe('upi-utr', () => {
  it('normalizes spaces and dashes', () => {
    expect(normalizeUtr('5426 9673 8084')).toBe('542696738084');
    expect(normalizeUtr('5426-9673-8084')).toBe('542696738084');
  });

  it('accepts a 12-digit UTR', () => {
    expect(assertValidUpiUtr('542696738084')).toBe('542696738084');
  });

  it('rejects short, long, and alpha UTRs', () => {
    expect(() => assertValidUpiUtr('12345678')).toThrow(BadRequestException);
    expect(() => assertValidUpiUtr('1234567890123')).toThrow(BadRequestException);
    expect(() => assertValidUpiUtr('ABCD12345678')).toThrow(BadRequestException);
  });

  it('rejects obvious fake patterns', () => {
    expect(() => assertValidUpiUtr('000000000000')).toThrow(BadRequestException);
    expect(() => assertValidUpiUtr('111111111111')).toThrow(BadRequestException);
    expect(() => assertValidUpiUtr('123456789012')).toThrow(BadRequestException);
  });

  it('rejects amount mismatch', () => {
    expect(() => assertPaidAmountMatches(50000, 111100)).toThrow(BadRequestException);
    expect(() => assertPaidAmountMatches(undefined, 111100)).toThrow(BadRequestException);
    expect(() => assertPaidAmountMatches(111100, 111100)).not.toThrow();
  });
});
