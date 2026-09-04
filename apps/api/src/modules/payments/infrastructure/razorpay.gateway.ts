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
import {
  razorpayConfigured,
  razorpayKeyId,
  razorpayKeySecret,
} from './payment-credentials';
import {
  providerErrorMessage,
  providerHttpStatus,
} from '../../../common/errors/provider-error';

@Injectable()
export class RazorpayGateway implements PaymentGateway {
  readonly provider = PaymentProvider.RAZORPAY;
  private readonly logger = new Logger(RazorpayGateway.name);
  private client: Razorpay | null = null;

  constructor(private readonly config: ConfigService) {
    const keyId = razorpayKeyId(this.config);
    if (keyId) {
      this.logger.log(
        `Razorpay ${keyId.startsWith('rzp_live') ? 'live' : 'test'} keys loaded`,
      );
    } else {
      this.logger.warn(
        'Razorpay keys not loaded; India checkout will not open Razorpay',
      );
    }
  }

  supports(market: Market): boolean {
    return market === Market.IN && razorpayConfigured(this.config);
  }

  private getClient(): Razorpay {
    if (this.client) return this.client;
    const keyId = razorpayKeyId(this.config);
    const keySecret = razorpayKeySecret(this.config);
    if (!keyId || !keySecret) {
      throw new Error('Razorpay is not configured');
    }
    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this.client;
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    const client = this.getClient();
    const keyId = razorpayKeyId(this.config);

    const order = await client.orders.create({
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
        keyId,
        amount: input.amountMinor,
        currency: input.currency,
        name: 'Pavitra Seva',
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
    const client = this.getClient();
    const paymentId = await this.resolvePaymentId(
      client,
      input.providerPaymentId,
    );
    const reason = (input.reason ?? 'refund')
      .replace(/['"]/g, '')
      .slice(0, 256);

    try {
      const refund = await client.payments.refund(paymentId, {
        amount: input.amountMinor,
        speed: 'normal',
        notes: { reason },
      });
      return this.toRefundResult(refund, input.amountMinor);
    } catch (err) {
      if (await this.alreadyRefunded(client, paymentId, input.amountMinor)) {
        this.logger.warn(`Razorpay payment ${paymentId} was already refunded`);
        return {
          providerRefundId: `already_${paymentId}`,
          amountMinor: input.amountMinor,
          status: 'succeeded',
        };
      }
      const wrapped = new Error(
        providerErrorMessage(err, 'Razorpay could not refund this payment'),
      );
      (wrapped as Error & { statusCode?: number }).statusCode =
        providerHttpStatus(err) ?? 400;
      throw wrapped;
    }
  }

  private toRefundResult(
    refund: { id?: string; amount?: number | string; status?: string },
    fallbackAmount: number,
  ): RefundPaymentResult {
    return {
      providerRefundId: String(refund.id),
      amountMinor: Number(refund.amount ?? fallbackAmount),
      status: refund.status === 'failed' ? 'failed' : 'succeeded',
    };
  }

  private async resolvePaymentId(
    client: Razorpay,
    providerPaymentId: string,
  ): Promise<string> {
    if (!providerPaymentId.startsWith('order_')) return providerPaymentId;
    const payload = (await client.orders.fetchPayments(providerPaymentId)) as {
      items?: Array<{ id?: string; status?: string }>;
    };
    const items = payload.items ?? [];
    const captured =
      items.find((item) => item.status === 'captured') ?? items[0];
    if (!captured?.id) {
      throw new Error('No Razorpay payment found for this order');
    }
    return String(captured.id);
  }

  private async alreadyRefunded(
    client: Razorpay,
    paymentId: string,
    amountMinor: number,
  ): Promise<boolean> {
    try {
      const payment = (await client.payments.fetch(paymentId)) as {
        amount_refunded?: number;
        refund_status?: string | null;
      };
      const refunded = Number(payment.amount_refunded ?? 0);
      return (
        payment.refund_status === 'full' ||
        refunded >= amountMinor
      );
    } catch {
      return false;
    }
  }
}
