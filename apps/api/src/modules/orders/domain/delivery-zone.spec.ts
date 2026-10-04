import {
  HYDERABAD_DELIVERY_MESSAGE,
  assertHyderabadDelivery,
  isHyderabadDelivery,
} from './delivery-zone';

describe('isHyderabadDelivery', () => {
  it('accepts Hyderabad PIN codes', () => {
    expect(isHyderabadDelivery({ city: 'Gachibowli', postalCode: '500032' })).toBe(
      true,
    );
    expect(isHyderabadDelivery({ city: 'Hyderabad', postalCode: '500 089' })).toBe(
      true,
    );
  });

  it('rejects other cities', () => {
    expect(
      isHyderabadDelivery({ city: 'Bengaluru', postalCode: '560001' }),
    ).toBe(false);
    expect(
      isHyderabadDelivery({ city: 'Hyderabad', postalCode: '560001' }),
    ).toBe(false);
  });
});

describe('assertHyderabadDelivery', () => {
  it('throws the customer message outside Hyderabad', () => {
    expect(() =>
      assertHyderabadDelivery({ city: 'Mumbai', postalCode: '400001' }),
    ).toThrow(HYDERABAD_DELIVERY_MESSAGE);
  });
});
