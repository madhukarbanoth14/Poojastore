"use client";

import Link from "next/link";
import { LotusDivider } from "@/components/ornaments";
import { GoldButton, Kicker } from "@/components/ui";
import { PanchangDateField, usePanchangDate } from "@/components/panchang-almanac-card";
import { t } from "@/lib/copy";
import { localizeTerm, tithiShort } from "@/lib/panchang-copy";
import type { Locale, PanchangToday } from "@/lib/types";

function panchangLabel(value?: string, fallback = "—") {
  return value?.trim() || fallback;
}

export function HomePanchangPanel({
  locale,
  initial,
}: {
  locale: Locale;
  initial: PanchangToday | null;
}) {
  const city = initial?.cityName ?? "Hyderabad";
  const { date, setDate, panchang, loading, today, min, max } = usePanchangDate(
    initial,
    city,
  );
  const tithi = tithiShort(panchang?.tithi, locale);
  const labeled =
    panchang && typeof panchang.dateLabel === "string" ? panchang.dateLabel : null;
  const dateLine = [labeled || panchang?.date, panchang?.cityName ?? city]
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
      <h1 className="font-display mt-5 text-[2.7rem] leading-[1.05] text-cream md:text-[3.6rem]">
        {loading ? "…" : tithi}
      </h1>
      <LotusDivider light className="mt-5" />
      <p className="mt-4 text-base text-cream/80 md:text-lg">
        {localizeTerm(panchang?.nakshatra, locale)}
        {dateLine ? ` · ${dateLine}` : ""}
      </p>

      <dl className="hero-almanac">
        <div>
          <dt>{locale === "te" ? "సూర్యోదయం" : "Sunrise"}</dt>
          <dd>{panchangLabel(panchang?.sunrise)}</dd>
        </div>
        <div>
          <dt>{locale === "te" ? "సూర్యాస్తమయం" : "Sunset"}</dt>
          <dd>{panchangLabel(panchang?.sunset)}</dd>
        </div>
        <div>
          <dt>{locale === "te" ? "యోగం" : "Yoga"}</dt>
          <dd>{localizeTerm(panchang?.yoga, locale)}</dd>
        </div>
        <div>
          <dt>{locale === "te" ? "కరణం" : "Karana"}</dt>
          <dd>{localizeTerm(panchang?.karana, locale)}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/panchang?date=${date}`} className="btn-orange">
          {locale === "te" ? "పూర్తి పంచాంగం" : "Full panchang"}
        </Link>
        <GoldButton href="/kits">{t(locale, "shopKits")}</GoldButton>
      </div>
    </div>
  );
}
