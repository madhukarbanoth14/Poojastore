"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import { completePayment, listAddresses } from "@/lib/payments";
import type { Address, Cart } from "@/lib/types";

const SLOTS = ["Today, 6–8 PM", "Tomorrow, 9–11 AM", "Tomorrow, 4–6 PM"];

export default function CheckoutPage() {
  const { user, cart, ready, refreshCart } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void listAddresses()
      .then((items) => {
        setAddresses(items);
        if (items[0]) setAddressId(items[0].id);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/checkout");
  }, [ready, user, router]);

  if (!ready) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  const snapshot: Cart | null = cart;
  const total = snapshot?.subtotalMinor ?? 0;

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      let shippingAddressId = addressId;
      if (!shippingAddressId) {
        const created = await clientFetch<Address>("/addresses", {
          method: "POST",
          body: JSON.stringify({
            label: "Home",
            line1,
            city,
            state,
            postalCode: postal,
            country: "IN",
            isDefault: true,
          }),
        });
        shippingAddressId = created.id;
      }
      const result = await clientFetch<{
        order: { id: string; totalMinor: number };
        payment: Parameters<typeof completePayment>[0];
      }>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({ shippingAddressId, deliverySlot: slot }),
      });
      await completePayment(result.payment);
      await refreshCart();
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Complete your order</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Checkout</h1>
      <p className="mt-2 text-lg">
        Total <span className="price">{formatMoney(total, snapshot?.currency ?? "INR")}</span>
      </p>
      <div className="card-temple mt-8 space-y-5 p-6">
        <h2 className="font-semibold">Delivery address</h2>
        {addresses.length ? (
          addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAddressId(a.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${addressId === a.id ? "border-gold bg-blush" : "border-border bg-paper"}`}
            >
              <p className="font-semibold">{a.label}</p>
              <p className="text-muted">
                {a.line1}, {a.city}, {a.state} {a.postalCode}
              </p>
            </button>
          ))
        ) : (
          <div className="grid gap-2">
            <input className="input-ps" placeholder="Address" value={line1} onChange={(e) => setLine1(e.target.value)} />
            <input className="input-ps" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className="input-ps" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            <input className="input-ps" placeholder="PIN" value={postal} onChange={(e) => setPostal(e.target.value)} />
          </div>
        )}
        <h2 className="font-semibold">Delivery slot</h2>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className={`rounded-full px-3 py-1.5 text-sm ${slot === s ? "bg-orange text-cream" : "border border-gold text-maroon"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        <button
          type="button"
          disabled={busy || !total}
          onClick={() => void pay()}
          className="w-full btn-orange disabled:opacity-50"
        >
          {busy ? "Processing…" : "Pay now"}
        </button>
      </div>
    </div>
  );
}
