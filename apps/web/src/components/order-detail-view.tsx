"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { kitImage } from "@/lib/catalog-images";
import { formatMoney, formatOrderStamp, formatWhen } from "@/lib/format";
import {
  currentTrackingStep,
  itemName,
  itemVariant,
  orderStatusMessage,
  summarizeOrder,
  summaryStatusLabel,
  summaryStatusTone,
  trackingDisplayLabel,
  visibleTrackingSteps,
} from "@/lib/order-display";
import type { Order, TrackingStep } from "@/lib/types";

type ActionKind = "cancel" | "refund" | "return";

const ACTION_COPY: Record<ActionKind, { title: string; body: string; confirm: string }> = {
  cancel: {
    title: "Cancel this order?",
    body: "If you already paid, we will refund the payment.",
    confirm: "Cancel order",
  },
  refund: {
    title: "Request a refund?",
    body: "The order will be cancelled and the payment returned.",
    confirm: "Request refund",
  },
  return: {
    title: "Request a return and refund?",
    body: "This is available within 7 days of delivery.",
    confirm: "Return & refund",
  },
};

function StageIcon({ code }: { code: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    className: "h-3.5 w-3.5",
    "aria-hidden": true as const,
  };
  if (code === "PLACED") {
    return (
      <svg {...common}>
        <path d="M4 7h16v12H4z" />
        <path d="M8 7V5h8v2" />
      </svg>
    );
  }
  if (code === "PAID") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
  if (code === "CONFIRMED") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M8.5 12.5 11 15l4.5-5" />
      </svg>
    );
  }
  if (code === "VENDOR_ASSIGNED") {
    return (
      <svg {...common}>
        <path d="M12 4v4" />
        <path d="M8 20c0-4 8-4 8 0" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    );
  }
  if (code === "SHIPPED") {
    return (
      <svg {...common}>
        <path d="M3 8h11v9H3z" />
        <path d="M14 11h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="1.4" />
        <circle cx="17" cy="18" r="1.4" />
      </svg>
    );
  }
  if (code === "CANCELLED" || code === "REFUNDED") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function ConfirmDialog({
  kind,
  busy,
  onClose,
  onConfirm,
}: {
  kind: ActionKind;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const copy = ACTION_COPY[kind];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-maroon/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-action-title"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="card-order w-full max-w-md p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="order-action-title" className="font-display text-2xl text-maroon">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{copy.body}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-outline-gold btn-order" disabled={busy} onClick={onClose}>
            Keep order
          </button>
          <button type="button" className="btn-orange btn-order" disabled={busy} onClick={onConfirm}>
            {busy ? "Please wait…" : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackingTimeline({
  steps,
  currentCode,
  pulseCode,
  unpaid,
  onPay,
}: {
  steps: TrackingStep[];
  currentCode: string | null;
  pulseCode: string | null;
  unpaid: boolean;
  onPay: () => void;
}) {
  return (
    <ol className="mt-5 flex flex-col lg:flex-row lg:items-start">
      {steps.map((step, index) => {
        const label = trackingDisplayLabel(step);
        const isCurrent = currentCode === step.code;
        const done = step.done;
        const awaitingPay = unpaid && step.code === "PAID";
        const stamp =
          formatWhen(step.at) ?? (step.eta && !done ? `Est. ${formatWhen(step.eta)}` : null);
        const lineAfter = done && Boolean(steps[index + 1]);
        const lineBefore = index > 0 && Boolean(steps[index - 1]?.done);
        const node = (
          <>
            <div className="flex w-10 shrink-0 flex-col items-center self-stretch lg:w-full lg:flex-row lg:self-auto">
              <span
                className={`hidden h-px flex-1 lg:block ${index === 0 ? "bg-transparent" : lineBefore ? "bg-orange" : "bg-divider"}`}
                aria-hidden
              />
              <span
                className={`relative z-[1] grid place-items-center rounded-full border transition-[box-shadow,transform] duration-300 ${
                  isCurrent ? "h-10 w-10" : "h-8 w-8"
                } ${
                  done
                    ? "border-orange bg-orange text-cream"
                    : isCurrent
                      ? "border-orange bg-blush text-orange"
                      : "border-divider bg-paper text-muted"
                } ${pulseCode === step.code ? "track-pulse" : ""}`}
              >
                <StageIcon code={step.code} />
              </span>
              <span
                className={`hidden h-px flex-1 lg:block ${index === steps.length - 1 ? "bg-transparent" : lineAfter ? "bg-orange" : "bg-divider"}`}
                aria-hidden
              />
              {index < steps.length - 1 ? (
                <span
                  className={`mt-1 w-px flex-1 lg:hidden ${lineAfter ? "bg-orange" : "bg-divider"}`}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pb-5 pt-0.5 lg:px-1 lg:pb-0 lg:pt-3 lg:text-center">
              <p
                className={`text-[12px] font-semibold leading-snug ${
                  done || isCurrent ? "text-maroon" : "text-muted"
                } ${awaitingPay ? "underline decoration-orange/50 underline-offset-2" : ""}`}
              >
                {label}
              </p>
              {stamp ? <p className="mt-0.5 text-[11px] text-muted">{stamp}</p> : null}
            </div>
          </>
        );
        return (
          <li
            key={step.code}
            className="flex min-w-0 gap-3 lg:flex-1 lg:flex-col lg:items-stretch lg:gap-0"
            aria-current={isCurrent ? "step" : undefined}
          >
            {awaitingPay ? (
              <button type="button" className="flex w-full items-start gap-3 text-left lg:flex-col lg:gap-0" onClick={onPay}>
                {node}
              </button>
            ) : (
              node
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetailView({
  order,
  error,
  busy,
  onAct,
}: {
  order: Order;
  error: string | null;
  busy: ActionKind | null;
  onAct: (kind: ActionKind) => Promise<boolean>;
}) {
  const router = useRouter();
  const summary = summarizeOrder(order);
  const tracking = order.tracking;
  const address = order.shippingAddress;
  const steps = useMemo(() => visibleTrackingSteps(order), [order]);
  const current = currentTrackingStep(steps);
  const statusLabel = summaryStatusLabel(order);
  const unpaid = order.status === "PENDING_PAYMENT";
  const closed = ["CANCELLED", "REFUNDED", "FAILED"].includes(order.status);
  const complete = order.status === "DELIVERED" || (steps.length > 0 && steps.every((step) => step.done));
  const currentCode = unpaid ? "PAID" : current?.code ?? null;
  const pulseCode = unpaid ? "PAID" : closed || complete ? null : current?.code ?? null;
  const [confirm, setConfirm] = useState<ActionKind | null>(null);
  const trackingNo = tracking?.trackingNumber ?? order.trackingNumber;
  const courier = tracking?.courierName ?? order.courierName;
  const expected = order.deliverySlot ?? tracking?.deliverySlot;
  const paid = order.payments?.some((p) => p.status === "SUCCEEDED") ?? order.status !== "PENDING_PAYMENT";
  const itemTotal = order.subtotalMinor ?? order.items?.reduce((sum, item) => sum + (item.totalMinor ?? 0), 0) ?? 0;
  const shipping = order.shippingMinor ?? 0;
  const discount = order.discountMinor ?? 0;
  const canAct = tracking?.canCancel || tracking?.canRefund || tracking?.canReturn;
  const placedAt = formatOrderStamp(order.createdAt);

  return (
    <div className="mx-auto max-w-[72rem] px-4 py-6 sm:px-5 md:py-8">
      <nav className="text-[13px] text-muted" aria-label="Breadcrumb">
        <Link href="/orders" className="font-semibold text-maroon hover:underline">
          Orders
        </Link>
        <span className="mx-1.5">/</span>
        <span>Order Details</span>
      </nav>

      <header className="mt-3">
        <h1 className="font-display text-[1.85rem] leading-tight text-maroon md:text-[2.05rem]">Your Order</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
          Track your Pavitra Seva order from confirmation to delivery.
        </p>
      </header>

      {error ? (
        <p className="mt-4 rounded-xl border border-orange/30 bg-blush px-3 py-2 text-sm text-maroon" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-4 md:space-y-5">
        <section className="card-order p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${summaryStatusTone(order)}`}
            >
              {statusLabel}
            </span>
            <p className="price text-xl md:text-2xl">{formatMoney(order.totalMinor, order.currency)}</p>
          </div>
          <h2 className="font-display mt-3 text-[1.55rem] leading-tight text-maroon sm:text-2xl">{summary.title}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Quantity</dt>
              <dd className="mt-0.5 font-medium text-maroon">{summary.count}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Order date</dt>
              <dd className="mt-0.5 font-medium text-maroon">{placedAt ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Order number</dt>
              <dd className="mt-0.5 font-medium break-all text-maroon">{order.orderNumber ?? order.id.slice(0, 8)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Total amount</dt>
              <dd className="mt-0.5 font-medium text-maroon">{formatMoney(order.totalMinor, order.currency)}</dd>
            </div>
          </dl>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{orderStatusMessage(order)}</p>
          {order.status === "PENDING_PAYMENT" &&
          order.payments?.some((p) => p.provider === "UPI_QR") ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-maroon">
                UPI payment is waiting for confirmation
                {order.payments.find((p) => p.provider === "UPI_QR")?.providerPaymentId
                  ? ` (UTR ${order.payments.find((p) => p.provider === "UPI_QR")?.providerPaymentId}).`
                  : ". Scan the QR at checkout and submit UTR + screenshot if you have not already."}{" "}
                Paid status appears after we verify the bank credit — usually within a few hours during the
                business day, not instantly.
              </p>
              <button type="button" className="btn-orange btn-order" onClick={() => router.push("/checkout?resume=1")}>
                Continue to pay
              </button>
            </div>
          ) : null}
          {tracking?.returnStatus && tracking.returnStatus !== "NONE" ? (
            <p className="mt-2 text-sm text-muted">
              Return: {tracking.returnStatus.toLowerCase().replaceAll("_", " ")}
            </p>
          ) : null}
        </section>

        <section className="card-order border-t-[3px] border-t-orange p-4 sm:p-5">
          <h2 className="font-display text-[1.55rem] text-maroon sm:text-2xl">Order Tracking</h2>
          <p className="mt-1 text-sm text-muted">
            Current status: <span className="font-semibold text-maroon">{statusLabel}</span>
          </p>
          {steps.length ? (
            <TrackingTimeline
              steps={steps}
              currentCode={currentCode}
              pulseCode={pulseCode}
              unpaid={unpaid}
              onPay={() => router.push("/checkout?resume=1")}
            />
          ) : (
            <p className="mt-4 text-sm text-muted">Tracking will appear once this order is confirmed.</p>
          )}
          {unpaid ? (
            <p className="mt-3 text-center text-xs text-muted lg:mt-4">
              Tap <span className="font-semibold text-orange">Payment Confirmed</span> to return to checkout.
            </p>
          ) : null}
        </section>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <section className="card-order p-4 sm:p-5">
            <h2 className="font-display text-[1.55rem] text-maroon sm:text-2xl">Delivery Details</h2>
            {address ? (
              <div className="mt-4 flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush text-maroon" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.2" />
                  </svg>
                </span>
                <address className="min-w-0 not-italic text-sm leading-relaxed text-body">
                  {address.line1 ? <p>{address.line1}</p> : null}
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>
                    {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
                  </p>
                  {address.country ? <p>{address.country}</p> : null}
                </address>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Delivery address will appear once it is saved on this order.</p>
            )}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Expected delivery</dt>
                <dd className="mt-0.5 font-medium text-maroon">{expected || "We will share an estimate soon"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Delivery method</dt>
                <dd className="mt-0.5 font-medium text-maroon">
                  {courier || (trackingNo ? "Courier" : "Pavitra Seva delivery")}
                </dd>
              </div>
              {trackingNo ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Tracking number</dt>
                  <dd className="mt-0.5 font-medium break-all text-maroon">{trackingNo}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="card-order p-4 sm:p-5">
            <h2 className="font-display text-[1.55rem] text-maroon sm:text-2xl">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Item</dt>
                <dd className="max-w-[62%] text-right font-medium text-maroon">{summary.title}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Quantity</dt>
                <dd className="font-medium text-maroon">{summary.count}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Item price</dt>
                <dd className="font-medium text-maroon">{formatMoney(itemTotal, order.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery fee</dt>
                <dd className="font-medium text-maroon">
                  {shipping > 0 ? formatMoney(shipping, order.currency) : "Free"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Discount</dt>
                <dd className={discount > 0 ? "font-medium text-orange" : "font-medium text-maroon"}>
                  {discount > 0 ? `−${formatMoney(discount, order.currency)}` : formatMoney(0, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-divider pt-3">
                <dt className="font-semibold text-maroon">{paid ? "Total Paid" : "Amount due"}</dt>
                <dd className="price text-lg">{formatMoney(order.totalMinor, order.currency)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="card-order p-4 sm:p-5">
          <h2 className="font-display text-[1.55rem] text-maroon sm:text-2xl">Purchased items</h2>
          {summary.items.length ? (
            <ul className="mt-3 divide-y divide-divider">
              {summary.items.map((item, i) => {
                const name = itemName(item);
                const variant = itemVariant(item);
                return (
                  <li key={`${name}-${i}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush sm:h-[4.5rem] sm:w-[4.5rem]">
                      <Image
                        src={kitImage(undefined, name)}
                        alt={name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-maroon">{name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {variant} · Qty {item.quantity}
                      </p>
                    </div>
                    {item.totalMinor != null ? (
                      <p className="shrink-0 text-sm font-semibold text-maroon">
                        {formatMoney(item.totalMinor, order.currency)}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Item details will appear here.</p>
          )}
        </section>

        <section className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Link href="/account/support" className="btn-orange btn-order w-full text-center sm:w-auto sm:min-w-[9.5rem]">
            Need Help?
          </Link>
          {canAct ? (
            <div className="flex flex-wrap gap-2">
              {tracking?.canCancel ? (
                <button
                  type="button"
                  className="btn-outline-gold btn-order min-w-[45%] flex-1 sm:min-w-0 sm:flex-none"
                  disabled={busy !== null}
                  onClick={() => setConfirm("cancel")}
                >
                  {busy === "cancel" ? "Cancelling…" : "Cancel Order"}
                </button>
              ) : null}
              {tracking?.canRefund ? (
                <button
                  type="button"
                  className="btn-outline-gold btn-order min-w-[45%] flex-1 sm:min-w-0 sm:flex-none"
                  disabled={busy !== null}
                  onClick={() => setConfirm("refund")}
                >
                  {busy === "refund" ? "Refunding…" : "Request Refund"}
                </button>
              ) : null}
              {tracking?.canReturn ? (
                <button
                  type="button"
                  className="btn-outline-gold btn-order w-full sm:w-auto"
                  disabled={busy !== null}
                  onClick={() => setConfirm("return")}
                >
                  {busy === "return"
                    ? "Requesting…"
                    : tracking.returnStatus === "REQUESTED"
                      ? "Retry return & refund"
                      : "Return & refund"}
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-divider bg-cream/80 px-4 py-3.5 sm:px-5">
          <p className="text-sm font-semibold text-maroon">Need help with your order?</p>
          <p className="mt-1 text-sm text-muted">
            Have a question about delivery, your Pooja Kit, or your order?
          </p>
          <Link href="/account/support" className="mt-2 inline-block text-sm font-semibold text-maroon underline decoration-gold underline-offset-2">
            Contact Support
          </Link>
        </section>
      </div>

      {confirm ? (
        <ConfirmDialog
          kind={confirm}
          busy={busy !== null}
          onClose={() => {
            if (!busy) setConfirm(null);
          }}
          onConfirm={() => {
            const kind = confirm;
            void onAct(kind).then((ok) => {
              if (ok) setConfirm(null);
            });
          }}
        />
      ) : null}
    </div>
  );
}
