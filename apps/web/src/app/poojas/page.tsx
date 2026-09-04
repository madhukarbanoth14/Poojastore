import Link from "next/link";
import { PageHero, PrimaryButton } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import {
  BASIC_KIT_SLUG,
  commonSamagri,
  guidesByKind,
  kindLabels,
  loc,
  poojaGuideCopy,
  type PoojaKind,
} from "@/lib/pooja-guides";

export const metadata = {
  title: "Poojas",
  description: "Daily, festival, and vratham Pooja guides with samagri lists and booking.",
};

const KINDS: PoojaKind[] = ["deity", "festival", "vratham"];

export default async function PoojasPage() {
  const locale = await getLocale();
  const copy = poojaGuideCopy;

  return (
    <>
      <PageHero kicker="Shop" title={loc(locale, copy.title)} subtitle={loc(locale, copy.subtitle)} />
      <div className="mx-auto max-w-6xl space-y-14 px-5 py-12">
        <section className="card-temple flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-wrap gap-3">
            <PrimaryButton href={`/kits/${BASIC_KIT_SLUG}`}>{loc(locale, copy.basicKit)}</PrimaryButton>
            <Link href="/priests" className="btn-orange">
              {locale === "te" ? "పూజ బుక్ చేయండి" : "Book a Pooja"}
            </Link>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted">{loc(locale, copy.disclaimer)}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-maroon">{loc(locale, copy.common)}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{loc(locale, copy.pairHint)}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {commonSamagri.map((group) => (
              <div key={group.titleEn} className="card-temple p-5">
                <h3 className="font-display text-xl font-semibold text-maroon">
                  {locale === "te" ? group.titleTe : group.titleEn}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-body">
                  {group.items.map((item) => (
                    <li key={item.en}>• {locale === "te" ? item.te : item.en}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {KINDS.map((kind) => {
          const guides = guidesByKind(kind);
          return (
            <section key={kind}>
              <h2 className="font-display text-2xl font-semibold text-maroon">
                {loc(locale, kindLabels[kind])}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((g) => (
                  <Link key={g.id} href={`/poojas/${g.id}`} className="card-temple block p-5">
                    <p className="font-display text-lg font-semibold text-maroon">
                      {locale === "te" ? g.titleTe : g.titleEn}
                    </p>
                    <p className="mt-1 text-xs text-muted">{g.special.length} {locale === "te" ? "ప్రత్యేక వస్తువులు" : "special items"}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
