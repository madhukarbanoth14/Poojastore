import { PromoService } from './promo.service';

describe('PromoService.quoteDiscount', () => {
  const service = new PromoService({} as never);

  it('applies a percent cap', () => {
    expect(
      service.quoteDiscount({
        discountType: 'PERCENT',
        percentOff: 10,
        amountMinor: null,
        maxDiscountMinor: 5000,
        subtotalMinor: 200000,
      }),
    ).toBe(5000);
  });

  it('does not exceed the subtotal for a fixed code', () => {
    expect(
      service.quoteDiscount({
        discountType: 'FIXED',
        percentOff: null,
        amountMinor: 8000,
        maxDiscountMinor: null,
        subtotalMinor: 5000,
      }),
    ).toBe(5000);
  });
});
