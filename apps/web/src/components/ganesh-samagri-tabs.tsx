"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  ganeshHomamItems,
  ganeshLineLabel,
  ganeshPoojaItems,
  ganeshSelectedKeys,
  type GaneshSamagriLine,
} from "@/lib/ganesh-samagri";
import type { Locale, Product } from "@/lib/types";

export function GaneshSamagriTabs({
  locale,
  poojaKitHref,
  homamKitHref,
  poojaProduct,
  homamProduct,
}: {
  locale: Locale;
  poojaKitHref: string;
  homamKitHref: string;
  poojaProduct?: Product | null;
  homamProduct?: Product | null;
}) {
  const [tab, setTab] = useState<"pooja" | "homam">("pooja");
  const [chosenOptional, setChosenOptional] = useState<Set<string>>(new Set());
  const items = tab === "pooja" ? ganeshPoojaItems : ganeshHomamItems;
  const required = items.filter((item) => !item.optional);
  const optional = items.filter((item) => item.optional);
  const product = tab === "pooja" ? poojaProduct : homamProduct;
  const kitHref = tab === "pooja" ? poojaKitHref : homamKitHref;
  const title =
    tab === "pooja"
      ? locale === "te"
        ? "వినాయక చవితి పూజా సామగ్రి"
        : "Vinayaka Chavithi Pooja Samagri"
      : locale === "te"
        ? "గణేష్ పూజ హోమం సామగ్రి"
        : "Ganesh Homam Samagri";
  const selectedKeys = useMemo(
    () => ganeshSelectedKeys(items, chosenOptional),
    [items, chosenOptional],
  );

  function toggleOptional(slug: string) {
    setChosenOptional((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-2xl border border-divider bg-chip p-1">
        <TabButton
          active={tab === "pooja"}
          onClick={() => setTab("pooja")}
          label={locale === "te" ? "పూజా సామగ్రి" : "Pooja items"}
        />
        <TabButton
          active={tab === "homam"}
          onClick={() => setTab("homam")}
          label={locale === "te" ? "హోమం" : "Homam"}
        />
      </div>
      <div className="card-temple p-5">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
          {locale === "te" ? "అవసరమైన వస్తువులు" : "Included in kit"}
        </p>
        <ul className="mt-3 space-y-2.5">
          {required.map((item) => (
            <GaneshItemRow key={`${tab}-${item.slug}`} item={item} locale={locale} />
          ))}
        </ul>
        {optional.length ? (
          <>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
              {locale === "te" ? "ఐచ్ఛిక వస్తువులు ఎంచుకోండి" : "Choose optional items"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {locale === "te"
                ? "ఇవి కిట్‌లో ఉండవు — కావాలంటే టిక్ చేయండి."
                : "Not packed unless you select them."}
            </p>
            <ul className="mt-3 space-y-1">
              {optional.map((item) => (
                <li key={`${tab}-opt-${item.slug}`}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm text-body hover:bg-chip">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--maroon)]"
                      checked={chosenOptional.has(item.slug)}
                      onChange={() => toggleOptional(item.slug)}
                    />
                    <span>
                      {ganeshLineLabel(item, locale)}
                      <span className="ml-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                        {locale === "te" ? "ఐచ్ఛికం" : "Optional"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {product ? (
            <AddToCartButton
              productId={product.id}
              selectedItemKeys={selectedKeys}
              label={
                locale === "te"
                  ? `కిట్ కొనండి · ${selectedKeys.length} వస్తువులు`
                  : `Add to cart · ${selectedKeys.length} items`
              }
            />
          ) : (
            <Link href={kitHref} className="btn-orange inline-flex">
              {locale === "te" ? "కిట్ కొనండి" : "Buy kit"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold tracking-wide ${
        active ? "bg-maroon text-cream" : "text-maroon"
      }`}
    >
      {label}
    </button>
  );
}

function GaneshItemRow({
  item,
  locale,
}: {
  item: GaneshSamagriLine;
  locale: Locale;
}) {
  return (
    <li className="flex items-start justify-between gap-3 text-sm text-body">
      <span>{ganeshLineLabel(item, locale)}</span>
    </li>
  );
}
