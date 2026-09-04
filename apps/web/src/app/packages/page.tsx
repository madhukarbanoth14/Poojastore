import Link from "next/link";
import { EmptyNote, PageHero } from "@/components/ui";
import { listPackages } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { getCity, getLocale } from "@/lib/locale";
import { marketForCity } from "@/lib/location";

export const metadata = { title: "Pooja packages" };

export default async function PackagesPage() {
  const locale = await getLocale();
  const packages = await listPackages(locale, marketForCity(await getCity()));
  return (
    <>
      <PageHero
        kicker="One payment"
        title="Pooja packages"
        subtitle="Kit, priest, and prasad together — with a package discount."
      />
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10">
        {packages.length ? (
          packages.map((pkg) => (
            <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="card-temple relative block p-5">
              {pkg.packageDiscountMinor > 0 ? (
                <span className="absolute right-4 top-4 rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold text-cream">
                  SAVE {formatMoney(pkg.packageDiscountMinor, pkg.currency)}
                </span>
              ) : null}
              <h2 className="font-display pr-24 text-xl font-semibold">{pkg.title}</h2>
              <p className="mt-1 text-sm text-muted">{pkg.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pkg.allowsKit ? <span className="chip-ps">Kit</span> : null}
                {pkg.allowsPriest ? <span className="chip-ps">Priest</span> : null}
                {pkg.allowsPrasad ? <span className="chip-ps">Prasad</span> : null}
              </div>
            </Link>
          ))
        ) : (
          <EmptyNote>Packages load from `GET /packages`.</EmptyNote>
        )}
      </div>
    </>
  );
}
