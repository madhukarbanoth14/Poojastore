import { Inject, Injectable } from '@nestjs/common';
import { NotificationType, PushPlatform } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { PUSH_SENDER, type PushSenderPort } from './ports/push-sender.port';

@Injectable()
export class DeviceTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    userId: string,
    input: { token: string; platform: PushPlatform; deviceId?: string },
  ) {
    const token = input.token.trim();
    if (!token) return { registered: false };

    await this.prisma.devicePushToken.upsert({
      where: {
        userId_token: { userId, token },
      },
      create: {
        userId,
        token,
        platform: input.platform,
        deviceId: input.deviceId?.trim() || null,
      },
      update: {
        platform: input.platform,
        deviceId: input.deviceId?.trim() || null,
      },
    });

    return { registered: true };
  }

  async remove(userId: string, token: string) {
    await this.prisma.devicePushToken.deleteMany({
      where: { userId, token: token.trim() },
    });
    return { removed: true };
  }

  async listTokensForUser(userId: string) {
    const rows = await this.prisma.devicePushToken.findMany({
      where: { userId },
      select: { token: true },
    });
    return rows.map((row) => row.token);
  }
}

export type NotifyUserInput = {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
};

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceTokens: DeviceTokenService,
    @Inject(PUSH_SENDER) private readonly pushSender: PushSenderPort,
  ) {}

  async notifyUser(userId: string, input: NotifyUserInput) {
    const data = input.data ?? {};
    const row = await this.prisma.userNotification.create({
      data: {
        userId,
        type: input.type,
        title: input.title.trim().slice(0, 180),
        body: input.body.trim(),
        data,
      },
    });

    const tokens = await this.deviceTokens.listTokensForUser(userId);
    await this.pushSender.sendToTokens(tokens, {
      title: row.title,
      body: row.body,
      data: {
        ...stringifyData(data),
        notificationId: row.id,
        type: row.type,
      },
    });

    return this.toDto(row);
  }

  async listForUser(userId: string, take = 40) {
    const rows = await this.prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return rows.map((row) => this.toDto(row));
  }

  async unreadCount(userId: string) {
    return this.prisma.userNotification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(userId: string, id: string) {
    const row = await this.prisma.userNotification.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return null;
    if (row.readAt) return this.toDto(row);

    const updated = await this.prisma.userNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return this.toDto(updated);
  }

  async markAllRead(userId: string) {
    await this.prisma.userNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: true };
  }

  async notifyPriestBookingConfirmed(
    userId: string,
    input: {
      bookingId: string;
      bookingNumber: string;
      priestName: string;
      serviceName: string;
    },
  ) {
    return this.notifyUser(userId, {
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Priest booking confirmed',
      body: `${input.priestName} — ${input.serviceName}`,
      data: {
        bookingId: input.bookingId,
        bookingNumber: input.bookingNumber,
        deepLink: '/bookings',
      },
    });
  }

  async notifyPackageBookingConfirmed(
    userId: string,
    input: {
      bookingId: string;
      bookingNumber: string;
      packageName: string;
    },
  ) {
    return this.notifyUser(userId, {
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Package booking confirmed',
      body: input.packageName,
      data: {
        bookingId: input.bookingId,
        bookingNumber: input.bookingNumber,
        deepLink: '/package-bookings',
      },
    });
  }

  async notifyOrderShipped(
    userId: string,
    input: {
      orderId: string;
      orderNumber: string;
      trackingNumber?: string | null;
    },
  ) {
    const tracking = input.trackingNumber?.trim();
    const body = tracking
      ? `Order ${input.orderNumber} shipped · ${tracking}`
      : `Order ${input.orderNumber} is on the way`;
    return this.notifyUser(userId, {
      type: NotificationType.ORDER_UPDATE,
      title: 'Order shipped',
      body,
      data: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        ...(tracking ? { trackingNumber: tracking } : {}),
        deepLink: `/orders/${input.orderId}`,
      },
    });
  }

  private toDto(row: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: unknown;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      data: row.data as Record<string, unknown>,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      unread: row.readAt == null,
    };
  }
}

function stringifyData(data: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = String(value);
  }
  return out;
}
