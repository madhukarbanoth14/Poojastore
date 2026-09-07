import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CurrencyCode, Market, ProductType } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

const RETIRED_FESTIVAL_SLUGS = [
  'ganesh-chaturthi-home-puja',
  'ganesh-chaturthi-pooja-samagri',
];

const FESTIVAL_KITS = [
  {
    slug: 'ganesh-mini-home-puja',
    name: 'Mini Home Pooja Kit',
    nameTe: 'మినీ ఇంటి పూజ కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — no POP, safe for visarjan.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల వినాయక చవితి కిట్ — మట్టి గణేష్ విగ్రహం. POP కాదు, విసర్జనకు సురక్షితం.',
    priceMinor: 111100,
    mrpMinor: 160000,
    sortOrder: 11,
    festival: 'ganesh',
  },
  {
    slug: 'ganesh-mini-office-puja',
    name: 'Mini Office Pooja Kit',
    nameTe: 'మినీ ఆఫీస్ పూజ కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — sized for an office desk or cabin shrine.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల మినీ ఆఫీస్ కిట్ — మట్టి గణేష్ విగ్రహం.',
    priceMinor: 149900,
    mrpMinor: 189900,
    sortOrder: 12,
    festival: 'ganesh',
  },
  {
    slug: 'ganesh-mini-mandapam',
    name: 'Mini Mandapam Kit',
    nameTe: 'మినీ మండపం కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — community / small mandapam quantities.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల మినీ మండపం కిట్ — మట్టి గణేష్ విగ్రహం.',
    priceMinor: 199900,
    mrpMinor: 239900,
    sortOrder: 13,
    festival: 'ganesh',
  },
  {
    slug: 'ganesh-mega-home-puja',
    name: 'Mega Home Pooja Kit',
    nameTe: 'మెగా ఇంటి పూజ కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — fuller home list for a longer stay.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల మెగా ఇంటి కిట్ — మట్టి గణేష్ విగ్రహం.',
    priceMinor: 299900,
    mrpMinor: 339900,
    sortOrder: 14,
    festival: 'ganesh',
  },
  {
    slug: 'ganesh-mega-office-puja',
    name: 'Mega Office Pooja Kit',
    nameTe: 'మెగా ఆఫీస్ కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — larger office shrine quantities.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల మెగా ఆఫీస్ కిట్ — మట్టి గణేష్ విగ్రహం.',
    priceMinor: 333300,
    mrpMinor: 373300,
    sortOrder: 15,
    festival: 'ganesh',
  },
  {
    slug: 'ganesh-mega-mandapam',
    name: 'Mega Mandapam Kit',
    nameTe: 'మెగా మండపం కిట్',
    description:
      'Complete eco-friendly Vinayaka Chavithi kit with a clay Ganesh idol — nine-day mandapam quantities.',
    descriptionTe:
      'పూర్తి పర్యావరణ అనుకూల మెగా మండపం కిట్ — మట్టి గణేష్ విగ్రహం.',
    priceMinor: 399900,
    mrpMinor: 439900,
    sortOrder: 16,
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
      const metadataBase = {
        catalog: 'pooja-samagri',
        festival: kit.festival,
        i18n: {
          te: {
            name: kit.nameTe,
            description: kit.descriptionTe,
          },
        },
      };
      if (existing) {
        const metadata = (existing.metadata ?? {}) as Record<string, unknown>;
        const i18n = (metadata.i18n ?? {}) as Record<string, unknown>;
        const te = (i18n.te ?? {}) as Record<string, unknown>;
        await this.prisma.product.update({
          where: { id: existing.id },
          data: {
            name: kit.name,
            description: kit.description,
            priceMinor: kit.priceMinor,
            mrpMinor: kit.mrpMinor,
            sortOrder: kit.sortOrder,
            isActive: true,
            metadata: {
              ...metadata,
              catalog: 'pooja-samagri',
              festival: kit.festival,
              i18n: {
                ...i18n,
                te: {
                  ...te,
                  name: kit.nameTe,
                  description: kit.descriptionTe,
                },
              },
            },
          },
        });
        continue;
      }
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
          metadata: metadataBase,
        },
      });
      this.logger.log(`Created missing catalog kit ${kit.slug}`);
    }
    await this.prisma.product.updateMany({
      where: { slug: { in: [...RETIRED_FESTIVAL_SLUGS] } },
      data: { isActive: false },
    });
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
