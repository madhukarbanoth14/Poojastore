"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import { submitUpiUtr, type Payment } from "@/lib/payments";

const COMPANY_QR = "/images/payments/company-upi-qr.jpeg";

function publicQrSrc(raw?: string) {
  if (!raw) return COMPANY_QR;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/images/")) return raw;
  return COMPANY_QR;
}

function qrSrc(payment: Payment, brokenCompanyQr: boolean) {
  const company = publicQrSrc(payment.metadata?.qrImageUrl);
  if (!brokenCompanyQr) return company;
  const upi = payment.metadata?.upiUri;
  if (!upi) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=${encodeURIComponent(upi)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the screenshot"));
    reader.readAsDataURL(file);
  });
}

export function UpiPayPanel({
  payment,
  onPaid,
}: {
  payment: Payment;
  onPaid: () => void;
}) {
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [brokenCompanyQr, setBrokenCompanyQr] = useState(false);
  const src = useMemo(
    () => qrSrc(payment, brokenCompanyQr),
    [payment, brokenCompanyQr],
  );
  const vpa = payment.metadata?.vpa;
  const amount = formatMoney(payment.amountMinor, payment.currency ?? "INR");
  const canSubmit = utr.trim().length >= 8 || Boolean(screenshot);

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
    if (file.size > 2_000_000) {
      setError("Screenshot must be under 2 MB");
      return;
    }
    setError(null);
    setScreenshot(await fileToDataUrl(file));
    setScreenshotName(file.name);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await submitUpiUtr(payment.id, {
        utr: utr.trim() || undefined,
        screenshotBase64: screenshot ?? undefined,
      });
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the payment proof");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">Pay with UPI</h2>
      <p className="text-sm text-muted">
        Pay <span className="font-semibold text-maroon">{amount}</span> to Techfy Labs with
        PhonePe, Google Pay, or Paytm. On a computer, scan the QR with another phone.
      </p>
      {src ? (
        <div className="flex justify-center rounded-2xl border border-divider bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Company UPI QR code"
            width={240}
            height={240}
            className="h-60 w-60 object-contain"
            onError={() => setBrokenCompanyQr(true)}
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
      <div className="grid gap-2 sm:grid-cols-3">
        {payment.metadata?.phonepeUri ? (
          <a href={payment.metadata.phonepeUri} className="btn-outline-gold flex justify-center">
            PhonePe
          </a>
        ) : null}
        {payment.metadata?.gpayUri ? (
          <a href={payment.metadata.gpayUri} className="btn-outline-gold flex justify-center">
            Google Pay
          </a>
        ) : null}
        {payment.metadata?.paytmUri ? (
          <a href={payment.metadata.paytmUri} className="btn-outline-gold flex justify-center">
            Paytm
          </a>
        ) : null}
      </div>
      {payment.metadata?.upiUri ? (
        <a href={payment.metadata.upiUri} className="btn-outline-gold flex justify-center">
          Other UPI app
        </a>
      ) : null}
      <label className="block text-sm font-semibold">
        UPI reference / UTR (optional if you upload a screenshot)
        <input
          className="input-ps mt-1"
          value={utr}
          onChange={(e) => setUtr(e.target.value.toUpperCase())}
          placeholder="12-digit UTR from your payment app"
          autoComplete="off"
        />
      </label>
      <div>
        <p className="text-sm font-semibold">Payment screenshot (optional if you enter a UTR)</p>
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
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <button
        type="button"
        className="btn-orange w-full disabled:opacity-50"
        disabled={busy || !canSubmit}
        onClick={() => void submit()}
      >
        {busy ? "Saving…" : "I have paid"}
      </button>
      <p className="text-xs text-muted">
        Money goes to the Techfy Labs UPI account. We confirm the credit on the bank
        statement, then pack the order.
      </p>
    </section>
  );
}
