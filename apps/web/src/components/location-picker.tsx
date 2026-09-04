"use client";

import { useRouter } from "next/navigation";
import { writeCity } from "@/lib/client";
import { LOCATION_PRESETS, cityLabel } from "@/lib/location";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export function LocationPicker({
  locale,
  city,
  light = false,
  compact = false,
  cityOnly = false,
}: {
  locale: Locale;
  city: string;
  light?: boolean;
  compact?: boolean;
  cityOnly?: boolean;
}) {
  const router = useRouter();

  return (
    <label
      className={`inline-flex min-w-0 items-center gap-1 ${compact ? "text-xs" : "text-sm"} ${
        light ? "text-cream/85" : "text-body"
      }`}
    >
      <span className="sr-only">{t(locale, "selectLocation")}</span>
      <span aria-hidden className="text-[11px]">📍</span>
      <select
        className={`min-w-0 cursor-pointer bg-transparent font-medium outline-none ${
          compact
            ? "max-w-[8.5rem] py-1 text-xs sm:max-w-[10rem]"
            : "max-w-[16rem] px-3 py-1.5 text-sm"
        } ${
          compact
            ? light
              ? "border-0 text-cream/90"
              : "border-0 text-maroon"
            : light
              ? "rounded-full border border-gold-bright/30 px-3 text-cream hover:border-gold-bright/70"
              : "rounded-full border border-border px-3 text-maroon"
        }`}
        value={city}
        onChange={(e) => {
          writeCity(e.target.value);
          router.refresh();
        }}
        aria-label={t(locale, "selectLocation")}
      >
        {LOCATION_PRESETS.map((loc) => (
          <option key={loc.name} value={loc.name} className="text-maroon">
            {cityOnly ? loc.name : cityLabel(loc.name)}
          </option>
        ))}
      </select>
    </label>
  );
}
