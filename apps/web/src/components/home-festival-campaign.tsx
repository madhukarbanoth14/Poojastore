import Image from "next/image";
import Link from "next/link";
import { FestivalKitCard } from "@/components/festival-kit-card";
import { Kicker, SectionTitle } from "@/components/ui";
import {
  campaignText,
  type ActiveFestivalCampaign,
} from "@/lib/festival-campaign";
import { daysUntil } from "@/lib/format";
import type { Locale, Product } from "@/lib/types";

export function HomeFestivalCampaign({
  locale,
  campaign,
  kits,
}: {
  locale: Locale;
  campaign: ActiveFestivalCampaign;
  kits: Product[];
}) {
  const fest = campaign.festival;
  const name = locale === "te" ? fest.nameTe : fest.name;
  const date = locale === "te" ? fest.dateTe : fest.date;
  const remaining = daysUntil(new Date(fest.target));
  const featured = kits.slice(0, 4);

  return (
    <div className="festival-campaign">
      <section
        className="festival-campaign-band"
        aria-labelledby="festival-campaign-heading"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Kicker>{campaignText(locale, campaign.kicker)}</Kicker>
              <span className="rounded-full border border-gold/60 bg-chip px-2.5 py-1 text-[11px] font-semibold tracking-wide text-maroon">
                {remaining}
              </span>
            </div>
            <h2
              id="festival-campaign-heading"
              className="font-display mt-3 max-w-xl text-[1.85rem] leading-tight text-maroon md:text-[2.35rem]"
            >
              {campaignText(locale, campaign.headline)}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-body md:text-base">
              {campaignText(locale, campaign.supporting)}
            </p>
            <p className="mt-3 text-sm text-muted">
              <span className="font-semibold text-maroon">{name}</span>
              <span> · {date}</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={campaign.shopHref} className="btn-orange">
                {campaignText(locale, campaign.shopCta)} →
              </Link>
              <Link href={campaign.festivalHref} className="btn-outline-gold">
                {campaignText(locale, campaign.viewFestivalCta)}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.35rem] border border-gold/55 bg-paper shadow-[0_16px_36px_rgba(74,15,29,0.08)]">
            <div className="relative aspect-[4/3] bg-blush">
              <Image
                src={campaign.image}
                alt={name}
                fill
                sizes="(max-width: 768px) 90vw, 380px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12">
        <SectionTitle
          kicker={locale === "te" ? "కొనుగోలు" : "Shop"}
          title={campaignText(locale, campaign.kitsTitle)}
          action={
            <Link href={campaign.shopHref} className="text-sm link-brand">
              {campaignText(locale, campaign.viewAllKits)} →
            </Link>
          }
        />
        {featured.length ? (
          <div className="festival-kits-scroll">
            {featured.map((product) => (
              <FestivalKitCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="card-temple p-6 text-sm text-muted">
            {locale === "te"
              ? "ఈ పండుగ కిట్‌లు ఈ ప్రాంతంలో ఇంకా జాబితా కాలేదు. కిట్‌ల పేజీ చూడండి, లేదా ప్రదేశం మార్చండి."
              : "Festival kits for this region are not listed yet. Browse all kits, or try another location."}
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12">
        <SectionTitle
          kicker={locale === "te" ? "పూజ" : "Pooja"}
          title={campaignText(locale, campaign.poojasTitle)}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href={campaign.poojaHref} className="card-temple px-5 py-6 text-center">
            <p className="font-display text-xl text-maroon">
              {campaignText(locale, campaign.bookPoojaCta)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {locale === "te" ? "విధి, సామగ్రి, బుకింగ్" : "Vidhi, samagri, and booking"}
            </p>
          </Link>
          <Link href={campaign.priestHref} className="card-temple px-5 py-6 text-center">
            <p className="font-display text-xl text-maroon">
              {campaignText(locale, campaign.findPriestCta)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {locale === "te" ? "త్వరలో" : "Coming soon"}
            </p>
          </Link>
          <Link href={campaign.vidhiHref} className="card-temple px-5 py-6 text-center">
            <p className="font-display text-xl text-maroon">
              {campaignText(locale, campaign.vidhiCta)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {locale === "te" ? "ప్రక్రియ మరియు అర్థం" : "Process and meaning"}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
