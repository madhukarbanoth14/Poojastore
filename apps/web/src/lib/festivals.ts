export type FestivalKitTab = {
  slug: string;
  labelEn: string;
  labelTe: string;
  steps?: string[];
  specialityEn?: string;
  specialityTe?: string;
  processDetailEn?: string[];
  processDetailTe?: string[];
};

export type FestivalGuide = {
  id: string;
  name: string;
  nameTe: string;
  date: string;
  dateTe: string;
  target: string;
  description: string;
  speciality: string;
  steps: string[];
  items: string[];
  kitName: string;
  kitPrice: number;
  kitSlug?: string;
  kitTabs: FestivalKitTab[];
};

const GANESH_HOMAM_STEPS = [
  "Set the homa kunda facing east on a clean, slightly raised spot. Place the idol or photo nearby, light camphor, and kindle the fire with ghee and samithalu.",
  "Take sankalpam — name, gotra, and the wish for the homam — then invoke Lord Ganesha as Vighnaharta before any other offering.",
  "Offer homa powder, navadhanyalu, poha, jaggery, and durva into the fire with each mantra. Keep the flame fed with ghee; do not let it die mid-ritual.",
  "Perform purnahuti with coconut, fruits, vastra, and camphor. This seals the homam.",
  "Offer aarti, take prasad, and let the ashes cool before visarjan or keeping a pinch as vibhuti.",
];

const GANESH_PUJA_DETAIL_EN = [
  "Choose a Shubha muhurat if you can, especially on Chaturthi. Place a wooden plank or chowki, spread a red or yellow cloth, and keep the clay idol facing east or north. A small kalash with mango leaves and a coconut can sit to the deity’s right.",
  "After Prana Pratishtha, treat the murti as a living guest: padya (water for the feet), arghya, achamana, snana or a simple wipe, vastra (dhoti and sela), yajnopavita, gandham, kumkum, and flowers. Offer 21 blades of durva (garika) and modak or undrallu as naivedyam — these are Ganesha’s dearest offerings.",
  "Keep an akhanda deepam if the idol stays for more than a day. Morning and evening aarti with camphor, incense, and a bell mark the household rhythm. On the chosen day, circle the idol, thank Ganesha, and immerse the clay murti in a tank, river, or a vessel of water at home, then pour that water at the base of a plant.",
];

const GANESH_PUJA_DETAIL_TE = [
  "వీలైతే చవితి శుభ ముహూర్తంలో పూజ మొదలుపెట్టండి. పలక లేదా చౌకీపై ఎరుపు లేదా పసుపు వస్త్రం పరచి, మట్టి విగ్రహాన్ని తూర్పు లేదా ఉత్తరం వైపు ఉంచండి. కుడి వైపు మామిడి ఆకులు, కొబ్బరికాయతో చిన్న కలశం ఉంచవచ్చు.",
  "ప్రాణ ప్రతిష్ఠ తర్వాత విగ్రహాన్ని అతిథిగా సేవించండి: పాద్యం, అర్ఘ్యం, ఆచమనం, స్నానం లేదా తుడుపు, ధోతి-శేల, యజ్ఞోపవీతం, గంధం, కుంకుమ, పువ్వులు. 21 గరిక పత్రాలు, ఉండ్రాళ్లు లేదా మోదకం నైవేద్యంగా ఇవ్వండి — ఇవి వినాయకునికి అత్యంత ప్రియమైనవి.",
  "విగ్రహం ఒక రోజుకంటే ఎక్కువ ఉంటే అఖండ దీపం వెలిగించండి. ఉదయం, సాయంత్రం కర్పూరం, అగరవత్తి, గంటతో హారతి చేయండి. నిర్ణయించిన రోజున విగ్రహాన్ని ప్రదక్షిణ చేసి, కృతజ్ఞత చెప్పి, చెరువు, నది లేదా ఇంట్లో నీటి పాత్రలో నిమజ్జనం చేసి ఆ నీటిని మొక్క వద్ద పోయండి.",
];

const GANESH_HOMAM_DETAIL_EN = [
  "A Ganesh homam is done when the family wants a stronger blessing for a new house, business, wedding, or to remove persistent obstacles. It can follow the home puja or stand alone with a priest.",
  "Keep ghee warm, samithalu dry, and water nearby. Offerings go into the fire, not onto the idol. After purnahuti, sit quietly for a few minutes; the last aarti is the close of the rite.",
];

const GANESH_HOMAM_DETAIL_TE = [
  "కొత్త ఇల్లు, వ్యాపారం, వివాహం లేదా నిలకడగా ఉన్న ఆటంకాలు తొలగించుకోవడానికి గణేష్ హోమం చేస్తారు. ఇంటి పూజ తర్వాత లేదా పూజారితో ప్రత్యేకంగా చేయవచ్చు.",
  "నెయ్యి వెచ్చగా, సమితలు పొడిగా, నీరు దగ్గరగా ఉంచండి. హోమ ద్రవ్యాలు అగ్నిలో వేయాలి, విగ్రహంపై కాదు. పూర్ణాహుతి తర్వాత కొద్ది నిమిషాలు నిశ్శబ్దంగా ఉండి, హారతితో ముగించండి.",
];

export const upcomingFestivals: FestivalGuide[] = [
  {
    id: "ganesh",
    name: "Ganesh Chaturthi",
    nameTe: "వినాయక చవితి",
    date: "14 Sep 2026",
    dateTe: "14 సెప్టెంబర్ 2026",
    target: "2026-09-14",
    description:
      "Ganesh Chaturthi marks the birth of Lord Ganesha, worshipped as the remover of obstacles and lord of new beginnings. Families install a clay idol at home for 1.5, 3, 5, 7 or 11 days before immersion.",
    speciality:
      "Ganesh Chaturthi is the homecoming of Vighnaharta — families welcome a clay Ganesha, treat him as an honoured guest for 1.5, 3, 5, 7 or 11 days, then return him to water. The speciality is this living hospitality: 21 durva blades, modak or undrallu, an akhanda deepam, daily aarti, and visarjan as a lesson in letting obstacles go so new work can begin.",
    steps: [
      "Clean the pooja space and install the idol facing east or north.",
      "Perform Prana Pratishtha to invoke life into the idol.",
      "Offer durva grass, red flowers, and modak with mantras.",
      "Perform aarti morning and evening through the festival.",
      "Immerse the idol in water on the chosen day (visarjan).",
    ],
    items: [
      "Turmeric 100g",
      "Kumkum 100g",
      "Gandham",
      "Incense",
      "Camphor",
      "Dhoti 9×5",
      "Sela",
      "Navadhanyalu",
      "Clay akhanda deepam",
    ],
    kitName: "Ganesh Chaturthi Pooja Samagri",
    kitPrice: 149900,
    kitSlug: "ganesh-chaturthi-pooja-samagri",
    kitTabs: [
      {
        slug: "ganesh-chaturthi-pooja-samagri",
        labelEn: "Ganesh Puja kit",
        labelTe: "గణేష్ పూజ కిట్",
        specialityEn:
          "Ganesh Chaturthi is the homecoming of Vighnaharta — families welcome a clay Ganesha, treat him as an honoured guest for 1.5, 3, 5, 7 or 11 days, then return him to water. The speciality is this living hospitality: 21 durva blades, modak or undrallu, an akhanda deepam, daily aarti, and visarjan as a lesson in letting obstacles go so new work can begin.",
        specialityTe:
          "వినాయక చవితి అంటే విఘ్నహర్తను ఇంటికి ఆహ్వానించడం. మట్టి గణేశుని 1.5, 3, 5, 7 లేదా 11 రోజులు అతిథిగా సేవించి, నీటిలో నిమజ్జనం చేస్తారు. ప్రత్యేకత ఈ ఆతిథ్యమే: 21 గరిక పత్రాలు, ఉండ్రాళ్లు/మోదకం, అఖండ దీపం, ప్రతిరోజూ హారతి, ఆటంకాలు వదిలి కొత్త పని మొదలుపెట్టే సంకేతంగా విసర్జన.",
        processDetailEn: GANESH_PUJA_DETAIL_EN,
        processDetailTe: GANESH_PUJA_DETAIL_TE,
      },
      {
        slug: "ganesh-puja-homam-samagri",
        labelEn: "Ganesh Homam kit",
        labelTe: "గణేష్ హోమం కిట్",
        steps: GANESH_HOMAM_STEPS,
        specialityEn:
          "Ganesh homam takes the same Chaturthi devotion into the fire. Offerings of ghee, samithalu, navadhanyalu, and durva are given to Agni so Ganesha’s blessing reaches the whole household — often chosen for a new beginning, a stubborn obstacle, or when a priest leads the rite.",
        specialityTe:
          "గణేష్ హోమం చవితి భక్తిని అగ్నిలోకి తీసుకువెళ్తుంది. నెయ్యి, సమితలు, నవధాన్యాలు, గరిక అగ్నికి సమర్పించి ఇల్లంతా ఆశీస్సు పొందేలా చేస్తారు — కొత్త ఆరంభం, పెద్ద ఆటంకం, లేదా పూజారి నడిపించే విధికి ఎంచుకుంటారు.",
        processDetailEn: GANESH_HOMAM_DETAIL_EN,
        processDetailTe: GANESH_HOMAM_DETAIL_TE,
      },
    ],
  },
  {
    id: "navratri",
    name: "Sharad Navratri",
    nameTe: "శరద్ నవరాత్రి",
    date: "11 Oct 2026",
    dateTe: "11 అక్టోబర్ 2026",
    target: "2026-10-11",
    description:
      "Navratri honors nine forms of Goddess Durga over nine nights, culminating in Vijayadashami. Each day is dedicated to a different form of the goddess.",
    speciality:
      "A kalash is installed on day one and worshipped daily; many observe a fast and perform garba or dandiya in the evenings.",
    steps: [
      "Set up the kalash with mango leaves and a coconut on top.",
      "Sow barley seeds nearby as a symbol of growth.",
      "Light an akhand deepak for all nine days.",
      "Offer prayers to a different goddess form each day.",
      "Perform kanya pooja and break the fast on Ashtami or Navami.",
    ],
    items: ["Kalash", "Coconut", "Mango leaves", "Barley seeds", "Red chowki cloth", "Oil lamp"],
    kitName: "Navratri Kalash Samagri",
    kitPrice: 109900,
    kitSlug: "navratri-special-samagri",
    kitTabs: [
      {
        slug: "navratri-special-samagri",
        labelEn: "Navratri Pooja kit",
        labelTe: "నవరాత్రి పూజ కిట్",
        specialityEn:
          "A kalash is installed on day one and worshipped through nine nights, each dedicated to a form of Durga. Many keep a lamp burning, sow barley as a sign of growth, and close with kanya pooja before Vijayadashami.",
        specialityTe:
          "మొదటి రోజు కలశం ప్రతిష్ఠించి తొమ్మిది రాత్రులు పూజిస్తారు. ప్రతి రోజు దుర్గా దేవి ఒక రూపం. చాలామంది దీపం వెలిగించి, యవలు నాటి, విజయదశమికి ముందు కన్యా పూజతో ముగిస్తారు.",
        processDetailEn: [
          "Face the kalash east or north. Fill it with water, coins, and akshata, set mango leaves and a coconut on top, and wrap a red cloth at the neck.",
          "Each evening offer kumkum, flowers, and a simple naivedyam to that day’s goddess. On Ashtami or Navami, wash the feet of nine girls (or as many as you can), give them food, bangles, and dakshina, then conclude the vratam.",
        ],
        processDetailTe: [
          "కలశాన్ని తూర్పు లేదా ఉత్తరం వైపు ఉంచి, నీరు, నాణేలు, అక్షతలు నింపి, మామిడి ఆకులు, కొబ్బరికాయ పెట్టి మెడ వద్ద ఎరుపు వస్త్రం కట్టండి.",
          "ప్రతి సాయంత్రం ఆ రోజు అమ్మవారికి కుంకుమ, పువ్వులు, నైవేద్యం ఇవ్వండి. అష్టమి లేదా నవమినాడు కన్యల పాదాలు కడిగి భోజనం, గాజులు, దక్షిణ ఇచ్చి వ్రతం ముగించండి.",
        ],
      },
    ],
  },
  {
    id: "diwali",
    name: "Diwali",
    nameTe: "దీపావళి",
    date: "8 Nov 2026",
    dateTe: "8 నవంబర్ 2026",
    target: "2026-11-08",
    description:
      "Diwali, the festival of lights, celebrates the return of Lord Rama to Ayodhya and the worship of Goddess Lakshmi for prosperity in the year ahead.",
    speciality:
      "Homes are lit with diyas and rangoli, and Lakshmi Pooja is performed at dusk followed by sharing sweets with family.",
    steps: [
      "Clean and light the home with diyas at dusk.",
      "Draw a rangoli at the entrance to welcome the goddess.",
      "Set up Lakshmi and Ganesha idols with fresh flowers.",
      "Offer sweets, coins, and perform Lakshmi Pooja.",
      "Distribute prasad and sweets to family and neighbors.",
    ],
    items: ["Diyas", "Rangoli colors", "Lakshmi-Ganesha idols", "Sweets", "Coins", "Flowers"],
    kitName: "Diwali Lakshmi Pooja Samagri",
    kitPrice: 74900,
    kitSlug: "lakshmi-special-samagri",
    kitTabs: [
      {
        slug: "lakshmi-special-samagri",
        labelEn: "Lakshmi Pooja kit",
        labelTe: "లక్ష్మీ పూజ కిట్",
        specialityEn:
          "Deepavali Lakshmi pooja is done at dusk after the house is cleaned and lit. Ganesha sits with Lakshmi so wealth arrives without obstacles; coins, new account books, and sweets mark the year’s first ledger.",
        specialityTe:
          "దీపావళి లక్ష్మీ పూజ ఇల్లు శుభ్రం చేసి దీపాలు వెలిగించిన తర్వాత సంధ్యా సమయంలో చేస్తారు. ఆటంకం లేకుండా సంపద రావాలని లక్ష్మీదేవితో గణపతిని ఉంచుతారు; నాణేలు, కొత్త ఖాతా పుస్తకాలు, మిఠాయిలు కొత్త సంవత్సరపు లెక్కలు.",
        processDetailEn: [
          "Draw rangoli at the door, light diyas from the altar outward, and place Lakshmi and Ganesha on a red cloth with coins and a kalash.",
          "Offer lotus or seasonal flowers, panchamritam if you keep it, and sweets. Perform aarti at dusk, then share prasad with the household.",
        ],
        processDetailTe: [
          "గుమ్మం వద్ద రంగోలి వేసి, గర్భగుడి నుంచి బయటికి దీపాలు వెలిగించి, ఎరుపు వస్త్రంపై లక్ష్మీ-గణపతి, నాణేలు, కలశం ఉంచండి.",
          "కమలం లేదా సీజన్ పువ్వులు, పంచామృతం, మిఠాయిలు సమర్పించి సంధ్యా హారతి చేసి ఇంటివారికి ప్రసాదం పంచండి.",
        ],
      },
    ],
  },
];

export function festivalById(id: string) {
  return upcomingFestivals.find((f) => f.id === id) ?? upcomingFestivals[0]!;
}

export function festivalShopHref(fest: FestivalGuide) {
  return `/festivals/${fest.id}`;
}

export function festivalForKitSlug(slug: string) {
  return upcomingFestivals.find((fest) => fest.kitTabs.some((tab) => tab.slug === slug)) ?? null;
}

export function festivalKitHref(fest: FestivalGuide, _kits?: { slug: string; name: string }[]) {
  return festivalShopHref(fest);
}
