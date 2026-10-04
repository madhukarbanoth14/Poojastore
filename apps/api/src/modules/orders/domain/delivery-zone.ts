export const HYDERABAD_DELIVERY_MESSAGE =
  'We are currently delivering in Hyderabad.';

const HYDERABAD_PIN = /^500\d{3}$/;

export function isHyderabadDelivery(input: {
  city?: string | null;
  postalCode?: string | null;
}) {
  const pin = (input.postalCode ?? '').replace(/\D/g, '');
  return HYDERABAD_PIN.test(pin);
}

export function assertHyderabadDelivery(input: {
  city?: string | null;
  postalCode?: string | null;
}) {
  if (!isHyderabadDelivery(input)) {
    throw new Error(HYDERABAD_DELIVERY_MESSAGE);
  }
}
