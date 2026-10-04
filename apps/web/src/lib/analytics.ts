export type AnalyticsItem = {
  id: string;
  name: string;
  priceMinor: number;
  currency?: string | null;
  quantity?: number;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "igshid",
] as const;

const COOKIE = "ps_utm";
const COOKIE_DAYS = 90;
const STORAGE = "ps_utm";

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

function rupees(minor: number) {
  return Math.round(minor) / 100;
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string) {
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function parseAttribution(raw: string): Attribution {
  try {
    const parsed = JSON.parse(raw) as Attribution;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const next: Attribution = {
    ...parseAttribution(readCookie(COOKIE)),
    ...parseAttribution(sessionStorage.getItem(STORAGE) ?? ""),
  };
  let changed = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) {
      next[key] = value;
      changed = true;
    }
  }
  if (!changed && Object.keys(next).length === 0) return;
  const json = JSON.stringify(next);
  sessionStorage.setItem(STORAGE, json);
  writeCookie(COOKIE, json);
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  return {
    ...parseAttribution(readCookie(COOKIE)),
    ...parseAttribution(sessionStorage.getItem(STORAGE) ?? ""),
  };
}

function gaItems(items: AnalyticsItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: rupees(item.priceMinor),
    quantity: item.quantity ?? 1,
  }));
}

function campaignParams() {
  const attr = getAttribution();
  return {
    campaign_id: attr.utm_id,
    campaign: attr.utm_campaign,
    source: attr.utm_source,
    medium: attr.utm_medium,
    content: attr.utm_content,
    term: attr.utm_term,
  };
}

export function trackPageView(path: string) {
  const page = path.split("?")[0] || "/";
  if (page.startsWith("/admin")) return;
  window.gtag?.("event", "page_view", {
    page_path: page,
    page_location: window.location.href,
    page_title: document.title,
    ...campaignParams(),
  });
  window.fbq?.("track", "PageView");
}

export function trackViewItem(item: AnalyticsItem) {
  const value = rupees(item.priceMinor);
  const currency = item.currency || "INR";
  window.gtag?.("event", "view_item", {
    currency,
    value,
    items: gaItems([item]),
    ...campaignParams(),
  });
  window.fbq?.("track", "ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value,
    currency,
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = rupees(item.priceMinor) * (item.quantity ?? 1);
  const currency = item.currency || "INR";
  window.gtag?.("event", "add_to_cart", {
    currency,
    value,
    items: gaItems([item]),
    ...campaignParams(),
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value,
    currency,
  });
}

export function trackBeginCheckout(params: {
  valueMinor: number;
  currency?: string | null;
  items: AnalyticsItem[];
}) {
  if (typeof window === "undefined") return;
  try {
    const key = "ps_begin_checkout";
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    const value = rupees(params.valueMinor);
    const currency = params.currency || "INR";
    window.gtag?.("event", "begin_checkout", {
      currency,
      value,
      items: gaItems(params.items),
      ...campaignParams(),
    });
    window.fbq?.("track", "InitiateCheckout", {
      content_ids: params.items.map((item) => item.id),
      content_type: "product",
      num_items: params.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
      value,
      currency,
    });
  } catch {
    /* never block checkout */
  }
}

export function trackSignUp(method = "email") {
  window.gtag?.("event", "sign_up", { method, ...campaignParams() });
  window.fbq?.("track", "CompleteRegistration", { status: true });
}

export function trackPurchase(params: {
  orderId: string;
  orderNumber?: string | null;
  valueMinor: number;
  currency?: string | null;
  items: AnalyticsItem[];
}) {
  if (typeof window === "undefined") return;
  const key = `ps_purchase_${params.orderId}`;
  try {
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  } catch {
    return;
  }
  const value = rupees(params.valueMinor);
  const currency = params.currency || "INR";
  const transactionId = params.orderNumber || params.orderId;
  window.gtag?.("event", "purchase", {
    transaction_id: transactionId,
    currency,
    value,
    items: gaItems(params.items),
    ...campaignParams(),
  });
  window.fbq?.("track", "Purchase", {
    content_ids: params.items.map((item) => item.id),
    content_type: "product",
    content_name: params.items.map((item) => item.name).join(", "),
    num_items: params.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    value,
    currency,
  });
}

export function isPaidOrderStatus(status: string, payments?: { status: string }[]) {
  if (["PAID", "FULFILLING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) {
    return true;
  }
  return Boolean(payments?.some((payment) => payment.status === "SUCCEEDED"));
}
