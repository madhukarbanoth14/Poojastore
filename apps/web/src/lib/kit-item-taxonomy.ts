import type { Locale } from "@/lib/types";

export type KitItemCategoryId =
  | "essentials"
  | "materials"
  | "fragrance"
  | "food"
  | "threads"
  | "idol";

export type KitItemRole = "essential" | "consumable";

export type GaneshKitPlace = "home" | "office" | "mandapam";
export type GaneshKitSize = "mini" | "mega";

export type GaneshKitVariant = {
  size: GaneshKitSize;
  place: GaneshKitPlace;
};

const CATEGORY_BY_SLUG: Record<string, KitItemCategoryId> = {
  "samagri-kumkum": "essentials",
  "samagri-turmeric": "essentials",
  "samagri-gandham": "essentials",
  "samagri-akshatalu": "essentials",
  "samagri-bukka": "essentials",
  "samagri-gulal": "essentials",
  "samagri-sindoor": "essentials",
  "samagri-astagandham": "essentials",
  "samagri-javadhu": "essentials",
  "samagri-gangajal": "essentials",
  "samagri-gomutra": "essentials",
  "samagri-rice": "essentials",
  "samagri-rice-flour": "essentials",
  "samagri-muggu-colours": "essentials",
  "samagri-matchbox": "materials",
  "samagri-leaf-cups": "materials",
  "samagri-dona-cups": "materials",
  "samagri-cotton-wicks": "materials",
  "samagri-puvvu-wicks": "materials",
  "samagri-jileda-wicks": "materials",
  "samagri-akhanda-deepam": "materials",
  "samagri-oil": "materials",
  "samagri-puja-vastras": "materials",
  "samagri-pooja-book": "materials",
  "samagri-homa-powder": "materials",
  "samagri-samithalu": "materials",
  "samagri-homa-stand": "materials",
  "samagri-purnahuti": "materials",
  "samagri-navadhanyalu": "materials",
  "samagri-isthari-leaves": "materials",
  "samagri-21-patri": "materials",
  "samagri-dhoop-cups": "fragrance",
  "samagri-camphor": "fragrance",
  "samagri-incense": "fragrance",
  "samagri-pacha-karpuram": "fragrance",
  "samagri-attar": "fragrance",
  "samagri-rose-water": "fragrance",
  "samagri-cloves": "fragrance",
  "samagri-cardamom": "fragrance",
  "samagri-jaggery": "food",
  "samagri-rava": "food",
  "samagri-sugar-crystals": "food",
  "samagri-honey": "food",
  "samagri-ghee": "food",
  "samagri-coconuts": "food",
  "samagri-dates": "food",
  "samagri-poha": "food",
  "samagri-betel-leaves": "food",
  "samagri-betel-nuts": "food",
  "samagri-turmeric-roots": "food",
  "samagri-fruits": "food",
  "samagri-flowers": "food",
  "samagri-undrallu": "food",
  "samagri-laddu": "food",
  "samagri-panchamritam": "food",
  "samagri-dry-fruits": "food",
  "samagri-kankana-thread": "threads",
  "samagri-sutli": "threads",
  "samagri-yajnopavita": "threads",
  "samagri-white-thread": "threads",
  "samagri-moli-thread": "threads",
  "samagri-blouse-pieces": "threads",
  "samagri-khandwa": "threads",
  "samagri-dhoti": "threads",
  "samagri-eco-ganesh-idol": "idol",
  "samagri-markatam-ganesh": "idol",
  "samagri-red-cloth": "idol",
  "samagri-paper-umbrella": "idol",
  "samagri-umbrella": "idol",
  "samagri-garland": "idol",
  "samagri-jenu": "idol",
  "samagri-head-band": "idol",
  "samagri-backdrop": "idol",
  "samagri-asanam": "idol",
  "samagri-god-asanam": "idol",
  "samagri-shubh-labh": "idol",
  "samagri-peacock-feathers": "idol",
};

const ESSENTIAL_SLUGS = new Set([
  "samagri-eco-ganesh-idol",
  "samagri-markatam-ganesh",
  "samagri-pooja-book",
  "samagri-kankana-thread",
  "samagri-sutli",
  "samagri-yajnopavita",
  "samagri-white-thread",
  "samagri-moli-thread",
  "samagri-red-cloth",
  "samagri-paper-umbrella",
  "samagri-umbrella",
  "samagri-asanam",
  "samagri-god-asanam",
  "samagri-backdrop",
  "samagri-shubh-labh",
  "samagri-peacock-feathers",
  "samagri-khandwa",
  "samagri-blouse-pieces",
  "samagri-puja-vastras",
  "samagri-akhanda-deepam",
  "samagri-homa-stand",
  "samagri-dhoti",
]);

export const KIT_CATEGORY_ORDER: KitItemCategoryId[] = [
  "essentials",
  "materials",
  "fragrance",
  "food",
  "threads",
  "idol",
];

export function kitItemCategory(slug: string): KitItemCategoryId {
  return CATEGORY_BY_SLUG[slug] ?? "materials";
}

export function kitItemRole(slug: string): KitItemRole {
  return ESSENTIAL_SLUGS.has(slug) ? "essential" : "consumable";
}

export function kitCategoryLabel(id: KitItemCategoryId, locale: Locale) {
  const labels: Record<KitItemCategoryId, { en: string; te: string }> = {
    essentials: { en: "Puja Essentials", te: "పూజా మూలాలు" },
    materials: { en: "Pooja Materials", te: "పూజా సామగ్రి" },
    fragrance: { en: "Fragrance & Offerings", te: "సుగంధం & నైవేద్యం" },
    food: { en: "Food & Naivedyam", te: "ఆహారం & నైవేద్యం" },
    threads: { en: "Threads & Accessories", te: "దారాలు & ఉపకరణాలు" },
    idol: { en: "Idol & Decoration", te: "విగ్రహం & అలంకరణ" },
  };
  return labels[id][locale];
}

export function parseGaneshKitSlug(slug: string): GaneshKitVariant | null {
  const match = /^ganesh-(mini|mega)-(home-puja|office-puja|mandapam)$/.exec(slug);
  if (!match) return null;
  const place =
    match[2] === "home-puja" ? "home" : match[2] === "office-puja" ? "office" : "mandapam";
  return { size: match[1] as GaneshKitSize, place };
}

export function ganeshKitSlug(size: GaneshKitSize, place: GaneshKitPlace) {
  if (place === "mandapam") return `ganesh-${size}-mandapam`;
  return `ganesh-${size}-${place}-puja`;
}

export function ganeshKitHeadline(variant: GaneshKitVariant, locale: Locale) {
  const place = ganeshPlaceCopy(variant.place, locale).title;
  const size = variant.size === "mini" ? (locale === "te" ? "మినీ" : "Mini") : locale === "te" ? "మెగా" : "Mega";
  return locale === "te"
    ? `గణేశ చతుర్థి – ${size} ${place} పూజా కిట్`
    : `Ganesh Chaturthi – ${size} ${place} Pooja Kit`;
}

export function ganeshKitBlurb(place: GaneshKitPlace, locale: Locale) {
  const copy: Record<GaneshKitPlace, { en: string; te: string }> = {
    home: {
      en: "Everything you need for a traditional Ganesh Chaturthi home puja, carefully packed in one convenient kit.",
      te: "ఇంటి గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.",
    },
    office: {
      en: "Everything you need for a traditional Ganesh Chaturthi workplace puja, carefully packed in one convenient kit.",
      te: "ఆఫీసు గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.",
    },
    mandapam: {
      en: "Everything you need for a traditional Ganesh Chaturthi mandapam celebration, carefully packed in one convenient kit.",
      te: "మండపం గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.",
    },
  };
  return copy[place][locale];
}

export function ganeshPlaceCopy(place: GaneshKitPlace, locale: Locale) {
  const copy: Record<GaneshKitPlace, { title: { en: string; te: string }; subtitle: { en: string; te: string } }> = {
    home: {
      title: { en: "Home", te: "ఇల్లు" },
      subtitle: { en: "For family puja", te: "కుటుంబ పూజకు" },
    },
    office: {
      title: { en: "Office", te: "ఆఫీస్" },
      subtitle: { en: "For workplace puja", te: "కార్యాలయ పూజకు" },
    },
    mandapam: {
      title: { en: "Mandapam", te: "మండపం" },
      subtitle: { en: "For community celebration", te: "కమ్యూనిటీ వేడుకకు" },
    },
  };
  return { title: copy[place].title[locale], subtitle: copy[place].subtitle[locale] };
}

export function formatKitQty(pack: string | null | undefined, quantity: number, locale: Locale) {
  const raw = pack?.trim();
  if (raw) return locale === "te" ? raw : prettyPack(raw);
  return `×${quantity > 0 ? quantity : 1}`;
}

function prettyPack(pack: string) {
  let value = pack.trim();
  const grams = /^(\d+(?:\.\d+)?)\s*g$/i.exec(value);
  if (grams) {
    const n = Number(grams[1]);
    if (n >= 1000 && n % 1000 === 0) return `${n / 1000} kg`;
    return `${trimNumber(n)} g`;
  }
  const ml = /^(\d+(?:\.\d+)?)\s*ml$/i.exec(value);
  if (ml) {
    const n = Number(ml[1]);
    if (n >= 1000 && n % 1000 === 0) return `${n / 1000} L`;
    return `${trimNumber(n)} ml`;
  }
  value = value.replace(/\b1 pack\b/i, "1 Pack");
  value = value.replace(/(\d+)\s*packs\b/i, "$1 Packs");
  return value;
}

function trimNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(n);
}

type KitShopOffering = { key: string; nameEn: string; nameTe: string };

export const KIT_OPTIONAL_OFFERINGS: KitShopOffering[] = [
  { key: "samagri-21-patri", nameEn: "21 patri pack", nameTe: "21 రకాల పత్రి" },
  { key: "samagri-isthari-leaves", nameEn: "Durva / isthari leaves", nameTe: "దూర్వా గడ్డి" },
  { key: "samagri-undrallu", nameEn: "Undrallu", nameTe: "ఉండ్రాళ్లు / మోదకం" },
  { key: "samagri-laddu", nameEn: "Laddu", nameTe: "లడ్డూ" },
  { key: "samagri-panchamritam", nameEn: "Panchamritam pack", nameTe: "పంచామృతం ప్యాక్" },
  { key: "samagri-flowers", nameEn: "Loose flowers", nameTe: "విడిపూలు / పువ్వులు" },
];

export function mergeKitOptionalOfferings<T extends { key: string; name?: string; optional?: boolean }>(
  items: T[],
  extras: T[],
) {
  const keys = new Set(items.map((item) => item.key));
  const names = new Set(items.map((item) => (item.name ?? "").toLowerCase()));
  return [
    ...items,
    ...extras.filter((extra) => !keys.has(extra.key) && !names.has(extra.name?.toLowerCase() ?? "")),
  ];
}
