import { LocationPicker } from "@/components/location-picker";
import { PanchangExplorer } from "@/components/panchang-explorer";
import { getPanchangByDate, getTodayPanchang } from "@/lib/api";
import { getCity, getLocale } from "@/lib/locale";

export const metadata = {
  title: "Daily Panchangam",
  description:
    "Location-aware tithi, nakshatra, sunrise, Rahu Kalam, and muhurtham for your city in India, USA, or Canada.",
};

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const locale = await getLocale();
  const city = await getCity();
  const { date } = await searchParams;
  const chosen = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const initial = chosen
    ? await getPanchangByDate(chosen, locale, city)
    : await getTodayPanchang(locale, city);
  return <PanchangExplorer key={city} locale={locale} city={city} initial={initial} />;
}
