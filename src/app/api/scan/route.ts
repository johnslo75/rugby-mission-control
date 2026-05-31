import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import pool from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawStory {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
  upvotes?: number;
}

export interface ContentIdea {
  angle_title: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  thumbnail_text: string;
  format: string;
}

export interface ProcessedStory {
  headline: string;
  source: string;
  link: string;
  pubDate: string;
  shithousery_angle: string;
  viral_score: number;
  content_ideas: ContentIdea[];
  mentionCount: number;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  storiesFound: number;
  stories: ProcessedStory[];
  savedIdeas: string[];
  postedIdeas: string[];
}

// ─── RSS helpers ──────────────────────────────────────────────────────────────

const RSS_FEEDS = [
  { name: "RugbyPass", url: "https://www.rugbypass.com/feed/" },
  { name: "World Rugby", url: "https://www.world.rugby/rss" },
  { name: "RTE Sport Rugby", url: "https://www.rte.ie/sport/rugby/rss" },
  { name: "BBC Rugby", url: "https://feeds.bbci.co.uk/sport/rugby-union/rss.xml" },
  { name: "Guardian Rugby", url: "https://www.theguardian.com/sport/rugby-union/rss" },
  { name: "Google News Ireland Rugby", url: "https://news.google.com/rss/search?q=ireland+rugby&hl=en-IE&gl=IE&ceid=IE:en" },
  { name: "Google News RWC 2027", url: "https://news.google.com/rss/search?q=rugby+world+cup+2027&hl=en-IE&gl=IE&ceid=IE:en" },
];

async function fetchRSS(feedUrl: string, sourceName: string): Promise<RawStory[]> {
  try {
    // Use rss-parser dynamically to avoid issues with edge runtime
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser({ timeout: 8000 });
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      source: sourceName,
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      snippet: item.contentSnippet?.slice(0, 200) || item.summary?.slice(0, 200) || "",
    }));
  } catch {
    return [];
  }
}

async function fetchReddit(): Promise<RawStory[]> {
  try {
    const res = await fetch(
      "https://www.reddit.com/r/rugbyunion/top.json?t=day&limit=10",
      { headers: { "User-Agent": "RugbyMissionControl/1.0" }, signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json() as { data: { children: Array<{ data: { title: string; url: string; created_utc: number; selftext: string; ups: number } }> } };
    return data.data.children.map((c) => ({
      title: c.data.title,
      link: c.data.url,
      source: "Reddit r/rugbyunion",
      pubDate: new Date(c.data.created_utc * 1000).toISOString(),
      snippet: c.data.selftext?.slice(0, 200) || "",
      upvotes: c.data.ups,
    }));
  } catch {
    return [];
  }
}

// ─── Dedup & rank ─────────────────────────────────────────────────────────────

function deduplicateAndRank(stories: RawStory[]): (RawStory & { mentionCount: number; score: number })[] {
  const groups: Map<string, RawStory & { mentionCount: number; score: number }> = new Map();

  for (const story of stories) {
    const key = story.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .slice(0, 6)
      .join(" ");

    const existing = groups.get(key);
    if (existing) {
      existing.mentionCount++;
      if ((story.upvotes ?? 0) > (existing.upvotes ?? 0)) existing.upvotes = story.upvotes;
    } else {
      groups.set(key, { ...story, mentionCount: 1, score: 0 });
    }
  }

  const now = Date.now();
  return Array.from(groups.values())
    .map((s) => {
      const ageHours = (now - new Date(s.pubDate).getTime()) / 3_600_000;
      const recencyScore = Math.max(0, 10 - ageHours / 2.4); // 0-10 over 24h
      const mentionScore = s.mentionCount * 3;
      const upvoteScore = Math.min(5, ((s.upvotes ?? 0) / 200));
      s.score = recencyScore + mentionScore + upvoteScore;
      return s;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ─── Claude generation ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a rugby content strategist for Rugby Shithousery — an Irish rugby content account specialising in cynical play, referee management, professional fouls, controversies, hot takes and shithousery moments. The audience is passionate rugby fans aged 18-45, primarily Irish but global.

For each story provided, identify the shithousery angle — the cynical foul, the referee wind-up, the controversial moment, the hot take, the underdog story, or the professional nuisance moment that makes it shareable.

For each of the top 3 stories return exactly this JSON structure:
{
  "stories": [
    {
      "headline": "original headline",
      "source": "source name",
      "shithousery_angle": "one sentence explaining the angle",
      "viral_score": 1-10,
      "content_ideas": [
        {
          "angle_title": "title",
          "hook": "first 3 seconds of video — the scroll stopper",
          "script": "full 30 second video script with [0-3s], [3-23s], [23-30s] sections",
          "caption": "instagram/tiktok caption",
          "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
          "thumbnail_text": "3-5 words max",
          "format": "voiceover or text-overlay or reaction"
        }
      ]
    }
  ]
}

Always prioritise: Irish angle, shithousery moments, hot takes, controversy, underdog stories. Avoid generic match recaps.
Return only valid JSON, no other text.`;

async function generateWithClaude(stories: (RawStory & { mentionCount: number })[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

  const userMessage = `Here are the top rugby stories right now. Generate shithousery content ideas for the top 3 only:\n\n${stories
    .slice(0, 3)
    .map(
      (s, i) =>
        `${i + 1}. [${s.source}] ${s.title}\n   Published: ${s.pubDate}\n   ${s.snippet}${s.upvotes ? `\n   Reddit upvotes: ${s.upvotes}` : ""}`
    )
    .join("\n\n")}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

  // Attempt parse; if truncated, try to salvage complete story objects
  try {
    return JSON.parse(cleaned) as { stories: Omit<ProcessedStory, "link" | "pubDate" | "mentionCount">[] };
  } catch {
    // Find the last complete story object by truncating to the last "}," or "}]"
    const lastComplete = cleaned.lastIndexOf('},');
    const lastEnd = cleaned.lastIndexOf('}]');
    const cutAt = Math.max(lastComplete, lastEnd);
    if (cutAt > 0) {
      try {
        const salvaged = cleaned.slice(0, lastComplete > lastEnd ? lastComplete + 1 : cutAt + 2) + (lastComplete > lastEnd ? ']}}' : '}');
        return JSON.parse(salvaged) as { stories: Omit<ProcessedStory, "link" | "pubDate" | "mentionCount">[] };
      } catch { /* fall through */ }
    }
    throw new Error(`Unterminated JSON from Claude. Raw (last 200 chars): ${cleaned.slice(-200)}`);
  }
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function runScanPipeline(): Promise<ScanResult> {
  // 1. Fetch all sources in parallel
  const [redditStories, ...rssResults] = await Promise.all([
    fetchReddit(),
    ...RSS_FEEDS.map((f) => fetchRSS(f.url, f.name)),
  ]);

  const allStories: RawStory[] = [redditStories, ...rssResults].flat();

  // 2. Deduplicate & rank
  const ranked = deduplicateAndRank(allStories);

  // 3. Claude generation
  const claudeResult = await generateWithClaude(ranked);

  // 4. Merge Claude output with our ranked data
  const processed: ProcessedStory[] = claudeResult.stories.map((cs, i) => {
    const raw = ranked[i] || ranked[0];
    return {
      headline: cs.headline,
      source: cs.source,
      link: raw?.link || "",
      pubDate: raw?.pubDate || new Date().toISOString(),
      shithousery_angle: cs.shithousery_angle,
      viral_score: cs.viral_score,
      content_ideas: cs.content_ideas,
      mentionCount: raw?.mentionCount || 1,
    };
  });

  // 5. Save scan
  const scanResult: ScanResult = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    storiesFound: allStories.length,
    stories: processed,
    savedIdeas: [],
    postedIdeas: [],
  };

  await pool.query(`
    INSERT INTO scans (id, date, stories, ideas, raw_items)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (id) DO NOTHING
  `, [
    scanResult.id,
    scanResult.timestamp.slice(0, 10),
    JSON.stringify(scanResult.stories),
    JSON.stringify([]),
    JSON.stringify([]),
  ]);

  return scanResult;
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST() {
  try {
    const result = await runScanPipeline();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
