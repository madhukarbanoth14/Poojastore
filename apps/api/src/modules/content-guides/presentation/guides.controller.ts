import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PrasadService } from '../application/prasad.service';
import { VratService } from '../application/vrat.service';
import {
  ListPrasadQueryDto,
  UpsertPrasadRecipeDto,
  UpsertVratGuideDto,
  UpsertVratReminderDto,
} from './dto/guides.dto';

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('Invalid slug');
  }
}

@ApiTags('Vrats')
@Controller({ path: 'vrats', version: '1' })
export class VratsController {
  constructor(private readonly vrats: VratService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List fasting / vrat guides' })
  async list() {
    const data = await this.vrats.list();
    return { success: true, data };
  }

  @Public()
  @Get('upcoming')
  @ApiOperation({ summary: 'Upcoming vrat occurrence dates' })
  async upcoming() {
    const data = await this.vrats.upcoming();
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Vrat guide detail' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.vrats.bySlug(slug);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Put(':slug/reminder')
  @ApiOperation({ summary: 'Enable/update vrat reminder preference' })
  async reminder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Body() body: UpsertVratReminderDto,
  ) {
    assertSlug(slug);
    const data = await this.vrats.upsertReminder(user.id, slug, body);
    return { success: true, data };
  }
}

@ApiTags('Prasad')
@Controller({ path: 'prasad', version: '1' })
export class PrasadController {
  constructor(private readonly prasad: PrasadService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List prasad recipes' })
  async list(@Query() query: ListPrasadQueryDto) {
    const data = await this.prasad.list(query.festival);
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Prasad recipe detail' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.prasad.bySlug(slug);
    return { success: true, data };
  }
}

@ApiTags('Admin Guides')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin', version: '1' })
export class AdminGuidesController {
  constructor(
    private readonly vrats: VratService,
    private readonly prasad: PrasadService,
  ) {}

  @Put('vrats/:slug')
  @ApiOperation({ summary: 'Create or replace a vrat guide' })
  async upsertVrat(
    @Param('slug') slug: string,
    @Body() body: UpsertVratGuideDto,
  ) {
    assertSlug(slug);
    const data = await this.vrats.upsertAdmin(slug, body);
    return { success: true, data };
  }

  @Put('prasad/:slug')
  @ApiOperation({ summary: 'Create or replace a prasad recipe' })
  async upsertPrasad(
    @Param('slug') slug: string,
    @Body() body: UpsertPrasadRecipeDto,
  ) {
    assertSlug(slug);
    const data = await this.prasad.upsertAdmin(slug, body);
    return { success: true, data };
  }
}
