import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PackageBookingStatus,
  PaymentStatus,
  PriestBookingStatus,
  Prisma,
  ReturnStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class AdminOpsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const paidOpen: Prisma.OrderWhereInput = {
      status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING] },
    };
    const [
      ordersPending,
      awaitingConfirmation,
      awaitingVendor,
      awaitingPack,
      ordersShipped,
      ordersDelivered,
      returnsRequested,
      paymentsSucceeded,
      revenue,
      priestConfirmed,
      priestPending,
      packageConfirmed,
      packagePending,
      usersActive,
      promosActive,
    ] = await Promise.all([
      this.prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
      this.prisma.order.count({
        where: { ...paidOpen, confirmedAt: null },
      }),
      this.prisma.order.count({
        where: { ...paidOpen, confirmedAt: { not: null }, vendorNotifiedAt: null },
      }),
      this.prisma.order.count({
        where: {
          ...paidOpen,
          vendorNotifiedAt: { not: null },
          packedAt: null,
        },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({
        where: { returnStatus: ReturnStatus.REQUESTED },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.SUCCEEDED } }),
      this.prisma.payment.aggregate({
        where: { status: { in: [PaymentStatus.SUCCEEDED, PaymentStatus.REFUNDED] } },
        _sum: { amountMinor: true },
      }),
      this.prisma.priestBooking.count({
        where: { status: PriestBookingStatus.CONFIRMED },
      }),
      this.prisma.priestBooking.count({
        where: { status: PriestBookingStatus.PENDING_PAYMENT },
      }),
      this.prisma.packageBooking.count({
        where: { status: PackageBookingStatus.CONFIRMED },
      }),
      this.prisma.packageBooking.count({
        where: { status: PackageBookingStatus.PENDING_PAYMENT },
      }),
      this.prisma.user.count({
        where: { status: 'ACTIVE', role: Role.CUSTOMER, deletedAt: null },
      }),
      this.prisma.promoCode.count({ where: { isActive: true } }),
    ]);

    return {
      orders: {
        pendingPayment: ordersPending,
        awaitingConfirmation,
        awaitingVendor,
        awaitingFulfillment: awaitingPack,
        shipped: ordersShipped,
        delivered: ordersDelivered,
        returnsRequested,
      },
      payments: {
        succeeded: paymentsSucceeded,
        capturedMinor: revenue._sum.amountMinor ?? 0,
      },
      priestBookings: { confirmed: priestConfirmed, pendingPayment: priestPending },
      packageBookings: {
        confirmed: packageConfirmed,
        pendingPayment: packagePending,
      },
      usersActive,
      promosActive,
    };
  }

  async listOrders(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    q?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const q = params.q?.trim();
    const where: Prisma.OrderWhereInput = {
      ...orderStatusWhere(params.status),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: 'insensitive' } },
              { user: { fullName: { contains: q, mode: 'insensitive' } } },
              { user: { phoneE164: { contains: q } } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, phoneE164: true, fullName: true, email: true },
          },
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          items: true,
          shippingAddress: true,
          promoCode: { select: { code: true } },
          vendor: { select: { id: true, name: true, phoneE164: true } },
          priestBooking: { select: { id: true, bookingNumber: true, status: true } },
          packageBooking: {
            select: { id: true, bookingNumber: true, status: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async listVendors() {
    return this.prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async listPayments(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = params.status
      ? { status: params.status as PaymentStatus }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              user: { select: { fullName: true, phoneE164: true, email: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async listAuditLogs(params: { page?: number; pageSize?: number; q?: string }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 30;
    const q = params.q?.trim();
    const where: Prisma.AuditLogWhereInput = q
      ? {
          OR: [
            { action: { contains: q, mode: 'insensitive' } },
            { resource: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { fullName: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }
}

function orderStatusWhere(status?: string): Prisma.OrderWhereInput {
  if (!status) return {};
  if (status === 'TO_CONFIRM') {
    return {
      status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING] },
      confirmedAt: null,
    };
  }
  if (status === 'AWAITING_VENDOR') {
    return {
      status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING] },
      confirmedAt: { not: null },
      vendorNotifiedAt: null,
    };
  }
  if (status === 'TO_PACK') {
    return {
      status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING] },
      vendorNotifiedAt: { not: null },
      packedAt: null,
    };
  }
  return { status: status as OrderStatus };
}
