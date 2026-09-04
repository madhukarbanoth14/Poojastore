import { cookies } from "next/headers";
import { DEFAULT_CITY, isKnownCity } from "./location";
import type { Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("ps_locale")?.value === "te" ? "te" : "en";
}

export async function getCity(): Promise<string> {
  const store = await cookies();
  const value = store.get("ps_city")?.value;
  return isKnownCity(value) ? value! : DEFAULT_CITY;
}
