import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PUSH_SENDER } from './application/ports/push-sender.port';
import {
  DeviceTokenService,
  PushNotificationService,
} from './application/push-notification.service';
import { ConsolePushSender } from './infrastructure/console-push.sender';
import { FcmPushSender } from './infrastructure/fcm-push.sender';
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
    ConsolePushSender,
    FcmPushSender,
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
  ],
  exports: [PushNotificationService, DeviceTokenService],
})
export class NotificationsModule {}
