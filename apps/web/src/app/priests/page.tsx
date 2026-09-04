import Link from "next/link";
import { EmptyNote, PageHero } from "@/components/ui";
import { listPriests } from "@/lib/api";
import { formatMoney, initials } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "Book a priest" };

export default async function PriestsPage() {
  const locale = await getLocale();
  const priests = await listPriests(locale);
  return (
    <>
      <PageHero
        kicker="Verified pandits"
        title="Book a priest"
        subtitle="Home visits and online consultations with experienced, background-verified poojaris."
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
                <p className="text-sm text-gold">★ {p.ratingAvg.toFixed(1)} ({p.ratingCount})</p>
                <p className="font-semibold price">{formatMoney(p.basePriceMinor, p.currency)}</p>
                <span className="mt-2 inline-block btn-orange btn-orange-sm">
                  Book
                </span>
              </div>
            </Link>
          ))
        ) : (
          <EmptyNote>Priest directory loads from the live API.</EmptyNote>
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
