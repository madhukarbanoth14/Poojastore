import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

@Injectable()
export class GuideOpenAiClient {
  private readonly logger = new Logger(GuideOpenAiClient.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled() {
    return Boolean(this.config.get<string>('guide.openaiApiKey'));
  }

  async complete(messages: ChatMessage[]): Promise<string | null> {
    const apiKey = this.config.get<string>('guide.openaiApiKey') ?? '';
    if (!apiKey) return null;

    const model = this.config.get<string>('guide.openaiModel') ?? 'gpt-4o-mini';
    const endpoint =
      this.config.get<string>('guide.openaiEndpoint') ??
      'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages,
        }),
      });

      const raw = await response.text();
      if (!response.ok) {
        this.logger.warn(`OpenAI error ${response.status}: ${raw.slice(0, 300)}`);
        return null;
      }

      const json = JSON.parse(raw) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      return content || null;
    } catch (error) {
      this.logger.warn(`OpenAI request failed: ${(error as Error).message}`);
      return null;
    }
  }
}
