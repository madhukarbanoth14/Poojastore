import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CurrencyCode,
  Prisma,
  PromoDiscountType,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export type QuoteResult = {
  promoId: string;
  code: string;
  description: string | null;
  discountMinor: number;
  discountType: PromoDiscountType;
};

@Injectable()
export class PromoService {
  constructor(private readonly prisma: PrismaService) {}

  quoteDiscount(params: {
    discountType: PromoDiscountType;
    percentOff: number | null;
    amountMinor: number | null;
    maxDiscountMinor: number | null;
    subtotalMinor: number;
  }) {
    let discount = 0;
    if (params.discountType === PromoDiscountType.PERCENT) {
      const pct = params.percentOff ?? 0;
      discount = Math.round((params.subtotalMinor * pct) / 100);
    } else {
      discount = params.amountMinor ?? 0;
    }
    if (params.maxDiscountMinor != null) {
      discount = Math.min(discount, params.maxDiscountMinor);
    }
    return Math.max(0, Math.min(discount, params.subtotalMinor));
  }

  async quoteForCart(userId: string, rawCode: string): Promise<QuoteResult> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const currency = cart.items[0].product.currency;
    const subtotalMinor = cart.items.reduce((sum, item) => {
      const unit = item.unitPriceOverrideMinor ?? item.product.priceMinor;
      return sum + item.quantity * unit;
    }, 0);
    return this.quote(rawCode, subtotalMinor, currency);
  }

  async quote(
    rawCode: string,
    subtotalMinor: number,
    currency: CurrencyCode,
  ): Promise<QuoteResult> {
    const promo = await this.findUsable(rawCode, currency);
    if (subtotalMinor < promo.minSubtotalMinor) {
      throw new BadRequestException(
        `Add more items to use ${promo.code}. Minimum is ${promo.minSubtotalMinor / 100}.`,
      );
    }
    const discountMinor = this.quoteDiscount({
      discountType: promo.discountType,
      percentOff: promo.percentOff,
      amountMinor: promo.amountMinor,
      maxDiscountMinor: promo.maxDiscountMinor,
      subtotalMinor,
    });
    if (discountMinor <= 0) {
      throw new BadRequestException('This code does not reduce this order');
    }
    return {
      promoId: promo.id,
      code: promo.code,
      description: promo.description,
      discountMinor,
      discountType: promo.discountType,
    };
  }

  async list() {
    return this.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    adminUserId: string,
    input: {
      code: string;
      description?: string;
      discountType: PromoDiscountType;
      percentOff?: number;
      amountMinor?: number;
      minSubtotalMinor?: number;
      maxDiscountMinor?: number;
      currency?: CurrencyCode;
      startsAt?: string;
      endsAt?: string;
      maxRedemptions?: number;
      isActive?: boolean;
    },
  ) {
    const code = this.normalize(input.code);
    this.assertDiscount(input);
    let created;
    try {
      created = await this.prisma.promoCode.create({
        data: {
          code,
          description: input.description?.trim() || null,
          discountType: input.discountType,
          percentOff:
            input.discountType === PromoDiscountType.PERCENT
              ? (input.percentOff ?? 0)
              : null,
          amountMinor:
            input.discountType === PromoDiscountType.FIXED
              ? (input.amountMinor ?? 0)
              : null,
          minSubtotalMinor: input.minSubtotalMinor ?? 0,
          maxDiscountMinor: input.maxDiscountMinor ?? null,
          currency: input.currency ?? CurrencyCode.INR,
          startsAt: input.startsAt ? new Date(input.startsAt) : null,
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          maxRedemptions: input.maxRedemptions ?? null,
          isActive: input.isActive ?? true,
          createdByUserId: adminUserId,
        },
      });
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        throw new BadRequestException('That promo code already exists');
      }
      throw err;
    }
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'PROMO_CREATED',
        resource: 'promo',
        metadata: { promoId: created.id, code: created.code },
      },
    });
    return created;
  }

  async update(
    adminUserId: string,
    id: string,
    input: Partial<{
      description: string;
      percentOff: number;
      amountMinor: number;
      minSubtotalMinor: number;
      maxDiscountMinor: number | null;
      startsAt: string | null;
      endsAt: string | null;
      maxRedemptions: number | null;
      isActive: boolean;
    }>,
  ) {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promo code not found');
    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: {
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.percentOff !== undefined ? { percentOff: input.percentOff } : {}),
        ...(input.amountMinor !== undefined ? { amountMinor: input.amountMinor } : {}),
        ...(input.minSubtotalMinor !== undefined
          ? { minSubtotalMinor: input.minSubtotalMinor }
          : {}),
        ...(input.maxDiscountMinor !== undefined
          ? { maxDiscountMinor: input.maxDiscountMinor }
          : {}),
        ...(input.startsAt !== undefined
          ? { startsAt: input.startsAt ? new Date(input.startsAt) : null }
          : {}),
        ...(input.endsAt !== undefined
          ? { endsAt: input.endsAt ? new Date(input.endsAt) : null }
          : {}),
        ...(input.maxRedemptions !== undefined
          ? { maxRedemptions: input.maxRedemptions }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'PROMO_UPDATED',
        resource: 'promo',
        metadata: { promoId: id, patch: input as Prisma.InputJsonValue },
      },
    });
    return updated;
  }

  private async findUsable(rawCode: string, currency: CurrencyCode) {
    const code = this.normalize(rawCode);
    if (!code) throw new BadRequestException('Enter a promo code');
    const promo = await this.prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) {
      throw new BadRequestException('This promo code is not valid');
    }
    if (promo.currency !== currency) {
      throw new BadRequestException('This promo code is not valid for this order');
    }
    const now = Date.now();
    if (promo.startsAt && promo.startsAt.getTime() > now) {
      throw new BadRequestException('This promo code is not active yet');
    }
    if (promo.endsAt && promo.endsAt.getTime() < now) {
      throw new BadRequestException('This promo code has expired');
    }
    if (
      promo.maxRedemptions != null &&
      promo.redeemedCount >= promo.maxRedemptions
    ) {
      throw new BadRequestException('This promo code has been fully used');
    }
    return promo;
  }

  private assertDiscount(input: {
    discountType: PromoDiscountType;
    percentOff?: number;
    amountMinor?: number;
  }) {
    if (input.discountType === PromoDiscountType.PERCENT) {
      const pct = input.percentOff ?? 0;
      if (pct < 1 || pct > 90) {
        throw new BadRequestException('Percent off must be between 1 and 90');
      }
    } else if (!input.amountMinor || input.amountMinor < 100) {
      throw new BadRequestException('Fixed discount must be at least ₹1');
    }
  }

  private normalize(code: string) {
    return code.trim().toUpperCase().replace(/\s+/g, '');
  }
}
