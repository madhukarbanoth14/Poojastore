import { Module } from '@nestjs/common';
import { KidsService } from './application/kids.service';
import {
  AdminKidsController,
  KidsController,
} from './presentation/kids.controller';

@Module({
  controllers: [KidsController, AdminKidsController],
  providers: [KidsService],
  exports: [KidsService],
})
export class KidsModule {}
