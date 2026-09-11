import {
  CurrencyCode,
  Market,
  PrismaClient,
  ProductType,
  PriestBookingStatus,
  PriestServiceMode,
  Rasi,
  PromoDiscountType,
  Role,
  UserStatus,
  VidhiCategory,
  VidhiDifficulty,
  KidsAgeBand,
  PackageAddonType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedPoojaSamagri } from './samagri-catalog';

const prisma = new PrismaClient();

async function upsertVidhi(input: {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: VidhiCategory;
  bestTimeHint: string;
  durationMinutes: number;
  difficulty?: VidhiDifficulty;
  relatedProductSlug?: string;
  tags?: string[];
  sortOrder: number;
  language?: string;
  kathaText?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    transliteration?: string;
    meaning?: string;
  }>;
  mantras?: Array<{
    title: string;
    sanskritText: string;
    transliteration: string;
    meaning: string;
    sortOrder?: number;
  }>;
}) {
  const vidhi = await prisma.pujaVidhi.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      summary: input.summary,
      description: input.description,
      category: input.category,
      bestTimeHint: input.bestTimeHint,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty ?? VidhiDifficulty.BEGINNER,
      relatedProductSlug: input.relatedProductSlug,
      tags: input.tags ?? [],
      kathaText: input.kathaText,
      language: input.language ?? 'en',
      isPublished: true,
      sortOrder: input.sortOrder,
    },
    create: {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      category: input.category,
      bestTimeHint: input.bestTimeHint,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty ?? VidhiDifficulty.BEGINNER,
      relatedProductSlug: input.relatedProductSlug,
      tags: input.tags ?? [],
      kathaText: input.kathaText,
      language: input.language ?? 'en',
      isPublished: true,
      sortOrder: input.sortOrder,
    },
  });

  await prisma.vidhiStep.deleteMany({ where: { vidhiId: vidhi.id } });
  await prisma.vidhiMantra.deleteMany({ where: { vidhiId: vidhi.id } });

  await prisma.vidhiStep.createMany({
    data: input.steps.map((step) => ({
      vidhiId: vidhi.id,
      ...step,
    })),
  });

  if (input.mantras?.length) {
    await prisma.vidhiMantra.createMany({
      data: input.mantras.map((mantra, index) => ({
        vidhiId: vidhi.id,
        title: mantra.title,
        sanskritText: mantra.sanskritText,
        transliteration: mantra.transliteration,
        meaning: mantra.meaning,
        sortOrder: mantra.sortOrder ?? index,
      })),
    });
  }

  return vidhi;
}

async function upsertKit(input: {
  slug: string;
  name: string;
  description: string;
  market: Market;
  currency: CurrencyCode;
  priceMinor: number;
  mrpMinor: number;
  sortOrder: number;
  items: Array<{ name: string; quantity: number; isOptional?: boolean }>;
  i18nTe?: { name: string; description: string; kitItems: string[] };
}) {
  const metadata = input.i18nTe
    ? { i18n: { te: input.i18nTe } }
    : undefined;
  return prisma.product.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      description: input.description,
      priceMinor: input.priceMinor,
      mrpMinor: input.mrpMinor,
      isActive: true,
      sortOrder: input.sortOrder,
      ...(metadata ? { metadata } : {}),
    },
    create: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      type: ProductType.PUJA_KIT,
      market: input.market,
      currency: input.currency,
      priceMinor: input.priceMinor,
      mrpMinor: input.mrpMinor,
      sortOrder: input.sortOrder,
      ...(metadata ? { metadata } : {}),
      kitItems: {
        create: input.items.map((item, index) => ({
          name: item.name,
          quantity: item.quantity,
          isOptional: item.isOptional ?? false,
          sortOrder: index,
        })),
      },
    },
  });
}

async function main() {
  const adminPhone = process.env.SEED_ADMIN_PHONE_E164 ?? '+919999999999';
  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL ?? 'madhukar@techfylabs.com'
  ).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const existingByEmail = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        passwordHash: adminPasswordHash,
        fullName: existingByEmail.fullName || 'Store Admin',
      },
    });
  } else {
    await prisma.user.upsert({
      where: { phoneE164: adminPhone },
      update: {
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        fullName: 'Store Admin',
        market: Market.IN,
        email: adminEmail,
        passwordHash: adminPasswordHash,
      },
      create: {
        phoneE164: adminPhone,
        countryCode: '91',
        phoneNational: adminPhone.replace('+91', ''),
        email: adminEmail,
        passwordHash: adminPasswordHash,
        fullName: 'Store Admin',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        preferredLanguage: 'en',
        market: Market.IN,
      },
    });
  }

  await prisma.user.upsert({
    where: { phoneE164: '+919876543210' },
    update: {},
    create: {
      phoneE164: '+919876543210',
      countryCode: '91',
      phoneNational: '9876543210',
      fullName: 'Aarav Sharma',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'en',
      market: Market.IN,
    },
  });

  await upsertKit({
    slug: 'satyanarayan-puja-kit',
    name: 'Satyanarayan Puja Kit',
    description:
      'Complete kit for Satyanarayan Katha and Puja — includes essentials for a traditional home ceremony.',
    market: Market.IN,
    currency: CurrencyCode.INR,
    priceMinor: 74900,
    mrpMinor: 99900,
    sortOrder: 1,
    items: [
      { name: 'Satyanarayan photo/frame', quantity: 1 },
      { name: 'Kumkum & turmeric', quantity: 1 },
      { name: 'Incense sticks', quantity: 1 },
      { name: 'Camphor', quantity: 1 },
      { name: 'Cotton wicks', quantity: 1 },
      { name: 'Panchamrit ingredients pack', quantity: 1 },
      { name: 'Banana / fruit offering pack guidance card', quantity: 1, isOptional: true },
    ],
    i18nTe: {
      name: 'సత్యనారాయణ స్వామి పూజా కిట్',
      description:
        'సత్యనారాయణ స్వామి కథ, పూజకు కావాల్సిన సామగ్రి — ఇంటి వేడుకకు సంపూర్ణ కిట్.',
      kitItems: [
        'సత్యనారాయణ స్వామి ఫోటో/ఫ్రేమ్',
        'కుంకుమ & పసుపు',
        'అగరబత్తీలు',
        'కర్పూరం',
        'పత్తి వత్తులు',
        'పంచామృత ప్యాక్',
        'అరటి/పండ్ల నైవేద్య మార్గదర్శకం',
      ],
    },
  });

  await upsertKit({
    slug: 'griha-pravesh-kit',
    name: 'Griha Pravesh Kit',
    description:
      'Housewarming kit with items commonly required for Griha Pravesh and Vastu Shanti rituals.',
    market: Market.IN,
    currency: CurrencyCode.INR,
    priceMinor: 149900,
    mrpMinor: 189900,
    sortOrder: 2,
    items: [
      { name: 'Kalash set', quantity: 1 },
      { name: 'Mango leaves pack', quantity: 1 },
      { name: 'Coconut', quantity: 1 },
      { name: 'Haldi-kumkum set', quantity: 1 },
      { name: 'Agarbatti & camphor', quantity: 1 },
      { name: 'Havan samagri (small pack)', quantity: 1 },
    ],
    i18nTe: {
      name: 'గృహప్రవేశ కిట్',
      description: 'గృహప్రవేశం, వాస్తు శాంతికి సాధారణంగా కావాల్సిన సామగ్రి.',
      kitItems: [
        'కలశం సెట్',
        'మామిడి ఆకుల ప్యాక్',
        'కొబ్బరికాయ',
        'పసుపు-కుంకుమ సెట్',
        'అగరబత్తీ & కర్పూరం',
        'హవన సామగ్రి (చిన్న ప్యాక్)',
      ],
    },
  });

  await upsertKit({
    slug: 'vehicle-puja-kit',
    name: 'Vehicle Puja Kit',
    description:
      'Compact kit for new vehicle puja — ideal for cars, bikes, and fleet blessings.',
    market: Market.IN,
    currency: CurrencyCode.INR,
    priceMinor: 49900,
    mrpMinor: 69900,
    sortOrder: 3,
    items: [
      { name: 'Lemon & chili nazar battu pack', quantity: 1 },
      { name: 'Kumkum & rice', quantity: 1 },
      { name: 'Flower garland (freshness note)', quantity: 1 },
      { name: 'Incense & camphor', quantity: 1 },
      { name: 'Small diya set', quantity: 1 },
    ],
    i18nTe: {
      name: 'వాహన పూజా కిట్',
      description: 'కొత్త కారు, బైక్, వాహన పూజకు చిన్న కిట్.',
      kitItems: [
        'నిమ్మకాయ-మిరప నజర్ బట్టు',
        'కుంకుమ & బియ్యం',
        'పూల దండ',
        'అగరబత్తీ & కర్పూరం',
        'చిన్న దీపం సెట్',
      ],
    },
  });

  // US market mirror for Stripe path testing
  await upsertKit({
    slug: 'satyanarayan-puja-kit-us',
    name: 'Satyanarayan Puja Kit (USA)',
    description: 'US-shipped Satyanarayan Puja kit priced in USD.',
    market: Market.US,
    currency: CurrencyCode.USD,
    priceMinor: 4999,
    mrpMinor: 5999,
    sortOrder: 1,
    items: [
      { name: 'Puja essentials pack', quantity: 1 },
      { name: 'Instruction card (EN)', quantity: 1 },
    ],
  });

  const festivalSeeds = [
    {
      date: new Date('2026-09-14T00:00:00.000Z'),
      title: 'Ganesh Chaturthi',
      description:
        'Vinayaka Chaturthi — install Ganesha and begin home shrine worship (civil calendar marker).',
    },
    {
      date: new Date('2026-10-11T00:00:00.000Z'),
      title: 'Sharad Navratri begins',
      description: 'Nine nights of Goddess Durga worship; kalash sthapana on day one.',
    },
    {
      date: new Date('2026-10-20T00:00:00.000Z'),
      title: 'Dussehra / Vijayadashami',
      description: 'Culmination of Navratri — celebrate victory of dharma.',
    },
    {
      date: new Date('2026-11-08T00:00:00.000Z'),
      title: 'Diwali / Deepavali',
      description: 'Festival of lights — Lakshmi Puja at dusk.',
    },
    {
      date: new Date('2026-08-15T00:00:00.000Z'),
      title: 'Independence Day (secular note)',
      description: 'National holiday in India — plan temple visits around local schedules.',
    },
  ];

  for (const festival of festivalSeeds) {
    await prisma.festivalNote.upsert({
      where: {
        date_title: { date: festival.date, title: festival.title },
      },
      update: { description: festival.description },
      create: festival,
    });
  }

  const today = new Date();
  const dateKey = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  await prisma.rasiDailyGuidance.upsert({
    where: { rasi_date: { rasi: Rasi.MESHA, date: dateKey } },
    update: {
      summary: 'Seed guidance: begin the day after sunrise with gratitude.',
      recommendedPuja: 'Surya Namaskaram',
      activity: 'Light home lamp and short japa',
      luckyColor: 'Red',
      luckyDirection: 'East',
      luckyNumber: 9,
      career: 'Take initiative on one clear task.',
      finance: 'Avoid impulsive spending.',
      health: 'Hydrate and stretch.',
      travel: 'Prefer morning travel.',
    },
    create: {
      rasi: Rasi.MESHA,
      date: dateKey,
      summary: 'Seed guidance: begin the day after sunrise with gratitude.',
      recommendedPuja: 'Surya Namaskaram',
      activity: 'Light home lamp and short japa',
      luckyColor: 'Red',
      luckyDirection: 'East',
      luckyNumber: 9,
      career: 'Take initiative on one clear task.',
      finance: 'Avoid impulsive spending.',
      health: 'Hydrate and stretch.',
      travel: 'Prefer morning travel.',
    },
  });

  await upsertVidhi({
    slug: 'satyanarayan-puja',
    title: 'Satyanarayan Puja Vidhi',
    summary: 'Home puja with katha, offerings, and aarti for Lord Satyanarayan.',
    description:
      'A complete beginner-friendly procedure for performing Satyanarayan Puja at home. Pair with the Satyanarayan Puja Kit for materials.',
    category: VidhiCategory.OCCASION,
    bestTimeHint:
      'Prefer Abhijit muhurtham or any shubha gadiyalu after sunrise; avoid Rahu Kalam. Check Today Panchang for your city.',
    durationMinutes: 90,
    difficulty: VidhiDifficulty.BEGINNER,
    relatedProductSlug: 'satyanarayan-puja-kit',
    tags: ['satyanarayan', 'vrat', 'home', 'katha'],
    sortOrder: 1,
    kathaText:
      'Lord Satyanarayan blesses devotees who observe truthfulness and complete the katha with devotion. Families traditionally share prasad after the aarti.',
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare the altar',
        instruction:
          'Clean the puja space. Place Satyanarayan photo/idol facing east or west. Arrange kalash, flowers, fruits, and panchamrit items.',
        meaning: 'A clean, oriented altar sets sankalpa for the puja.',
      },
      {
        stepNumber: 2,
        title: 'Sankalpa',
        instruction:
          'Sit facing the deity. Take a spoon of water in the right hand, state your name, gotram (if known), and intention for the puja, then offer the water.',
        transliteration: 'Mama … gotrasya … satyanarayana pujam karishye',
        meaning: 'Formally commit to completing the puja with devotion.',
      },
      {
        stepNumber: 3,
        title: 'Ganesh invocation',
        instruction:
          'Offer turmeric, kumkum, flowers to Ganesha. Chant Ganesh mantra thrice to remove obstacles.',
      },
      {
        stepNumber: 4,
        title: 'Kalash & main offerings',
        instruction:
          'Invoke Varuna in the kalash. Offer sandal, flowers, incense, lamp, and naivedya to Satyanarayan.',
      },
      {
        stepNumber: 5,
        title: 'Katha & aarti',
        instruction:
          'Read or play the Satyanarayan katha. Conclude with aarti, pushpanjali, and distribute prasad.',
      },
    ],
    mantras: [
      {
        title: 'Ganesh Mantra',
        sanskritText: 'ॐ गं गणपतये नमः',
        transliteration: 'Om Gam Ganapataye Namah',
        meaning: 'Salutations to Lord Ganesha.',
      },
      {
        title: 'Satyanarayan Mantra',
        sanskritText: 'ॐ नमो भगवते सत्यदेवाय',
        transliteration: 'Om Namo Bhagavate Satyadevaya',
        meaning: 'Salutations to the Lord of Truth.',
      },
    ],
  });

  await upsertVidhi({
    slug: 'griha-pravesh',
    title: 'Griha Pravesh Vidhi',
    summary: 'Housewarming ritual for entering a new home with Vastu Shanti.',
    description:
      'Step-by-step Griha Pravesh suitable for families. Use with the Griha Pravesh Kit for kalash and havan essentials.',
    category: VidhiCategory.OCCASION,
    bestTimeHint:
      'Choose an auspicious muhurat day from the calendar; prefer morning after sunrise, avoid Rahu Kalam and Amavasya when possible.',
    durationMinutes: 120,
    difficulty: VidhiDifficulty.INTERMEDIATE,
    relatedProductSlug: 'griha-pravesh-kit',
    tags: ['griha-pravesh', 'housewarming', 'vastu'],
    sortOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Threshold entry',
        instruction:
          'Enter with right foot first, carrying coconut/kalash. Place Ganesha near the entrance.',
      },
      {
        stepNumber: 2,
        title: 'Kalash sthapana',
        instruction:
          'Fill kalash with water, place mango leaves and coconut. Invoke deities and sprinkle water in each room.',
      },
      {
        stepNumber: 3,
        title: 'Vastu Shanti',
        instruction:
          'Perform short havan or lamp offering in the northeast if available. Offer flowers and pray for harmony.',
      },
      {
        stepNumber: 4,
        title: 'Boiling milk & aarti',
        instruction:
          'Boil milk until it overflows (symbolic abundance). Conclude with aarti and share sweets.',
      },
    ],
    mantras: [
      {
        title: 'Vastu Mantra (short)',
        sanskritText: 'ॐ वास्तोष्पते प्रति जानीह्यस्मान्',
        transliteration: 'Om Vastosspate Prati Janihyasman',
        meaning: 'O guardian of the dwelling, know and protect us.',
      },
    ],
  });

  await upsertVidhi({
    slug: 'vehicle-puja',
    title: 'Vehicle Puja Vidhi',
    summary: 'Compact blessing for a new car, bike, or fleet vehicle.',
    description:
      'Quick outdoor-friendly vehicle puja. Pair with the Vehicle Puja Kit.',
    category: VidhiCategory.OCCASION,
    bestTimeHint:
      'Morning after sunrise is preferred; avoid Rahu Kalam. Thursday/Friday mornings are commonly chosen.',
    durationMinutes: 25,
    difficulty: VidhiDifficulty.BEGINNER,
    relatedProductSlug: 'vehicle-puja-kit',
    tags: ['vehicle', 'car', 'bike', 'new'],
    sortOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'Clean & place lemon-chili',
        instruction:
          'Wash the vehicle. Hang lemon-chili nazar battu at the front as per local custom.',
      },
      {
        stepNumber: 2,
        title: 'Apply tilak',
        instruction:
          'Apply kumkum/turmeric tilak on the steering/handle and number plate. Offer flowers.',
      },
      {
        stepNumber: 3,
        title: 'Lamp & mantra',
        instruction:
          'Light incense/diya safely away from fuel areas. Chant Ganesha mantra and take three rounds of aarti around the vehicle.',
      },
      {
        stepNumber: 4,
        title: 'First drive sankalpa',
        instruction:
          'Sit briefly, thank the divine for safe journeys, then take a short first drive if ready.',
      },
    ],
    mantras: [
      {
        title: 'Safe journey prayer',
        sanskritText: 'ॐ श्री गणेशाय नमः',
        transliteration: 'Om Shri Ganeshaya Namah',
        meaning: 'Salutations to Ganesha for obstacle-free travel.',
      },
    ],
  });

  await upsertKidsStory({
    slug: 'ganesh-chaturthi-kids',
    title: 'Ganesha’s Special Day',
    summary: 'Meet kind Ganesha and learn why we celebrate Ganesh Chaturthi.',
    festivalName: 'Ganesh Chaturthi',
    whyCelebrated:
      'We welcome Lord Ganesha, the remover of obstacles, into our homes with love and sweets.',
    importance:
      'Kids learn that starting anything new with respect, kindness, and teamwork brings blessings.',
    ageBand: KidsAgeBand.JUNIOR,
    sortOrder: 1,
    tags: ['ganesha', 'festival', 'modak'],
    pages: [
      {
        pageNumber: 1,
        title: 'Who is Ganesha?',
        body: 'Ganesha has an elephant head and a big heart. He loves learning, music, and helping friends finish hard tasks.',
      },
      {
        pageNumber: 2,
        title: 'Clay Ganesha',
        body: 'Families make or bring home a clay Ganesha murti. Children decorate the shrine with flowers and bright lights.',
      },
      {
        pageNumber: 3,
        title: 'Modak treat',
        body: 'Modaks are Ganesha’s favorite sweet. Sharing prasadam teaches us to give before we take.',
      },
      {
        pageNumber: 4,
        title: 'Visarjan',
        body: 'At the end, we thank Ganesha and immerse the clay murti in water — returning earth to earth with gratitude.',
      },
    ],
    quizTitle: 'Ganesha Quiz',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'What animal head does Ganesha have?',
        options: ['Lion', 'Elephant', 'Horse', 'Tiger'],
        correctIndex: 1,
        explanation: 'Ganesha is shown with an elephant head.',
      },
      {
        prompt: 'Which sweet is special for Ganesha?',
        options: ['Jalebi only', 'Modak', 'Ice cream', 'Popcorn'],
        correctIndex: 1,
      },
      {
        prompt: 'What do we learn from Ganesh Chaturthi?',
        options: [
          'Never share food',
          'Start with kindness and remove obstacles together',
          'Skip saying thank you',
          'Stay angry',
        ],
        correctIndex: 1,
      },
    ],
  });

  await upsertKidsStory({
    slug: 'diwali-kids',
    title: 'Lights of Diwali',
    summary: 'A simple story of Rama’s return and why we light diyas.',
    festivalName: 'Diwali',
    whyCelebrated:
      'Diwali celebrates the victory of light over darkness and good over unkindness.',
    importance:
      'Children practice sharing light, cleaning together, and welcoming guests with joy.',
    ageBand: KidsAgeBand.JUNIOR,
    sortOrder: 2,
    tags: ['diwali', 'rama', 'light'],
    pages: [
      {
        pageNumber: 1,
        title: 'A long journey home',
        body: 'After years away, Rama, Sita, and Lakshmana returned to Ayodhya. People lit lamps so the path home glowed with love.',
      },
      {
        pageNumber: 2,
        title: 'Light every corner',
        body: 'Today we clean our homes and light diyas. Even one small lamp can make a dark room feel safe.',
      },
      {
        pageNumber: 3,
        title: 'Share the glow',
        body: 'We give sweets to neighbors and say kind words. Diwali is happiest when everyone feels included.',
      },
    ],
    quizTitle: 'Diwali Quiz',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'Diwali is mainly a festival of…',
        options: ['Lights', 'Snow', 'Balloons', 'Kites only'],
        correctIndex: 0,
      },
      {
        prompt: 'Who returned home in the Diwali story?',
        options: ['Rama, Sita, and Lakshmana', 'Only Hanuman', 'Only Ravana', 'Nobody'],
        correctIndex: 0,
      },
      {
        prompt: 'What is a kind Diwali habit?',
        options: [
          'Hide all sweets',
          'Share sweets and welcome others',
          'Keep every room messy',
          'Never light a diya',
        ],
        correctIndex: 1,
      },
    ],
  });

  await upsertKidsStory({
    slug: 'holi-kids',
    title: 'Colors of Holi',
    summary: 'Play safely with colors and learn Holi’s message of friendship.',
    festivalName: 'Holi',
    whyCelebrated:
      'Holi welcomes spring and reminds us that love and friendship can melt fear.',
    importance:
      'Kids learn joyful play with consent, safety, and respect for others’ clothes and eyes.',
    ageBand: KidsAgeBand.LITTLE,
    sortOrder: 3,
    tags: ['holi', 'colors', 'spring'],
    pages: [
      {
        pageNumber: 1,
        title: 'Spring is here',
        body: 'Holi arrives with flowers and warm days. Friends meet outdoors to celebrate together.',
      },
      {
        pageNumber: 2,
        title: 'Ask before colors',
        body: 'Always ask before putting color on someone. Kind play means everyone feels safe and happy.',
      },
      {
        pageNumber: 3,
        title: 'Sweet gujiya',
        body: 'Families share gujiya and cool drinks. After playing, we help clean up — that is part of the festival too.',
      },
    ],
    quizTitle: 'Holi Quiz',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'Holi is known as a festival of…',
        options: ['Colors', 'Ice', 'Silence only', 'Homework'],
        correctIndex: 0,
      },
      {
        prompt: 'Before putting color on a friend you should…',
        options: ['Ask them', 'Never ask', 'Run away', 'Hide'],
        correctIndex: 0,
      },
      {
        prompt: 'A caring Holi action is…',
        options: [
          'Throw trash on the ground',
          'Help clean up after play',
          'Ignore friends',
          'Skip sharing sweets',
        ],
        correctIndex: 1,
      },
    ],
  });

  await seedPriests();
  await seedVratsAndPrasad();
  await seedPackages();
  await seedTeluguContent();
  await seedPoojaSamagri(prisma);
  await seedDefaultVendor();

  console.log(
    'Seed completed: admin, kits, samagri, festivals, guidance, vidhis, kids, priests, prasad/vrat, packages, te locale, vendor',
  );
}

async function seedDefaultVendor() {
  const vendorPhone = process.env.VENDOR_PHONE_E164 ?? '+919876543211';
  const vendorName = process.env.VENDOR_NAME ?? 'Packing vendor';
  const defaultVendor = await prisma.vendor.findFirst({
    where: { isDefault: true },
  });
  if (defaultVendor) {
    await prisma.vendor.update({
      where: { id: defaultVendor.id },
      data: {
        name: vendorName,
        phoneE164: vendorPhone,
        isActive: true,
      },
    });
    return;
  }
  const existingPhone = await prisma.vendor.findUnique({
    where: { phoneE164: vendorPhone },
  });
  if (existingPhone) {
    await prisma.vendor.update({
      where: { id: existingPhone.id },
      data: { name: vendorName, isDefault: true, isActive: true },
    });
    return;
  }
  await prisma.vendor.create({
    data: {
      name: vendorName,
      phoneE164: vendorPhone,
      isDefault: true,
      isActive: true,
    },
  });
}

async function seedPriests() {
  const priests = [
    {
      slug: 'pandit-ramesh-sharma',
      fullName: 'Pandit Ramesh Sharma',
      bio: 'Experienced Vedic priest specializing in Satyanarayan Katha and griha ceremonies across Bengaluru.',
      city: 'Bengaluru',
      state: 'Karnataka',
      languages: ['Hindi', 'Kannada', 'English'],
      specializations: ['Satyanarayan', 'Griha Pravesh', 'Wedding'],
      yearsExperience: 18,
      ratingAvg: 4.9,
      ratingCount: 214,
      basePriceMinor: 250000,
      travelFeeMinor: 30000,
      sortOrder: 1,
    },
    {
      slug: 'pandit-srikanth-iyengar',
      fullName: 'Pandit Srikanth Iyengar',
      bio: 'South Indian sampradaya priest for daily and festival pujas, clear Telugu/English guidance for families.',
      city: 'Hyderabad',
      state: 'Telangana',
      languages: ['Telugu', 'English', 'Hindi'],
      specializations: ['Satyanarayan', 'Vehicle Puja', 'Homam'],
      yearsExperience: 12,
      ratingAvg: 4.7,
      ratingCount: 96,
      basePriceMinor: 200000,
      travelFeeMinor: 25000,
      sortOrder: 2,
    },
    {
      slug: 'pandit-ananya-joshi',
      fullName: 'Pandita Ananya Joshi',
      bio: 'Warm, family-friendly priestess focused on naming ceremonies, birthdays, and festival observances.',
      city: 'Bengaluru',
      state: 'Karnataka',
      languages: ['English', 'Hindi', 'Marathi'],
      specializations: ['Naming Ceremony', 'Festival Puja', 'Kids Katha'],
      yearsExperience: 9,
      ratingAvg: 4.8,
      ratingCount: 71,
      basePriceMinor: 220000,
      travelFeeMinor: 20000,
      sortOrder: 3,
    },
  ];

  for (const p of priests) {
    const priest = await prisma.priest.upsert({
      where: { slug: p.slug },
      update: {
        fullName: p.fullName,
        bio: p.bio,
        city: p.city,
        state: p.state,
        languages: p.languages,
        specializations: p.specializations,
        yearsExperience: p.yearsExperience,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        basePriceMinor: p.basePriceMinor,
        travelFeeMinor: p.travelFeeMinor,
        isActive: true,
        sortOrder: p.sortOrder,
      },
      create: {
        ...p,
        market: Market.IN,
        currency: CurrencyCode.INR,
        isActive: true,
      },
    });

    const slots = [];
    const now = new Date();
    for (let day = 1; day <= 5; day += 1) {
      for (const hour of [9, 11, 16]) {
        const startsAt = new Date(now);
        startsAt.setDate(now.getDate() + day);
        startsAt.setHours(hour, 0, 0, 0);
        const endsAt = new Date(startsAt);
        endsAt.setHours(hour + 2, 0, 0, 0);
        slots.push({
          priestId: priest.id,
          startsAt,
          endsAt,
          isBooked: false,
        });
      }
    }
    await prisma.priestSlot.createMany({ data: slots, skipDuplicates: true });
  }

  await seedPoojariDemo();
}

async function seedPoojariDemo() {
  const poojariPhone = process.env.SEED_POOJARI_PHONE_E164 ?? '+919888888888';
  const poojari = await prisma.user.upsert({
    where: { phoneE164: poojariPhone },
    update: {
      role: Role.POOJARI,
      status: UserStatus.ACTIVE,
      fullName: 'Pandit Srikanth Iyengar',
    },
    create: {
      phoneE164: poojariPhone,
      countryCode: '91',
      phoneNational: poojariPhone.replace('+91', ''),
      fullName: 'Pandit Srikanth Iyengar',
      role: Role.POOJARI,
      status: UserStatus.ACTIVE,
      preferredLanguage: 'en',
      market: Market.IN,
    },
  });

  const priest = await prisma.priest.update({
    where: { slug: 'pandit-srikanth-iyengar' },
    data: { userId: poojari.id },
  });

  const customer = await prisma.user.findUnique({
    where: { phoneE164: '+919876543210' },
  });
  if (!customer) return;

  const address =
    (await prisma.address.findFirst({ where: { userId: customer.id } })) ??
    (await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        line1: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'IN',
        isDefault: true,
      },
    }));

  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const todayStart = new Date(`${todayKey}T00:00:00+05:30`);
  const tomorrowKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(todayStart.getTime() + 36 * 60 * 60 * 1000));

  const demos = [
    {
      bookingNumber: 'PBSEEDTODAY',
      startsAt: new Date(`${todayKey}T16:00:00+05:30`),
      serviceName: 'Online consultation',
      serviceMode: PriestServiceMode.ONLINE,
    },
    {
      bookingNumber: 'PBSEEDTOMORROW',
      startsAt: new Date(`${tomorrowKey}T11:00:00+05:30`),
      serviceName: 'Satyanarayan guidance',
      serviceMode: PriestServiceMode.ONLINE,
    },
  ];

  for (const demo of demos) {
    const endsAt = new Date(demo.startsAt.getTime() + 2 * 60 * 60 * 1000);
    const slot = await prisma.priestSlot.upsert({
      where: {
        priestId_startsAt: {
          priestId: priest.id,
          startsAt: demo.startsAt,
        },
      },
      update: { isBooked: true, endsAt },
      create: {
        priestId: priest.id,
        startsAt: demo.startsAt,
        endsAt,
        isBooked: true,
      },
    });

    const room = `PoojaStore${demo.bookingNumber}`;
    await prisma.priestBooking.upsert({
      where: { bookingNumber: demo.bookingNumber },
      update: {
        status: PriestBookingStatus.CONFIRMED,
        serviceMode: demo.serviceMode,
        serviceName: demo.serviceName,
        meetingProvider: 'jitsi',
        meetingId: room,
        meetingJoinUrl: `https://meet.jit.si/${room}`,
        meetingHostUrl: `https://meet.jit.si/${room}`,
        slotId: slot.id,
        priestId: priest.id,
        userId: customer.id,
      },
      create: {
        bookingNumber: demo.bookingNumber,
        userId: customer.id,
        priestId: priest.id,
        slotId: slot.id,
        addressId: address.id,
        serviceName: demo.serviceName,
        serviceMode: demo.serviceMode,
        status: PriestBookingStatus.CONFIRMED,
        market: Market.IN,
        currency: CurrencyCode.INR,
        amountMinor: priest.basePriceMinor,
        meetingProvider: 'jitsi',
        meetingId: room,
        meetingJoinUrl: `https://meet.jit.si/${room}`,
        meetingHostUrl: `https://meet.jit.si/${room}`,
      },
    });
  }
}

async function seedVratsAndPrasad() {
  await upsertKit({
    slug: 'modak-prasad-pack',
    name: 'Modak Prasad Pack',
    description: 'Ready-to-offer modak prasad pack for Ganesh Chaturthi.',
    market: Market.IN,
    currency: CurrencyCode.INR,
    priceMinor: 29900,
    mrpMinor: 39900,
    sortOrder: 10,
    items: [
      { name: 'Fresh modaks (6 pcs)', quantity: 1 },
      { name: 'Offering leaves pack', quantity: 1 },
    ],
  });
  await prisma.product.update({
    where: { slug: 'modak-prasad-pack' },
    data: { type: ProductType.PRASAD },
  });

  await upsertKit({
    slug: 'panchamrit-prasad-pack',
    name: 'Panchamrit Prasad Pack',
    description: 'Panchamrit ingredients pack for Satyanarayan and festival offerings.',
    market: Market.IN,
    currency: CurrencyCode.INR,
    priceMinor: 19900,
    mrpMinor: 24900,
    sortOrder: 11,
    items: [
      { name: 'Milk & curd mix guidance card', quantity: 1 },
      { name: 'Honey, ghee, sugar sachets', quantity: 1 },
    ],
  });
  await prisma.product.update({
    where: { slug: 'panchamrit-prasad-pack' },
    data: { type: ProductType.PRASAD },
  });

  const ekadashi = await prisma.vratGuide.upsert({
    where: { slug: 'ekadashi' },
    update: {
      title: 'Ekadashi Vrat',
      summary: 'Sacred eleventh-day fast for Vishnu devotion and clarity.',
      description:
        'Ekadashi is observed twice a month. Many devotees keep a grain-free fast and spend time in prayer, japa, and sattvic rest.',
      durationHint: 'Sunrise to next-day sunrise (or moonrise break as per family custom)',
      allowedFoods: ['Fruits', 'Milk', 'Sabudana', 'Potato (family custom)', 'Nuts'],
      avoidFoods: ['Rice', 'Wheat', 'Pulses', 'Onion', 'Garlic', 'Non-veg'],
      breakFastHow:
        'Break with water/tulsi and light sattvic food after the prescribed time; thank Vishnu and share prasad if available.',
      associatedPuja: 'Vishnu / Satyanarayan remembrance',
      relatedVidhiSlug: 'satyanarayan-puja',
      isPublished: true,
      sortOrder: 1,
    },
    create: {
      slug: 'ekadashi',
      title: 'Ekadashi Vrat',
      summary: 'Sacred eleventh-day fast for Vishnu devotion and clarity.',
      description:
        'Ekadashi is observed twice a month. Many devotees keep a grain-free fast and spend time in prayer, japa, and sattvic rest.',
      durationHint: 'Sunrise to next-day sunrise (or moonrise break as per family custom)',
      allowedFoods: ['Fruits', 'Milk', 'Sabudana', 'Potato (family custom)', 'Nuts'],
      avoidFoods: ['Rice', 'Wheat', 'Pulses', 'Onion', 'Garlic', 'Non-veg'],
      breakFastHow:
        'Break with water/tulsi and light sattvic food after the prescribed time; thank Vishnu and share prasad if available.',
      associatedPuja: 'Vishnu / Satyanarayan remembrance',
      relatedVidhiSlug: 'satyanarayan-puja',
      tags: ['vishnu', 'ekadashi'],
      isPublished: true,
      sortOrder: 1,
    },
  });

  const pradosh = await prisma.vratGuide.upsert({
    where: { slug: 'pradosh' },
    update: {
      title: 'Pradosh Vrat',
      summary: 'Twilight Shiva vrat for peace and obstacle removal.',
      description:
        'Pradosh falls on trayodashi evenings. Devotees often fast by day and worship Shiva during twilight.',
      durationHint: 'Day fast; worship during pradosh kaal (evening twilight)',
      allowedFoods: ['Fruits', 'Milk', 'Water'],
      avoidFoods: ['Grains (strict observers)', 'Onion', 'Garlic', 'Non-veg'],
      breakFastHow:
        'After evening Shiva puja/aarti, break with light sattvic food or milk as per tradition.',
      associatedPuja: 'Shiva Abhishekam / Bilva offering',
      isPublished: true,
      sortOrder: 2,
    },
    create: {
      slug: 'pradosh',
      title: 'Pradosh Vrat',
      summary: 'Twilight Shiva vrat for peace and obstacle removal.',
      description:
        'Pradosh falls on trayodashi evenings. Devotees often fast by day and worship Shiva during twilight.',
      durationHint: 'Day fast; worship during pradosh kaal (evening twilight)',
      allowedFoods: ['Fruits', 'Milk', 'Water'],
      avoidFoods: ['Grains (strict observers)', 'Onion', 'Garlic', 'Non-veg'],
      breakFastHow:
        'After evening Shiva puja/aarti, break with light sattvic food or milk as per tradition.',
      associatedPuja: 'Shiva Abhishekam / Bilva offering',
      tags: ['shiva', 'pradosh'],
      isPublished: true,
      sortOrder: 2,
    },
  });

  const sankashti = await prisma.vratGuide.upsert({
    where: { slug: 'sankashti-chaturthi' },
    update: {
      title: 'Sankashti Chaturthi',
      summary: 'Monthly Ganesha vrat for removing hardships.',
      description:
        'Observed on Krishna Paksha Chaturthi. Devotees fast and break the fast after moonrise with Ganesha prayers.',
      durationHint: 'Sunrise until moonrise',
      allowedFoods: ['Fruits', 'Milk', 'Sabudana khichdi', 'Peanuts'],
      avoidFoods: ['Regular grains (strict)', 'Non-veg', 'Alcohol'],
      breakFastHow:
        'After moonrise darshan/prayer, offer modak or fruit to Ganesha, then break the fast.',
      associatedPuja: 'Ganesha puja',
      isPublished: true,
      sortOrder: 3,
    },
    create: {
      slug: 'sankashti-chaturthi',
      title: 'Sankashti Chaturthi',
      summary: 'Monthly Ganesha vrat for removing hardships.',
      description:
        'Observed on Krishna Paksha Chaturthi. Devotees fast and break the fast after moonrise with Ganesha prayers.',
      durationHint: 'Sunrise until moonrise',
      allowedFoods: ['Fruits', 'Milk', 'Sabudana khichdi', 'Peanuts'],
      avoidFoods: ['Regular grains (strict)', 'Non-veg', 'Alcohol'],
      breakFastHow:
        'After moonrise darshan/prayer, offer modak or fruit to Ganesha, then break the fast.',
      associatedPuja: 'Ganesha puja',
      tags: ['ganesha', 'chaturthi'],
      isPublished: true,
      sortOrder: 3,
    },
  });

  const dateSeeds = [
    { vratId: ekadashi.id, date: '2026-08-19', note: 'Civil marker — confirm with local panchang' },
    { vratId: ekadashi.id, date: '2026-09-03', note: 'Civil marker — confirm with local panchang' },
    { vratId: pradosh.id, date: '2026-08-21', note: 'Evening twilight worship' },
    { vratId: sankashti.id, date: '2026-08-31', note: 'Break after moonrise' },
  ];
  for (const occ of dateSeeds) {
    await prisma.vratOccurrence.upsert({
      where: {
        vratId_date: {
          vratId: occ.vratId,
          date: new Date(`${occ.date}T00:00:00.000Z`),
        },
      },
      update: { note: occ.note },
      create: {
        vratId: occ.vratId,
        date: new Date(`${occ.date}T00:00:00.000Z`),
        note: occ.note,
      },
    });
  }

  await upsertPrasadRecipe({
    slug: 'ukadiche-modak',
    title: 'Ukadiche Modak',
    summary: 'Steamed sweet dumplings — Ganesha’s favorite prasad.',
    festivalName: 'Ganesh Chaturthi',
    description:
      'A classic Maharashtrian modak with coconut-jaggery filling. Offer with devotion, then share as prasad.',
    servings: 8,
    prepMinutes: 60,
    ingredients: [
      'Rice flour 1 cup',
      'Grated coconut 1 cup',
      'Jaggery 3/4 cup',
      'Cardamom',
      'Ghee',
      'Water & pinch of salt',
    ],
    relatedProductSlug: 'modak-prasad-pack',
    sortOrder: 1,
    steps: [
      {
        stepNumber: 1,
        title: 'Make filling',
        instruction: 'Cook coconut and jaggery on low heat until sticky; add cardamom and cool.',
      },
      {
        stepNumber: 2,
        title: 'Prepare dough',
        instruction: 'Cook rice flour in hot water with ghee/salt into a soft dough; knead while warm.',
      },
      {
        stepNumber: 3,
        title: 'Shape & steam',
        instruction: 'Form modaks, fill, seal pleats, and steam 10–12 minutes. Offer to Ganesha.',
      },
    ],
  });

  await upsertPrasadRecipe({
    slug: 'panchamrit',
    title: 'Panchamrit',
    summary: 'Five-nectar offering used in many home pujas.',
    festivalName: 'Satyanarayan / Daily',
    description:
      'Blend milk, curd, ghee, honey, and sugar (or banana variation as per family tradition) for abhishekam and prasad.',
    servings: 6,
    prepMinutes: 10,
    ingredients: ['Milk', 'Curd', 'Ghee', 'Honey', 'Sugar', 'Optional banana'],
    relatedProductSlug: 'panchamrit-prasad-pack',
    sortOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Mix gently',
        instruction: 'Combine all five ingredients in a clean bowl; stir until smooth.',
      },
      {
        stepNumber: 2,
        title: 'Offer & share',
        instruction: 'Use for abhishekam if custom allows, then distribute as prasad.',
      },
    ],
  });

  await upsertPrasadRecipe({
    slug: 'sheera-halwa',
    title: 'Sheera (Suji Halwa)',
    summary: 'Quick festive sheera for offerings and family sharing.',
    festivalName: 'Common festivals',
    description: 'Roasted rava cooked with ghee, sugar, and milk/water — simple satvik prasad.',
    servings: 4,
    prepMinutes: 25,
    ingredients: ['Rava/suji', 'Ghee', 'Sugar', 'Milk or water', 'Cardamom', 'Cashews'],
    sortOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'Roast',
        instruction: 'Roast rava in ghee until aromatic and light golden.',
      },
      {
        stepNumber: 2,
        title: 'Cook',
        instruction: 'Add hot milk/water carefully, cook, then stir in sugar and cardamom.',
      },
    ],
  });
}

async function upsertPrasadRecipe(input: {
  slug: string;
  title: string;
  summary: string;
  festivalName: string;
  description: string;
  servings: number;
  prepMinutes: number;
  ingredients: string[];
  relatedProductSlug?: string;
  sortOrder: number;
  steps: Array<{ stepNumber: number; title?: string; instruction: string }>;
}) {
  const recipe = await prisma.prasadRecipe.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      summary: input.summary,
      festivalName: input.festivalName,
      description: input.description,
      servings: input.servings,
      prepMinutes: input.prepMinutes,
      ingredients: input.ingredients,
      relatedProductSlug: input.relatedProductSlug,
      isPublished: true,
      sortOrder: input.sortOrder,
    },
    create: {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      festivalName: input.festivalName,
      description: input.description,
      servings: input.servings,
      prepMinutes: input.prepMinutes,
      ingredients: input.ingredients,
      relatedProductSlug: input.relatedProductSlug,
      isPublished: true,
      sortOrder: input.sortOrder,
    },
  });

  await prisma.prasadRecipeStep.deleteMany({ where: { recipeId: recipe.id } });
  await prisma.prasadRecipeStep.createMany({
    data: input.steps.map((step) => ({
      recipeId: recipe.id,
      stepNumber: step.stepNumber,
      title: step.title,
      instruction: step.instruction,
    })),
  });
}

async function upsertKidsStory(input: {
  slug: string;
  title: string;
  summary: string;
  festivalName: string;
  whyCelebrated: string;
  importance: string;
  ageBand: KidsAgeBand;
  sortOrder: number;
  language?: string;
  tags?: string[];
  pages: Array<{
    pageNumber: number;
    title?: string;
    body: string;
  }>;
  quizTitle: string;
  quizPassScore: number;
  quizQuestions: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}) {
  const story = await prisma.kidsStory.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      summary: input.summary,
      festivalName: input.festivalName,
      whyCelebrated: input.whyCelebrated,
      importance: input.importance,
      ageBand: input.ageBand,
      tags: input.tags ?? [],
      language: input.language ?? 'en',
      isPublished: true,
      sortOrder: input.sortOrder,
    },
    create: {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      festivalName: input.festivalName,
      whyCelebrated: input.whyCelebrated,
      importance: input.importance,
      ageBand: input.ageBand,
      tags: input.tags ?? [],
      language: input.language ?? 'en',
      isPublished: true,
      sortOrder: input.sortOrder,
    },
  });

  await prisma.kidsStoryPage.deleteMany({ where: { storyId: story.id } });
  await prisma.kidsStoryPage.createMany({
    data: input.pages.map((page) => ({
      storyId: story.id,
      pageNumber: page.pageNumber,
      title: page.title,
      body: page.body,
    })),
  });

  const quiz = await prisma.kidsQuiz.upsert({
    where: { storyId: story.id },
    update: {
      title: input.quizTitle,
      passScore: input.quizPassScore,
    },
    create: {
      storyId: story.id,
      title: input.quizTitle,
      passScore: input.quizPassScore,
    },
  });

  await prisma.kidsQuizQuestion.deleteMany({ where: { quizId: quiz.id } });
  await prisma.kidsQuizQuestion.createMany({
    data: input.quizQuestions.map((q, index) => ({
      quizId: quiz.id,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      sortOrder: index,
    })),
  });
}

async function seedPackages() {
  await prisma.pujaPackage.upsert({
    where: { slug: 'satyanarayan-complete' },
    update: {
      title: 'Satyanarayan Complete Home Package',
      summary: 'Kit + priest + optional prasad — one checkout.',
      description:
        'Everything for a home Satyanarayan puja: essentials kit, pandit booking, and optional prasad pack. Add catering or ceremonial services if needed.',
      allowsKit: true,
      kitProductSlug: 'satyanarayan-puja-kit',
      allowsPriest: true,
      allowsPrasad: true,
      prasadProductSlug: 'panchamrit-prasad-pack',
      packageDiscountMinor: 20000,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      slug: 'satyanarayan-complete',
      title: 'Satyanarayan Complete Home Package',
      summary: 'Kit + priest + optional prasad — one checkout.',
      description:
        'Everything for a home Satyanarayan puja: essentials kit, pandit booking, and optional prasad pack. Add catering or ceremonial services if needed.',
      market: Market.IN,
      currency: CurrencyCode.INR,
      allowsKit: true,
      kitProductSlug: 'satyanarayan-puja-kit',
      allowsPriest: true,
      allowsPrasad: true,
      prasadProductSlug: 'panchamrit-prasad-pack',
      packageDiscountMinor: 20000,
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.pujaPackage.upsert({
    where: { slug: 'griha-pravesh-essentials' },
    update: {
      title: 'Griha Pravesh Essentials',
      summary: 'Housewarming kit with priest visit option.',
      description:
        'Bundle the Griha Pravesh kit with an optional priest slot for Vastu Shanti and entry rituals.',
      allowsKit: true,
      kitProductSlug: 'griha-pravesh-kit',
      allowsPriest: true,
      allowsPrasad: false,
      packageDiscountMinor: 15000,
      isActive: true,
      sortOrder: 2,
    },
    create: {
      slug: 'griha-pravesh-essentials',
      title: 'Griha Pravesh Essentials',
      summary: 'Housewarming kit with priest visit option.',
      description:
        'Bundle the Griha Pravesh kit with an optional priest slot for Vastu Shanti and entry rituals.',
      market: Market.IN,
      currency: CurrencyCode.INR,
      allowsKit: true,
      kitProductSlug: 'griha-pravesh-kit',
      allowsPriest: true,
      allowsPrasad: false,
      packageDiscountMinor: 15000,
      isActive: true,
      sortOrder: 2,
    },
  });

  const addons = [
    {
      slug: 'sattvic-catering-20',
      title: 'Sattvic Catering (20 guests)',
      description: 'Simple sattvic meal service for post-puja gathering.',
      type: PackageAddonType.CATERING,
      priceMinor: 499900,
      sortOrder: 1,
    },
    {
      slug: 'nadaswaram-band',
      title: 'Nadaswaram / Ceremonial Band',
      description: 'Traditional ceremonial music for muhurat moments.',
      type: PackageAddonType.BAND,
      priceMinor: 799900,
      sortOrder: 2,
    },
    {
      slug: 'local-temple-transfer',
      title: 'Local Temple Transfer',
      description: 'Round-trip local transfer for temple visit after home puja.',
      type: PackageAddonType.TRAVEL,
      priceMinor: 149900,
      sortOrder: 3,
    },
  ];

  for (const addon of addons) {
    await prisma.packageAddon.upsert({
      where: { slug: addon.slug },
      update: {
        title: addon.title,
        description: addon.description,
        type: addon.type,
        priceMinor: addon.priceMinor,
        isActive: true,
        sortOrder: addon.sortOrder,
      },
      create: {
        ...addon,
        market: Market.IN,
        currency: CurrencyCode.INR,
        isActive: true,
      },
    });
  }
}

async function seedTeluguContent() {
  await upsertVidhi({
    slug: 'satyanarayan-puja-te',
    language: 'te',
    title: 'సత్యనారాయణ స్వామి పూజా విధి',
    summary: 'ఇంట్లో సత్యనారాయణ స్వామి కథ, నైవేద్యం, హారతి.',
    description:
      'ఇంట్లో సత్యనారాయణ స్వామి పూజ చేయడానికి సులభమైన విధి. సామగ్రికి సత్యనారాయణ స్వామి పూజా కిట్ వాడండి.',
    category: VidhiCategory.OCCASION,
    bestTimeHint:
      'అభిజిత్ ముహూర్తం లేదా సూర్యోదయం తర్వాత శుభ ఘడియలు; రాహు కాలం మానండి.',
    durationMinutes: 90,
    difficulty: VidhiDifficulty.BEGINNER,
    relatedProductSlug: 'satyanarayan-puja-kit',
    tags: ['satyanarayan', 'vrat', 'home', 'katha'],
    sortOrder: 1,
    kathaText:
      'సత్యం పాటించి కథ పూర్తి చేసిన భక్తులను సత్యనారాయణ స్వామి ఆశీర్వదిస్తాడు. హారతి తర్వాత ప్రసాదం పంచుకోండి.',
    steps: [
      {
        stepNumber: 1,
        title: 'వేదిక సిద్ధం చేయండి',
        instruction:
          'పూజా స్థలం శుభ్రం చేసి, తూర్పు లేదా పడమర వైపు విగ్రహం/ఫోటో పెట్టండి. కలశం, పూలు, పండ్లు, పంచామృతం అమర్చండి.',
        meaning: 'శుభ్రమైన వేదిక సంకల్పానికి ఆధారం.',
      },
      {
        stepNumber: 2,
        title: 'సంకల్పం',
        instruction:
          'దేవుని వైపు కూర్చుని, కుడి చేతిలో నీళ్లు తీసుకుని పేరు, గోత్రం, ఉద్దేశం చెప్పి నీళ్లు సమర్పించండి.',
        meaning: 'భక్తితో పూజ పూర్తి చేస్తానని నిశ్చయం.',
      },
      {
        stepNumber: 3,
        title: 'గణేశ ఆవాహన',
        instruction:
          'పసుపు, కుంకుమ, పూలు సమర్పించి గణేశ మంత్రం మూడుసార్లు చదవండి.',
      },
      {
        stepNumber: 4,
        title: 'కలశం & నైవేద్యం',
        instruction:
          'కలశంలో వరుణుని ఆవహించి, చందనం, పూలు, ధూపం, దీపం, నైవేద్యం సమర్పించండి.',
      },
      {
        stepNumber: 5,
        title: 'కథ & హారతి',
        instruction:
          'సత్యనారాయణ స్వామి కథ చదవండి లేదా వినండి. హారతి, పుష్పాంజలి తర్వాత ప్రసాదం పంచండి.',
      },
    ],
    mantras: [
      {
        title: 'గణేశ మంత్రం',
        sanskritText: 'ॐ गं गणपतये नमः',
        transliteration: 'Om Gam Ganapataye Namah',
        meaning: 'వినాయకునికి నమస్కారం.',
      },
      {
        title: 'సత్యనారాయణ స్వామి మంత్రం',
        sanskritText: 'ॐ नमो भगवते सत्यदेवाय',
        transliteration: 'Om Namo Bhagavate Satyadevaya',
        meaning: 'సత్యదేవునికి నమస్కారం.',
      },
    ],
  });

  await upsertVidhi({
    slug: 'griha-pravesh-te',
    language: 'te',
    title: 'గృహప్రవేశ విధి',
    summary: 'కొత్త ఇంట్లోకి వాస్తు శాంతితో ప్రవేశం.',
    description: 'కుటుంబాలకు సులభమైన గృహప్రవేశ విధి. గృహప్రవేశ కిట్ వాడండి.',
    category: VidhiCategory.OCCASION,
    bestTimeHint: 'క్యాలెండర్‌లో శుభ ముహూర్తం; ఉదయం మంచిది, రాహు కాలం మానండి.',
    durationMinutes: 120,
    difficulty: VidhiDifficulty.INTERMEDIATE,
    relatedProductSlug: 'griha-pravesh-kit',
    tags: ['griha-pravesh', 'housewarming', 'vastu'],
    sortOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'గడప దాటడం',
        instruction:
          'కుడి కాలు ముందుగా, కొబ్బరికాయ/కలశంతో ప్రవేశించండి. ద్వారం దగ్గర గణేశుని ఉంచండి.',
      },
      {
        stepNumber: 2,
        title: 'కలశ స్థాపన',
        instruction:
          'కలశంలో నీళ్లు, మామిడి ఆకులు, కొబ్బరికాయ. ప్రతి గదిలో నీళ్లు చల్లండి.',
      },
      {
        stepNumber: 3,
        title: 'వాస్తు శాంతి',
        instruction:
          'ఈశాన్యంలో సంక్షిప్త హోమం లేదా దీపారాధన చేసి శాంతికి ప్రార్థించండి.',
      },
      {
        stepNumber: 4,
        title: 'పాలు మరుగుట & హారతి',
        instruction:
          'పాలు పొంగేలా మరగబెట్టండి (సమృద్ధి). హారతి తర్వాత మిఠాయి పంచండి.',
      },
    ],
    mantras: [
      {
        title: 'వాస్తు మంత్రం',
        sanskritText: 'ॐ वास्तोष्पते प्रति जानीह्यस्मान्',
        transliteration: 'Om Vastosspate Prati Janihyasman',
        meaning: 'ఇంటి రక్షకుడా, మమ్మల్ని కాపాడు.',
      },
    ],
  });

  await upsertVidhi({
    slug: 'vehicle-puja-te',
    language: 'te',
    title: 'వాహన పూజా విధి',
    summary: 'కొత్త కారు, బైక్ ఆశీర్వాదం.',
    description: 'వేగంగా చేసుకునే వాహన పూజ. వాహన పూజా కిట్ వాడండి.',
    category: VidhiCategory.OCCASION,
    bestTimeHint: 'సూర్యోదయం తర్వాత; రాహు కాలం మానండి. గురువారం/శుక్రవారం ఉదయం మంచిది.',
    durationMinutes: 25,
    difficulty: VidhiDifficulty.BEGINNER,
    relatedProductSlug: 'vehicle-puja-kit',
    tags: ['vehicle', 'car', 'bike', 'new'],
    sortOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'శుభ్రం & నిమ్మ-మిరప',
        instruction: 'వాహనం కడిగి, ముందు నిమ్మకాయ-మిరప నజర్ బట్టు వేయండి.',
      },
      {
        stepNumber: 2,
        title: 'తిలకం',
        instruction:
          'స్టీరింగ్/హ్యాండిల్, నంబర్ ప్లేట్‌పై కుంకుమ తిలకం, పూలు సమర్పించండి.',
      },
      {
        stepNumber: 3,
        title: 'దీపం & మంత్రం',
        instruction:
          'ఇంధనం దూరంగా దీపం/ధూపం. గణేశ మంత్రం చెప్పి మూడుసార్లు హారతి.',
      },
      {
        stepNumber: 4,
        title: 'మొదటి ప్రయాణం',
        instruction: 'సురక్షిత ప్రయాణాలకు ప్రార్థించి చిన్న ప్రయాణం చేయండి.',
      },
    ],
    mantras: [
      {
        title: 'సురక్షిత ప్రయాణ ప్రార్థన',
        sanskritText: 'ॐ श्री गणेशाय नमः',
        transliteration: 'Om Shri Ganeshaya Namah',
        meaning: 'నిర్విఘ్న ప్రయాణానికి గణేశునికి నమస్కారం.',
      },
    ],
  });

  await upsertKidsStory({
    slug: 'ganesh-chaturthi-kids-te',
    language: 'te',
    title: 'వినాయకుని ప్రత్యేక రోజు',
    summary: 'దయగల గణేశుణ్ణి కలుసుకుని వినాయక చవితి ఎందుకో తెలుసుకోండి.',
    festivalName: 'వినాయక చవితి',
    whyCelebrated:
      'ఆటంకాలు తొలగించే గణేశుణ్ణి ఇంట్లోకి ప్రేమతో, మిఠాయితో ఆహ్వానిస్తాం.',
    importance: 'కొత్త పని దయ, గౌరవం, జట్టు పనితో మొదలుపెడితే ఆశీర్వాదం ఉంటుంది.',
    ageBand: KidsAgeBand.JUNIOR,
    sortOrder: 1,
    tags: ['ganesha', 'festival', 'modak'],
    pages: [
      {
        pageNumber: 1,
        title: 'గణేశుడు ఎవరు?',
        body: 'గణేశునికి ఏనుగు తల, పెద్ద హృదయం. చదువు, సంగీతం, స్నేహితులకు సహాయం ఇష్టం.',
      },
      {
        pageNumber: 2,
        title: 'మట్టి వినాయకుడు',
        body: 'ఇంట్లో మట్టి వినాయకుణ్ణి తెచ్చి పూలు, దీపాలతో అలంకరిస్తాం.',
      },
      {
        pageNumber: 3,
        title: 'కుడుము',
        body: 'కుడుములు గణేశునికి ఇష్టం. ప్రసాదం పంచుకోవడం నేర్పుతుంది.',
      },
      {
        pageNumber: 4,
        title: 'విసర్జన',
        body: 'చివరగా కృతజ్ఞతతో మట్టి విగ్రహాన్ని నీటిలో విడుదల చేస్తాం.',
      },
    ],
    quizTitle: 'గణేశ క్విజ్',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'గణేశునికి ఏ జంతువు తల ఉంటుంది?',
        options: ['సింహం', 'ఏనుగు', 'గుర్రం', 'పులి'],
        correctIndex: 1,
        explanation: 'గణేశుణ్ణి ఏనుగు తలతో చూపిస్తారు.',
      },
      {
        prompt: 'గణేశునికి ప్రత్యేకమైన మిఠాయి ఏది?',
        options: ['జిలేబీ మాత్రమే', 'కుడుము', 'ఐస్ క్రీమ్', 'పాప్‌కార్న్'],
        correctIndex: 1,
      },
      {
        prompt: 'వినాయక చవితి నుంచి నేర్చుకునేది?',
        options: [
          'ఆహారం పంచకూడదు',
          'దయతో మొదలుపెట్టి ఆటంకాలు కలిసి తొలగించడం',
          'ధన్యవాదాలు చెప్పకూడదు',
          'కోపంగా ఉండటం',
        ],
        correctIndex: 1,
      },
    ],
  });

  await upsertKidsStory({
    slug: 'diwali-kids-te',
    language: 'te',
    title: 'దీపావళి వెలుగులు',
    summary: 'రాముని తిరిగి రాక, దీపాలు వెలిగించడం గురించి సరళ కథ.',
    festivalName: 'దీపావళి',
    whyCelebrated: 'చీకటిపై వెలుగు, అధర్మంపై ధర్మం విజయం.',
    importance: 'కలిసి శుభ్రం చేయడం, అతిథులను స్వాగతించడం నేర్చుకుంటారు.',
    ageBand: KidsAgeBand.JUNIOR,
    sortOrder: 2,
    tags: ['diwali', 'rama', 'light'],
    pages: [
      {
        pageNumber: 1,
        title: 'ఇంటికి ప్రయాణం',
        body: 'చాలా సంవత్సరాల తర్వాత రాముడు, సీత, లక్ష్మణుడు అయోధ్యకు వచ్చారు. ప్రజలు దీపాలు వెలిగించారు.',
      },
      {
        pageNumber: 2,
        title: 'ప్రతి మూలలో వెలుగు',
        body: 'ఇంటిని శుభ్రం చేసి దీపాలు వెలిగిస్తాం. ఒక చిన్న దీపం కూడా గదిని కాంతివంతం చేస్తుంది.',
      },
      {
        pageNumber: 3,
        title: 'వెలుగు పంచుకోండి',
        body: 'పొరుగువారికి మిఠాయి ఇవ్వండి. అందరూ కలిసి ఉంటే దీపావళి మరింత ఆనందం.',
      },
    ],
    quizTitle: 'దీపావళి క్విజ్',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'దీపావళి ప్రధానంగా ఏ పండుగ?',
        options: ['వెలుగులు', 'మంచు', 'బెలూన్లు', 'గాలిపటాలు మాత్రమే'],
        correctIndex: 0,
      },
      {
        prompt: 'కథలో ఇంటికి తిరిగి వచ్చింది ఎవరు?',
        options: ['రాముడు, సీత, లక్ష్మణుడు', 'హనుమంతుడు మాత్రమే', 'రావణుడు', 'ఎవరూ లేరు'],
        correctIndex: 0,
      },
      {
        prompt: 'మంచి దీపావళి అలవాటు?',
        options: [
          'మిఠాయి దాచడం',
          'మిఠాయి పంచి అందరినీ స్వాగతించడం',
          'గదులు అపరిశుభ్రంగా ఉంచడం',
          'దీపం వెలిగించకపోవడం',
        ],
        correctIndex: 1,
      },
    ],
  });

  await upsertKidsStory({
    slug: 'holi-kids-te',
    language: 'te',
    title: 'హోలీ రంగులు',
    summary: 'సురక్షితంగా రంగులు ఆడి స్నేహం నేర్చుకోండి.',
    festivalName: 'హోలీ',
    whyCelebrated: 'వసంతం, ప్రేమ, స్నేహం భయాన్ని తొలగిస్తాయని గుర్తు చేస్తుంది.',
    importance: 'అనుమతితో, కళ్లు/బట్టల గౌరవంతో ఆడాలి.',
    ageBand: KidsAgeBand.LITTLE,
    sortOrder: 3,
    tags: ['holi', 'colors', 'spring'],
    pages: [
      {
        pageNumber: 1,
        title: 'వసంతం వచ్చింది',
        body: 'పూలు, వెచ్చని రోజులతో హోలీ వస్తుంది. స్నేహితులు బయట కలుసుకుంటారు.',
      },
      {
        pageNumber: 2,
        title: 'రంగు వేయడానికి అడగండి',
        body: 'ఎవరిపై రంగు వేయాలంటే ముందు అడగండి. అందరూ సురక్షితంగా ఉండాలి.',
      },
      {
        pageNumber: 3,
        title: 'గుజియా',
        body: 'గుజియా, చల్లని పానీయాలు పంచుకోండి. ఆడిన తర్వాత శుభ్రం చేయడం కూడా పండుగే.',
      },
    ],
    quizTitle: 'హోలీ క్విజ్',
    quizPassScore: 2,
    quizQuestions: [
      {
        prompt: 'హోలీ ఏ పండుగగా ప్రసిద్ధి?',
        options: ['రంగులు', 'మంచు', 'నిశ్శబ్దం', 'హోంవర్క్'],
        correctIndex: 0,
      },
      {
        prompt: 'స్నేహితునిపై రంగు వేయడానికి ముందు?',
        options: ['అడగాలి', 'అడగకూడదు', 'పారిపోవాలి', 'దాక్కోవాలి'],
        correctIndex: 0,
      },
      {
        prompt: 'ప్రేమగల హోలీ పని?',
        options: [
          'చెత్త విసరడం',
          'ఆట తర్వాత శుభ్రం చేయడం',
          'స్నేహితులను పట్టించుకోకపోవడం',
          'మిఠాయి పంచకపోవడం',
        ],
        correctIndex: 1,
      },
    ],
  });

  await prisma.promoCode.upsert({
    where: { code: 'PAVITRA10' },
    update: {
      description: '10% off Pavitra Seva kits and samagri',
      discountType: PromoDiscountType.PERCENT,
      percentOff: 10,
      amountMinor: null,
      minSubtotalMinor: 0,
      maxDiscountMinor: null,
      isActive: true,
    },
    create: {
      code: 'PAVITRA10',
      description: '10% off Pavitra Seva kits and samagri',
      discountType: PromoDiscountType.PERCENT,
      percentOff: 10,
      isActive: true,
    },
  });
  await prisma.promoCode.upsert({
    where: { code: 'GANESH10' },
    update: {
      description: '10% off Ganesh Chaturthi kits',
      discountType: PromoDiscountType.PERCENT,
      percentOff: 10,
      amountMinor: null,
      minSubtotalMinor: 0,
      maxDiscountMinor: null,
      isActive: true,
    },
    create: {
      code: 'GANESH10',
      description: '10% off Ganesh Chaturthi kits',
      discountType: PromoDiscountType.PERCENT,
      percentOff: 10,
      isActive: true,
    },
  });
  await prisma.promoCode.upsert({
    where: { code: 'GANESH50' },
    update: {},
    create: {
      code: 'GANESH50',
      description: '₹50 off festival kits',
      discountType: PromoDiscountType.FIXED,
      amountMinor: 5000,
      minSubtotalMinor: 29900,
      isActive: true,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
