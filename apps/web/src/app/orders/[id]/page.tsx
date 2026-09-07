"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney, formatWhen } from "@/lib/format";
import {
  currentTrackingStep,
  itemName,
  orderStatusLabel,
  statusTone,
  summarizeOrder,
} from "@/lib/order-display";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "refund" | "return" | null>(null);
  const [showItems, setShowItems] = useState(false);

  const load = useCallback(() => {
    if (!user || !id) return;
    void clientFetch<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message));
  }, [id, user]);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/orders/${id}`);
  }, [ready, user, router, id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!order) return;
    if (["DELIVERED", "CANCELLED", "REFUNDED", "FAILED"].includes(order.status)) return;
    const timer = window.setInterval(() => load(), 30_000);
    return () => window.clearInterval(timer);
  }, [order?.status, load]);

  async function act(kind: "cancel" | "refund" | "return") {
    const prompts = {
      cancel: "Cancel this order? If you already paid, we will refund the payment.",
      refund: "Request a refund? The order will be cancelled and the payment returned.",
      return: "Request a return and refund? This is available within 7 days of delivery.",
    };
    if (!window.confirm(prompts[kind])) return;
    setBusy(kind);
    setError(null);
    try {
      const updated = await clientFetch<Order>(`/orders/${id}/${kind}`, {
        method: "POST",
        body: JSON.stringify({ reason: `customer_${kind}` }),
      });
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the order");
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  const tracking = order?.tracking;
  const address = order?.shippingAddress;
  const summary = order ? summarizeOrder(order) : null;
  const current = currentTrackingStep(tracking?.steps);
  const compactSteps = (tracking?.steps ?? []).filter((step) =>
    ["CANCELLED", "REFUNDED"].includes(order?.status ?? "")
      ? ["PLACED", "PAID", order?.status].includes(step.code)
      : ["PLACED", "PAID", "CONFIRMED", "VENDOR_ASSIGNED", "SHIPPED", "DELIVERED"].includes(step.code),
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/orders" className="text-sm font-semibold text-maroon">
        ← My orders
      </Link>
      <p className="mt-4 text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Order</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">
        {order?.orderNumber ?? "Details"}
      </h1>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      {order && summary ? (
        <div className="mt-6 space-y-5">
          <section className="card-temple p-5">
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${statusTone(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
              <p className="price text-2xl">{formatMoney(order.totalMinor, order.currency)}</p>
            </div>
            <p className="mt-4 font-display text-2xl text-maroon">{summary.title}</p>
            <p className="mt-1 text-sm text-muted">
              {summary.subtitle}
              {formatWhen(order.createdAt) ? ` · ${formatWhen(order.createdAt)}` : ""}
            </p>
            {current ? (
              <p className="mt-3 text-sm">
                Tracking: <span className="font-semibold">{current.label}</span>
              </p>
            ) : null}
            {order.status === "PENDING_PAYMENT" &&
            order.payments?.some((p) => p.provider === "UPI_QR") ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-maroon">
                  UPI payment is waiting for confirmation
                  {order.payments.find((p) => p.provider === "UPI_QR")?.providerPaymentId
                    ? ` (UTR ${order.payments.find((p) => p.provider === "UPI_QR")?.providerPaymentId}).`
                    : ". Scan the QR at checkout and enter the UTR if you have not already."}
                </p>
                <button
                  type="button"
                  className="btn-orange"
                  onClick={() => router.push("/checkout?resume=1")}
                >
                  Continue to pay
                </button>
              </div>
            ) : null}
            {order.tracking?.returnStatus && order.tracking.returnStatus !== "NONE" ? (
              <p className="mt-1 text-sm text-muted">
                Return: {order.tracking.returnStatus.toLowerCase().replaceAll("_", " ")}
              </p>
            ) : null}

            {summary.items.length > 1 ? (
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-maroon underline decoration-gold underline-offset-2"
                onClick={() => setShowItems((open) => !open)}
              >
                {showItems ? "Hide items" : `View ${summary.items.length} items`}
              </button>
            ) : null}

            {(showItems || summary.items.length <= 1) && summary.items.length ? (
              <ul className="mt-3 max-h-56 space-y-1 overflow-auto border-t border-divider pt-3 text-sm text-muted">
                {summary.items.map((item, i) => (
                  <li key={`${itemName(item)}-${i}`} className="flex justify-between gap-3">
                    <span className="truncate">
                      {itemName(item)} × {item.quantity}
                    </span>
                    {item.totalMinor != null ? (
                      <span>{formatMoney(item.totalMinor, order.currency)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="card-temple p-5">
            <h2 className="font-semibold">Tracking</h2>
            {tracking?.trackingNumber ? (
              <p className="mt-1 text-sm text-muted">
                {tracking.courierName ?? "Courier"} · {tracking.trackingNumber}
              </p>
            ) : null}
            <ol className="mt-4 grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
              {compactSteps.map((step) => {
                const label = step.label
                  .replace("Payment confirmed", "Paid")
                  .replace("Order placed", "Placed");
                const awaitingPay =
                  order.status === "PENDING_PAYMENT" && step.code === "PAID";
                if (awaitingPay) {
                  return (
                    <li key={step.code} className="min-w-0">
                      <button
                        type="button"
                        className="w-full"
                        onClick={() => router.push("/checkout?resume=1")}
                      >
                        <span className="mx-auto block h-2.5 w-2.5 rounded-full border border-gold bg-paper" />
                        <p className="mt-2 truncate text-[11px] font-semibold text-orange underline decoration-orange/50 underline-offset-2">
                          {label}
                        </p>
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={step.code} className="min-w-0">
                    <span
                      className={`mx-auto block h-2.5 w-2.5 rounded-full ${
                        step.done ? "bg-orange" : "border border-gold bg-paper"
                      }`}
                    />
                    <p
                      className={`mt-2 truncate text-[11px] font-semibold ${
                        step.done ? "text-maroon" : "text-muted"
                      }`}
                    >
                      {label}
                    </p>
                  </li>
                );
              })}
            </ol>
            {order.status === "PENDING_PAYMENT" ? (
              <p className="mt-3 text-center text-xs text-muted">
                Tap <span className="font-semibold text-orange">Paid</span> to return to
                checkout and finish UPI payment.
              </p>
            ) : null}
          </section>

          {address ? (
            <section className="card-temple p-5 text-sm">
              <h2 className="font-semibold">Delivery</h2>
              <p className="mt-2 text-muted">
                {address.city}, {address.state} {address.postalCode}
              </p>
              {order.deliverySlot || tracking?.deliverySlot ? (
                <p className="mt-1 text-muted">Slot: {order.deliverySlot ?? tracking?.deliverySlot}</p>
              ) : null}
            </section>
          ) : null}

          {tracking?.canCancel || tracking?.canRefund || tracking?.canReturn ? (
            <section className="flex flex-wrap gap-2">
              {tracking.canCancel ? (
                <button
                  type="button"
                  className="btn-outline-gold"
                  disabled={busy !== null}
                  onClick={() => void act("cancel")}
                >
                  {busy === "cancel" ? "Cancelling…" : "Cancel order"}
                </button>
              ) : null}
              {tracking.canRefund ? (
                <button
                  type="button"
                  className="btn-outline-gold"
                  disabled={busy !== null}
                  onClick={() => void act("refund")}
                >
                  {busy === "refund" ? "Refunding…" : "Request refund"}
                </button>
              ) : null}
              {tracking.canReturn ? (
                <button
                  type="button"
                  className="btn-outline-gold"
                  disabled={busy !== null}
                  onClick={() => void act("return")}
                >
                  {busy === "return"
                    ? "Requesting…"
                    : tracking.returnStatus === "REQUESTED"
                      ? "Retry return & refund"
                      : "Return & refund"}
                </button>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : !error ? (
        <p className="mt-8 text-sm text-muted">Loading order…</p>
      ) : null}
    </div>
  );
}
