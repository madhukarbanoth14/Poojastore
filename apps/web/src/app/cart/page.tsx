"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { LotusDivider } from "@/components/ornaments";
import { clientFetch } from "@/lib/client";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { user, cart, ready, refreshCart } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/cart");
  }, [ready, user, router]);

  if (!ready) return <p className="px-5 py-16 text-center text-muted">Preparing your cart…</p>;
  if (!user) return null;

  const items = cart?.items ?? [];

  async function updateQty(productId: string, quantity: number) {
    if (quantity < 1) {
      await clientFetch(`/cart/items/${productId}`, { method: "DELETE" });
    } else {
      await clientFetch(`/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
    }
    await refreshCart();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-maroon uppercase">Your seva</p>
      <h1 className="font-display mt-2 text-4xl text-maroon">Cart</h1>
      <LotusDivider className="mt-4" />
      {!items.length ? (
        <div className="card-temple mt-8 px-6 py-14 text-center">
          <p className="font-display text-2xl text-maroon">Your cart is empty</p>
          <p className="mt-2 text-sm text-muted">Choose a kit and we will gather the samagri for you.</p>
          <Link href="/kits" className="mt-6 btn-orange">
            Browse kits
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="card-temple flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-lg">{item.product.name}</p>
                  <p className="text-sm text-muted">
                    {formatMoney(item.unitPriceMinor, item.product.currency)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full border border-gold text-maroon"
                    onClick={() => void updateQty(item.productId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full border border-gold text-maroon"
                    onClick={() => void updateQty(item.productId, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="card-temple mt-6 flex items-center justify-between p-5">
            <p className="font-display text-xl">
              Subtotal{" "}
              <span className="price">{formatMoney(cart?.subtotalMinor ?? 0, cart?.currency ?? "INR")}</span>
            </p>
            <Link href="/checkout" className="btn-orange">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
