import { ProductType } from '@prisma/client';
import { buildSelectableKitItems } from './selectable-kit-items';

describe('buildSelectableKitItems', () => {
  it('splits kit price across included items', () => {
    const items = buildSelectableKitItems({
      locale: 'en',
      product: {
        id: 'kit-1',
        slug: 'satyanarayan-puja-kit',
        type: ProductType.PUJA_KIT,
        priceMinor: 74900,
        metadata: {},
        kitItems: [
          {
            id: 'a',
            productId: 'kit-1',
            name: 'Kumkum',
            quantity: 1,
            isOptional: false,
            sortOrder: 0,
          },
          {
            id: 'b',
            productId: 'kit-1',
            name: 'Camphor',
            quantity: 1,
            isOptional: false,
            sortOrder: 1,
          },
        ],
      },
    });
    expect(items).toHaveLength(2);
    expect(items[0].priceMinor + items[1].priceMinor).toBe(74900);
    expect(items[0].key).toBe('a');
  });
});
