"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { BrandMark, BrandWordmark } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/promos", label: "Promo codes" },
  { href: "/admin/activity", label: "Activity" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();

  if (!ready) {
    return <p className="px-6 py-16 text-center text-muted">Loading ops desk…</p>;
  }
  if (!user) {
    router.replace(`/login?next=${encodeURIComponent(path || "/admin")}`);
    return null;
  }
  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
          Store ops
        </p>
        <h1 className="font-display mt-2 text-4xl text-maroon">Staff only</h1>
        <p className="mt-3 text-sm text-muted">
          This desk is for packing, tracking, payments, and promo codes — not the customer shop.
        </p>
        <Link href="/" className="btn-orange mt-8 inline-flex">
          Back to Pavitra Seva
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 bg-maroon text-cream md:flex md:flex-col">
          <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
            <BrandMark size={36} className="h-9 w-9" />
            <span>
              <BrandWordmark locale="en" onDark className="text-lg leading-none" />
              <span className="mt-1 block text-[10px] tracking-[0.18em] uppercase text-gold-bright/80">
                Ops desk
              </span>
            </span>
          </Link>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-6">
            {NAV.map((item) => {
              const active =
                item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm ${
                    active ? "bg-cream/12 font-semibold text-gold-bright" : "text-cream/80 hover:bg-cream/8"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-cream/10 px-5 py-4 text-xs">
            <p className="truncate font-semibold">{user.fullName || "Admin"}</p>
            <p className="truncate text-cream/60">{user.email}</p>
            <button
              type="button"
              className="mt-3 text-gold-bright underline-offset-2 hover:underline"
              onClick={() => void logout().then(() => router.push("/login?next=/admin"))}
            >
              Sign out
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-divider bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
            <p className="font-display text-xl text-maroon">Ops</p>
            <nav className="flex gap-3 overflow-auto text-xs font-semibold">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="shrink-0 text-maroon">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <div className="px-4 py-6 md:px-8 md:py-8">
            <main id="main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
