"use client";

import { clientFetch, getApiBase } from "./client";
import type { Address } from "./types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export type Payment = {
  id: string;
  provider: string;
  amountMinor: number;
  currency?: string;
  providerOrderId?: string;
  checkoutUrl?: string;
  metadata?: {
    keyId?: string;
    amount?: number | string;
    currency?: string;
    name?: string;
    description?: string;
    prefill?: Record<string, string | undefined>;
    vpa?: string;
    payeeName?: string;
    upiUri?: string;
    phonepeUri?: string;
    gpayUri?: string;
    gpayAltUri?: string;
    paytmUri?: string;
    bhimUri?: string;
    qrImageUrl?: string;
    orderNumber?: string;
    utr?: string;
    hasScreenshot?: boolean;
  };
};

export type PaymentCompletion = "completed" | "upi";

export function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Could not load Razorpay")),
        { once: true },
      );
      if (window.Razorpay) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

export async function completePayment(payment: Payment): Promise<PaymentCompletion> {
  if (payment.provider === "UPI_QR") {
    return "upi";
  }

  if (payment.provider === "MOCK") {
    await clientFetch(`/payments/${payment.id}/mock-confirm`, { method: "POST" });
    return "completed";
  }

  if (payment.provider === "RAZORPAY") {
    await loadRazorpay();
    const key = payment.metadata?.keyId;
    const orderId = payment.providerOrderId;
    if (!key || !orderId || !window.Razorpay) {
      throw new Error("Razorpay session is missing key or order id");
    }
    const result = await new Promise<{
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }>((resolve, reject) => {
      const rzp = new window.Razorpay!({
        key,
        amount: payment.metadata?.amount ?? payment.amountMinor,
        currency: payment.metadata?.currency ?? payment.currency ?? "INR",
        name: payment.metadata?.name ?? "Pavitra Seva",
        description: payment.metadata?.description ?? "Order",
        order_id: orderId,
        prefill: payment.metadata?.prefill ?? {},
        theme: { color: "#8F1724" },
        handler: (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => resolve(res),
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      });
      rzp.open();
    });
    await clientFetch("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify({
        paymentId: payment.id,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      }),
    });
    return "completed";
  }

  if (payment.provider === "STRIPE") {
    if (!payment.checkoutUrl) throw new Error("Stripe checkout URL is missing");
    window.location.assign(payment.checkoutUrl);
    return "completed";
  }

  throw new Error(`Unsupported payment provider: ${payment.provider}`);
}

export async function submitUpiUtr(
  paymentId: string,
  input: { utr?: string; screenshotBase64?: string },
) {
  return clientFetch(`/payments/${paymentId}/upi-submit`, {
    method: "POST",
    body: JSON.stringify({
      utr: input.utr?.trim() || undefined,
      screenshotBase64: input.screenshotBase64,
    }),
  });
}

export async function listAddresses() {
  const data = await clientFetch<{ items: Address[] }>("/addresses");
  return data.items ?? [];
}

export { getApiBase };
