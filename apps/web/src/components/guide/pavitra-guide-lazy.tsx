"use client";

import dynamic from "next/dynamic";

const PavitraGuideWidget = dynamic(
  () =>
    import("@/components/guide/pavitra-guide-widget").then(
      (mod) => mod.PavitraGuideWidget,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

/** Lazy-loaded floating guide — keeps the homepage bundle light. */
export function PavitraGuideLazy({
  initialLocale = "en",
}: {
  initialLocale?: "en" | "te";
}) {
  return <PavitraGuideWidget initialLocale={initialLocale} />;
}
