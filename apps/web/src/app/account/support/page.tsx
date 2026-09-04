"use client";

import Link from "next/link";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";

export default function SupportPage() {
  const locale = useAccountLocale();
  return (
    <div className="mx-auto max-w-lg">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupHelp")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "support")}</h1>
      <div className="card-temple mt-6 p-6">
        <p className="font-semibold">{ac(locale, "supportEmail")}</p>
        <p className="mt-1 text-sm text-muted">{ac(locale, "supportBody")}</p>
        <a className="mt-3 inline-block font-semibold text-maroon underline" href="mailto:privacy@pavitraseva.in">
          privacy@pavitraseva.in
        </a>
      </div>
      <div className="mt-4 grid gap-3">
        <Link href="/privacy" className="card-temple block p-4 font-semibold">
          {ac(locale, "privacy")}
        </Link>
        <Link href="/about" className="card-temple block p-4 font-semibold">
          {ac(locale, "about")}
        </Link>
        <Link href="/orders" className="card-temple block p-4 font-semibold">
          {ac(locale, "orders")}
        </Link>
      </div>
    </div>
  );
}
