"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch, deviceId } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import { completePayment, type Payment } from "@/lib/payments";
import {
  peekPendingCart,
  takePendingCart,
  type PendingCartAdd,
} from "@/lib/pending-cart";
import { HYDERABAD_DELIVERY_MESSAGE, isHyderabadDelivery } from "@/lib/delivery-zone";
import type { AuthUser } from "@/lib/types";

export function GuestCheckoutForm() {
  const { applySession } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<PendingCartAdd | null>(null);
  const [ready, setReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [postal, setPostal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPending(peekPendingCart());
    setReady(true);
  }, []);

  async function submit() {
    if (!pending?.productId) {
      setError("Choose a kit first, then continue to checkout.");
      return;
    }
    if (!isHyderabadDelivery({ city, postalCode: postal })) {
      setError(HYDERABAD_DELIVERY_MESSAGE);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await clientFetch<{
        order: { id: string };
        payment: Payment;
        tokens: { accessToken: string; refreshToken: string };
        user: AuthUser;
      }>("/orders/guest-checkout", {
        method: "POST",
        body: JSON.stringify({
          productId: pending.productId,
          selectedItemKeys: pending.selectedItemKeys,
          fullName: fullName.trim(),
          phone: phone.trim(),
          line1: line1.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postal.trim(),
          deliverySlot: "Within 6 hours",
          deviceId: deviceId(),
        }),
      });
      await applySession({ tokens: result.tokens, user: result.user });
      takePendingCart();
      const kind = await completePayment(result.payment);
      if (kind === "redirect" || kind === "upi") return;
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  }

  if (!pending?.productId) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <div className="card-temple px-6 py-10 text-center">
          <h1 className="font-display text-3xl text-maroon">Choose a kit</h1>
          <p className="mt-3 text-sm text-muted">
            Add a Pooja kit, then enter your name, mobile, and address to book. No Google login needed.
          </p>
          <Link href="/kits" className="btn-orange mt-6 inline-flex justify-center">
            Browse kits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Quick checkout</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Book your kit</h1>
      <p className="mt-2 text-sm text-muted">
        Instagram and Facebook block Google Sign-In. Enter your Hyderabad address — we currently deliver in Hyderabad only.
      </p>
      <div className="card-temple mt-6 px-5 py-4">
        <p className="font-semibold text-maroon">{pending.itemName || "Pooja kit"}</p>
        {pending.priceMinor != null ? (
          <p className="mt-1 text-sm">
            Kit <span className="price">{formatMoney(pending.priceMinor, pending.currency)}</span>
            <span className="text-muted"> · delivery extra if under ₹1,000</span>
          </p>
        ) : null}
      </div>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <input
          className="input-ps"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
        <input
          className="input-ps"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          required
        />
        <input
          className="input-ps"
          placeholder="House / street"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          autoComplete="street-address"
          required
        />
        <input
          className="input-ps"
          placeholder="City (Hyderabad)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
          required
        />
        <input
          className="input-ps"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          autoComplete="address-level1"
          required
        />
        <input
          className="input-ps"
          placeholder="PIN (500xxx)"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
          inputMode="numeric"
          autoComplete="postal-code"
          required
        />
        {!isHyderabadDelivery({ city, postalCode: postal }) && postal.replace(/\D/g, "").length >= 6 ? (
          <p className="text-center text-sm text-orange">{HYDERABAD_DELIVERY_MESSAGE}</p>
        ) : null}
        <button type="submit" disabled={busy} className="btn-orange w-full justify-center disabled:opacity-50">
          {busy ? "Placing order…" : "Pay now"}
        </button>
        {error ? <p className="text-center text-sm text-orange">{error}</p> : null}
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login?next=/checkout" className="font-semibold text-maroon">
          Sign in
        </Link>
      </p>
    </div>
  );
}
