"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";
import { trackAddToCart } from "@/lib/analytics";
import { goToCartDestination, stashPendingCart } from "@/lib/pending-cart";

export function AddToCartButton({
  productId,
  selectedItemKeys,
  label = "Add to cart",
  className = "",
  compact = false,
  redirectTo = "/cart",
  buyNow = false,
  itemName,
  priceMinor,
  currency,
}: {
  productId: string;
  selectedItemKeys?: string[];
  label?: string;
  className?: string;
  compact?: boolean;
  /** Where to go after a successful add. Defaults to cart. */
  redirectTo?: string;
  /** Clear other cart lines so checkout total matches this product. */
  buyNow?: boolean;
  itemName?: string;
  priceMinor?: number;
  currency?: string | null;
}) {
  const { user, refreshCart } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!user) {
      stashPendingCart({
        productId,
        selectedItemKeys,
        buyNow,
        redirectTo,
        itemName,
        priceMinor,
        currency,
      });
      goToCartDestination(redirectTo === "/cart" ? "/checkout" : redirectTo);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await clientFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: 1,
          ...(selectedItemKeys?.length ? { selectedItemKeys } : {}),
          ...(buyNow ? { replace: true } : {}),
        }),
      });
      trackAddToCart({
        id: productId,
        name: itemName || "Pooja kit",
        priceMinor: priceMinor ?? 0,
        currency,
      });
      await refreshCart();
      goToCartDestination(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "shrink-0" : "w-full"}>
      <button
        type="button"
        onClick={() => void add()}
        disabled={busy}
        aria-label={label}
        className={`btn-orange disabled:opacity-60 ${className}`}
      >
        {busy ? (buyNow ? "Buying…" : "Adding…") : label}
      </button>
      {error ? <p className="mt-2 text-sm text-orange">{error}</p> : null}
    </div>
  );
}
