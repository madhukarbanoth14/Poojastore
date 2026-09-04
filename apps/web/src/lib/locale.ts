import { cookies } from "next/headers";
import type { Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("ps_locale")?.value === "te" ? "te" : "en";
}
