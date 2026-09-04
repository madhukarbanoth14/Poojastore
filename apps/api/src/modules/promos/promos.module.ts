import { Module } from '@nestjs/common';
import { PromoService } from './application/promo.service';
import { PromosController } from './presentation/promos.controller';

@Module({
  controllers: [PromosController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromosModule {}
