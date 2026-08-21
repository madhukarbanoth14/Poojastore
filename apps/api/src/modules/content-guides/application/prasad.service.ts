import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class PrasadService {
  constructor(private readonly prisma: PrismaService) {}

  async list(festival?: string) {
    const items = await this.prisma.prasadRecipe.findMany({
      where: {
        isPublished: true,
        ...(festival
          ? { festivalName: { contains: festival, mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        festivalName: true,
        servings: true,
        prepMinutes: true,
        coverImageUrl: true,
        relatedProductSlug: true,
        tags: true,
        sortOrder: true,
        _count: { select: { steps: true } },
      },
    });
    return { items };
  }

  async bySlug(slug: string) {
    const recipe = await this.prisma.prasadRecipe.findFirst({
      where: { slug, isPublished: true },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });
    if (!recipe) throw new NotFoundException('Prasad recipe not found');

    let product = null;
    if (recipe.relatedProductSlug) {
      product = await this.prisma.product.findFirst({
        where: {
          slug: recipe.relatedProductSlug,
          isActive: true,
          type: 'PRASAD',
        },
        select: {
          id: true,
          slug: true,
          name: true,
          priceMinor: true,
          currency: true,
          market: true,
        },
      });
    }

    return { ...recipe, product };
  }

  async upsertAdmin(
    slug: string,
    input: {
      title: string;
      summary: string;
      festivalName: string;
      description: string;
      servings: number;
      prepMinutes: number;
      ingredients?: string[];
      coverImageUrl?: string;
      relatedProductSlug?: string;
      tags?: string[];
      isPublished?: boolean;
      sortOrder?: number;
      steps?: Array<{
        stepNumber: number;
        title?: string;
        instruction: string;
        imageUrl?: string;
        audioUrl?: string;
      }>;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.prasadRecipe.upsert({
        where: { slug },
        create: {
          slug,
          title: input.title,
          summary: input.summary,
          festivalName: input.festivalName,
          description: input.description,
          servings: input.servings,
          prepMinutes: input.prepMinutes,
          ingredients: input.ingredients ?? [],
          coverImageUrl: input.coverImageUrl,
          relatedProductSlug: input.relatedProductSlug,
          tags: input.tags ?? [],
          isPublished: input.isPublished ?? true,
          sortOrder: input.sortOrder ?? 0,
        },
        update: {
          title: input.title,
          summary: input.summary,
          festivalName: input.festivalName,
          description: input.description,
          servings: input.servings,
          prepMinutes: input.prepMinutes,
          ingredients: input.ingredients ?? [],
          coverImageUrl: input.coverImageUrl,
          relatedProductSlug: input.relatedProductSlug,
          tags: input.tags ?? [],
          isPublished: input.isPublished ?? true,
          sortOrder: input.sortOrder ?? 0,
        },
      });

      if (input.steps) {
        await tx.prasadRecipeStep.deleteMany({ where: { recipeId: recipe.id } });
        if (input.steps.length) {
          await tx.prasadRecipeStep.createMany({
            data: input.steps.map((step) => ({
              recipeId: recipe.id,
              stepNumber: step.stepNumber,
              title: step.title,
              instruction: step.instruction,
              imageUrl: step.imageUrl,
              audioUrl: step.audioUrl,
            })),
          });
        }
      }

      return tx.prasadRecipe.findUniqueOrThrow({
        where: { id: recipe.id },
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
    });
  }
}
