"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";

type Summary = {
  orders: {
    pendingPayment: number;
    awaitingConfirmation: number;
    awaitingVendor: number;
    awaitingFulfillment: number;
    shipped: number;
    delivered: number;
    returnsRequested: number;
  };
  payments: { succeeded: number; capturedMinor: number };
  usersActive: number;
  promosActive: number;
};

const CARDS: { key: keyof Summary["orders"]; label: string; href: string }[] = [
  { key: "awaitingConfirmation", label: "To confirm", href: "/admin/orders?status=TO_CONFIRM" },
  { key: "awaitingVendor", label: "Send to vendor", href: "/admin/orders?status=AWAITING_VENDOR" },
  { key: "awaitingFulfillment", label: "To pack", href: "/admin/orders?status=TO_PACK" },
  { key: "shipped", label: "On the way", href: "/admin/orders?status=SHIPPED" },
];

export default function AdminHomePage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void clientFetch<Summary>("/admin/ops/summary")
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Store ops</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Today’s desk</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Pack kits, confirm orders, and SMS the vendor who delivers to the customer. Payments and promo codes live here — not the shop CMS.
      </p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link key={card.key} href={card.href} className="card-temple p-4">
            <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-maroon">
              {data ? data.orders[card.key] : "—"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Link href="/admin/transactions" className="card-temple p-4">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Captured</p>
          <p className="mt-2 font-display text-3xl text-maroon">
            {data ? formatMoney(data.payments.capturedMinor) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted">{data?.payments.succeeded ?? 0} successful payments</p>
        </Link>
        <Link href="/admin/customers" className="card-temple p-4">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Customers</p>
          <p className="mt-2 font-display text-3xl text-maroon">{data?.usersActive ?? "—"}</p>
        </Link>
        <Link href="/admin/promos" className="card-temple p-4">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Active promos</p>
          <p className="mt-2 font-display text-3xl text-maroon">{data?.promosActive ?? "—"}</p>
        </Link>
      </div>
    </div>
  );
}
