const KIT_FILES = new Set([
  "satyanarayan-puja-kit",
  "satyanarayan-puja-kit-us",
  "griha-pravesh-kit",
  "vehicle-puja-kit",
  "ganesh-chaturthi-kit",
  "daily-puja-kit",
]);

const KIT_FALLBACKS: [string, string][] = [
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
