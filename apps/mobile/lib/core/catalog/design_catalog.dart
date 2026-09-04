import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'festival_catalog_i18n.dart';
import 'samagri_catalog.dart';

class ShopCategory {
  const ShopCategory({
    required this.id,
    required this.name,
    required this.nameTe,
    required this.mono,
  });

  final String id;
  final String name;
  final String nameTe;
  final String mono;

  String label(bool te) => te ? nameTe : name;
}

const shopCategories = [
  ShopCategory(id: 'festival-kits', name: 'Festival Kits', nameTe: 'పండుగ కిట్‌లు', mono: 'FK'),
  ShopCategory(id: 'function-kits', name: 'Function Kits', nameTe: 'సమారంభ కిట్‌లు', mono: 'FN'),
  ShopCategory(id: 'daily-pooja', name: 'Daily Pooja', nameTe: 'రోజువారీ పూజ', mono: 'DP'),
  ShopCategory(id: 'flowers', name: 'Flowers', nameTe: 'పుష్పాలు', mono: 'FL'),
  ShopCategory(id: 'agarbatti', name: 'Agarbatti', nameTe: 'అగరబత్తీలు', mono: 'AG'),
  ShopCategory(id: 'diyas', name: 'Diyas', nameTe: 'దీపాలు', mono: 'DY'),
  ShopCategory(id: 'oils', name: 'Oils', nameTe: 'నూనెలు', mono: 'OL'),
  ShopCategory(id: 'kumkum', name: 'Kumkum', nameTe: 'కుంకుమ', mono: 'KK'),
  ShopCategory(id: 'camphor', name: 'Camphor', nameTe: 'కర్పూరం', mono: 'CM'),
  ShopCategory(id: 'books', name: 'Books', nameTe: 'పుస్తకాలు', mono: 'BK'),
  ShopCategory(id: 'brass', name: 'Brass Items', nameTe: 'ఇత్తడి వస్తువులు', mono: 'BR'),
];

const nearbyStores = [
  (name: 'Sri Ganesha Pooja Store', distance: '1.2 km', rating: '4.6', eta: '25 min'),
  (name: 'Annapurna Pooja Samagri', distance: '2.0 km', rating: '4.8', eta: '35 min'),
  (name: 'Shree Devi Traders', distance: '3.4 km', rating: '4.5', eta: '45 min'),
];

class FestivalGuide {
  const FestivalGuide({
    required this.id,
    required this.name,
    required this.date,
    required this.target,
    required this.description,
    required this.speciality,
    required this.steps,
    required this.items,
    required this.kitName,
    required this.kitPrice,
    this.kitSlug,
    this.pricedItems,
  });

  final String id;
  final String name;
  final String date;
  final DateTime target;
  final String description;
  final String speciality;
  final List<String> steps;
  final List<String> items;
  final String kitName;
  final int kitPrice;
  final String? kitSlug;
  /// Per-item retail prices when sourced from [samagri_catalog.dart].
  final List<SamagriLine>? pricedItems;

  FestivalCopy? get _te => festivalCopyTe[id];

  int? get pricedItemsTotalMinor =>
      pricedItems == null ? null : sumSamagriLinePrices(pricedItems!);

  String localizedName(bool te) => te ? (_te?.nameTe ?? name) : name;

  String localizedDate(bool te) => te ? (_te?.dateTe ?? date) : date;

  String localizedDescription(bool te) =>
      te ? (_te?.descriptionTe ?? description) : description;

  String localizedSpeciality(bool te) =>
      te ? (_te?.specialityTe ?? speciality) : speciality;

  List<String> localizedSteps(bool te) => te ? (_te?.stepsTe ?? steps) : steps;

  List<String> localizedItems(bool te) {
    if (te && pricedItems != null && pricedItems!.isNotEmpty) {
      return pricedItems!.map((line) => line.displayName(true)).toList();
    }
    if (te && _te != null && _te!.itemsTe.isNotEmpty) return _te!.itemsTe;
    return items;
  }

  String localizedKitName(bool te) => te ? (_te?.kitNameTe ?? kitName) : kitName;

  String get daysTo {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final targetDay = DateTime(target.year, target.month, target.day);
    final days = targetDay.difference(today).inDays;
    if (days <= 0) return 'TODAY';
    if (days == 1) return 'IN 1 DAY';
    return 'IN $days DAYS';
  }
}

/// From `docs/pooja_samagri.xlsx` → section "గణేష్ పూజ హోమం సామాగ్రి".
const ganeshPujaHomamKitItems = [
  'Homa powder — 1 kg',
  'Poha / Atukulu — 1/2 kg',
  'Jaggery',
  'Navadhanyalu',
  'Rice flour',
  'Purnahuti',
  'Betel leaves (Tamalapakulu)',
  'Fruits',
  'Flowers',
  'Dry fruits',
  'Samithalu (homa sticks)',
  'Ghee',
  'Arati camphor',
  'Isthari / Durva leaves',
  'Homa stand',
  'Dhoti',
  'Blouse piece (Jacket piece)',
  'Coconuts',
];

final upcomingFestivals = [
  FestivalGuide(
    id: 'ganesh',
    name: 'Ganesh Chaturthi',
    date: '14 Sep 2026',
    target: DateTime(2026, 9, 14),
    description:
        'Ganesh Chaturthi marks the birth of Lord Ganesha, worshipped as the remover of obstacles and lord of new beginnings. Families install a clay idol at home for 1.5, 3, 5, 7 or 11 days before immersion.',
    speciality:
        'The festival centers on daily aarti, offering 21 durva grass blades and modak, and a community visarjan procession on the final day.',
    steps: [
      'Clean the puja space and install the idol facing east or north.',
      'Perform Prana Pratishtha to invoke life into the idol.',
      'Offer durva grass, red flowers, and modak with mantras.',
      'Perform aarti morning and evening through the festival.',
      'Immerse the idol in water on the chosen day (visarjan).',
    ],
    items: ganeshHomePujaList.items.map((line) => line.displayName(false)).toList(),
    kitName: 'Ganesh Chaturthi Home Puja Kit',
    kitPrice: 750,
    kitSlug: 'ganesh-chaturthi-home-puja',
    pricedItems: ganeshHomePujaList.items,
  ),
  FestivalGuide(
    id: 'navratri',
    name: 'Sharad Navratri',
    date: '11 Oct 2026',
    target: DateTime(2026, 10, 11),
    description:
        'Navratri honors nine forms of Goddess Durga over nine nights, culminating in Vijayadashami. Each day is dedicated to a different form of the goddess.',
    speciality:
        'A kalash is installed on day one and worshipped daily; many observe a fast and perform garba or dandiya in the evenings.',
    steps: [
      'Set up the kalash with mango leaves and a coconut on top.',
      'Sow barley seeds nearby as a symbol of growth.',
      'Light an akhand deepak for all nine days.',
      'Offer prayers to a different goddess form each day.',
      'Perform kanya puja and break the fast on Ashtami or Navami.',
    ],
    items: [
      'Kalash',
      'Coconut',
      'Mango leaves',
      'Barley seeds',
      'Red chowki cloth',
      'Oil lamp',
    ],
    kitName: 'Navratri Kalash Samagri',
    kitPrice: 1099,
  ),
  FestivalGuide(
    id: 'diwali',
    name: 'Diwali',
    date: '8 Nov 2026',
    target: DateTime(2026, 11, 8),
    description:
        'Diwali, the festival of lights, celebrates the return of Lord Rama to Ayodhya and the worship of Goddess Lakshmi for prosperity in the year ahead.',
    speciality:
        'Homes are lit with diyas and rangoli, and Lakshmi Puja is performed at dusk followed by sharing sweets with family.',
    steps: [
      'Clean and light the home with diyas at dusk.',
      'Draw a rangoli at the entrance to welcome the goddess.',
      'Set up Lakshmi and Ganesha idols with fresh flowers.',
      'Offer sweets, coins, and perform Lakshmi Puja.',
      'Distribute prasad and sweets to family and neighbors.',
    ],
    items: [
      'Diyas',
      'Rangoli colors',
      'Lakshmi-Ganesha idols',
      'Sweets',
      'Coins',
      'Flowers',
    ],
    kitName: 'Diwali Lakshmi Puja Samagri',
    kitPrice: 749,
  ),
];

FestivalGuide festivalById(String id) => upcomingFestivals.firstWhere(
      (f) => f.id == id,
      orElse: () => upcomingFestivals.first,
    );

const festivalRequiredItems = ganeshPujaHomamKitItems;

const familyMembers = [
  (
    name: 'Aarav Sharma',
    relation: 'Self',
    gotram: 'Bharadwaj',
    nakshatram: 'Rohini',
  ),
  (
    name: 'Meera Sharma',
    relation: 'Spouse',
    gotram: 'Kashyap',
    nakshatram: 'Ashwini',
  ),
];

const prototypeOrderHistory = [
  (name: 'Satyanarayan Puja Kit', date: '22 Jul 2026', amount: 749, status: 'Delivered'),
  (name: 'Daily Essentials (4 items)', date: '10 Jul 2026', amount: 210, status: 'Delivered'),
  (name: 'Griha Pravesh Kit', date: '02 Jun 2026', amount: 1499, status: 'Delivered'),
];

const prototypePriestHistory = [
  (priest: 'Pandit Anil Trivedi', ritual: 'Vastu Shanti (Home Visit)', date: '02 Jun 2026'),
  (priest: 'Pandit Venkatesh Iyer', ritual: 'Sathyanarayana Vratam (Online)', date: '14 Apr 2026'),
];

const prototypeNotifications = [
  (
    title: 'Ganesh Chaturthi in 36 days',
    body: 'Shop the complete kit now for guaranteed same-day delivery.',
    time: '2 hours ago',
  ),
  (
    title: 'Order delivered',
    body: 'Your Satyanarayan Puja Kit was delivered by Sri Ganesha Pooja Store.',
    time: 'Yesterday',
  ),
  (
    title: 'Booking confirmed',
    body: 'Pandit Anil Trivedi will visit on Aug 4, 10:00 AM for Vastu Shanti.',
    time: '2 days ago',
  ),
  (
    title: 'Flat 20% off Festival Kits',
    body: 'Use code FEST20 at checkout, valid till Sept 6.',
    time: '3 days ago',
  ),
];

bool isKitCategory(String id) =>
    id == 'festival-kits' || id == 'function-kits';

List<Map<String, dynamic>> filterCatalog({
  required String categoryId,
  required List<Map<String, dynamic>> kits,
  required List<Map<String, dynamic>> samagri,
}) {
  String nameOf(Map<String, dynamic> item) =>
      (item['name'] as String? ?? item['title'] as String? ?? '').toLowerCase();

  if (categoryId == 'festival-kits') {
    final festive = kits.where((k) {
      final n = nameOf(k);
      return n.contains('ganesh') ||
          n.contains('navratri') ||
          n.contains('diwali') ||
          n.contains('chaturthi') ||
          n.contains('festival');
    }).toList();
    return festive.isNotEmpty ? festive : kits;
  }
  if (categoryId == 'function-kits') {
    return kits;
  }

  final keywords = switch (categoryId) {
    'flowers' => ['flower', 'garland', 'marigold', 'hibiscus'],
    'agarbatti' => ['agarbatti', 'incense', 'dhoop'],
    'diyas' => ['diya', 'wick', 'lamp'],
    'oils' => ['oil', 'ghee', 'chandan'],
    'kumkum' => ['kumkum', 'haldi', 'turmeric', 'sindoor'],
    'camphor' => ['camphor', 'kapoor'],
    'books' => ['gita', 'book', 'stotra'],
    'brass' => ['brass', 'panchapatra', 'kalash', 'bell'],
    _ => <String>[],
  };

  if (keywords.isEmpty) return samagri;
  final matched = samagri.where((item) {
    final n = nameOf(item);
    return keywords.any(n.contains);
  }).toList();
  return matched.isNotEmpty ? matched : samagri;
}

Color categoryMonoColor(int index) =>
    index % 3 == 0 ? AppColors.maroon : AppColors.saffron;
