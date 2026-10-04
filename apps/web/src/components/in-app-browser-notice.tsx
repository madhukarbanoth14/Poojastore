"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { inAppBrowserName, isInAppBrowser, openInExternalBrowser } from "@/lib/in-app-browser";

export function InAppBrowserNotice() {
  const [app, setApp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isInAppBrowser()) setApp(inAppBrowserName());
  }, []);

  if (!app) return null;

  const android = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

  return (
    <div className="mb-5 rounded-2xl border border-gold bg-blush px-4 py-4 text-sm text-body">
      <p className="font-semibold text-maroon">Google Sign-In does not work inside {app}</p>
      <p className="mt-1 leading-relaxed">
        {android
          ? "Open this page in Chrome, then tap Continue with Google."
          : "Tap ••• and choose Open in Safari, then tap Continue with Google. You can also create an account with email on this screen."}{" "}
        To book a kit without Google, enter your name, mobile, and address at checkout.
      </p>
      <Link href="/kits" className="mt-2 inline-block font-semibold text-maroon">
        Browse kits instead
      </Link>
      <button
        type="button"
        className="btn-orange mt-3 w-full justify-center"
        onClick={() => {
          openInExternalBrowser();
          if (!android) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2500);
          }
        }}
      >
        {android ? "Open in Chrome" : copied ? "Link copied — open Safari" : "Copy link for Safari"}
      </button>
    </div>
  );
}
