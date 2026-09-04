import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { PromoService } from '../application/promo.service';

class QuotePromoDto {
  @IsString()
  @MaxLength(40)
  code!: string;
}

@ApiTags('Promos')
@ApiBearerAuth()
@Controller({ path: 'promos', version: '1' })
export class PromosController {
  constructor(private readonly promos: PromoService) {}

  @Post('quote')
  @ApiOperation({ summary: 'Preview a promo code against the current cart' })
  async quote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: QuotePromoDto,
  ) {
    const data = await this.promos.quoteForCart(user.id, body.code);
    return { success: true, data };
  }
}
