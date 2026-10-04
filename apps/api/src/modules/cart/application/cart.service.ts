import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductType, type ProductKitItem } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { resolveLocale } from '../../../common/i18n/locale';
import {
  buildSelectableKitItems,
  collectLineItemSlugs,
} from '../../catalog/application/selectable-kit-items';

export type AddCartItemInput = {
  productId: string;
  quantity: number;
  selectedItemKeys?: string[];
  replace?: boolean;
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: { include: { kitItems: true } } },
          orderBy: { product: { name: 'asc' } },
        },
      },
    });
  }

  async add(userId: string, dto: AddCartItemInput) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
      include: { kitItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getOrCreateCart(userId);
    if (dto.replace) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    const selectedKeys = dto.selectedItemKeys?.filter(Boolean) ?? [];
    const replace = Boolean(dto.replace);

    if (selectedKeys.length && product.type === ProductType.PUJA_KIT) {
      await this.addSelectedKitItems(cart.id, product, selectedKeys, dto.quantity, {
        replace,
      });
    } else {
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: dto.productId },
        },
        create: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPriceOverrideMinor: null,
          metadata: {},
        },
        update: replace
          ? {
              quantity: dto.quantity,
              unitPriceOverrideMinor: null,
              metadata: {},
            }
          : { quantity: { increment: dto.quantity } },
      });
    }

    return this.getOrCreateCart(userId);
  }

  private async addSelectedKitItems(
    cartId: string,
    product: {
      id: string;
      slug: string;
      type: ProductType;
      priceMinor: number;
      metadata: unknown;
      kitItems: ProductKitItem[];
    },
    selectedKeys: string[],
    quantity: number,
    opts: { replace?: boolean } = {},
  ) {
    const slugs = collectLineItemSlugs([product]);
    const priced = slugs.length
      ? await this.prisma.product.findMany({
          where: { slug: { in: slugs }, isActive: true },
          select: { id: true, slug: true, priceMinor: true },
        })
      : [];
    const bySlug = new Map(priced.map((row) => [row.slug, row]));
    const selectable = buildSelectableKitItems({
      product,
      locale: resolveLocale(),
      pricedBySlug: bySlug,
    });
    const selected = selectable.filter((item) => selectedKeys.includes(item.key));
    if (!selected.length) {
      throw new BadRequestException('Select at least one kit item');
    }

    const required = selectable.filter((item) => !item.optional);
    const selectedRequired = required.filter((item) =>
      selectedKeys.includes(item.key),
    );
    const selectedOptional = selected.filter((item) => item.optional);
    const qtyUpdate = opts.replace
      ? { quantity }
      : { quantity: { increment: quantity } };

    if (required.length > 0 && selectedRequired.length === required.length) {
      const kitMetadata = selectedOptional.length
        ? {
            selectedItemKeys: selected.map((item) => item.key),
            selectedItems: selected.map((item) => item.name),
          }
        : {};
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId, productId: product.id },
        },
        create: {
          cartId,
          productId: product.id,
          quantity,
          unitPriceOverrideMinor: null,
          metadata: kitMetadata,
        },
        update: {
          ...qtyUpdate,
          unitPriceOverrideMinor: null,
          metadata: kitMetadata,
        },
      });

      for (const item of selectedOptional) {
        if (!item.productId) continue;
        await this.prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId,
              productId: item.productId,
            },
          },
          create: {
            cartId,
            productId: item.productId,
            quantity,
          },
          update: qtyUpdate,
        });
      }
      return;
    }

    const allHaveSku = selected.every((item) => item.productId);
    if (allHaveSku) {
      for (const item of selected) {
        await this.prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId,
              productId: item.productId!,
            },
          },
          create: {
            cartId,
            productId: item.productId!,
            quantity,
          },
          update: qtyUpdate,
        });
      }
      return;
    }

    const override = selected.reduce((sum, item) => sum + item.priceMinor, 0);
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId: product.id },
      },
      create: {
        cartId,
        productId: product.id,
        quantity,
        unitPriceOverrideMinor: override,
        metadata: {
          selectedItemKeys: selected.map((item) => item.key),
          selectedItems: selected.map((item) => item.name),
        },
      },
      update: {
        ...qtyUpdate,
        unitPriceOverrideMinor: override,
        metadata: {
          selectedItemKeys: selected.map((item) => item.key),
          selectedItems: selected.map((item) => item.name),
        },
      },
    });
  }
}
