"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatMoney, formatWhen } from "@/lib/format";

type PaymentRow = {
  id: string;
  status: string;
  provider: string;
  amountMinor: number;
  currency: string;
  createdAt: string;
  providerPaymentId?: string | null;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    user?: { fullName?: string | null; phoneE164?: string };
  };
};

export default function AdminTransactionsPage() {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void clientFetch<{ items: PaymentRow[] }>("/admin/payments?pageSize=50")
      .then((data) => setItems(data.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Money</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Transactions</h1>
      <p className="mt-2 text-sm text-muted">Every payment attempt — paid, pending, failed, or refunded.</p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
      <ul className="mt-6 space-y-3">
        {items.map((row) => (
          <li key={row.id} className="card-temple flex items-start justify-between gap-3 p-4">
            <div>
              <Link href={`/admin/orders/${row.order.id}`} className="font-semibold text-maroon">
                {row.order.orderNumber}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {row.provider} · {row.status}
                {row.order.user?.fullName ? ` · ${row.order.user.fullName}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">{formatWhen(row.createdAt)}</p>
            </div>
            <p className="font-semibold">{formatMoney(row.amountMinor, row.currency)}</p>
          </li>
        ))}
      </ul>
      {!error && !items.length ? <p className="mt-8 text-sm text-muted">No transactions yet.</p> : null}
    </div>
  );
}
