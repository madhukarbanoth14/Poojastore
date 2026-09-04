import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  PoojariSamagriListStatus,
  PriestBookingStatus,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { SamagriMatchService } from './samagri-match.service';
import { PushNotificationService } from '../../notifications/application/push-notification.service';
import type { SavedSamagriItem } from './samagri-saved-list.service';

@Injectable()
export class SamagriPoojariListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly match: SamagriMatchService,
    private readonly push: PushNotificationService,
  ) {}

  async sendFromText(
    poojariUserId: string,
    input: { bookingId: string; title?: string; text: string },
  ) {
    const booking = await this.requirePoojariBooking(poojariUserId, input.bookingId);
    const scan = await this.match.matchText(input.text.trim());
    const items = this.toSavedItems(scan.matches);
    if (items.length === 0) {
      throw new BadRequestException('No samagri items matched. Try clearer text.');
    }

    const row = await this.prisma.poojariSamagriList.create({
      data: {
        priestId: booking.priestId,
        createdByUserId: poojariUserId,
        recipientUserId: booking.userId,
        bookingId: booking.id,
        title: this.titleFor(input.title, booking.serviceName),
        rawText: input.text.trim(),
        items,
        status: PoojariSamagriListStatus.SENT,
      },
      include: this.includeMeta(),
    });

    await this.notifyRecipient(row);

    return this.toSentDto(row, scan);
  }

  async sendFromItems(
    poojariUserId: string,
    input: {
      bookingId: string;
      title?: string;
      rawText?: string;
      items: SavedSamagriItem[];
    },
  ) {
    const booking = await this.requirePoojariBooking(poojariUserId, input.bookingId);
    if (!input.items.length) {
      throw new BadRequestException('Select at least one samagri item.');
    }

    const row = await this.prisma.poojariSamagriList.create({
      data: {
        priestId: booking.priestId,
        createdByUserId: poojariUserId,
        recipientUserId: booking.userId,
        bookingId: booking.id,
        title: this.titleFor(input.title, booking.serviceName),
        rawText: input.rawText?.trim() || null,
        items: input.items,
        status: PoojariSamagriListStatus.SENT,
      },
      include: this.includeMeta(),
    });

    await this.notifyRecipient(row);

    return this.toSentDto(row);
  }

  async listForBooking(poojariUserId: string, bookingId: string) {
    await this.requirePoojariBooking(poojariUserId, bookingId);
    const rows = await this.prisma.poojariSamagriList.findMany({
      where: { bookingId },
      orderBy: { sentAt: 'desc' },
      include: this.includeMeta(),
    });
    return rows.map((row) => this.toSummaryDto(row));
  }

  async listReceived(userId: string) {
    const rows = await this.prisma.poojariSamagriList.findMany({
      where: { recipientUserId: userId },
      orderBy: { sentAt: 'desc' },
      take: 30,
      include: this.includeMeta(),
    });
    return rows.map((row) => this.toSummaryDto(row));
  }

  async hydrateReceived(userId: string, id: string) {
    const row = await this.prisma.poojariSamagriList.findUnique({
      where: { id },
      include: this.includeMeta(),
    });
    if (!row) throw new NotFoundException('Samagri list not found');
    if (row.recipientUserId !== userId) throw new ForbiddenException();

    if (row.status === PoojariSamagriListStatus.SENT) {
      await this.prisma.poojariSamagriList.update({
        where: { id },
        data: {
          status: PoojariSamagriListStatus.VIEWED,
          viewedAt: new Date(),
        },
      });
    }

    const savedItems = row.items as SavedSamagriItem[];
    const ids = savedItems.map((item) => item.productId);
    const products = ids.length
      ? await this.prisma.product.findMany({
          where: { id: { in: ids }, isActive: true },
          select: { id: true, slug: true, name: true, priceMinor: true, metadata: true },
        })
      : [];
    const byId = new Map(products.map((product) => [product.id, product]));

    const matches = savedItems
      .map((item) => {
        const live = byId.get(item.productId);
        if (!live) return null;
        const metadata = live.metadata as {
          lineItems?: Array<{ nameEn?: string; nameTe?: string }>;
          i18n?: { te?: { name?: string } };
        } | null;
        const line = metadata?.lineItems?.[0];
        return {
          productId: live.id,
          slug: live.slug,
          nameEn: line?.nameEn ?? item.nameEn ?? live.name,
          nameTe: line?.nameTe ?? item.nameTe ?? metadata?.i18n?.te?.name ?? '',
          priceMinor: live.priceMinor,
          confidence: 1,
          matchedText: item.nameEn,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    return {
      id: row.id,
      title: row.title,
      rawText: row.rawText ?? '',
      status: PoojariSamagriListStatus.VIEWED,
      sentAt: row.sentAt.toISOString(),
      priestName: row.priest.fullName,
      bookingId: row.bookingId,
      serviceName: row.booking.serviceName,
      matches,
      unmatchedLines: [] as string[],
      unmatchedSuggestions: [] as unknown[],
    };
  }

  private async requirePoojariBooking(poojariUserId: string, bookingId: string) {
    const priest = await this.prisma.priest.findUnique({
      where: { userId: poojariUserId },
    });
    if (!priest) {
      throw new NotFoundException('No pujari profile is linked to this account');
    }

    const booking = await this.prisma.priestBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.priestId !== priest.id) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status !== PriestBookingStatus.CONFIRMED) {
      throw new BadRequestException('Samagri lists can only be sent for confirmed bookings.');
    }
    return booking;
  }

  private toSavedItems(
    matches: Array<{
      productId: string;
      slug: string;
      nameEn: string;
      nameTe: string;
      priceMinor: number;
      quantity: number;
    }>,
  ): SavedSamagriItem[] {
    return matches.map((match) => ({
      productId: match.productId,
      slug: match.slug,
      nameEn: match.nameEn,
      nameTe: match.nameTe,
      priceMinor: match.priceMinor,
      quantity: match.quantity,
    }));
  }

  private titleFor(title: string | undefined, serviceName: string) {
    const trimmed = title?.trim();
    if (trimmed) return trimmed.slice(0, 120);
    return `${serviceName} samagri`.slice(0, 120);
  }

  private async notifyRecipient(row: {
    id: string;
    title: string;
    recipientUserId: string;
    priest: { fullName: string };
  }) {
    await this.push.notifyUser(row.recipientUserId, {
      type: NotificationType.POOJARI_SAMAGRI_LIST,
      title: `${row.priest.fullName} sent your samagri list`,
      body: row.title,
      data: {
        listId: row.id,
        deepLink: `/samagri/received/${row.id}`,
      },
    });
  }

  private includeMeta() {
    return {
      priest: { select: { id: true, fullName: true, slug: true } },
      booking: { select: { id: true, serviceName: true, bookingNumber: true } },
    } as const;
  }

  private toSummaryDto(row: {
    id: string;
    title: string;
    status: PoojariSamagriListStatus;
    sentAt: Date;
    viewedAt: Date | null;
    items: unknown;
    priest: { fullName: string };
    booking: { serviceName: string; bookingNumber: string };
  }) {
    const items = row.items as SavedSamagriItem[];
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      itemCount: items.length,
      sentAt: row.sentAt.toISOString(),
      viewedAt: row.viewedAt?.toISOString() ?? null,
      priestName: row.priest.fullName,
      serviceName: row.booking.serviceName,
      bookingNumber: row.booking.bookingNumber,
    };
  }

  private toSentDto(
    row: {
      id: string;
      title: string;
      status: PoojariSamagriListStatus;
      sentAt: Date;
      items: unknown;
      priest: { fullName: string };
      booking: { serviceName: string; bookingNumber: string };
    },
    scan?: Awaited<ReturnType<SamagriMatchService['matchText']>>,
  ) {
    return {
      ...this.toSummaryDto({ ...row, viewedAt: null }),
      matches: scan?.matches ?? [],
      unmatchedLines: scan?.unmatchedLines ?? [],
      unmatchedSuggestions: scan?.unmatchedSuggestions ?? [],
    };
  }
}
