import { Module } from '@nestjs/common';
import { GuidanceService } from './application/guidance.service';
import { PanchangService } from './application/panchang.service';
import { VedAstroClient } from './infrastructure/vedastro.client';
import { BirthProfileController } from './presentation/birth-profile.controller';
import {
  AdminGuidanceController,
  GuidanceController,
} from './presentation/guidance.controller';
import { PanchangController } from './presentation/panchang.controller';

@Module({
  controllers: [
    BirthProfileController,
    PanchangController,
    GuidanceController,
    AdminGuidanceController,
  ],
  providers: [PanchangService, GuidanceService, VedAstroClient],
  exports: [PanchangService, GuidanceService],
})
export class PanchangModule {}
