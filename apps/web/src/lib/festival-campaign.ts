import { festivalImage } from "./catalog-images";
import { festivalById, type FestivalGuide } from "./festivals";
import type { Locale, Product } from "./types";

export type LocalizedText = { en: string; te: string };

export type FestivalCampaignConfig = {
  id: string;
  poojaGuideId?: string;
  extraKitSlugs?: string[];
  needles: string[];
  kicker: LocalizedText;
  headline: LocalizedText;
  supporting: LocalizedText;
  heroShopCta: LocalizedText;
  shopCta: LocalizedText;
  viewFestivalCta: LocalizedText;
  kitsTitle: LocalizedText;
  viewAllKits: LocalizedText;
  poojasTitle: LocalizedText;
  bookPoojaCta: LocalizedText;
  findPriestCta: LocalizedText;
  vidhiCta: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
};

export type ActiveFestivalCampaign = FestivalCampaignConfig & {
  festival: FestivalGuide;
  shopHref: string;
  festivalHref: string;
  poojaHref: string;
  priestHref: string;
  vidhiHref: string;
  kitSlugs: string[];
  image: string;
};

/**
 * Switch the live homepage / kits campaign.
 * Use a festival id from `upcomingFestivals` (ganesh, navratri, diwali, …)
 * or `null` to hide the promo without deleting the campaign configs.
 */
export const ACTIVE_FESTIVAL_ID: string | null = "ganesh";

const CAMPAIGNS: Record<string, FestivalCampaignConfig> = {
  ganesh: {
    id: "ganesh",
    poojaGuideId: "ganapati",
    extraKitSlugs: [
      "ganesh-chaturthi-home-puja",
      "ganesh-chaturthi-pooja-samagri",
      "ganapati-special-samagri",
    ],
    needles: ["ganesh", "ganapati", "vinayaka"],
    kicker: { en: "Ganesh Chaturthi Special", te: "వినాయక చవితి ప్రత్యేకం" },
    headline: {
      en: "Everything You Need for Ganesh Pooja",
      te: "గణేష్ పూజకు కావాల్సినవన్నీ ఒకే చోట",
    },
    supporting: {
      en: "Complete Pooja Kits & Samagri for your Ganesh Chaturthi celebrations.",
      te: "వినాయక చవితికి సంపూర్ణ పూజా కిట్‌లు, సామగ్రి.",
    },
    heroShopCta: { en: "Shop Home Puja Kit", te: "ఇంటి పూజ కిట్" },
    shopCta: { en: "Shop Ganesh Pooja Kits", te: "గణేష్ పూజ కిట్‌లు" },
    viewFestivalCta: { en: "View Ganesh Pooja", te: "గణేష్ పూజ చూడండి" },
    kitsTitle: { en: "Popular Ganesh Pooja Kits", te: "ప్రముఖ గణేష్ పూజా కిట్‌లు" },
    viewAllKits: { en: "View all Ganesh kits", te: "గణేష్ కిట్‌లన్నీ" },
    poojasTitle: { en: "Ganesh Chaturthi Poojas", te: "వినాయక చవితి పూజలు" },
    bookPoojaCta: { en: "Book Ganesh Pooja", te: "గణేష్ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Ganesh Chaturthi Pooja Kits & Pooja Services",
      te: "పవిత్ర సేవ | వినాయక చవితి పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Ganesh Chaturthi Pooja Kits and Samagri, book Poojas and discover spiritual services with Pavitra Seva.",
      te: "వినాయక చవితి పూజా కిట్‌లు, సామగ్రి, పూజ బుకింగ్ — పవిత్ర సేవ.",
    },
  },
  navratri: {
    id: "navratri",
    poojaGuideId: "navratri",
    needles: ["navratri", "durga", "dasara"],
    kicker: { en: "Navratri Special", te: "నవరాత్రి ప్రత్యేకం" },
    headline: {
      en: "Everything You Need for Navratri Pooja",
      te: "నవరాత్రి పూజకు కావాల్సినవన్నీ",
    },
    supporting: {
      en: "Kalash, samagri, and complete kits for nine nights of Devi worship.",
      te: "తొమ్మిది రాత్రుల దేవీ పూజకు కలశం, సామగ్రి, కిట్‌లు.",
    },
    heroShopCta: { en: "Shop Navratri Kit", te: "నవరాత్రి కిట్" },
    shopCta: { en: "Shop Navratri Kits", te: "నవరాత్రి కిట్‌లు" },
    viewFestivalCta: { en: "View Navratri Pooja", te: "నవరాత్రి చూడండి" },
    kitsTitle: { en: "Popular Navratri Pooja Kits", te: "నవరాత్రి పూజా కిట్‌లు" },
    viewAllKits: { en: "View all Navratri kits", te: "నవరాత్రి కిట్‌లన్నీ" },
    poojasTitle: { en: "Navratri Poojas", te: "నవరాత్రి పూజలు" },
    bookPoojaCta: { en: "Book Navratri Pooja", te: "నవరాత్రి పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Navratri Pooja Kits & Pooja Services",
      te: "పవిత్ర సేవ | నవరాత్రి పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Navratri Pooja Kits and Samagri, and book Poojas with Pavitra Seva.",
      te: "నవరాత్రి పూజా కిట్‌లు, సామగ్రి, పూజ బుకింగ్ — పవిత్ర సేవ.",
    },
  },
  diwali: {
    id: "diwali",
    poojaGuideId: "diwali",
    extraKitSlugs: ["lakshmi-special-samagri"],
    needles: ["diwali", "deepavali", "lakshmi"],
    kicker: { en: "Diwali Special", te: "దీపావళి ప్రత్యేకం" },
    headline: {
      en: "Everything You Need for Lakshmi Pooja",
      te: "లక్ష్మీ పూజకు కావాల్సినవన్నీ",
    },
    supporting: {
      en: "Diyas, samagri, and complete kits for your Diwali Lakshmi Pooja.",
      te: "దీపావళి లక్ష్మీ పూజకు దీపాలు, సామగ్రి, కిట్‌లు.",
    },
    heroShopCta: { en: "Shop Diwali Pooja Kit", te: "దీపావళి కిట్" },
    shopCta: { en: "Shop Diwali Kits", te: "దీపావళి కిట్‌లు" },
    viewFestivalCta: { en: "View Lakshmi Pooja", te: "లక్ష్మీ పూజ చూడండి" },
    kitsTitle: { en: "Popular Diwali Pooja Kits", te: "దీపావళి పూజా కిట్‌లు" },
    viewAllKits: { en: "View all Diwali kits", te: "దీపావళి కిట్‌లన్నీ" },
    poojasTitle: { en: "Diwali Poojas", te: "దీపావళి పూజలు" },
    bookPoojaCta: { en: "Book Lakshmi Pooja", te: "లక్ష్మీ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Diwali Pooja Kits & Pooja Services",
      te: "పవిత్ర సేవ | దీపావళి పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Diwali Pooja Kits and Samagri, and book Lakshmi Pooja with Pavitra Seva.",
      te: "దీపావళి పూజా కిట్‌లు, సామగ్రి, పూజ బుకింగ్ — పవిత్ర సేవ.",
    },
  },
  dussehra: {
    id: "dussehra",
    poojaGuideId: "vijayadashami",
    needles: ["dussehra", "vijayadashami", "dasara", "navratri"],
    kicker: { en: "Dussehra Special", te: "దసరా ప్రత్యేకం" },
    headline: { en: "Prepare for Vijayadashami", te: "విజయదశమికి సిద్ధం" },
    supporting: {
      en: "Ayudha pooja samagri and kits to close Navratri with devotion.",
      te: "నవరాత్రి ముగింపుకు ఆయుధ పూజ సామగ్రి.",
    },
    heroShopCta: { en: "Shop Dussehra Kit", te: "దసరా కిట్" },
    shopCta: { en: "Shop Dussehra Kits", te: "దసరా కిట్‌లు" },
    viewFestivalCta: { en: "View Dussehra", te: "దసరా చూడండి" },
    kitsTitle: { en: "Popular Dussehra Kits", te: "దసరా కిట్‌లు" },
    viewAllKits: { en: "View all kits", te: "కిట్‌లన్నీ" },
    poojasTitle: { en: "Dussehra Poojas", te: "దసరా పూజలు" },
    bookPoojaCta: { en: "Book Pooja", te: "పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Dussehra Pooja Kits",
      te: "పవిత్ర సేవ | దసరా పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Dussehra Pooja Kits and book Poojas with Pavitra Seva.",
      te: "దసరా పూజా కిట్‌లు, పూజ బుకింగ్ — పవిత్ర సేవ.",
    },
  },
  ugadi: {
    id: "ugadi",
    poojaGuideId: "ugadi",
    needles: ["ugadi"],
    kicker: { en: "Ugadi Special", te: "ఉగాది ప్రత్యేకం" },
    headline: { en: "Begin the year with the right samagri", te: "సంవత్సరాదికి సరైన సామగ్రి" },
    supporting: {
      en: "Ugadi Pooja kits and samagri for a fresh calendar at home.",
      te: "ఉగాది పూజా కిట్‌లు, సామగ్రి.",
    },
    heroShopCta: { en: "Shop Ugadi Kit", te: "ఉగాది కిట్" },
    shopCta: { en: "Shop Ugadi Kits", te: "ఉగాది కిట్‌లు" },
    viewFestivalCta: { en: "View Ugadi Pooja", te: "ఉగాది చూడండి" },
    kitsTitle: { en: "Popular Ugadi Kits", te: "ఉగాది కిట్‌లు" },
    viewAllKits: { en: "View all Ugadi kits", te: "ఉగాది కిట్‌లన్నీ" },
    poojasTitle: { en: "Ugadi Poojas", te: "ఉగాది పూజలు" },
    bookPoojaCta: { en: "Book Ugadi Pooja", te: "ఉగాది పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Ugadi Pooja Kits",
      te: "పవిత్ర సేవ | ఉగాది పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Ugadi Pooja Kits and samagri with Pavitra Seva.",
      te: "ఉగాది పూజా కిట్‌లు, సామగ్రి — పవిత్ర సేవ.",
    },
  },
  sankranti: {
    id: "sankranti",
    needles: ["sankranti", "makara"],
    kicker: { en: "Sankranti Special", te: "సంక్రాంతి ప్రత్యేకం" },
    headline: { en: "Harvest blessings, prepared with care", te: "సంక్రాంతి పూజకు సామగ్రి" },
    supporting: {
      en: "Sankranti pooja kits and samagri for the sun’s northward journey.",
      te: "మకర సంక్రాంతి పూజా కిట్‌లు, సామగ్రి.",
    },
    heroShopCta: { en: "Shop Sankranti Kit", te: "సంక్రాంతి కిట్" },
    shopCta: { en: "Shop Sankranti Kits", te: "సంక్రాంతి కిట్‌లు" },
    viewFestivalCta: { en: "View Sankranti", te: "సంక్రాంతి చూడండి" },
    kitsTitle: { en: "Popular Sankranti Kits", te: "సంక్రాంతి కిట్‌లు" },
    viewAllKits: { en: "View all kits", te: "కిట్‌లన్నీ" },
    poojasTitle: { en: "Sankranti Poojas", te: "సంక్రాంతి పూజలు" },
    bookPoojaCta: { en: "Book Pooja", te: "పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Sankranti Pooja Kits",
      te: "పవిత్ర సేవ | సంక్రాంతి పూజా కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Sankranti Pooja Kits and book Poojas with Pavitra Seva.",
      te: "సంక్రాంతి పూజా కిట్‌లు — పవిత్ర సేవ.",
    },
  },
  shivaratri: {
    id: "shivaratri",
    poojaGuideId: "shiva",
    extraKitSlugs: ["shiva-special-samagri"],
    needles: ["shiva", "shivaratri", "rudra"],
    kicker: { en: "Maha Shivaratri Special", te: "మహా శివరాత్రి ప్రత్యేకం" },
    headline: { en: "Everything You Need for Shiva Pooja", te: "శివ పూజకు కావాల్సినవన్నీ" },
    supporting: {
      en: "Bilva, abhishekam samagri, and kits for an all-night vigil.",
      te: "బిల్వం, అభిషేక సామగ్రి, శివ పూజా కిట్‌లు.",
    },
    heroShopCta: { en: "Shop Shiva Pooja Kit", te: "శివ పూజ కిట్" },
    shopCta: { en: "Shop Shiva Kits", te: "శివ కిట్‌లు" },
    viewFestivalCta: { en: "View Shiva Pooja", te: "శివ పూజ చూడండి" },
    kitsTitle: { en: "Popular Shiva Pooja Kits", te: "శివ పూజా కిట్‌లు" },
    viewAllKits: { en: "View all Shiva kits", te: "శివ కిట్‌లన్నీ" },
    poojasTitle: { en: "Shivaratri Poojas", te: "శివరాత్రి పూజలు" },
    bookPoojaCta: { en: "Book Shiva Pooja", te: "శివ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Maha Shivaratri Pooja Kits",
      te: "పవిత్ర సేవ | మహా శివరాత్రి కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Shiva Pooja Kits and book Rudrabhishekam with Pavitra Seva.",
      te: "శివ పూజా కిట్‌లు, రుద్రాభిషేకం — పవిత్ర సేవ.",
    },
  },
  "rama-navami": {
    id: "rama-navami",
    poojaGuideId: "rama-navami",
    needles: ["rama", "ram-navami", "rama-navami"],
    kicker: { en: "Rama Navami Special", te: "శ్రీ రామ నవమి ప్రత్యేకం" },
    headline: { en: "Everything You Need for Rama Navami", te: "రామ నవమికి కావాల్సినవన్నీ" },
    supporting: {
      en: "Pooja kits and samagri for Sri Rama’s jayanti at home.",
      te: "శ్రీ రామ నవమి పూజా కిట్‌లు, సామగ్రి.",
    },
    heroShopCta: { en: "Shop Rama Navami Kit", te: "రామ నవమి కిట్" },
    shopCta: { en: "Shop Rama Navami Kits", te: "రామ నవమి కిట్‌లు" },
    viewFestivalCta: { en: "View Rama Navami", te: "రామ నవమి చూడండి" },
    kitsTitle: { en: "Popular Rama Navami Kits", te: "రామ నవమి కిట్‌లు" },
    viewAllKits: { en: "View all kits", te: "కిట్‌లన్నీ" },
    poojasTitle: { en: "Rama Navami Poojas", te: "రామ నవమి పూజలు" },
    bookPoojaCta: { en: "Book Rama Pooja", te: "రామ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Rama Navami Pooja Kits",
      te: "పవిత్ర సేవ | రామ నవమి కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Rama Navami Pooja Kits and book Poojas with Pavitra Seva.",
      te: "రామ నవమి పూజా కిట్‌లు — పవిత్ర సేవ.",
    },
  },
  janmashtami: {
    id: "janmashtami",
    poojaGuideId: "janmashtami",
    needles: ["janmashtami", "krishna"],
    kicker: { en: "Janmashtami Special", te: "జన్మాష్టమి ప్రత్యేకం" },
    headline: { en: "Everything You Need for Krishna Pooja", te: "కృష్ణ పూజకు కావాల్సినవన్నీ" },
    supporting: {
      en: "Janmashtami kits and samagri for midnight worship at home.",
      te: "జన్మాష్టమి పూజా కిట్‌లు, సామగ్రి.",
    },
    heroShopCta: { en: "Shop Janmashtami Kit", te: "జన్మాష్టమి కిట్" },
    shopCta: { en: "Shop Janmashtami Kits", te: "జన్మాష్టమి కిట్‌లు" },
    viewFestivalCta: { en: "View Janmashtami", te: "జన్మాష్టమి చూడండి" },
    kitsTitle: { en: "Popular Janmashtami Kits", te: "జన్మాష్టమి కిట్‌లు" },
    viewAllKits: { en: "View all kits", te: "కిట్‌లన్నీ" },
    poojasTitle: { en: "Janmashtami Poojas", te: "జన్మాష్టమి పూజలు" },
    bookPoojaCta: { en: "Book Krishna Pooja", te: "కృష్ణ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Krishna Janmashtami Pooja Kits",
      te: "పవిత్ర సేవ | జన్మాష్టమి కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Janmashtami Pooja Kits and book Poojas with Pavitra Seva.",
      te: "జన్మాష్టమి పూజా కిట్‌లు — పవిత్ర సేవ.",
    },
  },
  varalakshmi: {
    id: "varalakshmi",
    poojaGuideId: "varalakshmi",
    extraKitSlugs: ["varalakshmi-vratam-samagri"],
    needles: ["varalakshmi"],
    kicker: { en: "Varalakshmi Vratham Special", te: "వరలక్ష్మీ వ్రతం ప్రత్యేకం" },
    headline: {
      en: "Everything You Need for Varalakshmi Vratham",
      te: "వరలక్ష్మీ వ్రతానికి కావాల్సినవన్నీ",
    },
    supporting: {
      en: "Kalash, thoram, and complete kits for Friday’s Lakshmi vratham.",
      te: "వరలక్ష్మీ వ్రతానికి కలశం, తోరం, సంపూర్ణ కిట్‌లు.",
    },
    heroShopCta: { en: "Shop Varalakshmi Kit", te: "వరలక్ష్మీ కిట్" },
    shopCta: { en: "Shop Varalakshmi Kits", te: "వరలక్ష్మీ కిట్‌లు" },
    viewFestivalCta: { en: "View Varalakshmi Pooja", te: "వరలక్ష్మీ పూజ చూడండి" },
    kitsTitle: { en: "Popular Varalakshmi Kits", te: "వరలక్ష్మీ కిట్‌లు" },
    viewAllKits: { en: "View all Varalakshmi kits", te: "వరలక్ష్మీ కిట్‌లన్నీ" },
    poojasTitle: { en: "Varalakshmi Poojas", te: "వరలక్ష్మీ పూజలు" },
    bookPoojaCta: { en: "Book Varalakshmi Pooja", te: "వరలక్ష్మీ పూజ బుక్ చేయండి" },
    findPriestCta: { en: "Find Poojari", te: "పూజారిని కనుగొనండి" },
    vidhiCta: { en: "View Pooja Vidhi", te: "పూజా విధి" },
    seoTitle: {
      en: "Pavitra Seva | Varalakshmi Vratham Pooja Kits",
      te: "పవిత్ర సేవ | వరలక్ష్మీ వ్రతం కిట్‌లు",
    },
    seoDescription: {
      en: "Shop Varalakshmi Vratham kits and book Poojas with Pavitra Seva.",
      te: "వరలక్ష్మీ వ్రతం కిట్‌లు — పవిత్ర సేవ.",
    },
  },
};

export function campaignText(locale: Locale, pair: LocalizedText) {
  return locale === "te" ? pair.te : pair.en;
}

export function festivalShopQueryHref(festivalId: string) {
  return `/kits?festival=${encodeURIComponent(festivalId)}`;
}

export function resolveFestivalCampaign(id: string): ActiveFestivalCampaign | null {
  const festival = festivalById(id);
  const config = CAMPAIGNS[id];
  if (!festival || !config) return null;
  const kitSlugs = [
    ...festival.kitTabs.map((tab) => tab.slug),
    ...(festival.kitSlug ? [festival.kitSlug] : []),
    ...(config.extraKitSlugs ?? []),
  ].filter((slug, index, list) => list.indexOf(slug) === index);

  return {
    ...config,
    festival,
    shopHref: festivalShopQueryHref(id),
    festivalHref: `/festivals/${id}`,
    poojaHref: config.poojaGuideId ? `/poojas/${config.poojaGuideId}` : "/poojas",
    priestHref: "/priests",
    vidhiHref: `/festivals/${id}`,
    kitSlugs,
    image: festivalImage(id),
  };
}

export function getActiveFestivalCampaign(): ActiveFestivalCampaign | null {
  if (!ACTIVE_FESTIVAL_ID) return null;
  return resolveFestivalCampaign(ACTIVE_FESTIVAL_ID);
}

export function campaignFromQuery(festival?: string | null): ActiveFestivalCampaign | null {
  const id = festival?.trim().toLowerCase();
  if (!id) return null;
  return resolveFestivalCampaign(id);
}

export function filterCampaignKits(
  products: Product[],
  campaign: ActiveFestivalCampaign,
): Product[] {
  const slugs = new Set(campaign.kitSlugs);
  const needles = campaign.needles.map((needle) => needle.toLowerCase());
  const seen = new Set<string>();
  const matches: Product[] = [];

  for (const product of products) {
    if (seen.has(product.id)) continue;
    const hay = `${product.slug} ${product.name}`.toLowerCase();
    const otherFestival =
      Boolean(product.festival) &&
      product.festival !== campaign.id &&
      product.festival !== "general";
    const hit =
      product.festival === campaign.id ||
      slugs.has(product.slug) ||
      (!otherFestival && needles.some((needle) => hay.includes(needle)));
    if (!hit) continue;
    seen.add(product.id);
    matches.push(product);
  }

  return matches;
}
