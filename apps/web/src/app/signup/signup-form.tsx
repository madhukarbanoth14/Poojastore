"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { LotusDivider } from "@/components/ornaments";
import { Kicker } from "@/components/ui";

export function SignupForm({
  googleClientId,
  appleClientId,
}: {
  googleClientId: string;
  appleClientId: string;
}) {
  const { register } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [countryCode, setCountryCode] = useState("91");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await register({
        email: email.trim(),
        password,
        countryCode,
        phone,
        fullName: fullName.trim() || undefined,
      });
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="card-temple px-6 py-10 md:px-8">
        <div className="text-center">
          <Kicker>Join Pavitra Seva</Kicker>
          <h1 className="font-display mt-2 text-4xl text-maroon">Create account</h1>
        </div>
        <LotusDivider className="mx-auto mt-4" />
        <p className="mt-3 text-center text-sm text-muted">Email, password, and mobile number</p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            className="input-ps"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="input-ps"
            type="password"
            placeholder="Password (at least 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <label className="block text-sm font-medium text-maroon">
            Country
            <select
              className="input-ps mt-1"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="91">India (+91)</option>
              <option value="1">USA / Canada (+1)</option>
            </select>
          </label>
          <input
            className="input-ps"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            required
          />
          <input
            className="input-ps"
            placeholder="Full name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
          <button
            type="submit"
            disabled={busy || !email || password.length < 8 || phone.length < 8}
            className="w-full btn-orange disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
          {error ? <p className="text-center text-sm text-orange">{error}</p> : null}
        </form>
        <p className="mt-5 text-center text-sm text-body">
          Already have an account?{" "}
          <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-maroon">
            Sign in
          </Link>
        </p>
        <div className="mt-6">
          <SocialAuthButtons
            disabled={busy}
            googleClientId={googleClientId}
            appleClientId={appleClientId}
          />
        </div>
      </div>
    </div>
  );
}
