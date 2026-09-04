"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/orders");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    void clientFetch<{ items: Order[] }>("/orders")
      .then((data) => setOrders(data.items ?? []))
      .catch(() => setOrders([]));
  }, [user]);

  if (!ready) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Seva history</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">My orders</h1>
      <Link href="/account" className="mt-2 inline-block text-sm font-semibold text-maroon">
        ← Account
      </Link>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="card-temple flex justify-between p-4">
            <div>
              <p className="font-semibold">{o.orderNumber ?? o.id.slice(0, 8)}</p>
              <p className="text-sm text-muted">{o.status}</p>
            </div>
            <p className="font-semibold price">{formatMoney(o.totalMinor, o.currency)}</p>
          </Link>
        ))}
        {!orders.length ? <p className="text-sm text-muted">No orders yet.</p> : null}
      </div>
    </div>
  );
}
