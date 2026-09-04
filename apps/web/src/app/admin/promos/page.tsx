"use client";

import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";

type Promo = {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED";
  percentOff?: number | null;
  amountMinor?: number | null;
  minSubtotalMinor: number;
  redeemedCount: number;
  maxRedemptions?: number | null;
  isActive: boolean;
};

export default function AdminPromosPage() {
  const [items, setItems] = useState<Promo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("10");
  const [busy, setBusy] = useState(false);

  function load() {
    void clientFetch<Promo[]>("/admin/promos")
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function createPromo() {
    setBusy(true);
    setError(null);
    try {
      const percent = kind === "PERCENT" ? Number(value) : undefined;
      const amountMinor = kind === "FIXED" ? Math.round(Number(value) * 100) : undefined;
      await clientFetch("/admin/promos", {
        method: "POST",
        body: JSON.stringify({
          code,
          description: description.trim() || undefined,
          discountType: kind,
          percentOff: percent,
          amountMinor,
        }),
      });
      setCode("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save promo");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(promo: Promo) {
    try {
      await clientFetch(`/admin/promos/${promo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update promo");
    }
  }

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Offers</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Promo codes</h1>
      <p className="mt-2 text-sm text-muted">
        Customers enter a code at checkout. This desk can add or pause codes — it cannot edit panchang or shop pages.
      </p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      <form
        className="card-temple mt-6 grid gap-3 p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void createPromo();
        }}
      >
        <input
          className="input-ps sm:col-span-2"
          placeholder="Code (e.g. GANESH10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />
        <input
          className="input-ps sm:col-span-2"
          placeholder="What customers see"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="input-ps"
          value={kind}
          onChange={(e) => setKind(e.target.value as "PERCENT" | "FIXED")}
        >
          <option value="PERCENT">Percent off</option>
          <option value="FIXED">Fixed ₹ off</option>
        </select>
        <input
          className="input-ps"
          type="number"
          min={kind === "PERCENT" ? 1 : 1}
          max={kind === "PERCENT" ? 90 : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <button type="submit" disabled={busy || !code} className="btn-orange sm:col-span-2 disabled:opacity-50">
          {busy ? "Saving…" : "Add promo"}
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {items.map((promo) => (
          <li key={promo.id} className="card-temple flex items-start justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-maroon">{promo.code}</p>
              <p className="mt-1 text-sm text-muted">
                {promo.description || "Promo"}
                {" · "}
                {promo.discountType === "PERCENT"
                  ? `${promo.percentOff}% off`
                  : formatMoney(promo.amountMinor ?? 0)}
                {promo.minSubtotalMinor ? ` · min ${formatMoney(promo.minSubtotalMinor)}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
                Used {promo.redeemedCount}
                {promo.maxRedemptions != null ? ` / ${promo.maxRedemptions}` : ""}
              </p>
            </div>
            <button type="button" className="btn-outline-gold" onClick={() => void toggle(promo)}>
              {promo.isActive ? "Pause" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
