"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/orders/${id}`);
  }, [ready, user, router, id]);

  useEffect(() => {
    if (!user) return;
    void clientFetch<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message));
  }, [id, user]);

  if (!ready) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Order</h1>
      {error ? <p className="mt-4 text-orange">{error}</p> : null}
      {order ? (
        <div className="card-temple mt-6 p-5">
          <p className="text-sm text-muted">{order.orderNumber ?? order.id}</p>
          <p className="mt-1 font-semibold">{order.status}</p>
          <p className="mt-2 text-xl price">
            {formatMoney(order.totalMinor, order.currency)}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {(order.items ?? []).map((item, i) => (
              <li key={i}>
                {item.productName ?? item.name} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
