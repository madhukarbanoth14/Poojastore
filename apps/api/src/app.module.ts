import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import configuration from './core/config/configuration';
import { validateEnv } from './core/config/env.validation';
import { PrismaModule } from './core/database/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PanchangModule } from './modules/panchang/panchang.module';
import { VidhiModule } from './modules/vidhi/vidhi.module';
import { KidsModule } from './modules/kids/kids.module';
import { PriestsModule } from './modules/priests/priests.module';
import { ContentGuidesModule } from './modules/content-guides/content-guides.module';
import { PackagesModule } from './modules/packages/packages.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        level: process.env.LOG_LEVEL ?? 'info',
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttlSeconds', 60) * 1000,
          limit: config.get<number>('throttle.limit', 120),
        },
      ],
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    CartModule,
    AddressesModule,
    OrdersModule,
    PaymentsModule,
    PanchangModule,
    VidhiModule,
    KidsModule,
    PriestsModule,
    ContentGuidesModule,
    PackagesModule,
    AdminOpsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
