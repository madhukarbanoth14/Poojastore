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
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PackagesService } from '../application/packages.service';
import {
  BookPackageDto,
  CancelPackageBookingDto,
  ListPackagesQueryDto,
} from './dto/package.dto';

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('Invalid slug');
  }
}

@ApiTags('Packages')
@Controller({ path: 'packages', version: '1' })
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List combined puja packages and add-ons' })
  async list(@Query() query: ListPackagesQueryDto) {
    const data = await this.packages.list(query.market);
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Package detail with components and priests' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.packages.bySlug(slug);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post(':slug/book')
  @ApiOperation({ summary: 'Book a configured package and create payment' })
  async book(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Body() body: BookPackageDto,
  ) {
    assertSlug(slug);
    const data = await this.packages.book(user.id, slug, body);
    return { success: true, data };
  }
}

@ApiTags('Package Bookings')
@ApiBearerAuth()
@Controller({ path: 'package-bookings', version: '1' })
export class PackageBookingsController {
  constructor(private readonly packages: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List my package bookings' })
  async mine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.packages.myBookings(user.id);
    return { success: true, data };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel package booking (releases linked priest slot)' })
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelPackageBookingDto,
  ) {
    const data = await this.packages.cancelBooking({
      bookingId: id,
      actorUserId: user.id,
      isAdmin: user.role === Role.ADMIN,
      reason: body.reason,
    });
    return { success: true, data };
  }
}
