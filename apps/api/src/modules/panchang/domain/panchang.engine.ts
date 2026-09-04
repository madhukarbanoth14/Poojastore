import * as SunCalc from 'suncalc';
import {
  KARANAS,
  MASA_NAMES,
  NAKSHATRAS,
  RASI_NAMES,
  RITHU_NAMES,
  SAMVATSARA_NAMES,
  TITHIS,
  YOGAS,
} from './panchang.constants';

export interface PanchangLocation {
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PanchangPayload {
  date: string;
  dateLabel: string;
  location: PanchangLocation;
  weekday: string;
  paksha: 'Shukla' | 'Krishna';
  tithi: string;
  tithiEndsAt: string | null;
  nakshatra: string;
  nakshatraEndsAt: string | null;
  yoga: string;
  yogaEndsAt: string | null;
  karana: string;
  karanaEndsAt: string | null;
  karanaNext: string | null;
  karanaNextEndsAt: string | null;
  samvatsaram: string;
  ayana: 'Uttarayana' | 'Dakshinayana';
  rithu: string;
  masam: string;
  suryaRashi: string;
  chandraRashi: string;
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  rahuKalam: { start: string; end: string };
  yamagandam: { start: string; end: string };
  gulikaKalam: { start: string; end: string };
  abhijitMuhurtham: { start: string; end: string };
  amritKalam: { start: string; end: string };
  varjyam: { start: string; end: string };
  durmuhurtham: { start: string; end: string };
  subhaGadiyalu: { start: string; end: string };
  summary: string;
  source?: 'civil_engine' | 'vedastro';
}

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Approximate geometric longitudes (degrees) suitable for civil panchang UI. */
function sunMoonLongitudes(date: Date): { sun: number; moon: number } {
  const jd = toJulianDay(date);
  const t = (jd - 2451545.0) / 36525;

  let L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  let M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  M = ((M % 360) + 360) % 360;
  const Mrad = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  let sun = ((L0 + C) % 360) + 360;
  sun %= 360;

  const Lp = 218.3164477 + 481267.88123421 * t;
  const D = 297.8501921 + 445267.1114034 * t;
  const Mmoon = 134.9633964 + 477198.8673981 * t;
  const F = 93.272095 + 483202.0175233 * t;
  const toRad = (d: number) => (((d % 360) + 360) % 360) * (Math.PI / 180);
  const moon =
    (((Lp +
      6.289 * Math.sin(toRad(Mmoon)) +
      1.274 * Math.sin(toRad(2 * D - Mmoon)) +
      0.658 * Math.sin(toRad(2 * D)) +
      0.214 * Math.sin(toRad(2 * Mmoon)) -
      0.186 * Math.sin(toRad(M)) -
      0.114 * Math.sin(toRad(2 * F))) %
      360) +
      360) %
    360;

  return { sun, moon };
}

/** Lahiri ayanamsa, degrees (~24° in 2000, +50.3″/year). */
function lahiriAyanamsa(date: Date): number {
  const year =
    date.getUTCFullYear() +
    (date.getUTCMonth() + (date.getUTCDate() - 1) / 30) / 12;
  return 24.0 + (year - 2000) * 0.01396;
}

function siderealLongitudes(date: Date): { sun: number; moon: number } {
  const trop = sunMoonLongitudes(date);
  const aya = lahiriAyanamsa(date);
  return {
    sun: (((trop.sun - aya) % 360) + 360) % 360,
    moon: (((trop.moon - aya) % 360) + 360) % 360,
  };
}

function rasiName(longitude: number): string {
  return RASI_NAMES[Math.floor(longitude / 30) % 12];
}

/**
 * Telugu year turns at Ugadi (Chaitra Shukla 1), roughly late March.
 * 1987 after Ugadi = Prabhava; 2026 after Ugadi = Parabhava.
 */
export function samvatsaraName(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const cycleYear = m < 3 || (m === 3 && d < 22) ? y - 1 : y;
  const index = ((cycleYear - 1987) % 60 + 60) % 60;
  return SAMVATSARA_NAMES[index];
}

function ayanaFromSun(siderealSun: number): 'Uttarayana' | 'Dakshinayana' {
  const rasi = Math.floor(siderealSun / 30) % 12;
  return rasi >= 3 && rasi <= 8 ? 'Dakshinayana' : 'Uttarayana';
}

function rithuFromSun(siderealSun: number): string {
  const rasi = Math.floor(siderealSun / 30) % 12;
  return RITHU_NAMES[Math.floor(rasi / 2) % 6];
}

function masamFromSun(siderealSun: number): string {
  return MASA_NAMES[Math.floor(siderealSun / 30) % 12];
}

function tithiIndexAt(date: Date): number {
  const { sun, moon } = sunMoonLongitudes(date);
  const elongation = ((moon - sun) % 360 + 360) % 360;
  return Math.floor(elongation / 12);
}

function nakshatraIndexAt(date: Date): number {
  const { moon } = siderealLongitudes(date);
  return Math.floor(moon / (360 / 27)) % 27;
}

function yogaIndexAt(date: Date): number {
  const { sun, moon } = siderealLongitudes(date);
  return Math.floor(((sun + moon) % 360) / (360 / 27)) % 27;
}

function karanaIndexAt(date: Date): number {
  const { sun, moon } = sunMoonLongitudes(date);
  const elongation = ((moon - sun) % 360 + 360) % 360;
  return Math.floor(elongation / 6) % 11;
}

function whenIndexChanges(
  start: Date,
  hours: number,
  indexAt: (d: Date) => number,
): Date | null {
  const startIdx = indexAt(start);
  const step = 10 * 60 * 1000;
  const limit = start.getTime() + hours * 3600 * 1000;
  for (let t = start.getTime() + step; t <= limit; t += step) {
    if (indexAt(new Date(t)) === startIdx) continue;
    let lo = t - step;
    let hi = t;
    while (hi - lo > 45 * 1000) {
      const mid = Math.floor((lo + hi) / 2);
      if (indexAt(new Date(mid)) !== startIdx) hi = mid;
      else lo = mid;
    }
    return new Date(hi);
  }
  return null;
}

function formatInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function dateKeyInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function weekdayInZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).formatToParts(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[parts.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0;
}

function weekdayName(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    day
  ];
}

/** Noon-ish UTC instant that still falls on `localDate` in `timeZone`. */
export function instantOnLocalDate(localDate: string, timeZone: string): Date {
  const [y, m, d] = localDate.split('-').map(Number);
  for (const hour of [6, 7, 8, 12, 16, 18]) {
    const candidate = new Date(Date.UTC(y, m - 1, d, hour, 30, 0));
    if (dateKeyInZone(candidate, timeZone) === localDate) return candidate;
  }
  return new Date(Date.UTC(y, m - 1, d, 6, 30, 0));
}

export function weekdayFromDateKey(localDate: string, timeZone: string): string {
  return weekdayName(weekdayInZone(instantOnLocalDate(localDate, timeZone), timeZone));
}

export function formatDateLabel(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

function splitDay(
  sunrise: Date,
  sunset: Date,
  segmentIndex: number,
): { start: Date; end: Date } {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const part = dayMs / 8;
  const start = new Date(sunrise.getTime() + part * segmentIndex);
  const end = new Date(sunrise.getTime() + part * (segmentIndex + 1));
  return { start, end };
}

/**
 * Classical 8-part daytime windows (0-indexed from sunrise).
 * Rahu: Sat=5, Sun=7, Mon=1, Tue=6, Wed=4, Thu=5, Fri=3 (common South-Indian tables vary slightly; this set is consistent).
 */
function daytimeWindowIndex(kind: 'rahu' | 'yamaganda' | 'gulika', weekday: number): number {
  const rahu = [7, 1, 6, 4, 5, 3, 2];
  const yama = [4, 3, 2, 1, 0, 6, 5];
  const gulika = [6, 5, 4, 3, 2, 1, 0];
  if (kind === 'rahu') return rahu[weekday];
  if (kind === 'yamaganda') return yama[weekday];
  return gulika[weekday];
}

function middayWindow(sunrise: Date, sunset: Date): { start: Date; end: Date } {
  const mid = new Date((sunrise.getTime() + sunset.getTime()) / 2);
  return {
    start: new Date(mid.getTime() - 24 * 60 * 1000),
    end: new Date(mid.getTime() + 24 * 60 * 1000),
  };
}

export function computePanchang(
  localDate: string,
  location: PanchangLocation,
): PanchangPayload {
  // Noon UTC proxy for the civil date; sun times still use lat/lng for that calendar day.
  const [y, m, d] = localDate.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 6, 30, 0));

  const times = SunCalc.getTimes(probe, location.latitude, location.longitude);
  const moonTimes = SunCalc.getMoonTimes(
    probe,
    location.latitude,
    location.longitude,
  );

  const sunrise = times.sunrise;
  const sunset = times.sunset;
  if (!sunrise || !sunset || Number.isNaN(sunrise.getTime())) {
    throw new Error('Unable to compute sunrise/sunset for location');
  }

  const { sun, moon } = sunMoonLongitudes(sunrise);
  const sidereal = siderealLongitudes(sunrise);
  const elongation = ((moon - sun) % 360 + 360) % 360;
  const tithiIndex = Math.floor(elongation / 12);
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const tithiName =
    tithiIndex === 14
      ? 'Purnima'
      : tithiIndex === 29
        ? 'Amavasya'
        : TITHIS[tithiIndex % 15];

  const nakshatra = NAKSHATRAS[Math.floor(sidereal.moon / (360 / 27)) % 27];
  const yoga = YOGAS[Math.floor(((sidereal.sun + sidereal.moon) % 360) / (360 / 27)) % 27];
  const karanaIndex = Math.floor(elongation / 6) % 11;
  const karana = KARANAS[karanaIndex];
  const karanaNext = KARANAS[(karanaIndex + 1) % 11];

  const tithiEnd = whenIndexChanges(sunrise, 40, tithiIndexAt);
  const nakshatraEnd = whenIndexChanges(sunrise, 40, nakshatraIndexAt);
  const yogaEnd = whenIndexChanges(sunrise, 40, yogaIndexAt);
  const karanaEnd = whenIndexChanges(sunrise, 24, karanaIndexAt);
  const karanaNextEnd = karanaEnd
    ? whenIndexChanges(new Date(karanaEnd.getTime() + 60 * 1000), 24, karanaIndexAt)
    : null;

  const tz = location.timezone;
  const weekday = weekdayFromDateKey(localDate, tz);
  const dateLabel = formatDateLabel(localDate);
  const weekdayIndex = weekdayInZone(instantOnLocalDate(localDate, tz), tz);
  const rahu = splitDay(sunrise, sunset, daytimeWindowIndex('rahu', weekdayIndex));
  const yama = splitDay(
    sunrise,
    sunset,
    daytimeWindowIndex('yamaganda', weekdayIndex),
  );
  const gulika = splitDay(
    sunrise,
    sunset,
    daytimeWindowIndex('gulika', weekdayIndex),
  );
  const abhijit = middayWindow(sunrise, sunset);
  const amrit = splitDay(sunrise, sunset, (weekdayIndex + 2) % 8);
  const varjyam = splitDay(sunrise, sunset, (weekdayIndex + 5) % 8);
  const durmuhurtham = splitDay(sunrise, sunset, (weekdayIndex + 3) % 8);
  const subha = splitDay(sunrise, sunset, (weekdayIndex + 1) % 8);

  const fmt = (d: Date | null) => (d ? formatInTimeZone(d, tz) : null);

  return {
    date: localDate,
    dateLabel,
    location,
    weekday,
    paksha,
    tithi: `${paksha} ${tithiName}`,
    tithiEndsAt: fmt(tithiEnd),
    nakshatra,
    nakshatraEndsAt: fmt(nakshatraEnd),
    yoga,
    yogaEndsAt: fmt(yogaEnd),
    karana,
    karanaEndsAt: fmt(karanaEnd),
    karanaNext,
    karanaNextEndsAt: fmt(karanaNextEnd),
    samvatsaram: samvatsaraName(localDate),
    ayana: ayanaFromSun(sidereal.sun),
    rithu: rithuFromSun(sidereal.sun),
    masam: masamFromSun(sidereal.sun),
    suryaRashi: rasiName(sidereal.sun),
    chandraRashi: rasiName(sidereal.moon),
    sunrise: formatInTimeZone(sunrise, tz),
    sunset: formatInTimeZone(sunset, tz),
    moonrise: moonTimes.rise
      ? formatInTimeZone(moonTimes.rise, tz)
      : null,
    moonset: moonTimes.set ? formatInTimeZone(moonTimes.set, tz) : null,
    rahuKalam: {
      start: formatInTimeZone(rahu.start, tz),
      end: formatInTimeZone(rahu.end, tz),
    },
    yamagandam: {
      start: formatInTimeZone(yama.start, tz),
      end: formatInTimeZone(yama.end, tz),
    },
    gulikaKalam: {
      start: formatInTimeZone(gulika.start, tz),
      end: formatInTimeZone(gulika.end, tz),
    },
    abhijitMuhurtham: {
      start: formatInTimeZone(abhijit.start, tz),
      end: formatInTimeZone(abhijit.end, tz),
    },
    amritKalam: {
      start: formatInTimeZone(amrit.start, tz),
      end: formatInTimeZone(amrit.end, tz),
    },
    varjyam: {
      start: formatInTimeZone(varjyam.start, tz),
      end: formatInTimeZone(varjyam.end, tz),
    },
    durmuhurtham: {
      start: formatInTimeZone(durmuhurtham.start, tz),
      end: formatInTimeZone(durmuhurtham.end, tz),
    },
    subhaGadiyalu: {
      start: formatInTimeZone(subha.start, tz),
      end: formatInTimeZone(subha.end, tz),
    },
    summary: `${weekday} · ${dateLabel}`,
    source: 'civil_engine',
  };
}

export function overlayCivilCalendar<T extends Record<string, unknown>>(
  payload: T,
  localDate: string,
  timezone: string,
): T & Pick<PanchangPayload, 'date' | 'dateLabel' | 'weekday' | 'summary'> {
  const weekday = weekdayFromDateKey(localDate, timezone);
  const dateLabel = formatDateLabel(localDate);
  return {
    ...payload,
    date: localDate,
    dateLabel,
    weekday,
    summary: `${weekday} · ${dateLabel}`,
  };
}

export function todayInTimezone(timezone: string): string {
  return dateKeyInZone(new Date(), timezone);
}

export { dateKeyInZone };
