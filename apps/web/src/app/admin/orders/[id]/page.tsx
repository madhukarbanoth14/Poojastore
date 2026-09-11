"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clientFetch, clientFetchBlob } from "@/lib/client";
import { formatMobile, formatMoney, formatWhen } from "@/lib/format";
import { itemName, orderStatusLabel, statusTone } from "@/lib/order-display";
import type { Order } from "@/lib/types";

type Vendor = { id: string; name: string; phoneE164: string; isDefault?: boolean };

const STEPS: { id: "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED"; label: string }[] = [
  { id: "PACKED", label: "Packed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { id: "DELIVERED", label: "Delivered" },
];

const ADMIN_TRACK = [
  "PLACED",
  "PAID",
  "CONFIRMED",
  "VENDOR_ASSIGNED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    void Promise.all([
      clientFetch<Order>(`/admin/orders/${id}`),
      clientFetch<Vendor[]>("/admin/vendors").catch(() => [] as Vendor[]),
    ])
      .then(([data, vendorList]) => {
        setOrder(data);
        setVendors(vendorList);
        setTrackingNumber(data.trackingNumber ?? data.tracking?.trackingNumber ?? "");
        const chosen =
          data.vendor ??
          vendorList.find((vendor) => vendor.isDefault) ??
          vendorList[0];
        if (chosen) {
          setVendorId(chosen.id);
          setVendorPhone(chosen.phoneE164);
          setVendorName(chosen.name);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm() {
    setBusy("confirm");
    setError(null);
    try {
      const updated = await clientFetch<Order>(`/admin/orders/${id}/confirm`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the order");
    } finally {
      setBusy(null);
    }
  }

  async function dispatchVendor() {
    setBusy("vendor");
    setError(null);
    setCopied(false);
    try {
      const updated = await clientFetch<Order>(`/admin/orders/${id}/dispatch-vendor`, {
        method: "POST",
        body: JSON.stringify({
          vendorId: vendorId || undefined,
          vendorPhone: vendorPhone.trim() || undefined,
          vendorName: vendorName.trim() || undefined,
        }),
      });
      setOrder(updated);
      if (updated.vendor) {
        setVendorId(updated.vendor.id);
        setVendorPhone(updated.vendor.phoneE164);
        setVendorName(updated.vendor.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send to vendor");
    } finally {
      setBusy(null);
    }
  }

  async function mark(step: (typeof STEPS)[number]["id"]) {
    setBusy(step);
    setError(null);
    try {
      const updated = await clientFetch<Order>(`/admin/orders/${id}/fulfillment`, {
        method: "POST",
        body: JSON.stringify({
          step,
          trackingNumber: trackingNumber.trim() || undefined,
        }),
      });
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update tracking");
    } finally {
      setBusy(null);
    }
  }

  async function copySlip() {
    const text = order?.vendorSlip?.message;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!order) {
    return <p className="text-sm text-muted">{error ?? "Loading order…"}</p>;
  }

  const next = order.tracking?.nextFulfillment;
  const address = order.shippingAddress;
  const customer = order.user;
  const canConfirm = order.tracking?.canConfirm;
  const canDispatch = order.tracking?.canDispatchVendor;
  const slip = order.vendorSlip;
  const whatsapp = slip
    ? `https://wa.me/${slip.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(slip.message)}`
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/orders" className="text-sm font-semibold text-maroon">
        ← Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Order</p>
          <h1 className="font-display mt-1 text-4xl text-maroon">{order.orderNumber}</h1>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusTone(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>
      {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}

      <section className="card-temple mt-6 p-5">
        <p className="font-semibold">Customer</p>
        <p className="mt-2 text-sm text-muted">
          {customer?.fullName || "Customer"}
          {` · ${formatMobile(order.contactPhoneE164, customer?.phoneE164)}`}
          {customer?.email ? ` · ${customer.email}` : ""}
        </p>
        {address ? (
          <p className="mt-2 text-sm text-muted">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}
          </p>
        ) : null}
        {order.deliverySlot ? (
          <p className="mt-2 text-sm text-muted">Delivery: {order.deliverySlot}</p>
        ) : null}
        <p className="mt-3 font-display text-2xl">{formatMoney(order.totalMinor, order.currency)}</p>
        <p className="text-xs text-muted">{formatWhen(order.createdAt)}</p>
      </section>

      {order.payments?.some((p) => p.provider === "UPI_QR" && p.status !== "SUCCEEDED") ? (
        <section className="card-temple mt-4 p-5">
          <h2 className="font-semibold">UPI payment</h2>
          {order.payments
            .filter((p) => p.provider === "UPI_QR")
            .map((p) => (
              <div key={p.id} className="mt-3 space-y-2">
                <p className="text-sm text-muted">
                  Status: {p.status}
                  {p.providerPaymentId || p.metadata?.utr
                    ? ` · UTR ${p.providerPaymentId || p.metadata?.utr}`
                    : p.metadata?.hasScreenshot
                      ? " · screenshot uploaded"
                      : " · waiting for UTR or screenshot"}
                </p>
                {p.metadata?.hasScreenshot ? <UpiProofImage paymentId={p.id} /> : null}
                <button
                  type="button"
                  className="btn-maroon"
                  disabled={busy !== null || p.status === "SUCCEEDED"}
                  onClick={() => {
                    setBusy("upi");
                    setError(null);
                    void clientFetch(`/payments/${p.id}/upi-admin-confirm`, { method: "POST" })
                      .then(() => load())
                      .catch((err: Error) => setError(err.message))
                      .finally(() => setBusy(null));
                  }}
                >
                  {busy === "upi" ? "Confirming…" : "Confirm UPI received"}
                </button>
              </div>
            ))}
        </section>
      ) : null}

      <section className="card-temple mt-4 p-5">
        <h2 className="font-semibold">1. Confirm the order</h2>
        <p className="mt-2 text-sm text-muted">
          Check items and the delivery address, then confirm. The customer sees “Order confirmed”.
        </p>
        {order.confirmedAt ? (
          <p className="mt-3 text-sm text-maroon">Confirmed {formatWhen(order.confirmedAt)}</p>
        ) : (
          <button
            type="button"
            className="btn-maroon mt-4"
            disabled={busy !== null || !canConfirm}
            onClick={() => void confirm()}
          >
            {busy === "confirm" ? "Confirming…" : "Confirm order"}
          </button>
        )}
      </section>

      <section className="card-temple mt-4 p-5">
        <h2 className="font-semibold">2. Send to vendor</h2>
        <p className="mt-2 text-sm text-muted">
          SMS the packing slip (items, customer, address) to the vendor who will deliver to the customer.
          Locally this logs to the API console if SMS_PROVIDER=console.
        </p>
        {vendors.length > 1 ? (
          <label className="mt-4 block text-xs font-semibold text-muted">
            Vendor
            <select
              className="input-ps mt-1"
              value={vendorId}
              onChange={(e) => {
                const nextVendor = vendors.find((vendor) => vendor.id === e.target.value);
                setVendorId(e.target.value);
                if (nextVendor) {
                  setVendorPhone(nextVendor.phoneE164);
                  setVendorName(nextVendor.name);
                }
              }}
            >
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} · {vendor.phoneE164}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mt-3 block text-xs font-semibold text-muted">
          Vendor name
          <input
            className="input-ps mt-1"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            placeholder="Packing vendor"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-muted">
          Vendor mobile
          <input
            className="input-ps mt-1"
            value={vendorPhone}
            onChange={(e) => setVendorPhone(e.target.value)}
            placeholder="+91 98765 43211"
          />
        </label>
        {order.vendorNotifiedAt ? (
          <p className="mt-3 text-sm text-maroon">
            Sent to {order.vendor?.name ?? "vendor"} {order.vendor?.phoneE164 ?? ""} ·{" "}
            {formatWhen(order.vendorNotifiedAt)}
          </p>
        ) : null}
        <button
          type="button"
          className="btn-maroon mt-4"
          disabled={busy !== null || !canDispatch}
          onClick={() => void dispatchVendor()}
        >
          {busy === "vendor"
            ? "Sending…"
            : order.vendorNotifiedAt
              ? "Resend slip to vendor"
              : "Send order to vendor"}
        </button>
        {slip ? (
          <div className="mt-4 rounded-lg border border-gold/40 bg-paper p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last message</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-maroon">{slip.message}</pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-outline-gold" onClick={() => void copySlip()}>
                {copied ? "Copied" : "Copy message"}
              </button>
              {whatsapp ? (
                <a className="btn-outline-gold" href={whatsapp} target="_blank" rel="noreferrer">
                  Open WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className="card-temple mt-4 p-5">
        <h2 className="font-semibold">3. Tracking the customer sees</h2>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(order.tracking?.steps ?? [])
            .filter((step) => ADMIN_TRACK.includes(step.code))
            .map((step) => (
              <li key={step.code} className="text-center">
                <span className={`mx-auto block h-2.5 w-2.5 rounded-full ${step.done ? "bg-orange" : "border border-gold bg-paper"}`} />
                <p className={`mt-2 text-[11px] font-semibold ${step.done ? "text-maroon" : "text-muted"}`}>
                  {step.label}
                </p>
              </li>
            ))}
        </ol>
        <label className="mt-5 block text-xs font-semibold text-muted">Tracking number</label>
        <input
          className="input-ps mt-1"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Optional courier AWB"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((step) => {
            const orderSteps = ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
            const nextIdx = next ? orderSteps.indexOf(next) : -1;
            const thisIdx = orderSteps.indexOf(step.id);
            const enabled = nextIdx >= 0 && thisIdx >= nextIdx;
            return (
              <button
                key={step.id}
                type="button"
                disabled={busy !== null || !enabled}
                className={`btn-outline-gold ${next === step.id ? "border-orange text-orange" : ""}`}
                onClick={() => void mark(step.id)}
              >
                {busy === step.id ? "Saving…" : `Mark ${step.label.toLowerCase()}`}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          {next === "CONFIRMED"
            ? "Confirm the order first."
            : next === "DISPATCH_VENDOR"
              ? "Send the slip to a vendor next."
              : next
                ? `Next step for this order: ${next.replaceAll("_", " ").toLowerCase()}.`
                : "This order is complete or cannot move."}
        </p>
      </section>

      <section className="card-temple mt-4 p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {(order.items ?? []).map((item, i) => (
            <li key={`${itemName(item)}-${i}`} className="flex justify-between gap-3">
              <span>
                {itemName(item)} × {item.quantity}
              </span>
              {item.totalMinor != null ? <span>{formatMoney(item.totalMinor, order.currency)}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function UpiProofImage({ paymentId }: { paymentId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let alive = true;
    void clientFetchBlob(`/payments/${paymentId}/upi-proof`)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (alive) setUrl(objectUrl);
      })
      .catch(() => {
        if (alive) setUrl(null);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [paymentId]);

  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Customer payment screenshot"
      className="mt-2 max-h-72 w-full rounded-xl border border-divider object-contain bg-white"
    />
  );
}
