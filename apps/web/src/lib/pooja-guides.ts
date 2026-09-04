export type PoojaItem = { en: string; te: string };
export type PoojaKind = "deity" | "festival" | "vratham";

export type PoojaGuide = {
  id: string;
  kind: PoojaKind;
  titleEn: string;
  titleTe: string;
  kitSlug?: string;
  deityKitSlug?: string;
  special: PoojaItem[];
  noteEn?: string;
  noteTe?: string;
};

export const BASIC_KIT_SLUG = "general-pooja-samagri-kit";

export const commonSamagri: { titleEn: string; titleTe: string; items: PoojaItem[] }[] = [
  {
    titleEn: "Everyday pooja samagri",
    titleTe: "సాధారణ పూజా సామగ్రి",
    items: [
      { en: "Turmeric", te: "పసుపు" },
      { en: "Kumkum", te: "కుంకుమ" },
      { en: "Sandal / gandham", te: "గంధం / చందనం" },
      { en: "Vibhuti", te: "విభూది" },
      { en: "Akshintalu", te: "అక్షింతలు" },
      { en: "Rice", te: "బియ్యం" },
      { en: "Betel leaves", te: "తమలపాకులు" },
      { en: "Betel nuts", te: "వక్కలు" },
      { en: "Coconuts", te: "కొబ్బరికాయలు" },
      { en: "Flowers", te: "పూలు" },
      { en: "Flower garlands", te: "పూలమాలలు / దండలు" },
      { en: "Darbha grass", te: "దర్భ" },
      { en: "Pavitram", te: "పవిత్రం" },
      { en: "Panchapatra & uddharini", te: "పంచపాత్ర – ఉద్ధరణి" },
      { en: "Bell", te: "గంట" },
      { en: "Harathi plate", te: "హారతి పళ్లెం" },
      { en: "Deepam", te: "దీపం" },
      { en: "Wicks", te: "వత్తులు" },
      { en: "Ghee / oil", te: "నెయ్యి / నూనె" },
      { en: "Camphor", te: "కర్పూరం" },
      { en: "Incense", te: "అగరబత్తీలు" },
      { en: "Dhoopam", te: "ధూపం" },
      { en: "Naivedyam", te: "నైవేద్యం" },
      { en: "Fruits", te: "పండ్లు" },
      { en: "Kalasham", te: "కలశం" },
      { en: "Kalash cloth", te: "కలశ వస్త్రం" },
      { en: "Mango leaves for kalash", te: "కలశానికి మామిడి ఆకులు" },
      { en: "Gangajal", te: "గంగాజలం" },
      { en: "Pooja vastra", te: "పూజా వస్త్రం" },
    ],
  },
  {
    titleEn: "Panchamritam",
    titleTe: "పంచామృతం",
    items: [
      { en: "Milk", te: "పాలు" },
      { en: "Curd", te: "పెరుగు" },
      { en: "Ghee", te: "నెయ్యి" },
      { en: "Honey", te: "తేనె" },
      { en: "Sugar", te: "చక్కెర" },
    ],
  },
  {
    titleEn: "Usual fruits & naivedyam",
    titleTe: "సాధారణ పండ్లు, నైవేద్యం",
    items: [
      { en: "Bananas", te: "అరటిపండ్లు" },
      { en: "Coconut", te: "కొబ్బరికాయ" },
      { en: "Seasonal fruits", te: "సీజనల్ పండ్లు" },
      { en: "Jaggery", te: "బెల్లం" },
      { en: "Laddu", te: "లడ్డూ" },
      { en: "Pulihora", te: "పులిహోర" },
      { en: "Vadapappu", te: "వడపప్పు" },
      { en: "Panakam", te: "పానకం" },
    ],
  },
];

export const poojaGuides: PoojaGuide[] = [
  {
    id: "ganapati",
    kind: "deity",
    titleEn: "Ganapati / Vinayaka Chavithi",
    titleTe: "గణపతి పూజ / వినాయక చవితి",
    kitSlug: "ganesh-chaturthi-home-puja",
    deityKitSlug: "ganapati-special-samagri",
    special: [
      { en: "Ganapati vigraham (clay for Chavithi)", te: "గణపతి విగ్రహం / మట్టి గణపతి" },
      { en: "21 kinds of patri", te: "21 రకాల పత్రి" },
      { en: "Durva grass", te: "దూర్వా గడ్డి" },
      { en: "Red flowers", te: "ఎర్రని పూలు" },
      { en: "Modak / undrallu / kudumulu", te: "మోదకం / ఉండ్రాళ్లు / కుడుములు" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "shiva",
    kind: "deity",
    titleEn: "Rudrabhishekam / Lingabhishekam / Shiva pooja",
    titleTe: "రుద్రాభిషేకం / లింగాభిషేకం / శివ పూజ",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Shivalingam", te: "శివలింగం" },
      { en: "Bilva leaves", te: "బిల్వదళాలు / మారేడు ఆకులు" },
      { en: "White flowers / datura if custom", te: "తెల్లని పూలు" },
      { en: "Vibhuti", te: "విభూది" },
      { en: "Rudraksha mala", te: "రుద్రాక్షమాల" },
      { en: "Abhisheka dravyas / panchamritam", te: "అభిషేక ద్రవ్యాలు / పంచామృతం" },
      { en: "Abhisheka patra", te: "అభిషేక పాత్ర / ధారాపాత్ర" },
    ],
  },
  {
    id: "bilva",
    kind: "deity",
    titleEn: "Bilva pooja",
    titleTe: "బిల్వ పూజ",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Shivalingam or Shiva picture", te: "శివలింగం / శివుని చిత్రం" },
      { en: "Plenty of bilva leaves", te: "బిల్వదళాలు పెద్ద మొత్తంలో" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "pradosha",
    kind: "vratham",
    titleEn: "Pradosha vratam",
    titleTe: "ప్రదోష వ్రత పూజ",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Shivalingam", te: "శివలింగం" },
      { en: "Nandi picture", te: "నంది విగ్రహం / చిత్రం" },
      { en: "Bilva leaves", te: "బిల్వదళాలు" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "somavara",
    kind: "vratham",
    titleEn: "Somavara vratam",
    titleTe: "సోమవారం వ్రత పూజ",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Shivalingam", te: "శివలింగం" },
      { en: "Bilva leaves", te: "బిల్వదళాలు" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "kedara",
    kind: "vratham",
    titleEn: "Kedareshwara vratam",
    titleTe: "కేదారేశ్వర వ్రతం",
    kitSlug: "kedara-vratam-samagri",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Kedareshwara picture", te: "కేదారేశ్వర స్వామి చిత్రం" },
      { en: "Parvati picture", te: "పార్వతీదేవి చిత్రం" },
      { en: "Kalasham & mango leaves", te: "కలశం, మామిడి ఆకులు" },
      { en: "Bilva leaves", te: "బిల్వదళాలు" },
      { en: "Vratam katha book", te: "వ్రత కథ పుస్తకం" },
      { en: "Thoram / vratam thread", te: "తోరం / వ్రత దారం" },
    ],
  },
  {
    id: "shiva-kalyanam",
    kind: "festival",
    titleEn: "Shiva kalyanam",
    titleTe: "శివ కల్యాణం",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Shiva & Parvati vigrahams", te: "శివుడు, పార్వతి విగ్రహాలు" },
      { en: "Kalashams", te: "కలశాలు" },
      { en: "Mangalsutra / tali", te: "మంగళసూత్రం / తాళి" },
      { en: "Turmeric roots, jeera, jaggery", te: "పసుపు కొమ్ములు, జీలకర్ర, బెల్లం" },
      { en: "Vastras & harathi samagri", te: "వస్త్రాలు, హారతి సామగ్రి" },
    ],
  },
  {
    id: "ugadi",
    kind: "festival",
    titleEn: "Ugadi pooja",
    titleTe: "ఉగాది పూజ",
    kitSlug: "ugadi-special-samagri",
    special: [
      { en: "Mango-leaf toranam", te: "మామిడి ఆకుల తోరణం" },
      { en: "Neem flowers & leaves", te: "వేప పువ్వులు, వేప ఆకులు" },
      { en: "Ugadi pachadi (six tastes)", te: "ఉగాది పచ్చడి — ఆరు రుచులు" },
      { en: "Tamarind, chilli, salt, jaggery", te: "చింతపండు, మిరపకాయ, ఉప్పు, బెల్లం" },
      { en: "Panchangam", te: "పంచాంగం" },
    ],
  },
  {
    id: "rama-navami",
    kind: "festival",
    titleEn: "Sri Rama Navami",
    titleTe: "శ్రీరామ నవమి పూజ",
    kitSlug: "rama-navami-special-samagri",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Rama, Sita, Lakshmana, Hanuman pictures", te: "రామ, సీత, లక్ష్మణ, హనుమ చిత్రాలు" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Panakam & vadapappu", te: "పానకం, వడపప్పు" },
      { en: "Jaggery & tamarind", te: "బెల్లం, చింతపండు" },
    ],
  },
  {
    id: "hanuman",
    kind: "festival",
    titleEn: "Hanuman Jayanti",
    titleTe: "హనుమాన్ జయంతి",
    kitSlug: "hanuman-jayanti-special-samagri",
    special: [
      { en: "Hanuman vigraham", te: "హనుమంతుడి విగ్రహం / చిత్రం" },
      { en: "Sindoor", te: "సింధూరం" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Vada, panakam, jaggery", te: "వడలు, పానకం, బెల్లం" },
    ],
  },
  {
    id: "akshaya-tritiya",
    kind: "festival",
    titleEn: "Akshaya Tritiya",
    titleTe: "అక్షయ తృతీయ పూజ",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Lakshmi & Vishnu pictures", te: "లక్ష్మీదేవి, విష్ణుమూర్తి చిత్రాలు" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Gold / silver item if custom", te: "బంగారం / వెండి వస్తువు" },
      { en: "Grains", te: "ధాన్యం" },
    ],
  },
  {
    id: "narasimha",
    kind: "festival",
    titleEn: "Narasimha Jayanti",
    titleTe: "నరసింహ జయంతి",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Narasimha swami picture", te: "నరసింహ స్వామి చిత్రం" },
      { en: "Lakshmi Devi", te: "లక్ష్మీదేవి" },
      { en: "Tulasi dalas", te: "తులసి దళాలు" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "varalakshmi",
    kind: "vratham",
    titleEn: "Varalakshmi vratam",
    titleTe: "వరలక్ష్మీ వ్రతం",
    kitSlug: "varalakshmi-vratam-samagri",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Ammavari face / pratima", te: "లక్ష్మీదేవి ముఖం / విగ్రహం" },
      { en: "Saree, blouse, jewellery", te: "చీర, రవిక, నగలు" },
      { en: "Thoram, tali bottu", te: "తోరం, తాళిబొట్టు" },
      { en: "Vayanam samagri", te: "వాయనం సామగ్రి" },
    ],
  },
  {
    id: "janmashtami",
    kind: "festival",
    titleEn: "Sri Krishna Janmashtami",
    titleTe: "శ్రీకృష్ణ జన్మాష్టమి",
    kitSlug: "janmashtami-special-samagri",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Krishna vigraham & swing", te: "శ్రీకృష్ణుడి విగ్రహం, ఉయ్యాల" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Butter, milk, curd, poha", te: "వెన్న, పాలు, పెరుగు, అటుకులు" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "navratri",
    kind: "festival",
    titleEn: "Navratri pooja",
    titleTe: "నవరాత్రి పూజ",
    kitSlug: "navratri-special-samagri",
    special: [
      { en: "Durga Devi picture", te: "దుర్గాదేవి చిత్రం / విగ్రహం" },
      { en: "Kalasham", te: "కలశం" },
      { en: "Saree, blouse, bangles", te: "చీర, రవిక, గాజులు" },
      { en: "Turmeric roots", te: "పసుపు కొమ్ములు" },
    ],
  },
  {
    id: "vijayadashami",
    kind: "festival",
    titleEn: "Dasara / Vijayadashami",
    titleTe: "దసరా / విజయదశమి",
    kitSlug: "navratri-special-samagri",
    special: [
      { en: "Ammavari picture", te: "దుర్గాదేవి / అమ్మవారి చిత్రం" },
      { en: "Ayudhams / books / vehicles", te: "ఆయుధాలు / పుస్తకాలు / వాహనాలు" },
      { en: "Marigold flowers", te: "బంతిపూలు" },
    ],
  },
  {
    id: "diwali",
    kind: "festival",
    titleEn: "Deepavali Lakshmi pooja",
    titleTe: "దీపావళి లక్ష్మీ పూజ",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Lakshmi & Ganapati vigrahams", te: "లక్ష్మీదేవి, గణపతి విగ్రహాలు" },
      { en: "Lotus flowers if available", te: "కమల పువ్వులు" },
      { en: "Coins, new account books", te: "నాణేలు, కొత్త ఖాతా పుస్తకాలు" },
      { en: "Diyas, oil, wicks", te: "దీపాలు, నూనె, వత్తులు" },
    ],
  },
  {
    id: "kartika-deepam",
    kind: "festival",
    titleEn: "Kartika Deepotsavam",
    titleTe: "కార్తీక దీపోత్సవం",
    kitSlug: "kartika-special-samagri",
    special: [
      { en: "Clay diyas", te: "మట్టి దీపాలు" },
      { en: "Oil & wicks", te: "నూనె, వత్తులు" },
      { en: "Bilva leaves & tulasi", te: "బిల్వదళాలు, తులసి" },
    ],
  },
  {
    id: "kartika-somavara",
    kind: "vratham",
    titleEn: "Kartika Somavara pooja",
    titleTe: "కార్తీక సోమవారం పూజ",
    deityKitSlug: "shiva-special-samagri",
    kitSlug: "kartika-special-samagri",
    special: [
      { en: "Shivalingam", te: "శివలింగం" },
      { en: "Bilva leaves", te: "బిల్వదళాలు" },
      { en: "Diyas for Kartika", te: "కార్తీక దీపాలు" },
    ],
  },
  {
    id: "dhanurmasa",
    kind: "festival",
    titleEn: "Dhanurmasa pooja",
    titleTe: "ధనుర్మాస పూజ",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Vishnu / Andal pictures", te: "విష్ణుమూర్తి, ఆండాళ్ చిత్రాలు" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Sakkara pongal naivedyam", te: "చక్కెర పొంగలి" },
    ],
  },
  {
    id: "vaikuntha-ekadashi",
    kind: "festival",
    titleEn: "Vaikuntha Ekadashi",
    titleTe: "వైకుంఠ ఏకాదశి పూజ",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Vishnu & Lakshmi pictures", te: "శ్రీమహావిష్ణువు, లక్ష్మీదేవి" },
      { en: "Shankh & chakra if custom", te: "శంఖం, చక్రం" },
      { en: "Tulasi dalas", te: "తులసి దళాలు" },
    ],
  },
  {
    id: "parvati",
    kind: "deity",
    titleEn: "Parvati pooja",
    titleTe: "పార్వతి పూజ",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Parvati picture", te: "పార్వతీదేవి చిత్రం" },
      { en: "Saree, blouse, bangles, tali", te: "చీర, రవిక, గాజులు, తాళిబొట్టు" },
      { en: "Turmeric roots", te: "పసుపు కొమ్ములు" },
    ],
  },
  {
    id: "vishnu",
    kind: "deity",
    titleEn: "Vishnu pooja",
    titleTe: "విష్ణు పూజ",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Vishnu & Lakshmi pictures", te: "విష్ణుమూర్తి, లక్ష్మీదేవి" },
      { en: "Tulasi dalas", te: "తులసి దళాలు" },
      { en: "Shankh & chakra", te: "శంఖం, చక్రం" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "lakshmi",
    kind: "deity",
    titleEn: "Lakshmi pooja",
    titleTe: "లక్ష్మీ పూజ",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Lakshmi vigraham", te: "లక్ష్మీదేవి విగ్రహం" },
      { en: "Lotus flowers", te: "కమల పూలు" },
      { en: "Coins & grains", te: "నాణేలు, ధాన్యం" },
      { en: "Kalasham", te: "కలశం" },
    ],
  },
  {
    id: "saraswati",
    kind: "deity",
    titleEn: "Saraswati pooja",
    titleTe: "సరస్వతి పూజ",
    kitSlug: "saraswati-special-samagri",
    special: [
      { en: "Saraswati picture", te: "సరస్వతీదేవి చిత్రం" },
      { en: "Books, pens, notebooks", te: "పుస్తకాలు, పెన్నులు, నోట్‌బుక్స్" },
      { en: "White flowers", te: "తెల్లని పూలు" },
    ],
  },
  {
    id: "venkateswara",
    kind: "deity",
    titleEn: "Venkateswara swami pooja",
    titleTe: "వెంకటేశ్వర స్వామి పూజ",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Venkateswara, Sridevi, Bhudevi", te: "వెంకటేశ్వరుడు, శ్రీదేవి, భూదేవి" },
      { en: "Tulasi dalas", te: "తులసి దళాలు" },
      { en: "Laddu & pulihora", te: "లడ్డూ, పులిహోర" },
      { en: "Panchamritam", te: "పంచామృతం" },
    ],
  },
  {
    id: "surya",
    kind: "deity",
    titleEn: "Surya pooja / Surya namaskaram",
    titleTe: "సూర్య పూజ / సూర్య నమస్కారం",
    kitSlug: "surya-special-samagri",
    special: [
      { en: "Copper chembu & vessel", te: "రాగి చెంబు, రాగి పాత్ర" },
      { en: "Red flowers", te: "ఎర్ర పూలు" },
      { en: "Red sandal", te: "ఎర్ర చందనం" },
      { en: "Jaggery & wheat", te: "బెల్లం, గోధుమలు" },
    ],
  },
  {
    id: "navagraha",
    kind: "deity",
    titleEn: "Navagraha pooja",
    titleTe: "నవగ్రహ పూజ",
    kitSlug: "navagraha-special-samagri",
    special: [
      { en: "Navagraha mandala / vigrahams", te: "నవగ్రహ మండలం / విగ్రహాలు" },
      { en: "Nine grains (navadhanyalu)", te: "9 రకాల ధాన్యాలు" },
      { en: "Nine-colour vastras", te: "9 రంగుల వస్త్రాలు" },
    ],
    noteEn: "Each graha has its own grain, flower, cloth and naivedyam — follow your pujari.",
    noteTe: "ప్రతి గ్రహానికి ధాన్యం, పుష్పం, వస్త్రం, నైవేద్యం పురోహితుల సూచన ప్రకారం సిద్ధం చేయండి.",
  },
  {
    id: "tulasi",
    kind: "deity",
    titleEn: "Tulasi pooja",
    titleTe: "తులసి పూజ",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Tulasi plant", te: "తులసి మొక్క" },
      { en: "Tulasi dalas", te: "తులసి దళాలు" },
    ],
  },
  {
    id: "go-pooja",
    kind: "festival",
    titleEn: "Go pooja",
    titleTe: "గో పూజ",
    special: [
      { en: "Garland for Gomata", te: "గోమాతకు పూలమాల" },
      { en: "Fresh grass", te: "పచ్చిగడ్డి" },
      { en: "Banana leaf, bananas, jaggery", te: "అరటి ఆకులు, అరటిపండ్లు, బెల్లం" },
    ],
  },
  {
    id: "deepa",
    kind: "deity",
    titleEn: "Deepa pooja",
    titleTe: "దీప పూజ",
    kitSlug: "kartika-special-samagri",
    special: [
      { en: "Diyas, oil/ghee, wicks", te: "దీపాలు, నూనె / నెయ్యి, వత్తులు" },
    ],
  },
  {
    id: "kuladevata",
    kind: "deity",
    titleEn: "Kuladevata pooja",
    titleTe: "కులదేవత పూజ",
    special: [
      { en: "Family deity picture", te: "కులదేవత విగ్రహం / చిత్రం" },
      { en: "Kalasham", te: "కలశం" },
    ],
    noteEn: "This varies by family custom — follow your household pujari.",
    noteTe: "ఇది కుటుంబ సంప్రదాయం ఆధారంగా మారుతుంది. ఇంటి పురోహితుల విధానాన్ని అనుసరించండి.",
  },
  {
    id: "gramadevata",
    kind: "festival",
    titleEn: "Gramadevata pooja",
    titleTe: "గ్రామదేవత పూజ",
    special: [
      { en: "Gramadevata picture", te: "గ్రామదేవత విగ్రహం / చిత్రం" },
    ],
    noteEn: "Village custom differs by region — follow the local pujari.",
    noteTe: "గ్రామదేవత సంప్రదాయం ప్రాంతానుసారం భిన్నంగా ఉంటుంది. స్థానిక పురోహితులను అనుసరించండి.",
  },
  {
    id: "mangala-gauri",
    kind: "vratham",
    titleEn: "Mangala Gauri vratam",
    titleTe: "మంగళగౌరీ వ్రతం",
    kitSlug: "mangala-gauri-samagri",
    special: [
      { en: "Gauri Devi / turmeric Gauri", te: "గౌరీదేవి / పసుపుతో గౌరీ" },
      { en: "Saree, blouse, bangles, tali", te: "చీర, రవిక, గాజులు, తాళిబొట్టు" },
      { en: "Thoram & vayanam", te: "తోరం, వాయనం సామగ్రి" },
    ],
  },
  {
    id: "sravana-mangalavaram",
    kind: "vratham",
    titleEn: "Sravana Mangalavaram vratam",
    titleTe: "శ్రావణ మంగళవారం వ్రతం",
    kitSlug: "mangala-gauri-samagri",
    special: [
      { en: "Gauri Devi picture", te: "గౌరీదేవి చిత్రం" },
      { en: "Turmeric roots, bangles", te: "పసుపు కొమ్ములు, గాజులు" },
      { en: "Vratam thread", te: "వ్రత దారం" },
    ],
  },
  {
    id: "sravana-shukravaram",
    kind: "vratham",
    titleEn: "Sravana Shukravaram vratam",
    titleTe: "శ్రావణ శుక్రవారం వ్రతం",
    kitSlug: "varalakshmi-vratam-samagri",
    deityKitSlug: "lakshmi-special-samagri",
    special: [
      { en: "Lakshmi / Varalakshmi picture", te: "లక్ష్మీదేవి / వరలక్ష్మీ చిత్రం" },
      { en: "Saree, blouse, bangles", te: "చీర, రవిక, గాజులు" },
      { en: "Vayanam", te: "వాయనం" },
    ],
  },
  {
    id: "saubhagya",
    kind: "vratham",
    titleEn: "Saubhagya vratam",
    titleTe: "సౌభాగ్య వ్రతం",
    kitSlug: "mangala-gauri-samagri",
    special: [
      { en: "Gauri / Parvati picture", te: "గౌరీ / పార్వతి దేవి చిత్రం" },
      { en: "Tali, saree, bangles", te: "తాళిబొట్టు, చీర, గాజులు" },
      { en: "Vratam thread", te: "వ్రత దారం" },
    ],
  },
  {
    id: "vata-savitri",
    kind: "vratham",
    titleEn: "Vata Savitri vratam",
    titleTe: "వటసావిత్రి వ్రతం",
    kitSlug: "vata-savitri-samagri",
    special: [
      { en: "Banyan tree (vatavriksha)", te: "మర్రి చెట్టు / వటవృక్షం" },
      { en: "Turmeric vratam thread", te: "పసుపు దారం / వ్రత దారం" },
      { en: "Saubhagya samagri", te: "సౌభాగ్య సామగ్రి" },
      { en: "Vratam katha", te: "వ్రత కథ" },
    ],
  },
  {
    id: "haridra-gauri",
    kind: "vratham",
    titleEn: "Haridra Gauri vratam",
    titleTe: "హరిద్రా గౌరీ వ్రతం",
    kitSlug: "mangala-gauri-samagri",
    special: [
      { en: "Gauri Devi", te: "గౌరీదేవి" },
      { en: "Turmeric roots, bangles, saree", te: "పసుపు కొమ్ములు, గాజులు, చీర" },
      { en: "Vratam thread", te: "వ్రత దారం" },
    ],
  },
  {
    id: "uma-maheshwara",
    kind: "vratham",
    titleEn: "Uma Maheshwara vratam",
    titleTe: "ఉమామహేశ్వర వ్రతం",
    deityKitSlug: "shiva-special-samagri",
    special: [
      { en: "Uma–Maheshwara pictures", te: "ఉమాదేవి – మహేశ్వరుని చిత్రాలు" },
      { en: "Bilva leaves", te: "బిల్వదళాలు" },
      { en: "Panchamritam", te: "పంచామృతం" },
      { en: "Vratam thread", te: "వ్రత దారం" },
    ],
  },
  {
    id: "santoshi",
    kind: "vratham",
    titleEn: "Santoshi Mata vratam",
    titleTe: "సంతోషిమాత వ్రతం",
    kitSlug: "santoshi-mata-samagri",
    special: [
      { en: "Santoshi Mata picture", te: "సంతోషిమాత చిత్రం" },
      { en: "Jaggery & chickpeas", te: "బెల్లం + శెనగలు" },
      { en: "Vratam katha book", te: "వ్రత కథ పుస్తకం" },
    ],
    noteEn: "Jaggery and chickpeas are the main naivedyam for this vratam.",
    noteTe: "సంతోషిమాత వ్రతంలో బెల్లం + శెనగలు ముఖ్యమైన నైవేద్యం.",
  },
  {
    id: "anantha",
    kind: "vratham",
    titleEn: "Anantha Padmanabha vratam",
    titleTe: "అనంత పద్మనాభ వ్రతం",
    kitSlug: "anantha-padmanabha-samagri",
    deityKitSlug: "vishnu-special-samagri",
    special: [
      { en: "Anantha Padmanabha picture", te: "అనంత పద్మనాభ స్వామి చిత్రం" },
      { en: "Tulasi", te: "తులసి" },
      { en: "Anantha thread with 14 knots", te: "14 ముడుల అనంత దారం" },
      { en: "Vratam katha", te: "వ్రత కథ" },
    ],
  },
];

export function poojaGuideById(id: string) {
  return poojaGuides.find((g) => g.id === id);
}

export function guidesByKind(kind: PoojaKind) {
  return poojaGuides.filter((g) => g.kind === kind);
}

export const kindLabels: Record<PoojaKind, { en: string; te: string }> = {
  deity: { en: "Deity pooja", te: "దేవత పూజలు" },
  festival: { en: "Festivals", te: "పండుగలు" },
  vratham: { en: "Vratams", te: "వ్రతాలు" },
};

export const poojaGuideCopy = {
  title: { en: "Pooja samagri by pooja", te: "పూజ ప్రకారం సామగ్రి" },
  subtitle: {
    en: "Start with the basic kit used in every home pooja. Add a deity or festival kit only for the extras that pooja needs.",
    te: "అన్ని పూజలకు కామన్ బేసిక్ కిట్‌తో మొదలుపెట్టండి. ఆ పూజకు మాత్రమే కావాల్సిన అదనపు వస్తువుల కిట్ జోడించండి.",
  },
  basicKit: { en: "Buy basic pooja kit", te: "బేసిక్ పూజా కిట్ కొనండి" },
  pairHint: {
    en: "These extras go with the common samagri — turmeric, kumkum, flowers, camphor, and the rest of the basic kit.",
    te: "ఈ అదనపు వస్తువులు కామన్ సామగ్రితో కలిపి ఉపయోగిస్తారు — పసుపు, కుంకుమ, పూలు, కర్పూరం.",
  },
  special: { en: "Special for this pooja", te: "ఈ పూజకు ప్రత్యేకం" },
  deityKit: { en: "Deity extras kit", te: "దేవత ప్రత్యేక కిట్" },
  festivalKit: { en: "Festival / vratam kit", te: "పండుగ / వ్రత కిట్" },
  common: { en: "Common items", te: "కామన్ వస్తువులు" },
  commonNeeded: {
    en: "Also keep the everyday pooja items listed under Common.",
    te: "రోజువారీ పూజా వస్తువులు కూడా అవసరం (కామన్ జాబితా).",
  },
  viewCommon: { en: "View common samagri", te: "కామన్ సామగ్రి చూడండి" },
  disclaimer: {
    en: "Items can vary by region, family custom, and your pujari’s vidhi.",
    te: "ప్రాంతం, కుటుంబ ఆచారం, పురోహితుల సూచనల ప్రకారం కొన్ని వస్తువులు మారవచ్చు.",
  },
  browse: { en: "Browse by pooja", te: "పూజ ప్రకారం చూడండి" },
};

export function loc(locale: string, pair: { en: string; te: string }) {
  return locale === "te" ? pair.te : pair.en;
}
