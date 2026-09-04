import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CheckoutService } from './application/checkout.service';
import { OrderLifecycleService } from './application/order-lifecycle.service';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [PaymentsModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [CheckoutService, OrderLifecycleService],
})
export class OrdersModule {}
