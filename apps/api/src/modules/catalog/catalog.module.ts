import { Module } from '@nestjs/common';
import { ProductsController } from './presentation/products.controller';

@Module({
  controllers: [ProductsController],
})
export class CatalogModule {}
