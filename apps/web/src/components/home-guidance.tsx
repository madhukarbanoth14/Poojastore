import Link from "next/link";
import { guidanceForDate, guidanceText } from "@/lib/daily-guidance";
import { timezoneForCity } from "@/lib/location";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

export function HomeGuidanceCards({ locale, city }: { locale: Locale; city: string }) {
  const entry = guidanceForDate(new Date(), timezoneForCity(city));
  return (
    <>
      <article className="card-temple p-6">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-maroon uppercase">
          {t(locale, "spiritualGuidance")}
        </p>
        <h3 className="font-display mt-2 text-2xl text-maroon">{guidanceText(entry, locale, "deity")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-body">{guidanceText(entry, locale, "description")}</p>
        <p className="mt-4 text-sm font-medium text-maroon">{guidanceText(entry, locale, "mantra")}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {entry.items.map((item) => (
            <li key={item.en}>{item[locale]}</li>
          ))}
        </ul>
        <Link href="/guidance" className="mt-5 inline-block text-sm font-semibold text-maroon">
          {locale === "te" ? "పూర్తి మార్గదర్శకం →" : "Read today’s guidance →"}
        </Link>
      </article>
      <article className="card-temple p-6">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-maroon uppercase">
          {t(locale, "todaysRitual")}
        </p>
        <h3 className="font-display mt-2 text-2xl text-maroon">{guidanceText(entry, locale, "ritual")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-body">{guidanceText(entry, locale, "significance")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={entry.recommendedPooja.href} className="btn-orange btn-orange-sm">
            {locale === "te" ? "పూజ చూడండి" : "View ritual"}
          </Link>
          <Link href="/priests" className="btn-outline-gold btn-orange-sm">
            {locale === "te" ? "ఈ పూజ బుక్ చేయండి" : "Book this Pooja"}
          </Link>
          <Link href={entry.relatedProducts[0]?.href ?? "/kits"} className="text-sm font-semibold text-maroon">
            {locale === "te" ? "సామగ్రి కొనండి" : "Buy required items"}
          </Link>
        </div>
      </article>
    </>
  );
}
