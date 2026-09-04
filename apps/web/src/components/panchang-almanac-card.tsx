"use client";

import { useEffect, useMemo, useState } from "react";
import { clientFetch } from "@/lib/client";
import {
  addDaysIso,
  ayanaRithuLine,
  formatAlmanacTime,
  karanaValue,
  masamPakshaLine,
  pl,
  samvatsaramLine,
  tithiShort,
  todayIso,
  untilPhrase,
  weekdayDateBanner,
  windowPhrase,
  localizeTerm,
} from "@/lib/panchang-copy";
import type { Locale, PanchangToday } from "@/lib/types";

type Window = { start?: string; end?: string };

const ICONS: Record<string, string> = {
  tithi: "☽",
  varam: "▦",
  nakshatra: "✦",
  yoga: "☉",
  karana: "🐚",
  varjyam: "⊘",
  durmuhurtham: "☠",
  amrit: "🏺",
  rahu: "𓆙",
  yama: "⚖",
  surya: "☀",
  chandra: "☾",
  sunrise: "☀",
  sunset: "🌤",
};

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="panchang-row">
      <span className="panchang-row-icon" aria-hidden>
        {icon}
      </span>
      <span className="panchang-row-label">{label}</span>
      <span className="panchang-row-value">{value}</span>
    </div>
  );
}

export function PanchangDateField({
  value,
  min,
  max,
  onChange,
  locale,
  light = false,
}: {
  value: string;
  min: string;
  max: string;
  onChange: (next: string) => void;
  locale: Locale;
  light?: boolean;
}) {
  return (
    <label className={`panchang-date ${light ? "panchang-date-light" : ""}`}>
      <span>{pl(locale, "pickDate")}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function PanchangAlmanacCard({
  panchang,
  locale,
}: {
  panchang: PanchangToday;
  locale: Locale;
}) {
  const tithiUntil = untilPhrase(panchang.tithiEndsAt as string | undefined, locale);
  const nakUntil = untilPhrase(panchang.nakshatraEndsAt as string | undefined, locale);
  const yogaUntil = untilPhrase(panchang.yogaEndsAt as string | undefined, locale);
  const tithi = tithiShort(panchang.tithi, locale);
  const nak = localizeTerm(panchang.nakshatra, locale);
  const yoga = localizeTerm(panchang.yoga, locale);
  const varam = localizeTerm(panchang.weekday as string | undefined, locale);

  return (
    <article className="panchang-sheet">
      <header className="panchang-sheet-date">{weekdayDateBanner(panchang, locale)}</header>
      {panchang.samvatsaram ? (
        <p className="panchang-sheet-year">
          {samvatsaramLine(panchang.samvatsaram as string | undefined, locale)}
        </p>
      ) : null}
      {panchang.ayana || panchang.rithu ? (
        <p className="panchang-sheet-ayana">
          {ayanaRithuLine(
            panchang.ayana as string | undefined,
            panchang.rithu as string | undefined,
            locale,
          )}
        </p>
      ) : null}
      {panchang.masam || panchang.paksha ? (
        <p className="panchang-sheet-masa">
          {masamPakshaLine(
            panchang.masam as string | undefined,
            panchang.paksha as string | undefined,
            locale,
          )}
        </p>
      ) : null}
      <div className="panchang-sheet-body">
        <Row
          icon={ICONS.tithi}
          label={pl(locale, "tithi")}
          value={tithiUntil ? `${tithi} ${tithiUntil}` : tithi}
        />
        <Row icon={ICONS.varam} label={pl(locale, "varam")} value={varam} />
        <Row
          icon={ICONS.nakshatra}
          label={pl(locale, "nakshatra")}
          value={nakUntil ? `${nak} ${nakUntil}` : nak}
        />
        <Row
          icon={ICONS.yoga}
          label={pl(locale, "yoga")}
          value={yogaUntil ? `${yoga} ${yogaUntil}` : yoga}
        />
        <Row icon={ICONS.karana} label={pl(locale, "karana")} value={karanaValue(panchang, locale)} />
        <Row
          icon={ICONS.varjyam}
          label={pl(locale, "varjyam")}
          value={windowPhrase(panchang.varjyam as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.durmuhurtham}
          label={pl(locale, "durmuhurtham")}
          value={windowPhrase(panchang.durmuhurtham as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.amrit}
          label={pl(locale, "amrit")}
          value={windowPhrase(panchang.amritKalam as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.rahu}
          label={pl(locale, "rahu")}
          value={windowPhrase(panchang.rahuKalam as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.yama}
          label={pl(locale, "yama")}
          value={windowPhrase(panchang.yamagandam as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.rahu}
          label={pl(locale, "gulika")}
          value={windowPhrase(panchang.gulikaKalam as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.amrit}
          label={pl(locale, "abhijit")}
          value={windowPhrase(panchang.abhijitMuhurtham as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.yoga}
          label={pl(locale, "subha")}
          value={windowPhrase(panchang.subhaGadiyalu as Window | undefined, locale)}
        />
        <Row
          icon={ICONS.surya}
          label={pl(locale, "suryaRashi")}
          value={localizeTerm(panchang.suryaRashi as string | undefined, locale)}
        />
        <Row
          icon={ICONS.chandra}
          label={pl(locale, "chandraRashi")}
          value={localizeTerm(panchang.chandraRashi as string | undefined, locale)}
        />
        <Row
          icon={ICONS.sunrise}
          label={pl(locale, "sunrise")}
          value={formatAlmanacTime(panchang.sunrise, locale)}
        />
        <Row
          icon={ICONS.sunset}
          label={pl(locale, "sunset")}
          value={formatAlmanacTime(panchang.sunset, locale)}
        />
      </div>
      {panchang.specialNote ? (
        <p className="panchang-sheet-note">{panchang.specialNote}</p>
      ) : null}
    </article>
  );
}

export function usePanchangDate(
  initial: PanchangToday | null,
  city = "Hyderabad",
  timeZone = "Asia/Kolkata",
) {
  const today = useMemo(() => todayIso(timeZone), [timeZone]);
  const max = useMemo(() => addDaysIso(today, 90), [today]);
  const startDate =
    (typeof initial?.date === "string" && initial.date) || today;
  const min = startDate < today ? startDate : today;
  const [date, setDate] = useState(startDate);
  const [panchang, setPanchang] = useState<PanchangToday | null>(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date === startDate && initial) {
      setPanchang(initial);
      return;
    }
    let cancelled = false;
    setLoading(true);
    clientFetch<PanchangToday>(
      `/panchang/${encodeURIComponent(date)}?city=${encodeURIComponent(city)}`,
    )
      .then((data) => {
        if (!cancelled) setPanchang(data);
      })
      .catch(() => {
        if (!cancelled) setPanchang(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, date, initial, startDate]);

  return { date, setDate, panchang, loading, today, min, max };
}
