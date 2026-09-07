"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ganeshKitItemsBySlug, ganeshSelectedKeys } from "@/lib/ganesh-samagri";
import { samagriImage } from "@/lib/catalog-images";
import { formatMoney } from "@/lib/format";
import {
  formatKitQty,
  ganeshKitBlurb,
  ganeshKitHeadline,
  ganeshKitSlug,
  ganeshPlaceCopy,
  kitCategoryLabel,
  kitItemCategory,
  kitItemRole,
  mergeKitOptionalOfferings,
  parseGaneshKitSlug,
  KIT_CATEGORY_ORDER,
  KIT_OPTIONAL_OFFERINGS,
  type GaneshKitPlace,
  type GaneshKitSize,
  type KitItemCategoryId,
} from "@/lib/kit-item-taxonomy";
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

const PLACES: GaneshKitPlace[] = ["home", "office", "mandapam"];
const SIZES: GaneshKitSize[] = ["mini", "mega"];

function linesFromSlug(slug: string, locale: Locale): KitShopLine[] {
  const source = ganeshKitItemsBySlug[slug];
  if (!source) return [];
  return source.map((item) => ({
    key: item.slug,
    name: locale === "te" ? item.nameTe : item.nameEn,
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    pack: locale === "te" ? item.packTe : item.packEn,
    optional: item.optional,
  }));
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
  const [category, setCategory] = useState<"all" | KitItemCategoryId>("all");
  const [preview, setPreview] = useState<KitShopLine | null>(null);
  const [ctaInView, setCtaInView] = useState(true);
  const [gridReady, setGridReady] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tab = tabs.find((item) => item.id === tabId) ?? tabs[0] ?? null;
  const ganesh = tab ? parseGaneshKitSlug(tab.id) : null;
  const ganeshFamily = tabs.every((item) => parseGaneshKitSlug(item.id));

  const items = useMemo(() => {
    if (!tab) return [];
    const fromProduct = linesFromProduct(tab.product, locale, tab.id);
    const base = fromProduct.length ? fromProduct : (tab.fallbackItems ?? []);
    return mergeKitOptionalOfferings(
      base,
      KIT_OPTIONAL_OFFERINGS.map((extra) => ({
        key: extra.key,
        name: locale === "te" ? extra.nameTe : extra.nameEn,
        quantity: 1,
        optional: true,
      })),
    );
  }, [tab, locale]);

  const required = items.filter((item) => !item.optional);
  const optionalItems = items.filter((item) => item.optional);
  const includedCount = required.length;
  const availableCategories = useMemo(() => {
    const present = new Set(required.map((item) => kitItemCategory(item.key)));
    return KIT_CATEGORY_ORDER.filter((id) => present.has(id));
  }, [required]);

  const visibleItems = useMemo(() => {
    if (category === "all") return required;
    return required.filter((item) => kitItemCategory(item.key) === category);
  }, [required, category]);

  const selectedKeys = useMemo(() => {
    if (!tab) return [];
    const slug = tab.product?.slug ?? tab.id;
    const ganeshItems = ganeshKitItemsBySlug[slug];
    if (ganeshItems) {
      return ganeshSelectedKeys(ganeshItems, chosenOptional);
    }
    return items
      .filter((item) => !item.optional || chosenOptional.has(item.key))
      .map((item) => item.key);
  }, [tab, items, chosenOptional]);

  const isEcoKit = Boolean(ganeshKitItemsBySlug[tab?.id ?? ""] && tab?.id !== "ganesh-puja-homam-samagri");
  const price = tab?.product ? formatMoney(tab.product.priceMinor, tab.product.currency) : null;
  const mrp =
    tab?.product?.mrpMinor && tab.product.mrpMinor > tab.product.priceMinor
      ? formatMoney(tab.product.mrpMinor, tab.product.currency)
      : null;
  const kitName = ganesh
    ? ganeshKitHeadline(ganesh, locale)
    : (tab?.product?.name ?? tab?.label ?? "");
  const blurb = ganesh
    ? ganeshKitBlurb(ganesh.place, locale)
    : tab?.speciality ?? tab?.about ?? "";

  function switchTab(id: string) {
    setTabId(id);
    setChosenOptional(new Set());
    setCategory("all");
    setPreview(null);
    setGridReady(false);
  }

  function toggleOptional(key: string) {
    setChosenOptional((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function scrollToItems() {
    itemsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (gridReady) return;
    const id = window.setTimeout(() => setGridReady(true), 40);
    return () => window.clearTimeout(id);
  }, [tabId, gridReady]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tabId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (preview) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [preview]);

  if (!tab) return null;

  return (
    <div className="kit-shop mx-auto max-w-6xl px-5 py-8 pb-32 lg:pb-10">
      {ganeshFamily && ganesh ? (
        <GaneshVariantSelector
          locale={locale}
          tabs={tabs}
          current={ganesh}
          onSelect={(size, place) => {
            const slug = ganeshKitSlug(size, place);
            if (tabs.some((item) => item.id === slug)) switchTab(slug);
          }}
        />
      ) : tabs.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-divider bg-chip p-1" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === tab.id}
              onClick={() => switchTab(item.id)}
              className={`min-w-[9.5rem] flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold tracking-wide ${
                item.id === tab.id ? "bg-maroon text-cream" : "text-maroon"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="kit-hero">
        <div className="frame-gold">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-blush lg:aspect-[5/4]">
            <Image
              src={tab.imageSrc}
              alt={tab.imageAlt}
              fill
              priority
              unoptimized={tab.imageSrc.startsWith("http")}
              className="object-cover"
            />
          </div>
        </div>

        <div className="kit-hero-copy">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-maroon uppercase">
            {ganesh
              ? locale === "te"
                ? "గణేశ చతుర్థి పూజా కిట్"
                : "Ganesh Chaturthi Pooja Kit"
              : locale === "te"
                ? "పూజా కిట్"
                : "Pooja kit"}
          </p>
          <h2 className="font-display mt-2 text-[1.7rem] leading-tight text-maroon md:text-[2.05rem]">
            {ganesh
              ? locale === "te"
                ? "మీ గణేశ చతుర్థి పూజకు కావాల్సినవన్నీ"
                : "Everything You Need for Your Ganesh Chaturthi Puja"
              : kitName}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-body">
            {ganesh
              ? locale === "te"
                ? "పూర్తి పూజా సామగ్రి — సరైన కొలతలతో, సాంప్రదాయ పూజకు సిద్ధంగా ప్యాక్ చేయబడింది."
                : "Complete puja samagri, thoughtfully measured and packed for a simple and traditional celebration."
              : blurb}
          </p>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {(
              [
                locale === "te" ? "పూర్తి పూజా మూలాలు" : "Complete Puja Essentials",
                locale === "te" ? "సరైన కొలతలు" : "Carefully Measured Quantities",
                isEcoKit
                  ? locale === "te"
                    ? "పర్యావరణ అనుకూల ఎంపికలు"
                    : "Eco-Friendly Options"
                  : locale === "te"
                    ? "ఒకే ప్యాక్‌లో సౌకర్యం"
                    : "Conveniently Packed Together",
                locale === "te" ? "వాడటానికి సిద్ధం" : "Ready-to-Use Kit",
              ] as const
            ).map((text) => (
              <p key={text} className="flex items-center gap-2 text-sm text-body">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-maroon text-[10px] font-bold text-cream" aria-hidden>
                  ✓
                </span>
                {text}
              </p>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {includedCount ? (
              <p className="text-sm font-semibold text-maroon">
                {locale === "te" ? `${includedCount} వస్తువులు` : `${includedCount} Items Included`}
              </p>
            ) : null}
            {ganesh ? (
              <p className="text-sm text-muted">
                {ganesh.size === "mini" ? (locale === "te" ? "మినీ" : "Mini") : locale === "te" ? "మెగా" : "Mega"}
                {" "}
                {ganeshPlaceCopy(ganesh.place, locale).title}
              </p>
            ) : null}
          </div>
          {price ? (
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-semibold tracking-tight price">{price}</p>
              {mrp ? (
                <p className="text-lg text-muted line-through" aria-label={locale === "te" ? "ఎంఆర్‌పి" : "MRP"}>
                  {mrp}
                </p>
              ) : null}
            </div>
          ) : null}

          <div ref={ctaRef} className="mt-5 max-w-md space-y-3">
            {tab.product ? (
              <AddToCartButton
                productId={tab.product.id}
                selectedItemKeys={chosenOptional.size ? selectedKeys : undefined}
                redirectTo="/checkout"
                className="w-full justify-center"
                label={locale === "te" ? "ఇప్పుడే కొనండి" : "Buy Now"}
              />
            ) : (
              <p className="text-sm text-muted">
                {locale === "te"
                  ? "కిట్ జోడించడానికి API అవసరం."
                  : "Start the API to add this kit to cart."}
              </p>
            )}
            <button type="button" onClick={scrollToItems} className="btn-outline-gold w-full justify-center">
              {locale === "te" ? "అన్ని వస్తువులు" : "View All Items"}
            </button>
          </div>
        </div>
      </div>

      <section ref={itemsRef} id="kit-items" className="mt-12 scroll-mt-28">
          <h2 className="font-display text-2xl text-maroon md:text-[1.85rem]">
            {locale === "te" ? "కిట్‌లో ఏముంది" : "What's Inside Your Kit"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {includedCount
              ? locale === "te"
                ? `${includedCount} వస్తువులు మీ పూజకు ఎంచుకోబడ్డాయి`
                : ganesh
                  ? `${includedCount} carefully selected items for your Ganesh Chaturthi Puja`
                  : `${includedCount} carefully selected items for this pooja`
              : locale === "te"
                ? "సామగ్రి జాబితా"
                : "Samagri list"}
          </p>

          {availableCategories.length > 1 ? (
            <div className="kit-chip-row mt-4" role="tablist" aria-label={locale === "te" ? "వస్తువు వర్గాలు" : "Item categories"}>
              <CategoryChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label={locale === "te" ? "అన్నీ" : "All"}
              />
              {availableCategories.map((id) => (
                <CategoryChip
                  key={id}
                  active={category === id}
                  onClick={() => setCategory(id)}
                  label={kitCategoryLabel(id, locale)}
                />
              ))}
            </div>
          ) : null}

          <ul
            className={`kit-item-grid mt-5 ${gridReady ? "kit-item-grid-ready" : ""}`}
            aria-live="polite"
          >
            {visibleItems.map((item) => (
              <KitItemCard
                key={`${tab.id}-${item.key}`}
                item={item}
                locale={locale}
                selected
                onOpen={() => setPreview(item)}
              />
            ))}
          </ul>
      </section>

      {optionalItems.length ? (
        <section id="kit-optional-items" className="mt-12 scroll-mt-28">
          <h2 className="font-display text-2xl text-maroon md:text-[1.85rem]">
            {locale === "te" ? "ఐచ్ఛిక వస్తువులు" : "Optional extras"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {locale === "te"
              ? "ఇవి కిట్‌లో ఉండవు — కావాలంటే టిక్ చేయండి."
              : "Not packed unless you select them."}
          </p>
          <ul className={`kit-item-grid mt-5 ${gridReady ? "kit-item-grid-ready" : ""}`}>
            {optionalItems.map((item) => (
              <KitItemCard
                key={`${tab.id}-opt-${item.key}`}
                item={item}
                locale={locale}
                selected={chosenOptional.has(item.key)}
                onToggleOptional={() => toggleOptional(item.key)}
                onOpen={() => setPreview(item)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {tab.about || tab.speciality || tab.steps.length || tab.processDetail?.length ? (
        <section className="mt-12 space-y-8">
          {tab.about || tab.speciality ? (
            <div className={`grid gap-8 ${tab.about && tab.speciality ? "lg:grid-cols-2" : ""}`}>
              {tab.about ? (
                <div>
                  <h2 className="font-display text-2xl text-maroon">
                    {locale === "te" ? "గురించి" : "About"}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-body">{tab.about}</p>
                </div>
              ) : null}
              {tab.speciality ? (
                <div>
                  <h2 className="font-display text-2xl text-maroon">
                    {locale === "te" ? "ప్రత్యేకత" : "Speciality"}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-body">{tab.speciality}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab.steps.length || tab.processDetail?.length ? (
            <div>
              <h3 className="font-display text-2xl text-maroon">
                {locale === "te" ? "పూజా విధి" : "Pooja process"}
              </h3>
              {tab.steps.length ? (
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tab.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-body">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-maroon text-xs font-bold text-cream">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : null}
              {tab.processDetail?.length ? (
                <div className="mt-5 space-y-3">
                  {tab.processDetail.map((para) => (
                    <p key={para.slice(0, 48)} className="text-sm leading-relaxed text-body">
                      {para}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-10 rounded-2xl border border-divider bg-paper px-5 py-5 md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-maroon uppercase">
            {locale === "te" ? "పూజారి" : "Need a priest?"}
          </p>
          <p className="mt-1 font-display text-xl text-maroon">
            {locale === "te" ? "ఈ పూజకు పూజారిని బుక్ చేయండి" : "Book a poojari for this pooja"}
          </p>
        </div>
        <Link href="/priests" className="btn-outline mt-4 inline-flex justify-center md:mt-0">
          {locale === "te" ? "పూజారిని బుక్ చేయండి" : "Book priest"}
        </Link>
      </div>

      {!ctaInView && !preview && tab.product ? (
        <div className="kit-sticky-bar lg:hidden">
          <div>
            <p className="text-sm font-semibold text-maroon">
              {includedCount ? `${includedCount} ${locale === "te" ? "వస్తువులు" : "Items"}` : kitName}
              {price ? <span className="text-muted"> · </span> : null}
              {price ? <span className="price">{price}</span> : null}
              {mrp ? <span className="ml-2 text-xs font-normal text-muted line-through">{mrp}</span> : null}
            </p>
          </div>
          <AddToCartButton
            productId={tab.product.id}
            selectedItemKeys={chosenOptional.size ? selectedKeys : undefined}
            redirectTo="/checkout"
            compact
            className="btn-orange-sm"
            label={locale === "te" ? "ఇప్పుడే కొనండి" : "Buy Now"}
          />
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        className="kit-quick-view"
        onClose={() => setPreview(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setPreview(null);
        }}
        aria-labelledby="kit-item-preview-title"
      >
        {preview ? (
          <QuickViewBody
            item={preview}
            locale={locale}
            onClose={() => setPreview(null)}
          />
        ) : null}
      </dialog>
    </div>
  );
}

function GaneshVariantSelector({
  locale,
  tabs,
  current,
  onSelect,
}: {
  locale: Locale;
  tabs: KitShopTab[];
  current: { size: GaneshKitSize; place: GaneshKitPlace };
  onSelect: (size: GaneshKitSize, place: GaneshKitPlace) => void;
}) {
  const tabIds = new Set(tabs.map((item) => item.id));
  return (
    <div className="mb-6 space-y-3">
      <div className="flex rounded-2xl border border-divider bg-chip p-1" role="radiogroup" aria-label={locale === "te" ? "కిట్ పరిమాణం" : "Kit size"}>
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={current.size === size}
            onClick={() => onSelect(size, current.place)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold tracking-wide ${
              current.size === size ? "bg-maroon text-cream" : "text-maroon"
            }`}
          >
            {size === "mini" ? (locale === "te" ? "మినీ" : "Mini") : locale === "te" ? "మెగా" : "Mega"}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {PLACES.map((place) => {
          const slug = ganeshKitSlug(current.size, place);
          const available = tabIds.has(slug);
          const active = current.place === place;
          const copy = ganeshPlaceCopy(place, locale);
          const sizeLabel = current.size === "mini" ? (locale === "te" ? "మినీ" : "Mini") : locale === "te" ? "మెగా" : "Mega";
          return (
            <button
              key={place}
              type="button"
              disabled={!available}
              aria-pressed={active}
              onClick={() => available && onSelect(current.size, place)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-gold bg-paper shadow-[0_8px_22px_rgba(74,15,29,0.08)]"
                  : "border-divider bg-chip/50 hover:border-gold/70"
              } disabled:opacity-40`}
            >
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">{copy.title}</p>
              <p className="mt-1 font-display text-lg leading-tight text-maroon">
                {sizeLabel} {copy.title}
              </p>
              <p className="mt-0.5 text-xs text-muted">{copy.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`kit-chip ${active ? "kit-chip-active" : ""}`}
    >
      {label}
    </button>
  );
}

function KitItemCard({
  item,
  locale,
  selected,
  onToggleOptional,
  onOpen,
}: {
  item: KitShopLine;
  locale: Locale;
  selected: boolean;
  onToggleOptional?: () => void;
  onOpen: () => void;
}) {
  const qty = formatKitQty(item.pack, item.quantity, locale);
  const role = kitItemRole(item.key);
  const roleLabel = item.optional
    ? locale === "te"
      ? "ఐచ్ఛికం"
      : "Optional"
    : role === "essential"
      ? locale === "te"
        ? "అవసరం"
        : "Essential"
      : locale === "te"
        ? "వినియోగం"
        : "Consumable";

  return (
    <li>
      <article className="kit-item-card">
        {onToggleOptional ? (
          <label className="kit-item-optional">
            <input
              type="checkbox"
              className="accent-[var(--maroon)]"
              checked={selected}
              onChange={onToggleOptional}
              aria-label={locale === "te" ? `${item.name} ఐచ్ఛికం` : `Include ${item.name}`}
            />
          </label>
        ) : null}
        <button type="button" className="kit-item-hit" onClick={onOpen} aria-label={item.name}>
          <KitItemThumb slug={item.key} name={item.name} />
          <span className="kit-item-copy">
            <span className="kit-item-name">{item.name}</span>
            <span className="kit-item-qty">{qty}</span>
            <span className="kit-item-role">{roleLabel}</span>
          </span>
        </button>
      </article>
    </li>
  );
}

function KitItemThumb({ slug, name }: { slug: string; name: string }) {
  const src = samagriImage(slug, name);
  return (
    <span className="kit-item-thumb">
      {src ? (
        <Image src={src} alt={name} fill sizes="(max-width: 640px) 42vw, 140px" className="object-contain p-1.5" />
      ) : (
        <span className="grid h-full w-full place-items-center font-display text-xl text-maroon/40" aria-hidden>
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

function QuickViewBody({
  item,
  locale,
  onClose,
}: {
  item: KitShopLine;
  locale: Locale;
  onClose: () => void;
}) {
  const qty = formatKitQty(item.pack, item.quantity, locale);
  const category = kitCategoryLabel(kitItemCategory(item.key), locale);
  const role = kitItemRole(item.key);
  const src = samagriImage(item.key, item.name);
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 id="kit-item-preview-title" className="font-display text-2xl text-maroon">
          {item.name}
        </h3>
        <button type="button" onClick={onClose} className="rounded-full border border-gold px-3 py-1 text-xs font-semibold text-maroon">
          {locale === "te" ? "మూసివేయి" : "Close"}
        </button>
      </div>
      <div className="relative mx-auto mt-4 h-52 w-52 overflow-hidden rounded-2xl bg-[#fff8ef]">
        {src ? (
          <Image src={src} alt={item.name} fill sizes="208px" className="object-contain p-4" />
        ) : null}
      </div>
      <p className="mt-4 text-sm text-muted">{qty}</p>
      <p className="mt-1 text-xs tracking-wide text-maroon uppercase">{category}</p>
      <p className="mt-3 text-sm leading-relaxed text-body">
        {role === "essential"
          ? locale === "te"
            ? "ఈ వస్తువు పూజా అమరికకు అవసరం. కిట్‌లో చేర్చబడింది."
            : "An essential setup item included in this kit."
          : locale === "te"
            ? "పూజలో వాడే వినియోగ వస్తువు. కిట్‌లో కొలతతో చేర్చబడింది."
            : "A measured consumable included for this puja."}
      </p>
    </div>
  );
}
