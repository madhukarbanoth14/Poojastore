import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, PaymentProvider } from '@prisma/client';
import Razorpay from 'razorpay';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../domain/payment.types';

@Injectable()
export class RazorpayGateway implements PaymentGateway {
  readonly provider = PaymentProvider.RAZORPAY;
  private readonly logger = new Logger(RazorpayGateway.name);
  private client: Razorpay | null = null;

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.get<string>('payments.razorpay.keyId') ?? '';
    const keySecret =
      this.config.get<string>('payments.razorpay.keySecret') ?? '';
    if (keyId && keySecret) {
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  supports(market: Market): boolean {
    return market === Market.IN && this.client !== null;
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    if (!this.client) {
      throw new Error('Razorpay is not configured');
    }

    const order = await this.client.orders.create({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.orderNumber.slice(0, 40),
      notes: {
        orderId: input.orderId,
        userId: input.customer.id,
      },
    });

    this.logger.log(`Razorpay order created ${order.id}`);

    return {
      provider: PaymentProvider.RAZORPAY,
      providerOrderId: String(order.id),
      metadata: {
        keyId: this.config.get<string>('payments.razorpay.keyId'),
        amount: input.amountMinor,
        currency: input.currency,
        name: 'Pooja Store',
        description: `Order ${input.orderNumber}`,
        prefill: {
          name: input.customer.fullName ?? undefined,
          email: input.customer.email ?? undefined,
          contact: input.customer.phoneE164,
        },
      },
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    if (!this.client) {
      throw new Error('Razorpay is not configured');
    }

    const refund = await this.client.payments.refund(input.providerPaymentId, {
      amount: input.amountMinor,
      notes: {
        reason: input.reason ?? 'admin_refund',
        idempotencyKey: input.idempotencyKey ?? '',
      },
    });

    return {
      providerRefundId: String(refund.id),
      amountMinor: Number(refund.amount ?? input.amountMinor),
      status: refund.status === 'failed' ? 'failed' : 'succeeded',
      raw: refund as unknown as Record<string, unknown>,
    };
  }
}
