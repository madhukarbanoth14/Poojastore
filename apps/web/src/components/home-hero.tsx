import { HomeGreeting } from "@/components/home-greeting";
import { HomePanchangPanel } from "@/components/home-panchang-panel";
import { LocationPicker } from "@/components/location-picker";
import { MandalaWatermark, YantraRings } from "@/components/ornaments";
import { t } from "@/lib/copy";
import type { Locale, PanchangToday } from "@/lib/types";

export function HomeHero({
  locale,
  panchang,
  city,
  shopCta,
}: {
  locale: Locale;
  panchang: PanchangToday | null;
  city: string;
  shopCta?: { href: string; label: string };
}) {
  return (
    <section className="hero-wash hero-home relative overflow-hidden text-cream">
      <div className="hero-grid" />
      <MandalaWatermark className="pointer-events-none absolute -left-24 top-16 h-[28rem] w-[28rem] opacity-[0.06]" />

      <div className="absolute right-5 top-5 z-10 rounded-full border border-gold-bright/35 bg-maroon-ink/45 px-2.5 py-1 backdrop-blur-sm md:right-8 md:top-6">
        <LocationPicker locale={locale} city={city} light compact cityOnly />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-12 md:pt-14 md:pb-14">
        <div className="pr-32 sm:pr-40">
          <HomeGreeting locale={locale} city={city} />
          <p className="mt-2 text-sm text-gold-bright/90">{t(locale, "tagline")}</p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <HomePanchangPanel locale={locale} initial={panchang} city={city} shopCta={shopCta} />

          <div className="hero-shrine relative mx-auto hidden aspect-square w-full max-w-[20rem] lg:block lg:self-start lg:-mt-12">
            <div className="absolute inset-[18%] rounded-full bg-orange/22 blur-3xl" />
            <YantraRings className="yantra-spin pointer-events-none absolute inset-0 opacity-50" />
            <div className="absolute inset-[16%] z-[1] overflow-hidden rounded-full">
              <div className="hero-seal h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brand/pavitra_seva_seal.png"
                  alt="Pavitra Seva lotus, Om, and diya"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
