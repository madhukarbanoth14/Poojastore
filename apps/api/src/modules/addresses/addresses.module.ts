import { Module } from '@nestjs/common';
import { AddressesController } from './presentation/addresses.controller';

@Module({
  controllers: [AddressesController],
})
export class AddressesModule {}
