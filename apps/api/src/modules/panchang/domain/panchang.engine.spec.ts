import { computePanchang } from './panchang.engine';

describe('computePanchang', () => {
  it('returns core angas and muhurat windows for Bengaluru', () => {
    const payload = computePanchang('2026-08-13', {
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 'Asia/Kolkata',
    });

    expect(payload.date).toBe('2026-08-13');
    expect(payload.weekday).toBeTruthy();
    expect(payload.tithi).toMatch(/Shukla|Krishna/);
    expect(payload.nakshatra).toBeTruthy();
    expect(payload.yoga).toBeTruthy();
    expect(payload.karana).toBeTruthy();
    expect(payload.sunrise).toMatch(/\d/);
    expect(payload.sunset).toMatch(/\d/);
    expect(payload.rahuKalam.start).toBeTruthy();
    expect(payload.abhijitMuhurtham.end).toBeTruthy();
    expect(payload.dateLabel).toBe('13 Aug 2026');
    expect(payload.weekday).toBe('Thursday');
    expect(payload.summary).toBe('Thursday · 13 Aug 2026');
    expect(payload.samvatsaram).toBe('Parabhava');
    expect(payload.ayana).toBe('Dakshinayana');
    expect(payload.suryaRashi).toBeTruthy();
    expect(payload.chandraRashi).toBeTruthy();
    expect(payload.masam).toBeTruthy();
    expect(payload.rithu).toBeTruthy();
  });

  it('uses Parabhava after Ugadi 2026 and Vishvavasu before it', () => {
    const hyd = {
      latitude: 17.385,
      longitude: 78.4867,
      timezone: 'Asia/Kolkata',
    };
    expect(computePanchang('2026-08-12', hyd).samvatsaram).toBe('Parabhava');
    expect(computePanchang('2026-01-10', hyd).samvatsaram).toBe('Vishvavasu');
  });

  it('uses the civil calendar date, not tithi, in the home summary', () => {
    const payload = computePanchang('2026-08-15', {
      latitude: 17.385,
      longitude: 78.4867,
      timezone: 'Asia/Kolkata',
    });

    expect(payload.date).toBe('2026-08-15');
    expect(payload.weekday).toBe('Saturday');
    expect(payload.dateLabel).toBe('15 Aug 2026');
    expect(payload.summary).toBe('Saturday · 15 Aug 2026');
    expect(payload.summary).not.toContain('Nakshatra');
  });
});
