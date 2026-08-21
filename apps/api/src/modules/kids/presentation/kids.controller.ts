import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/authenticated-user';
import { KidsService } from '../application/kids.service';
import {
  ListKidsStoriesQueryDto,
  SubmitQuizDto,
  UpsertKidsStoryDto,
} from './dto/kids.dto';

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('Invalid slug');
  }
}

@ApiTags('Kids')
@Controller({ path: 'kids', version: '1' })
export class KidsController {
  constructor(private readonly kids: KidsService) {}

  @Public()
  @Get('stories')
  @ApiOperation({ summary: 'List kids festival stories' })
  async list(@Query() query: ListKidsStoriesQueryDto) {
    const data = await this.kids.listStories(query);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get('progress')
  @ApiOperation({ summary: 'My kids learning progress' })
  async progress(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.kids.myProgress(user.id);
    return { success: true, data };
  }

  @Public()
  @Get('stories/:slug')
  @ApiOperation({ summary: 'Kids story detail with pages' })
  async detail(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.kids.storyBySlug(slug);
    return { success: true, data };
  }

  @Public()
  @Get('stories/:slug/quiz')
  @ApiOperation({ summary: 'Quiz questions without correct answers' })
  async quiz(@Param('slug') slug: string) {
    assertSlug(slug);
    const data = await this.kids.quizBySlug(slug);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post('stories/:slug/complete')
  @ApiOperation({ summary: 'Mark story as completed' })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
  ) {
    assertSlug(slug);
    const data = await this.kids.completeStory(user.id, slug);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post('stories/:slug/quiz/submit')
  @ApiOperation({ summary: 'Submit quiz answers and get score' })
  async submitQuiz(
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Body() body: SubmitQuizDto,
  ) {
    assertSlug(slug);
    const data = await this.kids.submitQuiz(user.id, slug, body);
    return { success: true, data };
  }
}

@ApiTags('Admin Kids')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller({ path: 'admin/kids/stories', version: '1' })
export class AdminKidsController {
  constructor(private readonly kids: KidsService) {}

  @Put(':slug')
  @ApiOperation({ summary: 'Upsert kids story, pages, and quiz' })
  async upsert(
    @Param('slug') slug: string,
    @Body() body: UpsertKidsStoryDto,
  ) {
    assertSlug(slug);
    const data = await this.kids.upsertAdmin(slug, body);
    return { success: true, data };
  }
}
