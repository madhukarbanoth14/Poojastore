class PoojaItem {
  const PoojaItem(this.en, this.te);
  final String en;
  final String te;
  String label(bool teLang) => teLang ? te : en;
}

enum PoojaKind { deity, festival, vratham }

class PoojaGroup {
  const PoojaGroup({required this.titleEn, required this.titleTe, required this.items});
  final String titleEn;
  final String titleTe;
  final List<PoojaItem> items;
  String title(bool te) => te ? titleTe : titleEn;
}

class PoojaGuide {
  const PoojaGuide({
    required this.id,
    required this.kind,
    required this.titleEn,
    required this.titleTe,
    required this.special,
    this.kitSlug,
    this.deityKitSlug,
    this.noteEn,
    this.noteTe,
  });

  final String id;
  final PoojaKind kind;
  final String titleEn;
  final String titleTe;
  final String? kitSlug;
  final String? deityKitSlug;
  final List<PoojaItem> special;
  final String? noteEn;
  final String? noteTe;

  String title(bool te) => te ? titleTe : titleEn;
  String? note(bool te) {
    if (te) return noteTe ?? noteEn;
    return noteEn ?? noteTe;
  }
}

const basicKitSlug = 'general-pooja-samagri-kit';

const commonSamagriGroups = [
  PoojaGroup(
    titleEn: 'Everyday pooja samagri',
    titleTe: 'సాధారణ పూజా సామగ్రి',
    items: [
      PoojaItem('Turmeric', 'పసుపు'),
      PoojaItem('Kumkum', 'కుంకుమ'),
      PoojaItem('Sandal / gandham', 'గంధం / చందనం'),
      PoojaItem('Vibhuti', 'విభూది'),
      PoojaItem('Akshintalu', 'అక్షింతలు'),
      PoojaItem('Rice', 'బియ్యం'),
      PoojaItem('Betel leaves', 'తమలపాకులు'),
      PoojaItem('Betel nuts', 'వక్కలు'),
      PoojaItem('Coconuts', 'కొబ్బరికాయలు'),
      PoojaItem('Flowers', 'పూలు'),
      PoojaItem('Flower garlands', 'పూలమాలలు / దండలు'),
      PoojaItem('Darbha grass', 'దర్భ'),
      PoojaItem('Pavitram', 'పవిత్రం'),
      PoojaItem('Panchapatra & uddharini', 'పంచపాత్ర – ఉద్ధరణి'),
      PoojaItem('Bell', 'గంట'),
      PoojaItem('Harathi plate', 'హారతి పళ్లెం'),
      PoojaItem('Deepam', 'దీపం'),
      PoojaItem('Wicks', 'వత్తులు'),
      PoojaItem('Ghee / oil', 'నెయ్యి / నూనె'),
      PoojaItem('Camphor', 'కర్పూరం'),
      PoojaItem('Incense', 'అగరబత్తీలు'),
      PoojaItem('Dhoopam', 'ధూపం'),
      PoojaItem('Naivedyam', 'నైవేద్యం'),
      PoojaItem('Fruits', 'పండ్లు'),
      PoojaItem('Kalasham', 'కలశం'),
      PoojaItem('Kalash cloth', 'కలశ వస్త్రం'),
      PoojaItem('Mango leaves for kalash', 'కలశానికి మామిడి ఆకులు'),
      PoojaItem('Gangajal', 'గంగాజలం'),
      PoojaItem('Pooja vastra', 'పూజా వస్త్రం'),
    ],
  ),
  PoojaGroup(
    titleEn: 'Panchamritam',
    titleTe: 'పంచామృతం',
    items: [
      PoojaItem('Milk', 'పాలు'),
      PoojaItem('Curd', 'పెరుగు'),
      PoojaItem('Ghee', 'నెయ్యి'),
      PoojaItem('Honey', 'తేనె'),
      PoojaItem('Sugar', 'చక్కెర'),
    ],
  ),
  PoojaGroup(
    titleEn: 'Usual fruits & naivedyam',
    titleTe: 'సాధారణ పండ్లు, నైవేద్యం',
    items: [
      PoojaItem('Bananas', 'అరటిపండ్లు'),
      PoojaItem('Seasonal fruits', 'సీజనల్ పండ్లు'),
      PoojaItem('Jaggery', 'బెల్లం'),
      PoojaItem('Laddu', 'లడ్డూ'),
      PoojaItem('Pulihora', 'పులిహోర'),
      PoojaItem('Vadapappu', 'వడపప్పు'),
      PoojaItem('Panakam', 'పానకం'),
    ],
  ),
];

const poojaGuides = <PoojaGuide>[
  PoojaGuide(id: 'ganapati', kind: PoojaKind.deity, titleEn: 'Ganapati / Vinayaka Chavithi', titleTe: 'గణపతి పూజ / వినాయక చవితి', kitSlug: 'ganesh-mini-home-puja', deityKitSlug: 'ganapati-special-samagri', special: [PoojaItem('Eco-friendly clay Ganesh idol', 'పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం'), PoojaItem('21 kinds of patri', '21 రకాల పత్రి'), PoojaItem('Durva grass', 'దూర్వా గడ్డి'), PoojaItem('Red flowers', 'ఎర్రని పూలు'), PoojaItem('Modak / undrallu / kudumulu', 'మోదకం / ఉండ్రాళ్లు / కుడుములు'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'shiva', kind: PoojaKind.deity, titleEn: 'Rudrabhishekam / Shiva pooja', titleTe: 'రుద్రాభిషేకం / శివ పూజ', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Shivalingam', 'శివలింగం'), PoojaItem('Bilva leaves', 'బిల్వదళాలు / మారేడు ఆకులు'), PoojaItem('White flowers', 'తెల్లని పూలు'), PoojaItem('Vibhuti', 'విభూది'), PoojaItem('Rudraksha mala', 'రుద్రాక్షమాల'), PoojaItem('Abhisheka / panchamritam', 'అభిషేక ద్రవ్యాలు / పంచామృతం'), PoojaItem('Abhisheka patra', 'అభిషేక పాత్ర')]),
  PoojaGuide(id: 'bilva', kind: PoojaKind.deity, titleEn: 'Bilva pooja', titleTe: 'బిల్వ పూజ', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Shivalingam or Shiva picture', 'శివలింగం / శివుని చిత్రం'), PoojaItem('Plenty of bilva leaves', 'బిల్వదళాలు పెద్ద మొత్తంలో'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'pradosha', kind: PoojaKind.vratham, titleEn: 'Pradosha vratam', titleTe: 'ప్రదోష వ్రత పూజ', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Shivalingam', 'శివలింగం'), PoojaItem('Nandi picture', 'నంది విగ్రహం / చిత్రం'), PoojaItem('Bilva leaves', 'బిల్వదళాలు'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'somavara', kind: PoojaKind.vratham, titleEn: 'Somavara vratam', titleTe: 'సోమవారం వ్రత పూజ', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Shivalingam', 'శివలింగం'), PoojaItem('Bilva leaves', 'బిల్వదళాలు'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'kedara', kind: PoojaKind.vratham, titleEn: 'Kedareshwara vratam', titleTe: 'కేదారేశ్వర వ్రతం', kitSlug: 'kedara-vratam-samagri', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Kedareshwara picture', 'కేదారేశ్వర స్వామి చిత్రం'), PoojaItem('Parvati picture', 'పార్వతీదేవి చిత్రం'), PoojaItem('Kalasham & mango leaves', 'కలశం, మామిడి ఆకులు'), PoojaItem('Vratam katha book', 'వ్రత కథ పుస్తకం'), PoojaItem('Thoram', 'తోరం / వ్రత దారం')]),
  PoojaGuide(id: 'shiva-kalyanam', kind: PoojaKind.festival, titleEn: 'Shiva kalyanam', titleTe: 'శివ కల్యాణం', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Shiva & Parvati vigrahams', 'శివుడు, పార్వతి విగ్రహాలు'), PoojaItem('Kalashams', 'కలశాలు'), PoojaItem('Mangalsutra / tali', 'మంగళసూత్రం / తాళి'), PoojaItem('Turmeric roots, jeera, jaggery', 'పసుపు కొమ్ములు, జీలకర్ర, బెల్లం')]),
  PoojaGuide(id: 'ugadi', kind: PoojaKind.festival, titleEn: 'Ugadi pooja', titleTe: 'ఉగాది పూజ', kitSlug: 'ugadi-special-samagri', special: [PoojaItem('Mango-leaf toranam', 'మామిడి ఆకుల తోరణం'), PoojaItem('Neem flowers & leaves', 'వేప పువ్వులు, వేప ఆకులు'), PoojaItem('Ugadi pachadi (six tastes)', 'ఉగాది పచ్చడి — ఆరు రుచులు'), PoojaItem('Panchangam', 'పంచాంగం')]),
  PoojaGuide(id: 'rama-navami', kind: PoojaKind.festival, titleEn: 'Sri Rama Navami', titleTe: 'శ్రీరామ నవమి పూజ', kitSlug: 'rama-navami-special-samagri', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Rama, Sita, Lakshmana, Hanuman pictures', 'రామ, సీత, లక్ష్మణ, హనుమ చిత్రాలు'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Panakam & vadapappu', 'పానకం, వడపప్పు')]),
  PoojaGuide(id: 'hanuman', kind: PoojaKind.festival, titleEn: 'Hanuman Jayanti', titleTe: 'హనుమాన్ జయంతి', kitSlug: 'hanuman-jayanti-special-samagri', special: [PoojaItem('Hanuman vigraham', 'హనుమంతుడి విగ్రహం / చిత్రం'), PoojaItem('Sindoor', 'సింధూరం'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Vada, panakam, jaggery', 'వడలు, పానకం, బెల్లం')]),
  PoojaGuide(id: 'akshaya-tritiya', kind: PoojaKind.festival, titleEn: 'Akshaya Tritiya', titleTe: 'అక్షయ తృతీయ పూజ', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Lakshmi & Vishnu pictures', 'లక్ష్మీదేవి, విష్ణుమూర్తి చిత్రాలు'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Grains', 'ధాన్యం')]),
  PoojaGuide(id: 'narasimha', kind: PoojaKind.festival, titleEn: 'Narasimha Jayanti', titleTe: 'నరసింహ జయంతి', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Narasimha swami picture', 'నరసింహ స్వామి చిత్రం'), PoojaItem('Tulasi dalas', 'తులసి దళాలు'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'varalakshmi', kind: PoojaKind.vratham, titleEn: 'Varalakshmi vratam', titleTe: 'వరలక్ష్మీ వ్రతం', kitSlug: 'varalakshmi-vratam-samagri', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Ammavari face / pratima', 'లక్ష్మీదేవి ముఖం / విగ్రహం'), PoojaItem('Saree, blouse, jewellery', 'చీర, రవిక, నగలు'), PoojaItem('Thoram, tali bottu', 'తోరం, తాళిబొట్టు'), PoojaItem('Vayanam samagri', 'వాయనం సామగ్రి')]),
  PoojaGuide(id: 'janmashtami', kind: PoojaKind.festival, titleEn: 'Sri Krishna Janmashtami', titleTe: 'శ్రీకృష్ణ జన్మాష్టమి', kitSlug: 'janmashtami-special-samagri', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Krishna vigraham & swing', 'శ్రీకృష్ణుడి విగ్రహం, ఉయ్యాల'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Butter, milk, curd, poha', 'వెన్న, పాలు, పెరుగు, అటుకులు')]),
  PoojaGuide(id: 'navratri', kind: PoojaKind.festival, titleEn: 'Navratri pooja', titleTe: 'నవరాత్రి పూజ', kitSlug: 'navratri-special-samagri', special: [PoojaItem('Durga Devi picture', 'దుర్గాదేవి చిత్రం / విగ్రహం'), PoojaItem('Kalasham', 'కలశం'), PoojaItem('Saree, blouse, bangles', 'చీర, రవిక, గాజులు')]),
  PoojaGuide(id: 'vijayadashami', kind: PoojaKind.festival, titleEn: 'Dasara / Vijayadashami', titleTe: 'దసరా / విజయదశమి', kitSlug: 'navratri-special-samagri', special: [PoojaItem('Ammavari picture', 'దుర్గాదేవి / అమ్మవారి చిత్రం'), PoojaItem('Ayudhams / books / vehicles', 'ఆయుధాలు / పుస్తకాలు / వాహనాలు'), PoojaItem('Marigold flowers', 'బంతిపూలు')]),
  PoojaGuide(id: 'diwali', kind: PoojaKind.festival, titleEn: 'Deepavali Lakshmi pooja', titleTe: 'దీపావళి లక్ష్మీ పూజ', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Lakshmi & Ganapati vigrahams', 'లక్ష్మీదేవి, గణపతి విగ్రహాలు'), PoojaItem('Coins, new account books', 'నాణేలు, కొత్త ఖాతా పుస్తకాలు'), PoojaItem('Diyas, oil, wicks', 'దీపాలు, నూనె, వత్తులు')]),
  PoojaGuide(id: 'kartika-deepam', kind: PoojaKind.festival, titleEn: 'Kartika Deepotsavam', titleTe: 'కార్తీక దీపోత్సవం', kitSlug: 'kartika-special-samagri', special: [PoojaItem('Clay diyas', 'మట్టి దీపాలు'), PoojaItem('Oil & wicks', 'నూనె, వత్తులు'), PoojaItem('Bilva leaves & tulasi', 'బిల్వదళాలు, తులసి')]),
  PoojaGuide(id: 'kartika-somavara', kind: PoojaKind.vratham, titleEn: 'Kartika Somavara pooja', titleTe: 'కార్తీక సోమవారం పూజ', deityKitSlug: 'shiva-special-samagri', kitSlug: 'kartika-special-samagri', special: [PoojaItem('Shivalingam', 'శివలింగం'), PoojaItem('Bilva leaves', 'బిల్వదళాలు'), PoojaItem('Diyas for Kartika', 'కార్తీక దీపాలు')]),
  PoojaGuide(id: 'dhanurmasa', kind: PoojaKind.festival, titleEn: 'Dhanurmasa pooja', titleTe: 'ధనుర్మాస పూజ', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Vishnu / Andal pictures', 'విష్ణుమూర్తి, ఆండాళ్ చిత్రాలు'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Sakkara pongal', 'చక్కెర పొంగలి')]),
  PoojaGuide(id: 'vaikuntha-ekadashi', kind: PoojaKind.festival, titleEn: 'Vaikuntha Ekadashi', titleTe: 'వైకుంఠ ఏకాదశి పూజ', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Vishnu & Lakshmi pictures', 'శ్రీమహావిష్ణువు, లక్ష్మీదేవి'), PoojaItem('Shankh & chakra', 'శంఖం, చక్రం'), PoojaItem('Tulasi dalas', 'తులసి దళాలు')]),
  PoojaGuide(id: 'parvati', kind: PoojaKind.deity, titleEn: 'Parvati pooja', titleTe: 'పార్వతి పూజ', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Parvati picture', 'పార్వతీదేవి చిత్రం'), PoojaItem('Saree, blouse, bangles, tali', 'చీర, రవిక, గాజులు, తాళిబొట్టు')]),
  PoojaGuide(id: 'vishnu', kind: PoojaKind.deity, titleEn: 'Vishnu pooja', titleTe: 'విష్ణు పూజ', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Vishnu & Lakshmi pictures', 'విష్ణుమూర్తి, లక్ష్మీదేవి'), PoojaItem('Tulasi dalas', 'తులసి దళాలు'), PoojaItem('Shankh & chakra', 'శంఖం, చక్రం')]),
  PoojaGuide(id: 'lakshmi', kind: PoojaKind.deity, titleEn: 'Lakshmi pooja', titleTe: 'లక్ష్మీ పూజ', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Lakshmi vigraham', 'లక్ష్మీదేవి విగ్రహం'), PoojaItem('Lotus flowers', 'కమల పూలు'), PoojaItem('Coins & grains', 'నాణేలు, ధాన్యం')]),
  PoojaGuide(id: 'saraswati', kind: PoojaKind.deity, titleEn: 'Saraswati pooja', titleTe: 'సరస్వతి పూజ', kitSlug: 'saraswati-special-samagri', special: [PoojaItem('Saraswati picture', 'సరస్వతీదేవి చిత్రం'), PoojaItem('Books, pens, notebooks', 'పుస్తకాలు, పెన్నులు'), PoojaItem('White flowers', 'తెల్లని పూలు')]),
  PoojaGuide(id: 'venkateswara', kind: PoojaKind.deity, titleEn: 'Venkateswara swami pooja', titleTe: 'వెంకటేశ్వర స్వామి పూజ', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Venkateswara, Sridevi, Bhudevi', 'వెంకటేశ్వరుడు, శ్రీదేవి, భూదేవి'), PoojaItem('Tulasi dalas', 'తులసి దళాలు'), PoojaItem('Laddu & pulihora', 'లడ్డూ, పులిహోర')]),
  PoojaGuide(id: 'surya', kind: PoojaKind.deity, titleEn: 'Surya pooja', titleTe: 'సూర్య పూజ / సూర్య నమస్కారం', kitSlug: 'surya-special-samagri', special: [PoojaItem('Copper chembu & vessel', 'రాగి చెంబు, రాగి పాత్ర'), PoojaItem('Red flowers', 'ఎర్ర పూలు'), PoojaItem('Red sandal', 'ఎర్ర చందనం'), PoojaItem('Jaggery & wheat', 'బెల్లం, గోధుమలు')]),
  PoojaGuide(id: 'navagraha', kind: PoojaKind.deity, titleEn: 'Navagraha pooja', titleTe: 'నవగ్రహ పూజ', kitSlug: 'navagraha-special-samagri', special: [PoojaItem('Navagraha mandala', 'నవగ్రహ మండలం / విగ్రహాలు'), PoojaItem('Nine grains', '9 రకాల ధాన్యాలు'), PoojaItem('Nine-colour vastras', '9 రంగుల వస్త్రాలు')], noteEn: 'Each graha has its own grain, flower, cloth and naivedyam — follow your pujari.', noteTe: 'ప్రతి గ్రహానికి ధాన్యం, పుష్పం, వస్త్రం పురోహితుల సూచన ప్రకారం సిద్ధం చేయండి.'),
  PoojaGuide(id: 'tulasi', kind: PoojaKind.deity, titleEn: 'Tulasi pooja', titleTe: 'తులసి పూజ', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Tulasi plant', 'తులసి మొక్క'), PoojaItem('Tulasi dalas', 'తులసి దళాలు')]),
  PoojaGuide(id: 'go-pooja', kind: PoojaKind.festival, titleEn: 'Go pooja', titleTe: 'గో పూజ', special: [PoojaItem('Garland for Gomata', 'గోమాతకు పూలమాల'), PoojaItem('Fresh grass', 'పచ్చిగడ్డి'), PoojaItem('Banana leaf, bananas, jaggery', 'అరటి ఆకులు, అరటిపండ్లు, బెల్లం')]),
  PoojaGuide(id: 'deepa', kind: PoojaKind.deity, titleEn: 'Deepa pooja', titleTe: 'దీప పూజ', kitSlug: 'kartika-special-samagri', special: [PoojaItem('Diyas, oil/ghee, wicks', 'దీపాలు, నూనె / నెయ్యి, వత్తులు')]),
  PoojaGuide(id: 'kuladevata', kind: PoojaKind.deity, titleEn: 'Kuladevata pooja', titleTe: 'కులదేవత పూజ', special: [PoojaItem('Family deity picture', 'కులదేవత విగ్రహం / చిత్రం'), PoojaItem('Kalasham', 'కలశం')], noteEn: 'This varies by family custom — follow your household pujari.', noteTe: 'ఇది కుటుంబ సంప్రదాయం ఆధారంగా మారుతుంది.'),
  PoojaGuide(id: 'gramadevata', kind: PoojaKind.festival, titleEn: 'Gramadevata pooja', titleTe: 'గ్రామదేవత పూజ', special: [PoojaItem('Gramadevata picture', 'గ్రామదేవత విగ్రహం / చిత్రం')], noteEn: 'Village custom differs by region — follow the local pujari.', noteTe: 'గ్రామదేవత సంప్రదాయం ప్రాంతానుసారం భిన్నంగా ఉంటుంది.'),
  PoojaGuide(id: 'mangala-gauri', kind: PoojaKind.vratham, titleEn: 'Mangala Gauri vratam', titleTe: 'మంగళగౌరీ వ్రతం', kitSlug: 'mangala-gauri-samagri', special: [PoojaItem('Gauri Devi / turmeric Gauri', 'గౌరీదేవి / పసుపుతో గౌరీ'), PoojaItem('Saree, blouse, bangles, tali', 'చీర, రవిక, గాజులు, తాళిబొట్టు'), PoojaItem('Thoram & vayanam', 'తోరం, వాయనం సామగ్రి')]),
  PoojaGuide(id: 'sravana-mangalavaram', kind: PoojaKind.vratham, titleEn: 'Sravana Mangalavaram vratam', titleTe: 'శ్రావణ మంగళవారం వ్రతం', kitSlug: 'mangala-gauri-samagri', special: [PoojaItem('Gauri Devi picture', 'గౌరీదేవి చిత్రం'), PoojaItem('Turmeric roots, bangles', 'పసుపు కొమ్ములు, గాజులు'), PoojaItem('Vratam thread', 'వ్రత దారం')]),
  PoojaGuide(id: 'sravana-shukravaram', kind: PoojaKind.vratham, titleEn: 'Sravana Shukravaram vratam', titleTe: 'శ్రావణ శుక్రవారం వ్రతం', kitSlug: 'varalakshmi-vratam-samagri', deityKitSlug: 'lakshmi-special-samagri', special: [PoojaItem('Lakshmi / Varalakshmi picture', 'లక్ష్మీదేవి / వరలక్ష్మీ చిత్రం'), PoojaItem('Saree, blouse, bangles', 'చీర, రవిక, గాజులు'), PoojaItem('Vayanam', 'వాయనం')]),
  PoojaGuide(id: 'saubhagya', kind: PoojaKind.vratham, titleEn: 'Saubhagya vratam', titleTe: 'సౌభాగ్య వ్రతం', kitSlug: 'mangala-gauri-samagri', special: [PoojaItem('Gauri / Parvati picture', 'గౌరీ / పార్వతి దేవి చిత్రం'), PoojaItem('Tali, saree, bangles', 'తాళిబొట్టు, చీర, గాజులు')]),
  PoojaGuide(id: 'vata-savitri', kind: PoojaKind.vratham, titleEn: 'Vata Savitri vratam', titleTe: 'వటసావిత్రి వ్రతం', kitSlug: 'vata-savitri-samagri', special: [PoojaItem('Banyan tree (vatavriksha)', 'మర్రి చెట్టు / వటవృక్షం'), PoojaItem('Turmeric vratam thread', 'పసుపు దారం / వ్రత దారం'), PoojaItem('Saubhagya samagri', 'సౌభాగ్య సామగ్రి')]),
  PoojaGuide(id: 'haridra-gauri', kind: PoojaKind.vratham, titleEn: 'Haridra Gauri vratam', titleTe: 'హరిద్రా గౌరీ వ్రతం', kitSlug: 'mangala-gauri-samagri', special: [PoojaItem('Gauri Devi', 'గౌరీదేవి'), PoojaItem('Turmeric roots, bangles, saree', 'పసుపు కొమ్ములు, గాజులు, చీర')]),
  PoojaGuide(id: 'uma-maheshwara', kind: PoojaKind.vratham, titleEn: 'Uma Maheshwara vratam', titleTe: 'ఉమామహేశ్వర వ్రతం', deityKitSlug: 'shiva-special-samagri', special: [PoojaItem('Uma–Maheshwara pictures', 'ఉమాదేవి – మహేశ్వరుని చిత్రాలు'), PoojaItem('Bilva leaves', 'బిల్వదళాలు'), PoojaItem('Panchamritam', 'పంచామృతం')]),
  PoojaGuide(id: 'santoshi', kind: PoojaKind.vratham, titleEn: 'Santoshi Mata vratam', titleTe: 'సంతోషిమాత వ్రతం', kitSlug: 'santoshi-mata-samagri', special: [PoojaItem('Santoshi Mata picture', 'సంతోషిమాత చిత్రం'), PoojaItem('Jaggery & chickpeas', 'బెల్లం + శెనగలు'), PoojaItem('Vratam katha book', 'వ్రత కథ పుస్తకం')], noteEn: 'Jaggery and chickpeas are the main naivedyam.', noteTe: 'సంతోషిమాత వ్రతంలో బెల్లం + శెనగలు ముఖ్యమైన నైవేద్యం.'),
  PoojaGuide(id: 'anantha', kind: PoojaKind.vratham, titleEn: 'Anantha Padmanabha vratam', titleTe: 'అనంత పద్మనాభ వ్రతం', kitSlug: 'anantha-padmanabha-samagri', deityKitSlug: 'vishnu-special-samagri', special: [PoojaItem('Anantha Padmanabha picture', 'అనంత పద్మనాభ స్వామి చిత్రం'), PoojaItem('Tulasi', 'తులసి'), PoojaItem('Anantha thread with 14 knots', '14 ముడుల అనంత దారం')]),
];

PoojaGuide poojaGuideById(String id) => poojaGuides.firstWhere(
      (g) => g.id == id,
      orElse: () => poojaGuides.first,
    );

List<PoojaGuide> guidesByKind(PoojaKind kind) =>
    poojaGuides.where((g) => g.kind == kind).toList();
