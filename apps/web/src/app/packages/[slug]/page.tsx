import { notFound } from "next/navigation";
import { PageHero, PrimaryButton } from "@/components/ui";
import { getPackage } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const pkg = await getPackage(slug, locale);
  return { title: pkg?.title ?? "Package" };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const pkg = await getPackage(slug, locale);
  if (!pkg) notFound();

  return (
    <>
      <PageHero kicker="Package" title={pkg.title} subtitle={pkg.summary} />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="leading-relaxed text-body">{pkg.description}</p>
        {pkg.packageDiscountMinor > 0 ? (
          <p className="mt-4 font-semibold price">
            Package saving {formatMoney(pkg.packageDiscountMinor, pkg.currency)}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {pkg.kit ? (
            <PrimaryButton href={`/kits/${pkg.kit.slug}`}>View kit</PrimaryButton>
          ) : null}
          {pkg.allowsPriest ? <PrimaryButton href="/priests">Choose a priest</PrimaryButton> : null}
        </div>
        <p className="mt-8 text-sm text-muted">
          Full package checkout with priest slot selection is available after sign-in on the priest
          and kit flows. Combined booking from this page is coming next.
        </p>
      </div>
    </>
  );
}
