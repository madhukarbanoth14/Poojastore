import 'kit_item_taxonomy.dart';

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

  String shortName(bool te) => te ? nameTe : nameEn;

  String packLabel(bool te) => (te ? packTe : packEn) ?? '';

  String displayName(bool te) {
    final name = shortName(te);
    final pack = packLabel(te);
    final qty = pack.isEmpty && quantity > 1 ? ' ×$quantity' : '';
    if (pack.isEmpty) return '$name$qty';
    return '$name — $pack';
  }

  int get lineTotalMinor => priceMinor * quantity;
}

int sumSamagriLinePrices(Iterable<SamagriLine> lines) =>
    lines.fold<int>(0, (sum, line) => sum + line.lineTotalMinor);

class SamagriFestivalList {
  const SamagriFestivalList({
    required this.id,
    required this.kitSlug,
    required this.titleEn,
    required this.titleTe,
    required this.subtitleEn,
    required this.subtitleTe,
    required this.kitPriceMinor,
    this.kitMrpMinor = 0,
    required this.items,
  });

  final String id;
  final String kitSlug;
  final String titleEn;
  final String titleTe;
  final String subtitleEn;
  final String subtitleTe;
  final int kitPriceMinor;
  final int kitMrpMinor;
  final List<SamagriLine> items;

  String title(bool te) => te ? titleTe : titleEn;
  String subtitle(bool te) => te ? subtitleTe : subtitleEn;
}

/// Vinayaka Chavithi eco-friendly Mini / Mega kits (Excel price master).
const ganeshMiniHomeList = SamagriFestivalList(
  id: "ganesh-mini-home",
  kitSlug: "ganesh-mini-home-puja",
  titleEn: "Mini Home Pooja Kit",
  titleTe: "మినీ ఇంటి పూజ కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus compact home puja samagri.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో ఇంటి పూజా సామగ్రి.",
  kitPriceMinor: 111100,
  kitMrpMinor: 160000,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "10g", packTe: "10 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "10g", packTe: "10 గ్రా"),
    SamagriLine(slug: "samagri-gandham", nameEn: "Sandal paste (Gandham)", nameTe: "గంధం", priceMinor: 8000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "2000g", packTe: "2000 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000),
    SamagriLine(slug: "samagri-red-cloth", nameEn: "Red cloth", nameTe: "ఎర్రని బట్ట", priceMinor: 8000),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 2),
    SamagriLine(slug: "samagri-matchbox", nameEn: "Matchbox", nameTe: "అగ్గిపెట్టె", priceMinor: 1500),
    SamagriLine(slug: "samagri-kankana-thread", nameEn: "Kankana thread", nameTe: "కంకణాల దారం", priceMinor: 2000),
    SamagriLine(slug: "samagri-yajnopavita", nameEn: "Yajnopavita", nameTe: "యజ్ఞోపవీతం", priceMinor: 5000),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000),
    SamagriLine(slug: "samagri-leaf-cups", nameEn: "Prasadam leaf cups", nameTe: "ప్రసాదం దోనెలు", priceMinor: 4000, quantity: 10),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "25 ml", packTe: "25 మి.లీ."),
    SamagriLine(slug: "samagri-small-diyas", nameEn: "Clay lamps (Matti depalu)", nameTe: "మట్టి దీపాలు", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-sugar-crystals", nameEn: "Sugar crystals", nameTe: "పంచదార బిళ్లలు", priceMinor: 4000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", priceMinor: 6000),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "25 ml", packTe: "25 మి.లీ."),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "25 ml", packTe: "25 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "50 ml", packTe: "50 మి.లీ."),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 5),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-paper-umbrella", nameEn: "Paper umbrella", nameTe: "కాగితపు గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900),
  ],
);

const ganeshMiniOfficeList = SamagriFestivalList(
  id: "ganesh-mini-office",
  kitSlug: "ganesh-mini-office-puja",
  titleEn: "Mini Office Pooja Kit",
  titleTe: "మినీ ఆఫీస్ పూజ కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus office desk puja samagri.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో ఆఫీస్ పూజా సామగ్రి.",
  kitPriceMinor: 149900,
  kitMrpMinor: 189900,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-gandham", nameEn: "Sandal paste (Gandham)", nameTe: "గంధం", priceMinor: 8000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "2000g", packTe: "2000 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000, quantity: 5),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000, quantity: 5),
    SamagriLine(slug: "samagri-red-cloth", nameEn: "Red cloth", nameTe: "ఎర్రని బట్ట", priceMinor: 8000),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 2),
    SamagriLine(slug: "samagri-matchbox", nameEn: "Matchbox", nameTe: "అగ్గిపెట్టె", priceMinor: 1500, quantity: 2),
    SamagriLine(slug: "samagri-kankana-thread", nameEn: "Kankana thread", nameTe: "కంకణాల దారం", priceMinor: 2000),
    SamagriLine(slug: "samagri-yajnopavita", nameEn: "Yajnopavita", nameTe: "యజ్ఞోపవీతం", priceMinor: 5000),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, quantity: 12),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000, quantity: 12),
    SamagriLine(slug: "samagri-leaf-cups", nameEn: "Prasadam leaf cups", nameTe: "ప్రసాదం దోనెలు", priceMinor: 4000, quantity: 25),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "50 ml", packTe: "50 మి.లీ."),
    SamagriLine(slug: "samagri-small-diyas", nameEn: "Clay lamps (Matti depalu)", nameTe: "మట్టి దీపాలు", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-sugar-crystals", nameEn: "Sugar crystals", nameTe: "పంచదార బిళ్లలు", priceMinor: 4000, packEn: "150g", packTe: "150 గ్రా"),
    SamagriLine(slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", priceMinor: 6000),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "50 ml", packTe: "50 మి.లీ."),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "100 ml", packTe: "100 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 10),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-paper-umbrella", nameEn: "Paper umbrella", nameTe: "కాగితపు గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900, quantity: 2),
  ],
);

const ganeshMiniMandapamList = SamagriFestivalList(
  id: "ganesh-mini-mandapam",
  kitSlug: "ganesh-mini-mandapam",
  titleEn: "Mini Mandapam Kit",
  titleTe: "మినీ మండపం కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus small mandapam / community samagri.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో చిన్న మండపం సామగ్రి.",
  kitPriceMinor: 199900,
  kitMrpMinor: 239900,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-gandham", nameEn: "Sandal paste (Gandham)", nameTe: "గంధం", priceMinor: 8000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "5 packs", packTe: "5 ప్యాక్‌లు", quantity: 5),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "5000g", packTe: "5000 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000, quantity: 50),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000, quantity: 25),
    SamagriLine(slug: "samagri-red-cloth", nameEn: "Red cloth", nameTe: "ఎర్రని బట్ట", priceMinor: 8000, packEn: "3 m", packTe: "3 మీ"),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 5),
    SamagriLine(slug: "samagri-matchbox", nameEn: "Matchbox", nameTe: "అగ్గిపెట్టె", priceMinor: 1500, quantity: 5),
    SamagriLine(slug: "samagri-kankana-thread", nameEn: "Kankana thread", nameTe: "కంకణాల దారం", priceMinor: 2000, quantity: 10),
    SamagriLine(slug: "samagri-yajnopavita", nameEn: "Yajnopavita", nameTe: "యజ్ఞోపవీతం", priceMinor: 5000, quantity: 10),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000, quantity: 10),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, quantity: 50),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000, quantity: 50),
    SamagriLine(slug: "samagri-leaf-cups", nameEn: "Prasadam leaf cups", nameTe: "ప్రసాదం దోనెలు", priceMinor: 4000, quantity: 100),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "1000g", packTe: "1000 గ్రా"),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-small-diyas", nameEn: "Clay lamps (Matti depalu)", nameTe: "మట్టి దీపాలు", priceMinor: 8000, quantity: 4),
    SamagriLine(slug: "samagri-sugar-crystals", nameEn: "Sugar crystals", nameTe: "పంచదార బిళ్లలు", priceMinor: 4000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", priceMinor: 6000, quantity: 2),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "2000 ml", packTe: "2000 మి.లీ."),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 100),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "10 packs", packTe: "10 ప్యాక్‌లు", quantity: 10),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-paper-umbrella", nameEn: "Paper umbrella", nameTe: "కాగితపు గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900, quantity: 2),
  ],
);

const ganeshMegaHomeList = SamagriFestivalList(
  id: "ganesh-mega-home",
  kitSlug: "ganesh-mega-home-puja",
  titleEn: "Mega Home Pooja Kit",
  titleTe: "మెగా ఇంటి పూజ కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus a fuller home Chaturthi list.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో పూర్తి ఇంటి పూజా సామగ్రి.",
  kitPriceMinor: 299900,
  kitMrpMinor: 339900,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "10g", packTe: "10 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "10g", packTe: "10 గ్రా"),
    SamagriLine(slug: "samagri-astagandham", nameEn: "Astagandham", nameTe: "అష్టగంధం", priceMinor: 8000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "2 packs", packTe: "2 ప్యాక్‌లు", quantity: 2),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000, quantity: 11),
    SamagriLine(slug: "samagri-dates", nameEn: "Dates", nameTe: "ఖర్జూరాలు", priceMinor: 8000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000, quantity: 11),
    SamagriLine(slug: "samagri-puja-vastras", nameEn: "Puja vastras", nameTe: "పూజా వస్త్రాలు", priceMinor: 19900),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "2000g", packTe: "2000 గ్రా"),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-markatam-ganesh", nameEn: "Markatam Ganesh", nameTe: "మార్కటం గణేష్", priceMinor: 14900),
    SamagriLine(slug: "samagri-sindoor", nameEn: "Sindoor", nameTe: "సింధూరం", priceMinor: 4000, packEn: "5g", packTe: "5 గ్రా"),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, packEn: "5g", packTe: "5 గ్రా"),
    SamagriLine(slug: "samagri-javadhu", nameEn: "Javadhu", nameTe: "జావాదు", priceMinor: 8000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-attar", nameEn: "Attar", nameTe: "అత్తరు", priceMinor: 8000, packEn: "1 bottle", packTe: "1 సీసా"),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 20),
    SamagriLine(slug: "samagri-pacha-karpuram", nameEn: "Pacha karpuram", nameTe: "పచ్చ కర్పూరం", priceMinor: 8000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "2 packs", packTe: "2 ప్యాక్‌లు", quantity: 2),
    SamagriLine(slug: "samagri-puvvu-wicks", nameEn: "Puvvu vathulu", nameTe: "పువ్వు వత్తులు", priceMinor: 4000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-jileda-wicks", nameEn: "Jileda vathulu", nameTe: "జిలేడు వత్తులు", priceMinor: 4000, packEn: "1 pack", packTe: "1 ప్యాక్"),
    SamagriLine(slug: "samagri-akhanda-deepam", nameEn: "Akhanda deepam", nameTe: "అఖండ దీపం", priceMinor: 14900, quantity: 2),
    SamagriLine(slug: "samagri-poha", nameEn: "Poha (Atukulu)", nameTe: "అటుకులు", priceMinor: 8000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-cloves", nameEn: "Cloves", nameTe: "లవంగాలు", priceMinor: 4000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-cardamom", nameEn: "Cardamom", nameTe: "యాలకులు", priceMinor: 6000, packEn: "25g", packTe: "25 గ్రా"),
    SamagriLine(slug: "samagri-white-thread", nameEn: "White thread", nameTe: "తెల్ల దారం", priceMinor: 2000, packEn: "1 roll", packTe: "1 రోల్"),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000, packEn: "1 roll", packTe: "1 రోల్"),
    SamagriLine(slug: "samagri-moli-thread", nameEn: "Moli thread", nameTe: "మౌలి దారం", priceMinor: 3000, quantity: 10),
    SamagriLine(slug: "samagri-garland", nameEn: "Flower garland", nameTe: "పూల మాల", priceMinor: 10000, quantity: 2),
    SamagriLine(slug: "samagri-jenu", nameEn: "Jenu", nameTe: "జేను", priceMinor: 4000, quantity: 2),
    SamagriLine(slug: "samagri-head-band", nameEn: "Head band", nameTe: "తలపట్టీ", priceMinor: 4000, quantity: 2),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-gomutra", nameEn: "Gomutra", nameTe: "గోమూత్రం", priceMinor: 5000, packEn: "100 ml", packTe: "100 మి.లీ."),
    SamagriLine(slug: "samagri-gangajal", nameEn: "Gangajal", nameTe: "గంగాజలం", priceMinor: 5000, packEn: "100 ml", packTe: "100 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-muggu-colours", nameEn: "Muggu colours", nameTe: "ముగ్గు రంగులు", priceMinor: 8000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-backdrop", nameEn: "Backdrop", nameTe: "నేపథ్యం", priceMinor: 19900),
    SamagriLine(slug: "samagri-asanam", nameEn: "Asanam", nameTe: "ఆసనం", priceMinor: 14900),
    SamagriLine(slug: "samagri-god-asanam", nameEn: "Deity asanam", nameTe: "దేవత ఆసనం", priceMinor: 14900),
    SamagriLine(slug: "samagri-dona-cups", nameEn: "Dona cups", nameTe: "దోనెలు", priceMinor: 4000, quantity: 25),
    SamagriLine(slug: "samagri-khandwa", nameEn: "Khandwa", nameTe: "ఖండ్వా", priceMinor: 8000),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900),
    SamagriLine(slug: "samagri-umbrella", nameEn: "Umbrella", nameTe: "గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-shubh-labh", nameEn: "Shubh Labh sticker", nameTe: "శుభ లాభ్ స్టిక్కర్", priceMinor: 3000),
    SamagriLine(slug: "samagri-peacock-feathers", nameEn: "Peacock feathers", nameTe: "నెమలి ఈకలు", priceMinor: 8000, packEn: "small bunch", packTe: "చిన్న కట్ట"),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 20),
  ],
);

const ganeshMegaOfficeList = SamagriFestivalList(
  id: "ganesh-mega-office",
  kitSlug: "ganesh-mega-office-puja",
  titleEn: "Mega Office Pooja Kit",
  titleTe: "మెగా ఆఫీస్ కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus larger office shrine samagri.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో పెద్ద ఆఫీస్ పూజా సామగ్రి.",
  kitPriceMinor: 333300,
  kitMrpMinor: 373300,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-astagandham", nameEn: "Astagandham", nameTe: "అష్టగంధం", priceMinor: 8000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "5 packs", packTe: "5 ప్యాక్‌లు", quantity: 5),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "150g", packTe: "150 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000, quantity: 25),
    SamagriLine(slug: "samagri-dates", nameEn: "Dates", nameTe: "ఖర్జూరాలు", priceMinor: 8000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000, quantity: 21),
    SamagriLine(slug: "samagri-puja-vastras", nameEn: "Puja vastras", nameTe: "పూజా వస్త్రాలు", priceMinor: 19900, quantity: 2),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "2500g", packTe: "2500 గ్రా"),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-markatam-ganesh", nameEn: "Markatam Ganesh", nameTe: "మార్కటం గణేష్", priceMinor: 14900),
    SamagriLine(slug: "samagri-sindoor", nameEn: "Sindoor", nameTe: "సింధూరం", priceMinor: 4000, packEn: "10g", packTe: "10 గ్రా"),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000, quantity: 12),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, quantity: 12),
    SamagriLine(slug: "samagri-javadhu", nameEn: "Javadhu", nameTe: "జావాదు", priceMinor: 8000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-attar", nameEn: "Attar", nameTe: "అత్తరు", priceMinor: 8000, packEn: "1 bottle", packTe: "1 సీసా"),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 30),
    SamagriLine(slug: "samagri-pacha-karpuram", nameEn: "Pacha karpuram", nameTe: "పచ్చ కర్పూరం", priceMinor: 8000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "5 packs", packTe: "5 ప్యాక్‌లు", quantity: 5),
    SamagriLine(slug: "samagri-puvvu-wicks", nameEn: "Puvvu vathulu", nameTe: "పువ్వు వత్తులు", priceMinor: 4000, packEn: "2 packs", packTe: "2 ప్యాక్‌లు", quantity: 2),
    SamagriLine(slug: "samagri-jileda-wicks", nameEn: "Jileda vathulu", nameTe: "జిలేడు వత్తులు", priceMinor: 4000, packEn: "2 packs", packTe: "2 ప్యాక్‌లు", quantity: 2),
    SamagriLine(slug: "samagri-akhanda-deepam", nameEn: "Akhanda deepam", nameTe: "అఖండ దీపం", priceMinor: 14900, quantity: 2),
    SamagriLine(slug: "samagri-poha", nameEn: "Poha (Atukulu)", nameTe: "అటుకులు", priceMinor: 8000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-cloves", nameEn: "Cloves", nameTe: "లవంగాలు", priceMinor: 4000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-cardamom", nameEn: "Cardamom", nameTe: "యాలకులు", priceMinor: 6000, packEn: "50g", packTe: "50 గ్రా"),
    SamagriLine(slug: "samagri-white-thread", nameEn: "White thread", nameTe: "తెల్ల దారం", priceMinor: 2000, quantity: 2),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000, quantity: 2),
    SamagriLine(slug: "samagri-moli-thread", nameEn: "Moli thread", nameTe: "మౌలి దారం", priceMinor: 3000, quantity: 25),
    SamagriLine(slug: "samagri-garland", nameEn: "Flower garland", nameTe: "పూల మాల", priceMinor: 10000, quantity: 5),
    SamagriLine(slug: "samagri-jenu", nameEn: "Jenu", nameTe: "జేను", priceMinor: 4000, quantity: 5),
    SamagriLine(slug: "samagri-head-band", nameEn: "Head band", nameTe: "తలపట్టీ", priceMinor: 4000, quantity: 5),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-gomutra", nameEn: "Gomutra", nameTe: "గోమూత్రం", priceMinor: 5000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-gangajal", nameEn: "Gangajal", nameTe: "గంగాజలం", priceMinor: 5000, packEn: "250 ml", packTe: "250 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "1000 ml", packTe: "1000 మి.లీ."),
    SamagriLine(slug: "samagri-muggu-colours", nameEn: "Muggu colours", nameTe: "ముగ్గు రంగులు", priceMinor: 8000, packEn: "1000g", packTe: "1000 గ్రా"),
    SamagriLine(slug: "samagri-backdrop", nameEn: "Backdrop", nameTe: "నేపథ్యం", priceMinor: 19900),
    SamagriLine(slug: "samagri-asanam", nameEn: "Asanam", nameTe: "ఆసనం", priceMinor: 14900),
    SamagriLine(slug: "samagri-god-asanam", nameEn: "Deity asanam", nameTe: "దేవత ఆసనం", priceMinor: 14900),
    SamagriLine(slug: "samagri-dona-cups", nameEn: "Dona cups", nameTe: "దోనెలు", priceMinor: 4000, quantity: 50),
    SamagriLine(slug: "samagri-khandwa", nameEn: "Khandwa", nameTe: "ఖండ్వా", priceMinor: 8000),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900, quantity: 2),
    SamagriLine(slug: "samagri-umbrella", nameEn: "Umbrella", nameTe: "గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-shubh-labh", nameEn: "Shubh Labh sticker", nameTe: "శుభ లాభ్ స్టిక్కర్", priceMinor: 3000, quantity: 2),
    SamagriLine(slug: "samagri-peacock-feathers", nameEn: "Peacock feathers", nameTe: "నెమలి ఈకలు", priceMinor: 8000, packEn: "1 bunch", packTe: "1 కట్ట"),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 25),
  ],
);

const ganeshMegaMandapamList = SamagriFestivalList(
  id: "ganesh-mega-mandapam",
  kitSlug: "ganesh-mega-mandapam",
  titleEn: "Mega Mandapam Kit",
  titleTe: "మెగా మండపం కిట్",
  subtitleEn: "Eco-friendly clay Ganesh idol plus nine-day mandapam samagri.",
  subtitleTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహంతో తొమ్మిది రోజుల మండపం సామగ్రి.",
  kitPriceMinor: 399900,
  kitMrpMinor: 439900,
  items: [
    SamagriLine(slug: "samagri-turmeric", nameEn: "Turmeric (Pasupu)", nameTe: "పసుపు", priceMinor: 4000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", priceMinor: 5000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-astagandham", nameEn: "Astagandham", nameTe: "అష్టగంధం", priceMinor: 8000, packEn: "250g", packTe: "250 గ్రా"),
    SamagriLine(slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", priceMinor: 4000, packEn: "10 packs", packTe: "10 ప్యాక్‌లు", quantity: 10),
    SamagriLine(slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", priceMinor: 5000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-betel-nuts", nameEn: "Betel nuts (Vakkalu)", nameTe: "వక్కలు", priceMinor: 8000, quantity: 25),
    SamagriLine(slug: "samagri-dates", nameEn: "Dates", nameTe: "ఖర్జూరాలు", priceMinor: 8000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", priceMinor: 6000, quantity: 50),
    SamagriLine(slug: "samagri-puja-vastras", nameEn: "Puja vastras", nameTe: "పూజా వస్త్రాలు", priceMinor: 19900, quantity: 3),
    SamagriLine(slug: "samagri-rice", nameEn: "Rice", nameTe: "బియ్యం", priceMinor: 24900, packEn: "5000g", packTe: "5000 గ్రా"),
    SamagriLine(slug: "samagri-eco-ganesh-idol", nameEn: "Eco-friendly clay Ganesh idol", nameTe: "పర్యావరణ అనుకూల మట్టి గణేష్ విగ్రహం", priceMinor: 19900),
    SamagriLine(slug: "samagri-markatam-ganesh", nameEn: "Markatam Ganesh", nameTe: "మార్కటం గణేష్", priceMinor: 14900),
    SamagriLine(slug: "samagri-sindoor", nameEn: "Sindoor", nameTe: "సింధూరం", priceMinor: 4000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-bukka", nameEn: "Bukka", nameTe: "బుక్కా", priceMinor: 4000, quantity: 50),
    SamagriLine(slug: "samagri-gulal", nameEn: "Gulal", nameTe: "గులాల్", priceMinor: 4000, quantity: 50),
    SamagriLine(slug: "samagri-javadhu", nameEn: "Javadhu", nameTe: "జావాదు", priceMinor: 8000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-attar", nameEn: "Attar", nameTe: "అత్తరు", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-dhoop-cups", nameEn: "Dhoop cups", nameTe: "ధూపం కప్పులు", priceMinor: 4000, quantity: 100),
    SamagriLine(slug: "samagri-pacha-karpuram", nameEn: "Pacha karpuram", nameTe: "పచ్చ కర్పూరం", priceMinor: 8000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-cotton-wicks", nameEn: "Cotton wicks", nameTe: "వత్తులు", priceMinor: 3000, packEn: "10 packs", packTe: "10 ప్యాక్‌లు", quantity: 10),
    SamagriLine(slug: "samagri-puvvu-wicks", nameEn: "Puvvu vathulu", nameTe: "పువ్వు వత్తులు", priceMinor: 4000, packEn: "5 packs", packTe: "5 ప్యాక్‌లు", quantity: 5),
    SamagriLine(slug: "samagri-jileda-wicks", nameEn: "Jileda vathulu", nameTe: "జిలేడు వత్తులు", priceMinor: 4000, packEn: "5 packs", packTe: "5 ప్యాక్‌లు", quantity: 5),
    SamagriLine(slug: "samagri-akhanda-deepam", nameEn: "Akhanda deepam", nameTe: "అఖండ దీపం", priceMinor: 14900, quantity: 4),
    SamagriLine(slug: "samagri-poha", nameEn: "Poha (Atukulu)", nameTe: "అటుకులు", priceMinor: 8000, packEn: "1000g", packTe: "1000 గ్రా"),
    SamagriLine(slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం", priceMinor: 8000, packEn: "2000g", packTe: "2000 గ్రా"),
    SamagriLine(slug: "samagri-cloves", nameEn: "Cloves", nameTe: "లవంగాలు", priceMinor: 4000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-cardamom", nameEn: "Cardamom", nameTe: "యాలకులు", priceMinor: 6000, packEn: "100g", packTe: "100 గ్రా"),
    SamagriLine(slug: "samagri-white-thread", nameEn: "White thread", nameTe: "తెల్ల దారం", priceMinor: 2000, quantity: 5),
    SamagriLine(slug: "samagri-sutli", nameEn: "Sutli thread", nameTe: "సుత్లీ దారం", priceMinor: 2000, quantity: 5),
    SamagriLine(slug: "samagri-moli-thread", nameEn: "Moli thread", nameTe: "మౌలి దారం", priceMinor: 3000, quantity: 100),
    SamagriLine(slug: "samagri-garland", nameEn: "Flower garland", nameTe: "పూల మాల", priceMinor: 10000, quantity: 20),
    SamagriLine(slug: "samagri-jenu", nameEn: "Jenu", nameTe: "జేను", priceMinor: 4000, quantity: 20),
    SamagriLine(slug: "samagri-head-band", nameEn: "Head band", nameTe: "తలపట్టీ", priceMinor: 4000, quantity: 20),
    SamagriLine(slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి", priceMinor: 25000, packEn: "500g", packTe: "500 గ్రా"),
    SamagriLine(slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె", priceMinor: 12000, packEn: "1000 ml", packTe: "1000 మి.లీ."),
    SamagriLine(slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు", priceMinor: 5000, packEn: "1000 ml", packTe: "1000 మి.లీ."),
    SamagriLine(slug: "samagri-gomutra", nameEn: "Gomutra", nameTe: "గోమూత్రం", priceMinor: 5000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-gangajal", nameEn: "Gangajal", nameTe: "గంగాజలం", priceMinor: 5000, packEn: "500 ml", packTe: "500 మి.లీ."),
    SamagriLine(slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", priceMinor: 28000, packEn: "2000 ml", packTe: "2000 మి.లీ."),
    SamagriLine(slug: "samagri-muggu-colours", nameEn: "Muggu colours", nameTe: "ముగ్గు రంగులు", priceMinor: 8000, packEn: "3000g", packTe: "3000 గ్రా"),
    SamagriLine(slug: "samagri-backdrop", nameEn: "Backdrop", nameTe: "నేపథ్యం", priceMinor: 19900),
    SamagriLine(slug: "samagri-asanam", nameEn: "Asanam", nameTe: "ఆసనం", priceMinor: 14900, quantity: 2),
    SamagriLine(slug: "samagri-god-asanam", nameEn: "Deity asanam", nameTe: "దేవత ఆసనం", priceMinor: 14900),
    SamagriLine(slug: "samagri-dona-cups", nameEn: "Dona cups", nameTe: "దోనెలు", priceMinor: 4000, quantity: 200),
    SamagriLine(slug: "samagri-khandwa", nameEn: "Khandwa", nameTe: "ఖండ్వా", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-blouse-pieces", nameEn: "Blouse pieces", nameTe: "జాకెట్ పీసు", priceMinor: 39900, quantity: 3),
    SamagriLine(slug: "samagri-umbrella", nameEn: "Umbrella", nameTe: "గొడుగు", priceMinor: 8000),
    SamagriLine(slug: "samagri-shubh-labh", nameEn: "Shubh Labh sticker", nameTe: "శుభ లాభ్ స్టిక్కర్", priceMinor: 3000, quantity: 5),
    SamagriLine(slug: "samagri-peacock-feathers", nameEn: "Peacock feathers", nameTe: "నెమలి ఈకలు", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-pooja-book", nameEn: "Pooja vidhanam book", nameTe: "పూజా విధానం పుస్తకం", priceMinor: 8000, quantity: 2),
    SamagriLine(slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", priceMinor: 3000, quantity: 30),
  ],
);

/// From `docs/pooja_samagri.xlsx` → section "గణేష్ పూజ హోమం సామాగ్రి" (18 items).
const ganeshHomamList = SamagriFestivalList(
  id: 'ganesh',
  kitSlug: 'ganesh-puja-homam-samagri',
  titleEn: 'Ganesh Puja Homam',
  titleTe: 'గణేష్ పూజ హోమం',
  subtitleEn: 'Complete Ganesh puja / homam samagri from the Pooja Store Excel list.',
  subtitleTe: 'docs/pooja_samagri.xlsx లోని గణేష్ పూజ హోమం సామాగ్రి జాబితా.',
  kitPriceMinor: 199900,
  kitMrpMinor: 249900,
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

const ganeshEcoKitLists = [
  ganeshMiniHomeList,
  ganeshMiniOfficeList,
  ganeshMiniMandapamList,
  ganeshMegaHomeList,
  ganeshMegaOfficeList,
  ganeshMegaMandapamList,
];

const festivalSamagriLists = [
  ...ganeshEcoKitLists,
  ganeshHomamList,
  varalakshmiList,
];

SamagriFestivalList samagriListById(String? id) {
  return festivalSamagriLists.firstWhere(
    (list) => list.id == id,
    orElse: () => ganeshHomamList,
  );
}

SamagriFestivalList? samagriListByKitSlug(String slug) {
  for (final list in festivalSamagriLists) {
    if (list.kitSlug == slug) return list;
  }
  return null;
}

List<SamagriLine> withOptionalOfferings(List<SamagriLine> items) {
  final packed = items
      .where((item) => !item.optional && item.slug != 'samagri-copper-pot')
      .toList();
  final slugs = packed.map((item) => item.slug).toSet();
  final names = packed.map((item) => item.nameEn.toLowerCase()).toSet();
  return [
    ...packed,
    ...kitOptionalOfferings
        .where(
          (extra) =>
              !slugs.contains(extra.slug) &&
              !names.contains(extra.nameEn.toLowerCase()),
        )
        .map(
          (extra) => SamagriLine(
            slug: extra.slug,
            nameEn: extra.nameEn,
            nameTe: extra.nameTe,
            priceMinor: extra.priceMinor,
            optional: true,
          ),
        ),
  ];
}
