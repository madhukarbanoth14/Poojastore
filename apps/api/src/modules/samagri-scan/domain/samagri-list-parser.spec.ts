import { parseSegment, parseSegments } from './samagri-list-parser';

describe('samagri-list-parser', () => {
  it('parses comma-separated mixed Telugu and English quantities', () => {
    const segments = parseSegments(`
      Samagri list
      2 Kumkum, neyyi, 3 kobbarikaya
      rendu pasupu
    `);

    expect(segments.map((s) => s.text)).toEqual(
      expect.arrayContaining(['Kumkum', 'neyyi', 'kobbarikaya', 'pasupu']),
    );
    expect(segments.find((s) => s.text === 'Kumkum')?.quantity).toBe(2);
    expect(segments.find((s) => s.text === 'kobbarikaya')?.quantity).toBe(3);
    expect(segments.find((s) => s.text === 'pasupu')?.quantity).toBe(2);
  });

  it('parses suffix and pack quantities', () => {
    expect(parseSegment('ghee x 2').quantity).toBe(2);
    expect(parseSegment('2 kg rice').quantity).toBe(2);
    expect(parseSegment('camphor 5').quantity).toBe(5);
  });
});
