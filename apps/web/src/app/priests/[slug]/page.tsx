"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { formatMoney, formatSlot, initials } from "@/lib/format";
import { completePayment, listAddresses } from "@/lib/payments";
import type { Address, Priest } from "@/lib/types";

export default function PriestDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [priest, setPriest] = useState<Priest | null>(null);
  const [missing, setMissing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [slotId, setSlotId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [mode, setMode] = useState<"HOME_VISIT" | "ONLINE">("HOME_VISIT");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void clientFetch<Priest>(`/priests/${slug}`)
      .then((p) => {
        setPriest(p);
        setServiceName(p.specializations[0] ?? "Home pooja");
      })
      .catch(() => setMissing(true));
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    void listAddresses()
      .then((items) => {
        setAddresses(items);
        if (items[0]) setAddressId(items[0].id);
      })
      .catch(() => undefined);
  }, [user]);

  async function book() {
    if (!user) {
      router.push(`/login?next=/priests/${slug}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let addr = addressId;
      if (!addr) {
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
        addr = created.id;
      }
      const result = await clientFetch<{ payment: Parameters<typeof completePayment>[0] }>(
        `/priests/${slug}/bookings`,
        {
          method: "POST",
          body: JSON.stringify({
            slotId,
            addressId: addr,
            serviceName,
            serviceMode: mode,
          }),
        },
      );
      await completePayment(result.payment);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  if (missing) {
    return <div className="mx-auto max-w-3xl px-5 py-16 text-muted">Priest not found.</div>;
  }
  if (!priest) {
    return <div className="mx-auto max-w-3xl px-5 py-16 text-muted">Loading priest…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-orange text-lg font-bold text-maroon">
          {initials(priest.fullName)}
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
            {priest.city}, {priest.state}
          </p>
          <h1 className="font-display mt-1 text-4xl text-maroon">{priest.fullName}</h1>
          <p className="text-sm text-muted">
            {priest.yearsExperience} years
            {priest.ratingCount > 0
              ? ` · ★ ${priest.ratingAvg.toFixed(1)} (${priest.ratingCount})`
              : ""}
          </p>
          <p className="mt-2 text-xl price">
            {formatMoney(priest.basePriceMinor, priest.currency)}
          </p>
        </div>
      </div>
      <p className="mt-6 leading-relaxed text-body">{priest.bio}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {priest.specializations.map((s) => (
          <span key={s} className="chip-ps">
            {s}
          </span>
        ))}
      </div>

      <form
        className="card-temple mt-8 space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void book();
        }}
      >
        <h2 className="font-display text-xl font-semibold">Book a slot</h2>
        <label className="block text-sm font-medium">
          Service
          <input className="input-ps mt-1" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
        </label>
        <div className="flex gap-3 text-sm">
          {(["HOME_VISIT", "ONLINE"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-2 font-semibold ${mode === m ? "bg-orange text-cream" : "border border-gold text-maroon"}`}
            >
              {m === "HOME_VISIT" ? "Home visit" : "Online"}
            </button>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium">Open slots</p>
          <div className="mt-2 grid gap-2">
            {(priest.slots ?? []).map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSlotId(slot.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${slotId === slot.id ? "border-orange bg-blush" : "border-border bg-paper"}`}
              >
                {formatSlot(slot.startsAt)} → {formatSlot(slot.endsAt)}
              </button>
            ))}
            {!priest.slots?.length ? <p className="text-sm text-muted">No upcoming slots.</p> : null}
          </div>
        </div>
        {addresses.length ? (
          <label className="block text-sm font-medium">
            Address
            <select className="input-ps mt-1" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} — {a.line1}, {a.city}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input-ps sm:col-span-2" placeholder="Address line" value={line1} onChange={(e) => setLine1(e.target.value)} />
            <input className="input-ps" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input className="input-ps" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            <input className="input-ps" placeholder="PIN" value={postal} onChange={(e) => setPostal(e.target.value)} />
          </div>
        )}
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !slotId}
          className="w-full btn-orange disabled:opacity-50"
        >
          {busy ? "Processing…" : "Pay & confirm"}
        </button>
      </form>
    </div>
  );
}
