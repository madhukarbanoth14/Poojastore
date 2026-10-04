export type GuideLanguage = 'en' | 'te' | 'hi';

export type GuideKnowledgeKind = 'festival' | 'pooja' | 'service' | 'page';

export type GuideKnowledgeEntry = {
  id: string;
  kind: GuideKnowledgeKind;
  /** Search aliases across languages */
  aliases: string[];
  name: { en: string; te: string; hi: string };
  description: { en: string; te: string; hi?: string };
  significance?: { en: string; te?: string; hi?: string };
  practices?: string[];
  samagri?: string[];
  vidhiSteps?: string[];
  kitSlugs: string[];
  pagePaths: string[];
  relatedIds?: string[];
  faqs?: Array<{ q: string; a: string }>;
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

export type GuideChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export type GuideBootstrap = {
  welcomeTitle: string;
  welcomeBody: string;
  statusLine: string;
  inviteBubble: string;
  suggestions: GuideChatSuggestion[];
  journeyChoices: GuideChatSuggestion[];
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
