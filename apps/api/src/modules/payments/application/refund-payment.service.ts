import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ConfirmPaymentService } from './confirm-payment.service';
import { MockPaymentGateway } from '../infrastructure/mock.gateway';
import { RazorpayGateway } from '../infrastructure/razorpay.gateway';
import { StripeGateway } from '../infrastructure/stripe.gateway';
import type { PaymentGateway } from '../domain/payment.types';

@Injectable()
export class RefundPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly confirm: ConfirmPaymentService,
    private readonly mock: MockPaymentGateway,
    private readonly razorpay: RazorpayGateway,
    private readonly stripe: StripeGateway,
  ) {}

  async refund(params: {
    paymentId: string;
    amountMinor?: number;
    reason?: string;
    adminUserId?: string;
    actorUserId?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException(
        `Only SUCCEEDED payments can be refunded (status=${payment.status})`,
      );
    }

    if (!payment.providerPaymentId && payment.provider !== PaymentProvider.MOCK) {
      throw new BadRequestException(
        'Payment is missing providerPaymentId; cannot refund',
      );
    }

    const amount = params.amountMinor ?? payment.amountMinor;
    if (amount <= 0 || amount > payment.amountMinor) {
      throw new BadRequestException('Invalid refund amount');
    }

    const gateway = this.resolveGateway(payment.provider);
    const result = await gateway.refund({
      providerPaymentId:
        payment.providerPaymentId ?? `mock_pay_${payment.id}`,
      amountMinor: amount,
      currency: payment.currency,
      reason: params.reason,
      idempotencyKey: `refund_${payment.id}_${amount}`,
    });

    if (result.status === 'failed') {
      throw new BadRequestException('Provider rejected the refund');
    }

    const updated = await this.confirm.markRefunded({
      paymentId: payment.id,
      providerRefundId: result.providerRefundId,
      amountMinor: result.amountMinor,
          raw: {
            refund: result.raw,
            adminUserId: params.adminUserId,
            actorUserId: params.actorUserId ?? params.adminUserId,
            reason: params.reason,
          },
    });

    return updated;
  }

  private resolveGateway(provider: PaymentProvider): PaymentGateway {
    switch (provider) {
      case PaymentProvider.RAZORPAY:
        return this.razorpay;
      case PaymentProvider.STRIPE:
        return this.stripe;
      case PaymentProvider.MOCK:
        return this.mock;
      default:
        throw new BadRequestException(`Unsupported provider ${provider}`);
    }
  }
}
