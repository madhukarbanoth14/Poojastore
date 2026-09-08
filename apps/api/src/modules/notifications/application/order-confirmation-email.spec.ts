import { formatOrderConfirmationEmail } from './order-confirmation-email';

describe('formatOrderConfirmationEmail', () => {
  it('builds subject, text, and html with items and totals', () => {
    const content = formatOrderConfirmationEmail({
      orderId: 'ord-1',
      orderNumber: 'PS-1001',
      customerName: 'Madhu',
      currency: 'INR',
      totalMinor: 129900,
      deliverySlot: 'Tomorrow 9–12',
      items: [
        { productName: 'Ganesh Chaturthi Kit', quantity: 1, totalMinor: 99900 },
        { productName: 'Camphor', quantity: 2, totalMinor: 30000 },
      ],
      shippingAddress: {
        line1: '12 Temple Road',
        line2: 'Near mandir',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
      },
      webBaseUrl: 'https://pavitraseva.in',
    });

    expect(content.subject).toBe('Order confirmed — PS-1001');
    expect(content.text).toContain('Namaste Madhu');
    expect(content.text).toContain('PS-1001');
    expect(content.text).toContain('Ganesh Chaturthi Kit × 1');
    expect(content.text).toContain('Total paid: ₹1299');
    expect(content.text).toContain('12 Temple Road');
    expect(content.text).toContain('https://pavitraseva.in/orders/ord-1');
    expect(content.html).toContain('Order confirmed');
    expect(content.html).toContain('Ganesh Chaturthi Kit');
    expect(content.html).toContain('href="https://pavitraseva.in/orders/ord-1"');
  });

  it('escapes HTML in customer-provided fields', () => {
    const content = formatOrderConfirmationEmail({
      orderId: 'ord-2',
      orderNumber: 'PS<script>',
      customerName: 'A <b>B</b>',
      currency: 'USD',
      totalMinor: 2500,
      items: [{ productName: 'Oil & Ghee', quantity: 1, totalMinor: 2500 }],
      shippingAddress: {
        line1: '1 <main>',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
      },
    });

    expect(content.html).toContain('A &lt;b&gt;B&lt;/b&gt;');
    expect(content.html).toContain('Oil &amp; Ghee');
    expect(content.html).toContain('PS&lt;script&gt;');
    expect(content.html).not.toContain('<script>');
  });
});
