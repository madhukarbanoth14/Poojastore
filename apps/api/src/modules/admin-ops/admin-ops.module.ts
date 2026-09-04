import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PackagesModule } from '../packages/packages.module';
import { PriestsModule } from '../priests/priests.module';
import { PromosModule } from '../promos/promos.module';
import { AdminOpsService } from './application/admin-ops.service';
import { AdminOpsController } from './presentation/admin-ops.controller';

@Module({
  imports: [PriestsModule, PackagesModule, OrdersModule, PromosModule],
  controllers: [AdminOpsController],
  providers: [AdminOpsService],
})
export class AdminOpsModule {}
