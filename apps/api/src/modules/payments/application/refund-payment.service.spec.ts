import { MockPaymentGateway } from '../infrastructure/mock.gateway';

describe('MockPaymentGateway.refund', () => {
  it('returns a succeeded mock refund', async () => {
    const gateway = new MockPaymentGateway();
    const result = await gateway.refund({
      providerPaymentId: 'mock_pay_1',
      amountMinor: 2500,
      currency: 'INR' as never,
      reason: 'test',
    });
    expect(result.status).toBe('succeeded');
    expect(result.amountMinor).toBe(2500);
    expect(result.providerRefundId).toMatch(/^mock_refund_/);
  });
});
