import { Injectable, Logger } from '@nestjs/common';
import {
  EmailSenderPort,
  type EmailMessage,
} from '../application/ports/email-sender.port';

@Injectable()
export class ConsoleEmailSender implements EmailSenderPort {
  private readonly logger = new Logger(ConsoleEmailSender.name);

  async send(message: EmailMessage): Promise<void> {
    this.logger.log(
      `Email to ${message.to}: ${message.subject}\n${message.text}`,
    );
  }
}
