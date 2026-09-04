export function formatVendorDispatchSms(order: {
  orderNumber: string;
  deliverySlot?: string | null;
  totalMinor: number;
  currency: string;
  user?: { fullName?: string | null; phoneE164?: string } | null;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  items: Array<{ productName: string; quantity: number }>;
}) {
  const rupees = (order.totalMinor / 100).toFixed(order.currency === 'INR' ? 0 : 2);
  const money = order.currency === 'INR' ? `Rs ${rupees}` : `${order.currency} ${rupees}`;
  const customer =
    order.user?.fullName?.trim() ||
    order.user?.phoneE164 ||
    'Customer';
  const address = order.shippingAddress
    ? [
        order.shippingAddress.line1,
        order.shippingAddress.line2,
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Address on file';
  const shown = order.items.slice(0, 8);
  const extra = order.items.length - shown.length;
  const lines = shown.map((item) => `- ${item.productName} x${item.quantity}`);
  if (extra > 0) lines.push(`- and ${extra} more`);

  return [
    `Pavitra Seva order ${order.orderNumber}`,
    `Deliver to: ${customer}${order.user?.phoneE164 ? ` ${order.user.phoneE164}` : ''}`,
    `Address: ${address}`,
    order.deliverySlot ? `Slot: ${order.deliverySlot}` : null,
    'Items:',
    ...lines,
    `Paid: ${money}`,
  ]
    .filter((line) => line != null && line !== '')
    .join('\n');
}
