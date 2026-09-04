"use client";

import { useAuth } from "@/components/auth-provider";
import { timezoneForCity } from "@/lib/location";
import type { Locale } from "@/lib/types";

function greeting(locale: Locale, timeZone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone,
    }).formatToParts(new Date()).find((part) => part.type === "hour")?.value ?? 12,
  );
  if (locale === "te") {
    if (hour < 12) return "శుభోదయం";
    if (hour < 17) return "శుభ మధ్యాహ్నం";
    return "శుభ సాయంత్రం";
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeGreeting({ locale, city }: { locale: Locale; city: string }) {
  const { user, ready } = useAuth();
  const first = user?.fullName?.trim().split(/\s+/)[0];
  const hello = greeting(locale, timezoneForCity(city));
  const line = ready && first ? `${hello}, ${first} 🙏` : `${hello} 🙏`;

  return (
    <div>
      <p className="font-display text-2xl leading-tight text-cream md:text-3xl">{line}</p>
    </div>
  );
}
