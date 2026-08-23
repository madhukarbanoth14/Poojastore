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
    nameEn: 'General Pooja Samagri Kit',
    nameTe: 'సాధారణ పూజా సామగ్రి కిట్',
    descriptionEn:
      'Everyday home puja samagri from the Pooja Store list — turmeric, kumkum, ghee, mango leaves, and the rest of the essentials.',
    descriptionTe:
      'ఇంటి పూజకు కావాల్సిన సామగ్రి — పసుపు, కుంకుమ, నెయ్యి, మామిడాకులు మరియు ఇతర ముఖ్య వస్తువులు.',
    priceMinor: 129900,
    mrpMinor: 159900,
    items: generalItems,
  },
  {
    slug: 'ganesh-puja-homam-samagri',
    type: ProductType.PUJA_KIT,
    sortOrder: 11,
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
    sortOrder: 12,
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
];

const individualPrices: Record<string, { slug: string; priceMinor: number; mrpMinor: number }> = {
  'Turmeric (Pasupu)': { slug: 'samagri-turmeric', priceMinor: 4000, mrpMinor: 5500 },
  Kumkum: { slug: 'samagri-kumkum', priceMinor: 5000, mrpMinor: 6500 },
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
  'Cotton wicks': { slug: 'samagri-cotton-wicks', priceMinor: 3000, mrpMinor: 4000 },
  Plates: { slug: 'samagri-plates', priceMinor: 12000, mrpMinor: 14900 },
  'Arati plate': { slug: 'samagri-arati-plate', priceMinor: 15000, mrpMinor: 18900 },
  'Sandal paste (Gandham)': { slug: 'samagri-gandham', priceMinor: 8000, mrpMinor: 9900 },
  Prasadam: { slug: 'samagri-prasadam', priceMinor: 15000, mrpMinor: 18900 },
  'Small diyas / wicks': { slug: 'samagri-small-diyas', priceMinor: 8000, mrpMinor: 9900 },
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
  for (const item of [...generalItems, ...ganeshHomamItems, ...varalakshmiItems]) {
    const slug = priceEntry(item.nameEn).slug;
    if (seen.has(slug)) continue;
    seen.add(slug);
    items.push(item);
  }
  return items;
}

function festivalFor(slug: string) {
  if (slug.startsWith('ganesh')) return 'ganesh';
  if (slug.startsWith('varalakshmi')) return 'varalakshmi';
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
