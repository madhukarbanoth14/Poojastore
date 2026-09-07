"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import { submitUpiUtr, type Payment } from "@/lib/payments";

const COMPANY_QR = "/images/payments/company-upi-qr.jpeg";
const MAX_UPLOAD_BYTES = 900_000;
const UTR_PATTERN = /^[0-9]{12}$/;

function publicQrSrc(raw?: string) {
  if (!raw) return COMPANY_QR;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/images/")) return raw;
  return COMPANY_QR;
}

/** Prefer a dynamic amount QR — PhonePe blocks many in-app deep links. */
function qrSrc(payment: Payment, brokenDynamic: boolean) {
  const upi = payment.metadata?.upiUri;
  if (upi && !brokenDynamic) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=${encodeURIComponent(upi)}`;
  }
  return publicQrSrc(payment.metadata?.qrImageUrl);
}

function normalizeUtr(value: string) {
  return value.trim().replace(/[\s-]/g, "");
}

function parseAmountToMinor(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "").replace(/^₹\s?/, "");
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const rupees = Number(cleaned);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return Math.round(rupees * 100);
}

/** Resize + JPEG-compress so the base64 body stays under the API limit. */
async function compressScreenshot(file: File): Promise<{ dataUrl: string; name: string }> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the screenshot");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.72;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_UPLOAD_BYTES * 1.37 && quality > 0.4) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_UPLOAD_BYTES * 1.4) {
    throw new Error("Screenshot is still too large — enter the UTR only, or pick a smaller image");
  }
  return { dataUrl, name: file.name.replace(/\.\w+$/, "") + ".jpg" };
}

function clientUtrError(utr: string): string | null {
  if (!UTR_PATTERN.test(utr)) {
    return "Enter the exact 12-digit UTR from PhonePe / Google Pay / Paytm. This reference is not valid.";
  }
  if (/^(\d)\1{11}$/.test(utr) || utr === "123456789012" || utr === "000000000000") {
    return "This UTR does not look like a real payment reference. Copy it from your payment success screen.";
  }
  return null;
}

export function UpiPayPanel({
  payment,
  onPaid,
}: {
  payment: Payment;
  onPaid: () => void;
}) {
  const [utr, setUtr] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [brokenDynamic, setBrokenDynamic] = useState(false);
  const src = useMemo(
    () => qrSrc(payment, brokenDynamic),
    [payment, brokenDynamic],
  );
  const vpa = payment.metadata?.vpa;
  const amount = formatMoney(payment.amountMinor, payment.currency ?? "INR");
  const normalizedUtr = normalizeUtr(utr);
  const amountPaidMinor = parseAmountToMinor(amountPaid);
  const canSubmit = Boolean(normalizedUtr || amountPaid.trim()) && !busy;

  async function copyVpa() {
    if (!vpa) return;
    try {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function onScreenshot(file?: File | null) {
    if (!file) {
      setScreenshot(null);
      setScreenshotName(null);
      return;
    }
    setError(null);
    try {
      const compressed = await compressScreenshot(file);
      setScreenshot(compressed.dataUrl);
      setScreenshotName(compressed.name);
    } catch (err) {
      setScreenshot(null);
      setScreenshotName(null);
      setError(err instanceof Error ? err.message : "Could not read the screenshot");
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const utrError = clientUtrError(normalizedUtr);
      if (utrError) throw new Error(utrError);
      if (amountPaidMinor == null) {
        throw new Error("Enter the amount you paid (must match the QR amount).");
      }
      if (amountPaidMinor !== payment.amountMinor) {
        throw new Error(
          `Amount does not match this order (expected ${amount}). Use the UTR from the payment of this exact amount — other UTRs are not accepted.`,
        );
      }
      await submitUpiUtr(payment.id, {
        utr: normalizedUtr,
        amountPaidMinor,
        screenshotBase64: screenshot ?? undefined,
      });
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm the payment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">Pay with UPI</h2>
      <p className="text-sm text-muted">
        Pay <span className="font-semibold text-maroon">{amount}</span> by{" "}
        <span className="font-semibold text-maroon">scanning this QR</span> in
        PhonePe, Google Pay, or Paytm. We only accept QR payments — no in-app Pay
        links.
      </p>
      {src ? (
        <div className="flex justify-center rounded-2xl border border-divider bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="UPI QR code with order amount"
            width={240}
            height={240}
            className="h-60 w-60 object-contain"
            onError={() => setBrokenDynamic(true)}
          />
        </div>
      ) : null}
      <p className="font-display text-center text-3xl text-maroon">{amount}</p>
      {vpa ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-divider bg-paper px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              UPI ID
            </p>
            <p className="mt-1 font-semibold text-maroon">{vpa}</p>
          </div>
          <button type="button" className="btn-outline-gold" onClick={() => void copyVpa()}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
      <ol className="list-decimal space-y-1 pl-5 text-sm text-body">
        <li>Open PhonePe / GPay / Paytm → Scan this QR</li>
        <li>Confirm amount is {amount}</li>
        <li>Enter that same amount and the 12-digit UTR below</li>
      </ol>
      <label className="block text-sm font-semibold">
        Amount paid (₹)
        <input
          className="input-ps mt-1"
          value={amountPaid}
          onChange={(e) => {
            setAmountPaid(e.target.value);
            setError(null);
          }}
          placeholder={`Must be ${amount.replace("₹", "").trim()}`}
          inputMode="decimal"
          autoComplete="off"
        />
      </label>
      <label className="block text-sm font-semibold">
        UPI reference / UTR
        <input
          className="input-ps mt-1"
          value={utr}
          onChange={(e) => {
            setUtr(e.target.value.replace(/[^\d\s-]/g, ""));
            setError(null);
          }}
          placeholder="12-digit UTR from your payment app"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
        />
      </label>
      <div>
        <p className="text-sm font-semibold">Payment screenshot (optional)</p>
        <label className="btn-orange relative mt-2 w-full cursor-pointer overflow-hidden">
          <input
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            style={{ fontSize: 100 }}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void onScreenshot(e.target.files?.[0])}
          />
          {screenshot ? "Change screenshot" : "Choose screenshot"}
        </label>
        {screenshot ? (
          <p className="mt-2 text-sm text-maroon">Attached: {screenshotName ?? "screenshot"}</p>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-orange">{error}</p> : null}
      <button
        type="button"
        className="btn-orange w-full disabled:opacity-50"
        disabled={!canSubmit}
        onClick={() => void submit()}
      >
        {busy ? "Checking…" : "I have paid"}
      </button>
      <p className="text-xs text-muted">
        Wrong UTRs or UTRs from a different amount are rejected immediately. After a
        valid UTR, we confirm the bank credit for this exact order amount, then pack.
      </p>
    </section>
  );
}
