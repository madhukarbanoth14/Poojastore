import Image from "next/image";
import Link from "next/link";
import { HomePanchangPanel } from "@/components/home-panchang-panel";
import { MandalaWatermark, YantraRings } from "@/components/ornaments";
import { Kicker } from "@/components/ui";
import { festivalImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import { festivalShopHref, upcomingFestivals } from "@/lib/festivals";
import { daysUntil, formatMoney } from "@/lib/format";
import type { Locale, PanchangToday } from "@/lib/types";

export function HomeHero({
  locale,
  panchang,
}: {
  locale: Locale;
  panchang: PanchangToday | null;
}) {
  return (
    <section className="hero-wash hero-home relative overflow-hidden text-cream">
      <div className="hero-grid" />
      <MandalaWatermark className="pointer-events-none absolute -left-24 top-16 h-[28rem] w-[28rem] opacity-[0.07]" />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <HomePanchangPanel locale={locale} initial={panchang} />

          <div className="hero-shrine relative mx-auto aspect-square w-full max-w-[24rem] lg:mr-0">
            <div className="absolute inset-[18%] rounded-full bg-orange/28 blur-3xl" />
            <YantraRings className="yantra-spin pointer-events-none absolute inset-0 opacity-60" />
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

        <div className="relative z-[1] mt-16 pb-6 md:mt-20 md:pb-4">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Kicker light>Upcoming festivals</Kicker>
              <h2 className="font-display mt-1 text-2xl text-cream md:text-3xl">
                Buy the kit in time
              </h2>
            </div>
            <Link
              href="/festivals"
              className="text-xs font-semibold tracking-[0.16em] text-gold-bright uppercase"
            >
              {t(locale, "viewAll")}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {upcomingFestivals.map((fest) => {
              const shopHref = festivalShopHref(fest);
              return (
                <article key={fest.id} className="hero-fest-card">
                  <Link href={shopHref} className="block">
                    <div className="relative h-28 md:h-32">
                      <Image
                        src={festivalImage(fest.id)}
                        alt={locale === "te" ? fest.nameTe : fest.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
                      <span className="absolute right-3 top-3 rounded-full bg-maroon/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gold-bright uppercase">
                        {daysUntil(new Date(fest.target))}
                      </span>
                    </div>
                    <div className="px-4 pt-1">
                      <h3 className="font-display text-xl leading-tight text-maroon">
                        {locale === "te" ? fest.nameTe : fest.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted">
                        {locale === "te" ? fest.dateTe : fest.date}
                      </p>
                      <p className="mt-1.5 line-clamp-1 text-xs font-medium text-orange">
                        {fest.kitName} · {formatMoney(fest.kitPrice)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 pt-3">
                    <Link href={shopHref} className="btn-orange btn-orange-sm">
                      {locale === "te" ? "కిట్ చూడండి" : "View kits"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
