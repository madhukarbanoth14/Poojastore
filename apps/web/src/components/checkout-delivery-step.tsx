"use client";

import type { Address, Cart } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const RELATIONSHIPS = ["Parent", "Sibling", "Relative", "Friend", "Other"] as const;

export type FamilyFormState = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postal: string;
  relationship: string;
};

export function familyFormComplete(form: FamilyFormState) {
  return Boolean(
    form.name.trim() &&
      form.phone.replace(/\D/g, "").length >= 10 &&
      form.line1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postal.trim(),
  );
}

export function checkoutOrderMath(cart: Cart | null, includeFamily: boolean) {
  const currency = cart?.currency ?? "INR";
  const market = cart?.items[0]?.product.market ?? (currency === "INR" ? "IN" : "US");
  const baseSubtotal = cart?.subtotalMinor ?? 0;
  const copies = includeFamily ? 2 : 1;
  const subtotalMinor = baseSubtotal * copies;
  const familyDiscountMinor = includeFamily ? Math.round(subtotalMinor * 0.1) : 0;
  const perShip = market === "IN" ? (baseSubtotal >= 100_000 ? 0 : 4900) : 499;
  const shippingMinor = perShip * copies;
  const totalMinor = Math.max(0, subtotalMinor + shippingMinor - familyDiscountMinor);
  return {
    currency,
    market,
    baseSubtotal,
    copies,
    subtotalMinor,
    familyDiscountMinor,
    shippingMinor,
    totalMinor,
    saveMinor: familyDiscountMinor,
  };
}

export function CheckoutOrderSummary({
  cart,
  includeFamily,
  familyName,
  ctaLabel,
  ctaDisabled,
  onContinue,
  sticky = false,
}: {
  cart: Cart | null;
  includeFamily: boolean;
  familyName?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onContinue: () => void;
  sticky?: boolean;
}) {
  const math = checkoutOrderMath(cart, includeFamily);
  const kitLabel =
    cart?.items.map((item) => item.product.name).join(", ") || "Pooja Kit";

  return (
    <aside
      className={`card-temple space-y-4 p-5 ${sticky ? "lg:sticky lg:top-24" : ""}`}
    >
      <p className="text-[11px] font-semibold tracking-[0.18em] text-maroon uppercase">
        Your order
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between gap-3">
          <span className="min-w-0 leading-snug">
            <span className="font-semibold text-maroon">Your Kit</span>
            <span className="mt-0.5 block text-xs text-muted">{kitLabel}</span>
          </span>
          <span className="shrink-0 font-semibold">
            {formatMoney(math.baseSubtotal, math.currency)}
          </span>
        </li>
        {includeFamily ? (
          <li className="flex justify-between gap-3">
            <span className="min-w-0 leading-snug">
              <span className="font-semibold text-maroon">Family Kit</span>
              <span className="mt-0.5 block text-xs text-muted">
                {familyName?.trim() || "Family member"}
              </span>
            </span>
            <span className="shrink-0 font-semibold">
              {formatMoney(math.baseSubtotal, math.currency)}
            </span>
          </li>
        ) : null}
      </ul>
      <div className="space-y-1.5 border-t border-divider pt-3 text-sm">
        {includeFamily ? (
          <>
            <div className="flex justify-between gap-3 text-muted">
              <span>Subtotal</span>
              <span>{formatMoney(math.subtotalMinor, math.currency)}</span>
            </div>
            <div className="flex justify-between gap-3 text-maroon">
              <span>Family Seva −10%</span>
              <span>−{formatMoney(math.familyDiscountMinor, math.currency)}</span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between gap-3 text-muted">
          <span>Delivery</span>
          <span>
            {math.shippingMinor > 0 ? formatMoney(math.shippingMinor, math.currency) : "Free"}
          </span>
        </div>
        <div className="flex justify-between gap-3 pt-1 text-base font-semibold text-maroon">
          <span>Total</span>
          <span className="price">{formatMoney(math.totalMinor, math.currency)}</span>
        </div>
        {math.shippingMinor > 0 ? (
          <p className="text-xs text-muted">Free delivery on orders of ₹1,000 or more.</p>
        ) : null}
        {includeFamily && math.saveMinor > 0 ? (
          <p className="text-sm font-medium text-orange">
            You save {formatMoney(math.saveMinor, math.currency)}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={ctaDisabled}
        onClick={onContinue}
        className="btn-orange w-full justify-center disabled:opacity-50"
      >
        {ctaLabel}
      </button>
    </aside>
  );
}

export function CheckoutDeliveryStep({
  cart,
  userName,
  addresses,
  addressId,
  editingAddress,
  onToggleEditAddress,
  addressFields,
  familyFormOpen,
  familyAdded,
  family,
  onFamilyChange,
  onOpenFamilyForm,
  onRemoveFamily,
  onConfirmFamily,
  referOpen,
  referName,
  referPhone,
  inviteSent,
  onToggleRefer,
  onReferName,
  onReferPhone,
  onShare,
  onSendRefer,
  referBusy,
  ctaLabel,
  onContinue,
}: {
  cart: Cart | null;
  userName?: string | null;
  addresses: Address[];
  addressId: string;
  editingAddress: boolean;
  onToggleEditAddress: () => void;
  addressFields: React.ReactNode;
  familyFormOpen: boolean;
  familyAdded: boolean;
  family: FamilyFormState;
  onFamilyChange: (patch: Partial<FamilyFormState>) => void;
  onOpenFamilyForm: () => void;
  onRemoveFamily: () => void;
  onConfirmFamily: () => void;
  referOpen: boolean;
  referName: string;
  referPhone: string;
  inviteSent: boolean;
  onToggleRefer: () => void;
  onReferName: (v: string) => void;
  onReferPhone: (v: string) => void;
  onShare: () => void;
  onSendRefer: () => void;
  referBusy?: boolean;
  ctaLabel: string;
  onContinue: () => void;
}) {
  const selected = addresses.find((a) => a.id === addressId) ?? addresses[0];
  const kitName =
    cart?.items.map((item) => item.product.name).join(", ") || "your Pooja Kit";
  const includeFamily = familyAdded && familyFormComplete(family);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl text-maroon md:text-4xl">
            Make Your Seva More Special
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-body md:text-base">
            Your Pooja Kit will be delivered to you. Want to send the blessings of
            Pavitra Seva to someone special?
          </p>
        </header>

        <section className="rounded-2xl border border-divider bg-paper px-5 py-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
            Your Pooja Kit
          </p>
          <p className="mt-2 text-sm font-semibold text-maroon">
            Delivering to your address
          </p>
          <p className="mt-1 text-sm text-muted">
            {kitName} will be delivered to your saved address.
          </p>
          {selected && !editingAddress ? (
            <div className="mt-3 rounded-xl border border-divider bg-cream/40 px-4 py-3 text-sm leading-relaxed">
              {userName ? <p className="font-semibold text-maroon">{userName}</p> : null}
              <p>{selected.line1}</p>
              <p className="text-muted">
                {selected.city}, {selected.state} {selected.postalCode}
              </p>
              <button
                type="button"
                onClick={onToggleEditAddress}
                className="mt-2 text-xs font-semibold tracking-wide text-maroon underline decoration-gold underline-offset-4"
              >
                Change address
              </button>
            </div>
          ) : (
            <div className="mt-3">
              {addressFields}
              {selected ? (
                <button
                  type="button"
                  onClick={onToggleEditAddress}
                  className="mt-2 text-xs font-semibold text-muted underline"
                >
                  Hide address editor
                </button>
              ) : null}
            </div>
          )}
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-gold bg-gradient-to-br from-[#fff8ef] via-blush to-[#f7e7c8] px-5 py-5 shadow-[0_10px_30px_rgba(143,23,36,0.08)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange/10" aria-hidden />
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-maroon uppercase">
                Family Seva
              </p>
              <h2 className="font-display mt-1 text-2xl text-maroon md:text-[1.7rem]">
                Send a Pooja Kit to Your Family &amp; Save 10%
              </h2>
            </div>
            <span className="rounded-full border border-gold bg-maroon px-3 py-1 text-xs font-bold tracking-wide text-cream shadow-sm">
              10% OFF
            </span>
          </div>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-body">
            Add the same kit for your parents, siblings, relatives or loved ones and
            get 10% OFF your total order. Celebrate together, wherever they are.
          </p>
          <p className="mt-2 text-sm font-medium text-maroon">
            Because celebrations are better together.
          </p>

          {familyAdded && includeFamily ? (
            <div className="mt-4 rounded-xl border border-maroon/20 bg-paper/80 px-4 py-3">
              <p className="text-sm font-semibold text-maroon">Family Seva added ✓</p>
              <p className="mt-1 text-sm text-muted">
                {family.name.trim()} · {family.phone.trim()}
                {family.relationship ? ` · ${family.relationship}` : ""}
              </p>
              <button
                type="button"
                onClick={onRemoveFamily}
                className="mt-2 text-xs font-semibold text-orange underline underline-offset-4"
              >
                Remove family kit
              </button>
            </div>
          ) : familyFormOpen ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <input
                className="input-ps sm:col-span-2"
                placeholder="Family member name"
                value={family.name}
                onChange={(e) => onFamilyChange({ name: e.target.value })}
              />
              <input
                className="input-ps"
                placeholder="Mobile number"
                inputMode="tel"
                value={family.phone}
                onChange={(e) => onFamilyChange({ phone: e.target.value })}
              />
              <select
                className="input-ps"
                value={family.relationship}
                onChange={(e) => onFamilyChange({ relationship: e.target.value })}
                aria-label="Relationship"
              >
                <option value="">Relationship (optional)</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
              <input
                className="input-ps sm:col-span-2"
                placeholder="Delivery address"
                value={family.line1}
                onChange={(e) => onFamilyChange({ line1: e.target.value })}
              />
              <input
                className="input-ps"
                placeholder="City"
                value={family.city}
                onChange={(e) => onFamilyChange({ city: e.target.value })}
              />
              <input
                className="input-ps"
                placeholder="State"
                value={family.state}
                onChange={(e) => onFamilyChange({ state: e.target.value })}
              />
              <input
                className="input-ps sm:col-span-2"
                placeholder="PIN"
                value={family.postal}
                onChange={(e) => onFamilyChange({ postal: e.target.value })}
              />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="button"
                  disabled={!familyFormComplete(family)}
                  onClick={onConfirmFamily}
                  className="btn-orange disabled:opacity-50"
                >
                  Add family kit
                </button>
                <button type="button" onClick={onRemoveFamily} className="btn-outline-gold">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={onOpenFamilyForm} className="btn-orange mt-4">
              Add a family member
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-divider bg-paper px-5 py-4">
          <h2 className="font-display text-xl text-maroon">Share the Blessings</h2>
          <p className="mt-1 text-sm text-muted">
            Know a friend or family member who would love Pavitra Seva? Share it with
            them.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onShare} className="btn-outline-gold">
              Share Pavitra Seva
            </button>
            <button type="button" onClick={onToggleRefer} className="btn-outline-gold">
              Refer a friend
            </button>
          </div>
          {referOpen ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                className="input-ps"
                placeholder="Friend’s name"
                value={referName}
                onChange={(e) => onReferName(e.target.value)}
              />
              <input
                className="input-ps"
                placeholder="Their mobile number"
                inputMode="tel"
                value={referPhone}
                onChange={(e) => onReferPhone(e.target.value)}
              />
              <button
                type="button"
                disabled={referBusy}
                onClick={onSendRefer}
                className="btn-orange sm:col-span-2 disabled:opacity-50"
              >
                {referBusy ? "Sending…" : "Send invite SMS"}
              </button>
              {inviteSent ? (
                <p className="text-sm text-maroon sm:col-span-2">Invite sent. You can continue checkout.</p>
              ) : null}
            </div>
          ) : null}
        </section>

        <div className="lg:hidden">
          <CheckoutOrderSummary
            cart={cart}
            includeFamily={includeFamily}
            familyName={family.name}
            ctaLabel={ctaLabel}
            onContinue={onContinue}
          />
        </div>
      </div>

      <div className="hidden lg:block">
        <CheckoutOrderSummary
          cart={cart}
          includeFamily={includeFamily}
          familyName={family.name}
          ctaLabel={ctaLabel}
          onContinue={onContinue}
          sticky
        />
      </div>
    </div>
  );
}
