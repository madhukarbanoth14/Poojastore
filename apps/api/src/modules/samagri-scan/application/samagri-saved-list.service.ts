import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

export type SavedSamagriItem = {
  productId: string;
  slug: string;
  nameEn: string;
  nameTe: string;
  priceMinor: number;
  quantity: number;
};

@Injectable()
export class SamagriSavedListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const rows = await this.prisma.savedSamagriList.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return rows.map((row) => this.toDto(row));
  }

  async create(
    userId: string,
    input: { title: string; rawText?: string; items: SavedSamagriItem[] },
  ) {
    const row = await this.prisma.savedSamagriList.create({
      data: {
        userId,
        title: input.title.trim().slice(0, 120),
        rawText: input.rawText?.trim() || null,
        items: input.items,
      },
    });
    return this.toDto(row);
  }

  async remove(userId: string, id: string) {
    const row = await this.prisma.savedSamagriList.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Saved list not found');
    if (row.userId !== userId) throw new ForbiddenException();
    await this.prisma.savedSamagriList.delete({ where: { id } });
    return { deleted: true };
  }

  async hydrate(userId: string, id: string) {
    const row = await this.prisma.savedSamagriList.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Saved list not found');
    if (row.userId !== userId) throw new ForbiddenException();

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
      matches,
      unmatchedLines: [] as string[],
      unmatchedSuggestions: [] as unknown[],
    };
  }

  private toDto(row: {
    id: string;
    title: string;
    rawText: string | null;
    items: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const items = row.items as SavedSamagriItem[];
    return {
      id: row.id,
      title: row.title,
      rawText: row.rawText,
      itemCount: items.length,
      items,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
