import Link from "next/link";
import { campaignText, type ActiveFestivalCampaign } from "@/lib/festival-campaign";
import type { Locale } from "@/lib/types";

export function FestivalCommerceLinks({
  locale,
  campaign,
}: {
  locale: Locale;
  campaign: ActiveFestivalCampaign;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={campaign.shopHref} className="btn-orange">
        {campaignText(locale, campaign.shopCta)}
      </Link>
      <Link href={campaign.priestHref} className="btn-outline-gold">
        {campaignText(locale, campaign.bookPoojaCta)}
      </Link>
      <Link href={campaign.vidhiHref} className="text-sm font-semibold text-maroon">
        {campaignText(locale, campaign.vidhiCta)}
      </Link>
    </div>
  );
}
