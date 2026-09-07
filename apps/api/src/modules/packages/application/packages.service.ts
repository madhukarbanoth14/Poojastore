import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Market,
  OrderStatus,
  PackageBookingStatus,
  PaymentStatus,
  PriestBookingStatus,
  Prisma,
  ProductType,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PaymentOrchestratorService } from '../../payments/application/payment-orchestrator.service';
import { BookPackageDto } from '../presentation/dto/package.dto';

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentOrchestratorService,
  ) {}

  async list(market?: Market) {
    const [packages, addons] = await Promise.all([
      this.prisma.pujaPackage.findMany({
        where: { isActive: true, market: market ?? Market.IN },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      }),
      this.prisma.packageAddon.findMany({
        where: { isActive: true, market: market ?? Market.IN },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      }),
    ]);
    return { items: packages, addons };
  }

  async bySlug(slug: string) {
    const pkg = await this.prisma.pujaPackage.findFirst({
      where: { slug, isActive: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const [kit, prasad, addons, priests] = await Promise.all([
      pkg.kitProductSlug
        ? this.prisma.product.findFirst({
            where: { slug: pkg.kitProductSlug, isActive: true },
          })
        : null,
      pkg.prasadProductSlug
        ? this.prisma.product.findFirst({
            where: { slug: pkg.prasadProductSlug, isActive: true },
          })
        : null,
      this.prisma.packageAddon.findMany({
        where: { isActive: true, market: pkg.market },
        orderBy: { sortOrder: 'asc' },
      }),
      pkg.allowsPriest
        ? this.prisma.priest.findMany({
            where: { isActive: true, market: pkg.market },
            orderBy: { ratingAvg: 'desc' },
            take: 10,
            include: {
              slots: {
                where: { isBooked: false, startsAt: { gte: new Date() } },
                orderBy: { startsAt: 'asc' },
                take: 8,
              },
            },
          })
        : [],
    ]);

    return { ...pkg, kit, prasad, addons, priests };
  }

  async book(userId: string, slug: string, dto: BookPackageDto) {
    const pkg = await this.prisma.pujaPackage.findFirst({
      where: { slug, isActive: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    const includeKit = dto.includeKit ?? pkg.allowsKit;
    const includePriest = dto.includePriest ?? false;
    const includePrasad = dto.includePrasad ?? false;

    if (includeKit && !pkg.allowsKit) {
      throw new BadRequestException('This package does not include a kit');
    }
    if (includePriest && !pkg.allowsPriest) {
      throw new BadRequestException('This package does not include a priest');
    }
    if (includePrasad && !pkg.allowsPrasad) {
      throw new BadRequestException('This package does not include prasad');
    }
    if (!includeKit && !includePriest && !includePrasad && !(dto.addonSlugs?.length)) {
      throw new BadRequestException('Select at least one component or add-on');
    }
    if (includePriest && !dto.priestSlotId) {
      throw new BadRequestException('priestSlotId is required when including priest');
    }

    const breakdown: Array<{
      key: string;
      label: string;
      amountMinor: number;
      productId?: string;
    }> = [];

    if (includeKit) {
      if (!pkg.kitProductSlug) throw new BadRequestException('Kit not configured');
      const kit = await this.prisma.product.findFirst({
        where: { slug: pkg.kitProductSlug, isActive: true },
      });
      if (!kit) throw new BadRequestException('Kit product unavailable');
      breakdown.push({
        key: 'kit',
        label: kit.name,
        amountMinor: kit.priceMinor,
        productId: kit.id,
      });
    }

    if (includePrasad) {
      if (!pkg.prasadProductSlug) {
        throw new BadRequestException('Prasad not configured');
      }
      const prasad = await this.prisma.product.findFirst({
        where: { slug: pkg.prasadProductSlug, isActive: true },
      });
      if (!prasad) throw new BadRequestException('Prasad product unavailable');
      breakdown.push({
        key: 'prasad',
        label: prasad.name,
        amountMinor: prasad.priceMinor,
        productId: prasad.id,
      });
    }

    let priest = null;
    let slot = null;
    if (includePriest) {
      slot = await this.prisma.priestSlot.findFirst({
        where: {
          id: dto.priestSlotId!,
          isBooked: false,
          startsAt: { gte: new Date() },
        },
        include: { priest: true },
      });
      if (!slot || !slot.priest.isActive) {
        throw new BadRequestException('Priest slot unavailable');
      }
      priest = slot.priest;
      const priestAmount = priest.basePriceMinor + priest.travelFeeMinor;
      const priestProduct = await this.ensureServiceProduct(
        'priest-home-puja-service',
        'Priest Home Puja Service',
        pkg.market,
      );
      breakdown.push({
        key: 'priest',
        label: `Priest — ${priest.fullName}`,
        amountMinor: priestAmount,
        productId: priestProduct.id,
      });
    }

    const addonSlugs = dto.addonSlugs ?? [];
    if (addonSlugs.length) {
      const addons = await this.prisma.packageAddon.findMany({
        where: {
          slug: { in: addonSlugs },
          isActive: true,
          market: pkg.market,
        },
      });
      if (addons.length !== addonSlugs.length) {
        throw new BadRequestException('One or more add-ons are invalid');
      }
      for (const addon of addons) {
        const product = await this.ensureServiceProduct(
          `addon-${addon.slug}`,
          addon.title,
          pkg.market,
          addon.priceMinor,
        );
        breakdown.push({
          key: `addon:${addon.slug}`,
          label: addon.title,
          amountMinor: addon.priceMinor,
          productId: product.id,
        });
      }
    }

    const subtotalMinor = breakdown.reduce((s, b) => s + b.amountMinor, 0);
    const componentsSelected =
      Number(includeKit) + Number(includePriest) + Number(includePrasad);
    const discountMinor =
      componentsSelected >= 2 ? pkg.packageDiscountMinor : 0;
    const totalMinor = Math.max(subtotalMinor - discountMinor, 0);

    const bookingNumber = `PK${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;
    const orderNumber = `PS${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const { packageBooking, order } = await this.prisma.$transaction(
      async (tx) => {
        if (slot) {
          const locked = await tx.priestSlot.updateMany({
            where: { id: slot!.id, isBooked: false },
            data: { isBooked: true },
          });
          if (locked.count !== 1) {
            throw new BadRequestException('Priest slot just became unavailable');
          }
        }

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: OrderStatus.PENDING_PAYMENT,
            market: pkg.market,
            currency: pkg.currency,
            subtotalMinor,
            shippingMinor: 0,
            taxMinor: 0,
            discountMinor,
            totalMinor,
            shippingAddressId: address.id,
            items: {
              create: breakdown.map((line) => ({
                productId: line.productId!,
                productName: line.label,
                quantity: 1,
                unitPriceMinor: line.amountMinor,
                totalMinor: line.amountMinor,
              })),
            },
          },
          include: { items: true },
        });

        let priestBookingId: string | undefined;
        if (priest && slot) {
          const pb = await tx.priestBooking.create({
            data: {
              bookingNumber: `PB${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
              userId,
              priestId: priest.id,
              slotId: slot.id,
              addressId: address.id,
              serviceName: dto.serviceName ?? pkg.title,
              notes: dto.notes,
              status: PriestBookingStatus.PENDING_PAYMENT,
              market: pkg.market,
              currency: pkg.currency,
              amountMinor: priest.basePriceMinor + priest.travelFeeMinor,
              orderId: createdOrder.id,
            },
          });
          priestBookingId = pb.id;
        }

        const createdPackage = await tx.packageBooking.create({
          data: {
            bookingNumber,
            userId,
            packageId: pkg.id,
            addressId: address.id,
            includeKit,
            includePriest,
            includePrasad,
            addonSlugs,
            serviceName: dto.serviceName,
            notes: dto.notes,
            priestBookingId,
            status: PackageBookingStatus.PENDING_PAYMENT,
            market: pkg.market,
            currency: pkg.currency,
            subtotalMinor,
            discountMinor,
            totalMinor,
            breakdown: breakdown as unknown as Prisma.InputJsonValue,
            orderId: createdOrder.id,
          },
          include: {
            package: true,
            priestBooking: { include: { priest: true, slot: true } },
          },
        });

        return { packageBooking: createdPackage, order: createdOrder };
      },
    );

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
          packageBookingId: packageBooking.id,
          bookingNumber: packageBooking.bookingNumber,
        },
      },
    });

    return {
      booking: packageBooking,
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
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        checkoutUrl: payment.checkoutUrl,
        clientSecret: payment.clientSecret,
        providerOrderId: payment.providerOrderId,
        metadata: payment.metadata,
      },
    };
  }

  async myBookings(userId: string) {
    const items = await this.prisma.packageBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        package: { select: { slug: true, title: true } },
        priestBooking: {
          include: {
            priest: { select: { fullName: true, slug: true } },
            slot: true,
          },
        },
        order: {
          include: {
            payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });
    return { items };
  }

  async adminList() {
    const items = await this.prisma.packageBooking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        package: { select: { slug: true, title: true } },
        user: { select: { id: true, phoneE164: true, fullName: true } },
        priestBooking: {
          include: {
            priest: { select: { fullName: true, slug: true } },
            slot: true,
          },
        },
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
    const booking = await this.prisma.packageBooking.findUnique({
      where: { id: params.bookingId },
      include: {
        priestBooking: { include: { slot: true } },
        order: true,
      },
    });
    if (!booking) throw new NotFoundException('Package booking not found');
    if (!params.isAdmin && booking.userId !== params.actorUserId) {
      throw new NotFoundException('Package booking not found');
    }
    if (
      booking.status === PackageBookingStatus.CANCELLED ||
      booking.status === PackageBookingStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot cancel package booking in status ${booking.status}`,
      );
    }

    const slotStarts = booking.priestBooking?.slot.startsAt;
    if (
      slotStarts &&
      slotStarts.getTime() <= Date.now() &&
      !params.isAdmin
    ) {
      throw new BadRequestException(
        'Cannot cancel after the priest slot has started',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (booking.priestBooking) {
        await tx.priestSlot.update({
          where: { id: booking.priestBooking.slotId },
          data: { isBooked: false },
        });
        await tx.priestBooking.update({
          where: { id: booking.priestBooking.id },
          data: {
            status: PriestBookingStatus.CANCELLED,
            cancelledAt: new Date(),
            cancelReason: params.reason,
            cancelledByUserId: params.actorUserId,
          },
        });
      }

      const cancelled = await tx.packageBooking.update({
        where: { id: booking.id },
        data: {
          status: PackageBookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: params.reason,
          cancelledByUserId: params.actorUserId,
        },
        include: {
          package: true,
          priestBooking: { include: { priest: true, slot: true } },
        },
      });

      if (
        booking.orderId &&
        booking.status === PackageBookingStatus.PENDING_PAYMENT
      ) {
        await tx.order.update({
          where: { id: booking.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: params.actorUserId,
          action: 'PACKAGE_BOOKING_CANCELLED',
          resource: 'package_booking',
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
      refundSuggested: booking.status === PackageBookingStatus.CONFIRMED,
      orderId: booking.orderId,
    };
  }

  private async ensureServiceProduct(
    slug: string,
    name: string,
    market: Market,
    priceMinor = 0,
  ) {
    const currency =
      market === Market.IN ? 'INR' : market === Market.US ? 'USD' : 'CAD';
    return this.prisma.product.upsert({
      where: { slug },
      update: { name, isActive: true },
      create: {
        slug,
        name,
        description: `${name} (package component)`,
        type: ProductType.SERVICE_ADDON,
        market,
        currency,
        priceMinor,
        isActive: true,
        sortOrder: 90,
      },
    });
  }
}
