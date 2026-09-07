import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PackageBookingStatus,
  PaymentProvider,
  PaymentStatus,
  PriestBookingStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PushNotificationService } from '../../notifications/application/push-notification.service';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { parsePaymentScreenshot } from '../infrastructure/parse-payment-screenshot';
import {
  assertPaidAmountMatches,
  assertValidUpiUtr,
} from '../domain/upi-utr';

@Injectable()
export class ConfirmPaymentService {
  private readonly logger = new Logger(ConfirmPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushNotificationService,
  ) {}

  /**
   * Returns true if this webhook event was already processed (idempotent).
   */
  async claimWebhookEvent(params: {
    provider: PaymentProvider;
    eventId: string;
    eventType: string;
    paymentId?: string;
    payload?: Record<string, unknown>;
  }): Promise<{ duplicate: boolean }> {
    try {
      await this.prisma.paymentWebhookEvent.create({
        data: {
          provider: params.provider,
          eventId: params.eventId,
          eventType: params.eventType,
          paymentId: params.paymentId,
          payload: (params.payload ?? {}) as Prisma.InputJsonValue,
        },
      });
      return { duplicate: false };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { duplicate: true };
      }
      throw error;
    }
  }

  async markSucceeded(params: {
    paymentId?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    amountMinor?: number;
    raw?: Record<string, unknown>;
  }) {
    const payment = await this.findPayment(params);

    if (!payment) {
      this.logger.warn(
        `markSucceeded: payment not found order=${params.providerOrderId} pay=${params.providerPaymentId}`,
      );
      return null;
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      return payment;
    }

    if (
      params.amountMinor != null &&
      params.amountMinor !== payment.amountMinor
    ) {
      this.logger.error(
        `Amount mismatch payment=${payment.id} expected=${payment.amountMinor} got=${params.amountMinor}`,
      );
      throw new BadRequestException('Payment amount mismatch');
    }

    const [, updated] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.FULFILLING,
          paidAt: new Date(),
          packedAt: new Date(),
          trackingNumber: `PS${payment.order.orderNumber.replace(/\W/g, '').slice(-10)}`,
          courierName: 'Pooja Store Delivery',
        },
      }),
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerPaymentId:
            params.providerPaymentId ?? payment.providerPaymentId,
          metadata: {
            ...(payment.metadata as Record<string, unknown>),
            ...(params.raw ?? {}),
          } as Prisma.InputJsonValue,
        },
      }),
      this.prisma.priestBooking.updateMany({
        where: {
          orderId: payment.orderId,
          status: PriestBookingStatus.PENDING_PAYMENT,
        },
        data: { status: PriestBookingStatus.CONFIRMED },
      }),
      this.prisma.packageBooking.updateMany({
        where: {
          orderId: payment.orderId,
          status: PackageBookingStatus.PENDING_PAYMENT,
        },
        data: { status: PackageBookingStatus.CONFIRMED },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: payment.order.userId,
          action: 'PAYMENT_SUCCEEDED',
          resource: 'payment',
          metadata: {
            paymentId: payment.id,
            orderId: payment.orderId,
            providerPaymentId: params.providerPaymentId,
          },
        },
      }),
    ]);

    const purchased = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      select: { productId: true },
    });
    const productIds = [...new Set(purchased.map((item) => item.productId))];
    if (productIds.length) {
      await this.prisma.cartItem.deleteMany({
        where: {
          productId: { in: productIds },
          cart: { userId: payment.order.userId },
        },
      });
    }

    void this.notifyBookingsConfirmed(payment.orderId, payment.order.userId).catch(
      (error) =>
        this.logger.warn(`Booking confirmation push failed: ${error}`),
    );

    return updated;
  }

  private async notifyBookingsConfirmed(orderId: string, userId: string) {
    const priestBookings = await this.prisma.priestBooking.findMany({
      where: { orderId, status: PriestBookingStatus.CONFIRMED },
      include: { priest: { select: { fullName: true } } },
    });
    for (const booking of priestBookings) {
      await this.push.notifyPriestBookingConfirmed(userId, {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        priestName: booking.priest.fullName,
        serviceName: booking.serviceName,
      });
    }

    const packageBookings = await this.prisma.packageBooking.findMany({
      where: { orderId, status: PackageBookingStatus.CONFIRMED },
      include: { package: { select: { title: true } } },
    });
    for (const booking of packageBookings) {
      await this.push.notifyPackageBookingConfirmed(userId, {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        packageName:
          booking.serviceName?.trim() ||
          booking.package.title ||
          'Puja package',
      });
    }
  }

  async markFailed(params: {
    providerOrderId?: string;
    paymentId?: string;
    reason?: string;
  }) {
    const payment = await this.findPayment(params);
    if (!payment) {
      this.logger.warn(
        `markFailed: payment not found order=${params.providerOrderId}`,
      );
      return { ok: false, reason: 'not_found' };
    }

    if (
      payment.status === PaymentStatus.SUCCEEDED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      return { ok: true, reason: 'already_final' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.FAILED },
      });

      const booking = await tx.priestBooking.findFirst({
        where: {
          orderId: payment.orderId,
          status: PriestBookingStatus.PENDING_PAYMENT,
        },
      });
      if (booking) {
        await tx.priestBooking.update({
          where: { id: booking.id },
          data: { status: PriestBookingStatus.FAILED },
        });
        await tx.priestSlot.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      }

      await tx.packageBooking.updateMany({
        where: {
          orderId: payment.orderId,
          status: PackageBookingStatus.PENDING_PAYMENT,
        },
        data: { status: PackageBookingStatus.FAILED },
      });
    });

    return { ok: true, reason: params.reason };
  }

  async markRefunded(params: {
    paymentId?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    providerRefundId?: string;
    amountMinor?: number;
    raw?: Record<string, unknown>;
  }) {
    const payment = await this.findPayment(params);
    if (!payment) {
      this.logger.warn('markRefunded: payment not found');
      return null;
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      return payment;
    }

    const amount = params.amountMinor ?? payment.amountMinor;

    const [, updated] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          providerRefundId: params.providerRefundId ?? payment.providerRefundId,
          refundAmountMinor: amount,
          refundedAt: new Date(),
          metadata: {
            ...(payment.metadata as Record<string, unknown>),
            ...(params.raw ?? {}),
          } as Prisma.InputJsonValue,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.REFUNDED },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: payment.order.userId,
          action: 'PAYMENT_REFUNDED',
          resource: 'payment',
          metadata: {
            paymentId: payment.id,
            orderId: payment.orderId,
            providerRefundId: params.providerRefundId,
            amountMinor: amount,
          },
        },
      }),
    ]);

    return updated;
  }

  async mockConfirm(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.order.userId !== userId) {
      throw new BadRequestException('Payment does not belong to user');
    }
    if (payment.provider !== 'MOCK') {
      throw new BadRequestException('Only mock payments can be confirmed this way');
    }
    return this.markSucceeded({
      paymentId,
      providerPaymentId: `mock_pay_${payment.id}`,
    });
  }

  async submitUpiProof(
    paymentId: string,
    userId: string,
    input: {
      utr: string;
      amountPaidMinor: number;
      screenshotBase64?: string;
    },
  ) {
    const utr = assertValidUpiUtr(input.utr);
    const screenshot = input.screenshotBase64?.trim() ?? '';

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.order.userId !== userId) {
      throw new BadRequestException('Payment does not belong to user');
    }
    if (payment.provider !== PaymentProvider.UPI_QR) {
      throw new BadRequestException('This payment is not a UPI QR payment');
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      return payment;
    }
    if (
      payment.status !== PaymentStatus.REQUIRES_ACTION &&
      payment.status !== PaymentStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Cannot submit UPI proof for status ${payment.status}`,
      );
    }

    assertPaidAmountMatches(input.amountPaidMinor, payment.amountMinor);

    const duplicate = await this.prisma.payment.findFirst({
      where: {
        providerPaymentId: utr,
        id: { not: payment.id },
        status: { in: [PaymentStatus.SUCCEEDED, PaymentStatus.PROCESSING] },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new BadRequestException(
        'This UTR was already used on another order. Enter the UTR from your payment for this order only.',
      );
    }

    if (screenshot) {
      const parsed = parsePaymentScreenshot(screenshot);
      await this.prisma.upiPaymentProof.upsert({
        where: { paymentId: payment.id },
        create: {
          paymentId: payment.id,
          mimeType: parsed.mimeType,
          image: parsed.image,
        },
        update: {
          mimeType: parsed.mimeType,
          image: parsed.image,
        },
      });
    }

    const metaUpdate = {
      ...(payment.metadata as Record<string, unknown>),
      utr,
      amountPaidMinor: payment.amountMinor,
      hasScreenshot:
        Boolean(screenshot) ||
        Boolean((payment.metadata as Record<string, unknown>).hasScreenshot),
      submittedAt: new Date().toISOString(),
    };

    // Valid format + matching amount → queue for bank confirmation.
    // Invalid UTR / wrong amount never reach here (thrown above).
    try {
      return await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PROCESSING,
          providerPaymentId: utr,
          metadata: metaUpdate as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This UTR was already used on another order. Enter the UTR from your payment for this order only.',
        );
      }
      throw error;
    }
  }

  async getUpiProof(paymentId: string, user: AuthenticatedUser) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, upiProof: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.order.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Payment proof is not available');
    }
    if (!payment.upiProof) {
      throw new NotFoundException('No payment screenshot was uploaded');
    }
    return payment.upiProof;
  }

  async adminConfirmUpi(paymentId: string, adminUserId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.provider !== PaymentProvider.UPI_QR) {
      throw new BadRequestException('This payment is not a UPI QR payment');
    }
    const meta = (payment.metadata as Record<string, unknown>) ?? {};
    const utr =
      payment.providerPaymentId ||
      (typeof meta.utr === 'string' ? meta.utr : `upi_${payment.id}`);
    return this.markSucceeded({
      paymentId: payment.id,
      providerPaymentId: utr,
      raw: {
        adminConfirmedBy: adminUserId,
        confirmedAt: new Date().toISOString(),
      },
    });
  }

  private findPayment(params: {
    paymentId?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
  }) {
    return this.prisma.payment.findFirst({
      where: {
        OR: [
          params.paymentId ? { id: params.paymentId } : undefined,
          params.providerOrderId
            ? { providerOrderId: params.providerOrderId }
            : undefined,
          params.providerPaymentId
            ? { providerPaymentId: params.providerPaymentId }
            : undefined,
        ].filter(Boolean) as object[],
      },
      include: { order: true },
    });
  }
}
