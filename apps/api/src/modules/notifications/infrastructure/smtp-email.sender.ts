import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  EmailSenderPort,
  type EmailMessage,
} from '../application/ports/email-sender.port';

@Injectable()
export class SmtpEmailSender implements EmailSenderPort {
  private readonly logger = new Logger(SmtpEmailSender.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('email.smtp.host') ?? '';
    const port = this.config.get<number>('email.smtp.port') ?? 587;
    const user = this.config.get<string>('email.smtp.user') ?? '';
    const pass = this.config.get<string>('email.smtp.pass') ?? '';
    const secure = this.config.get<boolean>('email.smtp.secure') ?? false;
    this.from =
      this.config.get<string>('email.from') ??
      'Pavitra Seva <noreply@pavitraseva.in>';

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user ? { user, pass } : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async send(message: EmailMessage): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP is not configured');
    }

    const info = await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    this.logger.log(
      `Email queued id=${info.messageId ?? 'n/a'} to=${message.to}`,
    );
  }
}
