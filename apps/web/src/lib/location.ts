import type { Locale } from "./types";

export type Market = "IN" | "US" | "CA";

export type LocationPreset = {
  name: string;
  region: string;
  country: Market;
  timezone: string;
};

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: "Hyderabad", region: "India", country: "IN", timezone: "Asia/Kolkata" },
  { name: "Bengaluru", region: "India", country: "IN", timezone: "Asia/Kolkata" },
  { name: "Delhi", region: "India", country: "IN", timezone: "Asia/Kolkata" },
  { name: "Mumbai", region: "India", country: "IN", timezone: "Asia/Kolkata" },
  { name: "New York", region: "USA", country: "US", timezone: "America/New_York" },
  { name: "New Jersey", region: "USA", country: "US", timezone: "America/New_York" },
  { name: "Toronto", region: "Canada", country: "CA", timezone: "America/Toronto" },
];

export const DEFAULT_CITY = "Hyderabad";

const CITY_TE: Record<string, string> = {
  Hyderabad: "హైదరాబాద్",
  Bengaluru: "బెంగళూరు",
  Delhi: "ఢిల్లీ",
  Mumbai: "ముంబై",
  "New York": "న్యూయార్క్",
  "New Jersey": "న్యూజెర్సీ",
  Toronto: "టొరంటో",
};

const REGION_TE: Record<string, string> = {
  India: "భారతదేశం",
  USA: "అమెరికా",
  Canada: "కెనడా",
};

export function localizeCityName(name: string, locale: Locale = "en") {
  if (locale !== "te") return name;
  return CITY_TE[name] ?? name;
}

export function locationByName(name: string | null | undefined): LocationPreset {
  const found = LOCATION_PRESETS.find(
    (item) => item.name.toLowerCase() === (name ?? "").trim().toLowerCase(),
  );
  return found ?? LOCATION_PRESETS[0]!;
}

export function cityLabel(name: string | null | undefined, locale: Locale = "en") {
  const loc = locationByName(name);
  const city = locale === "te" ? (CITY_TE[loc.name] ?? loc.name) : loc.name;
  const region = locale === "te" ? (REGION_TE[loc.region] ?? loc.region) : loc.region;
  return `${city}, ${region}`;
}

export function marketForCity(name: string | null | undefined): Market {
  return locationByName(name).country;
}

export function timezoneForCity(name: string | null | undefined) {
  return locationByName(name).timezone;
}

export function isKnownCity(name: string | null | undefined) {
  return LOCATION_PRESETS.some(
    (item) => item.name.toLowerCase() === (name ?? "").trim().toLowerCase(),
  );
}
