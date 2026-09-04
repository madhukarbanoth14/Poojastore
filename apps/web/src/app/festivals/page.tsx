import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { festivalImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import { upcomingFromToday, festivalShopHref } from "@/lib/festivals";
import { daysUntil } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export const metadata = {
  title: "Upcoming festivals",
  description: "Festival dates, pooja vidhi, and kits for the Hindu calendar year.",
};

export default async function FestivalsPage() {
  const locale = await getLocale();
  const festivals = upcomingFromToday(12);
  return (
    <>
      <PageHero
        kicker={t(locale, "upcoming")}
        title={locale === "te" ? "రాబోయే పండుగలు" : "Upcoming festivals"}
        subtitle={
          locale === "te"
            ? "విధి, సామగ్రి, కిట్‌లు — తేదీలు క్యాలెండర్ కంటెంట్. ప్రాంతీయ ఆచారం మారవచ్చు."
            : "Meaning, vidhi, and kits. Dates are published festival content; local custom may vary."
        }
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-3">
        {festivals.length ? (
          festivals.map((fest) => {
            const href = `/festivals/${fest.id}`;
            return (
              <article key={fest.id} className="card-temple overflow-hidden">
                <Link href={href} className="block">
                  <div className="relative h-48">
                    <Image
                      src={festivalImage(fest.id)}
                      alt={locale === "te" ? fest.nameTe : fest.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold text-cream">
                      {daysUntil(new Date(fest.target))}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-2xl font-semibold">
                      {locale === "te" ? fest.nameTe : fest.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{locale === "te" ? fest.dateTe : fest.date}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-body">{fest.description}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap gap-2 px-5 pb-5">
                  <Link href={href} className="btn-orange btn-orange-sm">
                    {locale === "te" ? "పండుగ చూడండి" : "View festival"}
                  </Link>
                  <Link href="/priests" className="text-sm font-semibold text-maroon">
                    {t(locale, "bookPooja")}
                  </Link>
                  {fest.kitTabs.length ? (
                    <Link href={festivalShopHref(fest)} className="text-sm font-semibold text-maroon">
                      {locale === "te" ? "కిట్ కొనండి" : "Shop kit"}
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <p className="card-temple col-span-full p-8 text-sm text-muted">
            {locale === "te" ? "రాబోయే పండుగలు త్వరలో చూపిస్తాం." : "No upcoming festivals are listed right now."}
          </p>
        )}
      </div>
    </>
  );
}
