import Link from "next/link";
import { EmptyNote, PageHero } from "@/components/ui";
import { listPriests } from "@/lib/api";
import { formatMoney, initials } from "@/lib/format";
import { getCity, getLocale } from "@/lib/locale";
import { marketForCity } from "@/lib/location";

export const metadata = {
  title: "Book a poojari",
  description: "Book a poojari for home visits or online consultations. Listings come from the live directory.",
};

export default async function PriestsPage() {
  const locale = await getLocale();
  const city = await getCity();
  const priests = await listPriests(locale, marketForCity(city));
  return (
    <>
      <PageHero
        kicker={locale === "te" ? "పూజారులు" : "Poojaris"}
        title={locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book a poojari"}
        subtitle={
          locale === "te"
            ? "ఇంటి సేవ మరియు ఆన్‌లైన్ సంప్రదింపులు. జాబితా లైవ్ డైరెక్టరీ నుంచి."
            : "Home visits and online consultations from the live poojari directory."
        }
      />
      <div className="mx-auto max-w-6xl space-y-4 px-5 py-12">
        {priests.length ? (
          priests.map((p) => (
            <Link key={p.id} href={`/priests/${p.slug}`} className="card-temple flex flex-wrap items-center gap-5 p-5">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-orange font-bold text-maroon">
                {initials(p.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold">{p.fullName}</h2>
                <p className="text-sm text-muted">
                  {p.city}, {p.state} · {p.yearsExperience} years · {p.languages.join(", ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.specializations.slice(0, 3).map((s) => (
                    <span key={s} className="chip-ps">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                {p.ratingCount > 0 ? (
                  <p className="text-sm text-gold">
                    ★ {p.ratingAvg.toFixed(1)} ({p.ratingCount})
                  </p>
                ) : null}
                <p className="font-semibold price">{formatMoney(p.basePriceMinor, p.currency)}</p>
                <span className="mt-2 inline-block btn-orange btn-orange-sm">Book</span>
              </div>
            </Link>
          ))
        ) : (
          <EmptyNote>
            {locale === "te"
              ? "ఈ ప్రాంతంలో పూజారులు ఇంకా జాబితా కాలేదు."
              : "No poojaris listed for this region yet."}
          </EmptyNote>
        )}
        <Link href="/priests/apply" className="card-temple block bg-blush p-5">
          <p className="font-display text-lg font-semibold">Are you a pujari?</p>
          <p className="mt-1 text-sm text-muted">
            Fill a short onboarding form so we can add you to Pavitra Seva.
          </p>
        </Link>
      </div>
    </>
  );
}
