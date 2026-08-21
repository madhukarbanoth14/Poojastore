import { Module } from '@nestjs/common';
import { PrasadService } from './application/prasad.service';
import { VratService } from './application/vrat.service';
import {
  AdminGuidesController,
  PrasadController,
  VratsController,
} from './presentation/guides.controller';

@Module({
  controllers: [VratsController, PrasadController, AdminGuidesController],
  providers: [VratService, PrasadService],
  exports: [VratService, PrasadService],
})
export class ContentGuidesModule {}
