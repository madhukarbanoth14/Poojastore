import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { AdminOpsService } from '../application/admin-ops.service';
import { PackagesService } from '../../packages/application/packages.service';
import { PriestApplicationService } from '../../priests/application/priest-application.service';
import { PriestBookingService } from '../../priests/application/priest-booking.service';
import { OrderLifecycleService } from '../../orders/application/order-lifecycle.service';
import { PromoService } from '../../promos/application/promo.service';
import {
  CancelBookingDto,
  ListPriestApplicationsQueryDto,
  ReviewPriestApplicationDto,
} from '../../priests/presentation/dto/priest.dto';
import {
  AdminDispatchVendorDto,
  AdminFulfillDto,
  AdminListQueryDto,
  CreatePromoDto,
  UpdatePromoDto,
} from './dto/admin-ops.dto';

@ApiTags('Admin Ops')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin', version: '1' })
export class AdminOpsController {
  constructor(
    private readonly ops: AdminOpsService,
    private readonly packages: PackagesService,
    private readonly priests: PriestBookingService,
    private readonly priestApplications: PriestApplicationService,
    private readonly lifecycle: OrderLifecycleService,
    private readonly promos: PromoService,
  ) {}

  @Get('ops/summary')
  @ApiOperation({ summary: 'Ops dashboard counters' })
  async summary() {
    const data = await this.ops.summary();
    return { success: true, data };
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders (admin)' })
  async orders(@Query() query: AdminListQueryDto) {
    const data = await this.ops.listOrders(query);
    return { success: true, data };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Order detail with customer tracking' })
  async order(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.lifecycle.getOwned(id, user.id, true);
    return { success: true, data };
  }

  @Post('orders/:id/confirm')
  @ApiOperation({ summary: 'Confirm a paid order before sending it to a vendor' })
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.lifecycle.adminConfirm(id, user.id);
    return { success: true, data };
  }

  @Post('orders/:id/dispatch-vendor')
  @ApiOperation({ summary: 'SMS the packing slip to the vendor who delivers to the customer' })
  async dispatchVendor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminDispatchVendorDto,
  ) {
    const data = await this.lifecycle.adminDispatchVendor(id, user.id, body);
    return { success: true, data };
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Active packing vendors' })
  async vendors() {
    const data = await this.ops.listVendors();
    return { success: true, data };
  }

  @Post('orders/:id/fulfillment')
  @ApiOperation({ summary: 'Mark packing / shipping / delivery for customer tracking' })
  async fulfill(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminFulfillDto,
  ) {
    const data = await this.lifecycle.adminFulfill(id, user.id, body);
    return { success: true, data };
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payment transactions' })
  async payments(@Query() query: AdminListQueryDto) {
    const data = await this.ops.listPayments(query);
    return { success: true, data };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Store activity log' })
  async auditLogs(@Query() query: AdminListQueryDto) {
    const data = await this.ops.listAuditLogs(query);
    return { success: true, data };
  }

  @Get('promos')
  @ApiOperation({ summary: 'List promo codes' })
  async listPromos() {
    const data = await this.promos.list();
    return { success: true, data };
  }

  @Post('promos')
  @ApiOperation({ summary: 'Create a promo code' })
  async createPromo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePromoDto,
  ) {
    const data = await this.promos.create(user.id, body);
    return { success: true, data };
  }

  @Patch('promos/:id')
  @ApiOperation({ summary: 'Update a promo code' })
  async updatePromo(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePromoDto,
  ) {
    const data = await this.promos.update(user.id, id, body);
    return { success: true, data };
  }

  @Get('package-bookings')
  @ApiOperation({ summary: 'List package bookings (admin)' })
  async packageBookings(@Query() query: AdminListQueryDto) {
    const data = await this.packages.adminList();
    return { success: true, data };
  }

  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Admin cancel priest booking' })
  async cancelPriest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelBookingDto,
  ) {
    const data = await this.priests.cancelBooking({
      bookingId: id,
      actorUserId: user.id,
      isAdmin: true,
      reason: body.reason,
    });
    return { success: true, data };
  }

  @Get('priest-applications')
  @ApiOperation({ summary: 'List pujari onboarding applications' })
  async priestApplicationsList(
    @Query() query: ListPriestApplicationsQueryDto,
  ) {
    const data = await this.priestApplications.list(query.status);
    return { success: true, data };
  }

  @Post('priest-applications/:id/approve')
  @ApiOperation({ summary: 'Approve a pujari application and list them' })
  async approvePriest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewPriestApplicationDto,
  ) {
    const data = await this.priestApplications.approve(id, body);
    return { success: true, data };
  }

  @Post('priest-applications/:id/reject')
  @ApiOperation({ summary: 'Reject a pujari application' })
  async rejectPriest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewPriestApplicationDto,
  ) {
    const data = await this.priestApplications.reject(id, body);
    return { success: true, data };
  }

  @Post('package-bookings/:id/cancel')
  @ApiOperation({ summary: 'Admin cancel package booking' })
  async cancelPackage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelBookingDto,
  ) {
    const data = await this.packages.cancelBooking({
      bookingId: id,
      actorUserId: user.id,
      isAdmin: true,
      reason: body.reason,
    });
    return { success: true, data };
  }
}
