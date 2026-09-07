"use client";

import Link from "next/link";
import { LotusDivider } from "@/components/ornaments";
import { GoldButton, Kicker } from "@/components/ui";
import { PanchangDateField, usePanchangDate } from "@/components/panchang-almanac-card";
import { t } from "@/lib/copy";
import { cityLabel, timezoneForCity } from "@/lib/location";
import {
  dateShortLabel,
  formatAlmanacTime,
  localizeTerm,
  pl,
  tithiShort,
  windowPhrase,
} from "@/lib/panchang-copy";
import type { Locale, PanchangToday } from "@/lib/types";

function panchangLabel(value?: string, fallback = "—") {
  return value?.trim() || fallback;
}

export function HomePanchangPanel({
  locale,
  initial,
  city,
  shopCta,
}: {
  locale: Locale;
  initial: PanchangToday | null;
  city: string;
  shopCta?: { href: string; label: string };
}) {
  const { date, setDate, panchang, loading, today, min, max } = usePanchangDate(
    initial,
    city,
    timezoneForCity(city),
  );
  const tithi = tithiShort(panchang?.tithi, locale);
  const dateLine = [
    dateShortLabel(panchang?.date ?? date, locale),
    cityLabel(city, locale),
  ]
    .filter(Boolean)
    .join(" · ");
  const isToday = date === today;

  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-bright/35 bg-maroon-ink/30 px-3 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-orange" />
          <Kicker light>{isToday ? t(locale, "todayPanchang") : panchangLabel(date)}</Kicker>
        </div>
        <PanchangDateField
          value={date}
          min={min}
          max={max}
          onChange={setDate}
          locale={locale}
          light
        />
      </div>
      <h1 className="font-display mt-5 text-[2.4rem] leading-[1.08] text-cream md:text-[3.2rem]">
        {loading ? "…" : tithi}
      </h1>
      <LotusDivider light className="mt-4" />
      <p className="mt-3 text-base text-cream/80 md:text-lg">
        {localizeTerm(panchang?.nakshatra, locale)}
        {dateLine ? ` · ${dateLine}` : ""}
      </p>

      <dl className="hero-almanac">
        <div>
          <dt>{pl(locale, "yoga")}</dt>
          <dd>{localizeTerm(panchang?.yoga, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "karana")}</dt>
          <dd>{localizeTerm(panchang?.karana, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "sunrise")}</dt>
          <dd>{formatAlmanacTime(panchang?.sunrise, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "sunset")}</dt>
          <dd>{formatAlmanacTime(panchang?.sunset, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "varjyam")}</dt>
          <dd>{windowPhrase(panchang?.varjyam, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "durmuhurtham")}</dt>
          <dd>{windowPhrase(panchang?.durmuhurtham, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "rahu")}</dt>
          <dd>{windowPhrase(panchang?.rahuKalam, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "yama")}</dt>
          <dd>{windowPhrase(panchang?.yamagandam, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "gulika")}</dt>
          <dd>{windowPhrase(panchang?.gulikaKalam, locale)}</dd>
        </div>
        <div>
          <dt>{pl(locale, "abhijit")}</dt>
          <dd>{windowPhrase(panchang?.abhijitMuhurtham, locale)}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/panchang?date=${date}`} className="btn-orange">
          {locale === "te" ? "పూర్తి పంచాంగం" : "View full Panchangam"}
        </Link>
        {shopCta ? (
          <GoldButton href={shopCta.href}>{shopCta.label}</GoldButton>
        ) : (
          <GoldButton href="/poojas">{t(locale, "bookPooja")}</GoldButton>
        )}
      </div>
    </div>
  );
}
