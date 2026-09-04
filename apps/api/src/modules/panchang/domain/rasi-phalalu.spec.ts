import { composeRasiPhalalu } from './rasi-phalalu';

describe('composeRasiPhalalu', () => {
  it('builds daily fields from VedAstro events, gochara, and dasa', () => {
    const result = composeRasiPhalalu({
      events: [
        { name: 'GoodChandrabala', nature: 'Good' },
        { name: 'GoodPanchaka', nature: 'Good', description: 'short journeys' },
        { name: 'TarabalaJanmaStrong', nature: 'Bad' },
      ],
      gochara: [
        { planet: 'Sun', sign: 'Leo', kakshaScore: 0 },
        { planet: 'Moon', sign: 'Taurus', kakshaScore: 1 },
        { planet: 'Mercury', sign: 'Leo', kakshaScore: 1 },
        { planet: 'Jupiter', sign: 'Cancer', kakshaScore: 1 },
        { planet: 'Venus', sign: 'Virgo', kakshaScore: 0 },
        { planet: 'Saturn', sign: 'Pisces', kakshaScore: 1 },
      ],
      dasa: { lord: 'Jupiter', nature: 'Neutral', bhuktiLord: 'Venus' },
    });

    expect(result.summary).toContain('2 supportive marks');
    expect(result.summary).toContain('Jupiter dasa, Venus bhukti');
    expect(result.summary).toContain('Moon transits Taurus');
    expect(result.career).toContain('Sun transits Leo');
    expect(result.finance).toContain('Jupiter transits Cancer');
    expect(result.health).toContain('GoodChandrabala');
    expect(result.travel).toContain('GoodPanchaka');
    expect(result.recommendedPuja).toBe('Lakshmi Pooja');
    expect(result.luckyColor).toMatch(/pink|White/i);
    expect(result.events).toHaveLength(3);
  });
});
