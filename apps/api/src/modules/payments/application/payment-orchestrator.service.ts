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
import { UpiQrGateway } from '../infrastructure/upi-qr.gateway';

function gatewayFailureDetail(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const body = err as {
      error?: { description?: string };
      message?: string;
      statusCode?: number;
    };
    const description = body.error?.description || body.message;
    if (description) {
      return body.statusCode
        ? `${description} (${body.statusCode})`
        : description;
    }
  }
  return String(err);
}

@Injectable()
export class PaymentOrchestratorService {
  private readonly logger = new Logger(PaymentOrchestratorService.name);
  private readonly gateways: PaymentGateway[];

  constructor(
    private readonly config: ConfigService,
    mock: MockPaymentGateway,
    razorpay: RazorpayGateway,
    stripe: StripeGateway,
    upiQr: UpiQrGateway,
  ) {
    this.gateways = [upiQr, razorpay, stripe, mock];
  }

  resolveGateway(market: Market): PaymentGateway {
    const mode = this.config.get<string>('payments.mode') ?? 'mock';
    const live = this.gateways.find(
      (g) => g.provider !== PaymentProvider.MOCK && g.supports(market),
    );

    if (mode === 'live') {
      if (live) return live;
      throw new Error(
        `No live payment gateway configured for market ${market}. Set UPI_VPA (company QR), Razorpay (IN), or Stripe (US/CA); mock fallback is forbidden when PAYMENT_MODE=live.`,
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
    const gateway = this.resolveGateway(input.market);
    this.logger.log(
      `Creating ${gateway.provider} session for market ${input.market}`,
    );
    try {
      return await gateway.createSession(input);
    } catch (err) {
      const detail = gatewayFailureDetail(err);
      this.logger.error(
        `Payment session failed via ${gateway.provider}: ${detail}`,
        err instanceof Error ? err.stack : undefined,
      );
      const nodeEnv = this.config.get<string>('nodeEnv') ?? 'development';
      if (
        nodeEnv !== 'production' &&
        gateway.provider === PaymentProvider.RAZORPAY &&
        /authentication failed/i.test(detail)
      ) {
        throw new BadGatewayException(
          'Razorpay authentication failed. The Test Key ID and Key Secret in apps/api/.env are loaded, but Razorpay rejected that pair. Generate a new Test mode pair (both values from the same generation), replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, kill the process on port 3000, then start the API once.',
        );
      }
      throw new BadGatewayException(
        'Could not start payment. Please try again in a moment.',
      );
    }
  }
}
