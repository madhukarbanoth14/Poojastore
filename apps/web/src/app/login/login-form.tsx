"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { LotusDivider } from "@/components/ornaments";
import { Kicker } from "@/components/ui";

export function LoginForm({
  googleClientId,
  appleClientId,
}: {
  googleClientId: string;
  appleClientId: string;
}) {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const signedIn = await login({ email: email.trim(), password });
      const dest =
        signedIn.role === "ADMIN" && (next === "/" || next.startsWith("/admin"))
          ? "/admin"
          : next;
      router.replace(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="card-temple px-6 py-10 md:px-8">
        <div className="text-center">
          <Kicker>Welcome</Kicker>
          <h1 className="font-display mt-2 text-4xl text-maroon">Namaste</h1>
        </div>
        <LotusDivider className="mx-auto mt-4" />
        <p className="mt-3 text-center text-sm text-muted">Sign in with your email and password</p>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={8}
            required
          />
          <button type="submit" disabled={busy || !email || password.length < 8} className="w-full btn-orange disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error ? <p className="text-center text-sm text-orange">{error}</p> : null}
        </form>
        <p className="mt-5 text-center text-sm text-body">
          New here?{" "}
          <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-maroon">
            Create an account
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
