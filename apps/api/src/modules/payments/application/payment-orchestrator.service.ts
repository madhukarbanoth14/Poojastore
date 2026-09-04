import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PaymentOrchestratorService.name);
  private readonly gateways: PaymentGateway[];
  private readonly mock: MockPaymentGateway;

  constructor(
    private readonly config: ConfigService,
    mock: MockPaymentGateway,
    razorpay: RazorpayGateway,
    stripe: StripeGateway,
  ) {
    this.mock = mock;
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

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    const mode = this.config.get<string>('payments.mode') ?? 'mock';
    const gateway = this.resolveGateway(input.market);
    try {
      return await gateway.createSession(input);
    } catch (err) {
      this.logger.error(
        `Payment session failed via ${gateway.provider}`,
        err instanceof Error ? err.stack : String(err),
      );
      if (mode === 'live' || gateway.provider === PaymentProvider.MOCK) {
        throw new BadGatewayException(
          'Could not start payment. Please try again in a moment.',
        );
      }
      return this.mock.createSession(input);
    }
  }
}
