import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ConsultationMedia,
  Market,
  OrderStatus,
  PaymentStatus,
  PriestBookingStatus,
  PriestServiceMode,
  ProductType,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PaymentOrchestratorService } from '../../payments/application/payment-orchestrator.service';
import { AgoraTokenService } from '../infrastructure/agora-token.service';
import { MeetingLinkService } from '../infrastructure/meeting-link.service';
import { CreatePriestBookingDto } from '../presentation/dto/priest.dto';

@Injectable()
export class PriestBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentOrchestratorService,
    private readonly meetings: MeetingLinkService,
    private readonly agora: AgoraTokenService,
  ) {}

  async list(params: {
    city?: string;
    specialization?: string;
    language?: string;
    market?: Market;
  }) {
    const items = await this.prisma.priest.findMany({
      where: {
        isActive: true,
        market: params.market ?? Market.IN,
        ...(params.city
          ? { city: { equals: params.city, mode: 'insensitive' } }
          : {}),
        ...(params.specialization
          ? { specializations: { has: params.specialization } }
          : {}),
        ...(params.language ? { languages: { has: params.language } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { ratingAvg: 'desc' }],
      include: {
        _count: {
          select: {
            slots: { where: { isBooked: false, startsAt: { gte: new Date() } } },
          },
        },
      },
    });
    return { items };
  }

  async bySlug(slug: string) {
    const priest = await this.prisma.priest.findFirst({
      where: { slug, isActive: true },
      include: {
        slots: {
          where: { isBooked: false, startsAt: { gte: new Date() } },
          orderBy: { startsAt: 'asc' },
          take: 30,
        },
      },
    });
    if (!priest) throw new NotFoundException('Priest not found');
    return priest;
  }

  async createBooking(
    userId: string,
    slug: string,
    dto: CreatePriestBookingDto,
  ) {
    const priest = await this.prisma.priest.findFirst({
      where: { slug, isActive: true },
    });
    if (!priest) throw new NotFoundException('Priest not found');

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Service address not found');

    const slot = await this.prisma.priestSlot.findFirst({
      where: {
        id: dto.slotId,
        priestId: priest.id,
        isBooked: false,
        startsAt: { gte: new Date() },
      },
    });
    if (!slot) {
      throw new BadRequestException('Slot unavailable');
    }

    const serviceMode = dto.serviceMode ?? PriestServiceMode.HOME_VISIT;
    const consultationMedia =
      serviceMode === PriestServiceMode.ONLINE
        ? (dto.consultationMedia ?? ConsultationMedia.VIDEO)
        : null;
    const amountMinor =
      serviceMode === PriestServiceMode.ONLINE
        ? priest.basePriceMinor
        : priest.basePriceMinor + priest.travelFeeMinor;
    const bookingNumber = `PB${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;
    const orderNumber = `PS${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;

    const serviceProduct = await this.ensureServiceProduct(priest.market);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const { booking, order } = await this.prisma.$transaction(async (tx) => {
      const locked = await tx.priestSlot.updateMany({
        where: { id: slot.id, isBooked: false },
        data: { isBooked: true },
      });
      if (locked.count !== 1) {
        throw new BadRequestException('Slot just became unavailable');
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING_PAYMENT,
          market: priest.market,
          currency: priest.currency,
          subtotalMinor: amountMinor,
          shippingMinor: 0,
          taxMinor: 0,
          discountMinor: 0,
          totalMinor: amountMinor,
          shippingAddressId: address.id,
          items: {
            create: [
              {
                productId: serviceProduct.id,
                productName: `${dto.serviceName} — ${priest.fullName}`,
                quantity: 1,
                unitPriceMinor: amountMinor,
                totalMinor: amountMinor,
              },
            ],
          },
        },
        include: { items: true },
      });

      const createdBooking = await tx.priestBooking.create({
        data: {
          bookingNumber,
          userId,
          priestId: priest.id,
          slotId: slot.id,
          addressId: address.id,
          serviceName: dto.serviceName,
          serviceMode,
          consultationMedia,
          notes: dto.notes,
          status: PriestBookingStatus.PENDING_PAYMENT,
          market: priest.market,
          currency: priest.currency,
          amountMinor,
          orderId: createdOrder.id,
        },
        include: {
          priest: true,
          slot: true,
          address: true,
        },
      });

      return { booking: createdBooking, order: createdOrder };
    });

    let hydratedBooking = booking;
    if (serviceMode === PriestServiceMode.ONLINE) {
      hydratedBooking = await this.ensureMeeting(booking.id);
    }

    const session = await this.payments.createSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountMinor: order.totalMinor,
      currency: order.currency,
      market: order.market,
      customer: {
        id: user.id,
        email: user.email,
        phoneE164: user.phoneE164,
        fullName: user.fullName,
      },
      lineItems: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitAmountMinor: item.unitPriceMinor,
      })),
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: session.provider,
        status: PaymentStatus.REQUIRES_ACTION,
        amountMinor: order.totalMinor,
        currency: order.currency,
        providerOrderId: session.providerOrderId,
        providerPaymentId: session.providerPaymentId,
        clientSecret: session.clientSecret,
        checkoutUrl: session.checkoutUrl,
        metadata: {
          ...(session.metadata ?? {}),
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
        },
      },
    });

    return {
      booking: hydratedBooking,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalMinor: order.totalMinor,
        currency: order.currency,
        status: order.status,
      },
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
        clientSecret: payment.clientSecret,
        providerOrderId: payment.providerOrderId,
      },
    };
  }

  async myBookings(userId: string) {
    const items = await this.prisma.priestBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        priest: {
          select: { slug: true, fullName: true, city: true, photoUrl: true },
        },
        slot: true,
        order: {
          include: {
            payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });
    return { items };
  }

  async bookingDetail(userId: string, id: string, isAdmin: boolean) {
    const booking = await this.prisma.priestBooking.findFirst({
      where: { id },
      include: {
        priest: true,
        slot: true,
        address: true,
        user: { select: { id: true, phoneE164: true, fullName: true } },
        order: { include: { payments: true, items: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const ownsAsCustomer = booking.userId === userId;
    const ownsAsPriest = booking.priest.userId === userId;
    if (!isAdmin && !ownsAsCustomer && !ownsAsPriest) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.serviceMode === PriestServiceMode.ONLINE) {
      return this.ensureMeeting(booking.id);
    }
    return booking;
  }

  async mySchedule(userId: string) {
    const priest = await this.prisma.priest.findUnique({
      where: { userId },
    });
    if (!priest) {
      throw new NotFoundException('No pujari profile is linked to this account');
    }

    const timezone = 'Asia/Kolkata';
    const todayKey = ymdInZone(new Date(), timezone);
    const rangeStart = startOfLocalDay(todayKey, timezone);
    const tomorrowKey = ymdInZone(
      new Date(rangeStart.getTime() + 36 * 60 * 60 * 1000),
      timezone,
    );

    const items = await this.prisma.priestBooking.findMany({
      where: {
        priestId: priest.id,
        status: PriestBookingStatus.CONFIRMED,
        slot: { startsAt: { gte: rangeStart } },
      },
      orderBy: { slot: { startsAt: 'asc' } },
      include: {
        slot: true,
        address: true,
        user: { select: { id: true, phoneE164: true, fullName: true } },
      },
    });

    const hydrated = [];
    for (const item of items) {
      hydrated.push(
        item.serviceMode === PriestServiceMode.ONLINE
          ? await this.ensureMeeting(item.id)
          : item,
      );
    }

    const today = [];
    const tomorrow = [];
    const upcoming = [];
    for (const item of hydrated) {
      const key = ymdInZone(item.slot.startsAt, timezone);
      if (key === todayKey) today.push(item);
      else if (key === tomorrowKey) tomorrow.push(item);
      else upcoming.push(item);
    }

    return {
      priest: {
        id: priest.id,
        slug: priest.slug,
        fullName: priest.fullName,
        city: priest.city,
      },
      timezone,
      today,
      tomorrow,
      upcoming,
    };
  }

  async ensureMeeting(bookingId: string) {
    const booking = await this.prisma.priestBooking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        priest: true,
        address: true,
        user: { select: { id: true, phoneE164: true, fullName: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (
      booking.serviceMode !== PriestServiceMode.ONLINE ||
      booking.meetingJoinUrl
    ) {
      return booking;
    }

    const durationMinutes = Math.max(
      30,
      Math.round(
        (booking.slot.endsAt.getTime() - booking.slot.startsAt.getTime()) /
          60000,
      ),
    );
    const meeting = await this.meetings.createForBooking({
      bookingNumber: booking.bookingNumber,
      bookingId: booking.id,
      serviceName: booking.serviceName,
      startsAt: booking.slot.startsAt,
      durationMinutes,
    });

    return this.prisma.priestBooking.update({
      where: { id: booking.id },
      data: {
        meetingProvider: meeting.provider,
        meetingId: meeting.meetingId,
        meetingJoinUrl: meeting.joinUrl,
        meetingHostUrl: meeting.hostUrl,
      },
      include: {
        slot: true,
        priest: true,
        address: true,
        user: { select: { id: true, phoneE164: true, fullName: true } },
      },
    });
  }

  async joinConsultation(params: {
    bookingId: string;
    actorUserId: string;
    isAdmin: boolean;
  }) {
    const booking = await this.bookingDetail(
      params.actorUserId,
      params.bookingId,
      params.isAdmin,
    );
    if (booking.serviceMode !== PriestServiceMode.ONLINE) {
      throw new BadRequestException('This booking is not an online consultation');
    }
    if (
      booking.status !== PriestBookingStatus.CONFIRMED &&
      booking.status !== PriestBookingStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException('Consultation is not available yet');
    }

    const ownsAsPriest = booking.priest.userId === params.actorUserId;
    const peerName = ownsAsPriest
      ? (booking.user.fullName ?? booking.user.phoneE164)
      : booking.priest.fullName;

    const payload: Record<string, unknown> = {
      id: booking.id,
      serviceMode: booking.serviceMode,
      consultationMedia: booking.consultationMedia ?? ConsultationMedia.VIDEO,
      meetingProvider: booking.meetingProvider,
      meetingJoinUrl: booking.meetingJoinUrl,
      meetingHostUrl: booking.meetingHostUrl,
      meetingId: booking.meetingId,
      peerName,
    };

    if (booking.meetingProvider === 'agora' && booking.meetingId) {
      payload.agora = this.agora.createRtcToken({
        channelName: booking.meetingId,
        userId: params.actorUserId,
      });
    }

    return payload;
  }

  async adminList() {
    const items = await this.prisma.priestBooking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        priest: { select: { fullName: true, slug: true, city: true } },
        slot: true,
        user: { select: { id: true, phoneE164: true, fullName: true } },
      },
    });
    return { items };
  }

  async cancelBooking(params: {
    bookingId: string;
    actorUserId: string;
    isAdmin: boolean;
    reason?: string;
  }) {
    const booking = await this.prisma.priestBooking.findUnique({
      where: { id: params.bookingId },
      include: { slot: true, packageBooking: true, order: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!params.isAdmin && booking.userId !== params.actorUserId) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.packageBooking) {
      throw new BadRequestException(
        'Cancel the package booking instead; this priest booking is part of a package',
      );
    }
    if (
      booking.status === PriestBookingStatus.CANCELLED ||
      booking.status === PriestBookingStatus.COMPLETED ||
      booking.status === PriestBookingStatus.FAILED
    ) {
      throw new BadRequestException(`Cannot cancel booking in status ${booking.status}`);
    }
    if (booking.slot.startsAt.getTime() <= Date.now() && !params.isAdmin) {
      throw new BadRequestException('Cannot cancel after the slot has started');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.priestSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
      const cancelled = await tx.priestBooking.update({
        where: { id: booking.id },
        data: {
          status: PriestBookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: params.reason,
          cancelledByUserId: params.actorUserId,
        },
        include: { priest: true, slot: true },
      });
      if (booking.orderId) {
        const orderStatus =
          booking.status === PriestBookingStatus.PENDING_PAYMENT
            ? OrderStatus.CANCELLED
            : booking.order?.status;
        if (
          booking.status === PriestBookingStatus.PENDING_PAYMENT &&
          orderStatus
        ) {
          await tx.order.update({
            where: { id: booking.orderId },
            data: { status: OrderStatus.CANCELLED },
          });
        }
      }
      await tx.auditLog.create({
        data: {
          userId: params.actorUserId,
          action: 'PRIEST_BOOKING_CANCELLED',
          resource: 'priest_booking',
          metadata: {
            bookingId: booking.id,
            reason: params.reason,
            previousStatus: booking.status,
          },
        },
      });
      return cancelled;
    });

    return {
      booking: updated,
      refundSuggested: booking.status === PriestBookingStatus.CONFIRMED,
      orderId: booking.orderId,
    };
  }

  async rescheduleBooking(params: {
    bookingId: string;
    actorUserId: string;
    isAdmin: boolean;
    newSlotId: string;
    reason?: string;
  }) {
    const booking = await this.prisma.priestBooking.findUnique({
      where: { id: params.bookingId },
      include: { slot: true, packageBooking: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!params.isAdmin && booking.userId !== params.actorUserId) {
      throw new NotFoundException('Booking not found');
    }
    if (
      booking.status !== PriestBookingStatus.CONFIRMED &&
      booking.status !== PriestBookingStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException(
        `Cannot reschedule booking in status ${booking.status}`,
      );
    }
    if (booking.slot.startsAt.getTime() <= Date.now() && !params.isAdmin) {
      throw new BadRequestException('Cannot reschedule after the slot has started');
    }
    if (params.newSlotId === booking.slotId) {
      throw new BadRequestException('New slot must be different');
    }

    const newSlot = await this.prisma.priestSlot.findFirst({
      where: {
        id: params.newSlotId,
        priestId: booking.priestId,
        isBooked: false,
        startsAt: { gte: new Date() },
      },
    });
    if (!newSlot) throw new BadRequestException('New slot unavailable');

    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.priestSlot.updateMany({
        where: { id: newSlot.id, isBooked: false },
        data: { isBooked: true },
      });
      if (locked.count !== 1) {
        throw new BadRequestException('New slot just became unavailable');
      }
      await tx.priestSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
      const updated = await tx.priestBooking.update({
        where: { id: booking.id },
        data: {
          slotId: newSlot.id,
          rescheduledFromSlotId: booking.slotId,
          notes: params.reason
            ? `${booking.notes ?? ''}\n[Reschedule] ${params.reason}`.trim()
            : booking.notes,
        },
        include: { priest: true, slot: true, address: true },
      });
      await tx.auditLog.create({
        data: {
          userId: params.actorUserId,
          action: 'PRIEST_BOOKING_RESCHEDULED',
          resource: 'priest_booking',
          metadata: {
            bookingId: booking.id,
            fromSlotId: booking.slotId,
            toSlotId: newSlot.id,
            reason: params.reason,
          },
        },
      });
      return updated;
    });
  }

  private async ensureServiceProduct(market: Market) {
    const slug =
      market === Market.IN
        ? 'priest-home-puja-service'
        : `priest-home-puja-service-${market.toLowerCase()}`;
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) return existing;

    const currency =
      market === Market.IN ? 'INR' : market === Market.US ? 'USD' : 'CAD';
    return this.prisma.product.create({
      data: {
        slug,
        name: 'Priest Home Puja Service',
        description: 'In-home priest booking service line item.',
        type: ProductType.SERVICE_ADDON,
        market,
        currency,
        priceMinor: 0,
        isActive: true,
        sortOrder: 99,
      },
    });
  }
}

function ymdInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function startOfLocalDay(localDate: string, timeZone: string): Date {
  if (timeZone === 'Asia/Kolkata') {
    return new Date(`${localDate}T00:00:00+05:30`);
  }
  return new Date(`${localDate}T00:00:00.000Z`);
}
