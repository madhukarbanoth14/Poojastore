import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { AdminOpsService } from '../application/admin-ops.service';
import { PackagesService } from '../../packages/application/packages.service';
import { PriestApplicationService } from '../../priests/application/priest-application.service';
import { PriestBookingService } from '../../priests/application/priest-booking.service';
import {
  CancelBookingDto,
  ListPriestApplicationsQueryDto,
  ReviewPriestApplicationDto,
} from '../../priests/presentation/dto/priest.dto';

class AdminListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;
}

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
