"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { useAccountLocale } from "@/components/account/account-frame";
import { ac } from "@/lib/account-copy";
import { clientFetch, writeCity } from "@/lib/client";
import { LOCATION_PRESETS } from "@/lib/location";

const RASI = [
  ["MESHA", "Mesha (Aries)"],
  ["VRISHABHA", "Vrishabha (Taurus)"],
  ["MITHUNA", "Mithuna (Gemini)"],
  ["KARKA", "Karka (Cancer)"],
  ["SIMHA", "Simha (Leo)"],
  ["KANYA", "Kanya (Virgo)"],
  ["TULA", "Tula (Libra)"],
  ["VRISHCHIKA", "Vrishchika (Scorpio)"],
  ["DHANU", "Dhanu (Sagittarius)"],
  ["MAKARA", "Makara (Capricorn)"],
  ["KUMBHA", "Kumbha (Aquarius)"],
  ["MEENA", "Meena (Pisces)"],
] as const;

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

type City = { name: string; latitude: number; longitude: number; timezone: string };

type BirthProfile = {
  dateOfBirth: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  rasi: string;
  nakshatra?: string | null;
  gotram?: string | null;
  cityName?: string | null;
};

export default function BirthProfilePage() {
  const { user } = useAuth();
  const locale = useAccountLocale();
  const [welcome, setWelcome] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    dateOfBirth: "",
    birthTime: "",
    birthPlace: "",
    rasi: "MESHA",
    nakshatra: "",
    gotram: "",
    cityName: "Hyderabad",
  });

  useEffect(() => {
    setWelcome(new URLSearchParams(window.location.search).get("welcome") === "1");
    if (!user) return;
    void (async () => {
      try {
        const cityData = await clientFetch<{ items: City[] }>("/panchang/cities");
        setCities(cityData.items ?? []);
      } catch {
        setCities([]);
      }
      try {
        const profile = await clientFetch<BirthProfile>("/profile/birth");
        const dob = profile.dateOfBirth?.slice(0, 10) ?? "";
        const time = profile.birthTime?.slice(0, 5) ?? "";
        setForm({
          dateOfBirth: dob,
          birthTime: time,
          birthPlace: profile.birthPlace ?? "",
          rasi: profile.rasi || "MESHA",
          nakshatra: profile.nakshatra ?? "",
          gotram: profile.gotram ?? "",
          cityName: profile.cityName ?? "Hyderabad",
        });
      } catch {
        /* first-time profile */
      }
    })();
  }, [user]);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await clientFetch("/profile/birth", {
        method: "PUT",
        body: JSON.stringify({
          dateOfBirth: form.dateOfBirth,
          birthTime: form.birthTime || undefined,
          birthPlace: form.birthPlace || undefined,
          rasi: form.rasi,
          nakshatra: form.nakshatra || undefined,
          gotram: form.gotram || undefined,
          cityName: form.cityName,
        }),
      });
      writeCity(form.cityName);
      setMessage(ac(locale, "saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">
        {ac(locale, "groupSpiritual")}
      </p>
      <h1 className="font-display mt-2 text-4xl text-maroon">{ac(locale, "birth")}</h1>
      {welcome ? (
        <p className="mt-3 text-sm text-muted">
          {locale === "te"
            ? "ఐచ్ఛికం — ఇప్పుడు లేదా తర్వాత పూర్తి చేయవచ్చు."
            : "Optional. Add what you know now; skip and complete later."}{" "}
          <Link href="/" className="font-semibold text-maroon">
            {locale === "te" ? "దాటవేయి" : "Skip for now"}
          </Link>
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {locale === "te"
            ? "జనన సమయం, నక్షత్రం, గోత్రం ఐచ్ఛికం."
            : "Birth time, nakshatra, and gotram are optional."}
        </p>
      )}
      <form className="card-temple mt-6 space-y-3 p-6" onSubmit={(e) => void onSubmit(e)}>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "dob")}
          <input
            className="input-ps mt-1"
            type="date"
            required
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "birthTime")}
          <input
            className="input-ps mt-1"
            type="time"
            value={form.birthTime}
            onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "birthPlace")}
          <input
            className="input-ps mt-1"
            value={form.birthPlace}
            onChange={(e) => setForm((f) => ({ ...f, birthPlace: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "rasi")}
          <select
            className="input-ps mt-1"
            value={form.rasi}
            onChange={(e) => setForm((f) => ({ ...f, rasi: e.target.value }))}
          >
            {RASI.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "nakshatra")}
          <select
            className="input-ps mt-1"
            value={form.nakshatra}
            onChange={(e) => setForm((f) => ({ ...f, nakshatra: e.target.value }))}
          >
            <option value="">—</option>
            {NAKSHATRAS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "gotram")}
          <input
            className="input-ps mt-1"
            value={form.gotram}
            onChange={(e) => setForm((f) => ({ ...f, gotram: e.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-maroon">
          {ac(locale, "panchangCity")}
          <select
            className="input-ps mt-1"
            value={form.cityName}
            onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
          >
            {(
              cities.length
                ? Array.from(new Set([...LOCATION_PRESETS.map((c) => c.name), ...cities.map((c) => c.name)]))
                : LOCATION_PRESETS.map((c) => c.name)
            ).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        </label>
        {error ? <p className="text-sm text-orange">{error}</p> : null}
        {message ? <p className="text-sm text-maroon">{message}</p> : null}
        <button type="submit" disabled={busy} className="w-full btn-orange disabled:opacity-50">
          {busy ? ac(locale, "saving") : ac(locale, "save")}
        </button>
      </form>
    </div>
  );
}
