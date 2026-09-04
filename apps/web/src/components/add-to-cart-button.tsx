"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { clientFetch } from "@/lib/client";

export function AddToCartButton({
  productId,
  selectedItemKeys,
  label = "Add to cart",
  className = "",
}: {
  productId: string;
  selectedItemKeys?: string[];
  label?: string;
  className?: string;
}) {
  const { user, refreshCart } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
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
        }),
      });
      await refreshCart();
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => void add()}
        disabled={busy}
        className={`btn-orange disabled:opacity-60 ${className}`}
      >
        {busy ? "Adding…" : done ? "Added" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-orange">{error}</p> : null}
    </div>
  );
}
