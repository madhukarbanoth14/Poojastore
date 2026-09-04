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
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true" || window.google?.accounts?.id) {
        existing.dataset.loaded = "true";
        resolve();
        return;
      }
      const done = () => {
        existing.dataset.loaded = "true";
        resolve();
      };
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
      return;
    }
    const el = document.createElement("script");
    el.id = id;
    el.src = src;
    el.async = true;
    el.onload = () => {
      el.dataset.loaded = "true";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

async function waitForGoogle(timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (!window.google?.accounts?.id) {
    if (Date.now() > deadline) {
      throw new Error("Google Sign-In failed to load");
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
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
  const [googleHost, setGoogleHost] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const socialLoginRef = useRef(socialLogin);
  const nextRef = useRef(next);
  socialLoginRef.current = socialLogin;
  nextRef.current = next;

  useEffect(() => {
    void loadScript(
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
      "apple-auth",
    );
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleHost) {
      setGoogleReady(false);
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        await loadScript("https://accounts.google.com/gsi/client", "google-gsi");
        await waitForGoogle();
        if (cancelled) return;
        window.google!.accounts.id.initialize({
          client_id: googleClientId,
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            setBusy("google");
            setError(null);
            void socialLoginRef
              .current({ provider: "GOOGLE", idToken: response.credential })
              .then(() => router.replace(nextRef.current))
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Google Sign-In failed");
              })
              .finally(() => setBusy(null));
          },
        });
        googleHost.replaceChildren();
        window.google!.accounts.id.renderButton(googleHost, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: Math.min(Math.max(googleHost.offsetWidth || 320, 240), 400),
          logo_alignment: "left",
        });
        if (!cancelled) {
          setError(null);
          setGoogleReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setGoogleReady(false);
          setError(
            err instanceof Error && err.message.includes("Failed to load")
              ? "Could not reach Google. Disable any ad blocker for this page and refresh."
              : "Google Sign-In failed to load. Refresh the page, or use email and password.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleHost, router]);

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
          ref={setGoogleHost}
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
