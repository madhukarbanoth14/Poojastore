import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../../core/database/prisma.service';
import { razorpayKeySecret } from '../infrastructure/payment-credentials';
import { ConfirmPaymentService } from './confirm-payment.service';

@Injectable()
export class VerifyRazorpayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly confirm: ConfirmPaymentService,
    private readonly config: ConfigService,
  ) {}

  async verify(params: {
    userId: string;
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.order.userId !== params.userId) {
      throw new BadRequestException('Payment does not belong to user');
    }
    if (payment.provider !== PaymentProvider.RAZORPAY) {
      throw new BadRequestException('Not a Razorpay payment');
    }
    if (
      !payment.providerOrderId ||
      payment.providerOrderId !== params.razorpayOrderId
    ) {
      throw new BadRequestException('Razorpay order mismatch');
    }

    const secret = razorpayKeySecret(this.config);
    if (!secret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expected = createHmac('sha256', secret).update(payload).digest();
    const received = Buffer.from(params.razorpaySignature, 'hex');
    const valid =
      expected.length === received.length &&
      timingSafeEqual(expected, received);
    if (!valid) {
      throw new BadRequestException('Invalid Razorpay signature');
    }

    return this.confirm.markSucceeded({
      paymentId: payment.id,
      providerOrderId: params.razorpayOrderId,
      providerPaymentId: params.razorpayPaymentId,
      amountMinor: payment.amountMinor,
      raw: {
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        verifiedAt: new Date().toISOString(),
      },
    });
  }
}
