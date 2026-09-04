import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { festivalImage } from "@/lib/catalog-images";
import { upcomingFestivals } from "@/lib/festivals";
import { daysUntil } from "@/lib/format";
import { getLocale } from "@/lib/locale";

export const metadata = { title: "Festivals" };

export default async function FestivalsPage() {
  const locale = await getLocale();
  return (
    <>
      <PageHero
        kicker="Never miss a date"
        title="Upcoming festivals"
        subtitle="Guides, required items, and complete kits for the next sacred days on the Hindu calendar."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-3">
        {upcomingFestivals.map((fest) => (
          <Link key={fest.id} href={`/festivals/${fest.id}`} className="card-temple overflow-hidden">
            <div className="relative h-48">
              <Image src={festivalImage(fest.id)} alt="" fill className="object-cover" />
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
        ))}
      </div>
    </>
  );
}
