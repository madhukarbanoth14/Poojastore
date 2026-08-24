import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';
import { ARCHANA_DEITIES } from '../domain/archana-catalog';
import { PriestBookingService } from '../application/priest-booking.service';
import { ListArchanaPriestsQueryDto } from './dto/priest.dto';

@ApiTags('Archana')
@Controller({ path: 'archana', version: '1' })
export class ArchanaController {
  constructor(private readonly bookings: PriestBookingService) {}

  @Public()
  @Get('deities')
  @ApiOperation({ summary: 'Deities available for online archana booking' })
  deities() {
    return { success: true, data: { items: ARCHANA_DEITIES } };
  }

  @Public()
  @Get('priests')
  @ApiOperation({
    summary: 'Temple pujaris who offer live online archana on video call',
  })
  async listPriests(@Query() query: ListArchanaPriestsQueryDto) {
    const data = await this.bookings.listArchanaPriests({
      deity: query.deity,
      city: query.city,
      market: query.market ?? Market.IN,
    });
    return { success: true, data };
  }
}
