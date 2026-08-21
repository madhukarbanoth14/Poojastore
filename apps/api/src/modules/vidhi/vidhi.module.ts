import { Module } from '@nestjs/common';
import { VidhiService } from './application/vidhi.service';
import {
  AdminVidhiController,
  VidhiController,
} from './presentation/vidhi.controller';

@Module({
  controllers: [VidhiController, AdminVidhiController],
  providers: [VidhiService],
  exports: [VidhiService],
})
export class VidhiModule {}
