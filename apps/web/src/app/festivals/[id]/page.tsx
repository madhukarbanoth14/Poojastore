import Link from "next/link";
import { notFound } from "next/navigation";
import { FestivalCommerceLinks } from "@/components/festival-commerce-links";
import { KitShop, type KitShopLine, type KitShopTab } from "@/components/kit-shop";
import { PageHero } from "@/components/ui";
import { getProduct } from "@/lib/api";
import { festivalImage, kitImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import { resolveFestivalCampaign } from "@/lib/festival-campaign";
import { festivalById } from "@/lib/festivals";
import { daysUntil } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fest = festivalById(id);
  return {
    title: fest?.name ?? "Festival",
    description: fest?.description,
  };
}

export default async function FestivalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fest = festivalById(id);
  if (!fest) notFound();
  const locale = await getLocale();
  const title = locale === "te" ? fest.nameTe : fest.name;
  const campaign = resolveFestivalCampaign(fest.id);

  if (!fest.kitTabs.length) {
    return (
      <>
        <PageHero
          compact
          kicker={daysUntil(new Date(fest.target))}
          title={title}
          subtitle={locale === "te" ? fest.dateTe : fest.date}
        />
        <div className="mx-auto max-w-3xl space-y-8 px-5 py-12">
          <article className="card-temple space-y-4 p-6">
            <h2 className="font-display text-2xl text-maroon">
              {locale === "te" ? "అర్థం" : "Meaning"}
            </h2>
            <p className="leading-relaxed text-body">{fest.description}</p>
            <p className="text-sm text-muted">{fest.speciality}</p>
          </article>
          <article className="card-temple space-y-3 p-6">
            <h2 className="font-display text-2xl text-maroon">
              {locale === "te" ? "పూజా విధి" : "Pooja vidhi"}
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-body">
              {fest.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
          <article className="card-temple space-y-3 p-6">
            <h2 className="font-display text-2xl text-maroon">
              {locale === "te" ? "సామగ్రి" : "Required samagri"}
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-body">
              {fest.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <div className="flex flex-wrap gap-3">
            {campaign ? (
              <FestivalCommerceLinks locale={locale} campaign={campaign} />
            ) : (
              <>
                {fest.guideId ? (
                  <Link href={`/poojas/${fest.guideId}`} className="btn-orange">
                    {locale === "te" ? "విధి చూడండి" : "View pooja guide"}
                  </Link>
                ) : null}
                <Link href="/priests" className="btn-outline-gold">
                  {t(locale, "bookPooja")}
                </Link>
                <Link href="/kits" className="text-sm font-semibold text-maroon">
                  {locale === "te" ? "కిట్‌లు చూడండి" : "Shop pooja kits"}
                </Link>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  const products = await Promise.all(fest.kitTabs.map((tab) => getProduct(tab.slug, locale)));
  const fallbackItems: KitShopLine[] = fest.items.map((name) => ({
    key: name,
    name,
    quantity: 1,
  }));
  const tabs: KitShopTab[] = fest.kitTabs.map((tab, index) => {
    const product = products[index] ?? null;
    return {
      id: tab.slug,
      label: locale === "te" ? tab.labelTe : tab.labelEn,
      product,
      imageSrc: festivalImage(fest.id) || kitImage(tab.slug, tab.labelEn),
      imageAlt: title,
      about: fest.description,
      speciality:
        locale === "te"
          ? tab.specialityTe ?? tab.specialityEn ?? fest.speciality
          : tab.specialityEn ?? fest.speciality,
      steps: tab.steps?.length ? tab.steps : fest.steps,
      processDetail: locale === "te" ? tab.processDetailTe : tab.processDetailEn,
      fallbackItems,
    };
  });

  return (
    <>
      <PageHero
        compact
        kicker={daysUntil(new Date(fest.target))}
        title={title}
        subtitle={locale === "te" ? fest.dateTe : fest.date}
      />
      {campaign ? (
        <div className="mx-auto max-w-6xl px-5 pt-6">
          <FestivalCommerceLinks locale={locale} campaign={campaign} />
        </div>
      ) : null}
      <KitShop locale={locale} tabs={tabs} />
    </>
  );
}
