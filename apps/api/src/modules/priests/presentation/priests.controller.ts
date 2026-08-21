import {
  BadRequestException,
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
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PriestApplicationService } from '../application/priest-application.service';
import { PriestBookingService } from '../application/priest-booking.service';
import {
  ApplyPriestDto,
  CancelBookingDto,
  CreatePriestBookingDto,
  ListPriestsQueryDto,
  RescheduleBookingDto,
} from './dto/priest.dto';

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('Invalid slug');
  }
}

@ApiTags('Priests')
@Controller({ path: 'priests', version: '1' })
export class PriestsController {
  constructor(
    private readonly priests: PriestBookingService,
    private readonly applications: PriestApplicationService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active priests' })
  async list(@Query() query: ListPriestsQueryDto) {
    const data = await this.priests.list(query);
    return { success: true, data };
  }

  @Public()
  @SkipThrottle()
  @Post('applications')
  @ApiOperation({ summary: 'Pujari onboarding application' })
  async apply(
    @Body() body: ApplyPriestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const data = await this.applications.apply(body, user);
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Priest profile with open slots' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.priests.bySlug(slug);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post(':slug/bookings')
  @ApiOperation({ summary: 'Book a priest slot and create payment' })
  async book(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Body() body: CreatePriestBookingDto,
  ) {
    assertSlug(slug);
    const data = await this.priests.createBooking(user.id, slug, body);
    return { success: true, data };
  }
}

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly priests: PriestBookingService) {}

  @Get()
  @ApiOperation({ summary: 'List my priest bookings' })
  async mine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.priests.myBookings(user.id);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Booking detail' })
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.priests.bookingDetail(
      user.id,
      id,
      user.role === Role.ADMIN,
    );
    return { success: true, data };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel priest booking (releases slot)' })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelBookingDto,
  ) {
    const data = await this.priests.cancelBooking({
      bookingId: id,
      actorUserId: user.id,
      isAdmin: user.role === Role.ADMIN,
      reason: body.reason,
    });
    return { success: true, data };
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule priest booking to a new slot' })
  async reschedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RescheduleBookingDto,
  ) {
    const data = await this.priests.rescheduleBooking({
      bookingId: id,
      actorUserId: user.id,
      isAdmin: user.role === Role.ADMIN,
      newSlotId: body.newSlotId,
      reason: body.reason,
    });
    return { success: true, data };
  }
}

@ApiTags('Poojari')
@ApiBearerAuth()
@Roles(Role.POOJARI)
@Controller({ path: 'poojari', version: '1' })
export class PoojariController {
  constructor(private readonly priests: PriestBookingService) {}

  @Get('appointments')
  @ApiOperation({
    summary: 'Pujari dashboard: today, tomorrow, and later confirmed appointments',
  })
  async appointments(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.priests.mySchedule(user.id);
    return { success: true, data };
  }

  @Post('appointments/:id/join')
  @ApiOperation({ summary: 'Create or return the video meeting link for an online booking' })
  async join(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const booking = await this.priests.bookingDetail(user.id, id, false);
    const withMeeting = await this.priests.ensureMeeting(booking.id);
    return {
      success: true,
      data: {
        id: withMeeting.id,
        serviceMode: withMeeting.serviceMode,
        meetingProvider: withMeeting.meetingProvider,
        meetingJoinUrl: withMeeting.meetingJoinUrl,
        meetingHostUrl: withMeeting.meetingHostUrl,
      },
    };
  }
}

@ApiTags('Admin Bookings')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin/bookings', version: '1' })
export class AdminBookingsController {
  constructor(private readonly priests: PriestBookingService) {}

  @Get()
  @ApiOperation({ summary: 'List all priest bookings' })
  async list() {
    const data = await this.priests.adminList();
    return { success: true, data };
  }
}
