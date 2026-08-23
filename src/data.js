// Ported verbatim from Pooja Store.dc.html data definitions.

export const CATEGORY_DEFS = [
  { id: 'festival-kits', name: 'Festival Kits', mono: 'FK' },
  { id: 'function-kits', name: 'Function Kits', mono: 'FN' },
  { id: 'daily-pooja', name: 'Daily Pooja', mono: 'DP' },
  { id: 'flowers', name: 'Flowers', mono: 'FL' },
  { id: 'agarbatti', name: 'Agarbatti', mono: 'AG' },
  { id: 'diyas', name: 'Diyas', mono: 'DY' },
  { id: 'oils', name: 'Oils', mono: 'OL' },
  { id: 'kumkum', name: 'Kumkum', mono: 'KK' },
  { id: 'camphor', name: 'Camphor', mono: 'CM' },
  { id: 'books', name: 'Books', mono: 'BK' },
  { id: 'brass', name: 'Brass Items', mono: 'BR' },
];

export const KITS = [
  { id: 'k1', name: 'Ganesh Puja Homam Samagri Kit', price: 1999, mrp: 2499, rating: 4.8, reviews: 342, cat: 'festival-kits' },
  { id: 'k2', name: 'Satyanarayan Puja Kit', price: 749, mrp: 999, rating: 4.7, reviews: 210, cat: 'function-kits' },
  { id: 'k3', name: 'Griha Pravesh Kit', price: 1499, mrp: 1899, rating: 4.9, reviews: 128, cat: 'function-kits' },
  { id: 'k4', name: 'Navratri Kit — 9 Days', price: 1299, mrp: 1599, rating: 4.8, reviews: 276, cat: 'festival-kits' },
];

export const ESSENTIALS = [
  { id: 'd1', name: 'Sandalwood Agarbatti', price: 89, cat: 'agarbatti' },
  { id: 'd2', name: 'Cow Ghee Diya Wicks', price: 45, cat: 'diyas' },
  { id: 'd3', name: 'Kumkum (Pure)', price: 35, cat: 'kumkum' },
  { id: 'd4', name: 'Camphor Tablets', price: 60, cat: 'camphor' },
  { id: 'd5', name: 'Fresh Marigold Garland', price: 120, cat: 'flowers' },
  { id: 'd6', name: 'Panchapatra Set (Brass)', price: 650, cat: 'brass' },
  { id: 'd7', name: 'Chandan Oil, 50ml', price: 150, cat: 'oils' },
  { id: 'd8', name: 'Bhagavad Gita (Hindi)', price: 199, cat: 'books' },
];

export const STORES = [
  { id: 's1', name: 'Sri Ganesha Pooja Store', distance: '1.2 km', rating: 4.6, eta: '25 min' },
  { id: 's2', name: 'Annapurna Pooja Samagri', distance: '2.0 km', rating: 4.8, eta: '35 min' },
  { id: 's3', name: 'Shree Devi Traders', distance: '3.4 km', rating: 4.5, eta: '45 min' },
];

export const PRIESTS = [
  { id: 'p1', name: 'Pandit Raghunath Sharma', exp: '22 yrs', languages: 'Hindi, Sanskrit, English', rating: 4.9, reviews: 412, specialization: 'Griha Pravesh, Satyanarayan Puja', fee: 1100,
    bio: 'A third-generation priest trained at Kashi, Pandit Raghunath has performed over 4,000 ceremonies across Griha Pravesh, Satyanarayan Puja and Navagraha Shanti rituals.',
    expertise: ['Griha Pravesh', 'Satyanarayan Puja', 'Navagraha Shanti'] },
  { id: 'p2', name: 'Pandit Venkatesh Iyer', exp: '15 yrs', languages: 'Tamil, Telugu, English', rating: 4.8, reviews: 298, specialization: 'Vratams, Navagraha Shanti', fee: 900,
    bio: 'Specializes in South Indian Vratams and monthly poojas, known for his calm, detailed explanations of each ritual step for families new to tradition.',
    expertise: ['Vratams', 'Navagraha Shanti', 'Sathyanarayana Vratam'] },
  { id: 'p3', name: 'Pandit Anil Trivedi', exp: '30 yrs', languages: 'Hindi, Gujarati, Sanskrit', rating: 5.0, reviews: 520, specialization: 'Vastu Shanti, Rudrabhishek', fee: 1500,
    bio: 'One of the most senior priests on the platform, Pandit Anil is renowned for elaborate Rudrabhishek and Vastu Shanti ceremonies performed with full Vedic rigor.',
    expertise: ['Vastu Shanti', 'Rudrabhishek', 'Homam'] },
  { id: 'p4', name: 'Pandit Suresh Bhatt', exp: '10 yrs', languages: 'Marathi, Hindi', rating: 4.7, reviews: 156, specialization: 'Ganesh Puja, Satyanarayan Puja', fee: 800,
    bio: 'A warm, patient priest popular for festival poojas and first-time home ceremonies, especially Ganesh Chaturthi installations.',
    expertise: ['Ganesh Puja', 'Satyanarayan Puja', 'Griha Pravesh'] },
];

export const ONBOARD_SLIDES = [
  { title: 'Complete Pooja Kits', desc: 'Order curated kits for every festival and family function — nothing missing, nothing extra.', label: 'FESTIVAL KIT' },
  { title: 'Verified Poojaris', desc: 'Book experienced, background-verified priests for home visits or online consultations.', label: 'POOJARI PORTRAIT' },
  { title: 'Same-Day Delivery', desc: 'Fresh flowers, agarbatti and ritual items from nearby pooja stores, delivered fast.', label: 'DELIVERY VAN' },
  { title: 'Never Miss a Festival', desc: 'Personalized reminders for every festival and auspicious date, right on time.', label: 'CALENDAR' },
];

export const NOTIFICATIONS = [
  { title: 'Ganesh Chaturthi in 36 days', body: 'Shop the complete kit now for guaranteed same-day delivery.', time: '2 hours ago' },
  { title: 'Order delivered', body: 'Your Satyanarayan Puja Kit was delivered by Sri Ganesha Pooja Store.', time: 'Yesterday' },
  { title: 'Booking confirmed', body: 'Pandit Anil Trivedi will visit on Aug 4, 10:00 AM for Vastu Shanti.', time: '2 days ago' },
  { title: 'Flat 20% off Festival Kits', body: 'Use code FEST20 at checkout, valid till Sept 6.', time: '3 days ago' },
];

export const ORDER_HISTORY = [
  { name: 'Satyanarayan Puja Kit', date: '22 Jul 2026', amount: 749, status: 'Delivered' },
  { name: 'Daily Essentials (4 items)', date: '10 Jul 2026', amount: 210, status: 'Delivered' },
  { name: 'Griha Pravesh Kit', date: '02 Jun 2026', amount: 1499, status: 'Delivered' },
];

export const PRIEST_HISTORY = [
  { priest: 'Pandit Anil Trivedi', ritual: 'Vastu Shanti (Home Visit)', date: '02 Jun 2026' },
  { priest: 'Pandit Venkatesh Iyer', ritual: 'Sathyanarayana Vratam (Online)', date: '14 Apr 2026' },
];

export const FAMILY = [
  { name: 'Aarav Sharma', relation: 'Self', gotram: 'Bharadwaj', nakshatram: 'Rohini' },
  { name: 'Meera Sharma', relation: 'Spouse', gotram: 'Kashyap', nakshatram: 'Ashwini' },
];

export const REQUIRED_ITEMS = [
  'Homa powder — 1 kg',
  'Poha / Atukulu — 1/2 kg',
  'Jaggery',
  'Navadhanyalu',
  'Rice flour',
  'Purnahuti',
  'Betel leaves (Tamalapakulu)',
  'Fruits',
  'Flowers',
  'Dry fruits',
  'Samithalu (homa sticks)',
  'Ghee',
  'Arati camphor',
  'Isthari / Durva leaves',
  'Homa stand',
  'Dhoti',
  'Blouse piece (Jacket piece)',
  'Coconuts',
];

/** Individual retail prices (₹) aligned with apps/api/prisma/samagri-catalog.ts */
export const REQUIRED_ITEM_PRICES = [
  149, 80, 80, 90, 60, 120, 30, 120, 80, 199, 80, 250, 50, 40, 499, 399, 399, 120,
];

export const ADDRESS_LIST = [
  { label: 'Home', detail: '4th Cross, Malleshwaram, Bengaluru 560003' },
  { label: 'Office', detail: 'Tech Park, Whitefield, Bengaluru 560066' },
];

export const SLOT_LIST = ['Today, 4:00 PM – 6:00 PM', 'Today, 6:00 PM – 8:00 PM', 'Tomorrow, 10:00 AM – 12:00 PM'];
export const PAYMENT_LIST = ['UPI', 'Credit / Debit Card', 'Cash on Delivery'];

export const TRACKING_STEPS = [
  { label: 'Order Placed', time: '12:04 PM' },
  { label: 'Store Accepted', time: '12:08 PM' },
  { label: 'Packed', time: '12:20 PM' },
  { label: 'Out for Delivery', time: '12:35 PM' },
  { label: 'Delivered', time: 'Est. 1:10 PM' },
];

export const BOOKING_TIMES = ['7:00 AM', '9:00 AM', '11:00 AM', '4:00 PM', '6:00 PM', '8:00 PM'];
export const RITUAL_OPTIONS = ['Ganesh Puja', 'Satyanarayan Puja', 'Griha Pravesh', 'Vastu Shanti'];
