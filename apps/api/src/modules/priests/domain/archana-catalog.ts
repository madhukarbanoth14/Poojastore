export type ArchanaDeity = {
  slug: string;
  name: string;
  description: string;
};

export const ARCHANA_DEITIES: ArchanaDeity[] = [
  {
    slug: 'ganesha',
    name: 'Lord Ganesha',
    description: 'Remover of obstacles; ideal for new beginnings and festival days.',
  },
  {
    slug: 'lakshmi',
    name: 'Goddess Lakshmi',
    description: 'Prosperity and abundance; Fridays and Deepavali observances.',
  },
  {
    slug: 'shiva',
    name: 'Lord Shiva',
    description: 'Mondays, Pradosham, and Maha Shivaratri archana.',
  },
  {
    slug: 'vishnu',
    name: 'Lord Vishnu',
    description: 'Satyanarayan and Ekadashi archana with temple sankalpam.',
  },
  {
    slug: 'durga',
    name: 'Goddess Durga',
    description: 'Navaratri and Friday Devi archana.',
  },
  {
    slug: 'hanuman',
    name: 'Lord Hanuman',
    description: 'Tuesdays and Saturdays; strength and protection.',
  },
  {
    slug: 'any',
    name: 'Any deity',
    description: 'The pujari will perform archana for the deity best suited to your day.',
  },
];

export function archanaDeityBySlug(slug: string): ArchanaDeity | undefined {
  return ARCHANA_DEITIES.find((d) => d.slug === slug);
}

export function archanaDeityLabel(slug: string): string {
  return archanaDeityBySlug(slug)?.name ?? slug;
}

export function priestMatchesArchanaDeity(
  priestDeities: string[],
  requestedSlug: string,
): boolean {
  if (requestedSlug === 'any') return true;
  if (priestDeities.length === 0) return true;
  return priestDeities.includes(requestedSlug);
}
