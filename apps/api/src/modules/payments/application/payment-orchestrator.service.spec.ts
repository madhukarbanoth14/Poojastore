import { Market, PaymentProvider } from '@prisma/client';
import { PaymentOrchestratorService } from './payment-orchestrator.service';
import { MockPaymentGateway } from '../infrastructure/mock.gateway';
import { RazorpayGateway } from '../infrastructure/razorpay.gateway';
import { StripeGateway } from '../infrastructure/stripe.gateway';

function makeService(mode: string, razorpaySupports = true, stripeSupports = false) {
  const config = {
    get: (key: string) => (key === 'payments.mode' ? mode : undefined),
  } as never;

  return new PaymentOrchestratorService(
    config,
    new MockPaymentGateway(),
    {
      provider: PaymentProvider.RAZORPAY,
      supports: () => razorpaySupports,
      createSession: async () => ({ provider: PaymentProvider.RAZORPAY }),
      refund: async () => ({
        providerRefundId: 'rfnd',
        amountMinor: 100,
        status: 'succeeded' as const,
      }),
    } as unknown as RazorpayGateway,
    {
      provider: PaymentProvider.STRIPE,
      supports: () => stripeSupports,
      createSession: async () => ({ provider: PaymentProvider.STRIPE }),
      refund: async () => ({
        providerRefundId: 're_1',
        amountMinor: 100,
        status: 'succeeded' as const,
      }),
    } as unknown as StripeGateway,
  );
}

describe('PaymentOrchestratorService', () => {
  it('uses MOCK when PAYMENT_MODE=mock and no live gateway is configured', () => {
    const service = makeService('mock', false, false);
    expect(service.resolveGateway(Market.IN).provider).toBe(
      PaymentProvider.MOCK,
    );
  });

  it('uses Razorpay test keys even when PAYMENT_MODE=mock', () => {
    const service = makeService('mock', true, false);
    expect(service.resolveGateway(Market.IN).provider).toBe(
      PaymentProvider.RAZORPAY,
    );
  });

  it('uses live gateway when PAYMENT_MODE=live', () => {
    const service = makeService('live', true, false);
    expect(service.resolveGateway(Market.IN).provider).toBe(
      PaymentProvider.RAZORPAY,
    );
  });

  it('throws when live mode has no matching gateway', () => {
    const service = makeService('live', false, false);
    expect(() => service.resolveGateway(Market.IN)).toThrow(
      /No live payment gateway/,
    );
  });
});
