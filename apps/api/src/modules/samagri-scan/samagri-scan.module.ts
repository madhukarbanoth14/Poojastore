import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SamagriMatchService } from './application/samagri-match.service';
import { SamagriPoojariListService } from './application/samagri-poojari-list.service';
import { SamagriSavedListService } from './application/samagri-saved-list.service';
import { SamagriScanService } from './application/samagri-scan.service';
import { GoogleVisionService } from './infrastructure/google-vision.service';
import { PoojariSamagriController } from './presentation/poojari-samagri.controller';
import { SamagriScanController } from './presentation/samagri-scan.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [SamagriScanController, PoojariSamagriController],
  providers: [
    SamagriScanService,
    SamagriMatchService,
    SamagriSavedListService,
    SamagriPoojariListService,
    GoogleVisionService,
  ],
  exports: [SamagriMatchService],
})
export class SamagriScanModule {}
