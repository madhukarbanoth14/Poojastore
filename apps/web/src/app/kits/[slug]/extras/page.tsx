import { notFound } from "next/navigation";
import { KitExtrasChooser } from "@/components/kit-extras-chooser";
import { getProduct } from "@/lib/api";
import { kitOptionalExtras } from "@/lib/kit-optional-extras";
import { getLocale } from "@/lib/locale";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug, locale);
  return {
    title: product
      ? locale === "te"
        ? `${product.name} — ఐచ్ఛిక వస్తువులు`
        : `${product.name} — Optional extras`
      : "Optional extras",
  };
}

export default async function KitExtrasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { slug } = await params;
  const { intent } = await searchParams;
  const locale = await getLocale();
  const product = await getProduct(slug, locale);
  if (!product) notFound();

  return (
    <KitExtrasChooser
      locale={locale}
      product={product}
      extras={kitOptionalExtras(product, locale)}
      intent={intent === "cart" ? "cart" : "buy"}
      backHref={`/kits/${product.slug}`}
    />
  );
}
