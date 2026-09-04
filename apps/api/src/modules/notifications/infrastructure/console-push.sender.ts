import { Injectable, Logger } from '@nestjs/common';
import type { PushPayload, PushSenderPort } from '../application/ports/push-sender.port';

@Injectable()
export class ConsolePushSender implements PushSenderPort {
  private readonly logger = new Logger(ConsolePushSender.name);

  async sendToTokens(tokens: string[], payload: PushPayload): Promise<void> {
    this.logger.log(
      `Push (console) to ${tokens.length} device(s): ${payload.title} — ${payload.body}`,
    );
    if (payload.data && Object.keys(payload.data).length > 0) {
      this.logger.debug(`Push data: ${JSON.stringify(payload.data)}`);
    }
  }
}
