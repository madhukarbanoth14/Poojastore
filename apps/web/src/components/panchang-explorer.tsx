"use client";

import { EmptyNote, PageHero } from "@/components/ui";
import {
  PanchangAlmanacCard,
  PanchangDateField,
  usePanchangDate,
} from "@/components/panchang-almanac-card";
import { pl } from "@/lib/panchang-copy";
import type { Locale, PanchangToday } from "@/lib/types";

export function PanchangExplorer({
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

  return (
    <>
      <PageHero
        kicker={locale === "te" ? "దైనందిన మార్గదర్శకం" : "Daily guidance"}
        title={locale === "te" ? "దిన పంచాంగం" : "Daily panchangam"}
        subtitle={
          panchang?.disclaimer ??
          "Civil astronomical approximations for general guidance. Consult a qualified pandit for ritual timing."
        }
      />
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <PanchangDateField
            value={date}
            min={min}
            max={max}
            onChange={setDate}
            locale={locale}
          />
          {date !== today ? (
            <button
              type="button"
              className="text-sm font-semibold text-maroon underline-offset-4 hover:underline"
              onClick={() => setDate(today)}
            >
              {pl(locale, "today")}
            </button>
          ) : null}
        </div>
        {loading && !panchang ? (
          <EmptyNote>Loading panchang…</EmptyNote>
        ) : panchang ? (
          <PanchangAlmanacCard panchang={panchang} locale={locale} />
        ) : (
          <EmptyNote>Panchang needs the API (`GET /panchang/:date`).</EmptyNote>
        )}
      </div>
    </>
  );
}
