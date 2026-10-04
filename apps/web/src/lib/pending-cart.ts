const KEY = "ps_pending_cart";

export type PendingCartAdd = {
  productId: string;
  selectedItemKeys?: string[];
  buyNow?: boolean;
  redirectTo?: string;
  itemName?: string;
  priceMinor?: number;
  currency?: string | null;
};

export function stashPendingCart(item: PendingCartAdd) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(item));
}

export function peekPendingCart(): PendingCartAdd | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as PendingCartAdd;
    return pending?.productId ? pending : null;
  } catch {
    return null;
  }
}

export function takePendingCart(): PendingCartAdd | null {
  const pending = peekPendingCart();
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
  return pending;
}

export function goToCartDestination(path: string) {
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

export function goAfterAuth(path: string, fallback: (url: string) => void) {
  const dest = path || "/";
  if (dest.startsWith("/checkout") || dest.startsWith("/cart")) {
    goToCartDestination(dest);
    return;
  }
  fallback(dest);
}
