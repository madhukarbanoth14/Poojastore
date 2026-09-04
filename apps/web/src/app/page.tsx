import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/ui";
import { listFestivalKits, listKits, listPackages, listPriests, getTodayPanchang } from "@/lib/api";
import { serviceImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import { formatMoney, initials } from "@/lib/format";
import { getLocale } from "@/lib/locale";

const STEPS = [
  {
    n: "01",
    label: "Festival kit",
    title: "Complete Pooja kits",
    desc: "Curated kits for every festival and family function — nothing missing, nothing extra.",
  },
  {
    n: "02",
    label: "Poojari",
    title: "Verified poojaris",
    desc: "Book experienced, background-verified priests for home visits or online consultations.",
  },
  {
    n: "03",
    label: "Delivery",
    title: "Same-day delivery",
    desc: "Fresh flowers, agarbatti and ritual items from nearby pooja stores, delivered fast.",
  },
  {
    n: "04",
    label: "Calendar",
    title: "Never miss a festival",
    desc: "Panchang, muhurats, and reminders for every auspicious date — right on time.",
  },
];

const ASSURANCES = [
  "Verified priests",
  "Same-day delivery",
  "Secure payments",
  "India · USA · Canada",
];

export default async function HomePage() {
  const locale = await getLocale();
  const [kits, festivalKits, priests, packages, panchang] = await Promise.all([
    listKits(locale),
    listFestivalKits(locale),
    listPriests(locale),
    listPackages(locale),
    getTodayPanchang(locale),
  ]);
  const featured = [...festivalKits, ...kits].filter(
    (product, index, list) => list.findIndex((item) => item.id === product.id) === index,
  );
  const featuredPriests = priests.slice(0, 3);
  const festivalIds = new Set(festivalKits.map((kit) => kit.id));

  return (
    <div className="mandala-fade">
      <HomeHero locale={locale} panchang={panchang} />

      <div className="border-y border-divider bg-paper/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-4 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
          {ASSURANCES.map((item, i) => (
            <span key={item} className="flex items-center gap-8">
              {i > 0 ? <span className="hidden h-1 w-1 rounded-full bg-orange sm:block" /> : null}
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16">
        <SectionTitle
          kicker="Shop"
          title={t(locale, "featuredKits")}
          action={
            <div className="flex gap-4">
              <Link href="/poojas" className="text-sm link-brand">
                {t(locale, "navPoojas")}
              </Link>
              <Link href="/kits" className="text-sm link-brand">
                {t(locale, "viewAll")}
              </Link>
            </div>
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
            Kits will appear here when the API is running. Start `apps/api` or point{" "}
            <code>API_BASE_URL</code> at staging.
          </p>
        )}

        <div className="mt-20">
          <SectionTitle kicker="Seva" title={t(locale, "howTitle")} />
          <div className="grid gap-5 md:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.label} className="card-temple p-6">
                <p className="font-display text-3xl text-gold">{step.n}</p>
                <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] text-maroon uppercase">
                  {step.label}
                </p>
                <h3 className="mt-2 font-display text-xl text-maroon">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              kicker="Priests"
              title="Book a verified poojari"
              action={
                <Link href="/priests" className="text-sm link-brand">
                  {t(locale, "viewAll")}
                </Link>
              }
            />
            <div className="space-y-3">
              {featuredPriests.length ? (
                featuredPriests.map((p) => (
                  <Link
                    key={p.id}
                    href={`/priests/${p.slug}`}
                    className="card-temple flex items-center gap-4 p-4"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-orange font-semibold text-maroon">
                      {initials(p.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg">{p.fullName}</p>
                      <p className="truncate text-sm text-muted">
                        {p.city} · {p.yearsExperience} yrs · {p.specializations.slice(0, 2).join(", ")}
                      </p>
                    </div>
                    <p className="text-sm price">{formatMoney(p.basePriceMinor, p.currency)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted">Priest listings load from the live catalog.</p>
              )}
            </div>
          </div>
          <div>
            <SectionTitle
              kicker="Bundles"
              title="Pooja packages"
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
                <div className="card-temple overflow-hidden">
                  <Image
                    src={serviceImage("packages")}
                    alt=""
                    width={800}
                    height={320}
                    className="h-40 w-full object-cover"
                  />
                  <p className="p-5 text-sm text-muted">
                    Combine kit, priest, and prasad in one booking.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
