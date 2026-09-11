import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeFestivalCampaign } from "@/components/home-festival-campaign";
import { HomeGuidanceCards } from "@/components/home-guidance";
import { HomeHero } from "@/components/home-hero";
import { HomeRasiCard } from "@/components/home-rasi";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/ui";
import { PriestComingSoon } from "@/components/priest-coming-soon";
import { listFestivalKits, listKits, listPackages, getTodayPanchang } from "@/lib/api";
import { festivalImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import {
  campaignText,
  filterCampaignKits,
  getActiveFestivalCampaign,
} from "@/lib/festival-campaign";
import { upcomingFromToday } from "@/lib/festivals";
import { daysUntil } from "@/lib/format";
import { getCity, getLocale } from "@/lib/locale";
import { marketForCity } from "@/lib/location";

const DEFAULT_HOME_TITLE = "Pavitra Seva · Your Divine Companion";
const DEFAULT_HOME_DESCRIPTION =
  "Wake up to today’s panchangam, rasi guidance, and ritual — then book a Pooja or shop a kit. For families in India, USA, and Canada.";

export async function generateMetadata(): Promise<Metadata> {
  const campaign = getActiveFestivalCampaign();
  if (!campaign) {
    return {
      title: { absolute: DEFAULT_HOME_TITLE },
      description: DEFAULT_HOME_DESCRIPTION,
    };
  }
  return {
    title: { absolute: campaign.seoTitle.en },
    description: campaign.seoDescription.en,
    openGraph: {
      title: campaign.seoTitle.en,
      description: campaign.seoDescription.en,
    },
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const city = await getCity();
  const market = marketForCity(city);
  const campaign = getActiveFestivalCampaign();
  const [kits, festivalKits, packages, panchang] = await Promise.all([
    listKits(locale, market),
    listFestivalKits(locale, market),
    listPackages(locale, market),
    getTodayPanchang(locale, city),
  ]);
  const featured = [...festivalKits, ...kits].filter(
    (product, index, list) => list.findIndex((item) => item.id === product.id) === index,
  );
  const campaignKits = campaign ? filterCampaignKits(featured, campaign) : [];
  const festivalIds = new Set(festivalKits.map((kit) => kit.id));
  const festivals = upcomingFromToday(3);

  return (
    <div className="mandala-fade">
      <HomeHero
        locale={locale}
        panchang={panchang}
        city={city}
        shopCta={
          campaign
            ? {
                href: campaign.shopHref,
                label: campaignText(locale, campaign.heroShopCta),
              }
            : undefined
        }
      />

      {campaign ? (
        <HomeFestivalCampaign locale={locale} campaign={campaign} kits={campaignKits} />
      ) : null}

      <div className="mx-auto max-w-6xl space-y-16 px-5 py-14">
        <section>
          <SectionTitle kicker={t(locale, "tagline")} title={t(locale, "spiritualGuidance")} />
          <div className="grid gap-6 lg:grid-cols-3">
            <HomeGuidanceCards locale={locale} city={city} />
            <HomeRasiCard locale={locale} />
          </div>
          <p className="mt-3 text-xs text-muted">
            {locale === "te"
              ? "సాంప్రదాయిక మార్గదర్శకం. ఫలితాలు హామీ కావు."
              : "Traditional spiritual guidance — not a guarantee of outcomes."}
          </p>
        </section>

        <section>
          <SectionTitle
            kicker={t(locale, "upcoming")}
            title={locale === "te" ? "రాబోయే పండుగ" : "Upcoming festival"}
            action={
              <Link href="/festivals" className="text-sm link-brand">
                {t(locale, "viewAll")}
              </Link>
            }
          />
          {festivals.length ? (
            <div className="grid gap-5 sm:grid-cols-3">
              {festivals.map((fest) => {
                const href = `/festivals/${fest.id}`;
                return (
                  <article key={fest.id} className="card-temple overflow-hidden">
                    <Link href={href} className="block">
                      <div className="relative h-32">
                        <Image
                          src={festivalImage(fest.id)}
                          alt={locale === "te" ? fest.nameTe : fest.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute right-3 top-3 rounded-full bg-maroon/90 px-2.5 py-1 text-[10px] font-semibold text-gold-bright uppercase">
                          {daysUntil(new Date(fest.target))}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-xl text-maroon">
                          {locale === "te" ? fest.nameTe : fest.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {locale === "te" ? fest.dateTe : fest.date}
                        </p>
                      </div>
                    </Link>
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                      <Link href={href} className="btn-orange btn-orange-sm">
                        {locale === "te" ? "పండుగ చూడండి" : "View festival"}
                      </Link>
                      <Link href="/priests" className="text-sm font-semibold text-maroon">
                        {t(locale, "bookPooja")}
                      </Link>
                      {fest.kitTabs.length ? (
                        <Link href={href} className="text-sm font-semibold text-maroon">
                          {locale === "te" ? "కిట్" : "Shop kit"}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="card-temple p-6 text-sm text-muted">
              {locale === "te" ? "రాబోయే పండుగలు త్వరలో చూపిస్తాం." : "Upcoming festivals will appear here."}
            </p>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-4">
          {[
            { href: "/poojas", label: t(locale, "bookPooja") },
            { href: "/priests", label: t(locale, "bookPriest") },
            { href: "/kits", label: t(locale, "shopKits") },
            { href: "/panchang", label: t(locale, "todayPanchang") },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card-temple px-4 py-5 text-center font-semibold">
              {item.label}
            </Link>
          ))}
        </section>

        <section>
          <SectionTitle
            kicker="Shop"
            title={t(locale, "featuredKits")}
            action={
              <Link href="/kits" className="text-sm link-brand">
                {t(locale, "viewAll")}
              </Link>
            }
          />
          {featured.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  badge={festivalIds.has(p.id) ? "Festival" : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="card-temple p-8 text-sm text-muted">
              {locale === "te"
                ? "ఈ ప్రాంతంలో కిట్‌లు అందుబాటులో లేవు. ప్రదేశం మార్చి చూడండి."
                : "No kits for this region yet. Try another location, or start the API."}
            </p>
          )}
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              kicker={t(locale, "navPriests")}
              title={locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book a poojari"}
            />
            <PriestComingSoon locale={locale} compact />
          </div>
          <div>
            <SectionTitle
              kicker={t(locale, "navPackages")}
              title={t(locale, "navPackages")}
              action={
                <Link href="/packages" className="text-sm link-brand">
                  {t(locale, "viewAll")}
                </Link>
              }
            />
            <div className="space-y-3">
              {packages.slice(0, 3).map((pkg) => (
                <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="card-temple block p-5">
                  <p className="font-display text-xl">{pkg.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{pkg.summary}</p>
                </Link>
              ))}
              {!packages.length ? (
                <p className="card-temple p-5 text-sm text-muted">
                  {locale === "te" ? "ప్యాకేజీలు API నుంచి లోడ్ అవుతాయి." : "Packages load from the live catalog."}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
