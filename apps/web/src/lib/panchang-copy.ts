import type { Locale, PanchangToday } from "./types";

const labels = {
  pickDate: { en: "Choose date", te: "తేదీ ఎంచుకోండి" },
  today: { en: "Today", te: "ఈరోజు" },
  tithi: { en: "Tithi", te: "తిథి" },
  varam: { en: "Weekday", te: "వారం" },
  nakshatra: { en: "Nakshatra", te: "నక్షత్రం" },
  yoga: { en: "Yoga", te: "యోగం" },
  karana: { en: "Karana", te: "కరణం" },
  varjyam: { en: "Varjyam", te: "వర్జ్యం" },
  durmuhurtham: { en: "Durmuhurtham", te: "దుర్ముహూర్తము" },
  amrit: { en: "Amrit Kalam", te: "అమృతకాలం" },
  rahu: { en: "Rahu Kalam", te: "రాహుకాలం" },
  yama: { en: "Yamagandam", te: "యమగండ/కేతుకాలం" },
  suryaRashi: { en: "Surya Rashi", te: "సూర్యరాశి" },
  chandraRashi: { en: "Chandra Rashi", te: "చంద్రరాశి" },
  sunrise: { en: "Sunrise", te: "సూర్యోదయం" },
  sunset: { en: "Sunset", te: "సూర్యాస్తమయం" },
  until: { en: "until", te: "వరకు" },
  none: { en: "None", te: "లేదు" },
  shuklaPaksha: { en: "Shukla Paksha", te: "శుక్ల పక్షం" },
  bahulaPaksha: { en: "Bahula Paksha", te: "బహుళ పక్షం" },
  masam: { en: "Masam", te: "మాసం" },
} as const;

const termsTe: Record<string, string> = {
  Prabhava: "ప్రభవ",
  Vibhava: "విభవ",
  Shukla: "శుక్ల",
  Pramoduta: "ప్రమోదూత",
  Prajotpatti: "ప్రజోత్పత్తి",
  Angirasa: "అంగీరస",
  Shrimukha: "శ్రీముఖ",
  Bhava: "భావ",
  Yuva: "యువ",
  Dhata: "ధాత",
  Ishvara: "ఈశ్వర",
  Bahudhanya: "బహుధాన్య",
  Pramadi: "ప్రమాది",
  Vikrama: "విక్రమ",
  Vrisha: "వృష",
  Chitrabhanu: "చిత్రభాను",
  Svabhanu: "స్వభాను",
  Tarana: "తరణ",
  Parthiva: "పార్థివ",
  Vyaya: "వ్యయ",
  Sarvajit: "సర్వజిత్",
  Sarvadhari: "సర్వధారి",
  Virodhi: "విరోధి",
  Vikriti: "వికృతి",
  Khara: "ఖర",
  Nandana: "నందన",
  Vijaya: "విజయ",
  Jaya: "జయ",
  Manmatha: "మన్మథ",
  Durmukhi: "దుర్ముఖి",
  Hevilambi: "హేవిళంబి",
  Vilambi: "విళంబి",
  Vikari: "వికారి",
  Sharvari: "శార్వరి",
  Plava: "ప్లవ",
  Shubhakrit: "శుభకృత్",
  Shobhakrit: "శోభకృత్",
  Krodhi: "క్రోధి",
  Vishvavasu: "విశ్వావసు",
  Parabhava: "పరాభవ",
  Plavanga: "ప్లవంగ",
  Kilaka: "కీలక",
  Saumya: "సౌమ్య",
  Sadharana: "సాధారణ",
  Virodhikrit: "విరోధికృత్",
  Paridhavi: "పరిధావి",
  Pramadicha: "ప్రమాదీచ",
  Ananda: "ఆనంద",
  Rakshasa: "రాక్షస",
  Nala: "నల",
  Pingala: "పింగళ",
  Kalayukti: "కాళయుక్తి",
  Siddharthi: "సిద్ధార్థి",
  Raudra: "రౌద్ర",
  Durmati: "దుర్మతి",
  Dundubhi: "దుందుభి",
  Rudhirodgari: "రుధిరోద్గారి",
  Raktakshi: "రక్తాక్షి",
  Krodhana: "క్రోధన",
  Akshaya: "అక్షయ",
  Uttarayana: "ఉత్తరాయణం",
  Dakshinayana: "దక్షిణాయనం",
  Vasanta: "వసంత ఋతువు",
  Grishma: "గ్రీష్మ ఋతువు",
  Varsha: "వర్ష ఋతువు",
  Sharad: "శరదృతువు",
  Hemanta: "హేమంత ఋతువు",
  Shishira: "శిశిర ఋతువు",
  Chaitra: "చైత్ర",
  Vaisakha: "వైశాఖ",
  Jyeshtha: "జ్యేష్ఠ",
  Ashadha: "ఆషాఢ",
  Shravana: "శ్రావణ",
  Bhadrapada: "భాద్రపద",
  Ashwayuja: "ఆశ్వయుజ",
  Kartika: "కార్తీక",
  Margashira: "మార్గశిర",
  Pushya: "పుష్య",
  Magha: "మాఘ",
  Phalguna: "ఫాల్గుణ",
  Mesha: "మేషం",
  Vrishabha: "వృషభం",
  Mithuna: "మిథునం",
  Karka: "కర్కాటకం",
  Simha: "సింహం",
  Kanya: "కన్య",
  Tula: "తుల",
  Vrishchika: "వృశ్చికం",
  Dhanu: "ధనుస్సు",
  Makara: "మకరం",
  Kumbha: "కుంభం",
  Meena: "మీనం",
  Sunday: "ఆదివారం",
  Monday: "సోమవారం",
  Tuesday: "మంగళవారం",
  Wednesday: "బుధవారం",
  Thursday: "గురువారం",
  Friday: "శుక్రవారం",
  Saturday: "శనివారం",
  Krishna: "కృష్ణ",
  Pratipada: "పాడ్యమి",
  Dwitiya: "విదియ",
  Tritiya: "తదియ",
  Chaturthi: "చవితి",
  Panchami: "పంచమి",
  Shashthi: "షష్ఠి",
  Saptami: "సప్తమి",
  Ashtami: "అష్టమి",
  Navami: "నవమి",
  Dashami: "దశమి",
  Ekadashi: "ఏకాదశి",
  Dwadashi: "ద్వాదశి",
  Trayodashi: "త్రయోదశి",
  Chaturdashi: "చతుర్దశి",
  Purnima: "పౌర్ణమి",
  Amavasya: "అమావాస్య",
  Ashwini: "అశ్విని",
  Bharani: "భరణి",
  Krittika: "కృత్తిక",
  Rohini: "రోహిణి",
  Mrigashira: "మృగశిర",
  Ardra: "ఆర్ద్ర",
  Punarvasu: "పునర్వసు",
  Ashlesha: "ఆశ్లేష",
  Purva: "పూర్వ",
  "Purva Phalguni": "పూర్వ ఫల్గుణి",
  "Uttara Phalguni": "ఉత్తర ఫల్గుణి",
  Hasta: "హస్త",
  Chitra: "చిత్ర",
  Swati: "స్వాతి",
  Vishakha: "విశాఖ",
  Anuradha: "అనురాధ",
  Mula: "మూల",
  "Purva Ashadha": "పూర్వాషాఢ",
  "Uttara Ashadha": "ఉత్తరాషాఢ",
  Dhanishta: "ధనిష్ఠ",
  Shatabhisha: "శతభిష",
  "Purva Bhadrapada": "పూర్వ భాద్రపద",
  "Uttara Bhadrapada": "ఉత్తర భాద్రపద",
  Revati: "రేవతి",
  Vishkambha: "విష్కంభ",
  Priti: "ప్రీతి",
  Ayushman: "ఆయుష్మాన్",
  Saubhagya: "సౌభాగ్య",
  Shobhana: "శోభన",
  Atiganda: "అతిగండ",
  Sukarma: "సుకర్మ",
  Dhriti: "ధృతి",
  Shula: "శూల",
  Ganda: "గండ",
  Vriddhi: "వృద్ధి",
  Dhruva: "ధ్రువ",
  Vyaghata: "వ్యాఘాత",
  Harshana: "హర్షణ",
  Vajra: "వజ్ర",
  Siddhi: "సిద్ధి",
  Vyatipata: "వ్యతీపాతం",
  Variyan: "వరీయాన్",
  Parigha: "పరిఘ",
  Shiva: "శివ",
  Siddha: "సిద్ధ",
  Sadhya: "సాధ్య",
  Shubha: "శుభ",
  Brahma: "బ్రహ్మ",
  Indra: "ఇంద్ర",
  Vaidhriti: "వైధృతి",
  Bava: "బవ",
  Balava: "బాలవ",
  Kaulava: "కౌలవ",
  Taitila: "తైతిల",
  Gara: "గర",
  Vanija: "వణిజ",
  Vishti: "విష్టి",
  Shakuni: "శకుని",
  Chatushpada: "చతుష్పాద",
  Nagava: "నాగవం",
  Kimstughna: "కింస్తుఘ్న",
};

export function pl(locale: Locale, key: keyof typeof labels) {
  return labels[key][locale];
}

export function localizeTerm(raw: string | undefined | null, locale: Locale) {
  if (!raw?.trim()) return "—";
  if (locale !== "te") return raw;
  const parts = raw.trim().split(/\s+/);
  return parts.map((p) => termsTe[p] ?? p).join(" ");
}

export function tithiShort(raw: string | undefined, locale: Locale) {
  if (!raw) return "—";
  const stripped = raw.replace(/^(Shukla|Krishna)\s+/i, "");
  return localizeTerm(stripped, locale);
}

export function pakshaLabel(paksha: string | undefined, locale: Locale) {
  const krishna = (paksha ?? "").toLowerCase().includes("krishna");
  return krishna ? pl(locale, "bahulaPaksha") : pl(locale, "shuklaPaksha");
}

export function samvatsaramLine(name: string | undefined, locale: Locale) {
  const n = localizeTerm(name, locale);
  if (locale === "te") return `శ్రీ ${n} నామ సంవత్సరం`;
  return `Shri ${name ?? "—"} Nama Samvatsaram`;
}

export function ayanaRithuLine(
  ayana: string | undefined,
  rithu: string | undefined,
  locale: Locale,
) {
  const a = localizeTerm(ayana, locale);
  const r =
    locale === "te"
      ? localizeTerm(rithu, locale)
      : rithu
        ? `${rithu} Rithu`
        : "—";
  return `${a}, ${r}`;
}

export function masamPakshaLine(
  masam: string | undefined,
  paksha: string | undefined,
  locale: Locale,
) {
  const m = localizeTerm(masam, locale);
  const suffix = locale === "te" ? " మాసం" : " Masam";
  return `${m}${suffix}, ${pakshaLabel(paksha, locale)}`;
}

function parseClock(value: string) {
  const m = value
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ap = m[3];
  if (ap === "pm" && hour < 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return { hour, minute };
}

/** Telugu almanac period: ఉ morning, మ afternoon, సా evening, రా night. */
export function formatAlmanacTime(value: string | undefined | null, locale: Locale) {
  if (!value) return "—";
  const clock = parseClock(value);
  if (!clock) return value;
  const { hour, minute } = clock;
  const mm = String(minute).padStart(2, "0");
  if (locale !== "te") {
    const h12 = hour % 12 || 12;
    const ap = hour >= 12 ? "pm" : "am";
    return `${String(h12).padStart(2, "0")}:${mm} ${ap}`;
  }
  let period = "రా";
  if (hour >= 4 && hour < 12) period = "ఉ";
  else if (hour >= 12 && hour < 16) period = "మ";
  else if (hour >= 16 && hour < 19) period = "సా";
  const h12 = hour % 12 || 12;
  return `${period} ${h12}.${mm}`;
}

export function untilPhrase(time: string | undefined | null, locale: Locale) {
  if (!time) return "";
  const stamp = formatAlmanacTime(time, locale);
  return locale === "te" ? `${stamp} వరకు` : `until ${stamp}`;
}

export function windowPhrase(
  win: { start?: string; end?: string } | undefined,
  locale: Locale,
) {
  if (!win?.start) return pl(locale, "none");
  return `${formatAlmanacTime(win.start, locale)} – ${formatAlmanacTime(win.end, locale)}`;
}

export function weekdayDateBanner(p: PanchangToday, locale: Locale) {
  const weekday = localizeTerm(p.weekday as string | undefined, locale);
  const iso = typeof p.date === "string" ? p.date : "";
  if (!iso) return weekday;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  if (locale === "te") {
    const months = [
      "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
      "జూలై", "ఆగష్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్",
    ];
    return `${weekday}, ${months[m - 1]} ${d}, ${y}`;
  }
  return dt.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function todayIso(timeZone = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function karanaValue(p: PanchangToday, locale: Locale) {
  const first = localizeTerm(p.karana, locale);
  const until = untilPhrase(p.karanaEndsAt as string | undefined, locale);
  const nextName = p.karanaNext as string | undefined;
  if (!nextName) return until ? `${first} (${until})` : first;
  const second = localizeTerm(nextName, locale);
  const nextUntil = untilPhrase(p.karanaNextEndsAt as string | undefined, locale);
  const a = until ? `${first} ${until}` : first;
  const b = nextUntil ? `${second} ${nextUntil}` : second;
  return `${a}, ${b}`;
}
