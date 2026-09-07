import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_SENDER } from './application/ports/email-sender.port';
import { PUSH_SENDER } from './application/ports/push-sender.port';
import { OrderConfirmationEmailService } from './application/order-confirmation-email.service';
import {
  DeviceTokenService,
  PushNotificationService,
} from './application/push-notification.service';
import { ConsoleEmailSender } from './infrastructure/console-email.sender';
import { ConsolePushSender } from './infrastructure/console-push.sender';
import { FcmPushSender } from './infrastructure/fcm-push.sender';
import { SmtpEmailSender } from './infrastructure/smtp-email.sender';
import {
  DeviceTokenController,
  NotificationsController,
} from './presentation/notifications.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController, DeviceTokenController],
  providers: [
    DeviceTokenService,
    PushNotificationService,
    OrderConfirmationEmailService,
    ConsolePushSender,
    FcmPushSender,
    ConsoleEmailSender,
    SmtpEmailSender,
    {
      provide: PUSH_SENDER,
      inject: [ConfigService, ConsolePushSender, FcmPushSender],
      useFactory: (
        config: ConfigService,
        consoleSender: ConsolePushSender,
        fcmSender: FcmPushSender,
      ) => {
        const provider = config.get<string>('push.provider') ?? 'console';
        if (provider === 'fcm') return fcmSender;
        return consoleSender;
      },
    },
    {
      provide: EMAIL_SENDER,
      inject: [ConfigService, ConsoleEmailSender, SmtpEmailSender],
      useFactory: (
        config: ConfigService,
        consoleSender: ConsoleEmailSender,
        smtpSender: SmtpEmailSender,
      ) => {
        const provider = config.get<string>('email.provider') ?? 'console';
        if (provider === 'smtp') return smtpSender;
        return consoleSender;
      },
    },
  ],
  exports: [
    PushNotificationService,
    DeviceTokenService,
    OrderConfirmationEmailService,
  ],
})
export class NotificationsModule {}
