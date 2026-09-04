import { serverApiBase } from "./config";
import type {
  Locale,
  PanchangToday,
  Priest,
  Product,
  PujaPackage,
  Vidhi,
} from "./types";

type Envelope<T> = { success?: boolean; data?: T; message?: string };

async function apiGet<T>(path: string, locale: Locale = "en"): Promise<T | null> {
  const url = `${serverApiBase()}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(`[api] ${res.status} ${url}`);
      return null;
    }
    const json = (await res.json()) as Envelope<T>;
    return json.data ?? null;
  } catch (err) {
    console.error(`[api] failed ${url}`, err);
    return null;
  }
}

async function listOrIndia<T>(
  market: string,
  load: (nextMarket: string) => Promise<T[]>,
): Promise<T[]> {
  const items = await load(market);
  if (items.length || market === "IN") return items;
  return load("IN");
}

export async function listKits(locale: Locale = "en", market = "IN") {
  return listOrIndia(market, async (nextMarket) => {
    const data = await apiGet<{ items: Product[] }>(
      `/products?market=${nextMarket}&type=PUJA_KIT`,
      locale,
    );
    return data?.items ?? [];
  });
}

export async function listFestivalKits(locale: Locale = "en", market = "IN", festival?: string) {
  const fest = festival ? `&festival=${encodeURIComponent(festival)}` : "";
  return listOrIndia(market, async (nextMarket) => {
    const data = await apiGet<{ items: Product[] }>(
      `/products?market=${nextMarket}&catalog=pooja-samagri&type=PUJA_KIT${fest}`,
      locale,
    );
    return data?.items ?? [];
  });
}

export async function listSamagri(locale: Locale = "en", market = "IN") {
  return listOrIndia(market, async (nextMarket) => {
    const data = await apiGet<{ items: Product[] }>(
      `/products?market=${nextMarket}&catalog=pooja-samagri`,
      locale,
    );
    return data?.items ?? [];
  });
}

export async function getProduct(slug: string, locale: Locale = "en") {
  return apiGet<Product>(`/products/${encodeURIComponent(slug)}`, locale);
}

export async function listPriests(locale: Locale = "en", market = "IN") {
  return listOrIndia(market, async (nextMarket) => {
    const data = await apiGet<{ items: Priest[] }>(`/priests?market=${nextMarket}`, locale);
    return data?.items ?? [];
  });
}

export async function getPriest(slug: string, locale: Locale = "en") {
  return apiGet<Priest>(`/priests/${encodeURIComponent(slug)}`, locale);
}

export async function listPackages(locale: Locale = "en", market = "IN") {
  return listOrIndia(market, async (nextMarket) => {
    const data = await apiGet<{ items: PujaPackage[] }>(
      `/packages?market=${nextMarket}`,
      locale,
    );
    return data?.items ?? [];
  });
}

export async function getPackage(slug: string, locale: Locale = "en") {
  return apiGet<PujaPackage>(`/packages/${encodeURIComponent(slug)}`, locale);
}

export async function listVidhi(locale: Locale = "en") {
  const data = await apiGet<{ items: Vidhi[] }>(`/vidhi`, locale);
  return data?.items ?? [];
}

export async function getVidhi(slug: string, locale: Locale = "en") {
  return apiGet<Vidhi>(`/vidhi/${encodeURIComponent(slug)}`, locale);
}

export async function getTodayPanchang(locale: Locale = "en", city = "Hyderabad") {
  return apiGet<PanchangToday>(
    `/panchang/today?city=${encodeURIComponent(city)}`,
    locale,
  );
}

export async function getPanchangByDate(
  date: string,
  locale: Locale = "en",
  city = "Hyderabad",
) {
  return apiGet<PanchangToday>(
    `/panchang/${encodeURIComponent(date)}?city=${encodeURIComponent(city)}`,
    locale,
  );
}

export { serverApiBase as getApiBase };
