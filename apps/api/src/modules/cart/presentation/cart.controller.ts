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
  IsBoolean,
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
import { CartService } from '../application/cart.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

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

  /** Buy Now: clear other cart lines so checkout matches this product price. */
  @IsOptional()
  @IsBoolean()
  replace?: boolean;
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
  ) {}

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
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.cart.add(user.id, dto);

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
