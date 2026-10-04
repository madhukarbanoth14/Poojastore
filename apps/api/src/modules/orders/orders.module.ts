import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { PromosModule } from '../promos/promos.module';
import { CheckoutService } from './application/checkout.service';
import { GuestCheckoutService } from './application/guest-checkout.service';
import { OrderLifecycleService } from './application/order-lifecycle.service';
import { ReferKitService } from './application/refer-kit.service';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [PaymentsModule, NotificationsModule, AuthModule, PromosModule, CartModule],
  controllers: [OrdersController],
  providers: [CheckoutService, GuestCheckoutService, OrderLifecycleService, ReferKitService],
  exports: [OrderLifecycleService],
})
export class OrdersModule {}
