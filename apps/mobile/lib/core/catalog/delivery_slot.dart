/// Standard kits ship quickly; Ganesh Chaturthi kits are scheduled for Sunday.

const standardDeliverySlot = 'Within 24 hours';
const ganeshDeliverySlot = 'Delivering on Sunday';

bool isGaneshKitSlug(String? slug) {
  if (slug == null || slug.isEmpty) return false;
  final key = slug.toLowerCase();
  return key.startsWith('ganesh-') || key.contains('ganesh-chaturthi');
}

String deliverySlotForSlugs(Iterable<String?> slugs) {
  return slugs.any(isGaneshKitSlug) ? ganeshDeliverySlot : standardDeliverySlot;
}

String deliveryTagline(String? slug, {bool te = false}) {
  if (isGaneshKitSlug(slug)) {
    return te ? 'ఆదివారం డెలివరీ' : 'Delivering on Sunday';
  }
  return te ? '24 గంటల్లో డెలివరీ' : 'Delivered within 24 hours';
}

String deliveryConfirmCopy(Iterable<String?> slugs, {bool te = false}) {
  if (slugs.any(isGaneshKitSlug)) {
    return te
        ? 'మీ చిరునామాను నిర్ధారించండి. గణేశ కిట్‌ను ఆదివారం డెలివరీ చేస్తాం.'
        : 'Confirm your address. We will deliver your Ganesh kit on Sunday.';
  }
  return te
      ? 'మీ చిరునామాను నిర్ధారించండి. 24 గంటల్లో డెలివరీ చేస్తాం.'
      : 'Confirm your address. We will deliver within 24 hours.';
}
