import type { Locale } from "./types";

export type DailyGuidance = {
  weekday: number;
  deity: { en: string; te: string };
  ritual: { en: string; te: string };
  description: { en: string; te: string };
  mantra: { en: string; te: string };
  items: { en: string; te: string }[];
  significance: { en: string; te: string };
  recommendedPooja: { href: string; label: { en: string; te: string } };
  relatedProducts: { href: string; label: { en: string; te: string } }[];
};

/** Weekday-indexed traditional guidance. Admin CMS can replace this later. */
export const DAILY_GUIDANCE: DailyGuidance[] = [
  {
    weekday: 0,
    deity: { en: "Surya", te: "సూర్య భగవానుడు" },
    ritual: { en: "Surya Namaskaram", te: "సూర్య నమస్కారం" },
    description: {
      en: "Sunday is traditionally offered to Surya. Families light a diya at sunrise and offer water facing east.",
      te: "ఆదివారం సూర్యునికి అంకితం. ఉదయం తూర్పువైపు నీటి అర్ఘ్యం ఇస్తారు.",
    },
    mantra: { en: "Om Suryaya Namah", te: "ఓం సూర్యాయ నమః" },
    items: [
      { en: "Red flowers, water in copper vessel", te: "ఎరుపు పువ్వులు, రాగి పాత్రలో నీరు" },
    ],
    significance: {
      en: "Traditional practice for vitality and a clear start to the week. This is customary guidance, not a medical claim.",
      te: "వారం ప్రారంభానికి సాంప్రదాయిక సేవ. ఇది ఆరోగ్య హామీ కాదు.",
    },
    recommendedPooja: { href: "/poojas/surya", label: { en: "Surya Pooja", te: "సూర్య పూజ" } },
    relatedProducts: [
      { href: "/kits/daily-puja-kit", label: { en: "Daily Pooja kit", te: "నిత్య పూజా కిట్" } },
    ],
  },
  {
    weekday: 1,
    deity: { en: "Shiva", te: "శివుడు" },
    ritual: { en: "Bilva archana / Abhishekam", te: "బిల్వ అర్చన / అభిషేకం" },
    description: {
      en: "Monday is widely kept for Lord Shiva. Offer bilva leaves and a simple abhishekam if you have a lingam or photo at home.",
      te: "సోమవారం శివునికి. బిల్వ పత్రాలు, సాధారణ అభిషేకం చేస్తారు.",
    },
    mantra: { en: "Om Namah Shivaya", te: "ఓం నమః శివాయ" },
    items: [
      { en: "Bilva leaves, water, milk, white flowers", te: "బిల్వ పత్రాలు, నీరు, పాలు, తెల్ల పువ్వులు" },
    ],
    significance: {
      en: "A quiet Monday practice many households use for focus and devotion.",
      te: "ఇళ్లలో సాధారణంగా నిశ్శబ్ద భక్తికి సోమవారం శివారాధన చేస్తారు.",
    },
    recommendedPooja: { href: "/poojas/shiva", label: { en: "Shiva Pooja", te: "శివ పూజ" } },
    relatedProducts: [
      { href: "/poojas/bilva", label: { en: "Bilva archana", te: "బిల్వ అర్చన" } },
      { href: "/priests", label: { en: "Book a poojari", te: "పూజారిని బుక్ చేయండి" } },
    ],
  },
  {
    weekday: 2,
    deity: { en: "Hanuman", te: "హనుమంతుడు" },
    ritual: { en: "Hanuman chalisa / sindoor offering", te: "హనుమాన్ చాలీసా / సిందూరం" },
    description: {
      en: "Tuesday is associated with Hanuman. Recite the Chalisa or visit a Hanuman temple if one is near you.",
      te: "మంగళవారం హనుమంతునికి. చాలీసా పఠనం లేదా ఆలయ దర్శనం.",
    },
    mantra: { en: "Om Hanumate Namah", te: "ఓం హనుమతే నమః" },
    items: [
      { en: "Sindoor, jasmine or red flowers, oil lamp", te: "సిందూరం, మల్లె లేదా ఎరుపు పువ్వులు" },
    ],
    significance: {
      en: "Traditionally linked with courage and seva. Follow the custom of your family and temple.",
      te: "ధైర్యం, సేవకు సంబంధించిన సాంప్రదాయం. మీ ఇంటి ఆచారాన్ని అనుసరించండి.",
    },
    recommendedPooja: { href: "/poojas/hanuman", label: { en: "Hanuman Pooja", te: "హనుమాన్ పూజ" } },
    relatedProducts: [{ href: "/priests", label: { en: "Book a poojari", te: "పూజారిని బుక్ చేయండి" } }],
  },
  {
    weekday: 3,
    deity: { en: "Vishnu / Krishna", te: "విష్ణు / కృష్ణుడు" },
    ritual: { en: "Vishnu sahasranama or tulasi archana", te: "విష్ణు సహస్రనామం / తులసి అర్చన" },
    description: {
      en: "Wednesday is often kept for Vishnu. Offer tulasi and a simple naivedyam of fruit or milk sweets.",
      te: "బుధవారం విష్ణువుకు. తులసి, పండ్ల నైవేద్యం.",
    },
    mantra: { en: "Om Namo Narayanaya", te: "ఓం నమో నారాయణాయ" },
    items: [{ en: "Tulasi, incense, fruit", te: "తులసి, అగరవత్తి, పండ్లు" }],
    significance: {
      en: "A mid-week reminder to keep the home shrine clean and the mind steady.",
      te: "వారం మధ్యలో ఇంటి గుడిని శుభ్రంగా ఉంచే సాంప్రదాయం.",
    },
    recommendedPooja: { href: "/poojas/vishnu", label: { en: "Vishnu Pooja", te: "విష్ణు పూజ" } },
    relatedProducts: [
      { href: "/kits/satyanarayan-puja-kit", label: { en: "Satyanarayan kit", te: "సత్యనారాయణ కిట్" } },
    ],
  },
  {
    weekday: 4,
    deity: { en: "Guru / Brihaspati", te: "గురు / బృహస్పతి" },
    ritual: { en: "Guru vandana / yellow flower offering", te: "గురు వందన / పసుపు పువ్వులు" },
    description: {
      en: "Thursday is associated with Brihaspati. Many families wear yellow, offer chana dal, and remember their teachers.",
      te: "గురువారం బృహస్పతికి. పసుపు వస్త్రం, శనగలు సమర్పణ.",
    },
    mantra: { en: "Om Gurave Namah", te: "ఓం గురవే నమః" },
    items: [{ en: "Yellow flowers, chana, ghee lamp", te: "పసుపు పువ్వులు, శనగలు, నెయ్యి దీపం" }],
    significance: {
      en: "A traditional day for learning, elders, and gratitude to the guru.",
      te: "విద్య, పెద్దలు, గురువుకు కృతజ్ఞత తెలిపే రోజు.",
    },
    recommendedPooja: { href: "/poojas/vishnu", label: { en: "Satyanarayan Pooja", te: "సత్యనారాయణ పూజ" } },
    relatedProducts: [{ href: "/priests", label: { en: "Book a poojari", te: "పూజారిని బుక్ చేయండి" } }],
  },
  {
    weekday: 5,
    deity: { en: "Lakshmi / Devi", te: "లక్ష్మి / దేవి" },
    ritual: { en: "Lakshmi archana", te: "లక్ష్మీ అర్చన" },
    description: {
      en: "Friday is kept for Lakshmi and the Devi. Clean the entrance, light a lamp, and offer sweets if it is your family custom.",
      te: "శుక్రవారం లక్ష్మీదేవికి. ఇంటి గడప శుభ్రం, దీపం, నైవేద్యం.",
    },
    mantra: { en: "Om Shreem Mahalakshmyai Namah", te: "ఓం శ్రీం మహాలక్ష్మ్యై నమః" },
    items: [
      { en: "Lotus or rose, coins, kheer or jaggery sweet", te: "గులాబీ, నాణేలు, పాయసం" },
    ],
    significance: {
      en: "Household prosperity rites vary by region. Follow your kuladevata tradition.",
      te: "ఐశ్వర్య సేవలు ప్రాంతాల వారీగా మారతాయి. మీ కులదైవ ఆచారం చూడండి.",
    },
    recommendedPooja: { href: "/poojas/lakshmi", label: { en: "Lakshmi Pooja", te: "లక్ష్మీ పూజ" } },
    relatedProducts: [
      { href: "/festivals/diwali", label: { en: "Lakshmi / Diwali kits", te: "లక్ష్మీ / దీపావళి కిట్‌లు" } },
    ],
  },
  {
    weekday: 6,
    deity: { en: "Shani / Hanuman", te: "శని / హనుమంతుడు" },
    ritual: { en: "Deepam and charity, or Hanuman seva", te: "దీపం, దానం లేదా హనుమత్ సేవ" },
    description: {
      en: "Saturday is associated with Shani and, in many homes, Hanuman. Light sesame oil, offer black til, or visit a Hanuman shrine.",
      te: "శనివారం శని, చాలా ఇళ్లలో హనుమంతుడు. నువ్వుల నూనె దీపం లేదా హనుమద్దర్శనం.",
    },
    mantra: { en: "Om Sham Shanaischaraya Namah", te: "ఓం శం శనైశ్చరాయ నమః" },
    items: [{ en: "Sesame oil, black til, mustard oil lamp", te: "నువ్వుల నూనె, నల్ల నువ్వులు" }],
    significance: {
      en: "Shani practices are family-specific. This card is cultural guidance, not a prediction of hardship or fortune.",
      te: "శని ఆచారాలు ఇంటి వారీగా మారతాయి. ఇది ఫలిత హామీ కాదు.",
    },
    recommendedPooja: { href: "/poojas/hanuman", label: { en: "Hanuman Pooja", te: "హనుమాన్ పూజ" } },
    relatedProducts: [{ href: "/poojas/navagraha", label: { en: "Navagraha Pooja", te: "నవగ్రహ పూజ" } }],
  },
];

export function guidanceForDate(date = new Date(), timeZone = "Asia/Kolkata") {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return DAILY_GUIDANCE[map[name] ?? 0]!;
}

export function guidanceText(entry: DailyGuidance, locale: Locale, field: keyof Pick<
  DailyGuidance,
  "deity" | "ritual" | "description" | "mantra" | "significance"
>) {
  return entry[field][locale];
}
