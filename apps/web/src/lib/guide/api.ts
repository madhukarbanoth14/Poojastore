export type GuideLanguage = "en" | "te" | "hi";

export type GuideSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export type GuideProductCard = {
  slug: string;
  name: string;
  priceMinor: number;
  mrpMinor?: number | null;
  currency: string;
  imageUrl?: string | null;
  description?: string | null;
  productUrl: string;
  available: boolean;
};

export type GuideBootstrap = {
  welcomeTitle: string;
  welcomeBody: string;
  statusLine: string;
  inviteBubble: string;
  suggestions: GuideSuggestion[];
  journeyChoices: GuideSuggestion[];
  whatsappUrl: string | null;
  links: {
    kits: string;
    festivals: string;
    poojas: string;
    priests: string;
    panchang: string;
    contact: string;
  };
  aiEnabled: boolean;
};

export type GuideChatResponse = {
  reply: string;
  language: GuideLanguage;
  suggestions: GuideSuggestion[];
  products: GuideProductCard[];
  knowledgeIds: string[];
  aiUsed: boolean;
};

export type GuideMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: GuideProductCard[];
  suggestions?: GuideSuggestion[];
};

async function guideFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Same-origin Next.js routes keep OPENAI_API_KEY on the server and work
  // even before the Nest guide module is deployed.
  const url = typeof window !== "undefined" ? `/api${path}` : path;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Guide request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchGuideBootstrap(lang: GuideLanguage) {
  return guideFetch<GuideBootstrap>(`/guide/bootstrap?lang=${lang}`);
}

export function postGuideChat(input: {
  message: string;
  language: GuideLanguage;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  return guideFetch<GuideChatResponse>("/guide/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function detectGuideLanguage(text: string, fallback: GuideLanguage): GuideLanguage {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[A-Za-z]/.test(text)) return "en";
  return fallback;
}

export function formatGuidePrice(priceMinor: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(priceMinor / 100);
  } catch {
    return `₹${Math.round(priceMinor / 100)}`;
  }
}
