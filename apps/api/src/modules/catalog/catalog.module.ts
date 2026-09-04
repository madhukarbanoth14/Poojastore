import { Module } from '@nestjs/common';
import { CatalogSyncService } from './application/catalog-sync.service';
import { ProductsController } from './presentation/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [CatalogSyncService],
})
export class CatalogModule {}
