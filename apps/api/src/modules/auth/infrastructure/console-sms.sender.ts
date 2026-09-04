import { Injectable, Logger } from '@nestjs/common';
import { SmsSenderPort } from '../application/ports/sms-sender.port';

@Injectable()
export class ConsoleSmsSender implements SmsSenderPort {
  private readonly logger = new Logger(ConsoleSmsSender.name);

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    await this.sendMessage(
      phoneE164,
      `Pavitra Seva OTP: ${code}. Valid for a few minutes. Do not share.`,
    );
  }

  async sendMessage(phoneE164: string, body: string): Promise<void> {
    this.logger.log(`SMS to ${phoneE164}: ${body}`);
  }
}
