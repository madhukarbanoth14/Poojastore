"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatMobile, formatMoney, formatWhen } from "@/lib/format";
import { itemName, orderStatusLabel, statusTone } from "@/lib/order-display";

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  returnStatus?: string;
  contactPhoneE164?: string | null;
  user?: { fullName?: string | null; phoneE164?: string; email?: string | null };
  items?: { productName?: string; name?: string; quantity: number }[];
  shippingAddress?: { city: string; state: string };
};

type List = { items: AdminOrder[]; total: number; page: number; pageSize: number };

const FILTERS = [
  { id: "", label: "All" },
  { id: "TO_CONFIRM", label: "To confirm" },
  { id: "AWAITING_VENDOR", label: "Send to vendor" },
  { id: "TO_PACK", label: "To pack" },
  { id: "FULFILLING", label: "Packed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
];

function firstProductName(order: AdminOrder) {
  const items = order.items ?? [];
  if (!items.length) return "—";
  const kit = items.find((item) => /kit/i.test(itemName(item)));
  const primary = kit ?? items[0]!;
  const extra = items.length - 1;
  const name = itemName(primary);
  return extra > 0 ? `${name} +${extra}` : name;
}

function OrdersBoard() {
  const search = useSearchParams();
  const [status, setStatus] = useState(search.get("status") ?? "");
  const [q, setQ] = useState(search.get("q") ?? "");
  const [data, setData] = useState<List | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ pageSize: "30" });
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    void clientFetch<List>(`/admin/orders?${params}`)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [status, q]);

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Fulfillment</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Orders</h1>
      <p className="mt-2 text-sm text-muted">
        Confirm paid orders, SMS the slip to a vendor, then mark packed / shipped / delivered for the customer.
      </p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === filter.id ? "bg-maroon text-cream" : "border border-gold text-maroon"
            }`}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <input
        className="input-ps mt-4 max-w-md"
        placeholder="Search order no., name, phone, email"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <p className="mt-4 text-xs text-muted">{data ? `${data.total} order${data.total === 1 ? "" : "s"}` : "Loading…"}</p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-divider bg-paper">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-divider text-[11px] font-semibold tracking-wide text-muted uppercase">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((order) => (
              <tr key={order.id} className="border-b border-divider/70 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-maroon underline decoration-gold/60 underline-offset-2">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-muted">{formatWhen(order.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusTone(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-maroon" title={firstProductName(order)}>
                  {firstProductName(order)}
                </td>
                <td className="px-4 py-3 font-semibold text-maroon">{order.user?.fullName || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatMobile(order.contactPhoneE164, order.user?.phoneE164)}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {formatMoney(order.totalMinor, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.items.length ? (
          <p className="px-4 py-8 text-sm text-muted">No orders in this view.</p>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading orders…</p>}>
      <OrdersBoard />
    </Suspense>
  );
}
