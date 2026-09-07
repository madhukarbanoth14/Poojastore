import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentProvider, Role } from '@prisma/client';
import Stripe from 'stripe';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { ConfirmPaymentService } from '../application/confirm-payment.service';
import { RefundPaymentService } from '../application/refund-payment.service';
import { VerifyRazorpayService } from '../application/verify-razorpay.service';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { SubmitUpiDto } from './dto/submit-upi.dto';
import {
  razorpayWebhookSecret,
  stripeSecretKey,
  stripeWebhookSecret,
} from '../infrastructure/payment-credentials';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(
    private readonly confirm: ConfirmPaymentService,
    private readonly refunds: RefundPaymentService,
    private readonly verifyRazorpay: VerifyRazorpayService,
    private readonly config: ConfigService,
  ) {}

  private get isLiveMode(): boolean {
    return (this.config.get<string>('payments.mode') ?? 'mock') === 'live';
  }

  private get isProduction(): boolean {
    return this.config.get<string>('nodeEnv') === 'production';
  }

  @Public()
  @Post('razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay webhook' })
  async razorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: Record<string, unknown>,
  ) {
    const secret = razorpayWebhookSecret(this.config);

    if (this.isLiveMode || this.isProduction) {
      if (!secret) {
        throw new UnauthorizedException('Razorpay webhook secret not configured');
      }
    }

    if (secret) {
      const raw = req.rawBody?.toString('utf8') ?? JSON.stringify(body);
      const expected = createHmac('sha256', secret).update(raw).digest('hex');
      const valid =
        !!signature &&
        expected.length === signature.length &&
        timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
      if (!valid) {
        throw new UnauthorizedException('Invalid Razorpay signature');
      }
    }

    const event = body.event as string | undefined;
    const eventId =
      (body.id as string | undefined) ??
      `${event}:${(body.created_at as number | undefined) ?? Date.now()}`;

    const claimed = await this.confirm.claimWebhookEvent({
      provider: PaymentProvider.RAZORPAY,
      eventId,
      eventType: event ?? 'unknown',
      payload: body,
    });
    if (claimed.duplicate) {
      return { success: true, data: { duplicate: true } };
    }

    const payload = body.payload as
      | {
          payment?: {
            entity?: {
              id?: string;
              order_id?: string;
              status?: string;
              amount?: number;
            };
          };
          refund?: {
            entity?: {
              id?: string;
              payment_id?: string;
              amount?: number;
            };
          };
        }
      | undefined;

    if (event === 'payment.captured') {
      const entity = payload?.payment?.entity;
      if (entity?.order_id) {
        await this.confirm.markSucceeded({
          providerOrderId: entity.order_id,
          providerPaymentId: entity.id,
          amountMinor: entity.amount,
          raw: body,
        });
      }
    }

    if (event === 'payment.failed') {
      const entity = payload?.payment?.entity;
      if (entity?.order_id) {
        await this.confirm.markFailed({
          providerOrderId: entity.order_id,
          reason: 'razorpay_payment_failed',
        });
      }
    }

    if (event === 'refund.processed' || event === 'refund.created') {
      const refund = payload?.refund?.entity;
      if (refund?.payment_id) {
        await this.confirm.markRefunded({
          providerPaymentId: refund.payment_id,
          providerRefundId: refund.id,
          amountMinor: refund.amount,
          raw: body,
        });
      }
    }

    return { success: true };
  }

  @Post('razorpay/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay Checkout signature after payment' })
  async verifyCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: VerifyRazorpayDto,
  ) {
    const payment = await this.verifyRazorpay.verify({
      userId: user.id,
      paymentId: body.paymentId,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });
    return { success: true, data: payment };
  }

  @Public()
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Body() body: Record<string, unknown>,
  ) {
    const secret = stripeWebhookSecret(this.config);
    const stripeKey = stripeSecretKey(this.config);

    if (this.isLiveMode || this.isProduction) {
      if (!secret || !stripeKey) {
        throw new UnauthorizedException('Stripe webhook secrets not configured');
      }
      if (!req.rawBody) {
        throw new BadRequestException('Raw body required for Stripe webhook');
      }
    }

    let event: Stripe.Event;
    if (secret && stripeKey && req.rawBody) {
      const stripe = new Stripe(stripeKey);
      try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
      } catch {
        throw new UnauthorizedException('Invalid Stripe signature');
      }
    } else {
      event = body as unknown as Stripe.Event;
    }

    const claimed = await this.confirm.claimWebhookEvent({
      provider: PaymentProvider.STRIPE,
      eventId: event.id,
      eventType: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
    if (claimed.duplicate) {
      return { success: true, data: { duplicate: true } };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.confirm.markSucceeded({
        providerOrderId: session.id,
        providerPaymentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        amountMinor: session.amount_total ?? undefined,
        raw: event as unknown as Record<string, unknown>,
      });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.confirm.markFailed({
        providerOrderId: session.id,
        reason: 'stripe_session_expired',
      });
    }

    if (event.type === 'charge.refunded' || event.type === 'refund.updated') {
      const obj = event.data.object as Stripe.Charge | Stripe.Refund;
      if (event.type === 'charge.refunded') {
        const charge = obj as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (pi) {
          await this.confirm.markRefunded({
            providerPaymentId: pi,
            providerRefundId: charge.refunds?.data?.[0]?.id,
            amountMinor: charge.amount_refunded,
            raw: event as unknown as Record<string, unknown>,
          });
        }
      } else {
        const refund = obj as Stripe.Refund;
        if (refund.status === 'succeeded') {
          const pi =
            typeof refund.payment_intent === 'string'
              ? refund.payment_intent
              : refund.payment_intent?.id;
          if (pi) {
            await this.confirm.markRefunded({
              providerPaymentId: pi,
              providerRefundId: refund.id,
              amountMinor: refund.amount,
              raw: event as unknown as Record<string, unknown>,
            });
          }
        }
      }
    }

    return { success: true };
  }

  @Post(':id/upi-submit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit UPI UTR and/or payment screenshot' })
  async submitUpi(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SubmitUpiDto,
  ) {
    const payment = await this.confirm.submitUpiProof(id, user.id, {
      utr: body.utr,
      screenshotBase64: body.screenshotBase64,
    });
    return { success: true, data: payment };
  }

  @Get(':id/upi-proof')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download the uploaded UPI payment screenshot' })
  async upiProof(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const proof = await this.confirm.getUpiProof(id, user);
    return new StreamableFile(proof.image, {
      type: proof.mimeType,
      disposition: 'inline',
    });
  }

  @Post(':id/upi-admin-confirm')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin confirms a company UPI QR payment' })
  async adminConfirmUpi(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const payment = await this.confirm.adminConfirmUpi(id, user.id);
    return { success: true, data: payment };
  }

  @Post(':id/mock-confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm mock payment (dev/test only)' })
  async mockConfirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (this.isProduction) {
      throw new ForbiddenException('Mock payment confirm is disabled in production');
    }
    if (this.isLiveMode) {
      throw new ForbiddenException('Mock payment confirm is disabled when PAYMENT_MODE=live');
    }
    const payment = await this.confirm.mockConfirm(id, user.id);
    return { success: true, data: payment };
  }

  @Post(':id/refund')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Refund a succeeded payment (admin)' })
  async refund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RefundPaymentDto,
  ) {
    const payment = await this.refunds.refund({
      paymentId: id,
      amountMinor: body.amountMinor,
      reason: body.reason,
      adminUserId: user.id,
    });
    return { success: true, data: payment };
  }
}
