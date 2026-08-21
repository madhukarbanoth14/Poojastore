import { Injectable, Logger } from '@nestjs/common';
import { SmsSenderPort } from '../application/ports/sms-sender.port';

@Injectable()
export class ConsoleSmsSender implements SmsSenderPort {
  private readonly logger = new Logger(ConsoleSmsSender.name);

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phoneE164}: ${code}`);
  }
}
