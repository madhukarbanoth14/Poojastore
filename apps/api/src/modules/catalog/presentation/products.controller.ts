import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Market, Prisma, ProductType } from '@prisma/client';
import { IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { Public } from '../../../common/decorators/public.decorator';
import {
  localizeProduct,
  resolveLocale,
  type AppLocale,
} from '../../../common/i18n/locale';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  buildSelectableKitItems,
  collectLineItemSlugs,
} from '../application/selectable-kit-items';

class ListProductsQuery {
  @IsOptional()
  @IsEnum(Market)
  market?: Market;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @IsIn(['pooja-samagri'])
  catalog?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/)
  festival?: string;
}

type ProductRow = Prisma.ProductGetPayload<{
  include: { kitItems: true };
}>;

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active products/kits' })
  async list(
    @Query() query: ListProductsQuery,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(undefined, acceptLanguage);
    const type = query.type ?? (query.catalog || query.festival ? undefined : ProductType.PUJA_KIT);
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      market: query.market ?? Market.IN,
    };
    if (type) {
      where.type = type;
    }
    const metadataFilters: Prisma.ProductWhereInput[] = [];
    if (query.catalog) {
      metadataFilters.push({ metadata: { path: ['catalog'], equals: query.catalog } });
    }
    if (query.festival) {
      metadataFilters.push({ metadata: { path: ['festival'], equals: query.festival } });
    }
    if (metadataFilters.length === 1) {
      Object.assign(where, metadataFilters[0]);
    } else if (metadataFilters.length > 1) {
      where.AND = metadataFilters;
    }
    const items = await this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { kitItems: { orderBy: { sortOrder: 'asc' } } },
    });
    const visible = !query.catalog && !query.festival && type === ProductType.PUJA_KIT
      ? items.filter((item) => {
          const metadata = item.metadata as { catalog?: string } | null;
          return metadata?.catalog !== 'pooja-samagri';
        })
      : items;
    const kits = visible.filter((item) => item.type === ProductType.PUJA_KIT);
    const enrichedKits = kits.length
      ? await this.withSelectableItems(kits, locale)
      : [];
    const kitById = new Map(enrichedKits.map((item) => [item.id, item]));
    const payload = visible.map((item) =>
      item.type === ProductType.PUJA_KIT
        ? kitById.get(item.id)!
        : localizeProduct(item, locale),
    );
    return {
      success: true,
      data: { items: payload },
    };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async detail(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const locale = resolveLocale(undefined, acceptLanguage);
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { kitItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    const [enriched] = await this.withSelectableItems([product], locale);
    return { success: true, data: enriched };
  }

  private async withSelectableItems(items: ProductRow[], locale: AppLocale) {
    const slugs = collectLineItemSlugs(items);
    const priced = slugs.length
      ? await this.prisma.product.findMany({
          where: { slug: { in: slugs }, isActive: true },
          select: { id: true, slug: true, priceMinor: true },
        })
      : [];
    const bySlug = new Map(priced.map((row) => [row.slug, row]));

    return items.map((item) => {
      const localized = localizeProduct(item, locale);
      const meta = item.metadata as { festival?: string } | null;
      const selectableItems = buildSelectableKitItems({
        product: item,
        locale,
        pricedBySlug: bySlug,
      });
      return {
        ...localized,
        festival: meta?.festival,
        ...(selectableItems.length ? { selectableItems } : {}),
      };
    });
  }
}
