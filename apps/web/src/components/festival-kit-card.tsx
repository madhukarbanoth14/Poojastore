import Image from "next/image";
import Link from "next/link";
import { kitImage } from "@/lib/catalog-images";
import { t } from "@/lib/copy";
import { formatMoney } from "@/lib/format";
import type { Locale, Product } from "@/lib/types";

export function FestivalKitCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const src = product.imageUrl || kitImage(product.slug, product.name);
  const href = `/kits/${product.slug}`;

  return (
    <article className="card-temple flex min-w-[16.5rem] shrink-0 flex-col overflow-hidden lg:min-w-0">
      <Link href={href} className="block">
        <div className="relative h-44 bg-blush">
          <Image
            src={src}
            alt={product.name}
            fill
            unoptimized={src.startsWith("http")}
            className="object-cover"
            sizes="(max-width: 1024px) 70vw, 25vw"
          />
        </div>
        <div className="px-4 pt-4">
          <h3 className="font-display text-xl leading-snug text-maroon">{product.name}</h3>
          <p className="mt-2 text-lg price">
            {formatMoney(product.priceMinor, product.currency)}
            {product.mrpMinor && product.mrpMinor > product.priceMinor ? (
              <span className="ml-2 text-sm font-normal text-muted line-through">
                {formatMoney(product.mrpMinor, product.currency)}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs font-medium text-muted">
            {locale === "te" ? "అందుబాటులో ఉంది" : "Available"}
          </p>
        </div>
      </Link>
      <div className="mt-auto px-4 pb-4 pt-3">
        <Link href={href} className="btn-orange btn-orange-sm w-full justify-center">
          {t(locale, "addToCart")}
        </Link>
      </div>
    </article>
  );
}
