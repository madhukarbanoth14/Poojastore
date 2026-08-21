import { createHmac } from 'crypto';

function signature(orderId: string, paymentId: string, secret: string) {
  return createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

describe('Razorpay checkout signature', () => {
  it('matches Razorpay HMAC of order_id|payment_id', () => {
    const expected = signature('order_abc', 'pay_xyz', 'test_secret');
    const again = signature('order_abc', 'pay_xyz', 'test_secret');
    expect(expected).toBe(again);
    expect(expected).toHaveLength(64);
    expect(signature('order_abc', 'pay_other', 'test_secret')).not.toBe(
      expected,
    );
  });
});
