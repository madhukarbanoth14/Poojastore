import { formatVendorDispatchSms } from './vendor-dispatch-message';

describe('formatVendorDispatchSms', () => {
  it('includes order number, address, and truncated items', () => {
    const body = formatVendorDispatchSms({
      orderNumber: 'PSABC123',
      deliverySlot: 'Within 24 hours',
      totalMinor: 208600,
      currency: 'INR',
      user: { fullName: 'Aarav', phoneE164: '+919876543210' },
      shippingAddress: {
        line1: '12 Temple Road',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500089',
      },
      items: [
        { productName: 'Turmeric', quantity: 2 },
        { productName: 'Kumkum', quantity: 1 },
      ],
    });
    expect(body).toContain('PSABC123');
    expect(body).toContain('Hyderabad');
    expect(body).toContain('Turmeric x2');
    expect(body).toContain('Rs 2086');
    expect(body).toContain('+919876543210');
  });

  it('uses the checkout contact phone and skips Google placeholders', () => {
    const body = formatVendorDispatchSms({
      orderNumber: 'PSABC123',
      totalMinor: 100000,
      currency: 'INR',
      contactPhoneE164: '+917674847680',
      user: { fullName: 'Latcha', phoneE164: '+915377329555' },
      items: [{ productName: 'Mini Home Pooja Kit', quantity: 1 }],
    });
    expect(body).toContain('+917674847680');
    expect(body).not.toContain('+915377329555');
  });
});
