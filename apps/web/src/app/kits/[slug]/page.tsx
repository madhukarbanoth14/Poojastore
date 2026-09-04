import { notFound } from "next/navigation";
import { KitShop, type KitShopTab } from "@/components/kit-shop";
import { PageHero } from "@/components/ui";
import { getProduct } from "@/lib/api";
import { festivalImage, kitImage } from "@/lib/catalog-images";
import { festivalForKitSlug } from "@/lib/festivals";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug, locale);
  return { title: product?.name ?? "Kit" };
}

export default async function KitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const family = festivalForKitSlug(slug);
  const product = await getProduct(slug, locale);
  if (!product && !family) notFound();

  let tabs: KitShopTab[];
  if (family) {
    const products = await Promise.all(family.kitTabs.map((tab) => getProduct(tab.slug, locale)));
    tabs = family.kitTabs.map((tab, index) => {
      const kit = products[index] ?? (tab.slug === slug ? product : null);
      return {
        id: tab.slug,
        label: locale === "te" ? tab.labelTe : tab.labelEn,
        product: kit,
        imageSrc:
          kit?.imageUrl ||
          festivalImage(family.id) ||
          kitImage(tab.slug, tab.labelEn),
        imageAlt: kit?.name ?? (locale === "te" ? family.nameTe : family.name),
        about: family.description,
        speciality:
          locale === "te"
            ? tab.specialityTe ?? tab.specialityEn ?? family.speciality
            : tab.specialityEn ?? family.speciality,
        steps: tab.steps?.length ? tab.steps : family.steps,
        processDetail: locale === "te" ? tab.processDetailTe : tab.processDetailEn,
        fallbackItems: family.items.map((name) => ({ key: name, name, quantity: 1 })),
      };
    });
  } else if (product) {
    tabs = [
      {
        id: product.slug,
        label: product.name,
        product,
        imageSrc: product.imageUrl || kitImage(product.slug, product.name),
        imageAlt: product.name,
        steps: [],
      },
    ];
  } else {
    notFound();
  }

  const title =
    family && locale === "te"
      ? family.nameTe
      : family
        ? family.name
        : product!.name;

  return (
    <>
      <PageHero
        compact
        kicker={locale === "te" ? "పూజా కిట్" : "Pooja kit"}
        title={title}
        subtitle={family ? (locale === "te" ? family.dateTe : family.date) : undefined}
      />
      <KitShop locale={locale} tabs={tabs} initialTabId={slug} />
    </>
  );
}
