import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PrismaService } from '../../../core/database/prisma.service';
import { CITY_PRESETS } from '../domain/panchang.constants';
import { PanchangService } from '../application/panchang.service';
import { CalendarQueryDto, PanchangQueryDto } from './dto/panchang.dto';

function assertDateKey(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('date must be YYYY-MM-DD');
  }
}

@ApiTags('Panchang')
@Controller({ path: 'panchang', version: '1' })
export class PanchangController {
  constructor(
    private readonly panchang: PanchangService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List supported city presets' })
  cities() {
    return { success: true, data: { items: CITY_PRESETS } };
  }

  @Public()
  @Get('today')
  @ApiOperation({ summary: 'Today panchang for city/location' })
  async today(
    @Query() query: PanchangQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const fromProfile = user
      ? await this.prisma.birthProfile.findUnique({ where: { userId: user.id } })
      : null;

    const data = await this.panchang.getPanchang({
      city: query.city ?? fromProfile?.cityName,
      latitude: query.latitude ?? fromProfile?.cityLatitude,
      longitude: query.longitude ?? fromProfile?.cityLongitude,
      timezone: query.timezone ?? fromProfile?.timezone,
    });
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get('me/today')
  @ApiOperation({ summary: 'Today panchang using saved birth-profile city' })
  async meToday(@CurrentUser() user: AuthenticatedUser) {
    const fromProfile = await this.prisma.birthProfile.findUnique({
      where: { userId: user.id },
    });
    const data = await this.panchang.getPanchang({
      city: fromProfile?.cityName,
      latitude: fromProfile?.cityLatitude,
      longitude: fromProfile?.cityLongitude,
      timezone: fromProfile?.timezone,
    });
    return { success: true, data };
  }

  @Public()
  @Get('calendar')
  @ApiOperation({ summary: 'Month calendar with panchang markers' })
  async calendar(@Query() query: CalendarQueryDto) {
    const data = await this.panchang.getCalendar(query);
    return { success: true, data };
  }

  @Public()
  @Get(':date')
  @ApiOperation({ summary: 'Panchang for a specific date YYYY-MM-DD' })
  async byDate(
    @Param('date') date: string,
    @Query() query: PanchangQueryDto,
  ) {
    assertDateKey(date);
    const data = await this.panchang.getPanchang({
      date,
      ...query,
    });
    return { success: true, data };
  }
}
