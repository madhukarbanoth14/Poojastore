export type Locale = "en" | "te";

export type KitItem = {
  id: string;
  name: string;
  quantity: number;
  isOptional: boolean;
};

export type SelectableItem = {
  key: string;
  name: string;
  priceMinor: number;
  optional?: boolean;
  pack?: string | null;
  quantity?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  market: string;
  currency: string;
  priceMinor: number;
  mrpMinor?: number | null;
  imageUrl?: string | null;
  kitItems?: KitItem[];
  selectableItems?: SelectableItem[];
  festival?: string;
};

export type PriestSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
};

export type Priest = {
  id: string;
  slug: string;
  fullName: string;
  bio: string;
  city: string;
  state: string;
  languages: string[];
  specializations: string[];
  yearsExperience: number;
  ratingAvg: number;
  ratingCount: number;
  photoUrl?: string | null;
  basePriceMinor: number;
  travelFeeMinor?: number;
  currency: string;
  _count?: { slots: number };
  slots?: PriestSlot[];
};

export type Vidhi = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  language: string;
  durationMinutes?: number | null;
  difficulty?: string | null;
  coverImageUrl?: string | null;
  relatedProductSlug?: string | null;
  tags?: string[];
  _count?: { steps: number; mantras: number };
  description?: string;
  bestTimeHint?: string | null;
  steps?: { id: string; stepNumber: number; title: string; body: string }[];
  mantras?: { id: string; title: string; text: string }[];
};

export type PujaPackage = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  currency: string;
  allowsKit: boolean;
  allowsPriest: boolean;
  allowsPrasad: boolean;
  packageDiscountMinor: number;
  coverImageUrl?: string | null;
  kit?: Product | null;
  prasad?: Product | null;
};

export type PanchangToday = {
  cityName?: string;
  date?: string;
  dateLabel?: string;
  weekday?: string;
  paksha?: string;
  tithi?: string;
  tithiEndsAt?: string | null;
  nakshatra?: string;
  nakshatraEndsAt?: string | null;
  yoga?: string;
  yogaEndsAt?: string | null;
  karana?: string;
  karanaEndsAt?: string | null;
  karanaNext?: string | null;
  karanaNextEndsAt?: string | null;
  samvatsaram?: string;
  ayana?: string;
  rithu?: string;
  masam?: string;
  suryaRashi?: string;
  chandraRashi?: string;
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
  rahuKalam?: { start?: string; end?: string };
  yamagandam?: { start?: string; end?: string };
  amritKalam?: { start?: string; end?: string };
  varjyam?: { start?: string; end?: string };
  durmuhurtham?: { start?: string; end?: string };
  specialNote?: string | null;
  disclaimer?: string;
  muhurats?: { name: string; start: string; end: string; inauspicious?: boolean }[];
  [key: string]: unknown;
};

export type AuthUser = {
  id: string;
  phoneE164: string;
  email?: string | null;
  fullName: string | null;
  role: string;
  preferredLanguage?: string;
  timezone?: string | null;
  status?: string;
  createdAt?: string;
  hasPassword?: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  product: Product;
  metadata?: { selectedItems?: string[] };
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotalMinor: number;
  currency: string | null;
  itemCount: number;
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  orderNumber?: string;
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  items?: { productName?: string; name?: string; quantity: number }[];
};
