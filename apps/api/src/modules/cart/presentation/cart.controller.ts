import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductType, type ProductKitItem } from '@prisma/client';
import { resolveLocale } from '../../../common/i18n/locale';
import {
  buildSelectableKitItems,
  collectLineItemSlugs,
} from '../../catalog/application/selectable-kit-items';

class AddCartItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedItemKeys?: string[];
}

class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

@ApiTags('Cart')
@ApiBearerAuth()
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
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

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  async get(@CurrentUser() user: AuthenticatedUser) {
    const cart = await this.getOrCreateCart(user.id);
    return { success: true, data: this.toResponse(cart) };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item or selected kit items to cart' })
  async add(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddCartItemDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
      include: { kitItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getOrCreateCart(user.id);
    const selectedKeys = dto.selectedItemKeys?.filter(Boolean) ?? [];

    if (selectedKeys.length && product.type === ProductType.PUJA_KIT) {
      await this.addSelectedKitItems(cart.id, product, selectedKeys, dto.quantity);
    } else {
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: dto.productId },
        },
        create: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
        update: { quantity: { increment: dto.quantity } },
      });
    }

    const updated = await this.getOrCreateCart(user.id);
    return { success: true, data: this.toResponse(updated) };
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(user.id);
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (!existing) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: dto.quantity },
    });
    const updated = await this.getOrCreateCart(user.id);
    return { success: true, data: this.toResponse(updated) };
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove cart item' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const cart = await this.getOrCreateCart(user.id);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    const updated = await this.getOrCreateCart(user.id);
    return { success: true, data: this.toResponse(updated) };
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
          update: { quantity: { increment: quantity } },
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
        quantity: { increment: quantity },
        unitPriceOverrideMinor: override,
        metadata: {
          selectedItemKeys: selected.map((item) => item.key),
          selectedItems: selected.map((item) => item.name),
        },
      },
    });
  }

  private toResponse(cart: Awaited<ReturnType<CartController['getOrCreateCart']>>) {
    const items = cart.items.map((item) => {
      const unit = item.unitPriceOverrideMinor ?? item.product.priceMinor;
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        unitPriceMinor: unit,
        metadata: item.metadata,
        lineTotalMinor: item.quantity * unit,
      };
    });
    const subtotalMinor = items.reduce((sum, i) => sum + i.lineTotalMinor, 0);
    if (items.length && items.some((i) => i.product.currency !== items[0].product.currency)) {
      throw new BadRequestException('Cart contains mixed currencies');
    }
    return {
      id: cart.id,
      items,
      subtotalMinor,
      currency: items[0]?.product.currency ?? null,
      market: items[0]?.product.market ?? null,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
  }
}
