"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientFetch } from "@/lib/client";
import { formatWhen } from "@/lib/format";

type Customer = {
  id: string;
  fullName?: string | null;
  phoneE164: string;
  email?: string | null;
  status: string;
  market?: string;
  orderCount: number;
  city?: string | null;
  state?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
};

type List = {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-blush text-maroon";
  if (status === "BLOCKED" || status === "DELETED") return "bg-divider text-muted";
  return "border border-gold bg-paper text-maroon";
}

export default function AdminCustomersPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<List | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      role: "CUSTOMER",
      page: String(page),
      limit: "30",
    });
    if (name.trim()) params.set("name", name.trim());
    if (phone.trim()) params.set("phone", phone.trim());
    return params.toString();
  }, [name, phone, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      void clientFetch<List>(`/admin/users?${query}`)
        .then(setData)
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [name, phone]);

  const filtered = Boolean(name.trim() || phone.trim());

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Directory</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Customers</h1>
      <p className="mt-2 text-sm text-muted">
        Search by name or mobile number. Open orders to see what they bought.
      </p>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          Name
          <input
            className="input-ps mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav"
            autoComplete="off"
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          Phone
          <input
            className="input-ps mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 98765 43210"
            inputMode="tel"
            autoComplete="off"
          />
        </label>
      </div>
      {filtered ? (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-maroon underline decoration-gold underline-offset-2"
          onClick={() => {
            setName("");
            setPhone("");
          }}
        >
          Clear filters
        </button>
      ) : null}

      <p className="mt-4 text-xs text-muted">
        {loading && !data
          ? "Loading…"
          : `${data?.total ?? 0} customer${data?.total === 1 ? "" : "s"}`}
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-divider bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-divider text-[11px] font-semibold tracking-wide text-muted uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((row) => (
              <tr key={row.id} className="border-b border-divider/70 last:border-0">
                <td className="px-4 py-3 font-semibold text-maroon">{row.fullName || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(row.phoneE164)}`}
                    className="text-maroon underline decoration-gold/60 underline-offset-2"
                  >
                    {row.phoneE164}
                  </Link>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-muted">{row.email || "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {row.city ? `${row.city}${row.state ? `, ${row.state}` : ""}` : "—"}
                </td>
                <td className="px-4 py-3">{row.orderCount}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{formatWhen(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusTone(row.status)}`}>
                    {row.status.toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && !data.items.length ? (
          <p className="px-4 py-8 text-sm text-muted">
            {filtered ? "No customers match those filters." : "No customers yet."}
          </p>
        ) : null}
      </div>

      {data && data.totalPages > 1 ? (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="btn-outline-gold"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <p className="text-sm text-muted">
            Page {data.page} of {data.totalPages}
          </p>
          <button
            type="button"
            className="btn-outline-gold"
            disabled={page >= data.totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
