export type Region = "northern" | "southern" | "global" | "tier2";

export interface Competition {
  slug: string;
  name: string;
  shortName: string;
  region: Region;
  season: string;
  color: string;
  emoji: string;
  hasStandings: boolean;
  hasFixtures: boolean;
  description: string;
  evergreen: string[];
}

export const COMPETITIONS: Competition[] = [
  {
    slug: "six-nations",
    name: "Six Nations",
    shortName: "6N",
    region: "northern",
    season: "2026",
    color: "#1a3a6b",
    emoji: "🏆",
    hasStandings: true,
    hasFixtures: true,
    description:
      "The oldest and greatest rugby tournament on earth. Six weeks of tribal warfare, Calcutta Cups, Grand Slams, and heartbreak. If you don't care about this, you don't care about rugby.",
    evergreen: [
      "grand-slam-history",
      "triple-crown-explained",
      "calcutta-cup-history",
      "ireland-six-nations-record",
      "wooden-spoon-shame",
      "how-points-scoring-works",
    ],
  },
  {
    slug: "urc",
    name: "United Rugby Championship",
    shortName: "URC",
    region: "northern",
    season: "2025–26",
    color: "#00a86b",
    emoji: "🏉",
    hasStandings: true,
    hasFixtures: true,
    description:
      "The best club rugby competition in the world — and yes, we will die on that hill. Irish provinces vs South African powerhouses vs Welsh also-rans, with a smattering of Italian chaos. Leinster usually win it. Deal with it.",
    evergreen: [
      "urc-format-explained",
      "irish-provinces-guide",
      "south-african-teams-urc",
      "urc-playoff-format",
      "bonus-point-system",
      "european-qualification-routes",
    ],
  },
  {
    slug: "champions-cup",
    name: "Champions Cup",
    shortName: "HCC",
    region: "northern",
    season: "2025–26",
    color: "#1d4ed8",
    emoji: "🌟",
    hasStandings: true,
    hasFixtures: true,
    description:
      "Club rugby's Champions League. The knockout rounds deliver the kind of drama that ruins your Saturday afternoon plans in the most beautiful way possible. Any Irish province winning this is a national occasion.",
    evergreen: [
      "champions-cup-format",
      "all-time-winners",
      "irish-province-finals",
      "pool-stage-explained",
      "knockout-draw-format",
      "top-try-scorers-history",
    ],
  },
  {
    slug: "challenge-cup",
    name: "Challenge Cup",
    shortName: "EPCR",
    region: "northern",
    season: "2025–26",
    color: "#7c3aed",
    emoji: "🥈",
    hasStandings: true,
    hasFixtures: true,
    description:
      "The second-tier European competition — which is basically where English Premiership clubs go to feel better about themselves after a bad autumn. Still worth watching when the underdogs turn up.",
    evergreen: [
      "challenge-cup-format",
      "how-teams-qualify",
      "all-time-winners",
      "promotion-to-champions-cup",
    ],
  },
  {
    slug: "premiership",
    name: "Gallagher Premiership",
    shortName: "PRL",
    region: "northern",
    season: "2025–26",
    color: "#b45309",
    emoji: "🌹",
    hasStandings: true,
    hasFixtures: true,
    description:
      "English club rugby — full of money, drama, controversial salary cap decisions, and the occasional moment of actual good rugby. Bath are trying to be good again. Northampton are trying to stay good. The rest are trying.",
    evergreen: [
      "salary-cap-explained",
      "premiership-format",
      "all-time-winners",
      "relegation-history",
      "player-pathway-rules",
    ],
  },
  {
    slug: "top-14",
    name: "Top 14",
    shortName: "T14",
    region: "northern",
    season: "2025–26",
    color: "#be123c",
    emoji: "🐓",
    hasStandings: true,
    hasFixtures: true,
    description:
      "French club rugby. Chaotic, passionate, financially chaotic, and occasionally brilliant. Toulouse win it most years. La Rochelle are doing something special. Every game feels like the end of the world, in a good way.",
    evergreen: [
      "top-14-format",
      "all-time-winners",
      "french-rugby-culture",
      "toulouse-dynasty",
      "foreign-player-rules",
      "promotion-relegation-format",
    ],
  },
  {
    slug: "super-rugby-pacific",
    name: "Super Rugby Pacific",
    shortName: "SRP",
    region: "southern",
    season: "2026",
    color: "#0369a1",
    emoji: "🦘",
    hasStandings: true,
    hasFixtures: true,
    description:
      "Super Rugby reinvented with Pacific Island teams thrown in for good measure. The All Blacks factory. The Crusaders win it in their sleep. The Chiefs occasionally remind everyone they're dangerous. Worth watching for the attacking rugby alone.",
    evergreen: [
      "super-rugby-history",
      "all-time-winners",
      "pacific-teams-guide",
      "how-super-rugby-works",
      "conference-format-explained",
    ],
  },
  {
    slug: "rugby-championship",
    name: "Rugby Championship",
    shortName: "RC",
    region: "southern",
    season: "2026",
    color: "#065f46",
    emoji: "🌏",
    hasStandings: true,
    hasFixtures: true,
    description:
      "The southern hemisphere's Six Nations — except four teams instead of six, and the travel schedule is absolutely brutal. South Africa, New Zealand, Australia, and Argentina. Three of them are world class. One of them is Australia.",
    evergreen: [
      "rugby-championship-format",
      "tri-nations-history",
      "bledisloe-cup-explained",
      "all-time-winners",
      "freedom-cup-history",
    ],
  },
  {
    slug: "world-cup-2027",
    name: "Rugby World Cup 2027",
    shortName: "WC27",
    region: "global",
    season: "2027",
    color: "#d97706",
    emoji: "🌍",
    hasStandings: false,
    hasFixtures: false,
    description:
      "Australia, 2027. The biggest prize in rugby. Ireland will go in as serious contenders and somehow find a way to make it dramatic. Every four years the world stops for this. We start the countdown now.",
    evergreen: [
      "world-cup-format",
      "ireland-world-cup-history",
      "host-cities-australia",
      "qualification-routes",
      "all-time-winners",
      "ireland-grand-slam-chances",
      "pool-draw-guide",
    ],
  },
  {
    slug: "emerging-nations",
    name: "Emerging Nations / Tier 2",
    shortName: "T2",
    region: "tier2",
    season: "2025–26",
    color: "#4b5563",
    emoji: "🌐",
    hasStandings: false,
    hasFixtures: false,
    description:
      "The growth story of rugby. Georgia, Romania, Spain, Uruguay, USA, Japan — these are the teams that are going to make the World Cup more interesting every cycle. Ignore Tier 2 rugby at your peril.",
    evergreen: [
      "world-rugby-tier-system",
      "georgia-rugby-rise",
      "americas-rugby-championship",
      "rugby-europe-championship",
      "tier-2-world-cup-history",
      "japan-rugby-story",
    ],
  },
];

export const COMPETITION_MAP = Object.fromEntries(
  COMPETITIONS.map((c) => [c.slug, c])
) as Record<string, Competition>;

export const COMPETITIONS_BY_REGION: Record<Region, Competition[]> = {
  northern: COMPETITIONS.filter((c) => c.region === "northern"),
  southern: COMPETITIONS.filter((c) => c.region === "southern"),
  global: COMPETITIONS.filter((c) => c.region === "global"),
  tier2: COMPETITIONS.filter((c) => c.region === "tier2"),
};

export const REGION_LABELS: Record<Region, string> = {
  northern: "Northern Hemisphere",
  southern: "Southern Hemisphere",
  global: "Global",
  tier2: "Tier 2",
};
