import { formatVendorDispatchSms } from './vendor-dispatch-message';

describe('formatVendorDispatchSms', () => {
  it('includes order number, address, and truncated items', () => {
    const body = formatVendorDispatchSms({
      orderNumber: 'PSABC123',
      deliverySlot: 'Tomorrow, 9–11 AM',
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
  });
});
