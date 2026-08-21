import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KidsAgeBand, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  SubmitQuizDto,
  UpsertKidsStoryDto,
} from '../presentation/dto/kids.dto';

@Injectable()
export class KidsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStories(params: {
    ageBand?: KidsAgeBand;
    q?: string;
    language?: string;
  }) {
    const where: Prisma.KidsStoryWhereInput = {
      isPublished: true,
      ...(params.ageBand ? { ageBand: params.ageBand } : {}),
      ...(params.language ? { language: params.language } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: 'insensitive' } },
              { festivalName: { contains: params.q, mode: 'insensitive' } },
              { summary: { contains: params.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const items = await this.prisma.kidsStory.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        festivalName: true,
        ageBand: true,
        language: true,
        coverImageUrl: true,
        relatedVidhiSlug: true,
        tags: true,
        sortOrder: true,
        _count: { select: { pages: true } },
        quiz: { select: { id: true, title: true } },
      },
    });

    return { items };
  }

  async storyBySlug(slug: string) {
    const story = await this.prisma.kidsStory.findFirst({
      where: { slug, isPublished: true },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
        quiz: { select: { id: true, title: true, passScore: true } },
      },
    });
    if (!story) throw new NotFoundException('Story not found');
    return story;
  }

  async quizBySlug(slug: string) {
    const story = await this.prisma.kidsStory.findFirst({
      where: { slug, isPublished: true },
      include: {
        quiz: {
          include: {
            questions: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
    if (!story?.quiz) throw new NotFoundException('Quiz not found');

    return {
      storySlug: story.slug,
      storyTitle: story.title,
      id: story.quiz.id,
      title: story.quiz.title,
      passScore: story.quiz.passScore,
      questions: story.quiz.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        sortOrder: q.sortOrder,
      })),
    };
  }

  async completeStory(userId: string, slug: string) {
    const story = await this.prisma.kidsStory.findFirst({
      where: { slug, isPublished: true },
    });
    if (!story) throw new NotFoundException('Story not found');

    return this.prisma.kidsProgress.upsert({
      where: {
        userId_storyId: { userId, storyId: story.id },
      },
      create: {
        userId,
        storyId: story.id,
        storyCompletedAt: new Date(),
      },
      update: {
        storyCompletedAt: new Date(),
      },
    });
  }

  async submitQuiz(userId: string, slug: string, body: SubmitQuizDto) {
    const story = await this.prisma.kidsStory.findFirst({
      where: { slug, isPublished: true },
      include: {
        quiz: {
          include: { questions: true },
        },
      },
    });
    if (!story?.quiz) throw new NotFoundException('Quiz not found');

    const byId = new Map(story.quiz.questions.map((q) => [q.id, q]));
    let score = 0;
    const results = body.answers.map((answer) => {
      const question = byId.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(`Unknown question ${answer.questionId}`);
      }
      const correct = question.correctIndex === answer.selectedIndex;
      if (correct) score += 1;
      return {
        questionId: question.id,
        correct,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      };
    });

    const total = story.quiz.questions.length;
    const passed = score >= story.quiz.passScore;

    const progress = await this.prisma.kidsProgress.upsert({
      where: {
        userId_storyId: { userId, storyId: story.id },
      },
      create: {
        userId,
        storyId: story.id,
        storyCompletedAt: new Date(),
        quizScore: score,
        quizTotal: total,
        quizPassed: passed,
        quizCompletedAt: new Date(),
      },
      update: {
        quizScore: score,
        quizTotal: total,
        quizPassed: passed,
        quizCompletedAt: new Date(),
        storyCompletedAt: new Date(),
      },
    });

    return {
      score,
      total,
      passed,
      passScore: story.quiz.passScore,
      results,
      progress,
    };
  }

  async myProgress(userId: string) {
    const items = await this.prisma.kidsProgress.findMany({
      where: { userId },
      include: {
        story: {
          select: {
            slug: true,
            title: true,
            festivalName: true,
            ageBand: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { items };
  }

  async upsertAdmin(slug: string, body: UpsertKidsStoryDto) {
    return this.prisma.$transaction(async (tx) => {
      const story = await tx.kidsStory.upsert({
        where: { slug },
        create: {
          slug,
          title: body.title,
          summary: body.summary,
          festivalName: body.festivalName,
          whyCelebrated: body.whyCelebrated,
          importance: body.importance,
          ageBand: body.ageBand ?? KidsAgeBand.JUNIOR,
          language: body.language ?? 'en',
          coverImageUrl: body.coverImageUrl,
          audioUrl: body.audioUrl,
          videoUrl: body.videoUrl,
          relatedVidhiSlug: body.relatedVidhiSlug,
          tags: body.tags ?? [],
          isPublished: body.isPublished ?? true,
          sortOrder: body.sortOrder ?? 0,
        },
        update: {
          title: body.title,
          summary: body.summary,
          festivalName: body.festivalName,
          whyCelebrated: body.whyCelebrated,
          importance: body.importance,
          ...(body.ageBand ? { ageBand: body.ageBand } : {}),
          language: body.language ?? 'en',
          coverImageUrl: body.coverImageUrl,
          audioUrl: body.audioUrl,
          videoUrl: body.videoUrl,
          relatedVidhiSlug: body.relatedVidhiSlug,
          tags: body.tags ?? [],
          isPublished: body.isPublished ?? true,
          sortOrder: body.sortOrder ?? 0,
        },
      });

      await tx.kidsStoryPage.deleteMany({ where: { storyId: story.id } });
      await tx.kidsStoryPage.createMany({
        data: body.pages.map((page) => ({
          storyId: story.id,
          pageNumber: page.pageNumber,
          title: page.title,
          body: page.body,
          imageUrl: page.imageUrl,
          audioUrl: page.audioUrl,
        })),
      });

      if (body.quizQuestions?.length) {
        const quiz = await tx.kidsQuiz.upsert({
          where: { storyId: story.id },
          create: {
            storyId: story.id,
            title: body.quizTitle ?? `${body.title} Quiz`,
            passScore: body.quizPassScore ?? 2,
          },
          update: {
            title: body.quizTitle ?? `${body.title} Quiz`,
            passScore: body.quizPassScore ?? 2,
          },
        });
        await tx.kidsQuizQuestion.deleteMany({ where: { quizId: quiz.id } });
        await tx.kidsQuizQuestion.createMany({
          data: body.quizQuestions.map((q, index) => ({
            quizId: quiz.id,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            sortOrder: q.sortOrder ?? index,
          })),
        });
      }

      return tx.kidsStory.findUniqueOrThrow({
        where: { id: story.id },
        include: {
          pages: { orderBy: { pageNumber: 'asc' } },
          quiz: {
            include: { questions: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      });
    });
  }
}
