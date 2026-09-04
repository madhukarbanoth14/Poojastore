import Link from "next/link";
import { LocationPicker } from "@/components/location-picker";
import { PageHero } from "@/components/ui";
import { guidanceForDate, guidanceText } from "@/lib/daily-guidance";
import { getCity, getLocale } from "@/lib/locale";
import { timezoneForCity } from "@/lib/location";

export const metadata = {
  title: "Today’s spiritual guidance",
  description: "Weekday-based traditional guidance, mantras, and recommended Pooja.",
};

export default async function GuidancePage() {
  const locale = await getLocale();
  const city = await getCity();
  const entry = guidanceForDate(new Date(), timezoneForCity(city));
  return (
    <>
      <PageHero
        kicker={locale === "te" ? "దైనందిన సేవ" : "Daily seva"}
        title={guidanceText(entry, locale, "ritual")}
        subtitle={guidanceText(entry, locale, "significance")}
      />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <LocationPicker locale={locale} city={city} />
        <article className="card-temple mt-6 space-y-4 p-6">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-maroon uppercase">
            {guidanceText(entry, locale, "deity")}
          </p>
          <p className="leading-relaxed text-body">{guidanceText(entry, locale, "description")}</p>
          <p className="font-medium text-maroon">{guidanceText(entry, locale, "mantra")}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {entry.items.map((item) => (
              <li key={item.en}>{item[locale]}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={entry.recommendedPooja.href} className="btn-orange">
              {entry.recommendedPooja.label[locale]}
            </Link>
            <Link href="/priests" className="btn-outline-gold">
              {locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book a poojari"}
            </Link>
            {entry.relatedProducts.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-maroon">
                {item.label[locale]}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}
