import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { PackagesService } from './application/packages.service';
import {
  PackageBookingsController,
  PackagesController,
} from './presentation/packages.controller';

@Module({
  imports: [PaymentsModule],
  controllers: [PackagesController, PackageBookingsController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
