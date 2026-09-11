export type OrderConfirmationEmailInput = {
  orderId: string;
  orderNumber: string;
  customerName?: string | null;
  currency: string;
  totalMinor: number;
  deliverySlot?: string | null;
  items: Array<{ productName: string; quantity: number; totalMinor: number }>;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  webBaseUrl?: string;
};

export type OrderConfirmationEmailContent = {
  subject: string;
  text: string;
  html: string;
};

function formatMoney(totalMinor: number, currency: string) {
  const amount = (totalMinor / 100).toFixed(currency === 'INR' ? 0 : 2);
  if (currency === 'INR') return `₹${amount}`;
  return `${currency} ${amount}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function orderUrl(webBaseUrl: string | undefined, orderId: string) {
  const base = (webBaseUrl ?? 'https://pavitraseva.in').replace(/\/$/, '');
  return `${base}/orders/${orderId}`;
}

function formatAddress(
  address: NonNullable<OrderConfirmationEmailInput['shippingAddress']>,
) {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ]
    .filter((part) => !!part && String(part).trim())
    .join(', ');
}

export function formatOrderConfirmationEmail(
  input: OrderConfirmationEmailInput,
): OrderConfirmationEmailContent {
  const name = input.customerName?.trim() || 'Devotee';
  const money = formatMoney(input.totalMinor, input.currency);
  const link = orderUrl(input.webBaseUrl, input.orderId);
  const address = input.shippingAddress
    ? formatAddress(input.shippingAddress)
    : 'Address on file';
  const itemLines = input.items.map(
    (item) =>
      `- ${item.productName} × ${item.quantity} — ${formatMoney(item.totalMinor, input.currency)}`,
  );

  const subject = `Order confirmed — ${input.orderNumber}`;

  const text = [
    `Namaste ${name},`,
    '',
    `Thank you for your order on Pavitra Seva. We have confirmed order ${input.orderNumber}.`,
    '',
    'Items:',
    ...itemLines,
    '',
    `Total paid: ${money}`,
    `Delivery address: ${address}`,
    input.deliverySlot ? `Delivery: ${input.deliverySlot}` : null,
    '',
    `View your order: ${link}`,
    '',
    'With devotion,',
    'Pavitra Seva',
  ]
    .filter((line) => line != null)
    .join('\n');

  const itemRows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;">${escapeHtml(item.productName)} × ${item.quantity}</td><td style="padding:6px 0;text-align:right;">${escapeHtml(formatMoney(item.totalMinor, input.currency))}</td></tr>`,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;color:#3b1f1a;line-height:1.5;background:#faf6f1;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8d9c8;border-radius:12px;padding:28px;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#a16207;">Pavitra Seva</p>
      <h1 style="margin:0 0 16px;font-size:24px;color:#7f1d1d;">Order confirmed</h1>
      <p style="margin:0 0 16px;">Namaste ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;">Thank you for your order. We have confirmed <strong>${escapeHtml(input.orderNumber)}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #e8d9c8;border-bottom:1px solid #e8d9c8;">
        ${itemRows}
      </table>
      <p style="margin:0 0 8px;"><strong>Total paid:</strong> ${escapeHtml(money)}</p>
      <p style="margin:0 0 8px;"><strong>Delivery address:</strong> ${escapeHtml(address)}</p>
      ${
        input.deliverySlot
          ? `<p style="margin:0 0 16px;"><strong>Delivery:</strong> ${escapeHtml(input.deliverySlot)}</p>`
          : ''
      }
      <p style="margin:24px 0 0;">
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#7f1d1d;color:#fff8f0;text-decoration:none;padding:12px 20px;border-radius:999px;">View order</a>
      </p>
      <p style="margin:28px 0 0;color:#6b4f4a;font-size:14px;">With devotion,<br/>Pavitra Seva</p>
    </td></tr>
  </table>
</body>
</html>`.trim();

  return { subject, text, html };
}
