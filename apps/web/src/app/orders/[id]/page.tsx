"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrderDetailView } from "@/components/order-detail-view";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "refund" | "return" | null>(null);

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
    setBusy(kind);
    setError(null);
    try {
      const updated = await clientFetch<Order>(`/orders/${id}/${kind}`, {
        method: "POST",
        body: JSON.stringify({ reason: `customer_${kind}` }),
      });
      setOrder(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the order");
      return false;
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return <p className="py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;
  if (!order && !error) {
    return <p className="py-16 text-center text-muted">Loading order…</p>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="font-display text-2xl text-maroon">Order not found</p>
        <p className="mt-2 text-sm text-orange">{error}</p>
      </div>
    );
  }

  return <OrderDetailView order={order} error={error} busy={busy} onAct={act} />;
}
