import { notFound } from "next/navigation";
import { PageHero, PrimaryButton } from "@/components/ui";
import { getVidhi } from "@/lib/api";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const vidhi = await getVidhi(slug, locale);
  return { title: vidhi?.title ?? "Vidhi" };
}

export default async function VidhiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const vidhi = await getVidhi(slug, locale);
  if (!vidhi) notFound();

  return (
    <>
      <PageHero kicker={vidhi.category} title={vidhi.title} subtitle={vidhi.summary} />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-10">
        {vidhi.description ? <p className="leading-relaxed text-body">{vidhi.description}</p> : null}
        {vidhi.bestTimeHint ? (
          <p className="rounded-xl border border-dashed border-gold bg-chip/40 px-4 py-3 text-sm">
            Best time: {vidhi.bestTimeHint}
          </p>
        ) : null}
        {vidhi.steps?.length ? (
          <ol className="space-y-4">
            {vidhi.steps.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-maroon text-xs font-bold text-cream">
                  {step.stepNumber}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm leading-relaxed text-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
        {vidhi.relatedProductSlug ? (
          <PrimaryButton href={`/kits/${vidhi.relatedProductSlug}`}>Shop related kit</PrimaryButton>
        ) : null}
      </div>
    </>
  );
}
