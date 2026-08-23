class SamagriLine {
  const SamagriLine({
    required this.slug,
    required this.nameEn,
    required this.nameTe,
    required this.priceMinor,
    this.packEn,
    this.packTe,
    this.quantity = 1,
    this.optional = false,
  });

  final String slug;
  final String nameEn;
  final String nameTe;
  final int priceMinor;
  final String? packEn;
  final String? packTe;
  final int quantity;
  final bool optional;

  String displayName(bool te) {
    final name = te ? nameTe : nameEn;
    final pack = te ? packTe : packEn;
    return pack == null || pack.isEmpty ? name : '$name — $pack';
  }
}

class SamagriFestivalList {
  const SamagriFestivalList({
    required this.id,
    required this.kitSlug,
    required this.titleEn,
    required this.titleTe,
    required this.subtitleEn,
    required this.subtitleTe,
    required this.kitPriceMinor,
    required this.items,
  });

  final String id;
  final String kitSlug;
  final String titleEn;
  final String titleTe;
  final String subtitleEn;
  final String subtitleTe;
  final int kitPriceMinor;
  final List<SamagriLine> items;

  String title(bool te) => te ? titleTe : titleEn;
  String subtitle(bool te) => te ? subtitleTe : subtitleEn;
}

/// From `docs/pooja_samagri.xlsx` → section "గణేష్ పూజ హోమం సామాగ్రి" (18 items).
const ganeshHomamList = SamagriFestivalList(
  id: 'ganesh',
  kitSlug: 'ganesh-puja-homam-samagri',
  titleEn: 'Ganesh Puja Homam',
  titleTe: 'గణేష్ పూజ హోమం',
  subtitleEn: 'Complete Ganesh puja / homam samagri from the Pooja Store Excel list.',
  subtitleTe: 'docs/pooja_samagri.xlsx లోని గణేష్ పూజ హోమం సామాగ్రి జాబితా.',
  kitPriceMinor: 199900,
  items: [
    SamagriLine(slug: 'samagri-homa-powder', nameEn: 'Homa powder', nameTe: 'హోమం పొడి', priceMinor: 14900, packEn: '1 kg', packTe: '1కిలో'),
    SamagriLine(slug: 'samagri-poha', nameEn: 'Poha (Atukulu)', nameTe: 'అటుకులు', priceMinor: 8000, packEn: '1/2 kg', packTe: '1/2కిలో'),
    SamagriLine(slug: 'samagri-jaggery', nameEn: 'Jaggery', nameTe: 'బెల్లం', priceMinor: 8000),
    SamagriLine(slug: 'samagri-navadhanyalu', nameEn: 'Navadhanyalu', nameTe: 'నవధాన్యాలు', priceMinor: 9000),
    SamagriLine(slug: 'samagri-rice-flour', nameEn: 'Rice flour', nameTe: 'బియ్యం పిండి', priceMinor: 6000),
    SamagriLine(slug: 'samagri-purnahuti', nameEn: 'Purnahuti', nameTe: 'పూర్ణాహుతి', priceMinor: 12000),
    SamagriLine(slug: 'samagri-betel-leaves', nameEn: 'Betel leaves', nameTe: 'తామలపాకులు', priceMinor: 3000),
    SamagriLine(slug: 'samagri-fruits', nameEn: 'Fruits', nameTe: 'పండ్లు', priceMinor: 12000),
    SamagriLine(slug: 'samagri-flowers', nameEn: 'Flowers', nameTe: 'పువ్వులు', priceMinor: 8000),
    SamagriLine(slug: 'samagri-dry-fruits', nameEn: 'Dry fruits', nameTe: 'డ్రై ఫ్రూట్స్', priceMinor: 19900),
    SamagriLine(slug: 'samagri-samithalu', nameEn: 'Samithalu (homa sticks)', nameTe: 'సమితలు', priceMinor: 8000),
    SamagriLine(slug: 'samagri-ghee', nameEn: 'Ghee', nameTe: 'నెయ్యి', priceMinor: 25000),
    SamagriLine(slug: 'samagri-camphor', nameEn: 'Arati camphor', nameTe: 'హారతి కర్పూరం', priceMinor: 5000),
    SamagriLine(slug: 'samagri-isthari-leaves', nameEn: 'Isthari leaves (Durva)', nameTe: 'ఇస్తరి ఆకులు', priceMinor: 4000),
    SamagriLine(slug: 'samagri-homa-stand', nameEn: 'Homa stand', nameTe: 'హోమం స్టాండ్', priceMinor: 49900),
    SamagriLine(slug: 'samagri-dhoti', nameEn: 'Dhoti', nameTe: 'ధోతి', priceMinor: 39900),
    SamagriLine(slug: 'samagri-blouse-pieces', nameEn: 'Blouse piece (Jacket piece)', nameTe: 'జాకెట్ పీసు', priceMinor: 39900),
    SamagriLine(slug: 'samagri-coconuts', nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', priceMinor: 6000, quantity: 2),
  ],
);

const varalakshmiList = SamagriFestivalList(
  id: 'varalakshmi',
  kitSlug: 'varalakshmi-vratam-samagri',
  titleEn: 'Varalakshmi Vratam',
  titleTe: 'వరలక్ష్మీ వ్రతం',
  subtitleEn: 'Full Varalakshmi vratam pooja samagri.',
  subtitleTe: 'వరలక్ష్మీ వ్రతం పూజా సామాగ్రి.',
  kitPriceMinor: 249900,
  items: [
    SamagriLine(slug: 'samagri-turmeric', nameEn: 'Turmeric', nameTe: 'పసుపు', priceMinor: 4000),
    SamagriLine(slug: 'samagri-kumkum', nameEn: 'Kumkum', nameTe: 'కుంకుమ', priceMinor: 5000),
    SamagriLine(slug: 'samagri-gandham', nameEn: 'Sandal paste', nameTe: 'గంధం', priceMinor: 8000),
    SamagriLine(slug: 'samagri-akshatalu', nameEn: 'Akshintalu', nameTe: 'అక్షింతలు', priceMinor: 4000),
    SamagriLine(slug: 'samagri-betel-leaves', nameEn: 'Betel leaves', nameTe: 'తమలపాకులు', priceMinor: 3000),
    SamagriLine(slug: 'samagri-betel-nuts', nameEn: 'Betel nuts', nameTe: 'వక్కలు', priceMinor: 8000),
    SamagriLine(slug: 'samagri-flowers', nameEn: 'Flowers', nameTe: 'పూలు', priceMinor: 8000),
    SamagriLine(slug: 'samagri-fruits', nameEn: 'Fruits', nameTe: 'పండ్లు', priceMinor: 12000),
    SamagriLine(slug: 'samagri-coconuts', nameEn: 'Coconuts', nameTe: 'కొబ్బరికాయలు', priceMinor: 6000, quantity: 2),
    SamagriLine(slug: 'samagri-bananas', nameEn: 'Bananas', nameTe: 'అరటిపండ్లు', priceMinor: 6000),
    SamagriLine(slug: 'samagri-kalasham', nameEn: 'Kalasham', nameTe: 'కలశం', priceMinor: 24900),
    SamagriLine(slug: 'samagri-kalash-water', nameEn: 'Water for kalasham', nameTe: 'కలశం కోసం నీరు', priceMinor: 2000),
    SamagriLine(slug: 'samagri-mango-leaves', nameEn: 'Mango leaves', nameTe: 'మామిడాకులు', priceMinor: 3000),
    SamagriLine(slug: 'samagri-turmeric-roots', nameEn: 'Turmeric roots', nameTe: 'పసుపు కొమ్ములు', priceMinor: 6000),
    SamagriLine(slug: 'samagri-dried-coconut', nameEn: 'Dried coconut', nameTe: 'ఎండు కొబ్బరి', priceMinor: 19900),
    SamagriLine(slug: 'samagri-jaggery', nameEn: 'Jaggery', nameTe: 'బెల్లం', priceMinor: 8000),
    SamagriLine(slug: 'samagri-naivedyam-sweets', nameEn: 'Sweets for naivedyam', nameTe: 'నైవేద్యం కోసం స్వీట్లు', priceMinor: 14900),
    SamagriLine(slug: 'samagri-incense', nameEn: 'Incense sticks', nameTe: 'అగరబత్తీలు', priceMinor: 4000),
    SamagriLine(slug: 'samagri-camphor', nameEn: 'Camphor', nameTe: 'కర్పూరం', priceMinor: 5000),
    SamagriLine(slug: 'samagri-ghee', nameEn: 'Ghee', nameTe: 'నెయ్యి', priceMinor: 25000),
    SamagriLine(slug: 'samagri-akhanda-deepam', nameEn: 'Deepam', nameTe: 'దీపం', priceMinor: 14900),
    SamagriLine(slug: 'samagri-cotton-wicks', nameEn: 'Wicks', nameTe: 'వత్తులు', priceMinor: 3000),
    SamagriLine(slug: 'samagri-puja-vastras', nameEn: 'Puja vastras', nameTe: 'పూజా వస్త్రాలు', priceMinor: 19900),
    SamagriLine(slug: 'samagri-varalakshmi-pratima', nameEn: 'Varalakshmi Ammavari face / pratima', nameTe: 'వరలక్ష్మీ అమ్మవారి ముఖం/ప్రతిమ', priceMinor: 29900),
    SamagriLine(slug: 'samagri-varalakshmi-thoram', nameEn: 'Varalakshmi vratam thoram', nameTe: 'వరలక్ష్మీ వ్రతం తోరం', priceMinor: 8000),
    SamagriLine(slug: 'samagri-mango-leaves', nameEn: 'Mango leaves for toranam', nameTe: 'తోరణం కోసం మామిడాకులు', priceMinor: 3000),
    SamagriLine(slug: 'samagri-saree', nameEn: 'Saree', nameTe: 'చీర', priceMinor: 79900),
    SamagriLine(slug: 'samagri-blouse-pieces', nameEn: 'Blouse piece', nameTe: 'జాకెట్ పీస్', priceMinor: 39900),
    SamagriLine(slug: 'samagri-bangles', nameEn: 'Bangles', nameTe: 'గాజులు', priceMinor: 14900),
    SamagriLine(slug: 'samagri-kumkum-bowls', nameEn: 'Small bowls for turmeric & kumkum', nameTe: 'పసుపు, కుంకుమ పెట్టుకునే చిన్న గిన్నెలు', priceMinor: 8000),
    SamagriLine(slug: 'samagri-arati-plate', nameEn: 'Arati plate', nameTe: 'హారతి పళ్లెం', priceMinor: 15000),
    SamagriLine(slug: 'samagri-bell', nameEn: 'Bell', nameTe: 'గంట', priceMinor: 12000),
    SamagriLine(slug: 'samagri-dhoopam', nameEn: 'Dhoopam', nameTe: 'ధూపం', priceMinor: 4000),
    SamagriLine(slug: 'samagri-naivedyam-vessels', nameEn: 'Naivedyam vessels', nameTe: 'నైవేద్య పాత్రలు', priceMinor: 19900),
  ],
);

const festivalSamagriLists = [ganeshHomamList, varalakshmiList];

SamagriFestivalList samagriListById(String? id) {
  return festivalSamagriLists.firstWhere(
    (list) => list.id == id,
    orElse: () => ganeshHomamList,
  );
}
