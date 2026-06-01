# Rugby Radar

Two apps, one Next.js codebase:

| URL | What it is |
|-----|-----------|
| `rugbyradar.co` | Public rugby news & opinion site |
| `hub.rugbyradar.co` | Mission Control dashboard |

---

## Local Development

```bash
npm install
npm run dev
```

- `localhost:3000` → redirects to `/hub` (Mission Control)
- `localhost:3000/hub` → Mission Control
- `localhost:3000/site` → Public website

---

## Deploy to Railway

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Your message"
git push
```

Railway auto-deploys on every push.

### Step 2 — Environment Variables (Railway → Variables)

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=https://rugbyradar.co
NEXT_PUBLIC_HUB_URL=https://hub.rugbyradar.co
```

### Step 3 — Domains (Railway → Settings → Networking → Domains)

Add both:
- `rugbyradar.co`
- `hub.rugbyradar.co`

### Step 4 — Cloudflare DNS

For the hub subdomain, add a second CNAME record:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | hub | `your-app.up.railway.app` | DNS only (grey cloud) |

---

## Architecture

```
src/
  app/
    site/          ← rugbyradar.co (public website)
      page.tsx     ← homepage
      [slug]/      ← article pages
      category/    ← category pages
    hub/           ← hub.rugbyradar.co (Mission Control)
      page.tsx     ← dashboard
    api/           ← shared API routes
      checklist/
      content/
      performance/
      settings/
      stories/
      scan/
      scans/
    components/    ← shared hub components
  middleware.ts    ← subdomain routing
data/
  stories.json     ← public site content
  checklist.json
  content.json
  performance.json
  scans.json
  settings.json
```

## Data Persistence Note

JSON files persist between Railway restarts but reset on redeploy.
For permanent persistence, migrate to Railway Postgres.
