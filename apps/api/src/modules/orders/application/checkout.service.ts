import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PaymentOrchestratorService } from '../../payments/application/payment-orchestrator.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentOrchestratorService,
  ) {}

  async checkout(
    userId: string,
    shippingAddressId: string,
    deliverySlot?: string,
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: shippingAddressId, userId },
    });
    if (!address) throw new NotFoundException('Shipping address not found');

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
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

    const subtotalMinor = cart.items.reduce((sum, item) => {
      const unit = item.unitPriceOverrideMinor ?? item.product.priceMinor;
      return sum + item.quantity * unit;
    }, 0);
    const shippingMinor = subtotalMinor >= 100000 && market === 'IN' ? 0 : market === 'IN' ? 4900 : 499;
    const taxMinor = Math.round(subtotalMinor * (market === 'IN' ? 0 : 0.08));
    const totalMinor = subtotalMinor + shippingMinor + taxMinor;

    const orderNumber = `PS${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING_PAYMENT,
          market,
          currency,
          subtotalMinor,
          shippingMinor,
          taxMinor,
          discountMinor: 0,
          totalMinor,
          shippingAddressId: address.id,
          deliverySlot: deliverySlot?.trim() || null,
          items: {
            create: cart.items.map((item) => {
              const unit =
                item.unitPriceOverrideMinor ?? item.product.priceMinor;
              return {
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPriceMinor: unit,
                totalMinor: item.quantity * unit,
                metadata: (item.metadata ?? {}) as Prisma.InputJsonValue,
              };
            }),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

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
        },
      },
    });

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
