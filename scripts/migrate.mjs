import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "../data");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        body TEXT,
        category TEXT,
        author TEXT,
        date TIMESTAMPTZ,
        image_url TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        image_emoji TEXT DEFAULT '🏉',
        image_bg TEXT DEFAULT '#1a2a1a',
        featured BOOLEAN DEFAULT false,
        viral_score INTEGER,
        match_info TEXT,
        published BOOLEAN DEFAULT false,
        tags TEXT[] DEFAULT '{}'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS content_ideas (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        hook TEXT,
        script TEXT,
        caption TEXT,
        tags TEXT,
        category TEXT,
        status TEXT DEFAULT 'idea',
        source TEXT,
        viral_score INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist (
        id SERIAL PRIMARY KEY,
        date TEXT UNIQUE NOT NULL,
        checked JSONB DEFAULT '{}',
        saved_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS performance (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        platform TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        followers_gained INTEGER DEFAULT 0,
        best_hook TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        stories JSONB DEFAULT '[]',
        ideas JSONB DEFAULT '[]',
        raw_items JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hottakes (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT,
        active BOOLEAN DEFAULT false,
        date TEXT
      );
    `);

    console.log("Tables created. Seeding data...");

    // Seed stories
    const stories = JSON.parse(fs.readFileSync(path.join(DATA, "stories.json"), "utf-8"));
    for (const s of stories) {
      await client.query(`
        INSERT INTO stories (id, slug, title, excerpt, body, category, author, date,
          image_url, video_url, image_emoji, image_bg, featured, viral_score, match_info, published, tags)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT (id) DO UPDATE SET
          title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, body=EXCLUDED.body,
          category=EXCLUDED.category, author=EXCLUDED.author, date=EXCLUDED.date,
          image_url=EXCLUDED.image_url, video_url=EXCLUDED.video_url,
          image_emoji=EXCLUDED.image_emoji, image_bg=EXCLUDED.image_bg,
          featured=EXCLUDED.featured, viral_score=EXCLUDED.viral_score,
          match_info=EXCLUDED.match_info, published=EXCLUDED.published, tags=EXCLUDED.tags
      `, [
        s.id, s.slug, s.title, s.excerpt, s.body, s.category, s.author, s.date,
        s.imageUrl || '', s.videoUrl || '', s.imageEmoji || '🏉', s.imageBg || '#1a2a1a',
        s.featured || false, s.viralScore || null, s.matchInfo || null,
        s.published || false, s.tags || []
      ]);
    }
    console.log(`  ✓ ${stories.length} stories`);

    // Seed checklist
    const checklist = JSON.parse(fs.readFileSync(path.join(DATA, "checklist.json"), "utf-8"));
    for (const c of checklist) {
      await client.query(`
        INSERT INTO checklist (date, checked, saved_at)
        VALUES ($1,$2,$3)
        ON CONFLICT (date) DO UPDATE SET checked=EXCLUDED.checked, saved_at=EXCLUDED.saved_at
      `, [c.date, JSON.stringify(c.checked), c.savedAt]);
    }
    console.log(`  ✓ ${checklist.length} checklist entries`);

    // Seed settings
    const settings = JSON.parse(fs.readFileSync(path.join(DATA, "settings.json"), "utf-8"));
    for (const [key, value] of Object.entries(settings)) {
      await client.query(`
        INSERT INTO settings (key, value) VALUES ($1,$2)
        ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value
      `, [key, String(value)]);
    }
    console.log(`  ✓ settings`);

    // Seed hot takes
    const hottakes = JSON.parse(fs.readFileSync(path.join(DATA, "hottakes.json"), "utf-8"));
    for (const h of hottakes) {
      await client.query(`
        INSERT INTO hottakes (id, text, source, active, date)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (id) DO UPDATE SET text=EXCLUDED.text, source=EXCLUDED.source,
          active=EXCLUDED.active, date=EXCLUDED.date
      `, [h.id, h.text, h.source || '', h.active || false, h.date || null]);
    }
    console.log(`  ✓ ${hottakes.length} hot takes`);

    console.log("\n✅ Migration complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => { console.error(err); process.exit(1); });
