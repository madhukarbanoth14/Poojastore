"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";
import { clientFetch } from "@/lib/client";

type Notice = {
  id: string;
  title: string;
  body: string;
  unread?: boolean;
  createdAt: string;
  data?: { deepLink?: string };
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const locale = useAccountLocale();
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);

  async function reload() {
    const data = await clientFetch<{ items: Notice[]; unreadCount: number }>("/notifications");
    setItems(data.items ?? []);
    setUnread(data.unreadCount ?? 0);
  }

  useEffect(() => {
    if (!user) return;
    void reload().catch(() => setItems([]));
  }, [user]);

  if (!user) return null;

  async function markAll() {
    await clientFetch("/notifications/read-all", { method: "PATCH" });
    await reload();
  }

  async function markOne(id: string) {
    await clientFetch(`/notifications/${id}/read`, { method: "PATCH" });
    await reload();
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
            {ac(locale, "groupSpiritual")}
          </p>
          <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "notifications")}</h1>
        </div>
        {unread > 0 ? (
          <button type="button" className="text-sm font-semibold text-maroon" onClick={() => void markAll()}>
            {ac(locale, "markAllRead")}
          </button>
        ) : null}
      </div>
      <div className="mt-6 space-y-3">
        {items.map((n) => {
          const href = typeof n.data?.deepLink === "string" ? n.data.deepLink : null;
          const inner = (
            <div className={`card-temple p-4 ${n.unread ? "border-orange/50" : ""}`}>
              <p className="font-semibold">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              <p className="mt-2 text-[11px] text-muted">
                {new Date(n.createdAt).toLocaleString(locale === "te" ? "te-IN" : "en-IN")}
              </p>
            </div>
          );
          return (
            <div key={n.id} onClick={() => n.unread && void markOne(n.id)}>
              {href ? <Link href={href}>{inner}</Link> : inner}
            </div>
          );
        })}
        {!items.length ? <p className="text-sm text-muted">{ac(locale, "noNotifications")}</p> : null}
      </div>
    </div>
  );
}
