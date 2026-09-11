import { createHash, timingSafeEqual } from 'crypto';

export type PayuRequestHashInput = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
};

export type PayuResponseHashInput = {
  salt: string;
  status: string;
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
};

export function sha512Hex(value: string): string {
  return createHash('sha512').update(value).digest('hex');
}

/** PayU hosted checkout request hash. */
export function payuRequestHash(input: PayuRequestHashInput): string {
  const payload = [
    input.key,
    input.txnid,
    input.amount,
    input.productinfo,
    input.firstname,
    input.email,
    input.udf1 ?? '',
    input.udf2 ?? '',
    input.udf3 ?? '',
    input.udf4 ?? '',
    input.udf5 ?? '',
    '',
    '',
    '',
    '',
    '',
    input.salt,
  ].join('|');
  return sha512Hex(payload);
}

/** Reverse hash PayU sends on surl/furl and webhooks. */
export function payuResponseHash(input: PayuResponseHashInput): string {
  const core = [
    input.status,
    '',
    '',
    '',
    '',
    '',
    input.udf5 ?? '',
    input.udf4 ?? '',
    input.udf3 ?? '',
    input.udf2 ?? '',
    input.udf1 ?? '',
    input.email,
    input.firstname,
    input.productinfo,
    input.amount,
    input.txnid,
    input.key,
  ].join('|');
  const extra = input.additionalCharges?.trim();
  const payload = extra
    ? `${extra}|${input.salt}|${core}`
    : `${input.salt}|${core}`;
  return sha512Hex(payload);
}

export function payuHashesMatch(expected: string, received: string): boolean {
  const left = Buffer.from(expected.trim().toLowerCase(), 'utf8');
  const right = Buffer.from(received.trim().toLowerCase(), 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

export function payuCommandHash(
  key: string,
  command: string,
  var1: string,
  salt: string,
): string {
  return sha512Hex(`${key}|${command}|${var1}|${salt}`);
}

export function rupeesToMinor(amount: string): number {
  const parsed = Number.parseFloat(amount);
  if (!Number.isFinite(parsed)) return NaN;
  return Math.round(parsed * 100);
}
