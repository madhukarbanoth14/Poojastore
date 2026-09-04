import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CurrencyCode, Market, ProductType } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

const FESTIVAL_KITS = [
  {
    slug: 'ganesh-chaturthi-pooja-samagri',
    name: 'Ganesh Chaturthi Pooja Samagri Kit',
    nameTe: 'వినాయక చవితి పూజా సామాగ్రి కిట్',
    description:
      'Vinayaka Chavithi home pooja samagri — turmeric, kumkum, dhoti, clay akhanda deepam, and the diary list. Optional items are chosen at checkout. Homam is a separate kit.',
    descriptionTe:
      'వినాయక చవితి ఇంటి పూజా సామాగ్రి — పసుపు, కుంకుమ, దోవతి, మట్టి అఖండ దీపం.',
    priceMinor: 149900,
    mrpMinor: 189900,
    sortOrder: 11,
    festival: 'ganesh',
  },
  {
    slug: 'navratri-special-samagri',
    name: 'Navratri / Dasara extras kit',
    nameTe: 'నవరాత్రి / దసరా ప్రత్యేక సామగ్రి',
    description:
      'Pair with the basic pooja kit. Kalasham, mango leaves, saree, bangles, and turmeric roots for Navratri and Vijayadashami.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. కలశం, మామిడి ఆకులు, చీర, గాజులు.',
    priceMinor: 89900,
    mrpMinor: 109900,
    sortOrder: 22,
    festival: 'navratri',
  },
  {
    slug: 'lakshmi-special-samagri',
    name: 'Lakshmi extras kit',
    nameTe: 'లక్ష్మీ పూజ ప్రత్యేక సామగ్రి',
    description:
      'Pair with the basic pooja kit. Lotus, coins, kalasham, grains, and turmeric roots for Lakshmi and Deepavali pooja.',
    descriptionTe: 'బేసిక్ పూజా కిట్‌తో కలిపి. కమలం, నాణేలు, కలశం, ధాన్యం.',
    priceMinor: 54900,
    mrpMinor: 69900,
    sortOrder: 16,
    festival: 'diwali',
  },
] as const;

@Injectable()
export class CatalogSyncService implements OnModuleInit {
  private readonly logger = new Logger(CatalogSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureFestivalKits();
      await this.renameSatyanarayanTelugu();
    } catch (err) {
      this.logger.error('Could not sync festival kits', err);
    }
  }

  private async ensureFestivalKits() {
    for (const kit of FESTIVAL_KITS) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: kit.slug },
      });
      if (existing) continue;
      await this.prisma.product.create({
        data: {
          slug: kit.slug,
          name: kit.name,
          description: kit.description,
          type: ProductType.PUJA_KIT,
          market: Market.IN,
          currency: CurrencyCode.INR,
          priceMinor: kit.priceMinor,
          mrpMinor: kit.mrpMinor,
          sortOrder: kit.sortOrder,
          isActive: true,
          metadata: {
            catalog: 'pooja-samagri',
            festival: kit.festival,
            i18n: {
              te: {
                name: kit.nameTe,
                description: kit.descriptionTe,
              },
            },
          },
        },
      });
      this.logger.log(`Created missing catalog kit ${kit.slug}`);
    }
  }

  private async renameSatyanarayanTelugu() {
    const product = await this.prisma.product.findUnique({
      where: { slug: 'satyanarayan-puja-kit' },
    });
    if (!product) return;
    const metadata = (product.metadata ?? {}) as {
      i18n?: { te?: { name?: string; description?: string; kitItems?: string[] } };
    };
    const te = metadata.i18n?.te ?? {};
    const name = 'సత్యనారాయణ స్వామి పూజా కిట్';
    const description =
      'సత్యనారాయణ స్వామి కథ, పూజకు కావాల్సిన సామగ్రి — ఇంటి వేడుకకు సంపూర్ణ కిట్.';
    const kitItems = (te.kitItems ?? []).map((item) =>
      item.startsWith('సత్యనారాయణ') && !item.startsWith('సత్యనారాయణ స్వామి')
        ? item.replace('సత్యనారాయణ', 'సత్యనారాయణ స్వామి')
        : item,
    );
    if (te.name === name && te.description === description) return;
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        metadata: {
          ...metadata,
          i18n: {
            ...metadata.i18n,
            te: {
              ...te,
              name,
              description,
              kitItems: kitItems.length
                ? kitItems
                : ['సత్యనారాయణ స్వామి ఫోటో/ఫ్రేమ్'],
            },
          },
        },
      },
    });
    this.logger.log('Updated Telugu name for satyanarayan-puja-kit');
  }
}
