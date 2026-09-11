"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney, formatWhen } from "@/lib/format";
import {
  currentTrackingStep,
  summarizeOrder,
  summaryStatusLabel,
  summaryStatusTone,
  trackingDisplayLabel,
  visibleTrackingSteps,
} from "@/lib/order-display";
import type { Order } from "@/lib/types";

type Filter = "all" | "active" | "delivered" | "closed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "closed", label: "Cancelled" },
];

function matchesFilter(order: Order, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "delivered") return order.status === "DELIVERED";
  if (filter === "closed") {
    return ["CANCELLED", "REFUNDED", "FAILED"].includes(order.status);
  }
  return ["PENDING_PAYMENT", "PAID", "FULFILLING", "SHIPPED"].includes(order.status);
}

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/orders");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    void clientFetch<{ items: Order[] }>("/orders")
      .then((data) => setOrders(data.items ?? []))
      .catch(() => setOrders([]));
  }, [user]);

  const visible = useMemo(
    () => orders.filter((order) => matchesFilter(order, filter)),
    [orders, filter],
  );

  if (!ready) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Account</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">My orders</h1>
      <p className="mt-2 text-sm text-muted">Tap an order to track it, cancel, or request a refund.</p>
      <Link href="/account" className="mt-2 inline-block text-sm font-semibold text-maroon">
        ← Account
      </Link>

      {orders.length > 1 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide ${
                filter === item.id ? "bg-orange text-cream" : "border border-gold text-maroon"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {visible.map((order) => {
          const summary = summarizeOrder(order);
          const step = currentTrackingStep(visibleTrackingSteps(order));
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card-temple block p-4 transition hover:border-gold"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase ${summaryStatusTone(order)}`}>
                  {summaryStatusLabel(order)}
                </span>
                <span className="price text-lg">{formatMoney(order.totalMinor, order.currency)}</span>
              </div>
              <p className="mt-3 truncate font-display text-xl text-maroon">{summary.title}</p>
              <p className="mt-1 text-sm text-muted">
                {summary.subtitle}
                {step ? ` · ${trackingDisplayLabel(step)}` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>
                  {order.orderNumber ?? order.id.slice(0, 8)}
                  {formatWhen(order.createdAt) ? ` · ${formatWhen(order.createdAt)}` : ""}
                </span>
                <span className="font-semibold text-maroon">Track →</span>
              </div>
            </Link>
          );
        })}
        {!orders.length ? (
          <div className="card-temple px-6 py-14 text-center">
            <p className="font-display text-2xl text-maroon">No orders yet</p>
            <p className="mt-2 text-sm text-muted">Your kits and samagri will appear here after checkout.</p>
            <Link href="/kits" className="btn-orange mt-6">
              Browse kits
            </Link>
          </div>
        ) : null}
        {orders.length && !visible.length ? (
          <p className="text-sm text-muted">No orders in this filter.</p>
        ) : null}
      </div>
    </div>
  );
}
