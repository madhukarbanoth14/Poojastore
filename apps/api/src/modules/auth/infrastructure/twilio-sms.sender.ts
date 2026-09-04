import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { SmsSenderPort } from '../application/ports/sms-sender.port';

@Injectable()
export class TwilioSmsSender implements SmsSenderPort {
  private readonly logger = new Logger(TwilioSmsSender.name);
  private readonly client: ReturnType<typeof twilio> | null;
  private readonly fromNumber: string;
  private readonly messagingServiceSid: string;

  constructor(private readonly config: ConfigService) {
    const accountSid = this.config.get<string>('twilio.accountSid') ?? '';
    const authToken = this.config.get<string>('twilio.authToken') ?? '';
    this.fromNumber = this.config.get<string>('twilio.fromNumber') ?? '';
    this.messagingServiceSid =
      this.config.get<string>('twilio.messagingServiceSid') ?? '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.client = null;
    }
  }

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    await this.sendMessage(
      phoneE164,
      `Pavitra Seva OTP: ${code}. Valid for a few minutes. Do not share.`,
    );
  }

  async sendMessage(phoneE164: string, body: string): Promise<void> {
    if (!this.client) {
      throw new Error('Twilio is not configured');
    }
    if (!this.fromNumber && !this.messagingServiceSid) {
      throw new Error(
        'Twilio requires TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID',
      );
    }

    const message = await this.client.messages.create({
      to: phoneE164,
      body,
      ...(this.messagingServiceSid
        ? { messagingServiceSid: this.messagingServiceSid }
        : { from: this.fromNumber }),
    });

    this.logger.log(`SMS queued sid=${message.sid} to=${phoneE164}`);
  }
}
