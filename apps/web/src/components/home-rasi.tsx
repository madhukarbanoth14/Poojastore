"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/types";

type GuidancePayload = {
  rasiLabel?: string;
  nakshatra?: string | null;
  source?: string | null;
  disclaimer?: string;
  guidance?: {
    summary: string;
    recommendedPuja: string;
    career: string;
    finance: string;
    health: string;
    travel: string;
    luckyColor: string;
    luckyNumber: number;
  };
};

export function HomeRasiCard({ locale }: { locale: Locale }) {
  const { user, ready } = useAuth();
  const [data, setData] = useState<GuidancePayload | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    setLoading(true);
    void clientFetch<GuidancePayload>("/guidance/today", {
      signal: AbortSignal.timeout(20000),
    })
      .then((payload) => {
        setData(payload);
        setMissing(false);
      })
      .catch(() => {
        setData(null);
        setMissing(true);
      })
      .finally(() => setLoading(false));
  }, [ready, user]);

  return (
    <article className="card-temple flex h-full flex-col p-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-maroon uppercase">
        {t(locale, "rasiPhalalu")}
      </p>
      {!ready || loading ? (
        <p className="mt-4 text-sm text-muted">{locale === "te" ? "లోడ్ అవుతోంది…" : "Loading…"}</p>
      ) : !user || missing || !data?.guidance ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {locale === "te"
              ? "వ్యక్తిగత రాశి ఫలాల కోసం జనన వివరాలు జోడించండి. ఇది సాంప్రదాయిక మార్గదర్శకం, హామీ కాదు."
              : "Add your birth details to see today’s rasi guidance. This is traditional counsel, not a guaranteed outcome."}
          </p>
          <Link href={user ? "/account/birth" : "/login?next=/account/birth"} className="btn-orange btn-orange-sm mt-5 self-start">
            {locale === "te" ? "ఆధ్యాత్మిక ప్రొఫైల్" : "Spiritual profile"}
          </Link>
        </>
      ) : (
        <>
          <h3 className="font-display mt-2 text-2xl text-maroon">{data.rasiLabel}</h3>
          <p className="mt-2 text-sm leading-relaxed text-body">{data.guidance.summary}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                {locale === "te" ? "వృత్తి" : "Career"}
              </dt>
              <dd className="mt-1 text-body">{data.guidance.career}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                {locale === "te" ? "ధనం" : "Finance"}
              </dt>
              <dd className="mt-1 text-body">{data.guidance.finance}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                {locale === "te" ? "కుటుంబం / ఆరోగ్యం" : "Family & health"}
              </dt>
              <dd className="mt-1 text-body">{data.guidance.health}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                {locale === "te" ? "ప్రయాణం" : "Travel"}
              </dt>
              <dd className="mt-1 text-body">{data.guidance.travel}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">
            {locale === "te" ? "శుభ సంఖ్య" : "Lucky number"} {data.guidance.luckyNumber} ·{" "}
            {locale === "te" ? "రంగు" : "colour"} {data.guidance.luckyColor}
          </p>
          <Link href="/rasi" className="mt-5 text-sm font-semibold text-maroon">
            {locale === "te" ? "పూర్తి ఫలితం →" : "View full prediction →"}
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {data.disclaimer ??
              (locale === "te"
                ? "వేదాస్ట్రో ఓపెన్ API. సాంప్రదాయిక మార్గదర్శకం, హామీ కాదు."
                : "From the VedAstro open API. Traditional guidance, not a guarantee.")}
          </p>
        </>
      )}
    </article>
  );
}
