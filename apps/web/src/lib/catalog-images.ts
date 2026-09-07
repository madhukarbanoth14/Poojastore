const KIT_FILES = new Set([
  "satyanarayan-puja-kit",
  "satyanarayan-puja-kit-us",
  "griha-pravesh-kit",
  "vehicle-puja-kit",
  "ganesh-chaturthi-kit",
  "ganesh-mini-home-puja",
  "ganesh-mini-office-puja",
  "ganesh-mini-mandapam",
  "ganesh-mega-home-puja",
  "ganesh-mega-office-puja",
  "ganesh-mega-mandapam",
  "daily-puja-kit",
]);

const KIT_FALLBACKS: [string, string][] = [
  ["ganesh-mini", "/images/kits/ganesh-chaturthi-kit.png"],
  ["ganesh-mega", "/images/kits/ganesh-chaturthi-kit.png"],
  ["ganesh-chaturthi-home", "/images/kits/ganesh-chaturthi-kit.png"],
  ["ganesh-chaturthi-pooja", "/images/kits/ganesh-chaturthi-kit.png"],
  ["mandapam", "/images/kits/ganesh-chaturthi-kit.png"],
  ["ganapati", "/images/kits/ganesh-chaturthi-kit.png"],
  ["ganesh", "/images/kits/ganesh-chaturthi-kit.png"],
  ["homam", "/images/kits/ganesh-chaturthi-kit.png"],
  ["varalakshmi", "/images/festivals/navratri.png"],
  ["mangala-gauri", "/images/festivals/navratri.png"],
  ["navratri", "/images/festivals/navratri.png"],
  ["saraswati", "/images/festivals/navratri.png"],
  ["santoshi", "/images/festivals/navratri.png"],
  ["savitri", "/images/festivals/navratri.png"],
  ["ugadi", "/images/festivals/navratri.png"],
  ["diwali", "/images/festivals/diwali.png"],
  ["kartika", "/images/festivals/diwali.png"],
  ["lakshmi", "/images/festivals/diwali.png"],
  ["anantha", "/images/kits/satyanarayan-puja-kit.png"],
  ["vishnu", "/images/kits/satyanarayan-puja-kit.png"],
  ["rama-navami", "/images/kits/satyanarayan-puja-kit.png"],
  ["hanuman", "/images/kits/satyanarayan-puja-kit.png"],
  ["janmashtami", "/images/kits/satyanarayan-puja-kit.png"],
  ["satyanarayan", "/images/kits/satyanarayan-puja-kit.png"],
  ["griha-pravesh", "/images/kits/griha-pravesh-kit.png"],
  ["vehicle", "/images/kits/vehicle-puja-kit.png"],
  ["daily", "/images/kits/daily-puja-kit.png"],
  ["general", "/images/kits/daily-puja-kit.png"],
  ["shiva", "/images/kits/daily-puja-kit.png"],
  ["kedara", "/images/kits/daily-puja-kit.png"],
  ["surya", "/images/kits/daily-puja-kit.png"],
  ["navagraha", "/images/kits/daily-puja-kit.png"],
];

export function kitImage(slug?: string | null, name?: string | null) {
  const key = (slug ?? "").trim().toLowerCase();
  if (key && KIT_FILES.has(key)) return `/images/kits/${key}.png`;
  for (const [needle, path] of KIT_FALLBACKS) {
    if (key.includes(needle) || (name ?? "").toLowerCase().includes(needle)) {
      return path;
    }
  }
  return "/images/kits/daily-puja-kit.png";
}

const FESTIVAL_FILES: Record<string, string> = {
  ganesh: "/images/festivals/ganesh.png",
  navratri: "/images/festivals/navratri.png",
  dussehra: "/images/festivals/navratri.png",
  diwali: "/images/festivals/diwali.png",
  janmashtami: "/images/kits/satyanarayan-puja-kit.png",
  "rama-navami": "/images/kits/satyanarayan-puja-kit.png",
  ugadi: "/images/festivals/navratri.png",
  sankranti: "/images/festivals/diwali.png",
  shivaratri: "/images/kits/daily-puja-kit.png",
  varalakshmi: "/images/festivals/navratri.png",
};

export function festivalImage(id: string) {
  return FESTIVAL_FILES[id] ?? "/images/festivals/ganesh.png";
}

export function serviceImage(id: string) {
  return `/images/services/${id}.png`;
}

const SAMAGRI_FILES = new Set([
  "samagri-21-patri",
  "samagri-akhanda-deepam",
  "samagri-akshatalu",
  "samagri-asanam",
  "samagri-astagandham",
  "samagri-attar",
  "samagri-backdrop",
  "samagri-betel-leaves",
  "samagri-betel-nuts",
  "samagri-blouse-pieces",
  "samagri-bukka",
  "samagri-camphor",
  "samagri-cardamom",
  "samagri-cloves",
  "samagri-coconuts",
  "samagri-cotton-wicks",
  "samagri-dates",
  "samagri-dhoop-cups",
  "samagri-dona-cups",
  "samagri-flowers",
  "samagri-fruits",
  "samagri-eco-ganesh-idol",
  "samagri-gandham",
  "samagri-gangajal",
  "samagri-garland",
  "samagri-ghee",
  "samagri-god-asanam",
  "samagri-gomutra",
  "samagri-gulal",
  "samagri-head-band",
  "samagri-honey",
  "samagri-incense",
  "samagri-isthari-leaves",
  "samagri-jaggery",
  "samagri-javadhu",
  "samagri-jenu",
  "samagri-jileda-wicks",
  "samagri-kankana-thread",
  "samagri-khandwa",
  "samagri-kumkum",
  "samagri-laddu",
  "samagri-leaf-cups",
  "samagri-markatam-ganesh",
  "samagri-matchbox",
  "samagri-moli-thread",
  "samagri-muggu-colours",
  "samagri-oil",
  "samagri-pacha-karpuram",
  "samagri-panchamritam",
  "samagri-paper-umbrella",
  "samagri-peacock-feathers",
  "samagri-poha",
  "samagri-pooja-book",
  "samagri-puja-vastras",
  "samagri-puvvu-wicks",
  "samagri-rava",
  "samagri-red-cloth",
  "samagri-rice",
  "samagri-rice-flour",
  "samagri-rose-water",
  "samagri-shubh-labh",
  "samagri-sindoor",
  "samagri-sugar-crystals",
  "samagri-sutli",
  "samagri-turmeric",
  "samagri-turmeric-roots",
  "samagri-umbrella",
  "samagri-undrallu",
  "samagri-white-thread",
  "samagri-yajnopavita",
]);

const SAMAGRI_ALIASES: Record<string, string> = {
  "samagri-sandal-paste": "samagri-gandham",
  "samagri-prasadam-leaf-cups": "samagri-leaf-cups",
  "samagri-durva": "samagri-isthari-leaves",
  "21 patri pack": "samagri-21-patri",
  "durva / isthari leaves": "samagri-isthari-leaves",
  "durva grass": "samagri-isthari-leaves",
  undrallu: "samagri-undrallu",
  laddu: "samagri-laddu",
  "panchamritam pack": "samagri-panchamritam",
  "loose flowers": "samagri-flowers",
  flowers: "samagri-flowers",
  fruits: "samagri-fruits",
};

export function samagriImage(slug?: string | null, name?: string | null) {
  for (const raw of [slug, name]) {
    const key = (raw ?? "").trim().toLowerCase();
    if (!key) continue;
    const mapped = SAMAGRI_ALIASES[key] ?? key;
    if (SAMAGRI_FILES.has(mapped)) return `/images/samagri/${mapped}.png`;
  }
  return null;
}
