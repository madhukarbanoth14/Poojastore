import { BadRequestException } from '@nestjs/common';

/** NPCI / UPI apps expose a 12-digit UTR (or bank RRN) on the success screen. */
export const UPI_UTR_PATTERN = /^[0-9]{12}$/;

const OBVIOUS_FAKES = new Set([
  '000000000000',
  '111111111111',
  '123456789012',
  '012345678901',
  '999999999999',
]);

export function normalizeUtr(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, '');
}

export function assertValidUpiUtr(raw: string): string {
  const utr = normalizeUtr(raw);
  if (!UPI_UTR_PATTERN.test(utr)) {
    throw new BadRequestException(
      'Enter the exact 12-digit UTR from PhonePe / Google Pay / Paytm. This reference is not valid.',
    );
  }
  if (OBVIOUS_FAKES.has(utr) || /^(\d)\1{11}$/.test(utr)) {
    throw new BadRequestException(
      'This UTR does not look like a real payment reference. Copy it from your payment success screen.',
    );
  }
  return utr;
}

export function assertPaidAmountMatches(
  amountPaidMinor: number | undefined,
  expectedMinor: number,
) {
  if (amountPaidMinor == null || !Number.isInteger(amountPaidMinor)) {
    throw new BadRequestException(
      'Enter the amount you paid for this order (must match the QR amount).',
    );
  }
  if (amountPaidMinor !== expectedMinor) {
    const expected = (expectedMinor / 100).toFixed(2);
    throw new BadRequestException(
      `Amount does not match this order (expected ₹${expected}). Use the UTR from the payment of this exact amount — other UTRs are not accepted.`,
    );
  }
}
