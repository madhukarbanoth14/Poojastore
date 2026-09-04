import {
  BadRequestException,
  Inject,
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
import {
  SMS_SENDER,
  type SmsSenderPort,
} from '../../auth/application/ports/sms-sender.port';
import {
  InvalidPhoneError,
  parseMobileInput,
} from '../../auth/domain/phone';
import { formatVendorDispatchSms } from './vendor-dispatch-message';

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
    @Inject(SMS_SENDER) private readonly sms: SmsSenderPort,
  ) {}

  async getOwned(orderId: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, ...(isAdmin ? {} : { userId }) },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        shippingAddress: true,
        promoCode: { select: { id: true, code: true, discountType: true } },
        vendor: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.withTracking(order, isAdmin);
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
    if (
      order.status === OrderStatus.REFUNDED ||
      order.returnStatus === ReturnStatus.REFUNDED
    ) {
      return this.getOwned(orderId, userId);
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Return is only available after delivery');
    }
    if (order.returnStatus === ReturnStatus.REJECTED) {
      throw new BadRequestException('This return was already rejected');
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
        returnRequestedAt: order.returnRequestedAt ?? new Date(),
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

  async adminFulfill(
    orderId: string,
    adminUserId: string,
    input: {
      step: 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
      trackingNumber?: string;
      courierName?: string;
    },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (TERMINAL.includes(order.status) || order.status === OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('This order cannot be moved in fulfillment');
    }
    if (!order.confirmedAt && !order.packedAt && !order.shippedAt) {
      throw new BadRequestException('Confirm the order before packing or shipping');
    }
    if (!order.vendorNotifiedAt && !order.packedAt && !order.shippedAt) {
      throw new BadRequestException(
        'Send the order to a vendor before packing or shipping',
      );
    }

    const now = new Date();
    const trackingNumber =
      input.trackingNumber?.trim() ||
      order.trackingNumber ||
      `PS${order.orderNumber.replace(/\W/g, '').slice(-10)}`;
    const courierName =
      input.courierName?.trim() || order.courierName || 'Pooja Store Delivery';
    const rank = { PACKED: 1, SHIPPED: 2, OUT_FOR_DELIVERY: 3, DELIVERED: 4 }[
      input.step
    ];

    const data: Prisma.OrderUpdateInput = {
      trackingNumber,
      courierName,
      packedAt: order.packedAt ?? now,
    };
    if (rank >= 1) {
      data.status = OrderStatus.FULFILLING;
    }
    if (rank >= 2) {
      data.status = OrderStatus.SHIPPED;
      data.shippedAt = order.shippedAt ?? now;
    }
    if (rank >= 3) {
      data.outForDeliveryAt = order.outForDeliveryAt ?? now;
    }
    if (rank >= 4) {
      data.status = OrderStatus.DELIVERED;
      data.deliveredAt = order.deliveredAt ?? now;
    }

    await this.prisma.order.update({ where: { id: order.id }, data });
    await this.audit(adminUserId, 'ORDER_FULFILLMENT_UPDATED', order.id, {
      step: input.step,
      trackingNumber,
    });

    if (rank >= 2 && !order.shippedAt) {
      void this.push
        .notifyOrderShipped(order.userId, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingNumber,
        })
        .catch(() => undefined);
    }

    return this.getOwned(orderId, adminUserId, true);
  }

  async adminConfirm(orderId: string, adminUserId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (TERMINAL.includes(order.status) || order.status === OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('This order cannot be confirmed');
    }
    if (!order.paidAt) {
      throw new BadRequestException('Payment is not confirmed yet');
    }
    if (!order.confirmedAt) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { confirmedAt: new Date() },
      });
      await this.audit(adminUserId, 'ORDER_CONFIRMED', order.id, {});
    }
    return this.getOwned(orderId, adminUserId, true);
  }

  async adminDispatchVendor(
    orderId: string,
    adminUserId: string,
    input: { vendorId?: string; vendorPhone?: string; vendorName?: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        user: {
          select: { fullName: true, phoneE164: true, email: true },
        },
        vendor: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (TERMINAL.includes(order.status) || order.status === OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('This order cannot be sent to a vendor');
    }
    if (!order.paidAt) {
      throw new BadRequestException('Payment is not confirmed yet');
    }
    if (!order.confirmedAt) {
      throw new BadRequestException('Confirm the order before sending it to a vendor');
    }

    const vendor = await this.resolveVendor(order.vendorId, input);
    const message = formatVendorDispatchSms({
      orderNumber: order.orderNumber,
      deliverySlot: order.deliverySlot,
      totalMinor: order.totalMinor,
      currency: order.currency,
      user: order.user,
      shippingAddress: order.shippingAddress,
      items: order.items,
    });

    try {
      await this.sms.sendMessage(vendor.phoneE164, message);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'SMS provider failed';
      throw new BadRequestException(`Could not SMS the vendor: ${detail}`);
    }

    const now = new Date();
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        vendorId: vendor.id,
        vendorNotifiedAt: now,
        status:
          order.status === OrderStatus.PAID
            ? OrderStatus.FULFILLING
            : order.status,
      },
    });
    await this.audit(adminUserId, 'ORDER_SENT_TO_VENDOR', order.id, {
      vendorId: vendor.id,
      vendorPhone: vendor.phoneE164,
      vendorName: vendor.name,
    });

    const updated = await this.getOwned(orderId, adminUserId, true);
    return {
      ...updated,
      vendorSlip: {
        phoneE164: vendor.phoneE164,
        vendorName: vendor.name,
        message,
        sentAt: now.toISOString(),
      },
    };
  }

  private async resolveVendor(
    currentVendorId: string | null,
    input: { vendorId?: string; vendorPhone?: string; vendorName?: string },
  ) {
    let phoneE164: string | undefined;
    if (input.vendorPhone?.trim()) {
      try {
        phoneE164 = parseMobileInput(input.vendorPhone).phoneE164;
      } catch (error) {
        if (error instanceof InvalidPhoneError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }
    }

    if (input.vendorId) {
      const chosen = await this.prisma.vendor.findFirst({
        where: { id: input.vendorId, isActive: true },
      });
      if (!chosen) throw new BadRequestException('Vendor not found');
      if (phoneE164 && phoneE164 !== chosen.phoneE164) {
        return this.prisma.vendor.update({
          where: { id: chosen.id },
          data: {
            phoneE164,
            name: input.vendorName?.trim() || chosen.name,
          },
        });
      }
      return chosen;
    }

    if (phoneE164) {
      const byPhone = await this.prisma.vendor.findUnique({
        where: { phoneE164 },
      });
      if (byPhone) {
        if (input.vendorName?.trim() && input.vendorName.trim() !== byPhone.name) {
          return this.prisma.vendor.update({
            where: { id: byPhone.id },
            data: { name: input.vendorName.trim(), isActive: true },
          });
        }
        return byPhone;
      }
      return this.prisma.vendor.create({
        data: {
          name: input.vendorName?.trim() || 'Packing vendor',
          phoneE164,
          isActive: true,
        },
      });
    }

    if (currentVendorId) {
      const current = await this.prisma.vendor.findFirst({
        where: { id: currentVendorId, isActive: true },
      });
      if (current) return current;
    }

    const fallback = await this.prisma.vendor.findFirst({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    if (fallback) return fallback;

    const envPhone = this.config.get<string>('vendor.phoneE164')?.trim();
    if (envPhone) {
      try {
        const parsed = parseMobileInput(envPhone);
        return this.prisma.vendor.create({
          data: {
            name: this.config.get<string>('vendor.name') || 'Packing vendor',
            phoneE164: parsed.phoneE164,
            isDefault: true,
            isActive: true,
          },
        });
      } catch (error) {
        if (error instanceof InvalidPhoneError) {
          throw new BadRequestException(
            'VENDOR_PHONE_E164 is not a valid mobile number',
          );
        }
        throw error;
      }
    }

    throw new BadRequestException(
      'Enter the vendor mobile number so we can SMS the packing slip',
    );
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

  async withTracking<T extends { id: string; status: OrderStatus }>(
    order: T,
    includeVendor = false,
  ) {
    const advanced = await this.maybeAdvance(order.id);
    const current = advanced ?? order;
    const full = await this.prisma.order.findUniqueOrThrow({
      where: { id: current.id },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
        shippingAddress: true,
        promoCode: { select: { id: true, code: true, discountType: true } },
        user: { select: { id: true, fullName: true, phoneE164: true, email: true } },
        vendor: true,
      },
    });
    const { vendor, ...rest } = full;
    return {
      ...rest,
      ...(includeVendor ? { vendor } : {}),
      tracking: this.buildTracking(full),
    };
  }

  private async maybeAdvance(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return null;
    if (!this.config.get<boolean>('orders.autoAdvance')) {
      return order;
    }
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
    confirmedAt: Date | null;
    vendorNotifiedAt: Date | null;
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
        code: 'CONFIRMED',
        label: 'Order confirmed',
        at: order.confirmedAt?.toISOString() ?? null,
        eta: null,
        done: !!order.confirmedAt || !!order.packedAt || !!order.shippedAt,
      },
      {
        code: 'VENDOR_ASSIGNED',
        label: 'Being prepared',
        at: order.vendorNotifiedAt?.toISOString() ?? null,
        eta: null,
        done: !!order.vendorNotifiedAt || !!order.packedAt,
      },
      {
        code: 'PACKED',
        label: 'Packed',
        at: order.packedAt?.toISOString() ?? null,
        eta: order.packedAt ? null : paidAt.toISOString(),
        done: !!order.packedAt,
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
    } else if (order.returnStatus === ReturnStatus.REQUESTED) {
      steps.push({
        code: 'RETURN_REQUESTED',
        label: 'Return requested',
        at: null,
        eta: null,
        done: true,
      });
    }

    const nextFulfillment = (():
      | 'CONFIRMED'
      | 'DISPATCH_VENDOR'
      | 'PACKED'
      | 'SHIPPED'
      | 'OUT_FOR_DELIVERY'
      | 'DELIVERED'
      | null => {
      if (TERMINAL.includes(order.status) || order.status === OrderStatus.PENDING_PAYMENT) {
        return null;
      }
      const fulfillmentStarted = !!(
        order.packedAt ||
        order.shippedAt ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      );
      if (!order.confirmedAt && !fulfillmentStarted) return 'CONFIRMED';
      if (!order.vendorNotifiedAt && !fulfillmentStarted) return 'DISPATCH_VENDOR';
      if (!order.packedAt) return 'PACKED';
      if (!order.shippedAt) return 'SHIPPED';
      if (!order.outForDeliveryAt) return 'OUT_FOR_DELIVERY';
      if (order.status !== OrderStatus.DELIVERED) return 'DELIVERED';
      return null;
    })();

    return {
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      deliverySlot: order.deliverySlot,
      returnStatus: order.returnStatus,
      nextFulfillment,
      canConfirm:
        !!order.paidAt && !order.confirmedAt && nextFulfillment === 'CONFIRMED',
      canDispatchVendor:
        !!order.confirmedAt &&
        !TERMINAL.includes(order.status) &&
        order.status !== OrderStatus.SHIPPED &&
        order.status !== OrderStatus.DELIVERED,
      canCancel:
        !TERMINAL.includes(order.status) &&
        order.status !== OrderStatus.SHIPPED &&
        order.status !== OrderStatus.DELIVERED,
      canRefund:
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.FULFILLING,
      canReturn:
        order.status === OrderStatus.DELIVERED &&
        order.returnStatus !== ReturnStatus.REFUNDED,
      steps,
    };
  }

  private async refundSucceededPayment(
    orderId: string,
    userId: string,
    reason: string,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: [PaymentStatus.SUCCEEDED, PaymentStatus.REFUNDED] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!payment) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      const delivered = order?.status === OrderStatus.DELIVERED;
      await this.prisma.order.update({
        where: { id: orderId },
        data: delivered
          ? {
              status: OrderStatus.REFUNDED,
              returnStatus: ReturnStatus.REFUNDED,
            }
          : {
              status: OrderStatus.CANCELLED,
              cancelledAt: new Date(),
              cancelReason: reason,
            },
      });
      return;
    }
    if (payment.status === PaymentStatus.REFUNDED) return;
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
