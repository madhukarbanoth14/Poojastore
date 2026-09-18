import { serverApiBase } from "@/lib/config";
import type { GuideBootstrap, GuideLanguage, GuideProductCard } from "@/lib/guide/api";
import { pickLocalized, retrieveGuideKnowledge } from "@/lib/guide/retrieval";

const SYSTEM_PROMPT = `You are Pavitra Seva Guide, the spiritual information assistant for Pavitra Seva — Your Divine Companion.

Use verified knowledge and live product cards only. Never invent mantras, muhurthams, prices, or availability.
When traditions vary, say practices can differ by region and family tradition.
Answer in the user's language. Be a helpful guide, not a religious authority. Do not hard-sell.`;

export function guideBootstrap(language: GuideLanguage): GuideBootstrap {
  const whatsapp =
    process.env.SUPPORT_WHATSAPP_E164 ||
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ||
    "";
  const digits = whatsapp.replace(/\D/g, "");
  const copy = bootstrapCopy(language);
  return {
    ...copy,
    whatsappUrl: digits ? `https://wa.me/${digits}` : null,
    links: {
      kits: "/kits",
      festivals: "/festivals",
      poojas: "/poojas",
      priests: "/priests",
      panchang: "/panchang",
      contact: "/account",
    },
    aiEnabled: Boolean(process.env.OPENAI_API_KEY),
  };
}

export async function guideChat(input: {
  message: string;
  language: GuideLanguage;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const language = input.language ?? "en";
  const history = (input.history ?? []).slice(-8);
  const blob = [...history.map((h) => h.content), input.message].join(" ");
  const retrieved = retrieveGuideKnowledge(blob, language);
  const products = await loadProducts(retrieved.kitSlugs);

  const aiReply = await maybeOpenAi({
    language,
    message: input.message,
    history,
    knowledge: retrieved.textBlock,
    products,
  });

  const reply =
    aiReply ??
    fallbackReply(language, retrieved.entries[0], products);

  return {
    reply,
    language,
    suggestions: followUps(retrieved.entries[0]?.id, language),
    products,
    knowledgeIds: retrieved.entries.map((e) => e.id),
    aiUsed: Boolean(aiReply),
  };
}

async function loadProducts(slugs: string[]): Promise<GuideProductCard[]> {
  if (!slugs.length) return [];
  const base = serverApiBase();
  const results = await Promise.all(
    slugs.slice(0, 6).map(async (slug) => {
      try {
        const res = await fetch(`${base}/products/${slug}`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 120 },
        });
        if (!res.ok) return null;
        const payload = (await res.json()) as {
          success?: boolean;
          data?: {
            slug: string;
            name: string;
            priceMinor: number;
            mrpMinor?: number | null;
            currency: string;
            imageUrl?: string | null;
            description?: string | null;
            isActive?: boolean;
          };
          slug?: string;
          name?: string;
          priceMinor?: number;
          mrpMinor?: number | null;
          currency?: string;
          imageUrl?: string | null;
          description?: string | null;
          isActive?: boolean;
        };
        const product = payload.data ?? payload;
        if (!product.slug || product.priceMinor == null) return null;
        return {
          slug: product.slug,
          name: product.name ?? product.slug,
          priceMinor: product.priceMinor,
          mrpMinor: product.mrpMinor,
          currency: product.currency ?? "INR",
          imageUrl: product.imageUrl,
          description: product.description,
          productUrl: `/kits/${product.slug}`,
          available: product.isActive !== false,
        } satisfies GuideProductCard;
      } catch {
        return null;
      }
    }),
  );
  return results.filter(Boolean) as GuideProductCard[];
}

async function maybeOpenAi(input: {
  language: GuideLanguage;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  knowledge: string;
  products: GuideProductCard[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const productBlock = input.products.length
    ? input.products
        .map(
          (p) =>
            `${p.name} | ${p.slug} | ${p.priceMinor} ${p.currency} | ${p.productUrl}`,
        )
        .join("\n")
    : "None";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: [
              SYSTEM_PROMPT,
              `Language: ${input.language}`,
              input.knowledge
                ? `Verified knowledge:\n${input.knowledge}`
                : "No strong knowledge match.",
              `Live products:\n${productBlock}`,
            ].join("\n\n"),
          },
          ...input.history,
          { role: "user", content: input.message },
        ],
      }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function fallbackReply(
  language: GuideLanguage,
  entry: ReturnType<typeof retrieveGuideKnowledge>["entries"][0] | undefined,
  products: GuideProductCard[],
) {
  if (!entry) {
    return language === "te"
      ? "🙏 ఈ ప్రశ్నకు నిర్ధారిత సమాచారం లేదు. పండుగలు / పూజలు / కిట్లు విభాగాలు చూడండి."
      : language === "hi"
        ? "🙏 पर्याप्त पुष्टि की गई जानकारी नहीं है। कृपया त्योहार / पूजा / किट अनुभाग देखें।"
        : "🙏 I don’t have enough verified information to answer that accurately. Explore Festivals, Poojas, or Kits on Pavitra Seva.";
  }
  const name = pickLocalized(entry.name, language);
  const description = pickLocalized(entry.description, language);
  const note =
    language === "te"
      ? "ఆచారాలు ప్రాంతం/కుటుంబం బట్టి మారవచ్చు."
      : language === "hi"
        ? "रीति-रिवाज क्षेत्र और परिवार के अनुसार बदल सकते हैं।"
        : "Practices can vary by region and family tradition. Here is a commonly followed method.";
  const samagri = entry.samagri?.length
    ? `\n\n${language === "te" ? "సామగ్రి" : language === "hi" ? "सामग्री" : "Common Samagri"}:\n${entry.samagri
        .slice(0, 10)
        .map((i) => `• ${i}`)
        .join("\n")}`
    : "";
  const kits = products.length
    ? `\n\n${language === "te" ? "సంబంధిత కిట్లు" : language === "hi" ? "संबंधित किट" : "Related kits"}:\n${products
        .slice(0, 3)
        .map((p) => `• ${p.name}`)
        .join("\n")}`
    : "";
  return `🙏 ${name}\n\n${description}\n\n${note}${samagri}${kits}`;
}

function followUps(id: string | undefined, language: GuideLanguage) {
  const ganesh = id?.includes("ganesh") || id?.includes("ganapati");
  if (language === "te") {
    return ganesh
      ? [
          { id: "how", label: "🪔 పూజ ఎలా", prompt: "గణేష్ పూజ ఎలా చేయాలి?" },
          { id: "samagri", label: "📋 సామగ్రి", prompt: "గణేష్ పూజకు సామగ్రి ఏమిటి?" },
          { id: "kit", label: "🛍️ కిట్", prompt: "గణేష్ పూజా కిట్ చూపించు" },
        ]
      : [
          { id: "samagri", label: "📋 సామగ్రి", prompt: "ఈ పూజకు సామగ్రి ఏమిటి?" },
          { id: "kit", label: "🛍️ కిట్", prompt: "సంబంధిత కిట్ చూపించు" },
          { id: "priest", label: "🙏 పూజారి", prompt: "పూజారిని బుక్ చేయాలి" },
        ];
  }
  if (language === "hi") {
    return ganesh
      ? [
          { id: "how", label: "🪔 पूजा कैसे", prompt: "गणेश पूजा कैसे करें?" },
          { id: "samagri", label: "📋 सामग्री", prompt: "गणेश पूजा की सामग्री क्या है?" },
          { id: "kit", label: "🛍️ किट", prompt: "गणेश पूजा किट दिखाओ" },
        ]
      : [
          { id: "samagri", label: "📋 सामग्री", prompt: "इस पूजा की सामग्री क्या है?" },
          { id: "kit", label: "🛍️ किट", prompt: "संबंधित किट दिखाओ" },
          { id: "priest", label: "🙏 पुजारी", prompt: "पुजारी बुक करना है" },
        ];
  }
  return ganesh
    ? [
        { id: "how", label: "🪔 How to perform Ganesh Pooja", prompt: "How do I perform Ganesh Pooja?" },
        { id: "samagri", label: "📋 What Samagri is required", prompt: "What Samagri is required for Ganesh Pooja?" },
        { id: "kit", label: "🛍️ Get a Ganesh Pooja Kit", prompt: "Show me Ganesh Pooja kits" },
      ]
    : [
        { id: "samagri", label: "📋 Samagri list", prompt: "What Samagri do I need?" },
        { id: "kit", label: "🛍️ Matching kit", prompt: "Show related Pooja kits" },
        { id: "priest", label: "🙏 Book Poojari", prompt: "I want to book a Poojari" },
      ];
}

function bootstrapCopy(language: GuideLanguage) {
  if (language === "te") {
    return {
      welcomeTitle: "🙏 నమస్తే!",
      welcomeBody:
        "నేను పవిత్ర సేవ గైడ్.\n\nపండుగలు, పూజలు, విధి, సామగ్రి గురించి సహాయం చేస్తాను.\n\nమీకు ఏమి తెలుసుకోవాలి?",
      statusLine: "పూజలు, పండుగలు, విధి & సామగ్రి గురించి అడగండి.",
      inviteBubble: "🙏 పూజ లేదా పండుగ అర్థం కావాలా?",
      suggestions: [
        { id: "ganesh", label: "🪔 వినాయక చవితి అంటే?", prompt: "వినాయక చవితి అంటే ఏమిటి?" },
        { id: "ganesh-pooja", label: "📿 గణేష్ పూజ ఎలా?", prompt: "గణేష్ పూజ ఎలా చేయాలి?" },
        { id: "samagri", label: "🛍️ ఏ సామగ్రి కావాలి?", prompt: "పూజకు ఏ సామగ్రి కావాలి?" },
        { id: "vidhi", label: "📖 పూజా విధి", prompt: "పూజా విధి చూపించు" },
        { id: "poojari", label: "🙏 పూజారి కావాలి", prompt: "నాకు పూజారి కావాలి" },
        { id: "upcoming", label: "📅 రాబోయే పండుగలు", prompt: "రాబోయే పండుగలు ఏమిటి?" },
      ],
      journeyChoices: [
        { id: "home", label: "🏠 ఇంట్లో నేనే", prompt: "నేను ఇంట్లో పూజ చేయాలనుకుంటున్నాను" },
        { id: "priest", label: "👨‍🦳 పూజారి బుక్", prompt: "పూజారిని బుక్ చేయాలి" },
        { id: "kit", label: "🛍️ పూజా కిట్", prompt: "పూజా కిట్ కావాలి" },
        { id: "vidhi", label: "📖 విధి", prompt: "పూజా విధి నేర్పు" },
      ],
    };
  }
  if (language === "hi") {
    return {
      welcomeTitle: "🙏 नमस्ते!",
      welcomeBody:
        "मैं पवित्र सेवा गाइड हूँ।\n\nत्योहार, पूजा, विधि और सामग्री समझने में मदद करता हूँ।\n\nआप क्या जानना चाहेंगे?",
      statusLine: "पूजा, त्योहार, विधि और सामग्री पूछें।",
      inviteBubble: "🙏 पूजा या त्योहार समझने में मदद चाहिए?",
      suggestions: [
        { id: "ganesh", label: "🪔 गणेश चतुर्थी क्या है?", prompt: "गणेश चतुर्थी क्या है?" },
        { id: "ganesh-pooja", label: "📿 गणेश पूजा कैसे?", prompt: "गणेश पूजा कैसे करें?" },
        { id: "samagri", label: "🛍️ क्या सामग्री चाहिए?", prompt: "पूजा के लिए क्या सामग्री चाहिए?" },
        { id: "vidhi", label: "📖 पूजा विधि", prompt: "पूजा विधि दिखाओ" },
        { id: "poojari", label: "🙏 पुजारी चाहिए", prompt: "मुझे पुजारी चाहिए" },
        { id: "upcoming", label: "📅 आने वाले त्योहार", prompt: "आने वाले त्योहार कौन से हैं?" },
      ],
      journeyChoices: [
        { id: "home", label: "🏠 घर पर स्वयं", prompt: "मैं घर पर पूजा करना चाहता/चाहती हूँ" },
        { id: "priest", label: "👨‍🦳 पुजारी बुक", prompt: "पुजारी बुक करना है" },
        { id: "kit", label: "🛍️ पूजा किट", prompt: "पूजा किट चाहिए" },
        { id: "vidhi", label: "📖 विधि", prompt: "पूजा विधि सिखाओ" },
      ],
    };
  }
  return {
    welcomeTitle: "🙏 Namaste!",
    welcomeBody:
      "I’m the Pavitra Seva Guide.\n\nI can help you understand festivals, Poojas, rituals, required Samagri and how to prepare for them.\n\nWhat would you like to know?",
    statusLine: "Ask me about Poojas, festivals, rituals & Samagri.",
    inviteBubble: "🙏 Need help understanding a Pooja or festival?",
    suggestions: [
      { id: "ganesh", label: "🪔 What is Ganesh Chaturthi?", prompt: "What is Ganesh Chaturthi?" },
      { id: "ganesh-pooja", label: "📿 How do I perform Ganesh Pooja?", prompt: "How do I perform Ganesh Pooja?" },
      { id: "samagri", label: "🛍️ What Pooja items do I need?", prompt: "What Pooja items do I need?" },
      { id: "vidhi", label: "📖 Show me Pooja Vidhi", prompt: "Show me Pooja Vidhi" },
      { id: "poojari", label: "🙏 I need a Poojari", prompt: "I need a Poojari" },
      { id: "upcoming", label: "📅 What festivals are coming up?", prompt: "What festivals are coming up?" },
    ],
    journeyChoices: [
      { id: "home", label: "🏠 Perform it at home yourself", prompt: "I want to perform the Pooja at home myself" },
      { id: "priest", label: "👨‍🦳 Book a Poojari", prompt: "I want to book a Poojari" },
      { id: "kit", label: "🛍️ Get the Pooja Kit", prompt: "I want the Pooja Kit" },
      { id: "vidhi", label: "📖 Learn the Pooja Vidhi", prompt: "Teach me the Pooja Vidhi" },
    ],
  };
}
