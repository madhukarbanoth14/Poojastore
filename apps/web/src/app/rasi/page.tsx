import RasiPageClient from "./rasi-client";
import { getCity, getLocale } from "@/lib/locale";

export const metadata = {
  title: "Rasi Phalalu",
  description: "Daily rasi phalalu from the VedAstro open API for your saved spiritual profile.",
};

export default async function RasiPage() {
  const locale = await getLocale();
  const city = await getCity();
  return <RasiPageClient locale={locale} city={city} />;
}
