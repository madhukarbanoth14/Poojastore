import Link from "next/link";
import { LotusDivider } from "@/components/ornaments";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export function PriestComingSoon({
  locale,
  compact = false,
  showApply = false,
}: {
  locale: Locale;
  compact?: boolean;
  showApply?: boolean;
}) {
  return (
    <div className={`card-temple text-center ${compact ? "p-6" : "px-8 py-14"}`}>
      <LotusDivider className="mx-auto mb-4" />
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {t(locale, "comingSoon")}
      </p>
      <h2 className={`font-display mt-3 text-maroon ${compact ? "text-2xl" : "text-3xl"}`}>
        {t(locale, "priestComingSoonTitle")}
      </h2>
      <p className={`mx-auto mt-4 max-w-md leading-relaxed text-muted ${compact ? "text-sm" : "text-sm md:text-base"}`}>
        {t(locale, "priestComingSoonBody")}
      </p>
      <Link href="/kits" className="btn-orange mt-8 inline-flex">
        {t(locale, "shopKits")}
      </Link>
      {showApply ? (
        <p className="mt-6 text-sm text-muted">
          {locale === "te" ? "మీరు పూజారియా? " : "Are you a pujari? "}
          <Link href="/priests/apply" className="font-semibold text-maroon">
            {locale === "te" ? "నమోదు చేసుకోండి" : "Join the directory"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
