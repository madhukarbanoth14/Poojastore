"use client";

import { clientFetch, getApiBase } from "./client";
import type { Address } from "./types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Payment = {
  id: string;
  provider: string;
  amountMinor: number;
  currency?: string;
  providerOrderId?: string;
  checkoutUrl?: string;
  metadata?: {
    keyId?: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    prefill?: Record<string, string | undefined>;
  };
};

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

export async function completePayment(payment: Payment) {
  if (payment.provider === "MOCK") {
    await clientFetch(`/payments/${payment.id}/mock-confirm`, { method: "POST" });
    return;
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
        theme: { color: "#6E1423" },
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
    return;
  }

  if (payment.provider === "STRIPE") {
    if (!payment.checkoutUrl) throw new Error("Stripe checkout URL is missing");
    window.location.assign(payment.checkoutUrl);
    return;
  }

  throw new Error(`Unsupported payment provider: ${payment.provider}`);
}

export async function listAddresses() {
  const data = await clientFetch<{ items: Address[] }>("/addresses");
  return data.items ?? [];
}

export { getApiBase };
