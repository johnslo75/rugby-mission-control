// Highlightly trial probe — evaluates the free tier against Rugby Radar's needs
// before wiring anything into the pipeline.
//
// Usage:  HIGHLIGHTLY_API_KEY=xxx node scripts/highlightly-probe.mjs
//
// Checks, in order:
//   1. /leagues   — can we find all 8 competitions scores-refresh.ts polls?
//   2. /matches   — fixtures for yesterday → +14 days, filtered to those leagues,
//                   so the output is directly comparable to the fixtures page
//   3. /highlights — are clips available for a recently finished match?
// Prints total requests used (free tier = 100/day).

const KEY = process.env.HIGHLIGHTLY_API_KEY;
if (!KEY) {
  console.error("Set HIGHLIGHTLY_API_KEY (free key from highlightly.net, no card needed).");
  process.exit(1);
}

const BASE = "https://rugby.highlightly.net";
let requestsUsed = 0;

async function api(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "x-rapidapi-key": KEY }, signal: AbortSignal.timeout(15000) });
  requestsUsed++;
  const remaining = res.headers.get("x-ratelimit-requests-remaining");
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return { body: await res.json(), remaining };
}

// ESPN league names from scores-refresh.ts -> name fragments to match in Highlightly
const WANTED = {
  "United Rugby Championship": ["united rugby"],
  "Gallagher Premiership": ["premiership"],
  "French Top 14": ["top 14"],
  "Super Rugby Pacific": ["super rugby"],
  "European Champions Cup": ["champions cup"],
  "Six Nations": ["six nations"],
  "Rugby Championship": ["rugby championship"],
  "International Test Match": ["international", "test"],
};

function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// 1. League coverage
console.log("=== 1. League coverage ===");
const leagues = [];
for (let offset = 0; ; offset += 100) {
  const { body } = await api("/leagues", { limit: 100, offset });
  leagues.push(...(body.data ?? []));
  if (!body.data?.length || leagues.length >= (body.pagination?.totalCount ?? 0)) break;
}
console.log(`${leagues.length} leagues available`);
const matched = {};
for (const [ours, fragments] of Object.entries(WANTED)) {
  const hits = leagues.filter((l) =>
    fragments.some((f) => l.name?.toLowerCase().includes(f)) &&
    !/u20|u18|women|wxv/i.test(l.name) // surface senior men's comp first; variants listed below
  );
  matched[ours] = hits;
  console.log(
    hits.length
      ? `  ✓ ${ours} -> ${hits.map((h) => `${h.name} (id ${h.id})`).join(", ")}`
      : `  ✗ ${ours} -> NO MATCH`
  );
}

// 2. Fixtures window (one request per day, all leagues per call)
console.log("\n=== 2. Fixtures, yesterday -> +14 days ===");
const wantedIds = new Set(Object.values(matched).flat().map((l) => l.id));
let totalMatches = 0;
let finishedMatch = null;
for (let d = -1; d <= 14; d++) {
  const date = isoDaysFromNow(d);
  const { body } = await api("/matches", { date, limit: 100 });
  const ours = (body.data ?? []).filter((m) => wantedIds.has(m.league?.id));
  totalMatches += ours.length;
  for (const m of ours) {
    console.log(
      `  ${m.date?.slice(0, 16)} | ${m.league?.name} | ${m.homeTeam?.name} v ${m.awayTeam?.name}` +
      ` | ${m.state?.description ?? "?"}${m.state?.score ? ` (${m.state.score})` : ""}`
    );
    if (/finished/i.test(m.state?.description ?? "")) finishedMatch = finishedMatch ?? m;
  }
}
console.log(`${totalMatches} matches in our competitions across the window`);

// 3. Highlights for a finished match
console.log("\n=== 3. Highlights availability ===");
if (finishedMatch) {
  const { body } = await api("/highlights", { matchId: finishedMatch.id, limit: 10 });
  const clips = body.data ?? [];
  console.log(`${finishedMatch.homeTeam?.name} v ${finishedMatch.awayTeam?.name}: ${clips.length} clip(s)`);
  for (const c of clips.slice(0, 3)) console.log(`  - ${c.title ?? c.type ?? "clip"}: ${c.url ?? c.embedUrl ?? "?"}`);
} else {
  console.log("No finished match in window to test highlights with — re-run after the weekend.");
}

console.log(`\n=== Done: ${requestsUsed} requests used (free tier: 100/day) ===`);
