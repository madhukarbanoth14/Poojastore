class ArchanaDeity {
  const ArchanaDeity({
    required this.slug,
    required this.name,
    required this.description,
  });

  final String slug;
  final String name;
  final String description;
}

const archanaDeities = <ArchanaDeity>[
  ArchanaDeity(
    slug: 'ganesha',
    name: 'Lord Ganesha',
    description: 'Remover of obstacles; ideal for new beginnings and festival days.',
  ),
  ArchanaDeity(
    slug: 'lakshmi',
    name: 'Goddess Lakshmi',
    description: 'Prosperity and abundance; Fridays and Deepavali observances.',
  ),
  ArchanaDeity(
    slug: 'shiva',
    name: 'Lord Shiva',
    description: 'Mondays, Pradosham, and Maha Shivaratri archana.',
  ),
  ArchanaDeity(
    slug: 'vishnu',
    name: 'Lord Vishnu',
    description: 'Satyanarayan and Ekadashi archana with temple sankalpam.',
  ),
  ArchanaDeity(
    slug: 'durga',
    name: 'Goddess Durga',
    description: 'Navaratri and Friday Devi archana.',
  ),
  ArchanaDeity(
    slug: 'hanuman',
    name: 'Lord Hanuman',
    description: 'Tuesdays and Saturdays; strength and protection.',
  ),
  ArchanaDeity(
    slug: 'any',
    name: 'Any deity',
    description: 'The pujari will perform archana for the deity best suited to your day.',
  ),
];

ArchanaDeity? archanaDeityBySlug(String slug) {
  for (final deity in archanaDeities) {
    if (deity.slug == slug) return deity;
  }
  return null;
}
