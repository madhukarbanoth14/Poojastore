import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KARANAS, NAKSHATRAS, TITHIS, YOGAS } from '../domain/panchang.constants';
import {
  instantOnLocalDate,
  type PanchangLocation,
} from '../domain/panchang.engine';

const DEFAULT_URL = 'https://api.vedastro.org/api/Calculate';
const TIMEOUT_MS = 2500;
const PREDICTION_TIMEOUT_MS = 8000;

export type VedAstroAngas = {
  paksha: 'Shukla' | 'Krishna';
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
};

const TITHI_ALIASES: Record<string, string> = {
  padyami: 'Pratipada',
  pratipada: 'Pratipada',
  vidiya: 'Dwitiya',
  dwitiya: 'Dwitiya',
  tadiya: 'Tritiya',
  tritiya: 'Tritiya',
  chaviti: 'Chaturthi',
  chaturthi: 'Chaturthi',
  panchami: 'Panchami',
  shashthi: 'Shashthi',
  shasti: 'Shashthi',
  saptami: 'Saptami',
  ashtami: 'Ashtami',
  navami: 'Navami',
  dasimi: 'Dashami',
  dashami: 'Dashami',
  ekadashi: 'Ekadashi',
  dwadashi: 'Dwadashi',
  trayodashi: 'Trayodashi',
  chaturdashi: 'Chaturdashi',
  purnima: 'Purnima',
  poornima: 'Purnima',
  amavasya: 'Amavasya',
};

const NAKSHATRA_ALIASES: Record<string, string> = {
  aswini: 'Ashwini',
  ashwini: 'Ashwini',
  bharani: 'Bharani',
  krithika: 'Krittika',
  krittika: 'Krittika',
  rohini: 'Rohini',
  mrigasira: 'Mrigashira',
  mrigashira: 'Mrigashira',
  aridra: 'Ardra',
  ardra: 'Ardra',
  punarvasu: 'Punarvasu',
  pushya: 'Pushya',
  aslesha: 'Ashlesha',
  ashlesha: 'Ashlesha',
  magha: 'Magha',
  poorva: 'Purva Phalguni',
  pubba: 'Purva Phalguni',
  'purva phalguni': 'Purva Phalguni',
  uttara: 'Uttara Phalguni',
  'uttara phalguni': 'Uttara Phalguni',
  hastha: 'Hasta',
  hasta: 'Hasta',
  chitra: 'Chitra',
  swathi: 'Swati',
  swati: 'Swati',
  visakha: 'Vishakha',
  vishakha: 'Vishakha',
  anuradha: 'Anuradha',
  jyeshta: 'Jyeshtha',
  jyeshtha: 'Jyeshtha',
  moola: 'Mula',
  mula: 'Mula',
  poorvashada: 'Purva Ashadha',
  'purva ashadha': 'Purva Ashadha',
  uttarashada: 'Uttara Ashadha',
  'uttara ashadha': 'Uttara Ashadha',
  sravana: 'Shravana',
  shravana: 'Shravana',
  dhanishta: 'Dhanishta',
  satabhisha: 'Shatabhisha',
  shatabhisha: 'Shatabhisha',
  poorvabhadra: 'Purva Bhadrapada',
  uttarabhadra: 'Uttara Bhadrapada',
  revathi: 'Revati',
  revati: 'Revati',
};

const KARANA_ALIASES: Record<string, string> = {
  bava: 'Bava',
  balava: 'Balava',
  kaulava: 'Kaulava',
  taitila: 'Taitila',
  gara: 'Gara',
  garija: 'Gara',
  garaja: 'Gara',
  vanija: 'Vanija',
  vishti: 'Vishti',
  bhadra: 'Vishti',
  shakuni: 'Shakuni',
  chatushpada: 'Chatushpada',
  nagava: 'Nagava',
  naga: 'Nagava',
  kimstughna: 'Kimstughna',
};

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s*-\s*\d+\s*$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupAlias(
  raw: string,
  aliases: Record<string, string>,
  catalog: readonly string[],
): string | undefined {
  const key = normalizeKey(raw);
  if (aliases[key]) return aliases[key];
  return catalog.find((item) => item.toLowerCase() === key);
}

export function mapVedAstroPaksha(raw?: string): 'Shukla' | 'Krishna' | undefined {
  if (!raw) return undefined;
  const key = normalizeKey(raw);
  if (key.startsWith('sukla') || key.startsWith('shukla') || key.includes('bright')) {
    return 'Shukla';
  }
  if (key.startsWith('krishna') || key.includes('dark')) {
    return 'Krishna';
  }
  return undefined;
}

export function mapVedAstroTithi(name?: string, paksha?: string): string | undefined {
  if (!name) return undefined;
  const tithiName = lookupAlias(name, TITHI_ALIASES, TITHIS);
  if (!tithiName || tithiName === 'Purnima/Amavasya') {
    return undefined;
  }
  const resolvedPaksha = mapVedAstroPaksha(paksha);
  return resolvedPaksha ? `${resolvedPaksha} ${tithiName}` : tithiName;
}

export function mapVedAstroNakshatra(raw?: string): string | undefined {
  if (!raw) return undefined;
  return lookupAlias(raw, NAKSHATRA_ALIASES, NAKSHATRAS);
}

export function mapVedAstroYoga(raw?: string): string | undefined {
  if (!raw) return undefined;
  return lookupAlias(raw, {}, YOGAS);
}

export function mapVedAstroKarana(raw?: string): string | undefined {
  if (!raw) return undefined;
  return lookupAlias(raw, KARANA_ALIASES, KARANAS);
}

export function vedastroStdTime(
  localDate: string,
  timeZone: string,
  clock = '12:00',
): string {
  const [year, month, day] = localDate.split('-');
  const instant = instantOnLocalDate(localDate, timeZone);
  const offsetName = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+05:30';
  const match = offsetName.match(/([+-])(\d{1,2})(?::?(\d{2}))?/);
  const offset = match
    ? `${match[1]}${match[2].padStart(2, '0')}:${(match[3] ?? '00').padStart(2, '0')}`
    : '+05:30';
  const hhmm = clock.slice(0, 5) || '12:00';
  return `${hhmm} ${day}/${month}/${year} ${offset}`;
}

@Injectable()
export class VedAstroClient {
  private readonly logger = new Logger(VedAstroClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('vedastro.apiUrl') || DEFAULT_URL;
    this.apiKey = this.config.get<string>('vedastro.apiKey') ?? '';
  }

  async enrichAngas(params: {
    localDate: string;
    location: PanchangLocation;
    cityName?: string;
  }): Promise<Partial<VedAstroAngas> | null> {
    const body = {
      Time: {
        StdTime: vedastroStdTime(params.localDate, params.location.timezone),
        Location: {
          Name: params.cityName ?? 'Custom',
          Latitude: params.location.latitude,
          Longitude: params.location.longitude,
        },
      },
      Ayanamsa: 'LAHIRI',
    };

    const [lunar, moon, yoga, karana] = await Promise.all([
      this.call('LunarDay', body),
      this.call('MoonConstellation', body),
      this.call('NithyaYoga', body),
      this.call('Karana', body),
    ]);

    const paksha = mapVedAstroPaksha(
      asRecord(lunar?.LunarDay)?.Paksha as string | undefined,
    );
    const tithiName = asRecord(lunar?.LunarDay)?.Name as string | undefined;
    const mappedTithi = mapVedAstroTithi(tithiName, paksha);
    const nakshatra = mapVedAstroNakshatra(
      typeof moon?.MoonConstellation === 'string'
        ? moon.MoonConstellation
        : undefined,
    );
    const yogaName = mapVedAstroYoga(
      asRecord(yoga?.NithyaYoga)?.Name as string | undefined,
    );
    const karanaName = mapVedAstroKarana(
      typeof karana?.Karana === 'string' ? karana.Karana : undefined,
    );

    if (!mappedTithi && !nakshatra && !yogaName && !karanaName) {
      return null;
    }

    return {
      ...(paksha ? { paksha } : {}),
      ...(mappedTithi ? { tithi: mappedTithi } : {}),
      ...(nakshatra ? { nakshatra } : {}),
      ...(yogaName ? { yoga: yogaName } : {}),
      ...(karanaName ? { karana: karanaName } : {}),
    };
  }

  async dailyChart(params: {
    birthDate: string;
    birthClock?: string | null;
    localDate: string;
    birthLocation: PanchangLocation & { cityName?: string };
    checkLocation: PanchangLocation & { cityName?: string };
  }) {
    const birthTime = this.timeBody(
      params.birthDate,
      params.birthLocation,
      params.birthClock || '12:00',
    );
    const checkTime = this.timeBody(params.localDate, params.checkLocation, '12:00');
    const ayanamsa = 'LAHIRI';

    const [eventsPayload, gocharaPayload, dasaPayload] = await Promise.all([
      this.call(
        'EventsAtTime',
        {
          birthTime,
          checkTime,
          Ayanamsa: ayanamsa,
          eventTagList: ['Personal', 'General'],
        },
        PREDICTION_TIMEOUT_MS,
      ),
      this.call(
        'GocharaKakshas',
        { birthTime, checkTime, Ayanamsa: ayanamsa },
        PREDICTION_TIMEOUT_MS,
      ),
      this.call(
        'DasaAtTime',
        { birthTime, checkTime, Ayanamsa: ayanamsa, levels: 2 },
        PREDICTION_TIMEOUT_MS,
      ),
    ]);

    const events = asEventList(eventsPayload?.EventsAtTime);
    const gochara = asGocharaList(gocharaPayload?.GocharaKakshas);
    const dasa = asDasa(dasaPayload?.DasaAtTime);

    if (!events.length && !gochara.length && !dasa) {
      return null;
    }

    return { events, gochara, dasa };
  }

  private timeBody(
    localDate: string,
    location: PanchangLocation & { cityName?: string },
    clock: string,
  ) {
    return {
      StdTime: vedastroStdTime(localDate, location.timezone, clock),
      Location: {
        Name: location.cityName ?? 'Custom',
        Latitude: location.latitude,
        Longitude: location.longitude,
      },
    };
  }

  private async call(
    method: string,
    body: Record<string, unknown>,
    timeoutMs = TIMEOUT_MS,
  ): Promise<Record<string, unknown> | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) headers['x-api-key'] = this.apiKey;
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const json = (await response.json()) as {
        Status?: string;
        Payload?: Record<string, unknown> | unknown[];
      };
      if (json.Status !== 'Pass' || json.Payload == null) return null;
      if (Array.isArray(json.Payload)) {
        return { [method]: json.Payload };
      }
      return json.Payload;
    } catch (error) {
      this.logger.warn(
        `VedAstro ${method} skipped: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asEventList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      name: String(item.Name ?? ''),
      nature: String(item.Nature ?? ''),
      description: typeof item.Description === 'string' ? item.Description : undefined,
    }))
    .filter((item) => item.name);
}

function asGocharaList(value: unknown) {
  const record = asRecord(value);
  if (!record) return [];
  return Object.values(record)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      planet: String(item.Planet ?? ''),
      sign: String(item.Sign ?? ''),
      kakshaScore: Number(item.KakshaScore ?? 0),
      ashtaka: typeof item.Ashtaka === 'number' ? item.Ashtaka : undefined,
      sarvashtaka: typeof item.Sarvashtaka === 'number' ? item.Sarvashtaka : undefined,
    }))
    .filter((item) => item.planet && item.sign);
}

function asDasa(value: unknown) {
  const record = asRecord(value);
  if (!record) return null;
  const first = Object.values(record)
    .map((item) => asRecord(item))
    .find((item): item is Record<string, unknown> => Boolean(item));
  if (!first) return null;
  const sub = asRecord(first.SubDasas);
  const bhukti = sub
    ? Object.values(sub)
        .map((item) => asRecord(item))
        .find((item): item is Record<string, unknown> => Boolean(item))
    : undefined;
  return {
    lord: String(first.Lord ?? ''),
    nature: typeof first.Nature === 'string' ? first.Nature : undefined,
    bhuktiLord: bhukti ? String(bhukti.Lord ?? '') : undefined,
  };
}
