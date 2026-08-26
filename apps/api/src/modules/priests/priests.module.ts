import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { PriestApplicationService } from './application/priest-application.service';
import { PriestBookingService } from './application/priest-booking.service';
import { MeetingLinkService } from './infrastructure/meeting-link.service';
import { AgoraTokenService } from './infrastructure/agora-token.service';
import {
  AdminBookingsController,
  BookingsController,
  PoojariController,
  PriestsController,
} from './presentation/priests.controller';
import { ArchanaController } from './presentation/archana.controller';

@Module({
  imports: [PaymentsModule],
  controllers: [
    PriestsController,
    ArchanaController,
    BookingsController,
    PoojariController,
    AdminBookingsController,
  ],
  providers: [
    PriestBookingService,
    PriestApplicationService,
    MeetingLinkService,
    AgoraTokenService,
  ],
  exports: [PriestBookingService, PriestApplicationService],
})
export class PriestsModule {}
