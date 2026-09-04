import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  ReturnStatus,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { RefundPaymentService } from '../../payments/application/refund-payment.service';
import { PushNotificationService } from '../../notifications/application/push-notification.service';

const TERMINAL: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
  OrderStatus.FAILED,
];

export type TrackingStep = {
  code: string;
  label: string;
  at: string | null;
  eta: string | null;
  done: boolean;
};

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refunds: RefundPaymentService,
    private readonly config: ConfigService,
    private readonly push: PushNotificationService,
  ) {}

  async getOwned(orderId: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, ...(isAdmin ? {} : { userId }) },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        shippingAddress: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.withTracking(order);
  }

  async listMine(userId: string) {
    const items = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    const advanced = [];
    for (const order of items) {
      advanced.push(await this.withTracking(order));
    }
    return advanced;
  }

  async cancel(orderId: string, userId: string, reason?: string) {
    const order = await this.getOwned(orderId, userId);
    if (TERMINAL.includes(order.status)) {
      throw new BadRequestException('Order can no longer be cancelled');
    }
    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Shipped orders cannot be cancelled. Request a return after delivery.',
      );
    }

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.FULFILLING
    ) {
      await this.refundSucceededPayment(order.id, userId, reason ?? 'cancelled');
      return this.getOwned(orderId, userId);
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason ?? 'customer_cancel',
      },
    });
    await this.prisma.payment.updateMany({
      where: {
        orderId: order.id,
        status: {
          in: [PaymentStatus.CREATED, PaymentStatus.REQUIRES_ACTION],
        },
      },
      data: { status: PaymentStatus.CANCELLED },
    });
    await this.audit(userId, 'ORDER_CANCELLED', order.id, { reason });
    return this.getOwned(orderId, userId);
  }

  async requestRefund(orderId: string, userId: string, reason?: string) {
    const order = await this.getOwned(orderId, userId);
    if (order.status === OrderStatus.DELIVERED) {
      return this.requestReturn(orderId, userId, reason ?? 'refund_after_delivery');
    }
    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.FULFILLING
    ) {
      return this.cancel(orderId, userId, reason ?? 'customer_refund');
    }
    throw new BadRequestException(
      'Refund is only available before shipping, or as a return after delivery.',
    );
  }

  async requestReturn(orderId: string, userId: string, reason?: string) {
    const order = await this.getOwned(orderId, userId);
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Return is only available after delivery');
    }
    const deliveredAt = order.deliveredAt ?? order.paidAt ?? order.createdAt;
    const windowMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - deliveredAt.getTime() > windowMs) {
      throw new BadRequestException('Return window of 7 days has closed');
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        returnStatus: ReturnStatus.REQUESTED,
        returnReason: reason ?? 'customer_return',
        returnRequestedAt: new Date(),
      },
    });

    await this.refundSucceededPayment(order.id, userId, reason ?? 'return');
    await this.prisma.order.update({
      where: { id: order.id },
      data: { returnStatus: ReturnStatus.REFUNDED },
    });
    await this.audit(userId, 'ORDER_RETURNED', order.id, { reason });
    return this.getOwned(orderId, userId);
  }

  async startFulfillment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== OrderStatus.PAID) return order;
    const trackingNumber =
      order.trackingNumber ??
      `PS${order.orderNumber.replace(/\W/g, '').slice(-10)}`;
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.FULFILLING,
        packedAt: order.packedAt ?? new Date(),
        trackingNumber,
        courierName: order.courierName ?? 'Pooja Store Delivery',
      },
    });
  }

  async withTracking<T extends { id: string; status: OrderStatus }>(order: T) {
    const advanced = await this.maybeAdvance(order.id);
    const current = advanced ?? order;
    const full = await this.prisma.order.findUniqueOrThrow({
      where: { id: current.id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        shippingAddress: true,
      },
    });
    return {
      ...full,
      tracking: this.buildTracking(full),
    };
  }

  private async maybeAdvance(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return null;
    if (
      TERMINAL.includes(order.status) ||
      order.status === OrderStatus.PENDING_PAYMENT
    ) {
      return order;
    }

    const paidAt = order.paidAt ?? order.createdAt;
    const now = Date.now();
    const { shipAfterMs, outAfterMs, deliverAfterMs } = this.delays();

    if (
      (order.status === OrderStatus.PAID ||
        order.status === OrderStatus.FULFILLING) &&
      now - paidAt.getTime() >= shipAfterMs
    ) {
      const trackingNumber =
        order.trackingNumber ??
        `PS${order.orderNumber.replace(/\W/g, '').slice(-10)}`;
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SHIPPED,
          packedAt: order.packedAt ?? paidAt,
          shippedAt: order.shippedAt ?? new Date(paidAt.getTime() + shipAfterMs),
          trackingNumber,
          courierName: order.courierName ?? 'Pooja Store Delivery',
        },
      });

      void this.push
        .notifyOrderShipped(order.userId, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingNumber,
        })
        .catch(() => undefined);
    }

    const latest = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });
    if (
      latest.status === OrderStatus.SHIPPED &&
      now - paidAt.getTime() >= deliverAfterMs
    ) {
      return this.prisma.order.update({
        where: { id: latest.id },
        data: {
          status: OrderStatus.DELIVERED,
          outForDeliveryAt:
            latest.outForDeliveryAt ??
            new Date(paidAt.getTime() + outAfterMs),
          deliveredAt:
            latest.deliveredAt ?? new Date(paidAt.getTime() + deliverAfterMs),
        },
      });
    }

    if (
      latest.status === OrderStatus.SHIPPED &&
      now - paidAt.getTime() >= outAfterMs &&
      !latest.outForDeliveryAt
    ) {
      return this.prisma.order.update({
        where: { id: latest.id },
        data: { outForDeliveryAt: new Date(paidAt.getTime() + outAfterMs) },
      });
    }

    if (latest.status === OrderStatus.PAID) {
      return this.startFulfillment(latest.id);
    }

    return latest;
  }

  private delays() {
    const production = this.config.get<string>('nodeEnv') === 'production';
    if (production) {
      return {
        shipAfterMs: 24 * 60 * 60 * 1000,
        outAfterMs: 48 * 60 * 60 * 1000,
        deliverAfterMs: 72 * 60 * 60 * 1000,
      };
    }
    return {
      shipAfterMs: 2 * 60 * 1000,
      outAfterMs: 4 * 60 * 1000,
      deliverAfterMs: 6 * 60 * 1000,
    };
  }

  private buildTracking(order: {
    status: OrderStatus;
    createdAt: Date;
    paidAt: Date | null;
    packedAt: Date | null;
    shippedAt: Date | null;
    outForDeliveryAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    trackingNumber: string | null;
    courierName: string | null;
    deliverySlot: string | null;
    returnStatus: ReturnStatus;
  }) {
    const paidAt = order.paidAt ?? order.createdAt;
    const { shipAfterMs, outAfterMs, deliverAfterMs } = this.delays();
    const shippedEta = new Date(paidAt.getTime() + shipAfterMs);
    const outEta = new Date(paidAt.getTime() + outAfterMs);
    const deliveredEta = new Date(paidAt.getTime() + deliverAfterMs);
    const cancelled = order.status === OrderStatus.CANCELLED;
    const refunded = order.status === OrderStatus.REFUNDED;

    const steps: TrackingStep[] = [
      {
        code: 'PLACED',
        label: 'Order placed',
        at: order.createdAt.toISOString(),
        eta: null,
        done: true,
      },
      {
        code: 'PAID',
        label: 'Payment confirmed',
        at: order.paidAt?.toISOString() ?? null,
        eta: null,
        done: !!order.paidAt,
      },
      {
        code: 'PACKED',
        label: 'Packed',
        at: order.packedAt?.toISOString() ?? null,
        eta: order.packedAt ? null : paidAt.toISOString(),
        done: !!order.packedAt || order.status === OrderStatus.FULFILLING,
      },
      {
        code: 'SHIPPED',
        label: 'Shipped',
        at: order.shippedAt?.toISOString() ?? null,
        eta: shippedEta.toISOString(),
        done: !!order.shippedAt || order.status === OrderStatus.SHIPPED,
      },
      {
        code: 'OUT_FOR_DELIVERY',
        label: 'Out for delivery',
        at: order.outForDeliveryAt?.toISOString() ?? null,
        eta: outEta.toISOString(),
        done: !!order.outForDeliveryAt,
      },
      {
        code: 'DELIVERED',
        label: 'Delivered',
        at: order.deliveredAt?.toISOString() ?? null,
        eta: deliveredEta.toISOString(),
        done: order.status === OrderStatus.DELIVERED,
      },
    ];

    if (cancelled || refunded) {
      steps.push({
        code: cancelled ? 'CANCELLED' : 'REFUNDED',
        label: cancelled ? 'Cancelled' : 'Refunded',
        at: (order.cancelledAt ?? new Date()).toISOString(),
        eta: null,
        done: true,
      });
    }

    return {
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      deliverySlot: order.deliverySlot,
      returnStatus: order.returnStatus,
      canCancel:
        !TERMINAL.includes(order.status) &&
        order.status !== OrderStatus.SHIPPED &&
        order.status !== OrderStatus.DELIVERED,
      canRefund:
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.FULFILLING,
      canReturn: order.status === OrderStatus.DELIVERED,
      steps,
    };
  }

  private async refundSucceededPayment(
    orderId: string,
    userId: string,
    reason: string,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.SUCCEEDED },
      orderBy: { createdAt: 'desc' },
    });
    if (!payment) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });
      return;
    }
    await this.refunds.refund({
      paymentId: payment.id,
      reason,
      actorUserId: userId,
    });
  }

  private audit(
    userId: string,
    action: string,
    orderId: string,
    metadata: Prisma.InputJsonValue,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: 'order',
        metadata: { orderId, ...(metadata as object) },
      },
    });
  }
}
