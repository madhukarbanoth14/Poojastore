enum KitItemCategoryId {
  essentials,
  materials,
  fragrance,
  food,
  threads,
  idol,
}

enum KitItemRole { essential, consumable }

enum GaneshKitPlace { home, office, mandapam }

enum GaneshKitSize { mini, mega }

class GaneshKitVariant {
  const GaneshKitVariant({required this.size, required this.place});

  final GaneshKitSize size;
  final GaneshKitPlace place;
}

const kitCategoryOrder = [
  KitItemCategoryId.essentials,
  KitItemCategoryId.materials,
  KitItemCategoryId.fragrance,
  KitItemCategoryId.food,
  KitItemCategoryId.threads,
  KitItemCategoryId.idol,
];

const _categoryBySlug = <String, KitItemCategoryId>{
  'samagri-kumkum': KitItemCategoryId.essentials,
  'samagri-turmeric': KitItemCategoryId.essentials,
  'samagri-gandham': KitItemCategoryId.essentials,
  'samagri-akshatalu': KitItemCategoryId.essentials,
  'samagri-bukka': KitItemCategoryId.essentials,
  'samagri-gulal': KitItemCategoryId.essentials,
  'samagri-sindoor': KitItemCategoryId.essentials,
  'samagri-astagandham': KitItemCategoryId.essentials,
  'samagri-javadhu': KitItemCategoryId.essentials,
  'samagri-gangajal': KitItemCategoryId.essentials,
  'samagri-gomutra': KitItemCategoryId.essentials,
  'samagri-rice': KitItemCategoryId.essentials,
  'samagri-rice-flour': KitItemCategoryId.essentials,
  'samagri-muggu-colours': KitItemCategoryId.essentials,
  'samagri-matchbox': KitItemCategoryId.materials,
  'samagri-leaf-cups': KitItemCategoryId.materials,
  'samagri-dona-cups': KitItemCategoryId.materials,
  'samagri-cotton-wicks': KitItemCategoryId.materials,
  'samagri-puvvu-wicks': KitItemCategoryId.materials,
  'samagri-jileda-wicks': KitItemCategoryId.materials,
  'samagri-akhanda-deepam': KitItemCategoryId.materials,
  'samagri-oil': KitItemCategoryId.materials,
  'samagri-puja-vastras': KitItemCategoryId.materials,
  'samagri-pooja-book': KitItemCategoryId.materials,
  'samagri-homa-powder': KitItemCategoryId.materials,
  'samagri-samithalu': KitItemCategoryId.materials,
  'samagri-homa-stand': KitItemCategoryId.materials,
  'samagri-purnahuti': KitItemCategoryId.materials,
  'samagri-navadhanyalu': KitItemCategoryId.materials,
  'samagri-isthari-leaves': KitItemCategoryId.materials,
  'samagri-21-patri': KitItemCategoryId.materials,
  'samagri-dhoop-cups': KitItemCategoryId.fragrance,
  'samagri-camphor': KitItemCategoryId.fragrance,
  'samagri-incense': KitItemCategoryId.fragrance,
  'samagri-pacha-karpuram': KitItemCategoryId.fragrance,
  'samagri-attar': KitItemCategoryId.fragrance,
  'samagri-rose-water': KitItemCategoryId.fragrance,
  'samagri-cloves': KitItemCategoryId.fragrance,
  'samagri-cardamom': KitItemCategoryId.fragrance,
  'samagri-jaggery': KitItemCategoryId.food,
  'samagri-rava': KitItemCategoryId.food,
  'samagri-sugar-crystals': KitItemCategoryId.food,
  'samagri-honey': KitItemCategoryId.food,
  'samagri-ghee': KitItemCategoryId.food,
  'samagri-coconuts': KitItemCategoryId.food,
  'samagri-dates': KitItemCategoryId.food,
  'samagri-poha': KitItemCategoryId.food,
  'samagri-betel-leaves': KitItemCategoryId.food,
  'samagri-betel-nuts': KitItemCategoryId.food,
  'samagri-turmeric-roots': KitItemCategoryId.food,
  'samagri-fruits': KitItemCategoryId.food,
  'samagri-flowers': KitItemCategoryId.food,
  'samagri-undrallu': KitItemCategoryId.food,
  'samagri-laddu': KitItemCategoryId.food,
  'samagri-panchamritam': KitItemCategoryId.food,
  'samagri-dry-fruits': KitItemCategoryId.food,
  'samagri-kankana-thread': KitItemCategoryId.threads,
  'samagri-sutli': KitItemCategoryId.threads,
  'samagri-yajnopavita': KitItemCategoryId.threads,
  'samagri-white-thread': KitItemCategoryId.threads,
  'samagri-moli-thread': KitItemCategoryId.threads,
  'samagri-blouse-pieces': KitItemCategoryId.threads,
  'samagri-khandwa': KitItemCategoryId.threads,
  'samagri-dhoti': KitItemCategoryId.threads,
  'samagri-eco-ganesh-idol': KitItemCategoryId.idol,
  'samagri-markatam-ganesh': KitItemCategoryId.idol,
  'samagri-red-cloth': KitItemCategoryId.idol,
  'samagri-paper-umbrella': KitItemCategoryId.idol,
  'samagri-umbrella': KitItemCategoryId.idol,
  'samagri-garland': KitItemCategoryId.idol,
  'samagri-jenu': KitItemCategoryId.idol,
  'samagri-head-band': KitItemCategoryId.idol,
  'samagri-backdrop': KitItemCategoryId.idol,
  'samagri-asanam': KitItemCategoryId.idol,
  'samagri-god-asanam': KitItemCategoryId.idol,
  'samagri-shubh-labh': KitItemCategoryId.idol,
  'samagri-peacock-feathers': KitItemCategoryId.idol,
};

const _essentialSlugs = {
  'samagri-eco-ganesh-idol',
  'samagri-markatam-ganesh',
  'samagri-pooja-book',
  'samagri-kankana-thread',
  'samagri-sutli',
  'samagri-yajnopavita',
  'samagri-white-thread',
  'samagri-moli-thread',
  'samagri-red-cloth',
  'samagri-paper-umbrella',
  'samagri-umbrella',
  'samagri-asanam',
  'samagri-god-asanam',
  'samagri-backdrop',
  'samagri-shubh-labh',
  'samagri-peacock-feathers',
  'samagri-khandwa',
  'samagri-blouse-pieces',
  'samagri-puja-vastras',
  'samagri-akhanda-deepam',
  'samagri-homa-stand',
  'samagri-dhoti',
};

KitItemCategoryId kitItemCategory(String slug) =>
    _categoryBySlug[slug] ?? KitItemCategoryId.materials;

KitItemRole kitItemRole(String slug) =>
    _essentialSlugs.contains(slug) ? KitItemRole.essential : KitItemRole.consumable;

String kitCategoryLabel(KitItemCategoryId id, bool te) {
  return switch (id) {
    KitItemCategoryId.essentials => te ? 'పూజా మూలాలు' : 'Puja Essentials',
    KitItemCategoryId.materials => te ? 'పూజా సామగ్రి' : 'Pooja Materials',
    KitItemCategoryId.fragrance => te ? 'సుగంధం & నైవేద్యం' : 'Fragrance & Offerings',
    KitItemCategoryId.food => te ? 'ఆహారం & నైవేద్యం' : 'Food & Naivedyam',
    KitItemCategoryId.threads => te ? 'దారాలు & ఉపకరణాలు' : 'Threads & Accessories',
    KitItemCategoryId.idol => te ? 'విగ్రహం & అలంకరణ' : 'Idol & Decoration',
  };
}

GaneshKitVariant? parseGaneshKitSlug(String slug) {
  final match = RegExp(r'^ganesh-(mini|mega)-(home-puja|office-puja|mandapam)$')
      .firstMatch(slug);
  if (match == null) return null;
  final place = switch (match.group(2)) {
    'home-puja' => GaneshKitPlace.home,
    'office-puja' => GaneshKitPlace.office,
    _ => GaneshKitPlace.mandapam,
  };
  return GaneshKitVariant(
    size: match.group(1) == 'mega' ? GaneshKitSize.mega : GaneshKitSize.mini,
    place: place,
  );
}

String ganeshKitSlug(GaneshKitSize size, GaneshKitPlace place) {
  final sizeKey = size == GaneshKitSize.mini ? 'mini' : 'mega';
  if (place == GaneshKitPlace.mandapam) return 'ganesh-$sizeKey-mandapam';
  final placeKey = place == GaneshKitPlace.home ? 'home' : 'office';
  return 'ganesh-$sizeKey-$placeKey-puja';
}

String ganeshSizeLabel(GaneshKitSize size, bool te) {
  if (size == GaneshKitSize.mini) return te ? 'మినీ' : 'Mini';
  return te ? 'మెగా' : 'Mega';
}

String ganeshPlaceTitle(GaneshKitPlace place, bool te) {
  return switch (place) {
    GaneshKitPlace.home => te ? 'ఇల్లు' : 'Home',
    GaneshKitPlace.office => te ? 'ఆఫీస్' : 'Office',
    GaneshKitPlace.mandapam => te ? 'మండపం' : 'Mandapam',
  };
}

String ganeshPlaceSubtitle(GaneshKitPlace place, bool te) {
  return switch (place) {
    GaneshKitPlace.home => te ? 'కుటుంబ పూజకు' : 'For family puja',
    GaneshKitPlace.office => te ? 'కార్యాలయ పూజకు' : 'For workplace puja',
    GaneshKitPlace.mandapam => te ? 'కమ్యూనిటీ వేడుకకు' : 'For community celebration',
  };
}

String ganeshKitHeadline(GaneshKitVariant variant, bool te) {
  final place = ganeshPlaceTitle(variant.place, te);
  final size = ganeshSizeLabel(variant.size, te);
  return te
      ? 'గణేశ చతుర్థి – $size $place పూజా కిట్'
      : 'Ganesh Chaturthi – $size $place Pooja Kit';
}

String ganeshKitBlurb(GaneshKitPlace place, bool te) {
  return switch (place) {
    GaneshKitPlace.home => te
        ? 'ఇంటి గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.'
        : 'Everything you need for a traditional Ganesh Chaturthi home puja, carefully packed in one convenient kit.',
    GaneshKitPlace.office => te
        ? 'ఆఫీసు గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.'
        : 'Everything you need for a traditional Ganesh Chaturthi workplace puja, carefully packed in one convenient kit.',
    GaneshKitPlace.mandapam => te
        ? 'మండపం గణేశ చతుర్థి పూజకు కావాల్సిన సామగ్రి — ఒకే కిట్‌లో జాగ్రత్తగా ప్యాక్ చేయబడింది.'
        : 'Everything you need for a traditional Ganesh Chaturthi mandapam celebration, carefully packed in one convenient kit.',
  };
}

String formatKitQty(String? pack, int quantity, bool te) {
  final raw = pack?.trim();
  if (raw != null && raw.isNotEmpty) {
    return te ? raw : prettyPack(raw);
  }
  return '×${quantity > 0 ? quantity : 1}';
}

String prettyPack(String pack) {
  var value = pack.trim();
  final grams = RegExp(r'^(\d+(?:\.\d+)?)\s*g$', caseSensitive: false).firstMatch(value);
  if (grams != null) {
    final n = num.parse(grams.group(1)!);
    if (n >= 1000 && n % 1000 == 0) return '${n / 1000} kg';
    return '$n g';
  }
  final ml = RegExp(r'^(\d+(?:\.\d+)?)\s*ml$', caseSensitive: false).firstMatch(value);
  if (ml != null) {
    final n = num.parse(ml.group(1)!);
    if (n >= 1000 && n % 1000 == 0) return '${n / 1000} L';
    return '$n ml';
  }
  value = value.replaceAll(RegExp(r'\b1 pack\b', caseSensitive: false), '1 Pack');
  value = value.replaceAllMapped(
    RegExp(r'(\d+)\s*packs\b', caseSensitive: false),
    (m) => '${m.group(1)} Packs',
  );
  return value;
}

int? mrpIfHigher(int? mrpMinor, int priceMinor) {
  if (mrpMinor == null || mrpMinor <= priceMinor) return null;
  return mrpMinor;
}

const kitOptionalOfferings = [
  SamagriOffering('samagri-21-patri', '21 patri pack', '21 రకాల పత్రి', 8000),
  SamagriOffering('samagri-isthari-leaves', 'Durva / isthari leaves', 'దూర్వా గడ్డి', 4000),
  SamagriOffering('samagri-undrallu', 'Undrallu', 'ఉండ్రాళ్లు / మోదకం', 8000),
  SamagriOffering('samagri-laddu', 'Laddu', 'లడ్డూ', 8000),
  SamagriOffering('samagri-panchamritam', 'Panchamritam pack', 'పంచామృతం ప్యాక్', 19900),
  SamagriOffering('samagri-flowers', 'Loose flowers', 'విడిపూలు / పువ్వులు', 8000),
];

class SamagriOffering {
  const SamagriOffering(this.slug, this.nameEn, this.nameTe, this.priceMinor);
  final String slug;
  final String nameEn;
  final String nameTe;
  final int priceMinor;
}
