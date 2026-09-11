"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ToranBar } from "@/components/ornaments";
import { BrandMark, BrandWordmark } from "@/components/ui";
import { writeLocale } from "@/lib/client";
import { t, type CopyKey } from "@/lib/copy";
import type { Locale } from "@/lib/types";

const NAV: { href: string; key: CopyKey }[] = [
  { href: "/panchang", key: "navPanchang" },
  { href: "/poojas", key: "navPoojas" },
  { href: "/festivals", key: "navFestivals" },
  { href: "/priests", key: "navPriests" },
  { href: "/kits", key: "navKits" },
  { href: "/samagri", key: "navSamagri" },
  { href: "/packages", key: "navPackages" },
  { href: "/vidhi", key: "navVidhi" },
];

export function SiteHeader({ locale, brand }: { locale: Locale; brand: string }) {
  const path = usePathname();
  const router = useRouter();
  const { user, cart, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    setOpen(false);
  }, [path]);

  function setLocale(next: Locale) {
    writeLocale(next);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-maroon/95 text-cream shadow-[0_8px_30px_rgba(46,10,18,0.35)] backdrop-blur-md">
      <ToranBar />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={brand}>
          <BrandMark size={40} priority className="h-10 w-10" />
          <BrandWordmark locale={locale} onDark className="text-[1.35rem] leading-none" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 text-[13px] font-medium tracking-wide lg:flex">
          {NAV.map((item) => {
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${
                  active ? "nav-link-active text-gold-bright" : "text-cream/78 hover:text-gold-bright"
                }`}
              >
                {t(locale, item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "te" : "en")}
            className="rounded-full border border-gold-bright/30 px-2.5 py-1.5 font-semibold tracking-wide text-cream/90 hover:border-gold-bright/70 hover:bg-cream/5"
          >
            {locale === "en" ? "EN · తె" : "తె · EN"}
          </button>
          <Link
            href="/cart"
            className="relative rounded-full border border-gold-bright/30 px-3.5 py-1.5 font-semibold tracking-wide hover:border-gold-bright/70 hover:bg-cream/5"
          >
            {t(locale, "cart")}
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange px-1 text-[10px] text-cream">
                {count}
              </span>
            ) : null}
          </Link>
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="hidden rounded-full border border-gold-bright/30 px-3.5 py-1.5 font-semibold tracking-wide hover:border-gold-bright/70 sm:inline"
            >
              Ops
            </Link>
          ) : null}
          {ready ? (
            <Link
              href={user ? "/account" : "/login"}
              className="hidden bg-orange px-3.5 py-1.5 font-semibold tracking-wide text-cream shadow-[0_6px_16px_rgba(232,93,4,0.35)] sm:inline rounded-full"
            >
              {user ? user.fullName?.split(" ")[0] || t(locale, "account") : t(locale, "login")}
            </Link>
          ) : null}
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-gold-bright/30 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="flex w-3.5 flex-col gap-1">
              <span className="h-px w-full bg-gold-bright" />
              <span className="h-px w-full bg-gold-bright" />
              <span className="h-px w-full bg-gold-bright" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-gold-bright/20 bg-maroon-ink/95 px-5 py-5 backdrop-blur-md lg:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-cream/10 py-2.5 text-cream/90"
              >
                {t(locale, item.key)}
              </Link>
            ))}
            <Link href="/about" onClick={() => setOpen(false)} className="py-2.5">
              {t(locale, "navAbout")}
            </Link>
            {user?.role === "ADMIN" ? (
              <Link href="/admin" onClick={() => setOpen(false)} className="py-2.5 text-gold-bright">
                Ops desk
              </Link>
            ) : null}
            <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="py-2.5 text-orange">
              {user ? t(locale, "account") : t(locale, "login")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
