import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PrimaryButton } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import {
  BASIC_KIT_SLUG,
  loc,
  poojaGuideById,
  poojaGuideCopy,
  poojaGuides,
} from "@/lib/pooja-guides";

export function generateStaticParams() {
  return poojaGuides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = poojaGuideById(id);
  return { title: g?.titleEn ?? "Pooja" };
}

export default async function PoojaGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const g = poojaGuideById(id);
  if (!g) notFound();
  const copy = poojaGuideCopy;
  const title = locale === "te" ? g.titleTe : g.titleEn;
  const note = locale === "te" ? g.noteTe ?? g.noteEn : g.noteEn ?? g.noteTe;

  return (
    <>
      <PageHero kicker={loc(locale, copy.special)} title={title} subtitle={loc(locale, copy.pairHint)} />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <PrimaryButton href={`/kits/${BASIC_KIT_SLUG}`}>{loc(locale, copy.basicKit)}</PrimaryButton>
          {g.deityKitSlug ? (
            <Link href={`/kits/${g.deityKitSlug}`} className="btn-outline-gold text-center">
              {loc(locale, copy.deityKit)}
            </Link>
          ) : null}
          {g.kitSlug && g.kitSlug !== g.deityKitSlug ? (
            <Link href={`/kits/${g.kitSlug}`} className="btn-outline-gold text-center">
              {loc(locale, copy.festivalKit)}
            </Link>
          ) : null}
        </div>

        <section className="card-temple p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-maroon">{loc(locale, copy.special)}</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-body">
            {g.special.map((item) => (
              <li key={item.en}>• {locale === "te" ? item.te : item.en}</li>
            ))}
          </ul>
        </section>

        {note ? <p className="text-sm leading-relaxed text-body">{note}</p> : null}

        <p className="text-sm text-muted">{loc(locale, copy.commonNeeded)}</p>
        <Link href="/poojas" className="text-sm font-semibold text-maroon underline-offset-4 hover:underline">
          {loc(locale, copy.viewCommon)}
        </Link>
        <p className="text-xs leading-relaxed text-muted">{loc(locale, copy.disclaimer)}</p>
      </div>
    </>
  );
}
