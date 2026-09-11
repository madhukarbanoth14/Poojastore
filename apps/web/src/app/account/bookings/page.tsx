"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";
import { clientFetch } from "@/lib/client";
import { formatMoney, formatSlot } from "@/lib/format";

type PriestBooking = {
  id: string;
  bookingNumber?: string;
  serviceName: string;
  serviceMode?: string;
  status: string;
  amountMinor?: number;
  currency?: string;
  priest?: { slug: string; fullName: string; city?: string };
  slot?: { startsAt: string };
};

type PackageBooking = {
  id: string;
  status?: string;
  package?: { slug: string; title: string };
  priestBooking?: { priest?: { fullName: string }; slot?: { startsAt: string } };
};

const CANCELLABLE = new Set(["PENDING_PAYMENT", "CONFIRMED"]);

export default function BookingsPage() {
  const { user } = useAuth();
  const locale = useAccountLocale();
  const [priests, setPriests] = useState<PriestBooking[]>([]);
  const [packages, setPackages] = useState<PackageBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const [p, pkg] = await Promise.all([
      clientFetch<{ items: PriestBooking[] }>("/bookings"),
      clientFetch<{ items: PackageBooking[] }>("/package-bookings").catch(() => ({ items: [] })),
    ]);
    setPriests(p.items ?? []);
    setPackages(pkg.items ?? []);
  }

  useEffect(() => {
    if (!user) return;
    void reload().catch((err: Error) => setError(err.message));
  }, [user]);

  if (!user) return null;

  async function cancel(id: string) {
    setError(null);
    try {
      await clientFetch(`/bookings/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled from account" }),
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupOrders")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "bookings")}</h1>
      {error ? <p className="mt-3 text-sm text-orange">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {priests.map((b) => (
          <div key={b.id} className="card-temple p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{b.serviceName}</p>
                <p className="text-sm text-muted">
                  {b.priest?.fullName}
                  {b.priest?.city ? ` · ${b.priest.city}` : ""}
                </p>
                {b.slot?.startsAt ? (
                  <p className="mt-1 text-sm text-muted">{formatSlot(b.slot.startsAt)}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">{b.status}</p>
                {b.amountMinor != null ? (
                  <p className="mt-1 font-semibold price">{formatMoney(b.amountMinor, b.currency)}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-sm font-semibold">
              {b.priest?.slug ? (
                <Link href="/priests" className="text-maroon">
                  {ac(locale, "priests")}
                </Link>
              ) : null}
              {CANCELLABLE.has(b.status) ? (
                <button type="button" className="text-orange" onClick={() => void cancel(b.id)}>
                  {ac(locale, "cancelBooking")}
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {!priests.length ? <p className="text-sm text-muted">{ac(locale, "noBookings")}</p> : null}
      </div>

      <h2 className="font-display mt-10 text-2xl text-maroon">{ac(locale, "packages")}</h2>
      <div className="mt-4 space-y-3">
        {packages.map((b) => (
          <div key={b.id} className="card-temple p-4">
            <p className="font-semibold">{b.package?.title ?? ac(locale, "packages")}</p>
            <p className="text-sm text-muted">
              {b.priestBooking?.priest?.fullName}
              {b.status ? ` · ${b.status}` : ""}
            </p>
            {b.priestBooking?.slot?.startsAt ? (
              <p className="mt-1 text-sm text-muted">{formatSlot(b.priestBooking.slot.startsAt)}</p>
            ) : null}
          </div>
        ))}
        {!packages.length ? <p className="text-sm text-muted">{ac(locale, "noPackages")}</p> : null}
      </div>
    </div>
  );
}
