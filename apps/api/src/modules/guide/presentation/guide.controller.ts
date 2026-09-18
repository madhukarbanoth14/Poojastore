import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../common/decorators/public.decorator';
import { GuideChatService } from '../application/guide-chat.service';
import { GuideRetrievalService } from '../application/guide-retrieval.service';
import type { GuideLanguage } from '../knowledge/types';
import { GuideChatDto } from './dto/guide-chat.dto';

function parseLang(raw?: string): GuideLanguage {
  if (raw === 'te' || raw === 'hi' || raw === 'en') return raw;
  return 'en';
}

@ApiTags('Guide')
@Controller({ path: 'guide', version: '1' })
export class GuideController {
  constructor(
    private readonly chat: GuideChatService,
    private readonly retrieval: GuideRetrievalService,
  ) {}

  @Public()
  @Get('bootstrap')
  @ApiOperation({ summary: 'Pavitra Seva Guide bootstrap copy + suggestions' })
  bootstrap(@Query('lang') lang?: string) {
    return this.chat.bootstrap(parseLang(lang));
  }

  @Public()
  @Get('knowledge')
  @ApiOperation({ summary: 'List guide knowledge summaries (data-driven index)' })
  knowledge(@Query('lang') lang?: string) {
    return { items: this.retrieval.listSummaries(parseLang(lang)) };
  }

  @Public()
  @Post('chat')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Chat with Pavitra Seva Guide' })
  chatTurn(@Body() body: GuideChatDto) {
    return this.chat.chat({
      message: body.message,
      language: body.language ?? 'en',
      history: body.history,
    });
  }
}
