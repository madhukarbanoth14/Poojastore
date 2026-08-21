import { ProductType, type Product, type ProductKitItem } from '@prisma/client';
import type { AppLocale } from '../../../common/i18n/locale';

export type LineItemMeta = {
  slug: string;
  nameEn: string;
  nameTe: string;
  packEn?: string | null;
  packTe?: string | null;
  quantity: number;
  optional: boolean;
  priceMinor: number;
};

export type SelectableKitItem = {
  key: string;
  slug: string | null;
  productId: string | null;
  kitItemId: string | null;
  name: string;
  pack: string | null;
  quantity: number;
  optional: boolean;
  priceMinor: number;
};

type KitProduct = Pick<Product, 'id' | 'slug' | 'type' | 'priceMinor'> & {
  metadata: unknown;
  kitItems: ProductKitItem[];
};

export function buildSelectableKitItems(params: {
  product: KitProduct;
  locale: AppLocale;
  pricedBySlug?: Map<string, { id: string; priceMinor: number }>;
}): SelectableKitItem[] {
  const { product, locale, pricedBySlug } = params;
  if (product.type !== ProductType.PUJA_KIT) return [];

  const meta = product.metadata as {
    lineItems?: LineItemMeta[];
    i18n?: Record<string, { kitItems?: string[] }>;
  } | null;

  if (meta?.lineItems?.length) {
    return meta.lineItems.map((line) => {
      const match = pricedBySlug?.get(line.slug);
      return {
        key: line.slug,
        slug: line.slug,
        productId: match?.id ?? null,
        kitItemId: null,
        name: locale === 'te' ? line.nameTe : line.nameEn,
        pack: (locale === 'te' ? line.packTe : line.packEn) ?? null,
        quantity: line.quantity,
        optional: line.optional,
        priceMinor: match?.priceMinor ?? line.priceMinor,
      };
    });
  }

  if (!product.kitItems.length) return [];

  const names = meta?.i18n?.[locale]?.kitItems;
  const count = product.kitItems.length;
  const base = Math.floor(product.priceMinor / count);
  const remainder = product.priceMinor - base * count;

  return product.kitItems.map((item, index) => ({
    key: item.id,
    slug: null,
    productId: null,
    kitItemId: item.id,
    name: names?.[index] ?? item.name,
    pack: item.quantity > 1 ? `x${item.quantity}` : null,
    quantity: item.quantity,
    optional: item.isOptional,
    priceMinor: base + (index === count - 1 ? remainder : 0),
  }));
}

export function collectLineItemSlugs(
  products: Array<{ metadata: unknown }>,
): string[] {
  const slugs = new Set<string>();
  for (const product of products) {
    const meta = product.metadata as { lineItems?: LineItemMeta[] } | null;
    for (const line of meta?.lineItems ?? []) {
      slugs.add(line.slug);
    }
  }
  return [...slugs];
}
