export type AppLocale = 'en' | 'te';

export function resolveLocale(
  query?: string,
  acceptLanguage?: string,
): AppLocale {
  const raw = (query || acceptLanguage || 'en').toLowerCase();
  if (raw.startsWith('te')) return 'te';
  return 'en';
}

type ProductLike = {
  name: string;
  description: string;
  metadata?: unknown;
  kitItems?: Array<{ name: string } & Record<string, unknown>>;
};

export function localizeProduct<T extends ProductLike>(
  product: T,
  locale: AppLocale,
): T {
  if (locale === 'en') return product;
  const metadata = (product.metadata ?? {}) as {
    i18n?: Record<string, { name?: string; description?: string; kitItems?: string[] }>;
  };
  const tr = metadata.i18n?.[locale];
  if (!tr) return product;
  return {
    ...product,
    name: tr.name ?? product.name,
    description: tr.description ?? product.description,
    kitItems: product.kitItems?.map((item, index) => ({
      ...item,
      name: tr.kitItems?.[index] ?? item.name,
    })),
  };
}
