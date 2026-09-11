import { KIT_OPTIONAL_OFFERINGS } from "@/lib/kit-item-taxonomy";
import type { Locale, Product } from "@/lib/types";

export type KitOptionalExtra = {
  key: string;
  name: string;
  pack?: string | null;
  quantity: number;
  priceMinor: number;
};

export function kitRequiredKeys(product: Product | null): string[] {
  return (product?.selectableItems ?? [])
    .filter((item) => !item.optional && item.key !== "samagri-copper-pot")
    .map((item) => item.key);
}

export function kitOptionalExtras(product: Product | null, locale: Locale): KitOptionalExtra[] {
  const packed = new Set(kitRequiredKeys(product));
  if (product?.selectableItems?.length) {
    return product.selectableItems
      .filter((item) => item.optional && !packed.has(item.key))
      .map((item) => ({
        key: item.key,
        name: item.name,
        pack: item.pack,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        priceMinor: item.priceMinor ?? 0,
      }));
  }

  return KIT_OPTIONAL_OFFERINGS.filter((extra) => !packed.has(extra.key)).map((extra) => ({
    key: extra.key,
    name: locale === "te" ? extra.nameTe : extra.nameEn,
    quantity: 1,
    priceMinor: extra.priceMinor,
  }));
}

export function kitExtrasHref(slug: string, intent: "buy" | "cart" = "buy") {
  return `/kits/${encodeURIComponent(slug)}/extras?intent=${intent}`;
}
