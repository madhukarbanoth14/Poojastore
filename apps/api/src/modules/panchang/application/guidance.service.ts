import { Injectable, NotFoundException } from '@nestjs/common';
import { Rasi } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { RASI_LABELS } from '../domain/panchang.constants';
import { todayInTimezone } from '../domain/panchang.engine';
import {
  composeRasiPhalalu,
  RASI_PHALALU_DISCLAIMER,
} from '../domain/rasi-phalalu';
import { VedAstroClient } from '../infrastructure/vedastro.client';
import { PanchangService } from './panchang.service';

@Injectable()
export class GuidanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly panchang: PanchangService,
    private readonly vedastro: VedAstroClient,
  ) {}

  async todayForUser(userId: string) {
    const profile = await this.prisma.birthProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException(
        'Birth profile not set. Save DOB and rasi first.',
      );
    }

    const date = todayInTimezone(profile.timezone);
    const panchang = await this.panchang.getPanchang({
      date,
      city: profile.cityName,
      latitude: profile.cityLatitude,
      longitude: profile.cityLongitude,
      timezone: profile.timezone,
    });

    const editorial = await this.prisma.rasiDailyGuidance.findUnique({
      where: {
        rasi_date: {
          rasi: profile.rasi,
          date: new Date(`${date}T00:00:00.000Z`),
        },
      },
    });

    const birthDate = profile.dateOfBirth.toISOString().slice(0, 10);
    const birthLocation = {
      cityName: profile.birthPlace || profile.cityName,
      latitude: profile.birthLatitude ?? profile.cityLatitude,
      longitude: profile.birthLongitude ?? profile.cityLongitude,
      timezone: profile.timezone,
    };
    const checkLocation = {
      cityName: profile.cityName,
      latitude: profile.cityLatitude,
      longitude: profile.cityLongitude,
      timezone: profile.timezone,
    };

    const chart = await this.vedastro.dailyChart({
      birthDate,
      birthClock: profile.birthTime,
      localDate: date,
      birthLocation,
      checkLocation,
    });

    const fromApi = chart
      ? composeRasiPhalalu({
          events: chart.events,
          gochara: chart.gochara,
          dasa: chart.dasa,
        })
      : null;

    const guidance = fromApi ?? editorial;
    const source = fromApi ? 'vedastro' : editorial ? 'admin' : null;

    return {
      date,
      rasi: profile.rasi,
      rasiLabel: RASI_LABELS[profile.rasi],
      nakshatra: profile.nakshatra,
      panchangSummary: (panchang as { summary: string }).summary,
      avoidRahuKalam: (panchang as { rahuKalam: unknown }).rahuKalam,
      preferAbhijit: (panchang as { abhijitMuhurtham: unknown }).abhijitMuhurtham,
      source,
      disclaimer: RASI_PHALALU_DISCLAIMER,
      guidance,
      events: fromApi?.events ?? [],
      audioBriefingText: guidance
        ? `Today is ${(panchang as { summary: string }).summary}. For ${RASI_LABELS[profile.rasi]}, ${guidance.summary} Recommended puja: ${guidance.recommendedPuja}. Lucky color ${guidance.luckyColor}, direction ${guidance.luckyDirection}, number ${guidance.luckyNumber}.`
        : null,
    };
  }

  async upsertAdmin(
    rasi: Rasi,
    date: string,
    body: {
      summary: string;
      recommendedPuja: string;
      activity: string;
      luckyColor: string;
      luckyDirection: string;
      luckyNumber: number;
      career: string;
      finance: string;
      health: string;
      travel: string;
    },
  ) {
    return this.prisma.rasiDailyGuidance.upsert({
      where: {
        rasi_date: {
          rasi,
          date: new Date(`${date}T00:00:00.000Z`),
        },
      },
      create: {
        rasi,
        date: new Date(`${date}T00:00:00.000Z`),
        ...body,
      },
      update: body,
    });
  }
}
