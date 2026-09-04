import type { Locale } from "./types";

const dict = {
  brand: { en: "Pavitra Seva", te: "పవిత్ర సేవ" },
  tagline: {
    en: "Sacred kits. Verified priests. Delivered with devotion.",
    te: "పవిత్ర కిట్‌లు. ధృవీకరించిన పూజారులు. భక్తితో డెలివరీ.",
  },
  navHome: { en: "Home", te: "హోమ్" },
  navKits: { en: "Pooja Kits", te: "పూజా కిట్‌లు" },
  navSamagri: { en: "Samagri", te: "సామగ్రి" },
  navPoojas: { en: "Poojas", te: "పూజలు" },
  navFestivals: { en: "Festivals", te: "పండుగలు" },
  navPriests: { en: "Priests", te: "పూజారులు" },
  navPanchang: { en: "Panchang", te: "పంచాంగం" },
  navPackages: { en: "Packages", te: "ప్యాకేజీలు" },
  navVidhi: { en: "Vidhi", te: "విధి" },
  navAbout: { en: "About", te: "గురించి" },
  login: { en: "Sign in", te: "లాగిన్" },
  account: { en: "Account", te: "ఖాతా" },
  cart: { en: "Cart", te: "కార్ట్" },
  shopKits: { en: "Shop Pooja kits", te: "పూజా కిట్‌లు చూడండి" },
  bookPriest: { en: "Book a priest", te: "పూజారిని బుక్ చేయండి" },
  todayPanchang: { en: "Today's Panchang", te: "నేటి పంచాంగం" },
  upcoming: { en: "Upcoming festivals", te: "రాబోయే పండుగలు" },
  featuredKits: { en: "Featured Pooja kits", te: "ప్రత్యేక పూజా కిట్‌లు" },
  addToCart: { en: "Add to cart", te: "కార్ట్‌కు జోడించు" },
  viewAll: { en: "View all", te: "అన్నీ చూడండి" },
  howTitle: { en: "How Pavitra Seva works", te: "పవిత్ర సేవ ఎలా పనిచేస్తుంది" },
  footerNote: {
    en: "A Hindu spiritual marketplace for India, USA, and Canada.",
    te: "భారతదేశం, అమెరికా, కెనడా కోసం హిందూ ఆధ్యాత్మిక మార్కెట్‌ప్లేస్.",
  },
} as const;

export type CopyKey = keyof typeof dict;

export function t(locale: Locale, key: CopyKey) {
  return dict[key][locale];
}
