"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";
import { writeLocale } from "@/lib/client";
import type { Locale } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function ProfileDetailsPage() {
  const { user, updateProfile } = useAuth();
  const locale = useAccountLocale();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [language, setLanguage] = useState<Locale>(user?.preferredLanguage === "te" ? "te" : locale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phoneDraft.trim() || undefined,
        preferredLanguage: language,
      });
      writeLocale(language);
      setMessage(ac(language, "saved"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupAccount")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "personal")}</h1>
      <form className="card-temple mt-6 space-y-4 p-6" onSubmit={(e) => void onSubmit(e)}>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "fullName")}
          <input
            className="input-ps mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "email")}
          <input
            className="input-ps mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "language")}
          <select
            className="input-ps mt-1"
            value={language}
            onChange={(e) => setLanguage(e.target.value === "te" ? "te" : "en")}
          >
            <option value="en">{ac(locale, "english")}</option>
            <option value="te">{ac(locale, "telugu")}</option>
          </select>
        </label>
        <div className="rounded-xl border border-divider bg-blush/40 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {ac(locale, "phoneLocked")}
          </p>
          <p className="mt-1 font-semibold text-maroon">{user.phoneE164}</p>
          <p className="mt-1 text-xs text-muted">{ac(locale, "phoneHint")}</p>
        </div>
        {!/^\+91[6-9]\d{9}$/.test(user.phoneE164) ? (
          <label className="block text-sm font-medium text-maroon">
            Mobile number
            <input
              className="input-ps mt-1"
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
            />
            <span className="mt-1 block text-xs text-muted">
              Google / Apple sign-in does not share your number — add it for delivery.
            </span>
          </label>
        ) : null}
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        {message ? <p className="text-sm text-maroon">{message}</p> : null}
        <button type="submit" disabled={busy} className="w-full btn-orange disabled:opacity-50">
          {busy ? ac(locale, "saving") : ac(locale, "save")}
        </button>
      </form>
    </div>
  );
}
