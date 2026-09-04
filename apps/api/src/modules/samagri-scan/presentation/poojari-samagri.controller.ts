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
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { SamagriPoojariListService } from '../application/samagri-poojari-list.service';
import {
  SendPoojariSamagriItemsDto,
  SendPoojariSamagriTextDto,
} from './dto/poojari-samagri.dto';

@ApiTags('Poojari Samagri')
@ApiBearerAuth()
@Roles(Role.POOJARI)
@Controller({ path: 'poojari/samagri-lists', version: '1' })
export class PoojariSamagriController {
  constructor(private readonly lists: SamagriPoojariListService) {}

  @Get()
  @ApiOperation({ summary: 'Lists sent for a booking' })
  async listForBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Query('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    const items = await this.lists.listForBooking(user.id, bookingId);
    return { success: true, data: { items } };
  }

  @Post('from-text')
  @ApiOperation({ summary: 'Match pasted text and send samagri list to booking customer' })
  async sendFromText(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SendPoojariSamagriTextDto,
  ) {
    const data = await this.lists.sendFromText(user.id, body);
    return { success: true, data };
  }

  @Post('from-items')
  @ApiOperation({ summary: 'Send confirmed samagri items to booking customer' })
  async sendFromItems(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SendPoojariSamagriItemsDto,
  ) {
    const data = await this.lists.sendFromItems(user.id, body);
    return { success: true, data };
  }
}
