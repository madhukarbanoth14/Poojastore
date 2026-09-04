"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatMoney } from "@/lib/format";
import type { Locale, SelectableItem } from "@/lib/types";

export function KitItemPicker({
  productId,
  currency,
  items,
  locale,
}: {
  productId: string;
  currency: string;
  items: SelectableItem[];
  locale: Locale;
}) {
  const optionalItems = items.filter((item) => item.optional);
  const requiredKeys = items.filter((item) => !item.optional).map((item) => item.key);
  const [chosenOptional, setChosenOptional] = useState<Set<string>>(new Set());
  const selectedKeys = useMemo(
    () => [...requiredKeys, ...items.filter((item) => chosenOptional.has(item.key)).map((item) => item.key)],
    [requiredKeys, items, chosenOptional],
  );
  const totalMinor = items
    .filter((item) => selectedKeys.includes(item.key))
    .reduce((sum, item) => sum + (item.priceMinor ?? 0) * (item.quantity ?? 1), 0);

  function toggle(key: string) {
    setChosenOptional((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="mt-12">
      <h2 className="font-display text-2xl text-maroon">
        {locale === "te" ? "అవసరమైన వస్తువులు" : "Included items"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {locale === "te" ? "ఈ వస్తువులు కిట్‌లో ఉంటాయి." : "These are packed in the kit."}
      </p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter((item) => !item.optional)
          .map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-paper px-3.5 py-2.5 text-sm"
            >
              <span className="min-w-0 leading-snug">
                {item.name}
                {item.pack ? <span className="block text-xs text-muted">{item.pack}</span> : null}
              </span>
            </li>
          ))}
      </ul>

      {optionalItems.length ? (
        <>
          <h2 className="font-display mt-10 text-2xl text-maroon">
            {locale === "te" ? "ఐచ్ఛిక వస్తువులు ఎంచుకోండి" : "Choose optional items"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {locale === "te"
              ? "ఇవి కిట్‌లో ఉండవు — కావాలంటే టిక్ చేయండి."
              : "Not packed unless you select them."}
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {optionalItems.map((item) => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-paper px-3.5 py-2.5 text-sm hover:border-maroon">
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--maroon)]"
                    checked={chosenOptional.has(item.key)}
                    onChange={() => toggle(item.key)}
                  />
                  <span className="min-w-0 leading-snug">
                    {item.name}
                    {item.pack ? <span className="block text-xs text-muted">{item.pack}</span> : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-paper px-5 py-4">
        <p className="font-display text-2xl price">{formatMoney(totalMinor, currency)}</p>
        <AddToCartButton
          productId={productId}
          selectedItemKeys={selectedKeys}
          label={
            locale === "te"
              ? `కార్ట్‌లో చేర్చండి · ${selectedKeys.length}`
              : `Add to cart · ${selectedKeys.length} items`
          }
          className="w-auto"
        />
      </div>
    </div>
  );
}
