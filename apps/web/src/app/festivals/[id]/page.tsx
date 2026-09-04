import { notFound } from "next/navigation";
import { KitShop, type KitShopLine, type KitShopTab } from "@/components/kit-shop";
import { PageHero } from "@/components/ui";
import { getProduct } from "@/lib/api";
import { festivalImage, kitImage } from "@/lib/catalog-images";
import { festivalById } from "@/lib/festivals";
import { daysUntil } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: festivalById(id).name };
}

export default async function FestivalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const known = ["ganesh", "navratri", "diwali"];
  if (!known.includes(id)) notFound();
  const fest = festivalById(id);
  const locale = await getLocale();
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
      imageAlt: locale === "te" ? fest.nameTe : fest.name,
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
        title={locale === "te" ? fest.nameTe : fest.name}
        subtitle={locale === "te" ? fest.dateTe : fest.date}
      />
      <KitShop locale={locale} tabs={tabs} />
    </>
  );
}
