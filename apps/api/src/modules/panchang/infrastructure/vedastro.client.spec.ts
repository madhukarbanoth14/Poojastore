import {
  mapVedAstroKarana,
  mapVedAstroNakshatra,
  mapVedAstroPaksha,
  mapVedAstroTithi,
  vedastroStdTime,
} from './vedastro.client';

describe('VedAstro mappers', () => {
  it('maps Sukla Tadiya to Shukla Tritiya', () => {
    expect(mapVedAstroPaksha('Sukla')).toBe('Shukla');
    expect(mapVedAstroTithi('Tadiya', 'Sukla')).toBe('Shukla Tritiya');
  });

  it('maps Uttara pada notation to Uttara Phalguni', () => {
    expect(mapVedAstroNakshatra('Uttara - 2')).toBe('Uttara Phalguni');
    expect(mapVedAstroNakshatra('Hastha')).toBe('Hasta');
  });

  it('maps Garija karana to Gara', () => {
    expect(mapVedAstroKarana('Garija')).toBe('Gara');
  });

  it('formats VedAstro StdTime in dd/MM/yyyy with IST offset', () => {
    expect(vedastroStdTime('2026-08-15', 'Asia/Kolkata')).toBe(
      '12:00 15/08/2026 +05:30',
    );
  });
});
