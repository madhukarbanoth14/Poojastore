import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConfirmPaymentService } from './application/confirm-payment.service';
import { PaymentOrchestratorService } from './application/payment-orchestrator.service';
import { RefundPaymentService } from './application/refund-payment.service';
import { VerifyRazorpayService } from './application/verify-razorpay.service';
import { MockPaymentGateway } from './infrastructure/mock.gateway';
import { RazorpayGateway } from './infrastructure/razorpay.gateway';
import { StripeGateway } from './infrastructure/stripe.gateway';
import { PaymentsController } from './presentation/payments.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [
    MockPaymentGateway,
    RazorpayGateway,
    StripeGateway,
    PaymentOrchestratorService,
    ConfirmPaymentService,
    RefundPaymentService,
    VerifyRazorpayService,
  ],
  exports: [
    PaymentOrchestratorService,
    ConfirmPaymentService,
    RefundPaymentService,
  ],
})
export class PaymentsModule {}
