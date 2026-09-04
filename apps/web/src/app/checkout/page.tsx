"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import { completePayment, listAddresses, loadRazorpay } from "@/lib/payments";
import type { Address, Cart } from "@/lib/types";

const SLOTS = ["Today, 6–8 PM", "Tomorrow, 9–11 AM", "Tomorrow, 4–6 PM"];

type Intent = "self" | "family" | "refer";
type Step = 1 | 2 | 3 | 4;

function toE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

function StepDots({ step, lastLabel }: { step: Step; lastLabel: string }) {
  const labels = ["Kits", "Who", "Details", lastLabel];
  return (
    <ol className="mt-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                active || done ? "bg-orange text-cream" : "border border-gold text-muted"
              }`}
            >
              {n}
            </span>
            <span className={`truncate ${active ? "text-maroon" : "text-muted"}`}>{label}</span>
            {i < labels.length - 1 ? <span className="hidden h-px flex-1 bg-divider sm:block" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function CheckoutPage() {
  const { user, cart, ready, refreshCart } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [intent, setIntent] = useState<Intent>("self");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [familyLine1, setFamilyLine1] = useState("");
  const [familyCity, setFamilyCity] = useState("");
  const [familyState, setFamilyState] = useState("");
  const [familyPostal, setFamilyPostal] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoOff, setPromoOff] = useState<number | null>(null);

  const snapshot: Cart | null = cart;
  const total = snapshot?.subtotalMinor ?? 0;
  const kitName = snapshot?.items.map((item) => item.product.name).join(", ") || "this Pooja kit";

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

  useEffect(() => {
    void loadRazorpay().catch(() => undefined);
  }, []);

  const hasSelfAddress = Boolean(
    addressId || (line1.trim() && city.trim() && state.trim() && postal.trim()),
  );
  const hasFamily = Boolean(
    recipientName.trim() &&
      toE164(recipientPhone) &&
      familyLine1.trim() &&
      familyCity.trim() &&
      familyState.trim() &&
      familyPostal.trim(),
  );
  const hasRefer = Boolean(recipientName.trim() && toE164(recipientPhone));

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(snapshot?.items.length);
    if (step === 2) return Boolean(intent);
    if (step === 3) {
      if (intent === "family") return hasFamily;
      if (intent === "refer") return hasRefer;
      return hasSelfAddress;
    }
    if (intent === "refer") return hasRefer && !inviteSent;
    if (intent === "family") return hasFamily;
    return hasSelfAddress;
  }, [step, snapshot?.items.length, intent, hasFamily, hasRefer, hasSelfAddress, inviteSent]);

  function next() {
    setError(null);
    if (!canAdvance) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  async function sendInvite() {
    const phone = toE164(recipientPhone);
    if (!recipientName.trim() || !phone) {
      setError("Enter your family member’s name and mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clientFetch("/orders/refer", {
        method: "POST",
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientPhone: phone,
          kitName,
          shopUrl: `${window.location.origin}/kits`,
        }),
      });
      setInviteSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      let shippingAddressId = addressId;
      if (intent === "family") {
        const created = await clientFetch<Address>("/addresses", {
          method: "POST",
          body: JSON.stringify({
            label: recipientName.trim().slice(0, 40) || "Family",
            line1: familyLine1,
            city: familyCity,
            state: familyState,
            postalCode: familyPostal,
            country: "IN",
            isDefault: false,
          }),
        });
        shippingAddressId = created.id;
      } else if (!shippingAddressId) {
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
        body: JSON.stringify({
          shippingAddressId,
          deliverySlot: slot,
          intent,
          recipientName: recipientName.trim() || undefined,
          recipientPhone: toE164(recipientPhone) || undefined,
          promoCode: promoCode.trim() || undefined,
        }),
      });
      await completePayment(result.payment);
      await refreshCart();
      router.push(`/orders/${result.order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(
        /cancelled/i.test(message)
          ? "Payment was closed. Your kits are still here — click Pay now to try again."
          : message,
      );
      await refreshCart().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="px-5 py-16 text-center text-muted">Loading…</p>;
  if (!user) return null;

  const lastLabel = intent === "refer" ? "Send" : "Pay";

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Checkout</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Complete your order</h1>
      <p className="mt-2 text-lg">
        Total <span className="price">{formatMoney(total, snapshot?.currency ?? "INR")}</span>
      </p>
      <StepDots step={step} lastLabel={lastLabel} />

      <div className="card-temple mt-8 space-y-6 p-6">
        {step === 1 ? (
          <section>
            <h2 className="font-semibold">Review your kits</h2>
            {snapshot?.items.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {snapshot.items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-3">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-muted">
                      {formatMoney(item.lineTotalMinor, snapshot.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Your cart is empty.</p>
            )}
            <Link href="/cart" className="mt-3 inline-block text-sm underline decoration-gold underline-offset-2">
              Change quantity
            </Link>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <h2 className="font-semibold">Who is this kit for?</h2>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ["self", "Deliver to me", "Ship this order to your address."],
                  [
                    "family",
                    "Buy the same kit for a family member",
                    "You pay. We deliver to their name, mobile, and address.",
                  ],
                  [
                    "refer",
                    "Refer this kit to a family member",
                    "We text them a link. Your cart stays until you pay for yourself.",
                  ],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setIntent(value);
                    setInviteSent(false);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    intent === value ? "border-gold bg-blush" : "border-border bg-paper"
                  }`}
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-muted">{hint}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 3 && intent === "family" ? (
          <section className="grid gap-2">
            <h2 className="font-semibold">Family member details</h2>
            <input
              className="input-ps"
              placeholder="Full name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="Mobile number"
              inputMode="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="Address"
              value={familyLine1}
              onChange={(e) => setFamilyLine1(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="City"
              value={familyCity}
              onChange={(e) => setFamilyCity(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="State"
              value={familyState}
              onChange={(e) => setFamilyState(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="PIN"
              value={familyPostal}
              onChange={(e) => setFamilyPostal(e.target.value)}
            />
            <SlotPicker slot={slot} onChange={setSlot} />
          </section>
        ) : null}

        {step === 3 && intent === "refer" ? (
          <section className="grid gap-2">
            <h2 className="font-semibold">Who should we message?</h2>
            <p className="text-sm text-muted">
              We will send an SMS to their number with a link to this kit.
            </p>
            <input
              className="input-ps"
              placeholder="Family member’s name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              className="input-ps"
              placeholder="Their mobile number"
              inputMode="tel"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </section>
        ) : null}

        {step === 3 && intent === "self" ? (
          <section>
            <h2 className="font-semibold">Delivery address</h2>
            <AddressFields
              addresses={addresses}
              addressId={addressId}
              onSelect={setAddressId}
              line1={line1}
              city={city}
              state={state}
              postal={postal}
              onLine1={setLine1}
              onCity={setCity}
              onState={setState}
              onPostal={setPostal}
            />
            <SlotPicker slot={slot} onChange={setSlot} />
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-3">
            <h2 className="font-semibold">Review</h2>
            <ul className="space-y-1 text-sm text-muted">
              {snapshot?.items.map((item) => (
                <li key={item.productId}>
                  {item.product.name} × {item.quantity}
                </li>
              ))}
              <li>
                For:{" "}
                {intent === "self"
                  ? "You"
                  : `${recipientName.trim() || "family member"} (${intent === "refer" ? "referral SMS" : "family delivery"})`}
              </li>
              {intent !== "refer" ? <li>Slot: {slot}</li> : null}
            </ul>
            {intent !== "refer" ? (
              <div className="flex gap-2">
                <input
                  className="input-ps flex-1"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoOff(null);
                  }}
                />
                <button
                  type="button"
                  className="btn-outline-gold"
                  disabled={!promoCode.trim() || busy}
                  onClick={() => {
                    setBusy(true);
                    setError(null);
                    void clientFetch<{ discountMinor: number; code: string }>("/promos/quote", {
                      method: "POST",
                      body: JSON.stringify({ code: promoCode.trim() }),
                    })
                      .then((quoted) => setPromoOff(quoted.discountMinor))
                      .catch((err: Error) => setError(err.message))
                      .finally(() => setBusy(false));
                  }}
                >
                  Apply
                </button>
              </div>
            ) : null}
            {promoOff ? (
              <p className="text-sm text-maroon">
                {promoCode} saves {formatMoney(promoOff, snapshot?.currency ?? "INR")}
              </p>
            ) : null}
            {intent === "refer" && inviteSent ? (
              <p className="text-sm text-maroon">
                Message sent. Your kits are still in the cart if you want to pay for yourself.
              </p>
            ) : null}
          </section>
        ) : null}

        {error ? <p className="text-sm text-orange">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          {step > 1 ? (
            <button
              type="button"
              className="btn-outline-gold"
              onClick={() => {
                setError(null);
                setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
              }}
            >
              Back
            </button>
          ) : (
            <Link href="/cart" className="btn-outline-gold">
              Back to cart
            </Link>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={next}
              className="btn-orange disabled:opacity-50"
            >
              Continue
            </button>
          ) : intent === "refer" ? (
            inviteSent ? (
              <button
                type="button"
                className="btn-orange"
                onClick={() => {
                  setIntent("self");
                  setInviteSent(false);
                  setStep(3);
                }}
              >
                Pay for my kits
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !hasRefer}
                onClick={() => void sendInvite()}
                className="btn-orange disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            )
          ) : (
            <button
              type="button"
              disabled={busy || !canAdvance}
              onClick={() => void pay()}
              className="btn-orange disabled:opacity-50"
            >
              {busy ? "Processing…" : "Pay now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SlotPicker({ slot, onChange }: { slot: string; onChange: (value: string) => void }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Delivery slot</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-full px-3 py-1.5 text-sm ${slot === s ? "bg-orange text-cream" : "border border-gold text-maroon"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddressFields({
  addresses,
  addressId,
  onSelect,
  line1,
  city,
  state,
  postal,
  onLine1,
  onCity,
  onState,
  onPostal,
}: {
  addresses: Address[];
  addressId: string;
  onSelect: (id: string) => void;
  line1: string;
  city: string;
  state: string;
  postal: string;
  onLine1: (v: string) => void;
  onCity: (v: string) => void;
  onState: (v: string) => void;
  onPostal: (v: string) => void;
}) {
  if (addresses.length) {
    return (
      <div className="mt-2">
        {addresses.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm ${addressId === a.id ? "border-gold bg-blush" : "border-border bg-paper"}`}
          >
            <p className="font-semibold">{a.label}</p>
            <p className="text-muted">
              {a.line1}, {a.city}, {a.state} {a.postalCode}
            </p>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2 grid gap-2">
      <input className="input-ps" placeholder="Address" value={line1} onChange={(e) => onLine1(e.target.value)} />
      <input className="input-ps" placeholder="City" value={city} onChange={(e) => onCity(e.target.value)} />
      <input className="input-ps" placeholder="State" value={state} onChange={(e) => onState(e.target.value)} />
      <input className="input-ps" placeholder="PIN" value={postal} onChange={(e) => onPostal(e.target.value)} />
    </div>
  );
}
