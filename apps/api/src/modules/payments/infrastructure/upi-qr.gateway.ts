import { Injectable } from '@nestjs/common';
import { Market, PaymentProvider } from '@prisma/client';
import {
  CreatePaymentSessionInput,
  CreatePaymentSessionResult,
  PaymentGateway,
  RefundPaymentInput,
  RefundPaymentResult,
} from '../domain/payment.types';
import {
  upiConfigured,
  upiPayeeName,
  upiQrImageUrl,
  upiVpa,
} from './payment-credentials';
import { ConfigService } from '@nestjs/config';

const DEFAULT_PUBLIC_QR = '/images/payments/company-upi-qr.jpeg';

export function toPublicQrImageUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/images/')) return value;
  return DEFAULT_PUBLIC_QR;
}

export function upiPayQuery(params: {
  vpa: string;
  payeeName: string;
  amountRupees: string;
  note: string;
}): string {
  return [
    `pa=${params.vpa}`,
    `pn=${encodeURIComponent(params.payeeName)}`,
    `am=${params.amountRupees}`,
    'cu=INR',
    `tn=${encodeURIComponent(params.note.slice(0, 50))}`,
  ].join('&');
}

export function buildUpiPayUri(params: {
  vpa: string;
  payeeName: string;
  amountRupees: string;
  note: string;
}): string {
  return `upi://pay?${upiPayQuery(params)}`;
}

export function buildUpiAppLinks(params: {
  vpa: string;
  payeeName: string;
  amountRupees: string;
  note: string;
}) {
  const query = upiPayQuery(params);
  return {
    upiUri: `upi://pay?${query}`,
    phonepeUri: `phonepe://pay?${query}`,
    gpayUri: `tez://upi/pay?${query}`,
    gpayAltUri: `gpay://upi/pay?${query}`,
    paytmUri: `paytmmp://pay?${query}`,
    bhimUri: `bhim://pay?${query}`,
  };
}

@Injectable()
export class UpiQrGateway implements PaymentGateway {
  readonly provider = PaymentProvider.UPI_QR;

  constructor(private readonly config: ConfigService) {}

  supports(market: Market): boolean {
    return market === Market.IN && upiConfigured(this.config);
  }

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<CreatePaymentSessionResult> {
    const vpa = upiVpa(this.config);
    const payeeName = upiPayeeName(this.config);
    const amountRupees = (input.amountMinor / 100).toFixed(2);
    const note = `Order ${input.orderNumber}`;
    const qrImageUrl = toPublicQrImageUrl(upiQrImageUrl(this.config));
    const links = vpa
      ? buildUpiAppLinks({ vpa, payeeName, amountRupees, note })
      : undefined;

    return {
      provider: PaymentProvider.UPI_QR,
      providerOrderId: `upi_${input.orderId}`,
      metadata: {
        vpa: vpa || undefined,
        payeeName,
        amount: amountRupees,
        currency: input.currency,
        upiUri: links?.upiUri,
        phonepeUri: links?.phonepeUri,
        gpayUri: links?.gpayUri,
        gpayAltUri: links?.gpayAltUri,
        paytmUri: links?.paytmUri,
        bhimUri: links?.bhimUri,
        qrImageUrl: qrImageUrl || undefined,
        orderNumber: input.orderNumber,
      },
    };
  }

  async refund(_input: RefundPaymentInput): Promise<RefundPaymentResult> {
    throw new Error(
      'Refund this UPI payment from your bank or UPI app, then mark the order refunded in admin.',
    );
  }
}
