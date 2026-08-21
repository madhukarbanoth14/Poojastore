import { Injectable, NotFoundException } from '@nestjs/common';
import { Rasi } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { RASI_LABELS } from '../domain/panchang.constants';
import { todayInTimezone } from '../domain/panchang.engine';
import { PanchangService } from './panchang.service';

const FALLBACK_BY_RASI: Record<
  Rasi,
  {
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
  }
> = {
  MESHA: {
    summary: 'Energy is high — start auspicious tasks after Abhijit muhurtham.',
    recommendedPuja: 'Hanuman / Surya Namaskaram',
    activity: 'Begin new work with discipline',
    luckyColor: 'Red',
    luckyDirection: 'East',
    luckyNumber: 9,
    career: 'Lead with clarity; avoid impulsive replies.',
    finance: 'Good day for planned expenses, not speculation.',
    health: 'Keep hydration and light exercise.',
    travel: 'Short local travel is fine; avoid rushed long trips.',
  },
  VRISHABHA: {
    summary: 'Steady gains come from patience and family rituals.',
    recommendedPuja: 'Lakshmi / Bilva Archana',
    activity: 'Home organizing and gratitude practices',
    luckyColor: 'White',
    luckyDirection: 'South',
    luckyNumber: 6,
    career: 'Consistency beats speed today.',
    finance: 'Review savings; avoid emotional purchases.',
    health: 'Favor satvik meals.',
    travel: 'Prefer morning departures.',
  },
  MITHUNA: {
    summary: 'Communication opens doors — chant and connect.',
    recommendedPuja: 'Saraswati Puja',
    activity: 'Learning, writing, mentoring',
    luckyColor: 'Green',
    luckyDirection: 'North',
    luckyNumber: 5,
    career: 'Share ideas; document agreements.',
    finance: 'Negotiate politely for better terms.',
    health: 'Rest your voice and eyes.',
    travel: 'Good for educational or sibling visits.',
  },
  KARKA: {
    summary: 'Emotional balance improves with moon-related devotion.',
    recommendedPuja: 'Shiva Abhishekam',
    activity: 'Care for elders and home shrine',
    luckyColor: 'Pearl white',
    luckyDirection: 'North-West',
    luckyNumber: 2,
    career: 'Support teammates; avoid overthinking.',
    finance: 'Family budgets need calm review.',
    health: 'Prioritize sleep.',
    travel: 'Stay close to water routes if traveling.',
  },
  SIMHA: {
    summary: 'Confidence rises — offer light and lead with kindness.',
    recommendedPuja: 'Surya / Lakshmi Narasimha',
    activity: 'Leadership tasks after sunrise',
    luckyColor: 'Gold',
    luckyDirection: 'East',
    luckyNumber: 1,
    career: 'Visibility helps; stay humble.',
    finance: 'Invest in quality, not display.',
    health: 'Protect from heat and stress.',
    travel: 'Daytime travel preferred.',
  },
  KANYA: {
    summary: 'Detail-oriented puja brings clarity.',
    recommendedPuja: 'Ganesha / Vishnu Sahasranama',
    activity: 'Checklist-driven spiritual practice',
    luckyColor: 'Grey-green',
    luckyDirection: 'South',
    luckyNumber: 5,
    career: 'Audit and refine processes.',
    finance: 'Track small leaks in spending.',
    health: 'Digestive care and walking.',
    travel: 'Plan buffers; avoid last-minute changes.',
  },
  TULA: {
    summary: 'Harmony at home supports auspicious outcomes.',
    recommendedPuja: 'Satyanarayan / Lakshmi',
    activity: 'Reconcile relationships',
    luckyColor: 'Blue',
    luckyDirection: 'West',
    luckyNumber: 6,
    career: 'Collaborate; mediate conflicts.',
    finance: 'Balance giving and saving.',
    health: 'Breathing exercises help.',
    travel: 'Pair travel with temple stops.',
  },
  VRISHCHIKA: {
    summary: 'Transformative day — deep mantra practice helps.',
    recommendedPuja: 'Rudrabhishekam / Kali worship (as per tradition)',
    activity: 'Meditation and letting go',
    luckyColor: 'Maroon',
    luckyDirection: 'North',
    luckyNumber: 8,
    career: 'Research and focused work excel.',
    finance: 'Avoid secretive money deals.',
    health: 'Detox lightly; rest well.',
    travel: 'Night travel less favored.',
  },
  DHANU: {
    summary: 'Dharma and learning are highlighted.',
    recommendedPuja: 'Guru / Vishnu',
    activity: 'Study scriptures or teach kids',
    luckyColor: 'Yellow',
    luckyDirection: 'North-East',
    luckyNumber: 3,
    career: 'Mentorship opportunities arise.',
    finance: 'Donate a small amount; prosperity follows.',
    health: 'Outdoor movement is good.',
    travel: 'Pilgrimage-style trips favored.',
  },
  MAKARA: {
    summary: 'Discipline brings long-term blessings.',
    recommendedPuja: 'Shani / Hanuman',
    activity: 'Complete pending vows',
    luckyColor: 'Black/Blue',
    luckyDirection: 'West',
    luckyNumber: 8,
    career: 'Hard work is noticed.',
    finance: 'Structured investments only.',
    health: 'Joint care and stretching.',
    travel: 'Prefer proven routes.',
  },
  KUMBHA: {
    summary: 'Community service and innovation align.',
    recommendedPuja: 'Satya Narayana / Shiva',
    activity: 'Group chanting or seva',
    luckyColor: 'Electric blue',
    luckyDirection: 'West',
    luckyNumber: 4,
    career: 'Try unconventional solutions.',
    finance: 'Shared expenses — stay transparent.',
    health: 'Nervous system rest.',
    travel: 'Good for community events.',
  },
  MEENA: {
    summary: 'Devotion and compassion open the day.',
    recommendedPuja: 'Vishnu / Krishna',
    activity: 'Bhajan, charity, quiet prayer',
    luckyColor: 'Sea green',
    luckyDirection: 'North',
    luckyNumber: 7,
    career: 'Creative intuition is strong.',
    finance: 'Avoid vague commitments.',
    health: 'Feet rest and calm music.',
    travel: 'Spiritual destinations favored.',
  },
};

@Injectable()
export class GuidanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly panchang: PanchangService,
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

    let guidance = await this.prisma.rasiDailyGuidance.findUnique({
      where: {
        rasi_date: {
          rasi: profile.rasi,
          date: new Date(`${date}T00:00:00.000Z`),
        },
      },
    });

    if (!guidance) {
      const fallback = FALLBACK_BY_RASI[profile.rasi];
      guidance = await this.prisma.rasiDailyGuidance.create({
        data: {
          rasi: profile.rasi,
          date: new Date(`${date}T00:00:00.000Z`),
          ...fallback,
        },
      });
    }

    return {
      date,
      rasi: profile.rasi,
      rasiLabel: RASI_LABELS[profile.rasi],
      nakshatra: profile.nakshatra,
      panchangSummary: (panchang as { summary: string }).summary,
      avoidRahuKalam: (panchang as { rahuKalam: unknown }).rahuKalam,
      preferAbhijit: (panchang as { abhijitMuhurtham: unknown }).abhijitMuhurtham,
      guidance,
      audioBriefingText: `Today is ${(panchang as { summary: string }).summary}. For ${RASI_LABELS[profile.rasi]}, ${guidance.summary} Recommended puja: ${guidance.recommendedPuja}. Lucky color ${guidance.luckyColor}, direction ${guidance.luckyDirection}, number ${guidance.luckyNumber}.`,
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
