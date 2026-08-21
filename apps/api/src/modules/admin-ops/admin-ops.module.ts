import { Module } from '@nestjs/common';
import { PackagesModule } from '../packages/packages.module';
import { PriestsModule } from '../priests/priests.module';
import { AdminOpsService } from './application/admin-ops.service';
import { AdminOpsController } from './presentation/admin-ops.controller';

@Module({
  imports: [PriestsModule, PackagesModule],
  controllers: [AdminOpsController],
  providers: [AdminOpsService],
})
export class AdminOpsModule {}
