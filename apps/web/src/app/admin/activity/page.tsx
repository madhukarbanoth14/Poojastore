"use client";

import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatWhen } from "@/lib/format";

type Log = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  user?: { fullName?: string | null; email?: string | null; role?: string } | null;
};

export default function AdminActivityPage() {
  const [items, setItems] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void clientFetch<{ items: Log[] }>("/admin/audit-logs?pageSize=60")
      .then((data) => setItems(data.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Trail</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Activity</h1>
      <p className="mt-2 text-sm text-muted">
        Logins, checkouts, packing updates, refunds, and promo edits — so you can see who moved an order.
      </p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
      <ul className="mt-6 space-y-2">
        {items.map((row) => (
          <li key={row.id} className="rounded-2xl border border-divider bg-paper px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-maroon">{row.action.replaceAll("_", " ")}</p>
              <p className="text-xs text-muted">{formatWhen(row.createdAt)}</p>
            </div>
            <p className="mt-1 text-sm text-muted">
              {row.resource}
              {row.user?.fullName || row.user?.email ? ` · ${row.user.fullName || row.user.email}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
