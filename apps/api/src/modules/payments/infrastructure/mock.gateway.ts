import { Injectable } from '@nestjs/common';
import { Market, PaymentProvider } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../domain/payment.types';

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  readonly provider = PaymentProvider.MOCK;

  supports(_market: Market): boolean {
    return true;
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    const providerOrderId = `mock_order_${input.orderNumber}`;
    return {
      provider: PaymentProvider.MOCK,
      providerOrderId,
      clientSecret: `mock_secret_${randomUUID()}`,
      checkoutUrl: `mock://pay/${input.orderId}`,
      metadata: { mode: 'mock' },
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      providerRefundId: `mock_refund_${randomUUID()}`,
      amountMinor: input.amountMinor,
      status: 'succeeded',
      raw: { mode: 'mock', providerPaymentId: input.providerPaymentId },
    };
  }
}
