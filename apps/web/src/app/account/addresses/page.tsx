"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";
import { clientFetch } from "@/lib/client";
import { listAddresses } from "@/lib/payments";
import type { Address } from "@/lib/types";

export default function AddressesPage() {
  const { user } = useAuth();
  const locale = useAccountLocale();
  const [items, setItems] = useState<Address[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  async function reload() {
    const next = await listAddresses();
    setItems(next);
  }

  useEffect(() => {
    if (!user) return;
    void reload().catch(() => setItems([]));
  }, [user]);

  if (!user) return null;

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await clientFetch<Address>("/addresses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          country: "IN",
          isDefault: items.length === 0,
        }),
      });
      setForm({ label: "Home", line1: "", city: "", state: "", postalCode: "" });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setBusy(false);
    }
  }

  async function makeDefault(id: string) {
    await clientFetch(`/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isDefault: true }),
    });
    await reload();
  }

  async function remove(id: string) {
    await clientFetch(`/addresses/${id}`, { method: "DELETE" });
    await reload();
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupAccount")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "addresses")}</h1>
      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div key={a.id} className="card-temple p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {a.label}
                  {a.isDefault ? (
                    <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      {ac(locale, "default")}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.city}, {a.state} {a.postalCode}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-sm font-semibold">
              {!a.isDefault ? (
                <button type="button" className="text-maroon" onClick={() => void makeDefault(a.id)}>
                  {ac(locale, "makeDefault")}
                </button>
              ) : null}
              <button type="button" className="text-orange" onClick={() => void remove(a.id)}>
                {ac(locale, "delete")}
              </button>
            </div>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-muted">{ac(locale, "noAddresses")}</p> : null}
      </div>
      <form className="card-temple mt-8 space-y-3 p-6" onSubmit={(e) => void add(e)}>
        <p className="font-semibold">{ac(locale, "addAddress")}</p>
        <input
          className="input-ps"
          placeholder={ac(locale, "label")}
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          required
        />
        <input
          className="input-ps"
          placeholder={ac(locale, "line1")}
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          required
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="input-ps"
            placeholder={ac(locale, "city")}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <input
            className="input-ps"
            placeholder={ac(locale, "state")}
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            required
          />
        </div>
        <input
          className="input-ps"
          placeholder={ac(locale, "pin")}
          value={form.postalCode}
          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
          required
        />
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        <button type="submit" disabled={busy} className="w-full btn-orange disabled:opacity-50">
          {busy ? ac(locale, "saving") : ac(locale, "addAddress")}
        </button>
      </form>
    </div>
  );
}
