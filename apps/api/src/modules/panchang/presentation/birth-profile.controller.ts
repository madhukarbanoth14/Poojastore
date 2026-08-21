import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../core/database/prisma.service';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { CITY_PRESETS, RASI_LABELS } from '../domain/panchang.constants';
import { UpsertBirthProfileDto } from './dto/panchang.dto';

@ApiTags('Birth Profile')
@ApiBearerAuth()
@Controller({ path: 'profile/birth', version: '1' })
export class BirthProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get saved birth / spiritual profile' })
  async get(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.prisma.birthProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new NotFoundException('Birth profile not set');
    }
    return {
      success: true,
      data: {
        ...profile,
        rasiLabel: RASI_LABELS[profile.rasi],
      },
    };
  }

  @Put()
  @ApiOperation({ summary: 'Create or update birth / spiritual profile' })
  async upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpsertBirthProfileDto,
  ) {
    const preset = CITY_PRESETS.find(
      (c) => c.name.toLowerCase() === (body.cityName ?? 'Bengaluru').toLowerCase(),
    );

    const cityName = body.cityName ?? preset?.name ?? 'Bengaluru';
    const cityLatitude =
      body.cityLatitude ?? preset?.latitude ?? CITY_PRESETS[0].latitude;
    const cityLongitude =
      body.cityLongitude ?? preset?.longitude ?? CITY_PRESETS[0].longitude;
    const timezone =
      body.timezone ?? preset?.timezone ?? CITY_PRESETS[0].timezone;

    const profile = await this.prisma.birthProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dateOfBirth: new Date(`${body.dateOfBirth.slice(0, 10)}T00:00:00.000Z`),
        birthTime: body.birthTime,
        birthPlace: body.birthPlace,
        birthLatitude: body.birthLatitude,
        birthLongitude: body.birthLongitude,
        rasi: body.rasi,
        nakshatra: body.nakshatra,
        gotram: body.gotram,
        cityName,
        cityLatitude,
        cityLongitude,
        timezone,
      },
      update: {
        dateOfBirth: new Date(`${body.dateOfBirth.slice(0, 10)}T00:00:00.000Z`),
        birthTime: body.birthTime,
        birthPlace: body.birthPlace,
        birthLatitude: body.birthLatitude,
        birthLongitude: body.birthLongitude,
        rasi: body.rasi,
        nakshatra: body.nakshatra,
        gotram: body.gotram,
        cityName,
        cityLatitude,
        cityLongitude,
        timezone,
      },
    });

    return {
      success: true,
      data: {
        ...profile,
        rasiLabel: RASI_LABELS[profile.rasi],
      },
    };
  }
}
