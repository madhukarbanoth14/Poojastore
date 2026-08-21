import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { PriestApplicationService } from './application/priest-application.service';
import { PriestBookingService } from './application/priest-booking.service';
import { MeetingLinkService } from './infrastructure/meeting-link.service';
import {
  AdminBookingsController,
  BookingsController,
  PoojariController,
  PriestsController,
} from './presentation/priests.controller';

@Module({
  imports: [PaymentsModule],
  controllers: [
    PriestsController,
    BookingsController,
    PoojariController,
    AdminBookingsController,
  ],
  providers: [
    PriestBookingService,
    PriestApplicationService,
    MeetingLinkService,
  ],
  exports: [PriestBookingService, PriestApplicationService],
})
export class PriestsModule {}
