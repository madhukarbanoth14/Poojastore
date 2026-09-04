"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { ac } from "@/lib/account-copy";
import { writeLocale } from "@/lib/client";
import { t } from "@/lib/copy";
import { initials } from "@/lib/format";
import type { Locale } from "@/lib/types";

const AccountLocale = createContext<Locale>("en");

export function useAccountLocale() {
  return useContext(AccountLocale);
}

type NavItem = {
  href: string;
  label: string;
  hint?: string;
};

export function AccountFrame({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const { user, ready, logout, updateProfile } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const isHub = path === "/account";

  if (!ready) {
    return <p className="px-5 py-16 text-center text-muted">{ac(locale, "loading")}</p>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
          {ac(locale, "kicker")}
        </p>
        <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "guestTitle")}</h1>
        <Link
          href={`/login?next=${encodeURIComponent(path || "/account")}`}
          className="btn-orange mt-8 inline-flex"
        >
          {t(locale, "login")}
        </Link>
      </div>
    );
  }

  const name = user.fullName?.trim() || ac(locale, "namaste");
  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: ac(locale, "groupAccount"),
      items: [
        { href: "/account/profile", label: ac(locale, "personal"), hint: ac(locale, "personalHint") },
        { href: "/account/addresses", label: ac(locale, "addresses"), hint: ac(locale, "addressesHint") },
        { href: "/account/security", label: ac(locale, "security"), hint: ac(locale, "securityHint") },
      ],
    },
    {
      title: ac(locale, "groupOrders"),
      items: [
        { href: "/orders", label: ac(locale, "orders"), hint: ac(locale, "ordersHint") },
        { href: "/cart", label: ac(locale, "cart"), hint: ac(locale, "cartHint") },
        { href: "/account/bookings", label: ac(locale, "bookings"), hint: ac(locale, "bookingsHint") },
        { href: "/priests", label: ac(locale, "priests") },
      ],
    },
    {
      title: ac(locale, "groupSpiritual"),
      items: [
        { href: "/account/birth", label: ac(locale, "birth"), hint: ac(locale, "birthHint") },
        { href: "/rasi", label: ac(locale, "rasiToday") },
        { href: "/guidance", label: ac(locale, "guidanceToday") },
        { href: "/panchang", label: ac(locale, "panchangToday") },
        { href: "/account/notifications", label: ac(locale, "notifications"), hint: ac(locale, "notificationsHint") },
      ],
    },
    {
      title: ac(locale, "groupHelp"),
      items: [
        ...(user.role === "ADMIN"
          ? [{ href: "/admin", label: "Store ops desk", hint: "Orders, tracking, payments, promo codes" }]
          : []),
        { href: "/account/support", label: ac(locale, "support"), hint: ac(locale, "supportHint") },
        {
          href: "/priests/apply",
          label: user.role === "POOJARI" ? ac(locale, "pujariDesk") : ac(locale, "joinPujari"),
        },
        { href: "/privacy", label: ac(locale, "privacy") },
        { href: "/about", label: ac(locale, "about") },
      ],
    },
  ];

  function setLocale(next: Locale) {
    writeLocale(next);
    void updateProfile({ preferredLanguage: next }).catch(() => undefined);
    router.refresh();
  }

  return (
    <AccountLocale.Provider value={locale}>
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      {isHub ? (
        <div className="mx-auto max-w-lg">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
            {ac(locale, "kicker")}
          </p>
          <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "title")}</h1>
          <div className="mt-6">
            <IdentityCard
              locale={locale}
              name={name}
              phone={user.phoneE164}
              email={user.email}
              createdAt={user.createdAt}
            />
          </div>
          {children}
          <LanguageToggle locale={locale} onChange={setLocale} />
          <nav className="mt-8 space-y-7">
            {groups.map((group) => (
              <section key={group.title}>
                <p className="mb-2 px-1 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
                  {group.title}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="card-temple flex items-center justify-between gap-3 px-4 py-3.5"
                    >
                      <span>
                        <span className="block font-semibold text-maroon">{item.label}</span>
                        {item.hint ? (
                          <span className="mt-0.5 block text-xs text-muted">{item.hint}</span>
                        ) : null}
                      </span>
                      <span className="text-lg leading-none text-muted" aria-hidden>
                        ›
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
            <button
              type="button"
              onClick={() => void logout().then(() => router.push("/"))}
              className="w-full rounded-2xl border border-gold py-3 text-sm font-semibold text-orange"
            >
              {ac(locale, "logout")}
            </button>
          </nav>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[17.5rem_1fr]">
          <aside className="hidden lg:block">
            <IdentityCard
              locale={locale}
              name={name}
              phone={user.phoneE164}
              email={user.email}
              createdAt={user.createdAt}
            />
            <SideNav locale={locale} path={path} groups={groups} />
          </aside>
          <div>
            <Link href="/account" className="mb-4 inline-block text-sm font-semibold text-maroon lg:hidden">
              ← {ac(locale, "back")}
            </Link>
            {children}
          </div>
        </div>
      )}
    </div>
    </AccountLocale.Provider>
  );
}

function IdentityCard({
  locale,
  name,
  phone,
  email,
  createdAt,
}: {
  locale: Locale;
  name: string;
  phone: string;
  email?: string | null;
  createdAt?: string;
}) {
  const since = createdAt
    ? new Date(createdAt).toLocaleDateString(locale === "te" ? "te-IN" : "en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;
  return (
    <div className="card-temple flex items-center gap-4 p-5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-maroon text-lg font-bold text-cream">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl leading-tight text-maroon">{name}</p>
        <p className="mt-0.5 truncate text-sm text-muted">{phone}</p>
        {email ? <p className="truncate text-sm text-muted">{email}</p> : null}
        {since ? (
          <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">
            {ac(locale, "memberSince")} {since}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (next: Locale) => void;
}) {
  return (
    <div className="card-temple mt-4 flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="font-semibold text-maroon">{ac(locale, "language")}</span>
      <div className="flex rounded-full border border-gold p-0.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onChange("en")}
          className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-orange text-cream" : "text-maroon"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onChange("te")}
          className={`rounded-full px-3 py-1.5 ${locale === "te" ? "bg-orange text-cream" : "text-maroon"}`}
        >
          తె
        </button>
      </div>
    </div>
  );
}

function SideNav({
  locale,
  path,
  groups,
}: {
  locale: Locale;
  path: string;
  groups: { title: string; items: NavItem[] }[];
}) {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <nav className="mt-6 space-y-5">
      {groups.map((group) => (
        <section key={group.title}>
          <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold ${
                    active ? "bg-blush text-maroon" : "text-body hover:bg-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <button
        type="button"
        onClick={() => void logout().then(() => router.push("/"))}
        className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-orange"
      >
        {ac(locale, "logout")}
      </button>
    </nav>
  );
}
