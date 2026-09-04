import type { Locale } from "./types";

const dict = {
  brand: { en: "Pavitra Seva", te: "పవిత్ర సేవ" },
  tagline: {
    en: "Your Divine Companion",
    te: "మీ దైవిక సహచరుడు",
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
  todayPanchang: { en: "Today's Panchangam", te: "నేటి పంచాంగం" },
  rasiPhalalu: { en: "Today's Rasi Phalalu", te: "నేటి రాశి ఫలాలు" },
  spiritualGuidance: { en: "Today's spiritual guidance", te: "నేటి ఆధ్యాత్మిక మార్గదర్శకం" },
  todaysRitual: { en: "Today's ritual", te: "నేటి ఆచారం" },
  selectLocation: { en: "Select your location", te: "మీ ప్రాంతం ఎంచుకోండి" },
  bookPooja: { en: "Book a Pooja", te: "పూజ బుక్ చేయండి" },
  upcoming: { en: "Upcoming festivals", te: "రాబోయే పండుగలు" },
  featuredKits: { en: "Featured Pooja kits", te: "ప్రత్యేక పూజా కిట్‌లు" },
  addToCart: { en: "Add to cart", te: "కార్ట్‌కు జోడించు" },
  viewAll: { en: "View all", te: "అన్నీ చూడండి" },
  howTitle: { en: "How Pavitra Seva works", te: "పవిత్ర సేవ ఎలా పనిచేస్తుంది" },
  footerNote: {
    en: "Traditional at heart. Modern in experience. Global by design — for India, USA, and Canada.",
    te: "సాంప్రదాయం హృదయంలో. ఆధునిక అనుభవం. భారతదేశం, అమెరికా, కెనడా కోసం.",
  },
} as const;

export type CopyKey = keyof typeof dict;

export function t(locale: Locale, key: CopyKey) {
  return dict[key][locale];
}
