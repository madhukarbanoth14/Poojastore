export type VedAstroEvent = {
  name: string;
  nature: string;
  description?: string;
};

export type VedAstroGochara = {
  planet: string;
  sign: string;
  kakshaScore: number;
  ashtaka?: number;
  sarvashtaka?: number;
};

export type VedAstroDasa = {
  lord: string;
  nature?: string;
  bhuktiLord?: string;
};

export type RasiPhalalu = {
  summary: string;
  recommendedPuja: string;
  activity: string;
  luckyColor: string;
  luckyDirection: string;
  luckyNumber: number;
  career: string;
  finance: string;
  health: string;
  travel: string;
  events: { name: string; nature: string }[];
};

const PLANET_PUJA: Record<string, string> = {
  Sun: 'Surya Namaskaram',
  Moon: 'Shiva Abhishekam',
  Mars: 'Hanuman Pooja',
  Mercury: 'Vishnu / Ganesha Pooja',
  Jupiter: 'Guru / Satyanarayan Pooja',
  Venus: 'Lakshmi Pooja',
  Saturn: 'Hanuman / Shani deepam',
};

const PLANET_COLOR: Record<string, string> = {
  Sun: 'Red / gold',
  Moon: 'White',
  Mars: 'Red',
  Mercury: 'Green',
  Jupiter: 'Yellow',
  Venus: 'White / pink',
  Saturn: 'Blue / black',
};

const PLANET_DIRECTION: Record<string, string> = {
  Sun: 'East',
  Moon: 'North-West',
  Mars: 'South',
  Mercury: 'North',
  Jupiter: 'North-East',
  Venus: 'South-East',
  Saturn: 'West',
};

const PLANET_NUMBER: Record<string, number> = {
  Sun: 1,
  Moon: 2,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 6,
  Saturn: 8,
};

function planetOf(row: VedAstroGochara | undefined) {
  return row?.planet ?? '';
}

function findPlanet(rows: VedAstroGochara[], name: string) {
  return rows.find((row) => row.planet.toLowerCase() === name.toLowerCase());
}

function transitLine(row: VedAstroGochara | undefined, topic: string) {
  if (!row?.sign) {
    return `No ${topic} transit was returned for today.`;
  }
  const support =
    row.kakshaScore > 0
      ? 'kaksha is supportive'
      : 'kaksha is weak — keep decisions measured';
  return `${row.planet} transits ${row.sign}; ${support}.`;
}

function eventsOf(
  events: VedAstroEvent[],
  matcher: (event: VedAstroEvent) => boolean,
) {
  return events.filter(matcher);
}

function natureTone(events: VedAstroEvent[]) {
  const good = events.filter((event) => /good/i.test(event.nature)).length;
  const bad = events.filter((event) => /bad|malefic/i.test(event.nature)).length;
  return { good, bad };
}

export function composeRasiPhalalu(input: {
  events: VedAstroEvent[];
  gochara: VedAstroGochara[];
  dasa?: VedAstroDasa | null;
}): RasiPhalalu {
  const { events, gochara, dasa } = input;
  const sun = findPlanet(gochara, 'Sun');
  const moon = findPlanet(gochara, 'Moon');
  const mercury = findPlanet(gochara, 'Mercury');
  const jupiter = findPlanet(gochara, 'Jupiter');
  const venus = findPlanet(gochara, 'Venus');
  const saturn = findPlanet(gochara, 'Saturn');
  const { good, bad } = natureTone(events);
  const names = events.map((event) => event.name).filter(Boolean);

  const dasaLine = dasa?.lord
    ? dasa.bhuktiLord
      ? `${dasa.lord} dasa, ${dasa.bhuktiLord} bhukti`
      : `${dasa.lord} dasa`
    : null;

  const summaryParts = [
    `Today’s VedAstro reading notes ${good} supportive mark${good === 1 ? '' : 's'} and ${bad} caution${bad === 1 ? '' : 's'}.`,
  ];
  if (dasaLine) summaryParts.push(`Current period: ${dasaLine}.`);
  if (moon?.sign) summaryParts.push(`Moon transits ${moon.sign}.`);
  if (names.length) {
    summaryParts.push(`Highlights: ${names.slice(0, 4).join(', ')}.`);
  }

  const travelEvents = eventsOf(events, (event) =>
    /panchaka|journey|travel|tara/i.test(`${event.name} ${event.description ?? ''}`),
  );
  const familyEvents = eventsOf(events, (event) =>
    /chandra|moon|nakshatra|family/i.test(`${event.name} ${event.description ?? ''}`),
  );

  const luckPlanet = dasa?.bhuktiLord || dasa?.lord || planetOf(moon) || 'Moon';
  const puja = PLANET_PUJA[luckPlanet] ?? PLANET_PUJA[dasa?.lord ?? ''] ?? 'Satyanarayan Pooja';

  return {
    summary: summaryParts.join(' '),
    recommendedPuja: puja,
    activity: dasaLine
      ? `Observe the ${dasaLine} with a simple home puja if it is your custom.`
      : 'Keep a short shrine practice and note today’s transits.',
    luckyColor: PLANET_COLOR[luckPlanet] ?? PLANET_COLOR.Moon ?? 'White',
    luckyDirection: PLANET_DIRECTION[luckPlanet] ?? 'East',
    luckyNumber: PLANET_NUMBER[luckPlanet] ?? 2,
    career: [transitLine(sun, 'career'), transitLine(saturn, 'work')].join(' '),
    finance: [transitLine(jupiter, 'wealth'), transitLine(venus, 'resources')].join(' '),
    health: [
      transitLine(moon, 'mind and family'),
      familyEvents[0]
        ? `${familyEvents[0].name} is ${familyEvents[0].nature.toLowerCase()} today.`
        : 'Follow your family’s usual health and shrine routine.',
    ].join(' '),
    travel: [
      transitLine(mercury, 'movement'),
      travelEvents[0]
        ? `${travelEvents[0].name} (${travelEvents[0].nature}) applies to journeys and interviews.`
        : 'Prefer planned travel; check Rahu Kalam on the panchangam.',
    ].join(' '),
    events: events.map((event) => ({ name: event.name, nature: event.nature })),
  };
}

export const RASI_PHALALU_DISCLAIMER =
  'Rasi phalalu are composed from the VedAstro open API (today’s events, gochara, and dasa). This is traditional/spiritual guidance, not a guaranteed outcome.';
