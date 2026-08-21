import {
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Rasi, Role } from '@prisma/client';
import { Matches } from 'class-validator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { GuidanceService } from '../application/guidance.service';
import { UpsertGuidanceDto } from './dto/panchang.dto';

class GuidanceAdminParams {
  @Matches(
    /^(MESHA|VRISHABHA|MITHUNA|KARKA|SIMHA|KANYA|TULA|VRISHCHIKA|DHANU|MAKARA|KUMBHA|MEENA)$/,
  )
  rasi!: Rasi;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
}

@ApiTags('Guidance')
@ApiBearerAuth()
@Controller({ path: 'guidance', version: '1' })
export class GuidanceController {
  constructor(private readonly guidance: GuidanceService) {}

  @Get('today')
  @ApiOperation({ summary: 'Personalized daily rasi guidance + panchang context' })
  async today(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.guidance.todayForUser(user.id);
    return { success: true, data };
  }
}

@ApiTags('Admin Guidance')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin/guidance', version: '1' })
export class AdminGuidanceController {
  constructor(private readonly guidance: GuidanceService) {}

  @Put(':rasi/:date')
  @ApiOperation({ summary: 'Upsert rasi daily guidance for a date' })
  async upsert(
    @Param() params: GuidanceAdminParams,
    @Body() body: UpsertGuidanceDto,
  ) {
    const data = await this.guidance.upsertAdmin(
      params.rasi,
      params.date,
      body,
    );
    return { success: true, data };
  }
}
