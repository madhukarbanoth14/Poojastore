"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: "popup" | "redirect";
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization?: { id_token?: string };
          user?: { email?: string; name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}

const APPLE_REDIRECT = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? "";

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.id = id;
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

export function SocialAuthButtons({
  disabled,
  googleClientId = "",
  appleClientId = "",
}: {
  disabled?: boolean;
  googleClientId?: string;
  appleClientId?: string;
}) {
  const { socialLogin } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    void loadScript(
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
      "apple-auth",
    );
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      setGoogleReady(false);
      return;
    }
    const host = googleBtnRef.current;
    if (!host) return;
    let cancelled = false;

    void (async () => {
      try {
        await loadScript("https://accounts.google.com/gsi/client", "google-gsi");
        if (cancelled || !window.google?.accounts.id) {
          throw new Error("Google Sign-In failed to load");
        }
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            setBusy("google");
            setError(null);
            void socialLogin({ provider: "GOOGLE", idToken: response.credential })
              .then(() => router.replace(next))
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Google Sign-In failed");
              })
              .finally(() => setBusy(null));
          },
        });
        host.replaceChildren();
        window.google.accounts.id.renderButton(host, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: Math.min(Math.max(host.offsetWidth || 320, 240), 400),
          logo_alignment: "left",
        });
        if (!cancelled) setGoogleReady(true);
      } catch (err) {
        if (!cancelled) {
          setGoogleReady(false);
          setError(err instanceof Error ? err.message : "Google Sign-In failed to load");
        }
      }
    })();

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [googleClientId, next, router, socialLogin]);

  function googleUnconfigured() {
    setError("Google Sign-In is not configured yet. Use email and password.");
  }

  async function apple() {
    setError(null);
    if (!appleClientId) {
      setError("Apple Sign-In is not configured yet. Use email and password.");
      return;
    }
    setBusy("apple");
    try {
      await loadScript(
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
        "apple-auth",
      );
      const redirectURI = APPLE_REDIRECT || `${window.location.origin}/login`;
      window.AppleID?.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI,
        usePopup: true,
      });
      const data = await window.AppleID?.auth.signIn();
      const idToken = data?.authorization?.id_token;
      if (!idToken) throw new Error("Apple did not return an ID token");
      const name = [data?.user?.name?.firstName, data?.user?.name?.lastName]
        .filter(Boolean)
        .join(" ");
      await socialLogin({
        provider: "APPLE",
        idToken,
        email: data?.user?.email,
        fullName: name || undefined,
      });
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign-In failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-divider" />
        or continue with
        <span className="h-px flex-1 bg-divider" />
      </div>
      {googleClientId ? (
        <div
          ref={googleBtnRef}
          className={`flex min-h-[48px] w-full justify-center ${
            disabled || busy !== null ? "pointer-events-none opacity-50" : ""
          }`}
        />
      ) : (
        <button
          type="button"
          disabled={disabled || busy !== null}
          onClick={googleUnconfigured}
          className="w-full rounded-full border border-border bg-paper px-4 py-3 text-sm font-semibold text-maroon disabled:opacity-50"
        >
          Continue with Google
        </button>
      )}
      {googleClientId && !googleReady && !error ? (
        <p className="text-center text-xs text-muted">Loading Google…</p>
      ) : null}
      <button
        type="button"
        disabled={disabled || busy !== null}
        onClick={() => void apple()}
        className="w-full rounded-full bg-[#221013] px-4 py-3 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {busy === "apple" ? "Connecting…" : "Continue with Apple"}
      </button>
      {error ? <p className="text-center text-sm text-orange">{error}</p> : null}
    </div>
  );
}
