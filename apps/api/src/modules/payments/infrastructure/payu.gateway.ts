import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, PaymentProvider } from '@prisma/client';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../domain/payment.types';
import { payuCommandHash, payuRequestHash } from '../domain/payu-hash';
import {
  payuEnabled,
  payuMerchantKey,
  payuMerchantSalt,
  payuPaymentUrl,
  payuPostserviceUrl,
} from './payment-credentials';

const API_PREFIX = 'api';
const API_VERSION = 'v1';

export type PayuHostedFields = Record<string, string>;

@Injectable()
export class PayuGateway implements PaymentGateway {
  readonly provider = PaymentProvider.PAYU;
  private readonly logger = new Logger(PayuGateway.name);

  constructor(private readonly config: ConfigService) {
    if (payuEnabled(this.config)) {
      this.logger.log(`PayU ${this.payuModeLabel()} keys loaded for India checkout`);
    }
  }

  supports(market: Market): boolean {
    return market === Market.IN && payuEnabled(this.config);
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    const key = payuMerchantKey(this.config);
    const salt = payuMerchantSalt(this.config);
    if (!key || !salt) {
      throw new Error('PayU is not configured');
    }

    const amount = (input.amountMinor / 100).toFixed(2);
    const txnid = this.toTxnid(input.orderNumber);
    const firstname = this.safeName(input.customer.fullName);
    const email =
      input.customer.email?.trim() ||
      `order.${txnid.toLowerCase()}@pavitraseva.in`;
    const phone = this.indianMobile(input.customer.phoneE164);
    const productinfo = `Pavitra Seva ${input.orderNumber}`.slice(0, 100);
    const udf1 = input.orderId;
    const callbackUrl = `${this.apiBase()}/${API_PREFIX}/${API_VERSION}/payments/payu/callback`;
    const hostedUrl = `${this.apiBase()}/${API_PREFIX}/${API_VERSION}/payments/payu/hosted/${encodeURIComponent(txnid)}`;
    const hash = payuRequestHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      salt,
      udf1,
    });

    const fields: PayuHostedFields = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: callbackUrl,
      furl: callbackUrl,
      hash,
      udf1,
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    return {
      provider: PaymentProvider.PAYU,
      providerOrderId: txnid,
      checkoutUrl: hostedUrl,
      metadata: {
        payuAction: payuPaymentUrl(this.config),
        payuFields: fields,
        amount,
        currency: input.currency,
        orderNumber: input.orderNumber,
        name: 'Pavitra Seva',
        description: `Order ${input.orderNumber}`,
      },
    };
  }

  async refund(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const key = payuMerchantKey(this.config);
    const salt = payuMerchantSalt(this.config);
    if (!key || !salt) {
      throw new Error('PayU is not configured');
    }

    const command = 'cancel_refund_transaction';
    const var1 = input.providerPaymentId;
    const hash = payuCommandHash(key, command, var1, salt);
    const body = new URLSearchParams({
      key,
      command,
      var1,
      var2: input.idempotencyKey ?? `refund_${Date.now()}`,
      var3: (input.amountMinor / 100).toFixed(2),
      hash,
    });

    const response = await fetch(payuPostserviceUrl(this.config), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const raw = (await response.json().catch(() => ({}))) as {
      status?: number | string;
      msg?: string;
      error_code?: number | string;
      request_id?: number | string;
      mihpayid?: string;
    };

    if (!response.ok || Number(raw.status) < 1) {
      this.logger.error(`PayU refund failed: ${JSON.stringify(raw)}`);
      throw new Error(raw.msg || 'PayU could not refund this payment');
    }

    return {
      providerRefundId: String(raw.request_id ?? raw.mihpayid ?? var1),
      amountMinor: input.amountMinor,
      status: 'succeeded',
      raw: raw as Record<string, unknown>,
    };
  }

  private toTxnid(orderNumber: string): string {
    const compact = orderNumber.replace(/[^A-Za-z0-9]/g, '');
    return compact.slice(0, 25) || `PS${Date.now()}`.slice(0, 25);
  }

  private safeName(fullName?: string | null): string {
    const cleaned = (fullName ?? 'Customer').replace(/[|<>]/g, ' ').trim();
    return (cleaned || 'Customer').slice(0, 60);
  }

  private indianMobile(phoneE164: string): string {
    const digits = phoneE164.replace(/\D/g, '');
    const lastTen = digits.slice(-10);
    if (/^[6-9]\d{9}$/.test(lastTen)) return lastTen;
    if (digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2, 12))) {
      return digits.slice(2, 12);
    }
    return lastTen || '9999999999';
  }

  private apiBase(): string {
    return (
      this.config.get<string>('payments.publicBaseUrl') ??
      'http://127.0.0.1:3000'
    ).replace(/\/$/, '');
  }

  private payuModeLabel(): string {
    return payuPaymentUrl(this.config).includes('test.payu.in')
      ? 'test'
      : 'live';
  }
}
