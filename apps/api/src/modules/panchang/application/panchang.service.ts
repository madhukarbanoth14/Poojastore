import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { CITY_PRESETS } from '../domain/panchang.constants';
import {
  computePanchang,
  overlayCivilCalendar,
  PanchangLocation,
  todayInTimezone,
} from '../domain/panchang.engine';
import { VedAstroClient } from '../infrastructure/vedastro.client';

export const PANCHANG_DISCLAIMER =
  'Panchang times are civil astronomical approximations (sunrise/moon elongation), not a certified Swiss Ephemeris or temple muhurat authority. Use for general guidance only; consult a qualified pandit for ritual timing.';

export const PANCHANG_DISCLAIMER_VEDASTRO =
  'Tithi, nakshatra, yoga, and karana are from VedAstro (Lahiri ayanamsa). Sunrise and muhurat windows are civil astronomical approximations. Consult a qualified pandit for ritual timing.';

const DEFAULT_CITY = 'Hyderabad';

@Injectable()
export class PanchangService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vedastro: VedAstroClient,
  ) {}

  resolveLocation(input?: {
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }): PanchangLocation & { cityName: string } {
    if (
      typeof input?.latitude === 'number' &&
      typeof input?.longitude === 'number' &&
      input.timezone
    ) {
      return {
        cityName: input.city ?? 'Custom',
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
      };
    }

    const preset =
      CITY_PRESETS.find(
        (c) => c.name.toLowerCase() === (input?.city ?? DEFAULT_CITY).toLowerCase(),
      ) ??
      CITY_PRESETS.find((c) => c.name === DEFAULT_CITY) ??
      CITY_PRESETS[0];

    return {
      cityName: preset.name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      timezone: preset.timezone,
    };
  }

  locationKey(loc: PanchangLocation): string {
    return `${loc.latitude.toFixed(4)}:${loc.longitude.toFixed(4)}:${loc.timezone}`;
  }

  async getPanchang(
    params: {
      date?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    },
    options?: { enrich?: boolean },
  ) {
    const location = this.resolveLocation(params);
    const date = params.date ?? todayInTimezone(location.timezone);
    const key = this.locationKey(location);
    const enrich = options?.enrich !== false;

    const cached = await this.prisma.panchangDay.findUnique({
      where: {
        date_locationKey: {
          date: new Date(`${date}T00:00:00.000Z`),
          locationKey: key,
        },
      },
    });

    const festival = await this.prisma.festivalNote.findMany({
      where: { date: new Date(`${date}T00:00:00.000Z`) },
    });

    let payload = overlayCivilCalendar(
      cached
        ? { ...((cached.payload as Record<string, unknown>) ?? {}) }
        : { ...computePanchang(date, location) },
      date,
      location.timezone,
    );

    const alreadyVedastro = payload.source === 'vedastro';
    if (enrich && !alreadyVedastro) {
      const angas = await this.vedastro.enrichAngas({
        localDate: date,
        location,
        cityName: location.cityName,
      });
      if (angas) {
        payload = overlayCivilCalendar(
          {
            ...payload,
            ...angas,
            source: 'vedastro',
          },
          date,
          location.timezone,
        );
      } else if (!payload.source) {
        payload = { ...payload, source: 'civil_engine' };
      }
    }

    const specialNote = cached?.specialNote ?? festival[0]?.title ?? null;
    const shouldPersist =
      !cached || (enrich && payload.source === 'vedastro' && !alreadyVedastro);

    if (shouldPersist) {
      await this.prisma.panchangDay.upsert({
        where: {
          date_locationKey: {
            date: new Date(`${date}T00:00:00.000Z`),
            locationKey: key,
          },
        },
        create: {
          date: new Date(`${date}T00:00:00.000Z`),
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          locationKey: key,
          payload: payload as unknown as Prisma.InputJsonValue,
          specialNote,
        },
        update: {
          payload: payload as unknown as Prisma.InputJsonValue,
          specialNote,
        },
      });
    }

    const fromVedastro = payload.source === 'vedastro';
    return {
      ...payload,
      cityName: location.cityName,
      specialNote,
      disclaimer: fromVedastro
        ? PANCHANG_DISCLAIMER_VEDASTRO
        : PANCHANG_DISCLAIMER,
      accuracy: fromVedastro ? 'vedastro_angas_civil_times' : 'civil_approximation',
      festivals: festival,
      cached: Boolean(cached) && alreadyVedastro,
    };
  }

  async getCalendar(params: {
    year: number;
    month: number;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }) {
    const location = this.resolveLocation(params);
    const daysInMonth = new Date(Date.UTC(params.year, params.month, 0)).getUTCDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${params.year}-${String(params.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const panchang = await this.getPanchang(
        {
          date,
          city: location.cityName,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
        },
        { enrich: false },
      );
      days.push({
        date,
        dateLabel: (panchang as { dateLabel?: string }).dateLabel,
        weekday: (panchang as { weekday: string }).weekday,
        tithi: (panchang as { tithi: string }).tithi,
        nakshatra: (panchang as { nakshatra: string }).nakshatra,
        specialNote: (panchang as { specialNote?: string | null }).specialNote,
        festivals: (panchang as { festivals?: unknown[] }).festivals ?? [],
      });
    }

    return {
      year: params.year,
      month: params.month,
      cityName: location.cityName,
      timezone: location.timezone,
      days,
    };
  }
}
