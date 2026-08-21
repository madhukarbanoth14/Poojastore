import { CurrencyCode, Market, PaymentProvider } from '@prisma/client';

export interface CreatePaymentSessionInput {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: CurrencyCode;
  market: Market;
  customer: {
    id: string;
    email?: string | null;
    phoneE164: string;
    fullName?: string | null;
  };
  lineItems: Array<{
    name: string;
    quantity: number;
    unitAmountMinor: number;
  }>;
}

export interface CreatePaymentSessionResult {
  provider: PaymentProvider;
  providerOrderId?: string;
  providerPaymentId?: string;
  clientSecret?: string;
  checkoutUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundPaymentInput {
  providerPaymentId: string;
  amountMinor: number;
  currency: CurrencyCode;
  reason?: string;
  idempotencyKey?: string;
}

export interface RefundPaymentResult {
  providerRefundId: string;
  amountMinor: number;
  status: 'pending' | 'succeeded' | 'failed';
  raw?: Record<string, unknown>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  supports(market: Market): boolean;
  createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult>;
  refund(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}
