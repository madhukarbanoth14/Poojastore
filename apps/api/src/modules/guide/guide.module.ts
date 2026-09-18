import { Module } from '@nestjs/common';
import { GuideChatService } from './application/guide-chat.service';
import { GuideOpenAiClient } from './application/guide-openai.client';
import { GuideRetrievalService } from './application/guide-retrieval.service';
import { GuideController } from './presentation/guide.controller';

@Module({
  controllers: [GuideController],
  providers: [GuideRetrievalService, GuideOpenAiClient, GuideChatService],
  exports: [GuideChatService],
})
export class GuideModule {}
