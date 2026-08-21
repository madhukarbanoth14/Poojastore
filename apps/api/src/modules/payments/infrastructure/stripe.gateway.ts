import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, PaymentProvider } from '@prisma/client';
import Stripe from 'stripe';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../domain/payment.types';

@Injectable()
export class StripeGateway implements PaymentGateway {
  readonly provider = PaymentProvider.STRIPE;
  private readonly logger = new Logger(StripeGateway.name);
  private client: Stripe | null = null;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('payments.stripe.secretKey') ?? '';
    if (secret) {
      this.client = new Stripe(secret);
    }
  }

  supports(market: Market): boolean {
    return (market === Market.US || market === Market.CA) && this.client !== null;
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    if (!this.client) {
      throw new Error('Stripe is not configured');
    }

    const session = await this.client.checkout.sessions.create({
      mode: 'payment',
      success_url: this.config.getOrThrow<string>('payments.stripe.successUrl'),
      cancel_url: this.config.getOrThrow<string>('payments.stripe.cancelUrl'),
      customer_email: input.customer.email ?? undefined,
      client_reference_id: input.orderId,
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        userId: input.customer.id,
      },
      line_items: input.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: item.unitAmountMinor,
          product_data: { name: item.name },
        },
      })),
    });

    this.logger.log(`Stripe checkout session created ${session.id}`);

    return {
      provider: PaymentProvider.STRIPE,
      providerOrderId: session.id,
      checkoutUrl: session.url ?? undefined,
      clientSecret: session.client_secret ?? undefined,
      metadata: { sessionId: session.id },
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    if (!this.client) {
      throw new Error('Stripe is not configured');
    }

    const refund = await this.client.refunds.create(
      {
        payment_intent: input.providerPaymentId,
        amount: input.amountMinor,
        reason: 'requested_by_customer',
        metadata: {
          reason: input.reason ?? 'admin_refund',
        },
      },
      input.idempotencyKey
        ? { idempotencyKey: input.idempotencyKey }
        : undefined,
    );

    return {
      providerRefundId: refund.id,
      amountMinor: refund.amount,
      status:
        refund.status === 'succeeded'
          ? 'succeeded'
          : refund.status === 'failed'
            ? 'failed'
            : 'pending',
      raw: refund as unknown as Record<string, unknown>,
    };
  }
}
