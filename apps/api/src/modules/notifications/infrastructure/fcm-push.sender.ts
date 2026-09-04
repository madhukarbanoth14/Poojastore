import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PushPayload, PushSenderPort } from '../application/ports/push-sender.port';

@Injectable()
export class FcmPushSender implements PushSenderPort, OnModuleInit {
  private readonly logger = new Logger(FcmPushSender.name);
  private messaging: import('firebase-admin/messaging').Messaging | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const json = this.config.get<string>('push.fcmServiceAccountJson') ?? '';
    if (!json.trim()) {
      this.logger.warn('FCM service account not configured; push delivery disabled');
      return;
    }

    try {
      const admin = require('firebase-admin') as typeof import('firebase-admin');
      const credential = admin.credential.cert(JSON.parse(json));
      if (!admin.apps.length) {
        admin.initializeApp({ credential });
      }
      this.messaging = admin.messaging();
      this.logger.log('FCM push sender initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize FCM: ${error}`);
    }
  }

  async sendToTokens(tokens: string[], payload: PushPayload): Promise<void> {
    if (!this.messaging || tokens.length === 0) return;

    const chunks = chunk(tokens, 500);
    for (const batch of chunks) {
      try {
        const response = await this.messaging.sendEachForMulticast({
          tokens: batch,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data ?? {},
          android: {
            priority: 'high',
            notification: {
              channelId: 'pooja_store_default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
              },
            },
          },
        });
        if (response.failureCount > 0) {
          this.logger.warn(
            `FCM batch: ${response.successCount} ok, ${response.failureCount} failed`,
          );
        }
      } catch (error) {
        this.logger.error(`FCM send failed: ${error}`);
      }
    }
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
