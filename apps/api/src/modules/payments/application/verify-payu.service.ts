import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ConfirmPaymentService } from './confirm-payment.service';
import {
  payuHashesMatch,
  payuResponseHash,
  rupeesToMinor,
} from '../domain/payu-hash';
import {
  payuMerchantKey,
  payuMerchantSalt,
} from '../infrastructure/payment-credentials';

type PayuPostedBody = Record<string, unknown>;

@Injectable()
export class VerifyPayuService {
  private readonly logger = new Logger(VerifyPayuService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly confirm: ConfirmPaymentService,
    private readonly config: ConfigService,
  ) {}

  async handlePosted(body: PayuPostedBody): Promise<{
    ok: boolean;
    redirectUrl: string;
  }> {
    const fields = this.asStrings(body);
    const txnid = fields.txnid;
    const status = (fields.status || '').toLowerCase();
    const webBase = this.webBase();

    if (!txnid) {
      throw new BadRequestException('PayU response is missing txnid');
    }

    this.assertValidHash(fields);

    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: PaymentProvider.PAYU,
        OR: [
          { providerOrderId: txnid },
          fields.udf1 ? { orderId: fields.udf1 } : undefined,
        ].filter(Boolean) as object[],
      },
      include: { order: true },
    });
    if (!payment) {
      this.logger.warn(`PayU payment not found txnid=${txnid}`);
      throw new NotFoundException('PayU payment not found');
    }

    const amountMinor = rupeesToMinor(fields.amount);
    if (Number.isFinite(amountMinor) && amountMinor !== payment.amountMinor) {
      throw new BadRequestException('PayU amount does not match this order');
    }

    const eventId = `${txnid}:${status}:${fields.mihpayid || (fields.hash ?? '').slice(0, 16) || 'na'}`;
    const claimed = await this.confirm.claimWebhookEvent({
      provider: PaymentProvider.PAYU,
      eventId,
      eventType: status || 'unknown',
      paymentId: payment.id,
      payload: fields,
    });

    if (status === 'success') {
      if (!claimed.duplicate) {
        await this.confirm.markSucceeded({
          paymentId: payment.id,
          providerOrderId: txnid,
          providerPaymentId: fields.mihpayid || txnid,
          amountMinor: payment.amountMinor,
          raw: {
            payuStatus: status,
            mihpayid: fields.mihpayid,
            bank_ref_num: fields.bank_ref_num,
            mode: fields.mode,
            verifiedAt: new Date().toISOString(),
          },
        });
      }
      return {
        ok: true,
        redirectUrl: `${webBase}/orders/${payment.orderId}?paid=1`,
      };
    }

    if (status === 'pending') {
      return {
        ok: true,
        redirectUrl: `${webBase}/orders/${payment.orderId}?payu=pending`,
      };
    }

    if (!claimed.duplicate && payment.status !== PaymentStatus.SUCCEEDED) {
      await this.confirm.markFailed({
        paymentId: payment.id,
        providerOrderId: txnid,
        reason: fields.error_Message || fields.error || 'payu_failed',
      });
    }

    return {
      ok: false,
      redirectUrl: `${webBase}/checkout?payu=failed`,
    };
  }

  async hostedHtml(txnid: string): Promise<string> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: PaymentProvider.PAYU,
        providerOrderId: txnid,
      },
      include: { order: true },
    });
    if (!payment) {
      throw new NotFoundException('PayU payment not found');
    }
    if (payment.status === PaymentStatus.SUCCEEDED) {
      return this.redirectPage(
        `${this.webBase()}/orders/${payment.orderId}?paid=1`,
      );
    }

    const meta = (payment.metadata as Record<string, unknown>) ?? {};
    const action =
      typeof meta.payuAction === 'string' ? meta.payuAction : '';
    const fields =
      meta.payuFields && typeof meta.payuFields === 'object'
        ? (meta.payuFields as Record<string, string>)
        : null;
    if (!action || !fields) {
      throw new BadRequestException('PayU checkout form is missing');
    }

    const inputs = Object.entries(fields)
      .map(
        ([name, value]) =>
          `<input type="hidden" name="${this.escape(name)}" value="${this.escape(String(value))}" />`,
      )
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Redirecting to PayU</title>
</head>
<body>
  <p>Redirecting to PayU Checkout…</p>
  <form id="payu" method="post" action="${this.escape(action)}">
    ${inputs}
    <button type="submit">Continue to PayU</button>
  </form>
  <script>document.getElementById('payu').submit();</script>
</body>
</html>`;
  }

  private assertValidHash(fields: Record<string, string>) {
    const salt = payuMerchantSalt(this.config);
    const key = payuMerchantKey(this.config);
    if (!salt || !key) {
      throw new BadRequestException('PayU is not configured');
    }
    const expected = payuResponseHash({
      salt,
      status: fields.status,
      key: fields.key || key,
      txnid: fields.txnid,
      amount: fields.amount,
      productinfo: fields.productinfo,
      firstname: fields.firstname,
      email: fields.email,
      udf1: fields.udf1,
      udf2: fields.udf2,
      udf3: fields.udf3,
      udf4: fields.udf4,
      udf5: fields.udf5,
      additionalCharges: fields.additionalCharges,
    });
    if (!fields.hash || !payuHashesMatch(expected, fields.hash)) {
      this.logger.warn(`Invalid PayU hash txnid=${fields.txnid}`);
      throw new BadRequestException('Invalid PayU hash');
    }
  }

  private asStrings(body: PayuPostedBody): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(body ?? {})) {
      if (value == null) continue;
      out[key] = Array.isArray(value) ? String(value[0] ?? '') : String(value);
    }
    return out;
  }

  private webBase(): string {
    return (
      this.config.get<string>('payments.webBaseUrl') ??
      'http://localhost:3001'
    ).replace(/\/$/, '');
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private redirectPage(url: string): string {
    const safe = this.escape(url);
    return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${safe}" /></head><body><a href="${safe}">Continue</a></body></html>`;
  }
}
