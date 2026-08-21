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
import { VidhiService } from '../application/vidhi.service';
import { ListVidhiQueryDto, UpsertVidhiDto } from './dto/vidhi.dto';

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('Invalid slug');
  }
}

@ApiTags('Vidhi')
@Controller({ path: 'vidhi', version: '1' })
export class VidhiController {
  constructor(private readonly vidhi: VidhiService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published puja vidhis' })
  async list(@Query() query: ListVidhiQueryDto) {
    const data = await this.vidhi.list(query);
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Vidhi detail with steps and mantras' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.vidhi.bySlug(slug);
    return { success: true, data };
  }
}

@ApiTags('Admin Vidhi')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin/vidhi', version: '1' })
export class AdminVidhiController {
  constructor(private readonly vidhi: VidhiService) {}

  @Put(':slug')
  @ApiOperation({ summary: 'Create or replace a puja vidhi' })
  async upsert(@Param('slug') slug: string, @Body() body: UpsertVidhiDto) {
    assertSlug(slug);
    const data = await this.vidhi.upsertAdmin(slug, body);
    return { success: true, data };
  }
}
