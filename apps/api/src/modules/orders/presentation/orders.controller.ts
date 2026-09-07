import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { CheckoutService } from '../application/checkout.service';
import { OrderLifecycleService } from '../application/order-lifecycle.service';
import { ReferKitService } from '../application/refer-kit.service';
import { CheckoutDto, OrderActionDto, ReferKitDto } from './dto/order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly lifecycle: OrderLifecycleService,
    private readonly referrals: ReferKitService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart and create payment session' })
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    const data = await this.checkout.checkout(
      user.id,
      dto.shippingAddressId,
      dto.deliverySlot,
      {
        intent: dto.intent,
        intents: dto.intents,
        familyAddressId: dto.familyAddressId,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        promoCode: dto.promoCode,
      },
    );
    return { success: true, data };
  }

  @Get('pending-payment')
  @ApiOperation({
    summary: 'Resume UPI checkout for an awaiting-payment order',
  })
  async pendingPayment(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.checkout.resumePendingPayment(user.id);
    return { success: true, data };
  }

  @Post('refer')
  @ApiOperation({ summary: 'SMS a kit referral to a family member' })
  async referKit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReferKitDto,
  ) {
    const data = await this.referrals.refer({
      userId: user.id,
      recipientName: dto.recipientName,
      recipientPhone: dto.recipientPhone,
      kitName: dto.kitName ?? 'a Pooja kit',
      shopUrl: dto.shopUrl,
    });
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List my orders' })
  async mine(@CurrentUser() user: AuthenticatedUser) {
    const items = await this.lifecycle.listMine(user.id);
    return { success: true, data: { items } };
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Delivery tracker for an order' })
  async tracking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.lifecycle.getOwned(
      id,
      user.id,
      user.role === Role.ADMIN,
    );
    return { success: true, data: order };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.lifecycle.getOwned(
      id,
      user.id,
      user.role === Role.ADMIN,
    );
    return { success: true, data: order };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order before it ships' })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    const order = await this.lifecycle.cancel(id, user.id, body.reason);
    return { success: true, data: order };
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Request a refund (before shipping)' })
  async refund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    const order = await this.lifecycle.requestRefund(id, user.id, body.reason);
    return { success: true, data: order };
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Request a return after delivery' })
  async requestReturn(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OrderActionDto,
  ) {
    const order = await this.lifecycle.requestReturn(id, user.id, body.reason);
    return { success: true, data: order };
  }
}
