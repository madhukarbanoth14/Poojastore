import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Market, ProductType } from '@prisma/client';
import { localizeProduct, type AppLocale } from '../../../common/i18n/locale';
import { PrismaService } from '../../../core/database/prisma.service';
import type {
  GuideBootstrap,
  GuideLanguage,
  GuideProductCard,
} from '../knowledge/types';
import { GUIDE_SYSTEM_PROMPT } from './guide-system-prompt';
import { GuideOpenAiClient } from './guide-openai.client';
import {
  GuideRetrievalService,
  pickLocalized,
} from './guide-retrieval.service';

type HistoryItem = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class GuideChatService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly retrieval: GuideRetrievalService,
    private readonly openai: GuideOpenAiClient,
  ) {}

  bootstrap(language: GuideLanguage): GuideBootstrap {
    const whatsapp = this.config.get<string>('guide.whatsappE164') ?? '';
    const digits = whatsapp.replace(/\D/g, '');
    return {
      welcomeTitle: copy(language).welcomeTitle,
      welcomeBody: copy(language).welcomeBody,
      statusLine: copy(language).statusLine,
      inviteBubble: copy(language).inviteBubble,
      suggestions: copy(language).suggestions,
      journeyChoices: copy(language).journeyChoices,
      whatsappUrl: digits ? `https://wa.me/${digits}` : null,
      links: {
        kits: '/kits',
        festivals: '/festivals',
        poojas: '/poojas',
        priests: '/priests',
        panchang: '/panchang',
        contact: '/account',
      },
      aiEnabled: this.openai.isEnabled(),
    };
  }

  async chat(input: {
    message: string;
    language: GuideLanguage;
    history?: HistoryItem[];
  }) {
    const language = input.language ?? 'en';
    const history = (input.history ?? []).slice(-8);
    const conversationBlob = [...history.map((h) => h.content), input.message].join(
      ' ',
    );
    const retrieved = this.retrieval.retrieve(conversationBlob, language);
    const products = await this.loadProducts(retrieved.kitSlugs, language);

    const followUps = buildFollowUps(retrieved.entries[0]?.id, language);
    const system = [
      GUIDE_SYSTEM_PROMPT,
      `Respond in language code: ${language} (en=English, te=Telugu, hi=Hindi).`,
      retrieved.textBlock
        ? `Verified Pavitra Seva knowledge (use only this + product cards; do not invent):\n${retrieved.textBlock}`
        : 'No verified knowledge entry matched strongly. Be honest if unsure and point users to /festivals, /poojas, /kits, or /priests.',
      products.length
        ? `Live product cards (use exact names/prices only):\n${products
            .map(
              (p) =>
                `- ${p.name} | slug=${p.slug} | priceMinor=${p.priceMinor} ${p.currency} | url=${p.productUrl} | available=${p.available}`,
            )
            .join('\n')}`
        : 'No live product cards for this turn.',
    ].join('\n\n');

    const messages = [
      { role: 'system' as const, content: system },
      ...history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: 'user' as const, content: input.message },
    ];

    const aiReply = await this.openai.complete(messages);
    const reply =
      aiReply ??
      this.fallbackReply({
        language,
        message: input.message,
        retrieved,
        products,
      });

    return {
      reply,
      language,
      suggestions: followUps,
      products,
      knowledgeIds: retrieved.entries.map((entry) => entry.id),
      aiUsed: Boolean(aiReply),
    };
  }

  private async loadProducts(
    slugs: string[],
    language: GuideLanguage,
  ): Promise<GuideProductCard[]> {
    if (!slugs.length) return [];
    const locale: AppLocale = language === 'te' ? 'te' : 'en';
    const rows = await this.prisma.product.findMany({
      where: {
        slug: { in: slugs },
        isActive: true,
        market: Market.IN,
        type: ProductType.PUJA_KIT,
      },
      take: 6,
    });
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map((row) => {
        const localized = localizeProduct(row!, locale);
        return {
          slug: localized.slug,
          name: localized.name,
          priceMinor: localized.priceMinor,
          mrpMinor: localized.mrpMinor,
          currency: localized.currency,
          imageUrl: localized.imageUrl,
          description: localized.description,
          productUrl: `/kits/${localized.slug}`,
          available: true,
        } satisfies GuideProductCard;
      });
  }

  private fallbackReply(input: {
    language: GuideLanguage;
    message: string;
    retrieved: ReturnType<GuideRetrievalService['retrieve']>;
    products: GuideProductCard[];
  }) {
    const { language, retrieved, products } = input;
    const top = retrieved.entries[0];
    if (!top) {
      return copy(language).noMatch;
    }

    const name = pickLocalized(top.name, language);
    const description = pickLocalized(top.description, language);
    const variance = copy(language).traditionNote;
    const samagri =
      top.samagri?.length &&
      `${copy(language).samagriHeading}\n${top.samagri
        .slice(0, 10)
        .map((item) => `• ${item}`)
        .join('\n')}`;

    const productLine =
      products.length > 0
        ? `\n\n${copy(language).kitsHeading}\n${products
            .slice(0, 3)
            .map((p) => `• ${p.name}`)
            .join('\n')}`
        : '';

    return [
      `🙏 ${name}`,
      '',
      description,
      '',
      variance,
      samagri ? `\n${samagri}` : '',
      productLine,
      '',
      copy(language).nextPrompt,
    ]
      .filter(Boolean)
      .join('\n');
  }
}

function buildFollowUps(knowledgeId: string | undefined, language: GuideLanguage) {
  const c = copy(language);
  if (!knowledgeId) return c.suggestions.slice(0, 4);
  if (knowledgeId.includes('ganesh') || knowledgeId.includes('ganapati')) {
    return c.ganeshFollowUps;
  }
  return c.genericFollowUps;
}

function copy(language: GuideLanguage) {
  if (language === 'te') {
    return {
      welcomeTitle: '🙏 నమస్తే!',
      welcomeBody:
        'నేను పవిత్ర సేవ గైడ్.\n\nపండుగలు, పూజలు, విధి, సామగ్రి గురించి సహాయం చేస్తాను.\n\nమీకు ఏమి తెలుసుకోవాలి?',
      statusLine: 'పూజలు, పండుగలు, విధి & సామగ్రి గురించి అడగండి.',
      inviteBubble: '🙏 పూజ లేదా పండుగ అర్థం కావాలా?',
      noMatch:
        '🙏 ఈ ప్రశ్నకు నా వద్ద నిర్ధారిత సమాచారం లేదు. పవిత్ర సేవ పండుగలు / పూజలు / కిట్లు విభాగాలు చూడండి, లేదా సహాయం కోసం సంప్రదించండి.',
      traditionNote:
        'ఆచారాలు ప్రాంతం, కుటుంబం, సంప్రదాయం బట్టి మారవచ్చు. ఇది సాధారణంగా అనుసరించే విధానం.',
      samagriHeading: 'సాధారణ సామగ్రి:',
      kitsHeading: 'సంబంధిత పవిత్ర సేవ కిట్లు:',
      nextPrompt: 'మీకు విధి, సామగ్రి జాబితా, లేదా కిట్ కావాలా?',
      suggestions: [
        { id: 'ganesh', label: '🪔 వినాయక చవితి అంటే?', prompt: 'వినాయక చవితి అంటే ఏమిటి?' },
        {
          id: 'ganesh-pooja',
          label: '📿 గణేష్ పూజ ఎలా?',
          prompt: 'గణేష్ పూజ ఎలా చేయాలి?',
        },
        {
          id: 'samagri',
          label: '🛍️ ఏ సామగ్రి కావాలి?',
          prompt: 'పూజకు ఏ సామగ్రి కావాలి?',
        },
        { id: 'vidhi', label: '📖 పూజా విధి', prompt: 'పూజా విధి చూపించు' },
        { id: 'poojari', label: '🙏 పూజారి కావాలి', prompt: 'నాకు పూజారి కావాలి' },
        {
          id: 'upcoming',
          label: '📅 రాబోయే పండుగలు',
          prompt: 'రాబోయే పండుగలు ఏమిటి?',
        },
      ],
      journeyChoices: [
        { id: 'home', label: '🏠 ఇంట్లో నేనే చేస్తాను', prompt: 'నేను ఇంట్లో పూజ చేయాలనుకుంటున్నాను' },
        { id: 'priest', label: '👨‍🦳 పూజారి బుక్', prompt: 'పూజారిని బుక్ చేయాలి' },
        { id: 'kit', label: '🛍️ పూజా కిట్', prompt: 'పూజా కిట్ కావాలి' },
        { id: 'vidhi', label: '📖 విధి నేర్చుకో', prompt: 'పూజా విధి నేర్పు' },
      ],
      ganeshFollowUps: [
        { id: 'how', label: '🪔 గణేష్ పూజ ఎలా', prompt: 'గణేష్ పూజ ఎలా చేయాలి?' },
        { id: 'samagri', label: '📋 సామగ్రి జాబితా', prompt: 'గణేష్ పూజకు సామగ్రి ఏమిటి?' },
        { id: 'vidhi', label: '📖 విధి', prompt: 'గణేష్ పూజా విధి చూపించు' },
        { id: 'kit', label: '🛍️ గణేష్ కిట్', prompt: 'గణేష్ పూజా కిట్ చూపించు' },
      ],
      genericFollowUps: [
        { id: 'samagri', label: '📋 సామగ్రి', prompt: 'ఈ పూజకు సామగ్రి ఏమిటి?' },
        { id: 'vidhi', label: '📖 విధి', prompt: 'పూజా విధి చెప్పు' },
        { id: 'kit', label: '🛍️ కిట్', prompt: 'సంబంధిత పూజా కిట్ చూపించు' },
        { id: 'priest', label: '🙏 పూజారి', prompt: 'పూజారిని బుక్ చేయాలి' },
      ],
    };
  }

  if (language === 'hi') {
    return {
      welcomeTitle: '🙏 नमस्ते!',
      welcomeBody:
        'मैं पवित्र सेवा गाइड हूँ।\n\nत्योहार, पूजा, विधि और सामग्री समझने में मदद करता हूँ।\n\nआप क्या जानना चाहेंगे?',
      statusLine: 'पूजा, त्योहार, विधि और सामग्री पूछें।',
      inviteBubble: '🙏 पूजा या त्योहार समझने में मदद चाहिए?',
      noMatch:
        '🙏 मेरे पास इस प्रश्न की पर्याप्त पुष्टि की गई जानकारी नहीं है। कृपया पवित्र सेवा के त्योहार / पूजा / किट अनुभाग देखें।',
      traditionNote:
        'रीति-रिवाज क्षेत्र, परिवार और परंपरा के अनुसार बदल सकते हैं। यह सामान्यतः अपनाया जाने वाला तरीका है।',
      samagriHeading: 'सामान्य सामग्री:',
      kitsHeading: 'संबंधित पवित्र सेवा किट:',
      nextPrompt: 'क्या आप विधि, सामग्री सूची, या किट देखना चाहेंगे?',
      suggestions: [
        { id: 'ganesh', label: '🪔 गणेश चतुर्थी क्या है?', prompt: 'गणेश चतुर्थी क्या है?' },
        { id: 'ganesh-pooja', label: '📿 गणेश पूजा कैसे करें?', prompt: 'गणेश पूजा कैसे करें?' },
        { id: 'samagri', label: '🛍️ क्या सामग्री चाहिए?', prompt: 'पूजा के लिए क्या सामग्री चाहिए?' },
        { id: 'vidhi', label: '📖 पूजा विधि', prompt: 'पूजा विधि दिखाओ' },
        { id: 'poojari', label: '🙏 पुजारी चाहिए', prompt: 'मुझे पुजारी चाहिए' },
        { id: 'upcoming', label: '📅 आने वाले त्योहार', prompt: 'आने वाले त्योहार कौन से हैं?' },
      ],
      journeyChoices: [
        { id: 'home', label: '🏠 घर पर स्वयं', prompt: 'मैं घर पर पूजा करना चाहता/चाहती हूँ' },
        { id: 'priest', label: '👨‍🦳 पुजारी बुक', prompt: 'पुजारी बुक करना है' },
        { id: 'kit', label: '🛍️ पूजा किट', prompt: 'पूजा किट चाहिए' },
        { id: 'vidhi', label: '📖 विधि सीखें', prompt: 'पूजा विधि सिखाओ' },
      ],
      ganeshFollowUps: [
        { id: 'how', label: '🪔 गणेश पूजा कैसे', prompt: 'गणेश पूजा कैसे करें?' },
        { id: 'samagri', label: '📋 सामग्री सूची', prompt: 'गणेश पूजा की सामग्री क्या है?' },
        { id: 'vidhi', label: '📖 विधि', prompt: 'गणेश पूजा विधि दिखाओ' },
        { id: 'kit', label: '🛍️ गणेश किट', prompt: 'गणेश पूजा किट दिखाओ' },
      ],
      genericFollowUps: [
        { id: 'samagri', label: '📋 सामग्री', prompt: 'इस पूजा की सामग्री क्या है?' },
        { id: 'vidhi', label: '📖 विधि', prompt: 'पूजा विधि बताओ' },
        { id: 'kit', label: '🛍️ किट', prompt: 'संबंधित पूजा किट दिखाओ' },
        { id: 'priest', label: '🙏 पुजारी', prompt: 'पुजारी बुक करना है' },
      ],
    };
  }

  return {
    welcomeTitle: '🙏 Namaste!',
    welcomeBody:
      "I’m the Pavitra Seva Guide.\n\nI can help you understand festivals, Poojas, rituals, required Samagri and how to prepare for them.\n\nWhat would you like to know?",
    statusLine: 'Ask me about Poojas, festivals, rituals & Samagri.',
    inviteBubble: '🙏 Need help understanding a Pooja or festival?',
    noMatch:
      '🙏 I don’t have enough verified information to answer that accurately. You can explore Festivals, Poojas, and Kits on Pavitra Seva, or contact us for guidance.',
    traditionNote:
      'Practices can vary by region and family tradition. Here is a commonly followed method.',
    samagriHeading: 'Common Samagri:',
    kitsHeading: 'Related Pavitra Seva kits:',
    nextPrompt: 'Would you like the Vidhi, Samagri list, or a matching kit?',
    suggestions: [
      { id: 'ganesh', label: '🪔 What is Ganesh Chaturthi?', prompt: 'What is Ganesh Chaturthi?' },
      {
        id: 'ganesh-pooja',
        label: '📿 How do I perform Ganesh Pooja?',
        prompt: 'How do I perform Ganesh Pooja?',
      },
      {
        id: 'samagri',
        label: '🛍️ What Pooja items do I need?',
        prompt: 'What Pooja items do I need?',
      },
      { id: 'vidhi', label: '📖 Show me Pooja Vidhi', prompt: 'Show me Pooja Vidhi' },
      { id: 'poojari', label: '🙏 I need a Poojari', prompt: 'I need a Poojari' },
      {
        id: 'upcoming',
        label: '📅 What festivals are coming up?',
        prompt: 'What festivals are coming up?',
      },
    ],
    journeyChoices: [
      { id: 'home', label: '🏠 Perform it at home yourself', prompt: 'I want to perform the Pooja at home myself' },
      { id: 'priest', label: '👨‍🦳 Book a Poojari', prompt: 'I want to book a Poojari' },
      { id: 'kit', label: '🛍️ Get the Pooja Kit', prompt: 'I want the Pooja Kit' },
      { id: 'vidhi', label: '📖 Learn the Pooja Vidhi', prompt: 'Teach me the Pooja Vidhi' },
    ],
    ganeshFollowUps: [
      { id: 'how', label: '🪔 How to perform Ganesh Pooja', prompt: 'How do I perform Ganesh Pooja?' },
      { id: 'samagri', label: '📋 What Samagri is required', prompt: 'What Samagri is required for Ganesh Pooja?' },
      { id: 'vidhi', label: '📖 Ganesh Pooja Vidhi', prompt: 'Show Ganesh Pooja Vidhi' },
      { id: 'kit', label: '🛍️ Get a Ganesh Pooja Kit', prompt: 'Show me Ganesh Pooja kits' },
    ],
    genericFollowUps: [
      { id: 'samagri', label: '📋 Samagri list', prompt: 'What Samagri do I need for this Pooja?' },
      { id: 'vidhi', label: '📖 Vidhi', prompt: 'Explain the Pooja Vidhi' },
      { id: 'kit', label: '🛍️ Matching kit', prompt: 'Show related Pooja kits' },
      { id: 'priest', label: '🙏 Book Poojari', prompt: 'I want to book a Poojari' },
    ],
  };
}
