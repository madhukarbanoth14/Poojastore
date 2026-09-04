import { PanchangExplorer } from "@/components/panchang-explorer";
import { getPanchangByDate, getTodayPanchang } from "@/lib/api";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "Panchang" };

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const locale = await getLocale();
  const { date } = await searchParams;
  const chosen = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const initial = chosen
    ? await getPanchangByDate(chosen, locale)
    : await getTodayPanchang(locale);
  return <PanchangExplorer locale={locale} initial={initial} />;
}
