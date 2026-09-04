"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";

export default function SecurityPage() {
  const { user, changePassword } = useAuth();
  const locale = useAccountLocale();
  const hasPassword = user?.hasPassword ?? false;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (newPassword !== confirm) {
      setError(ac(locale, "mismatch"));
      return;
    }
    setBusy(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setMessage(ac(locale, "saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupAccount")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "security")}</h1>
      <p className="mt-2 text-sm text-muted">{ac(locale, "passwordHint")}</p>
      <form className="card-temple mt-6 space-y-3 p-6" onSubmit={(e) => void onSubmit(e)}>
        {hasPassword ? (
          <input
            className="input-ps"
            type="password"
            autoComplete="current-password"
            placeholder={ac(locale, "currentPassword")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        ) : null}
        <input
          className="input-ps"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder={ac(locale, "newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          className="input-ps"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder={ac(locale, "confirmPassword")}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        {message ? <p className="text-sm text-maroon">{message}</p> : null}
        <button type="submit" disabled={busy} className="w-full btn-orange disabled:opacity-50">
          {busy ? ac(locale, "saving") : hasPassword ? ac(locale, "changePassword") : ac(locale, "setPassword")}
        </button>
      </form>
    </div>
  );
}
