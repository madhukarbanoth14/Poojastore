"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  ganeshHomamItems,
  ganeshPoojaItems,
  ganeshSelectedKeys,
} from "@/lib/ganesh-samagri";
import { formatMoney } from "@/lib/format";
import type { Locale, Product } from "@/lib/types";

export type KitShopLine = {
  key: string;
  name: string;
  quantity: number;
  pack?: string | null;
  optional?: boolean;
};

export type KitShopTab = {
  id: string;
  label: string;
  product: Product | null;
  imageSrc: string;
  imageAlt: string;
  steps: string[];
  about?: string;
  speciality?: string;
  processDetail?: string[];
  fallbackItems?: KitShopLine[];
};

function linesFromSlug(slug: string, locale: Locale): KitShopLine[] {
  if (slug === "ganesh-chaturthi-pooja-samagri") {
    return ganeshPoojaItems.map((item) => ({
      key: item.slug,
      name: locale === "te" ? item.nameTe : item.nameEn,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      pack: locale === "te" ? item.packTe : item.packEn,
      optional: item.optional,
    }));
  }
  if (slug === "ganesh-puja-homam-samagri") {
    return ganeshHomamItems.map((item) => ({
      key: item.slug,
      name: locale === "te" ? item.nameTe : item.nameEn,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      pack: locale === "te" ? item.packTe : item.packEn,
      optional: item.optional,
    }));
  }
  return [];
}

function linesFromProduct(product: Product | null, locale: Locale, slug: string): KitShopLine[] {
  if (product?.selectableItems?.length) {
    return product.selectableItems.map((item) => ({
      key: item.key,
      name: item.name,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      pack: item.pack,
      optional: item.optional,
    }));
  }
  if (product?.kitItems?.length) {
    return product.kitItems.map((item) => ({
      key: item.id,
      name: item.name,
      quantity: item.quantity > 0 ? item.quantity : 1,
      optional: item.isOptional,
    }));
  }
  return linesFromSlug(product?.slug ?? slug, locale);
}

function qtyLabel(line: KitShopLine) {
  if (line.pack) return line.pack;
  return `×${line.quantity}`;
}

export function KitShop({
  locale,
  tabs,
  initialTabId,
}: {
  locale: Locale;
  tabs: KitShopTab[];
  initialTabId?: string;
}) {
  const start = tabs.find((item) => item.id === initialTabId)?.id ?? tabs[0]?.id ?? "";
  const [tabId, setTabId] = useState(start);
  const [chosenOptional, setChosenOptional] = useState<Set<string>>(new Set());
  const tab = tabs.find((item) => item.id === tabId) ?? tabs[0] ?? null;

  const items = useMemo(() => {
    if (!tab) return [];
    const fromProduct = linesFromProduct(tab.product, locale, tab.id);
    return fromProduct.length ? fromProduct : (tab.fallbackItems ?? []);
  }, [tab, locale]);

  const required = items.filter((item) => !item.optional);
  const optional = items.filter((item) => item.optional);
  const selectedKeys = useMemo(() => {
    if (!tab) return [];
    if ((tab.product?.slug ?? tab.id) === "ganesh-chaturthi-pooja-samagri") {
      return ganeshSelectedKeys(ganeshPoojaItems, chosenOptional);
    }
    if ((tab.product?.slug ?? tab.id) === "ganesh-puja-homam-samagri") {
      return ganeshSelectedKeys(ganeshHomamItems, chosenOptional);
    }
    return items
      .filter((item) => !item.optional || chosenOptional.has(item.key))
      .map((item) => item.key);
  }, [tab, items, chosenOptional]);

  function toggleOptional(key: string) {
    setChosenOptional((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function switchTab(id: string) {
    setTabId(id);
    setChosenOptional(new Set());
  }

  const price = tab?.product
    ? formatMoney(tab.product.priceMinor, tab.product.currency)
    : null;

  if (!tab) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {tabs.length > 1 ? (
        <div className="mb-6 flex rounded-2xl border border-divider bg-chip p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchTab(item.id)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold tracking-wide ${
                item.id === tab.id ? "bg-maroon text-cream" : "text-maroon"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-8">
          <div className="frame-gold">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-blush md:aspect-[16/10] md:max-h-80">
              <Image
                src={tab.imageSrc}
                alt={tab.imageAlt}
                fill
                unoptimized={tab.imageSrc.startsWith("http")}
                className="object-cover"
              />
            </div>
          </div>

          {tab.about || tab.speciality || tab.steps.length || tab.processDetail?.length ? (
            <div className="space-y-8">
              {tab.about ? (
                <section>
                  <h2 className="font-display text-2xl text-maroon">
                    {locale === "te" ? "గురించి" : "About"}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-body">{tab.about}</p>
                </section>
              ) : null}

              {tab.speciality ? (
                <section>
                  <h2 className="font-display text-2xl text-maroon">
                    {locale === "te" ? "ప్రత్యేకత" : "Speciality"}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-body">{tab.speciality}</p>
                </section>
              ) : null}

              {tab.steps.length ? (
                <section>
                  <h2 className="font-display text-2xl text-maroon">
                    {locale === "te" ? "పూజా విధి" : "Pooja process"}
                  </h2>
                  <ol className="mt-4 space-y-3">
                    {tab.steps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-body">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-maroon text-xs font-bold text-cream">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {tab.processDetail?.length ? (
                    <div className="mt-5 space-y-3">
                      {tab.processDetail.map((para) => (
                        <p key={para.slice(0, 48)} className="text-sm leading-relaxed text-body">
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="card-temple p-5 md:p-6 lg:sticky lg:top-24">
          {price ? (
            <p className="font-display text-3xl price">{price}</p>
          ) : (
            <p className="text-sm text-muted">
              {locale === "te" ? "కిట్ ధర త్వరలో" : "Kit price loads with the catalog."}
            </p>
          )}
          <p className="mt-1 text-sm text-muted">
            {required.length
              ? locale === "te"
                ? `${required.length} వస్తువులు కిట్‌లో ఉన్నాయి`
                : `${required.length} items in this kit`
              : locale === "te"
                ? "సామగ్రి జాబితా"
                : "Samagri list"}
          </p>
          <div className="mt-4">
            {tab.product ? (
              <AddToCartButton
                productId={tab.product.id}
                selectedItemKeys={selectedKeys}
                className="w-full justify-center"
                label={
                  locale === "te"
                    ? `కార్ట్‌లో చేర్చండి · ${selectedKeys.length}`
                    : `Add to cart · ${selectedKeys.length} items`
                }
              />
            ) : (
              <p className="text-sm text-muted">
                {locale === "te"
                  ? "కిట్ జోడించడానికి API అవసరం."
                  : "Start the API to add this kit to cart."}
              </p>
            )}
          </div>

          <h3 className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
            {locale === "te" ? "వస్తువులు · పరిమాణం" : "Items · quantity"}
          </h3>
          <ul className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {required.map((item) => (
              <li
                key={item.key}
                className="flex items-start justify-between gap-3 rounded-xl bg-chip/70 px-3 py-2 text-sm"
              >
                <span className="min-w-0 leading-snug">{item.name}</span>
                <span className="shrink-0 tabular-nums text-muted">{qtyLabel(item)}</span>
              </li>
            ))}
          </ul>

          {optional.length ? (
            <>
              <h3 className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
                {locale === "te" ? "ఐచ్ఛికం ఎంచుకోండి" : "Optional extras"}
              </h3>
              <ul className="mt-2 space-y-1">
                {optional.map((item) => (
                  <li key={item.key}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-2 text-sm hover:bg-chip">
                      <input
                        type="checkbox"
                        className="mt-1 accent-[var(--maroon)]"
                        checked={chosenOptional.has(item.key)}
                        onChange={() => toggleOptional(item.key)}
                      />
                      <span className="min-w-0 flex-1 leading-snug">{item.name}</span>
                      <span className="shrink-0 tabular-nums text-muted">{qtyLabel(item)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>

      <div className="mt-10 rounded-2xl border border-divider bg-paper px-5 py-5 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
            {locale === "te" ? "పూజారి" : "Need a priest?"}
          </p>
          <p className="mt-1 font-display text-xl text-maroon">
            {locale === "te"
              ? "ఈ పూజకు ధృవీకరించిన పూజారిని బుక్ చేయండి"
              : "Book a verified poojari for this pooja"}
          </p>
        </div>
        <Link href="/priests" className="btn-outline mt-4 inline-flex justify-center md:mt-0">
          {locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book priest"}
        </Link>
      </div>
    </div>
  );
}
