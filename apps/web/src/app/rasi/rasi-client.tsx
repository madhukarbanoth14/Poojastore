"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocationPicker } from "@/components/location-picker";
import { EmptyNote, PageHero } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import type { Locale } from "@/lib/types";

type GuidancePayload = {
  date?: string;
  rasi?: string;
  rasiLabel?: string;
  nakshatra?: string | null;
  source?: string | null;
  disclaimer?: string;
  events?: { name: string; nature: string }[];
  panchangSummary?: string;
  guidance?: {
    summary: string;
    recommendedPuja: string;
    activity: string;
    career: string;
    finance: string;
    health: string;
    travel: string;
    luckyColor: string;
    luckyNumber: number;
    luckyDirection?: string;
  };
};

export default function RasiPageClient({ locale, city }: { locale: Locale; city: string }) {
  const { user, ready } = useAuth();
  const [data, setData] = useState<GuidancePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    void clientFetch<GuidancePayload>("/guidance/today", {
      signal: AbortSignal.timeout(20000),
    })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [ready, user]);

  return (
    <>
      <PageHero
        kicker={locale === "te" ? "సాంప్రదాయిక మార్గదర్శకం" : "Traditional guidance"}
        title={locale === "te" ? "రాశి ఫలాలు" : "Rasi Phalalu"}
        subtitle={
          locale === "te"
            ? "జనన ప్రొఫైల్ ఆధారంగా ఈ రోజు మార్గదర్శకం. ఫలితాలు హామీ కావు."
            : "Day guidance from the VedAstro open API for your saved birth details. Traditional counsel, not a guaranteed prediction."
        }
      />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-6">
          <LocationPicker locale={locale} city={city} />
        </div>
        {!ready ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : !user ? (
          <EmptyNote>
            <Link href="/login?next=/rasi" className="font-semibold text-maroon">
              Sign in
            </Link>{" "}
            and complete your spiritual profile to see today’s rasi phalalu.
          </EmptyNote>
        ) : error || !data?.guidance ? (
          <EmptyNote>
            {locale === "te"
              ? "రాశి ఫలాలు చూడటానికి జనన వివరాలు సేవ్ చేయండి."
              : "Save your birth details to load today’s rasi phalalu."}{" "}
            <Link href="/account/birth" className="font-semibold text-maroon">
              Spiritual profile
            </Link>
          </EmptyNote>
        ) : (
          <article className="card-temple p-6">
            <p className="text-sm text-muted">{data.date}</p>
            <h2 className="font-display mt-1 text-3xl text-maroon">{data.rasiLabel}</h2>
            {data.nakshatra ? <p className="mt-1 text-sm text-muted">{data.nakshatra}</p> : null}
            <p className="mt-4 leading-relaxed text-body">{data.guidance.summary}</p>
            <p className="mt-3 text-sm text-maroon">
              {locale === "te" ? "సూచించిన పూజ" : "Recommended pooja"}: {data.guidance.recommendedPuja}
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Career", "వృత్తి", data.guidance.career],
                  ["Finance", "ధనం", data.guidance.finance],
                  ["Family & health", "కుటుంబం / ఆరోగ్యం", data.guidance.health],
                  ["Travel", "ప్రయాణం", data.guidance.travel],
                ] as const
              ).map(([en, te, value]) => (
                <div key={en}>
                  <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {locale === "te" ? te : en}
                  </dt>
                  <dd className="mt-1 text-sm text-body">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-muted">
              Lucky number {data.guidance.luckyNumber} · colour {data.guidance.luckyColor}
              {data.guidance.luckyDirection ? ` · direction ${data.guidance.luckyDirection}` : ""}
            </p>
            {data.events?.length ? (
              <ul className="mt-4 space-y-1 text-xs text-muted">
                {data.events.slice(0, 8).map((event) => (
                  <li key={event.name}>
                    {event.name} · {event.nature}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-4 text-xs leading-relaxed text-muted">
              {data.disclaimer ??
                "From VedAstro (Lahiri). Traditional spiritual guidance — not a guaranteed outcome."}
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/priests" className="btn-orange">
                Book a Pooja
              </Link>
              <Link href="/panchang" className="text-sm font-semibold text-maroon">
                Today’s panchangam
              </Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
