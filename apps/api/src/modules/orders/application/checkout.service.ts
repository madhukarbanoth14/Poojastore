import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PaymentOrchestratorService } from '../../payments/application/payment-orchestrator.service';
import { PromoService } from '../../promos/application/promo.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentOrchestratorService,
    private readonly promos: PromoService,
  ) {}

  async checkout(
    userId: string,
    shippingAddressId: string,
    deliverySlot?: string,
    extra?: {
      intent?: 'self' | 'family' | 'refer';
      intents?: Array<'self' | 'family' | 'refer'>;
      familyAddressId?: string;
      recipientName?: string;
      recipientPhone?: string;
      promoCode?: string;
    },
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: shippingAddressId, userId },
    });
    if (!address) throw new NotFoundException('Shipping address not found');

    const selected = extra?.intents?.length
      ? extra.intents
      : extra?.intent
        ? [extra.intent]
        : ['self'];
    const shipSelf = selected.includes('self');
    const shipFamily = selected.includes('family');
    if (!shipSelf && !shipFamily) {
      throw new BadRequestException(
        'Choose a delivery for yourself or a family member',
      );
    }

    let familyAddress = null as typeof address | null;
    if (shipFamily && extra?.familyAddressId) {
      familyAddress = await this.prisma.address.findFirst({
        where: { id: extra.familyAddressId, userId },
      });
      if (!familyAddress) {
        throw new NotFoundException('Family address not found');
      }
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      const resumed = await this.resumePending(userId);
      if (resumed) return resumed;
      throw new BadRequestException('Cart is empty');
    }

    const currency = cart.items[0].product.currency;
    const market = cart.items[0].product.market;
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new BadRequestException(`Product inactive: ${item.product.name}`);
      }
      if (item.product.currency !== currency || item.product.market !== market) {
        throw new BadRequestException('Cart has mixed market/currency items');
      }
    }

    const baseSubtotal = cart.items.reduce((sum, item) => {
      const unit = item.unitPriceOverrideMinor ?? item.product.priceMinor;
      return sum + item.quantity * unit;
    }, 0);
    const destinations: Array<'self' | 'family'> = [
      ...(shipSelf ? (['self'] as const) : []),
      ...(shipFamily ? (['family'] as const) : []),
    ];
    const copies = destinations.length;
    const perShip =
      baseSubtotal >= 100000 && market === 'IN' ? 0 : market === 'IN' ? 4900 : 499;
    const perTax = Math.round(baseSubtotal * (market === 'IN' ? 0 : 0.08));
    const subtotalMinor = baseSubtotal * copies;
    const shippingMinor = perShip * copies;
    const taxMinor = perTax * copies;
    let discountMinor = 0;
    let promoId: string | undefined;
    if (extra?.promoCode?.trim()) {
      const quoted = await this.promos.quote(
        extra.promoCode,
        subtotalMinor,
        currency,
      );
      discountMinor = quoted.discountMinor;
      promoId = quoted.promoId;
    }
    const totalMinor = Math.max(
      0,
      subtotalMinor + shippingMinor + taxMinor - discountMinor,
    );

    const orderNumber = `PS${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        market,
        currency,
        subtotalMinor,
        shippingMinor,
        taxMinor,
        discountMinor,
        totalMinor,
        promoCodeId: promoId,
        shippingAddressId: address.id,
        deliverySlot: deliverySlot?.trim() || null,
        items: {
          create: destinations.flatMap((fulfillment) =>
            cart.items.map((item) => {
              const unit =
                item.unitPriceOverrideMinor ?? item.product.priceMinor;
              return {
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPriceMinor: unit,
                totalMinor: item.quantity * unit,
                metadata: {
                  ...((item.metadata as Record<string, unknown> | null) ?? {}),
                  fulfillment,
                  recipientName:
                    fulfillment === 'family' ? extra?.recipientName : undefined,
                  recipientPhone:
                    fulfillment === 'family' ? extra?.recipientPhone : undefined,
                  shippingAddressId:
                    fulfillment === 'family'
                      ? (familyAddress?.id ?? address.id)
                      : address.id,
                } as Prisma.InputJsonValue,
              };
            }),
          ),
        },
      },
      include: { items: true },
    });

    let session;
    try {
      session = await this.payments.createSession({
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
    } catch (err) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
      throw err;
    }

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
        metadata: (session.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ORDER_CHECKOUT_CREATED',
        resource: 'order',
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
          provider: payment.provider,
          intents: selected,
          familyAddressId: familyAddress?.id,
          recipientName: extra?.recipientName,
          recipientPhone: extra?.recipientPhone,
          promoCode: extra?.promoCode,
          discountMinor,
        },
      },
    });

    if (promoId) {
      await this.prisma.$transaction([
        this.prisma.promoRedemption.create({
          data: {
            promoCodeId: promoId,
            orderId: order.id,
            userId,
            discountMinor,
          },
        }),
        this.prisma.promoCode.update({
          where: { id: promoId },
          data: { redeemedCount: { increment: 1 } },
        }),
      ]);
    }

    return this.toCheckoutResult(order, payment);
  }

  /** Resume an unpaid UPI order (including ones waiting after a rejected/wrong UTR). */
  async resumePendingPayment(userId: string) {
    return this.resumePending(userId);
  }

  private async resumePending(userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        payments: {
          some: {
            provider: 'UPI_QR',
            status: {
              in: [PaymentStatus.REQUIRES_ACTION, PaymentStatus.PROCESSING],
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: {
          where: {
            provider: 'UPI_QR',
            status: {
              in: [PaymentStatus.REQUIRES_ACTION, PaymentStatus.PROCESSING],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    const payment = order?.payments[0];
    if (!order || !payment) return null;

    // Allow a fresh UTR attempt after a bad submission.
    if (payment.status === PaymentStatus.PROCESSING) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REQUIRES_ACTION,
          metadata: {
            ...((payment.metadata as Record<string, unknown>) ?? {}),
            resumedAt: new Date().toISOString(),
            previousUtrAttempt:
              typeof (payment.metadata as Record<string, unknown>)?.utr ===
              'string'
                ? (payment.metadata as Record<string, unknown>).utr
                : payment.providerPaymentId,
          } as Prisma.InputJsonValue,
        },
      });
      payment.status = PaymentStatus.REQUIRES_ACTION;
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    const seen = new Set<string>();
    for (const item of order.items) {
      if (seen.has(item.productId)) continue;
      seen.add(item.productId);
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: item.productId },
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceOverrideMinor: item.unitPriceMinor,
        },
        update: { quantity: item.quantity },
      });
    }

    return this.toCheckoutResult(order, payment);
  }

  private toCheckoutResult(
    order: { id: string },
    payment: {
      id: string;
      provider: string;
      status: string;
      amountMinor: number;
      currency: string;
      providerOrderId: string | null;
      clientSecret: string | null;
      checkoutUrl: string | null;
      metadata: Prisma.JsonValue;
    },
  ) {
    return {
      order,
      payment: {
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        providerOrderId: payment.providerOrderId,
        clientSecret: payment.clientSecret,
        checkoutUrl: payment.checkoutUrl,
        metadata: payment.metadata,
      },
    };
  }
}
