import Image from "next/image";
import Link from "next/link";
import { kitImage } from "@/lib/catalog-images";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  badge,
}: {
  product: Product;
  badge?: string;
}) {
  const src = product.imageUrl || kitImage(product.slug, product.name);
  return (
    <Link href={`/kits/${product.slug}`} className="card-temple group overflow-hidden">
      <div className="relative h-48 bg-blush">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={src.startsWith("http")}
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon/35 via-transparent to-transparent" />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-orange px-2.5 py-1 text-[10px] font-semibold tracking-wide text-cream uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-snug text-maroon">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-lg price">
            {formatMoney(product.priceMinor, product.currency)}
            {product.mrpMinor && product.mrpMinor > product.priceMinor ? (
              <span className="ml-2 text-sm font-normal text-muted line-through">
                {formatMoney(product.mrpMinor, product.currency)}
              </span>
            ) : null}
          </p>
          <span className="text-[11px] font-semibold tracking-[0.12em] text-orange uppercase">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
