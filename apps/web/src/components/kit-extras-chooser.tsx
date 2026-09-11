"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { samagriImage } from "@/lib/catalog-images";
import { formatMoney } from "@/lib/format";
import { formatKitQty } from "@/lib/kit-item-taxonomy";
import type { KitOptionalExtra } from "@/lib/kit-optional-extras";
import { kitRequiredKeys } from "@/lib/kit-optional-extras";
import type { Locale, Product } from "@/lib/types";

export function KitExtrasChooser({
  locale,
  product,
  extras,
  intent,
  backHref,
}: {
  locale: Locale;
  product: Product;
  extras: KitOptionalExtra[];
  intent: "buy" | "cart";
  backHref: string;
}) {
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const kitPrice = product.priceMinor;
  const extraTotal = extras
    .filter((item) => chosen.has(item.key))
    .reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const total = kitPrice + extraTotal;
  const requiredKeys = useMemo(() => kitRequiredKeys(product), [product]);
  const selectedItemKeys = chosen.size ? [...requiredKeys, ...chosen] : undefined;
  const checkout = intent === "buy";

  function toggle(key: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 pb-36 lg:pb-12">
      <Link href={backHref} className="text-sm font-semibold text-maroon underline decoration-gold underline-offset-4">
        {locale === "te" ? "← కిట్‌కు తిరిగి" : "← Back to kit"}
      </Link>

      <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-maroon uppercase">
        {locale === "te" ? "దశ 2 / 2" : "Step 2 of 2"}
      </p>
      <h1 className="font-display mt-2 text-3xl text-maroon md:text-4xl">
        {locale === "te" ? "ఐచ్ఛిక వస్తువులు" : "Optional extras"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-body">
        {locale === "te"
          ? "కావాలంటే టిక్ చేయండి. ఏదీ ఎంచుకోకపోతే కిట్ ధర అలాగే ఉంటుంది."
          : "Add anything you need. Skip this step to keep the same kit price."}
      </p>

      <div className="mt-5 rounded-2xl border border-divider bg-paper px-4 py-3">
        <p className="text-sm font-semibold text-maroon">{product.name}</p>
        <p className="mt-1 text-sm text-muted">
          {locale === "te" ? "కిట్ ధర" : "Kit price"}{" "}
          <span className="price font-semibold">{formatMoney(kitPrice, product.currency)}</span>
        </p>
      </div>

      {extras.length ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {extras.map((item) => {
            const selected = chosen.has(item.key);
            const src = samagriImage(item.key, item.name);
            const qty = formatKitQty(item.pack, item.quantity, locale);
            return (
              <li key={item.key}>
                <label
                  className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
                    selected ? "border-gold bg-blush" : "border-divider bg-paper"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--maroon)]"
                    checked={selected}
                    onChange={() => toggle(item.key)}
                    aria-label={locale === "te" ? `${item.name} ఐచ్ఛికం` : `Add ${item.name}`}
                  />
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#fff8ef]">
                    {src ? (
                      <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-maroon">{item.name}</span>
                    {qty ? <span className="mt-0.5 block text-xs text-muted">{qty}</span> : null}
                    <span className="mt-1 block text-sm font-semibold price">
                      +{formatMoney(item.priceMinor * item.quantity, product.currency)}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">
          {locale === "te"
            ? "ఈ కిట్‌కు అదనపు వస్తువులు లేవు."
            : "This kit has no optional extras."}
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-divider bg-paper px-5 py-5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted">{locale === "te" ? "కిట్" : "Kit"}</span>
          <span>{formatMoney(kitPrice, product.currency)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted">
            {locale === "te"
              ? `ఐచ్ఛికం (${chosen.size})`
              : `Extras (${chosen.size})`}
          </span>
          <span>{formatMoney(extraTotal, product.currency)}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-divider pt-3">
          <span className="font-semibold text-maroon">{locale === "te" ? "మొత్తం" : "Total"}</span>
          <span className="text-2xl font-semibold price">{formatMoney(total, product.currency)}</span>
        </div>
        <AddToCartButton
          productId={product.id}
          selectedItemKeys={selectedItemKeys}
          buyNow={checkout}
          redirectTo={checkout ? "/checkout" : "/cart"}
          className="mt-5 w-full justify-center"
          label={
            checkout
              ? locale === "te"
                ? "చెల్లింపుకు వెళ్ళండి"
                : "Continue to checkout"
              : locale === "te"
                ? "కార్ట్‌లో చేర్చండి"
                : "Add to cart"
          }
        />
      </div>
    </div>
  );
}
