import {
  payuHashesMatch,
  payuRequestHash,
  payuResponseHash,
  rupeesToMinor,
} from './payu-hash';

describe('PayU hashing', () => {
  const sample = {
    key: 'gtKFFx',
    txnid: 'PSABC123',
    amount: '1111.00',
    productinfo: 'Pavitra Seva kit',
    firstname: 'Kartheek',
    email: 'kartheek@example.com',
    salt: 'testsalt',
    udf1: 'order-id-1',
  };

  it('builds a stable request hash', () => {
    expect(payuRequestHash(sample)).toBe(payuRequestHash(sample));
    expect(payuRequestHash(sample)).toHaveLength(128);
    expect(payuRequestHash({ ...sample, amount: '1111.01' })).not.toBe(
      payuRequestHash(sample),
    );
  });

  it('verifies a matching reverse hash', () => {
    const expected = payuResponseHash({ ...sample, status: 'success' });
    expect(payuHashesMatch(expected, expected.toUpperCase())).toBe(true);
    expect(payuHashesMatch(expected, payuResponseHash({ ...sample, status: 'failure' }))).toBe(
      false,
    );
  });

  it('converts PayU rupee amounts to paise', () => {
    expect(rupeesToMinor('1111.00')).toBe(111100);
    expect(rupeesToMinor('10.5')).toBe(1050);
  });
});
