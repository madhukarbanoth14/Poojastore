import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, PaymentProvider } from '@prisma/client';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
} from '../domain/payment.types';
import { MockPaymentGateway } from '../infrastructure/mock.gateway';
import { RazorpayGateway } from '../infrastructure/razorpay.gateway';
import { StripeGateway } from '../infrastructure/stripe.gateway';

@Injectable()
export class PaymentOrchestratorService {
  private readonly gateways: PaymentGateway[];

  constructor(
    private readonly config: ConfigService,
    mock: MockPaymentGateway,
    razorpay: RazorpayGateway,
    stripe: StripeGateway,
  ) {
    this.gateways = [razorpay, stripe, mock];
  }

  resolveGateway(market: Market): PaymentGateway {
    const mode = this.config.get<string>('payments.mode') ?? 'mock';
    const live = this.gateways.find(
      (g) => g.provider !== PaymentProvider.MOCK && g.supports(market),
    );

    if (mode === 'live') {
      if (live) return live;
      throw new Error(
        `No live payment gateway configured for market ${market}. Set Razorpay (IN) or Stripe (US/CA) keys; mock fallback is forbidden when PAYMENT_MODE=live.`,
      );
    }

    // Test keys work even when PAYMENT_MODE=mock: use Razorpay/Stripe if configured.
    return (
      live ??
      this.gateways.find((g) => g.provider === PaymentProvider.MOCK)!
    );
  }

  createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    return this.resolveGateway(input.market).createSession(input);
  }
}
