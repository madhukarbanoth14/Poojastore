"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  CheckoutDeliveryStep,
  checkoutOrderMath,
  familyFormComplete,
  type FamilyFormState,
} from "@/components/checkout-delivery-step";
import { clientFetch } from "@/lib/client";
import {
  deliveryConfirmCopy,
  deliverySlotForSlugs,
} from "@/lib/delivery-slot";
import { formatMoney } from "@/lib/format";
import { completePayment, listAddresses, loadRazorpay, type Payment } from "@/lib/payments";
import { UpiPayPanel } from "@/components/upi-pay-panel";
import type { Address, Cart } from "@/lib/types";

type Intent = "self" | "family" | "refer";
type Step = 2 | 3 | 4;

const EMPTY_FAMILY: FamilyFormState = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  postal: "",
  relationship: "",
};

function toE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return "";
}

function isRealInMobile(phoneE164: string | null | undefined) {
  return Boolean(phoneE164 && /^\+91[6-9]\d{9}$/.test(phoneE164));
}

function StepDots({ step, lastLabel }: { step: Step; lastLabel: string }) {
  const labels = ["Kit", "Delivery", "Details", lastLabel];
  const map: Step[] = [2, 2, 3, 4];
  return (
    <ol className="mt-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
      {labels.map((label, i) => {
        const n = map[i]!;
        const active = step === n && (i !== 0 || step === 2);
        const done = i === 0 || step > n || (i === 1 && step > 2);
        const highlight = i === 0 ? true : active || done;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                highlight ? "bg-orange text-cream" : "border border-gold text-muted"
              }`}
            >
              {i + 1}
            </span>
            <span className={`truncate ${active || i === 0 ? "text-maroon" : "text-muted"}`}>
              {label}
            </span>
            {i < labels.length - 1 ? <span className="hidden h-px flex-1 bg-divider sm:block" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutPageInner() {
  const { user, cart, ready, refreshCart } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumePay = searchParams.get("resume") === "1";
  const payuFailed = searchParams.get("payu") === "failed";
  const [step, setStep] = useState<Step>(2);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [familyFormOpen, setFamilyFormOpen] = useState(false);
  const [familyAdded, setFamilyAdded] = useState(false);
  const [family, setFamily] = useState<FamilyFormState>(EMPTY_FAMILY);
  const [referOpen, setReferOpen] = useState(false);
  const [referName, setReferName] = useState("");
  const [referPhone, setReferPhone] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoOff, setPromoOff] = useState<number | null>(null);
  const [upiPayment, setUpiPayment] = useState<Payment | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [confirmDeliveryFee, setConfirmDeliveryFee] = useState(false);

  const snapshot: Cart | null = cart;
  const includeFamily = familyAdded && familyFormComplete(family);
  const intents: Intent[] = includeFamily ? ["self", "family"] : ["self"];
  const math = checkoutOrderMath(snapshot, includeFamily);
  const kitName =
    snapshot?.items.map((item) => item.product.name).join(", ") || "this Pooja kit";
  const deliverySlot = useMemo(
    () => deliverySlotForSlugs(snapshot?.items.map((item) => item.product.slug) ?? []),
    [snapshot?.items],
  );

  useEffect(() => {
    if (payuFailed) {
      setError("PayU payment did not complete. Your cart is still here — tap Pay now to try again.");
    }
  }, [payuFailed]);

  useEffect(() => {
    if (!user) return;
    if (isRealInMobile(user.phoneE164) && !deliveryPhone) {
      setDeliveryPhone(user.phoneE164.replace(/^\+91/, ""));
    }
    void listAddresses()
      .then((items) => {
        setAddresses(items);
        if (items[0]) setAddressId(items[0].id);
        if (!items.length) setEditingAddress(true);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/checkout");
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user || !resumePay || upiPayment) return;
    let cancelled = false;
    setBusy(true);
    setError(null);
    void clientFetch<{
      order: { id: string };
      payment: Payment;
    } | null>("/orders/pending-payment")
      .then(async (data) => {
        if (cancelled) return;
        if (!data?.payment || data.payment.provider !== "UPI_QR") {
          setError("No awaiting UPI payment found. Add kits to cart to checkout.");
          return;
        }
        await refreshCart();
        setUpiPayment(data.payment);
        setPendingOrderId(data.order.id);
        setStep(4);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, resumePay, upiPayment, refreshCart]);

  useEffect(() => {
    void loadRazorpay().catch(() => undefined);
  }, []);

  const hasSelfAddress = Boolean(
    (addressId || (line1.trim() && city.trim() && state.trim() && postal.trim())) &&
      toE164(deliveryPhone),
  );

  const canAdvance = useMemo(() => {
    if (step === 2) return Boolean(snapshot?.items.length);
    if (step === 3) return hasSelfAddress;
    return hasSelfAddress;
  }, [step, snapshot?.items.length, hasSelfAddress]);

  const deliveryCtaLabel =
    familyFormOpen && !familyAdded
      ? familyFormComplete(family)
        ? "Add family kit & continue"
        : "Continue to details"
      : "Continue to details";

  function patchFamily(patch: Partial<FamilyFormState>) {
    setFamily((prev) => ({ ...prev, ...patch }));
    setFamilyAdded(false);
    setError(null);
  }

  function removeFamily() {
    setFamily(EMPTY_FAMILY);
    setFamilyAdded(false);
    setFamilyFormOpen(false);
    setError(null);
  }

  function confirmFamily() {
    if (!familyFormComplete(family)) {
      setError("Enter family name, mobile, and full delivery address.");
      return;
    }
    if (!toE164(family.phone)) {
      setError("Enter a valid family mobile number.");
      return;
    }
    setFamilyAdded(true);
    setFamilyFormOpen(true);
    setError(null);
  }

  function goFromDelivery() {
    setError(null);
    if (!snapshot?.items.length) {
      setError("Your cart is empty.");
      return;
    }
    if (familyFormOpen && familyFormComplete(family) && !familyAdded) {
      confirmFamily();
      setStep(3);
      return;
    }
    if (familyFormOpen && !familyFormComplete(family) && !familyAdded) {
      // Allow skipping incomplete family form
      setFamilyFormOpen(false);
    }
    setStep(3);
  }

  async function sendInvite() {
    const phone = toE164(referPhone);
    if (!referName.trim() || !phone) {
      setError("Enter your friend’s name and mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clientFetch("/orders/refer", {
        method: "POST",
        body: JSON.stringify({
          recipientName: referName.trim(),
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

  async function sharePavitra() {
    const url = `${window.location.origin}/kits`;
    const text = `Discover Pavitra Seva — thoughtful Pooja kits for your family. ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Pavitra Seva",
          text: "Share the blessings of Pavitra Seva",
          url,
        });
        return;
      }
    } catch {
      // fall through to clipboard / refer form
    }
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
      setReferOpen(true);
      setInviteSent(false);
    } catch {
      setReferOpen(true);
    }
  }

  function requestPay() {
    if (math.shippingMinor > 0) {
      setConfirmDeliveryFee(true);
      return;
    }
    void pay();
  }

  async function pay() {
    setConfirmDeliveryFee(false);
    setBusy(true);
    setError(null);
    try {
      const selfPhone = toE164(deliveryPhone);
      if (!selfPhone) {
        throw new Error("Enter your mobile number for delivery updates.");
      }

      let shippingAddressId = addressId;
      let familyAddressId: string | undefined;

      if (includeFamily) {
        const familyAddr = await clientFetch<Address>("/addresses", {
          method: "POST",
          body: JSON.stringify({
            label: family.name.trim().slice(0, 40) || "Family",
            line1: family.line1,
            city: family.city,
            state: family.state,
            postalCode: family.postal,
            country: "IN",
            isDefault: false,
          }),
        });
        familyAddressId = familyAddr.id;
      }

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

      if (!shippingAddressId) {
        throw new Error("Add a delivery address to continue.");
      }

      const result = await clientFetch<{
        order: { id: string; totalMinor: number };
        payment: Payment;
      }>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          shippingAddressId,
          familyAddressId,
          deliverySlot,
          intents,
          contactPhone: selfPhone,
          recipientName: includeFamily ? family.name.trim() : undefined,
          recipientPhone: includeFamily ? toE164(family.phone) : undefined,
          familyRelationship: includeFamily
            ? family.relationship.trim() || undefined
            : undefined,
          promoCode: promoCode.trim() || undefined,
        }),
      });
      const kind = await completePayment(result.payment);
      if (kind === "upi") {
        setUpiPayment(result.payment);
        setPendingOrderId(result.order.id);
        return;
      }
      if (kind === "redirect") return;
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

  return (
    <div className={`mx-auto px-5 py-12 ${step === 2 ? "max-w-5xl" : "max-w-xl"}`}>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        Checkout
      </p>
      {step !== 2 ? (
        <>
          <h1 className="font-display mt-2 text-4xl text-maroon">Complete your order</h1>
          <p className="mt-2 text-lg">
            Total{" "}
            <span className="price">
              {formatMoney(
                step === 4 && promoOff != null
                  ? Math.max(0, math.totalMinor - (promoOff > math.familyDiscountMinor ? promoOff - math.familyDiscountMinor : 0))
                  : math.totalMinor,
                math.currency,
              )}
            </span>
            {includeFamily ? (
              <span className="ml-2 text-sm font-medium text-orange">
                · Family Seva 10% applied
              </span>
            ) : null}
          </p>
        </>
      ) : null}
      <StepDots step={step} lastLabel="Pay" />

      {step === 2 ? (
        <div className="mt-8">
          <CheckoutDeliveryStep
            cart={snapshot}
            userName={user.fullName}
            addresses={addresses}
            addressId={addressId}
            editingAddress={editingAddress || !addresses.length}
            onToggleEditAddress={() => setEditingAddress((v) => !v)}
            addressFields={
              <AddressFields
                addresses={addresses}
                addressId={addressId}
                onSelect={(id) => {
                  setAddressId(id);
                  setEditingAddress(false);
                }}
                line1={line1}
                city={city}
                state={state}
                postal={postal}
                phone={deliveryPhone}
                onLine1={setLine1}
                onCity={setCity}
                onState={setState}
                onPostal={setPostal}
                onPhone={setDeliveryPhone}
              />
            }
            familyFormOpen={familyFormOpen}
            familyAdded={familyAdded}
            family={family}
            onFamilyChange={patchFamily}
            onOpenFamilyForm={() => {
              setFamilyFormOpen(true);
              setError(null);
            }}
            onRemoveFamily={removeFamily}
            onConfirmFamily={confirmFamily}
            referOpen={referOpen}
            referName={referName}
            referPhone={referPhone}
            inviteSent={inviteSent}
            onToggleRefer={() => {
              setReferOpen((v) => !v);
              setError(null);
            }}
            onReferName={setReferName}
            onReferPhone={setReferPhone}
            onShare={() => void sharePavitra()}
            onSendRefer={() => void sendInvite()}
            referBusy={busy}
            ctaLabel={deliveryCtaLabel}
            onContinue={goFromDelivery}
          />
          {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
          <div className="mt-6">
            <Link href="/cart" className="btn-outline-gold">
              Back to cart
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-temple mt-8 space-y-6 p-6">
          {step === 3 ? (
            <section>
              <h2 className="font-semibold">Your delivery details</h2>
              <p className="mt-1 text-sm text-muted">
                {deliveryConfirmCopy(snapshot?.items.map((item) => item.product.slug) ?? [])}{" "}
                Your kit is already reserved for you
                {includeFamily ? `, with Family Seva for ${family.name.trim()}` : ""}.
              </p>
              <AddressFields
                addresses={addresses}
                addressId={addressId}
                onSelect={setAddressId}
                line1={line1}
                city={city}
                state={state}
                postal={postal}
                phone={deliveryPhone}
                onLine1={setLine1}
                onCity={setCity}
                onState={setState}
                onPostal={setPostal}
                onPhone={setDeliveryPhone}
              />
              <DeliveryPromise slot={deliverySlot} />
              {includeFamily ? (
                <div className="mt-4 rounded-xl border border-gold bg-blush/50 px-4 py-3 text-sm">
                  <p className="font-semibold text-maroon">Family Seva included</p>
                  <p className="mt-1 text-muted">
                    Second kit → {family.name.trim()} · {family.line1}, {family.city}
                  </p>
                  <p className="mt-1 font-medium text-orange">
                    10% off · you save {formatMoney(math.saveMinor, math.currency)}
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 4 && upiPayment ? (
            <UpiPayPanel
              payment={upiPayment}
              onSubmitted={() => {
                void refreshCart();
              }}
            />
          ) : null}

          {step === 4 && !upiPayment ? (
            <section className="space-y-3">
              <h2 className="font-semibold">Review & pay</h2>
              <ul className="space-y-1 text-sm text-muted">
                {snapshot?.items.map((item) => (
                  <li key={item.productId}>
                    Your kit: {item.product.name} × {item.quantity}
                  </li>
                ))}
                {includeFamily ? (
                  <li>
                    Family kit: same items → {family.name.trim()}
                    {family.relationship ? ` (${family.relationship})` : ""}
                  </li>
                ) : null}
                <li>Delivery: {deliverySlot}</li>
                <li>
                  Subtotal {formatMoney(math.subtotalMinor, math.currency)}
                  {includeFamily
                    ? ` · Family Seva −${formatMoney(math.familyDiscountMinor, math.currency)}`
                    : ""}
                </li>
                <li>
                  Delivery fee{" "}
                  {math.shippingMinor > 0
                    ? formatMoney(math.shippingMinor, math.currency)
                    : "Free"}
                </li>
                <li className="font-semibold text-maroon">
                  Pay {formatMoney(math.totalMinor, math.currency)}
                </li>
              </ul>
              <div className="flex gap-2">
                <input
                  className="input-ps flex-1"
                  placeholder="Promo code (optional)"
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
              {promoOff ? (
                <p className="text-sm text-maroon">
                  {promoCode} quotes {formatMoney(promoOff, math.currency)} — checkout uses the
                  better of Family Seva or this promo.
                </p>
              ) : null}
            </section>
          ) : null}

          {error ? <p className="text-sm text-orange">{error}</p> : null}

          <div className="flex flex-wrap gap-2 pb-16 lg:pb-0">
            <button
              type="button"
              className="btn-outline-gold"
              onClick={() => {
                setError(null);
                setStep((s) => (s === 4 ? 3 : 2));
              }}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => {
                  setError(null);
                  if (!canAdvance) {
                    setError("Please complete this step before continuing.");
                    return;
                  }
                  setStep(4);
                }}
                className="btn-orange disabled:opacity-50"
              >
                Continue to pay
              </button>
            ) : upiPayment ? null : (
              <button
                type="button"
                disabled={busy || !canAdvance}
                onClick={requestPay}
                className="btn-orange disabled:opacity-50"
              >
                {busy ? "Processing…" : "Pay now"}
              </button>
            )}
          </div>
        </div>
      )}

      {confirmDeliveryFee ? (
        <DeliveryFeeDialog
          shipping={formatMoney(math.shippingMinor, math.currency)}
          subtotal={formatMoney(math.subtotalMinor, math.currency)}
          total={formatMoney(math.totalMinor, math.currency)}
          busy={busy}
          onBack={() => setConfirmDeliveryFee(false)}
          onContinue={() => void pay()}
        />
      ) : null}
    </div>
  );
}

function DeliveryFeeDialog({
  shipping,
  subtotal,
  total,
  busy,
  onBack,
  onContinue,
}: {
  shipping: string;
  subtotal: string;
  total: string;
  busy: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-maroon/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-fee-title"
    >
      <div className="card-order w-full max-w-md p-5">
        <h2 id="delivery-fee-title" className="font-display text-2xl text-maroon">
          Delivery fee of {shipping}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This order is under ₹1,000, so a delivery fee of {shipping} applies. Free delivery starts
          at ₹1,000.
        </p>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Kit</dt>
            <dd className="font-medium text-maroon">{subtotal}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Delivery fee</dt>
            <dd className="font-medium text-maroon">{shipping}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-divider pt-2">
            <dt className="font-semibold text-maroon">Total to pay</dt>
            <dd className="price text-lg">{total}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-outline-gold btn-order" disabled={busy} onClick={onBack}>
            Go back
          </button>
          <button type="button" className="btn-orange btn-order" disabled={busy} onClick={onContinue}>
            {busy ? "Processing…" : "Continue to pay"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryPromise({ slot }: { slot: string }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold">Delivery</h3>
      <p className="mt-2">
        <span className="inline-block rounded-full bg-orange px-3 py-1.5 text-sm text-cream">
          {slot}
        </span>
      </p>
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
  phone,
  onLine1,
  onCity,
  onState,
  onPostal,
  onPhone,
}: {
  addresses: Address[];
  addressId: string;
  onSelect: (id: string) => void;
  line1: string;
  city: string;
  state: string;
  postal: string;
  phone: string;
  onLine1: (v: string) => void;
  onCity: (v: string) => void;
  onState: (v: string) => void;
  onPostal: (v: string) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="mt-2 grid gap-2">
      {addresses.length ? (
        <div>
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              className={`mt-2 w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                addressId === a.id ? "border-gold bg-blush" : "border-border bg-paper"
              }`}
            >
              <p className="font-semibold">{a.label}</p>
              <p className="text-muted">
                {a.line1}, {a.city}, {a.state} {a.postalCode}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <>
          <input
            className="input-ps"
            placeholder="Address"
            value={line1}
            onChange={(e) => onLine1(e.target.value)}
          />
          <input
            className="input-ps"
            placeholder="City"
            value={city}
            onChange={(e) => onCity(e.target.value)}
          />
          <input
            className="input-ps"
            placeholder="State"
            value={state}
            onChange={(e) => onState(e.target.value)}
          />
          <input
            className="input-ps"
            placeholder="PIN"
            value={postal}
            onChange={(e) => onPostal(e.target.value)}
          />
        </>
      )}
      <input
        className="input-ps"
        placeholder="Mobile number"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => onPhone(e.target.value)}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-muted">Loading checkout…</p>}>
      <CheckoutPageInner />
    </Suspense>
  );
}
