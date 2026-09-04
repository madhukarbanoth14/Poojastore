export type GaneshSamagriLine = {
  slug: string;
  nameEn: string;
  nameTe: string;
  packEn?: string;
  packTe?: string;
  quantity?: number;
  optional?: boolean;
};

export const ganeshHomePujaItems: GaneshSamagriLine[] = [
  { slug: "samagri-turmeric", nameEn: "Turmeric", nameTe: "పసుపు", packEn: "50g", packTe: "50 గ్రాములు" },
  { slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", packEn: "50g", packTe: "50 గ్రాములు" },
  { slug: "samagri-bukka-gulal", nameEn: "Bukka gulal", nameTe: "బుక్కా గులాల్", packEn: "50g", packTe: "50 గ్రాములు" },
  { slug: "samagri-large-wick", nameEn: "Large wick", nameTe: "పెద్ద వత్తి" },
  { slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరబత్తులు", packEn: "1 packet", packTe: "1 ప్యాకెట్" },
  { slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", packEn: "500 ml", packTe: "500 మి.లీ." },
  { slug: "samagri-camphor", nameEn: "Camphor", nameTe: "కర్పూరం", packEn: "25g", packTe: "25 గ్రాములు" },
  { slug: "samagri-cotton-vastra", nameEn: "Cotton vastra", nameTe: "పత్తి వస్త్రం" },
  { slug: "samagri-betel-nuts", nameEn: "Betel nuts", nameTe: "వక్కలు", quantity: 12 },
  { slug: "samagri-dates", nameEn: "Dates", nameTe: "ఖర్జూరాలు", quantity: 12 },
  { slug: "samagri-sambrani", nameEn: "Sambrani", nameTe: "సాంబ్రాణి", packEn: "50g", packTe: "50 గ్రాములు" },
  { slug: "samagri-attar", nameEn: "Attar", nameTe: "అత్తరు" },
  { slug: "samagri-rose-water", nameEn: "Rose water", nameTe: "పన్నీరు" },
  { slug: "samagri-honey", nameEn: "Honey", nameTe: "తేనె" },
  { slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి" },
  { slug: "samagri-gandham", nameEn: "Sandal paste (Gandham)", nameTe: "గంధం", packEn: "30g", packTe: "30 గ్రాములు" },
  { slug: "samagri-white-cloth", nameEn: "White cloth", nameTe: "తెల్ల బట్ట" },
  { slug: "samagri-kankana-thread", nameEn: "Kankana thread", nameTe: "కంకణాల దారం" },
  { slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", quantity: 11 },
  { slug: "samagri-dried-coconut", nameEn: "Dried coconut halves", nameTe: "కుడుకలు", quantity: 2 },
  { slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", quantity: 2 },
];

export const ganeshPoojaItems: GaneshSamagriLine[] = [
  { slug: "samagri-turmeric", nameEn: "Turmeric", nameTe: "పసుపు", packEn: "100g", packTe: "100గ్రా" },
  { slug: "samagri-kumkum", nameEn: "Kumkum", nameTe: "కుంకుమ", packEn: "100g", packTe: "100గ్రా" },
  { slug: "samagri-gandham", nameEn: "Sandal paste (Gandham)", nameTe: "గంధం" },
  { slug: "samagri-incense", nameEn: "Incense sticks", nameTe: "అగరవత్తులు", packEn: "1 pack", packTe: "1 ప్యాక్" },
  { slug: "samagri-camphor", nameEn: "Arati camphor", nameTe: "హారతి కర్పూరం", packEn: "1 large", packTe: "1 పెద్దది" },
  { slug: "samagri-dhoti", nameEn: "Dhoti", nameTe: "దోవతి", packEn: "9×5", packTe: "9×5" },
  { slug: "samagri-sela", nameEn: "Sela (shawl)", nameTe: "శేల" },
  { slug: "samagri-dried-coconut", nameEn: "Dried coconut halves", nameTe: "ఎండిన కుడకలు", quantity: 5 },
  { slug: "samagri-betel-nuts", nameEn: "Betel nuts", nameTe: "వక్కలు", packEn: "100g", packTe: "100గ్రా" },
  { slug: "samagri-dates", nameEn: "Dates", nameTe: "ఖర్జూరాలు", packEn: "100g", packTe: "100గ్రా" },
  { slug: "samagri-turmeric-roots", nameEn: "Turmeric roots", nameTe: "పసుపు కొమ్ములు", packEn: "100g", packTe: "100గ్రా" },
  { slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తమలపాకులు", optional: true },
  { slug: "samagri-bananas", nameEn: "Bananas", nameTe: "అరటిపండ్లు", optional: true },
  { slug: "samagri-copper-pot", nameEn: "Copper pot (Chembu)", nameTe: "చెంబు (రాగి)", optional: true },
  { slug: "samagri-kankana-thread", nameEn: "Kankana thread", nameTe: "కంకణ దారం" },
  { slug: "samagri-yajnopavita", nameEn: "Yajnopavita", nameTe: "యజ్ఞోపవీతం", quantity: 2, packEn: "1 large, 1 small", packTe: "పెద్దది, చిన్నది" },
  { slug: "samagri-flowers", nameEn: "Loose flowers", nameTe: "విడి పువ్వులు", optional: true },
  { slug: "samagri-garland", nameEn: "Flower garlands", nameTe: "పూల దండలు", optional: true },
  { slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", quantity: 2 },
  { slug: "samagri-white-thread", nameEn: "White thread", nameTe: "తెల్ల దారం" },
  { slug: "samagri-navadhanyalu", nameEn: "Navadhanyalu", nameTe: "నవధాన్యాలు", packEn: "1/2 kg", packTe: "1/2 కిలో" },
  { slug: "samagri-akhanda-deepam", nameEn: "Akhanda deepam (clay)", nameTe: "అఖండ దీపం (మట్టిది)" },
  { slug: "samagri-diya-wicks", nameEn: "Lamp wicks", nameTe: "దీపం వత్తులు", quantity: 5 },
  { slug: "samagri-oil", nameEn: "Oil", nameTe: "నూనె", packEn: "2 liters", packTe: "2 లీటర్లు" },
  { slug: "samagri-durva", nameEn: "Patri and garika", nameTe: "పత్రి, గరిక", optional: true },
  { slug: "samagri-bell", nameEn: "Bell", nameTe: "గంట", optional: true },
  { slug: "samagri-arati-plate", nameEn: "Harathi plate", nameTe: "హారతి ప్లేటు", optional: true },
  { slug: "samagri-plates", nameEn: "Trays", nameTe: "ట్రేలు", quantity: 2, optional: true },
  { slug: "samagri-glasses", nameEn: "Glasses", nameTe: "గ్లాసులు", quantity: 2, optional: true },
  { slug: "samagri-undrallu", nameEn: "Undrallu (prasad)", nameTe: "ఉండ్రాళ్లు", optional: true },
  { slug: "samagri-laddu", nameEn: "Laddu (prasad)", nameTe: "లడ్డూ", optional: true },
  { slug: "samagri-small-diyas", nameEn: "Small lamps", nameTe: "చిన్న దీపాలు" },
  { slug: "samagri-cotton-wicks", nameEn: "Wicks", nameTe: "వత్తులు", packEn: "1 pack", packTe: "1 ప్యాక్" },
];

export const ganeshHomamItems: GaneshSamagriLine[] = [
  { slug: "samagri-homa-powder", nameEn: "Homa powder", nameTe: "హోమం పొడి", packEn: "1 kg", packTe: "1కిలో" },
  { slug: "samagri-poha", nameEn: "Poha (Atukulu)", nameTe: "అటుకులు", packEn: "1/2 kg", packTe: "1/2కిలో" },
  { slug: "samagri-jaggery", nameEn: "Jaggery", nameTe: "బెల్లం" },
  { slug: "samagri-navadhanyalu", nameEn: "Navadhanyalu", nameTe: "నవధాన్యాలు" },
  { slug: "samagri-rice-flour", nameEn: "Rice flour", nameTe: "బియ్యం పిండి" },
  { slug: "samagri-purnahuti", nameEn: "Purnahuti", nameTe: "పూర్ణాహుతి" },
  { slug: "samagri-betel-leaves", nameEn: "Betel leaves", nameTe: "తామలపాకులు" },
  { slug: "samagri-fruits", nameEn: "Fruits", nameTe: "పండ్లు" },
  { slug: "samagri-flowers", nameEn: "Flowers", nameTe: "పువ్వులు" },
  { slug: "samagri-dry-fruits", nameEn: "Dry fruits", nameTe: "డ్రై ఫ్రూట్స్" },
  { slug: "samagri-samithalu", nameEn: "Samithalu (homa sticks)", nameTe: "సమితలు" },
  { slug: "samagri-ghee", nameEn: "Ghee", nameTe: "నెయ్యి" },
  { slug: "samagri-camphor", nameEn: "Arati camphor", nameTe: "హారతి కర్పూరం" },
  { slug: "samagri-isthari-leaves", nameEn: "Isthari leaves (Durva)", nameTe: "ఇస్తరి ఆకులు" },
  { slug: "samagri-homa-stand", nameEn: "Homa stand", nameTe: "హోమం స్టాండ్" },
  { slug: "samagri-dhoti", nameEn: "Dhoti", nameTe: "ధోతి" },
  { slug: "samagri-blouse-pieces", nameEn: "Blouse piece (Jacket piece)", nameTe: "జాకెట్ పీసు" },
  { slug: "samagri-coconuts", nameEn: "Coconuts", nameTe: "కొబ్బరికాయలు", quantity: 2 },
];

export function ganeshLineLabel(line: GaneshSamagriLine, locale: "en" | "te") {
  const name = locale === "te" ? line.nameTe : line.nameEn;
  const pack = locale === "te" ? line.packTe : line.packEn;
  const qty = !pack && line.quantity && line.quantity > 1 ? ` ×${line.quantity}` : "";
  return pack ? `${name} — ${pack}` : `${name}${qty}`;
}

export function ganeshSelectedKeys(items: GaneshSamagriLine[], chosenOptional: Set<string>) {
  return items
    .filter((item) => !item.optional || chosenOptional.has(item.slug))
    .map((item) => item.slug);
}
