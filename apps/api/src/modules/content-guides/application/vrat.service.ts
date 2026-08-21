import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class VratService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.vratGuide.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        occurrences: {
          where: { date: { gte: new Date(new Date().toISOString().slice(0, 10)) } },
          orderBy: { date: 'asc' },
          take: 3,
        },
        _count: { select: { occurrences: true } },
      },
    });
    return { items };
  }

  async upcoming(limit = 20) {
    const items = await this.prisma.vratOccurrence.findMany({
      where: {
        date: { gte: new Date(new Date().toISOString().slice(0, 10)) },
        vrat: { isPublished: true },
      },
      orderBy: { date: 'asc' },
      take: limit,
      include: {
        vrat: {
          select: {
            slug: true,
            title: true,
            summary: true,
            durationHint: true,
            associatedPuja: true,
          },
        },
      },
    });
    return { items };
  }

  async bySlug(slug: string) {
    const vrat = await this.prisma.vratGuide.findFirst({
      where: { slug, isPublished: true },
      include: {
        occurrences: {
          where: { date: { gte: new Date(new Date().toISOString().slice(0, 10)) } },
          orderBy: { date: 'asc' },
          take: 12,
        },
      },
    });
    if (!vrat) throw new NotFoundException('Vrat not found');
    return vrat;
  }

  async upsertReminder(
    userId: string,
    slug: string,
    input: { remindDaysBefore?: number; enabled?: boolean },
  ) {
    const vrat = await this.prisma.vratGuide.findFirst({
      where: { slug, isPublished: true },
    });
    if (!vrat) throw new NotFoundException('Vrat not found');

    return this.prisma.vratReminder.upsert({
      where: {
        userId_vratId: { userId, vratId: vrat.id },
      },
      create: {
        userId,
        vratId: vrat.id,
        remindDaysBefore: input.remindDaysBefore ?? 1,
        enabled: input.enabled ?? true,
      },
      update: {
        ...(typeof input.remindDaysBefore === 'number'
          ? { remindDaysBefore: input.remindDaysBefore }
          : {}),
        ...(typeof input.enabled === 'boolean' ? { enabled: input.enabled } : {}),
      },
    });
  }

  async upsertAdmin(
    slug: string,
    input: {
      title: string;
      summary: string;
      description: string;
      durationHint: string;
      allowedFoods?: string[];
      avoidFoods?: string[];
      breakFastHow: string;
      associatedPuja?: string;
      relatedVidhiSlug?: string;
      tags?: string[];
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    return this.prisma.vratGuide.upsert({
      where: { slug },
      create: {
        slug,
        title: input.title,
        summary: input.summary,
        description: input.description,
        durationHint: input.durationHint,
        allowedFoods: input.allowedFoods ?? [],
        avoidFoods: input.avoidFoods ?? [],
        breakFastHow: input.breakFastHow,
        associatedPuja: input.associatedPuja,
        relatedVidhiSlug: input.relatedVidhiSlug,
        tags: input.tags ?? [],
        isPublished: input.isPublished ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
      update: {
        title: input.title,
        summary: input.summary,
        description: input.description,
        durationHint: input.durationHint,
        allowedFoods: input.allowedFoods ?? [],
        avoidFoods: input.avoidFoods ?? [],
        breakFastHow: input.breakFastHow,
        associatedPuja: input.associatedPuja,
        relatedVidhiSlug: input.relatedVidhiSlug,
        tags: input.tags ?? [],
        isPublished: input.isPublished ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }
}
