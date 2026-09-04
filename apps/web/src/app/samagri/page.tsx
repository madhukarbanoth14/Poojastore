import { ProductCard } from "@/components/product-card";
import { EmptyNote, PageHero, PrimaryButton } from "@/components/ui";
import { listSamagri } from "@/lib/api";
import { getLocale } from "@/lib/locale";
import { loc, poojaGuideCopy } from "@/lib/pooja-guides";

export const metadata = { title: "Pooja Samagri" };

export default async function SamagriPage() {
  const locale = await getLocale();
  const items = await listSamagri(locale);
  const kits = items.filter((p) => p.type === "PUJA_KIT");
  const loose = items.filter((p) => p.type !== "PUJA_KIT");
  return (
    <>
      <PageHero
        kicker="Everyday worship"
        title="Pooja samagri"
        subtitle="Start with the basic kit, then add extras for a deity or festival — or shop individual items."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
        <div className="card-temple flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-body">{loc(locale, poojaGuideCopy.subtitle)}</p>
          <PrimaryButton href="/poojas">{loc(locale, poojaGuideCopy.browse)}</PrimaryButton>
        </div>
        {!items.length ? (
          <EmptyNote>Samagri catalog loads from the API (`GET /products?catalog=pooja-samagri`).</EmptyNote>
        ) : null}
        {kits.length ? (
          <section>
            <h2 className="font-display mb-4 text-2xl font-semibold">Complete kits</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {kits.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
        {loose.length ? (
          <section>
            <h2 className="font-display mb-4 text-2xl font-semibold">Individual items</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loose.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
