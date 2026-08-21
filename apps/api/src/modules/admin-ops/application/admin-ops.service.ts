import { Injectable } from '@nestjs/common';
import { OrderStatus, PackageBookingStatus, PriestBookingStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class AdminOpsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      ordersPending,
      ordersPaid,
      priestConfirmed,
      priestPending,
      packageConfirmed,
      packagePending,
      usersActive,
    ] = await Promise.all([
      this.prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
      this.prisma.order.count({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING] },
        },
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
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      orders: { pendingPayment: ordersPending, paid: ordersPaid },
      priestBookings: { confirmed: priestConfirmed, pendingPayment: priestPending },
      packageBookings: {
        confirmed: packageConfirmed,
        pendingPayment: packagePending,
      },
      usersActive,
    };
  }

  async listOrders(params: { page?: number; pageSize?: number; status?: string }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where = params.status
      ? { status: params.status as OrderStatus }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, phoneE164: true, fullName: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          items: true,
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
}
