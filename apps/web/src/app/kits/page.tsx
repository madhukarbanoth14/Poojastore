import { ProductCard } from "@/components/product-card";
import { EmptyNote, PageHero, PrimaryButton, SectionTitle } from "@/components/ui";
import { listFestivalKits, listKits } from "@/lib/api";
import { getLocale } from "@/lib/locale";
import { BASIC_KIT_SLUG, loc, poojaGuideCopy } from "@/lib/pooja-guides";

export const metadata = { title: "Pooja Kits" };

export default async function KitsPage() {
  const locale = await getLocale();
  const [allKits, samagriKits] = await Promise.all([
    listKits(locale),
    listFestivalKits(locale),
  ]);
  const samagriIds = new Set(samagriKits.map((kit) => kit.id));
  const basicKit = samagriKits.find((kit) => kit.slug === BASIC_KIT_SLUG);
  const extraKits = samagriKits.filter((kit) => kit.slug !== BASIC_KIT_SLUG);
  const occasionKits = allKits.filter((kit) => !samagriIds.has(kit.id));
  const hasKits = samagriKits.length + occasionKits.length > 0;

  return (
    <>
      <PageHero
        kicker="Shop"
        title="Complete Pooja kits"
        subtitle="Basic everyday kit, then deity or festival extras — so turmeric and kumkum are not repeated in every box."
      />
      <div className="mx-auto max-w-6xl space-y-14 px-5 py-12">
        <div className="flex flex-wrap gap-3">
          <PrimaryButton href="/poojas">{loc(locale, poojaGuideCopy.browse)}</PrimaryButton>
        </div>
        {!hasKits ? (
          <EmptyNote>
            No kits yet. Start the API (`cd apps/api && npm run start:dev`) or set API_BASE_URL to
            staging.
          </EmptyNote>
        ) : null}

        {basicKit ? (
          <section>
            <SectionTitle kicker="Start here" title="Basic Pooja kit" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard product={basicKit} badge="Basic" />
            </div>
          </section>
        ) : null}

        {extraKits.length ? (
          <section>
            <SectionTitle kicker="Add extras" title="Deity, festival, and vratam kits" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {extraKits.map((kit) => (
                <ProductCard key={kit.id} product={kit} badge="Extras" />
              ))}
            </div>
          </section>
        ) : null}

        {occasionKits.length ? (
          <section>
            <SectionTitle kicker="Occasions" title="Home and function kits" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {occasionKits.map((kit) => (
                <ProductCard key={kit.id} product={kit} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
