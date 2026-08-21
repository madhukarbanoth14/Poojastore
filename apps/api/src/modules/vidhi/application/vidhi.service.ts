import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VidhiCategory } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { UpsertVidhiDto } from '../presentation/dto/vidhi.dto';

const detailInclude = {
  steps: { orderBy: { stepNumber: 'asc' as const } },
  mantras: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class VidhiService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    category?: VidhiCategory;
    q?: string;
    language?: string;
  }) {
    const where: Prisma.PujaVidhiWhereInput = {
      isPublished: true,
      ...(params.category ? { category: params.category } : {}),
      ...(params.language ? { language: params.language } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: 'insensitive' } },
              { summary: { contains: params.q, mode: 'insensitive' } },
              { tags: { has: params.q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const items = await this.prisma.pujaVidhi.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        language: true,
        durationMinutes: true,
        difficulty: true,
        coverImageUrl: true,
        relatedProductSlug: true,
        tags: true,
        sortOrder: true,
        _count: { select: { steps: true, mantras: true } },
      },
    });

    return { items };
  }

  async bySlug(slug: string) {
    const vidhi = await this.prisma.pujaVidhi.findFirst({
      where: { slug, isPublished: true },
      include: detailInclude,
    });
    if (!vidhi) throw new NotFoundException('Vidhi not found');
    return vidhi;
  }

  async upsertAdmin(slug: string, body: UpsertVidhiDto) {
    const data: Prisma.PujaVidhiUpdateInput = {
      title: body.title,
      summary: body.summary,
      description: body.description,
      category: body.category,
      language: body.language ?? 'en',
      bestTimeHint: body.bestTimeHint,
      durationMinutes: body.durationMinutes,
      ...(body.difficulty ? { difficulty: body.difficulty } : {}),
      coverImageUrl: body.coverImageUrl,
      audioNarrationUrl: body.audioNarrationUrl,
      videoDemoUrl: body.videoDemoUrl,
      kathaText: body.kathaText,
      kathaAudioUrl: body.kathaAudioUrl,
      relatedProductSlug: body.relatedProductSlug,
      tags: body.tags ?? [],
      isPublished: body.isPublished ?? true,
      sortOrder: body.sortOrder ?? 0,
    };

    return this.prisma.$transaction(async (tx) => {
      const createData: Prisma.PujaVidhiCreateInput = {
        slug,
        title: body.title,
        summary: body.summary,
        description: body.description,
        category: body.category,
        language: body.language ?? 'en',
        bestTimeHint: body.bestTimeHint,
        durationMinutes: body.durationMinutes,
        ...(body.difficulty ? { difficulty: body.difficulty } : {}),
        coverImageUrl: body.coverImageUrl,
        audioNarrationUrl: body.audioNarrationUrl,
        videoDemoUrl: body.videoDemoUrl,
        kathaText: body.kathaText,
        kathaAudioUrl: body.kathaAudioUrl,
        relatedProductSlug: body.relatedProductSlug,
        tags: body.tags ?? [],
        isPublished: body.isPublished ?? true,
        sortOrder: body.sortOrder ?? 0,
      };

      const vidhi = await tx.pujaVidhi.upsert({
        where: { slug },
        create: createData,
        update: data,
      });

      await tx.vidhiStep.deleteMany({ where: { vidhiId: vidhi.id } });
      await tx.vidhiMantra.deleteMany({ where: { vidhiId: vidhi.id } });

      if (body.steps.length) {
        await tx.vidhiStep.createMany({
          data: body.steps.map((step) => ({
            vidhiId: vidhi.id,
            stepNumber: step.stepNumber,
            title: step.title,
            instruction: step.instruction,
            transliteration: step.transliteration,
            meaning: step.meaning,
            imageUrl: step.imageUrl,
            audioUrl: step.audioUrl,
            durationSeconds: step.durationSeconds,
          })),
        });
      }

      if (body.mantras?.length) {
        await tx.vidhiMantra.createMany({
          data: body.mantras.map((mantra, index) => ({
            vidhiId: vidhi.id,
            title: mantra.title,
            sanskritText: mantra.sanskritText,
            transliteration: mantra.transliteration,
            meaning: mantra.meaning,
            audioUrl: mantra.audioUrl,
            sortOrder: mantra.sortOrder ?? index,
          })),
        });
      }

      return tx.pujaVidhi.findUniqueOrThrow({
        where: { id: vidhi.id },
        include: detailInclude,
      });
    });
  }
}
