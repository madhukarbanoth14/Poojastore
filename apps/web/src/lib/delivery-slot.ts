/** Standard kits ship quickly; Ganesh Chaturthi kits are scheduled for Sunday. */

export const STANDARD_DELIVERY_SLOT = "Within 24 hours";
export const GANESH_DELIVERY_SLOT = "Delivering on Sunday";

export function isGaneshKitSlug(slug: string | null | undefined) {
  if (!slug) return false;
  const key = slug.toLowerCase();
  return key.startsWith("ganesh-") || key.includes("ganesh-chaturthi");
}

export function deliverySlotForSlugs(slugs: Array<string | null | undefined>) {
  return slugs.some(isGaneshKitSlug) ? GANESH_DELIVERY_SLOT : STANDARD_DELIVERY_SLOT;
}

export function deliveryTagline(slug: string | null | undefined, locale: "en" | "te" = "en") {
  if (isGaneshKitSlug(slug)) {
    return locale === "te" ? "ఆదివారం డెలివరీ" : "Delivering on Sunday";
  }
  return locale === "te" ? "24 గంటల్లో డెలివరీ" : "Delivered within 24 hours";
}

export function deliveryConfirmCopy(
  slugs: Array<string | null | undefined>,
  locale: "en" | "te" = "en",
) {
  if (slugs.some(isGaneshKitSlug)) {
    return locale === "te"
      ? "మీ చిరునామాను నిర్ధారించండి. గణేశ కిట్‌ను ఆదివారం డెలివరీ చేస్తాం."
      : "Confirm your address. We will deliver your Ganesh kit on Sunday.";
  }
  return locale === "te"
    ? "మీ చిరునామాను నిర్ధారించండి. 24 గంటల్లో డెలివరీ చేస్తాం."
    : "Confirm your address. We will deliver within 24 hours.";
}
