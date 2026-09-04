import {
  CurrencyCode,
  Market,
  PrismaClient,
  ProductType,
} from '@prisma/client';

const CATALOG = 'pooja-samagri';

type SamagriItem = {
  nameEn: string;
  nameTe: string;
  quantity: number;
  packEn?: string;
  packTe?: string;
  optional?: boolean;
};

type SamagriProduct = {
  slug: string;
  type: ProductType;
  sortOrder: number;
  nameEn: string;
  nameTe: string;
  descriptionEn: string;
  descriptionTe: string;
  priceMinor: number;
  mrpMinor: number;
  items: SamagriItem[];
};

const generalItems: SamagriItem[] = [
  { nameEn: 'Turmeric (Pasupu)', nameTe: 'పసుపు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Kumkum', nameTe: 'కుంకుమ', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Ghee', nameTe: 'నెయ్యి', quantity: 1 },
  { nameEn: 'Incense sticks', nameTe: 'అగరబత్తీలు', quantity: 1, packEn: '1 pack', packTe: '1 ప్యాక్' },
  { nameEn: 'Mango leaves', nameTe: 'మామిడాకులు', quantity: 1, packEn: '1 bunch', packTe: '1 ప్రతి' },
  { nameEn: 'Toranam', nameTe: 'తోరణం', quantity: 1, packEn: '1 × 5', packTe: '1×5' },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 2 },
  { nameEn: 'Blouse pieces', nameTe: 'జాకెట్టు పిసులు', quantity: 2 },
  { nameEn: 'Rice', nameTe: 'బియ్యం', quantity: 1, packEn: '3–5 kg', packTe: '3–5 కిలోలు' },
  { nameEn: 'Dried coconuts', nameTe: 'ఎండిన కొబ్బరికాయలు', quantity: 5 },
  { nameEn: 'Betel nuts (Vakkalu)', nameTe: 'వక్కలు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Cashews', nameTe: 'జీడిపప్పు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Betel leaves', nameTe: 'తామలపాకులు', quantity: 1, optional: true },
  { nameEn: 'Bananas', nameTe: 'అరటిపండ్లు', quantity: 1, optional: true },
  { nameEn: 'Sugarcane', nameTe: 'చెరకు (కర్ర)', quantity: 1 },
  { nameEn: 'Sacred thread', nameTe: 'దారం', quantity: 1 },
  { nameEn: 'Yajnopavita', nameTe: 'యజ్ఞోపవీతం', quantity: 2 },
  { nameEn: 'Loose flowers', nameTe: 'విడిపూలు / పువ్వులు', quantity: 1, optional: true },
  { nameEn: 'Flower garland', nameTe: 'పూల మాల', quantity: 1, optional: true },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 2 },
  { nameEn: 'White thread', nameTe: 'తెల్ల దారం', quantity: 1 },
  { nameEn: 'Vibhuti', nameTe: 'విభూతి', quantity: 1, optional: true },
  { nameEn: 'Akshatalu (turmeric rice)', nameTe: 'అక్షతలు (పసుపు)', quantity: 1 },
  { nameEn: 'Diya wicks', nameTe: 'దివ్వి వత్తులు', quantity: 5 },
  { nameEn: 'Oil', nameTe: 'నూనె', quantity: 1, packEn: '2 liters', packTe: '2 లీటర్లు' },
  { nameEn: 'Turmeric & durva grass', nameTe: 'పసుపు, గరిక', quantity: 1, optional: true },
  { nameEn: 'Akhanda deepam', nameTe: 'అఖండ దీపం', quantity: 1 },
  { nameEn: 'Camphor', nameTe: 'కర్పూరం', quantity: 1 },
  { nameEn: 'Cotton wicks', nameTe: 'వత్తులు', quantity: 1 },
  { nameEn: 'Plates', nameTe: 'పళ్ళెలు', quantity: 2 },
  { nameEn: 'Arati plate', nameTe: 'హారతి పళ్లెం', quantity: 1 },
  { nameEn: 'Sandal paste (Gandham)', nameTe: 'గంధం', quantity: 1 },
  { nameEn: 'Prasadam', nameTe: 'ప్రసాదాలు', quantity: 1, optional: true },
  { nameEn: 'Small diyas / wicks', nameTe: 'చిన్న దివ్వెలు / వత్తులు', quantity: 1, packEn: '1 pack', packTe: '1 ప్యాక్' },
];

const basicPoojaItems: SamagriItem[] = [
  { nameEn: 'Turmeric (Pasupu)', nameTe: 'పసుపు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Kumkum', nameTe: 'కుంకుమ', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Sandal paste (Gandham)', nameTe: 'గంధం', quantity: 1 },
  { nameEn: 'Akshatalu (turmeric rice)', nameTe: 'అక్షింతలు', quantity: 1 },
  { nameEn: 'Loose flowers', nameTe: 'పూలు', quantity: 1 },
  { nameEn: 'Betel leaves', nameTe: 'తమలపాకులు', quantity: 1 },
  { nameEn: 'Betel nuts (Vakkalu)', nameTe: 'వక్కలు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 1 },
  { nameEn: 'Fruits', nameTe: 'పండ్లు', quantity: 1 },
  { nameEn: 'Camphor', nameTe: 'కర్పూరం', quantity: 1 },
  { nameEn: 'Incense sticks', nameTe: 'అగరబత్తీలు', quantity: 1, packEn: '1 pack', packTe: '1 ప్యాక్' },
  { nameEn: 'Cotton wicks', nameTe: 'వత్తులు', quantity: 1 },
  { nameEn: 'Oil', nameTe: 'నూనె', quantity: 1 },
  { nameEn: 'Akhanda deepam', nameTe: 'దీపం', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
];

const ganeshHomePujaItems: SamagriItem[] = [
  { nameEn: 'Turmeric (Pasupu)', nameTe: 'పసుపు', quantity: 1, packEn: '50g', packTe: '50 గ్రాములు' },
  { nameEn: 'Kumkum', nameTe: 'కుంకుమ', quantity: 1, packEn: '50g', packTe: '50 గ్రాములు' },
  { nameEn: 'Bukka gulal', nameTe: 'బుక్కా గులాల్', quantity: 1, packEn: '50g', packTe: '50 గ్రాములు' },
  { nameEn: 'Large wick', nameTe: 'పెద్ద వత్తి', quantity: 1 },
  { nameEn: 'Incense sticks', nameTe: 'అగరబత్తులు', quantity: 1, packEn: '1 packet', packTe: '1 ప్యాకెట్' },
  { nameEn: 'Oil', nameTe: 'నూనె', quantity: 1, packEn: '500 ml', packTe: '500 మి.లీ.' },
  { nameEn: 'Camphor', nameTe: 'కర్పూరం', quantity: 1, packEn: '25g', packTe: '25 గ్రాములు' },
  { nameEn: 'Cotton vastra', nameTe: 'పత్తి వస్త్రం', quantity: 1 },
  { nameEn: 'Betel nuts (Vakkalu)', nameTe: 'వక్కలు', quantity: 12 },
  { nameEn: 'Dates', nameTe: 'ఖర్జూరాలు', quantity: 12 },
  { nameEn: 'Sambrani', nameTe: 'సాంబ్రాణి', quantity: 1, packEn: '50g', packTe: '50 గ్రాములు' },
  { nameEn: 'Attar', nameTe: 'అత్తరు', quantity: 1 },
  { nameEn: 'Rose water', nameTe: 'పన్నీరు', quantity: 1 },
  { nameEn: 'Honey', nameTe: 'తేనె', quantity: 1 },
  { nameEn: 'Ghee', nameTe: 'నెయ్యి', quantity: 1 },
  { nameEn: 'Sandal paste (Gandham)', nameTe: 'గంధం', quantity: 1, packEn: '30g', packTe: '30 గ్రాములు' },
  { nameEn: 'White cloth', nameTe: 'తెల్ల బట్ట', quantity: 1 },
  { nameEn: 'Kankana thread', nameTe: 'కంకణాల దారం', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 11 },
  { nameEn: 'Dried coconuts', nameTe: 'కుడుకలు', quantity: 2 },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 2 },
];

const ganeshPoojaItems: SamagriItem[] = [
  { nameEn: 'Turmeric (Pasupu)', nameTe: 'పసుపు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Kumkum', nameTe: 'కుంకుమ', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Sandal paste (Gandham)', nameTe: 'గంధం', quantity: 1 },
  { nameEn: 'Incense sticks', nameTe: 'అగరవత్తులు', quantity: 1, packEn: '1 pack', packTe: '1 ప్యాక్' },
  { nameEn: 'Camphor', nameTe: 'హారతి కర్పూరం', quantity: 1, packEn: '1 large', packTe: '1 పెద్దది' },
  { nameEn: 'Dhoti', nameTe: 'దోవతి', quantity: 1, packEn: '9×5', packTe: '9×5' },
  { nameEn: 'Sela (shawl)', nameTe: 'శేల', quantity: 1 },
  { nameEn: 'Dried coconuts', nameTe: 'ఎండిన కుడకలు', quantity: 5 },
  { nameEn: 'Betel nuts (Vakkalu)', nameTe: 'వక్కలు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Dates', nameTe: 'ఖర్జూరాలు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1, packEn: '100g', packTe: '100గ్రా' },
  { nameEn: 'Betel leaves', nameTe: 'తమలపాకులు', quantity: 1, optional: true },
  { nameEn: 'Bananas', nameTe: 'అరటిపండ్లు', quantity: 1, optional: true },
  { nameEn: 'Copper pot (Chembu)', nameTe: 'చెంబు (రాగి)', quantity: 1, optional: true },
  { nameEn: 'Kankana thread', nameTe: 'కంకణ దారం', quantity: 1 },
  { nameEn: 'Yajnopavita', nameTe: 'యజ్ఞోపవీతం', quantity: 2, packEn: '1 large, 1 small', packTe: 'పెద్దది, చిన్నది' },
  { nameEn: 'Loose flowers', nameTe: 'విడి పువ్వులు', quantity: 1, optional: true },
  { nameEn: 'Flower garland', nameTe: 'పూల దండలు', quantity: 1, optional: true },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 2 },
  { nameEn: 'White thread', nameTe: 'తెల్ల దారం', quantity: 1 },
  { nameEn: 'Navadhanyalu', nameTe: 'నవధాన్యాలు', quantity: 1, packEn: '1/2 kg', packTe: '1/2 కిలో' },
  { nameEn: 'Akhanda deepam', nameTe: 'అఖండ దీపం (మట్టిది)', quantity: 1 },
  { nameEn: 'Diya wicks', nameTe: 'దీపం వత్తులు', quantity: 5 },
  { nameEn: 'Oil', nameTe: 'నూనె', quantity: 1, packEn: '2 liters', packTe: '2 లీటర్లు' },
  { nameEn: 'Turmeric & durva grass', nameTe: 'పత్రి, గరిక', quantity: 1, optional: true },
  { nameEn: 'Bell', nameTe: 'గంట', quantity: 1, optional: true },
  { nameEn: 'Arati plate', nameTe: 'హారతి ప్లేటు', quantity: 1, optional: true },
  { nameEn: 'Plates', nameTe: 'ట్రేలు', quantity: 2, optional: true },
  { nameEn: 'Glasses', nameTe: 'గ్లాసులు', quantity: 2, optional: true },
  { nameEn: 'Undrallu', nameTe: 'ఉండ్రాళ్లు', quantity: 1, optional: true },
  { nameEn: 'Laddu', nameTe: 'లడ్డూ', quantity: 1, optional: true },
  { nameEn: 'Small diyas / wicks', nameTe: 'చిన్న దీపాలు', quantity: 1 },
  { nameEn: 'Cotton wicks', nameTe: 'వత్తులు', quantity: 1, packEn: '1 pack', packTe: '1 ప్యాక్' },
];

const ganeshHomamItems: SamagriItem[] = [
  // Sourced from docs/pooja_samagri.xlsx → "గణేష్ పూజ హోమం సామాగ్రి"
  { nameEn: 'Homa powder', nameTe: 'హోమం పొడి', quantity: 1, packEn: '1 kg', packTe: '1కిలో' },
  { nameEn: 'Poha (Atukulu)', nameTe: 'అటుకులు', quantity: 1, packEn: '1/2 kg', packTe: '1/2కిలో' },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Navadhanyalu', nameTe: 'నవధాన్యాలు', quantity: 1 },
  { nameEn: 'Rice flour', nameTe: 'బియ్యం పిండి', quantity: 1 },
  { nameEn: 'Purnahuti', nameTe: 'పూర్ణాహుతి', quantity: 1 },
  { nameEn: 'Betel leaves', nameTe: 'తామలపాకులు', quantity: 1 },
  { nameEn: 'Fruits', nameTe: 'పండ్లు', quantity: 1 },
  { nameEn: 'Flowers', nameTe: 'పువ్వులు', quantity: 1 },
  { nameEn: 'Dry fruits', nameTe: 'డ్రై ఫ్రూట్స్', quantity: 1 },
  { nameEn: 'Samithalu (homa sticks)', nameTe: 'సమితలు', quantity: 1 },
  { nameEn: 'Ghee', nameTe: 'నెయ్యి', quantity: 1 },
  { nameEn: 'Arati camphor', nameTe: 'హారతి కర్పూరం', quantity: 1 },
  { nameEn: 'Isthari leaves (Durva)', nameTe: 'ఇస్తరి ఆకులు', quantity: 1 },
  { nameEn: 'Homa stand', nameTe: 'హోమం స్టాండ్', quantity: 1 },
  { nameEn: 'Dhoti', nameTe: 'ధోతి', quantity: 1 },
  { nameEn: 'Blouse piece (Jacket piece)', nameTe: 'జాకెట్ పీసు', quantity: 1 },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 2 },
];

const varalakshmiItems: SamagriItem[] = [
  { nameEn: 'Turmeric', nameTe: 'పసుపు', quantity: 1 },
  { nameEn: 'Kumkum', nameTe: 'కుంకుమ', quantity: 1 },
  { nameEn: 'Sandal paste', nameTe: 'గంధం', quantity: 1 },
  { nameEn: 'Akshintalu', nameTe: 'అక్షింతలు', quantity: 1 },
  { nameEn: 'Betel leaves', nameTe: 'తమలపాకులు', quantity: 1 },
  { nameEn: 'Betel nuts', nameTe: 'వక్కలు', quantity: 1 },
  { nameEn: 'Flowers', nameTe: 'పూలు', quantity: 1 },
  { nameEn: 'Fruits', nameTe: 'పండ్లు', quantity: 1 },
  { nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', quantity: 2 },
  { nameEn: 'Bananas', nameTe: 'అరటిపండ్లు', quantity: 1 },
  { nameEn: 'Kalasham', nameTe: 'కలశం', quantity: 1 },
  { nameEn: 'Water for kalasham', nameTe: 'కలశం కోసం నీరు', quantity: 1 },
  { nameEn: 'Mango leaves', nameTe: 'మామిడాకులు', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1 },
  { nameEn: 'Dried coconut', nameTe: 'ఎండు కొబ్బరి', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Sweets for naivedyam', nameTe: 'నైవేద్యం కోసం స్వీట్లు', quantity: 1 },
  { nameEn: 'Incense sticks', nameTe: 'అగరబత్తీలు', quantity: 1 },
  { nameEn: 'Camphor', nameTe: 'కర్పూరం', quantity: 1 },
  { nameEn: 'Ghee', nameTe: 'నెయ్యి', quantity: 1 },
  { nameEn: 'Deepam', nameTe: 'దీపం', quantity: 1 },
  { nameEn: 'Wicks', nameTe: 'వత్తులు', quantity: 1 },
  { nameEn: 'Puja vastras', nameTe: 'పూజా వస్త్రాలు', quantity: 1 },
  { nameEn: 'Varalakshmi Ammavari face / pratima', nameTe: 'వరలక్ష్మీ అమ్మవారి ముఖం/ప్రతిమ', quantity: 1 },
  { nameEn: 'Varalakshmi vratam thoram', nameTe: 'వరలక్ష్మీ వ్రతం తోరం', quantity: 1 },
  { nameEn: 'Mango leaves for toranam', nameTe: 'తోరణం కోసం మామిడాకులు', quantity: 1 },
  { nameEn: 'Saree', nameTe: 'చీర', quantity: 1 },
  { nameEn: 'Blouse piece', nameTe: 'జాకెట్ పీస్', quantity: 1 },
  { nameEn: 'Bangles', nameTe: 'గాజులు', quantity: 1 },
  { nameEn: 'Small bowls for turmeric & kumkum', nameTe: 'పసుపు, కుంకుమ పెట్టుకునే చిన్న గిన్నెలు', quantity: 1 },
  { nameEn: 'Arati plate', nameTe: 'హారతి పళ్లెం', quantity: 1 },
  { nameEn: 'Bell', nameTe: 'గంట', quantity: 1 },
  { nameEn: 'Dhoopam', nameTe: 'ధూపం', quantity: 1 },
  { nameEn: 'Naivedyam vessels', nameTe: 'నైవేద్య పాత్రలు', quantity: 1 },
];

const commonExtraItems: SamagriItem[] = [
  { nameEn: 'Darbha grass', nameTe: 'దర్భ', quantity: 1 },
  { nameEn: 'Pavitram', nameTe: 'పవిత్రం', quantity: 1 },
  { nameEn: 'Panchapatra set', nameTe: 'పంచపాత్ర – ఉద్ధరణి', quantity: 1 },
  { nameEn: 'Kalash cloth', nameTe: 'కలశ వస్త్రం', quantity: 1 },
  { nameEn: 'Gangajal', nameTe: 'గంగాజలం', quantity: 1 },
  { nameEn: 'Honey', nameTe: 'తేనె', quantity: 1 },
  { nameEn: 'Sugar', nameTe: 'చక్కెర', quantity: 1 },
];

const ganapatiSpecialItems: SamagriItem[] = [
  { nameEn: '21 patri pack', nameTe: '21 రకాల పత్రి', quantity: 1 },
  { nameEn: 'Durva / isthari leaves', nameTe: 'దూర్వా గడ్డి', quantity: 1 },
  { nameEn: 'Undrallu', nameTe: 'ఉండ్రాళ్లు / మోదకం', quantity: 1 },
  { nameEn: 'Laddu', nameTe: 'లడ్డూ', quantity: 1 },
  { nameEn: 'Panchamritam pack', nameTe: 'పంచామృతం ప్యాక్', quantity: 1 },
];

const shivaSpecialItems: SamagriItem[] = [
  { nameEn: 'Bilva leaves', nameTe: 'బిల్వదళాలు', quantity: 1 },
  { nameEn: 'Vibhuti', nameTe: 'విభూది', quantity: 1 },
  { nameEn: 'Rudraksha mala', nameTe: 'రుద్రాక్షమాల', quantity: 1 },
  { nameEn: 'Panchamritam pack', nameTe: 'పంచామృతం ప్యాక్', quantity: 1 },
  { nameEn: 'Abhisheka patra', nameTe: 'అభిషేక పాత్ర', quantity: 1 },
  { nameEn: 'Gangajal', nameTe: 'గంగాజలం', quantity: 1 },
];

const lakshmiSpecialItems: SamagriItem[] = [
  { nameEn: 'Lotus flowers', nameTe: 'కమల పువ్వులు', quantity: 1 },
  { nameEn: 'Pooja coins', nameTe: 'పూజా నాణేలు', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1 },
  { nameEn: 'Kalasham', nameTe: 'కలశం', quantity: 1 },
  { nameEn: 'Grains', nameTe: 'ధాన్యం', quantity: 1 },
  { nameEn: 'Flower garland', nameTe: 'పూలమాల', quantity: 1 },
];

const vishnuSpecialItems: SamagriItem[] = [
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి దళాలు', quantity: 1 },
  { nameEn: 'Shankh', nameTe: 'శంఖం', quantity: 1 },
  { nameEn: 'Panchamritam pack', nameTe: 'పంచామృతం ప్యాక్', quantity: 1 },
  { nameEn: 'Laddu', nameTe: 'లడ్డూ', quantity: 1 },
];

const ugadiSpecialItems: SamagriItem[] = [
  { nameEn: 'Toranam', nameTe: 'మామిడి ఆకుల తోరణం', quantity: 1 },
  { nameEn: 'Mango leaves', nameTe: 'మామిడి ఆకులు', quantity: 1 },
  { nameEn: 'Neem flowers', nameTe: 'వేప పువ్వులు', quantity: 1 },
  { nameEn: 'Ugadi pachadi pack', nameTe: 'ఉగాది పచ్చడి ప్యాక్', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Panchangam', nameTe: 'పంచాంగం', quantity: 1 },
];

const ramaNavamiSpecialItems: SamagriItem[] = [
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి', quantity: 1 },
  { nameEn: 'Panakam mix', nameTe: 'పానకం మిక్స్', quantity: 1 },
  { nameEn: 'Vadapappu', nameTe: 'వడపప్పు', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
];

const hanumanJayantiSpecialItems: SamagriItem[] = [
  { nameEn: 'Sindoor', nameTe: 'సింధూరం', quantity: 1 },
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Panakam mix', nameTe: 'పానకం మిక్స్', quantity: 1 },
];

const janmashtamiSpecialItems: SamagriItem[] = [
  { nameEn: 'Poha (Atukulu)', nameTe: 'అటుకులు', quantity: 1 },
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి', quantity: 1 },
  { nameEn: 'Panchamritam pack', nameTe: 'పంచామృతం ప్యాక్', quantity: 1 },
  { nameEn: 'Ghee', nameTe: 'వెన్న / నెయ్యి', quantity: 1 },
];

const navratriSpecialItems: SamagriItem[] = [
  { nameEn: 'Kalasham', nameTe: 'కలశం', quantity: 1 },
  { nameEn: 'Mango leaves', nameTe: 'మామిడి ఆకులు', quantity: 1 },
  { nameEn: 'Saree', nameTe: 'చీర', quantity: 1 },
  { nameEn: 'Bangles', nameTe: 'గాజులు', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1 },
  { nameEn: 'Flower garland', nameTe: 'పూలమాల', quantity: 1 },
];

const kartikaSpecialItems: SamagriItem[] = [
  { nameEn: 'Small diyas / wicks', nameTe: 'మట్టి దీపాలు', quantity: 1 },
  { nameEn: 'Oil', nameTe: 'నూనె', quantity: 1 },
  { nameEn: 'Cotton wicks', nameTe: 'వత్తులు', quantity: 1 },
  { nameEn: 'Bilva leaves', nameTe: 'బిల్వదళాలు', quantity: 1 },
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి', quantity: 1 },
];

const kedaraVratamItems: SamagriItem[] = [
  { nameEn: 'Kalasham', nameTe: 'కలశం', quantity: 1 },
  { nameEn: 'Mango leaves', nameTe: 'మామిడి ఆకులు', quantity: 1 },
  { nameEn: 'Bilva leaves', nameTe: 'బిల్వదళాలు', quantity: 1 },
  { nameEn: 'Vratam katha book', nameTe: 'వ్రత కథ పుస్తకం', quantity: 1 },
  { nameEn: 'Vratam thread', nameTe: 'తోరం / వ్రత దారం', quantity: 1 },
];

const mangalaGauriItems: SamagriItem[] = [
  { nameEn: 'Saree', nameTe: 'చీర', quantity: 1 },
  { nameEn: 'Bangles', nameTe: 'గాజులు', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1 },
  { nameEn: 'Vratam thread', nameTe: 'తోరం / వ్రత దారం', quantity: 1 },
  { nameEn: 'Puja vastras', nameTe: 'రవిక / వస్త్రాలు', quantity: 1 },
];

const vataSavitriItems: SamagriItem[] = [
  { nameEn: 'Vratam thread', nameTe: 'పసుపు దారం / వ్రత దారం', quantity: 1 },
  { nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', quantity: 1 },
  { nameEn: 'Bangles', nameTe: 'గాజులు', quantity: 1 },
  { nameEn: 'Vratam katha book', nameTe: 'వ్రత కథ', quantity: 1 },
];

const santoshiMataItems: SamagriItem[] = [
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Chickpeas', nameTe: 'శెనగలు', quantity: 1 },
  { nameEn: 'Vratam katha book', nameTe: 'వ్రత కథ పుస్తకం', quantity: 1 },
];

const ananthaPadmanabhaItems: SamagriItem[] = [
  { nameEn: 'Anantha thread', nameTe: 'అనంత దారం (14 ముడులు)', quantity: 1 },
  { nameEn: 'Tulasi leaves', nameTe: 'తులసి', quantity: 1 },
  { nameEn: 'Kalasham', nameTe: 'కలశం', quantity: 1 },
  { nameEn: 'Mango leaves', nameTe: 'మామిడి ఆకులు', quantity: 1 },
  { nameEn: 'Vratam katha book', nameTe: 'వ్రత కథ', quantity: 1 },
];

const saraswatiSpecialItems: SamagriItem[] = [
  { nameEn: 'Loose flowers', nameTe: 'తెల్లని పూలు', quantity: 1 },
  { nameEn: 'Books and pens pack', nameTe: 'పుస్తకాలు, పెన్నులు', quantity: 1 },
];

const suryaSpecialItems: SamagriItem[] = [
  { nameEn: 'Copper pot (Chembu)', nameTe: 'రాగి చెంబు', quantity: 1 },
  { nameEn: 'Red sandal', nameTe: 'ఎర్ర చందనం', quantity: 1 },
  { nameEn: 'Jaggery', nameTe: 'బెల్లం', quantity: 1 },
  { nameEn: 'Wheat', nameTe: 'గోధుమలు', quantity: 1 },
  { nameEn: 'Loose flowers', nameTe: 'ఎర్ర పూలు', quantity: 1 },
];

const navagrahaSpecialItems: SamagriItem[] = [
  { nameEn: 'Navagraha set', nameTe: 'నవగ్రహ మండలం', quantity: 1 },
  { nameEn: 'Navadhanyalu', nameTe: '9 రకాల ధాన్యాలు', quantity: 1 },
  { nameEn: 'Nine-colour vastras', nameTe: '9 రంగుల వస్త్రాలు', quantity: 1 },
];

function label(item: SamagriItem, locale: 'en' | 'te'): string {
  const name = locale === 'te' ? item.nameTe : item.nameEn;
  const pack = locale === 'te' ? item.packTe : item.packEn;
  return pack ? `${name} — ${pack}` : name;
}

const kits: SamagriProduct[] = [
  {
    slug: 'general-pooja-samagri-kit',
    type: ProductType.PUJA_KIT,
    sortOrder: 10,
    nameEn: 'Basic Pooja Samagri Kit',
    nameTe: 'సాధారణ పూజా సామగ్రి కిట్',
    descriptionEn:
      'Common samagri for almost every home pooja — turmeric, kumkum, gandham, akshintalu, flowers, camphor, diya, and naivedyam staples. Add a deity or festival kit for extras.',
    descriptionTe:
      'దాదాపు అన్ని ఇంటి పూజలకు కామన్ సామగ్రి — పసుపు, కుంకుమ, గంధం, అక్షింతలు, పూలు, కర్పూరం, దీపం. దేవత లేదా పండుగ కిట్ వేరుగా జోడించండి.',
    priceMinor: 129900,
    mrpMinor: 159900,
    items: basicPoojaItems,
  },
  {
    slug: 'ganesh-chaturthi-home-puja',
    type: ProductType.PUJA_KIT,
    sortOrder: 11,
    nameEn: 'Ganesh Chaturthi Home Puja Kit',
    nameTe: 'వినాయక చవితి ఇంటి పూజ కిట్',
    descriptionEn:
      'Home puja samagri for Vinayaka Chavithi — turmeric, kumkum, oil, camphor, vastra, and daily offerings. Mandapam and homam are separate kits.',
    descriptionTe:
      'వినాయక చవితి ఇంటి పూజా సామగ్రి — పసుపు, కుంకుమ, నూనె, కర్పూరం, వస్త్రం. మండపం, హోమం వేరు కిట్‌లు.',
    priceMinor: 75000,
    mrpMinor: 99900,
    items: ganeshHomePujaItems,
  },
  {
    slug: 'ganesh-chaturthi-pooja-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 12,
    nameEn: 'Ganesh Mandapam Kit',
    nameTe: 'గణేష్ మండపం కిట్',
    descriptionEn:
      'Mandapam / larger Vinayaka Chavithi samagri — dhoti, sela, clay akhanda deepam, navadhanyalu, and the full diary list. Optional items are chosen at checkout. Homam is a separate kit.',
    descriptionTe:
      'మండపం / పెద్ద వినాయక చవితి సామగ్రి — దోవతి, శేల, మట్టి అఖండ దీపం, నవధాన్యాలు. ఐచ్ఛిక వస్తువులు చెక్‌అవుట్‌లో ఎంచుకోవాలి. హోమం వేరు కిట్.',
    priceMinor: 149900,
    mrpMinor: 189900,
    items: ganeshPoojaItems,
  },
  {
    slug: 'ganesh-puja-homam-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 13,
    nameEn: 'Ganesh Puja Homam Samagri Kit',
    nameTe: 'గణేష్ పూజ హోమం సామాగ్రి కిట్',
    descriptionEn:
      'Complete Ganesh puja / homam samagri from the Pooja Store Excel list (docs/pooja_samagri.xlsx) — homa powder, navadhanyalu, samithalu, ghee, cloth, and offerings.',
    descriptionTe:
      'docs/pooja_samagri.xlsx లోని గణేష్ పూజ హోమం సామాగ్రి జాబితా ప్రకారం సంపూర్ణ కిట్ — హోమం పొడి, నవధాన్యాలు, సమితలు, నెయ్యి, ధోతి.',
    priceMinor: 199900,
    mrpMinor: 249900,
    items: ganeshHomamItems,
  },
  {
    slug: 'varalakshmi-vratam-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 13,
    nameEn: 'Varalakshmi Vratam Samagri',
    nameTe: 'వరలక్ష్మీ వ్రతం పూజా సామాగ్రి',
    descriptionEn:
      'Full Varalakshmi vratam list — kalasham, thoram, Ammavari pratima, vastras, and naivedyam items.',
    descriptionTe:
      'వరలక్ష్మీ వ్రతానికి పూర్తి జాబితా — కలశం, తోరం, అమ్మవారి ప్రతిమ, వస్త్రాలు, నైవేద్యం.',
    priceMinor: 249900,
    mrpMinor: 299900,
    items: varalakshmiItems,
  },
  {
    slug: 'ganapati-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 14,
    nameEn: 'Ganapati extras kit',
    nameTe: 'గణపతి ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Durva, 21 patri, modak/undrallu, and panchamritam for Ganapati pooja and Vinayaka Chavithi.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. దూర్వా, 21 పత్రి, మోదకం/ఉండ్రాళ్లు, పంచామృతం.',
    priceMinor: 49900,
    mrpMinor: 59900,
    items: ganapatiSpecialItems,
  },
  {
    slug: 'shiva-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 15,
    nameEn: 'Shiva extras kit',
    nameTe: 'శివ పూజ ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Bilva leaves, vibhuti, rudraksha, abhisheka patra, and panchamritam for Shiva pooja and Rudrabhishekam.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. బిల్వదళాలు, విభూది, రుద్రాక్ష, అభిషేక పాత్ర, పంచామృతం.',
    priceMinor: 59900,
    mrpMinor: 74900,
    items: shivaSpecialItems,
  },
  {
    slug: 'lakshmi-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 16,
    nameEn: 'Lakshmi extras kit',
    nameTe: 'లక్ష్మీ పూజ ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Lotus, coins, kalasham, grains, and turmeric roots for Lakshmi and Deepavali pooja.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. కమలం, నాణేలు, కలశం, ధాన్యం, పసుపు కొమ్ములు.',
    priceMinor: 54900,
    mrpMinor: 69900,
    items: lakshmiSpecialItems,
  },
  {
    slug: 'vishnu-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 17,
    nameEn: 'Vishnu extras kit',
    nameTe: 'విష్ణు పూజ ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Tulasi, shankh, panchamritam, and laddu for Vishnu, Rama, Krishna, and Venkateswara pooja.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. తులసి, శంఖం, పంచామృతం, లడ్డూ.',
    priceMinor: 54900,
    mrpMinor: 69900,
    items: vishnuSpecialItems,
  },
  {
    slug: 'ugadi-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 18,
    nameEn: 'Ugadi extras kit',
    nameTe: 'ఉగాది ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Mango-leaf toranam, neem flowers, ugadi pachadi pack, and panchangam.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. మామిడి తోరణం, వేప పువ్వులు, ఉగాది పచ్చడి, పంచాంగం.',
    priceMinor: 39900,
    mrpMinor: 49900,
    items: ugadiSpecialItems,
  },
  {
    slug: 'rama-navami-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 19,
    nameEn: 'Rama Navami extras kit',
    nameTe: 'శ్రీరామ నవమి ప్రత్యేక సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Tulasi, panakam mix, vadapappu, and jaggery.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. తులసి, పానకం, వడపప్పు, బెల్లం.',
    priceMinor: 34900,
    mrpMinor: 44900,
    items: ramaNavamiSpecialItems,
  },
  {
    slug: 'hanuman-jayanti-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 20,
    nameEn: 'Hanuman Jayanti extras kit',
    nameTe: 'హనుమాన్ జయంతి ప్రత్యేక సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Sindoor, tulasi, panakam, and jaggery.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. సింధూరం, తులసి, పానకం, బెల్లం.',
    priceMinor: 34900,
    mrpMinor: 44900,
    items: hanumanJayantiSpecialItems,
  },
  {
    slug: 'janmashtami-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 21,
    nameEn: 'Janmashtami extras kit',
    nameTe: 'జన్మాష్టమి ప్రత్యేక సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Poha, tulasi, ghee, and panchamritam for Krishna Janmashtami.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. అటుకులు, తులసి, నెయ్యి, పంచామృతం.',
    priceMinor: 39900,
    mrpMinor: 49900,
    items: janmashtamiSpecialItems,
  },
  {
    slug: 'navratri-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 22,
    nameEn: 'Navratri / Dasara extras kit',
    nameTe: 'నవరాత్రి / దసరా ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Kalasham, mango leaves, saree, bangles, and turmeric roots for Navratri and Vijayadashami.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. కలశం, మామిడి ఆకులు, చీర, గాజులు, పసుపు కొమ్ములు.',
    priceMinor: 89900,
    mrpMinor: 109900,
    items: navratriSpecialItems,
  },
  {
    slug: 'kartika-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 23,
    nameEn: 'Kartika Deepam extras kit',
    nameTe: 'కార్తీక దీపోత్సవం సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Clay diyas, oil, wicks, bilva, and tulasi.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. మట్టి దీపాలు, నూనె, వత్తులు, బిల్వం, తులసి.',
    priceMinor: 44900,
    mrpMinor: 54900,
    items: kartikaSpecialItems,
  },
  {
    slug: 'kedara-vratam-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 24,
    nameEn: 'Kedareshwara vratam extras',
    nameTe: 'కేదారేశ్వర వ్రత సామగ్రి',
    descriptionEn: 'Pair with the basic and Shiva kits. Kalasham, katha book, and vratam thread.',
    descriptionTe: 'బేసిక్, శివ కిట్‌లతో కలిపి. కలశం, వ్రత కథ, తోరం.',
    priceMinor: 39900,
    mrpMinor: 49900,
    items: kedaraVratamItems,
  },
  {
    slug: 'mangala-gauri-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 25,
    nameEn: 'Mangala Gauri extras kit',
    nameTe: 'మంగళగౌరీ వ్రత సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Saree, blouse, bangles, turmeric roots, and vratam thread for Gauri vratams.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. చీర, రవిక, గాజులు, పసుపు కొమ్ములు, వ్రత దారం.',
    priceMinor: 89900,
    mrpMinor: 109900,
    items: mangalaGauriItems,
  },
  {
    slug: 'vata-savitri-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 26,
    nameEn: 'Vata Savitri extras kit',
    nameTe: 'వటసావిత్రి వ్రత సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Turmeric vratam thread, bangles, and katha.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. పసుపు దారం, గాజులు, వ్రత కథ.',
    priceMinor: 34900,
    mrpMinor: 44900,
    items: vataSavitriItems,
  },
  {
    slug: 'santoshi-mata-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 27,
    nameEn: 'Santoshi Mata extras kit',
    nameTe: 'సంతోషిమాత వ్రత సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Jaggery, chickpeas, and vratam katha — the main naivedyam.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. బెల్లం, శెనగలు, వ్రత కథ.',
    priceMinor: 24900,
    mrpMinor: 34900,
    items: santoshiMataItems,
  },
  {
    slug: 'anantha-padmanabha-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 28,
    nameEn: 'Anantha Padmanabha extras kit',
    nameTe: 'అనంత పద్మనాభ వ్రత సామగ్రి',
    descriptionEn: 'Pair with the basic and Vishnu kits. 14-knot Anantha thread, tulasi, kalasham, and katha.',
    descriptionTe: 'బేసిక్, విష్ణు కిట్‌లతో కలిపి. 14 ముడుల అనంత దారం, తులసి, కలశం, వ్రత కథ.',
    priceMinor: 39900,
    mrpMinor: 49900,
    items: ananthaPadmanabhaItems,
  },
  {
    slug: 'saraswati-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 29,
    nameEn: 'Saraswati extras kit',
    nameTe: 'సరస్వతి పూజ ప్రత్యేక సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. White flowers and a books-and-pens pack.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. తెల్లని పూలు, పుస్తకాలు, పెన్నులు.',
    priceMinor: 29900,
    mrpMinor: 39900,
    items: saraswatiSpecialItems,
  },
  {
    slug: 'surya-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 30,
    nameEn: 'Surya extras kit',
    nameTe: 'సూర్య పూజ ప్రత్యేక సామగ్రి',
    descriptionEn: 'Pair with the basic pooja kit. Copper chembu, red sandal, wheat, and jaggery.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. రాగి చెంబు, ఎర్ర చందనం, గోధుమలు, బెల్లం.',
    priceMinor: 44900,
    mrpMinor: 54900,
    items: suryaSpecialItems,
  },
  {
    slug: 'navagraha-special-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 31,
    nameEn: 'Navagraha extras kit',
    nameTe: 'నవగ్రహ పూజ ప్రత్యేక సామగ్రి',
    descriptionEn:
      'Pair with the basic pooja kit. Navagraha mandala, nine grains, and nine-colour vastras. Follow your pujari for each graha.',
    descriptionTe:
      'బేసిక్ పూజా కిట్‌తో కలిపి. నవగ్రహ మండలం, నవధాన్యాలు, 9 రంగుల వస్త్రాలు.',
    priceMinor: 79900,
    mrpMinor: 99900,
    items: navagrahaSpecialItems,
  },
];

const individualPrices: Record<string, { slug: string; priceMinor: number; mrpMinor: number }> = {
  'Turmeric (Pasupu)': { slug: 'samagri-turmeric', priceMinor: 4000, mrpMinor: 5500 },
  Kumkum: { slug: 'samagri-kumkum', priceMinor: 5000, mrpMinor: 6500 },
  'Bukka gulal': { slug: 'samagri-bukka-gulal', priceMinor: 4000, mrpMinor: 5500 },
  'Large wick': { slug: 'samagri-large-wick', priceMinor: 3000, mrpMinor: 4000 },
  Ghee: { slug: 'samagri-ghee', priceMinor: 25000, mrpMinor: 29900 },
  'Incense sticks': { slug: 'samagri-incense', priceMinor: 4000, mrpMinor: 5500 },
  'Mango leaves': { slug: 'samagri-mango-leaves', priceMinor: 3000, mrpMinor: 4000 },
  Toranam: { slug: 'samagri-toranam', priceMinor: 8000, mrpMinor: 9900 },
  Jaggery: { slug: 'samagri-jaggery', priceMinor: 8000, mrpMinor: 9900 },
  'Blouse pieces': { slug: 'samagri-blouse-pieces', priceMinor: 39900, mrpMinor: 49900 },
  Rice: { slug: 'samagri-rice', priceMinor: 24900, mrpMinor: 29900 },
  'Dried coconuts': { slug: 'samagri-dried-coconut', priceMinor: 19900, mrpMinor: 24900 },
  'Betel nuts (Vakkalu)': { slug: 'samagri-betel-nuts', priceMinor: 8000, mrpMinor: 9900 },
  Cashews: { slug: 'samagri-cashews', priceMinor: 14900, mrpMinor: 17900 },
  'Turmeric roots': { slug: 'samagri-turmeric-roots', priceMinor: 6000, mrpMinor: 7500 },
  'Betel leaves': { slug: 'samagri-betel-leaves', priceMinor: 3000, mrpMinor: 4000 },
  Bananas: { slug: 'samagri-bananas', priceMinor: 6000, mrpMinor: 7500 },
  Sugarcane: { slug: 'samagri-sugarcane', priceMinor: 4000, mrpMinor: 5000 },
  'Sacred thread': { slug: 'samagri-sacred-thread', priceMinor: 2000, mrpMinor: 3000 },
  Yajnopavita: { slug: 'samagri-yajnopavita', priceMinor: 5000, mrpMinor: 6500 },
  'Loose flowers': { slug: 'samagri-flowers', priceMinor: 8000, mrpMinor: 9900 },
  'Flower garland': { slug: 'samagri-garland', priceMinor: 10000, mrpMinor: 12900 },
  Coconuts: { slug: 'samagri-coconuts', priceMinor: 6000, mrpMinor: 7500 },
  'White thread': { slug: 'samagri-white-thread', priceMinor: 2000, mrpMinor: 3000 },
  Vibhuti: { slug: 'samagri-vibhuti', priceMinor: 3000, mrpMinor: 4000 },
  'Akshatalu (turmeric rice)': { slug: 'samagri-akshatalu', priceMinor: 4000, mrpMinor: 5500 },
  'Diya wicks': { slug: 'samagri-diya-wicks', priceMinor: 3000, mrpMinor: 4000 },
  Oil: { slug: 'samagri-oil', priceMinor: 28000, mrpMinor: 32900 },
  'Turmeric & durva grass': { slug: 'samagri-durva', priceMinor: 3000, mrpMinor: 4000 },
  'Akhanda deepam': { slug: 'samagri-akhanda-deepam', priceMinor: 14900, mrpMinor: 17900 },
  Camphor: { slug: 'samagri-camphor', priceMinor: 5000, mrpMinor: 6500 },
  'Cotton vastra': { slug: 'samagri-cotton-vastra', priceMinor: 8000, mrpMinor: 9900 },
  Sambrani: { slug: 'samagri-sambrani', priceMinor: 6000, mrpMinor: 7500 },
  Attar: { slug: 'samagri-attar', priceMinor: 8000, mrpMinor: 9900 },
  'Rose water': { slug: 'samagri-rose-water', priceMinor: 5000, mrpMinor: 6500 },
  'White cloth': { slug: 'samagri-white-cloth', priceMinor: 8000, mrpMinor: 9900 },
  'Cotton wicks': { slug: 'samagri-cotton-wicks', priceMinor: 3000, mrpMinor: 4000 },
  Plates: { slug: 'samagri-plates', priceMinor: 12000, mrpMinor: 14900 },
  'Arati plate': { slug: 'samagri-arati-plate', priceMinor: 15000, mrpMinor: 18900 },
  'Sandal paste (Gandham)': { slug: 'samagri-gandham', priceMinor: 8000, mrpMinor: 9900 },
  Prasadam: { slug: 'samagri-prasadam', priceMinor: 15000, mrpMinor: 18900 },
  'Small diyas / wicks': { slug: 'samagri-small-diyas', priceMinor: 8000, mrpMinor: 9900 },
  Dates: { slug: 'samagri-dates', priceMinor: 8000, mrpMinor: 9900 },
  'Sela (shawl)': { slug: 'samagri-sela', priceMinor: 19900, mrpMinor: 24900 },
  'Copper pot (Chembu)': { slug: 'samagri-copper-pot', priceMinor: 24900, mrpMinor: 29900 },
  'Kankana thread': { slug: 'samagri-kankana-thread', priceMinor: 2000, mrpMinor: 3000 },
  Glasses: { slug: 'samagri-glasses', priceMinor: 4000, mrpMinor: 5000 },
  Undrallu: { slug: 'samagri-undrallu', priceMinor: 8000, mrpMinor: 9900 },
  Laddu: { slug: 'samagri-laddu', priceMinor: 8000, mrpMinor: 9900 },
  'Homa powder': { slug: 'samagri-homa-powder', priceMinor: 14900, mrpMinor: 17900 },
  'Poha (Atukulu)': { slug: 'samagri-poha', priceMinor: 8000, mrpMinor: 9900 },
  Navadhanyalu: { slug: 'samagri-navadhanyalu', priceMinor: 9000, mrpMinor: 11000 },
  'Rice flour': { slug: 'samagri-rice-flour', priceMinor: 6000, mrpMinor: 7500 },
  'Purnahuti pack': { slug: 'samagri-purnahuti', priceMinor: 12000, mrpMinor: 14900 },
  Fruits: { slug: 'samagri-fruits', priceMinor: 12000, mrpMinor: 14900 },
  'Dry fruits': { slug: 'samagri-dry-fruits', priceMinor: 19900, mrpMinor: 24900 },
  'Samithalu (homa sticks)': { slug: 'samagri-samithalu', priceMinor: 8000, mrpMinor: 9900 },
  'Durva / isthari leaves': { slug: 'samagri-isthari-leaves', priceMinor: 4000, mrpMinor: 5000 },
  'Homa stand': { slug: 'samagri-homa-stand', priceMinor: 49900, mrpMinor: 59900 },
  Dhoti: { slug: 'samagri-dhoti', priceMinor: 39900, mrpMinor: 49900 },
  Kalasham: { slug: 'samagri-kalasham', priceMinor: 24900, mrpMinor: 29900 },
  'Water for kalasham': { slug: 'samagri-kalash-water', priceMinor: 2000, mrpMinor: 3000 },
  'Sweets for naivedyam': { slug: 'samagri-naivedyam-sweets', priceMinor: 14900, mrpMinor: 17900 },
  'Puja vastras': { slug: 'samagri-puja-vastras', priceMinor: 19900, mrpMinor: 24900 },
  'Varalakshmi Ammavari face / pratima': {
    slug: 'samagri-varalakshmi-pratima',
    priceMinor: 29900,
    mrpMinor: 34900,
  },
  'Varalakshmi vratam thoram': { slug: 'samagri-varalakshmi-thoram', priceMinor: 8000, mrpMinor: 9900 },
  Saree: { slug: 'samagri-saree', priceMinor: 79900, mrpMinor: 99900 },
  Bangles: { slug: 'samagri-bangles', priceMinor: 14900, mrpMinor: 17900 },
  'Small bowls for turmeric & kumkum': {
    slug: 'samagri-kumkum-bowls',
    priceMinor: 8000,
    mrpMinor: 9900,
  },
  Bell: { slug: 'samagri-bell', priceMinor: 12000, mrpMinor: 14900 },
  Dhoopam: { slug: 'samagri-dhoopam', priceMinor: 4000, mrpMinor: 5500 },
  'Naivedyam vessels': { slug: 'samagri-naivedyam-vessels', priceMinor: 19900, mrpMinor: 24900 },
  'Darbha grass': { slug: 'samagri-darbha', priceMinor: 4000, mrpMinor: 5000 },
  Pavitram: { slug: 'samagri-pavitram', priceMinor: 3000, mrpMinor: 4000 },
  'Panchapatra set': { slug: 'samagri-panchapatra', priceMinor: 24900, mrpMinor: 29900 },
  'Kalash cloth': { slug: 'samagri-kalash-cloth', priceMinor: 8000, mrpMinor: 9900 },
  Gangajal: { slug: 'samagri-gangajal', priceMinor: 5000, mrpMinor: 6500 },
  Honey: { slug: 'samagri-honey', priceMinor: 12000, mrpMinor: 14900 },
  Sugar: { slug: 'samagri-sugar', priceMinor: 4000, mrpMinor: 5000 },
  '21 patri pack': { slug: 'samagri-21-patri', priceMinor: 8000, mrpMinor: 9900 },
  'Panchamritam pack': { slug: 'samagri-panchamritam', priceMinor: 19900, mrpMinor: 24900 },
  'Bilva leaves': { slug: 'samagri-bilva', priceMinor: 6000, mrpMinor: 7500 },
  'Rudraksha mala': { slug: 'samagri-rudraksha-mala', priceMinor: 19900, mrpMinor: 24900 },
  'Abhisheka patra': { slug: 'samagri-abhisheka-patra', priceMinor: 24900, mrpMinor: 29900 },
  'Lotus flowers': { slug: 'samagri-lotus', priceMinor: 12000, mrpMinor: 14900 },
  'Pooja coins': { slug: 'samagri-pooja-coins', priceMinor: 8000, mrpMinor: 9900 },
  Grains: { slug: 'samagri-grains', priceMinor: 9000, mrpMinor: 11000 },
  'Tulasi leaves': { slug: 'samagri-tulasi', priceMinor: 4000, mrpMinor: 5000 },
  Shankh: { slug: 'samagri-shankh', priceMinor: 19900, mrpMinor: 24900 },
  'Neem flowers': { slug: 'samagri-neem-flowers', priceMinor: 4000, mrpMinor: 5000 },
  'Ugadi pachadi pack': { slug: 'samagri-ugadi-pachadi', priceMinor: 12000, mrpMinor: 14900 },
  Panchangam: { slug: 'samagri-panchangam', priceMinor: 5000, mrpMinor: 6500 },
  'Panakam mix': { slug: 'samagri-panakam', priceMinor: 6000, mrpMinor: 7500 },
  Vadapappu: { slug: 'samagri-vadapappu', priceMinor: 6000, mrpMinor: 7500 },
  Sindoor: { slug: 'samagri-sindoor', priceMinor: 4000, mrpMinor: 5000 },
  'Vratam katha book': { slug: 'samagri-vratam-katha', priceMinor: 8000, mrpMinor: 9900 },
  'Vratam thread': { slug: 'samagri-vratam-thread', priceMinor: 3000, mrpMinor: 4000 },
  Chickpeas: { slug: 'samagri-chickpeas', priceMinor: 6000, mrpMinor: 7500 },
  'Anantha thread': { slug: 'samagri-anantha-thread', priceMinor: 5000, mrpMinor: 6500 },
  'Books and pens pack': { slug: 'samagri-books-pens', priceMinor: 14900, mrpMinor: 17900 },
  'Red sandal': { slug: 'samagri-red-sandal', priceMinor: 8000, mrpMinor: 9900 },
  Wheat: { slug: 'samagri-wheat', priceMinor: 6000, mrpMinor: 7500 },
  'Nine-colour vastras': { slug: 'samagri-nine-vastras', priceMinor: 24900, mrpMinor: 29900 },
  'Navagraha set': { slug: 'samagri-navagraha-set', priceMinor: 39900, mrpMinor: 49900 },
};

const nameAliases: Record<string, string> = {
  Turmeric: 'Turmeric (Pasupu)',
  'Sandal paste': 'Sandal paste (Gandham)',
  Akshintalu: 'Akshatalu (turmeric rice)',
  'Betel nuts': 'Betel nuts (Vakkalu)',
  Flowers: 'Loose flowers',
  'Dried coconut': 'Dried coconuts',
  Wicks: 'Cotton wicks',
  Deepam: 'Akhanda deepam',
  'Mango leaves for toranam': 'Mango leaves',
  'Blouse piece': 'Blouse pieces',
  'Blouse piece (Jacket piece)': 'Blouse pieces',
  'Arati camphor': 'Camphor',
  Purnahuti: 'Purnahuti pack',
  'Isthari leaves (Durva)': 'Durva / isthari leaves',
  'Panchamritam': 'Panchamritam pack',
  Tulasi: 'Tulasi leaves',
  'Tulasi dalas': 'Tulasi leaves',
  Durva: 'Durva / isthari leaves',
};

function priceEntry(nameEn: string) {
  const priced = individualPrices[nameEn] ?? individualPrices[nameAliases[nameEn] ?? ''];
  if (!priced) {
    throw new Error(`Missing price for ${nameEn}`);
  }
  return priced;
}

function uniqueSelectableItems(): SamagriItem[] {
  const seen = new Set<string>();
  const items: SamagriItem[] = [];
  for (const item of [...generalItems, ...commonExtraItems, ...kits.flatMap((kit) => kit.items)]) {
    const slug = priceEntry(item.nameEn).slug;
    if (seen.has(slug)) continue;
    seen.add(slug);
    items.push(item);
  }
  return items;
}

function festivalFor(slug: string) {
  if (slug.includes('ganesh') || slug.includes('ganapati')) return 'ganesh';
  if (slug.includes('varalakshmi')) return 'varalakshmi';
  if (slug.includes('ugadi')) return 'ugadi';
  if (slug.includes('navratri')) return 'navratri';
  if (slug.includes('lakshmi') || slug.includes('diwali')) return 'diwali';
  return 'general';
}

function individualProducts(): SamagriProduct[] {
  return uniqueSelectableItems().map((item, index) => {
    const priced = priceEntry(item.nameEn);
    const packEn = item.packEn ? ` Pack size: ${item.packEn}.` : '';
    const packTe = item.packTe ? ` ప్యాక్: ${item.packTe}.` : '';
    return {
      slug: priced.slug,
      type: ProductType.SAMAGRI,
      sortOrder: 100 + index,
      nameEn: label(item, 'en'),
      nameTe: label(item, 'te'),
      descriptionEn: `Pooja samagri item for home puja.${packEn}${item.optional ? ' Optional offering.' : ''}`,
      descriptionTe: `ఇంటి పూజకు సామగ్రి.${packTe}${item.optional ? ' ఐచ్ఛిక నైవేద్యం.' : ''}`,
      priceMinor: priced.priceMinor,
      mrpMinor: priced.mrpMinor,
      items: [item],
    };
  });
}

async function upsertSamagriProduct(prisma: PrismaClient, product: SamagriProduct) {
  const metadata = {
    catalog: CATALOG,
    festival: festivalFor(product.slug),
    lineItems: product.items.map((item) => {
      const priced = priceEntry(item.nameEn);
      return {
        slug: priced.slug,
        nameEn: item.nameEn,
        nameTe: item.nameTe,
        packEn: item.packEn ?? null,
        packTe: item.packTe ?? null,
        quantity: item.quantity,
        optional: item.optional ?? false,
        priceMinor: priced.priceMinor,
      };
    }),
    i18n: {
      te: {
        name: product.nameTe,
        description: product.descriptionTe,
        kitItems: product.items.map((item) => label(item, 'te')),
      },
    },
  };

  const row = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.nameEn,
      description: product.descriptionEn,
      type: product.type,
      priceMinor: product.priceMinor,
      mrpMinor: product.mrpMinor,
      isActive: true,
      sortOrder: product.sortOrder,
      metadata,
    },
    create: {
      slug: product.slug,
      name: product.nameEn,
      description: product.descriptionEn,
      type: product.type,
      market: Market.IN,
      currency: CurrencyCode.INR,
      priceMinor: product.priceMinor,
      mrpMinor: product.mrpMinor,
      sortOrder: product.sortOrder,
      metadata,
    },
  });

  await prisma.productKitItem.deleteMany({ where: { productId: row.id } });
  await prisma.productKitItem.createMany({
    data: product.items.map((item, index) => ({
      productId: row.id,
      name: label(item, 'en'),
      quantity: item.quantity,
      isOptional: item.optional ?? false,
      sortOrder: index,
    })),
  });
}

export async function seedPoojaSamagri(prisma: PrismaClient) {
  for (const kit of kits) {
    await upsertSamagriProduct(prisma, kit);
  }
  for (const item of individualProducts()) {
    await upsertSamagriProduct(prisma, item);
  }
}
