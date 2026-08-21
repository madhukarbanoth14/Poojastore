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
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
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
    const type = query.type ?? (query.catalog ? undefined : ProductType.PUJA_KIT);
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      market: query.market ?? Market.IN,
    };
    if (type) {
      where.type = type;
    }
    if (query.catalog) {
      where.metadata = { path: ['catalog'], equals: query.catalog };
    }
    const items = await this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { kitItems: { orderBy: { sortOrder: 'asc' } } },
    });
    const visible = !query.catalog && type === ProductType.PUJA_KIT
      ? items.filter((item) => {
          const metadata = item.metadata as { catalog?: string } | null;
          return metadata?.catalog !== 'pooja-samagri';
        })
      : items;
    const withLines = await this.withSelectableItems(visible, locale);
    return {
      success: true,
      data: { items: withLines },
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
      const selectableItems = buildSelectableKitItems({
        product: item,
        locale,
        pricedBySlug: bySlug,
      });
      if (!selectableItems.length) {
        return localized;
      }
      const meta = item.metadata as { festival?: string } | null;
      return {
        ...localized,
        festival: meta?.festival,
        selectableItems,
      };
    });
  }
}
