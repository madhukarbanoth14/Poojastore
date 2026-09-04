import { SamagriMatchService } from './samagri-match.service';

describe('SamagriMatchService', () => {
  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'id-kumkum',
          slug: 'samagri-kumkum',
          name: 'Kumkum',
          priceMinor: 2500,
          metadata: {
            lineItems: [
              { slug: 'samagri-kumkum', nameEn: 'Kumkum', nameTe: 'కుంకుమ' },
            ],
          },
        },
        {
          id: 'id-ghee',
          slug: 'samagri-ghee',
          name: 'Ghee',
          priceMinor: 45000,
          metadata: {
            lineItems: [
              { slug: 'samagri-ghee', nameEn: 'Ghee', nameTe: 'నెయ్యి' },
            ],
          },
        },
        {
          id: 'id-coconut',
          slug: 'samagri-coconuts',
          name: 'Coconuts',
          priceMinor: 6000,
          metadata: {
            lineItems: [
              {
                slug: 'samagri-coconuts',
                nameEn: 'Coconuts',
                nameTe: 'కొబ్బరికాయలు',
              },
            ],
          },
        },
      ]),
    },
  } as never;

  const service = new SamagriMatchService(prisma);

  it('matches mixed Telugu and English list text with quantities', async () => {
    const result = await service.matchText(`
      2 Kumkum, neyyi
      3 kobbarikaya
      random note
    `);

    expect(result.matches.map((m) => m.slug).sort()).toEqual([
      'samagri-coconuts',
      'samagri-ghee',
      'samagri-kumkum',
    ]);
    expect(result.matches.find((m) => m.slug === 'samagri-kumkum')?.quantity).toBe(2);
    expect(result.matches.find((m) => m.slug === 'samagri-coconuts')?.quantity).toBe(3);
    expect(result.unmatchedLines).toContain('random note');
    expect(Array.isArray(result.unmatchedSuggestions)).toBe(true);
  });
});
