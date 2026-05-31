# Rugby Shithousery — Mission Control

Daily operations dashboard for Rugby Shithousery content creation.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rugby-mission-control.git
git push -u origin main
```

### Step 2 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import your GitHub repository.
4. Leave all settings as defaults — Vercel auto-detects Next.js.
5. Click **Deploy**.

Your app will be live at `https://your-project-name.vercel.app`.

---

## Password Protection (Vercel Pro / Teams)

To keep the dashboard private:

1. Open your project on the Vercel dashboard.
2. Go to **Settings → Password Protection**.
3. Enable it and set a password.
4. Anyone visiting the URL will be prompted for the password.

> Note: Password Protection requires a Vercel Pro or Teams plan.

---

## Data

All data is stored in flat JSON files in the `/data` folder:

| File | Contents |
|------|----------|
| `data/checklist.json` | Daily checklist completions |
| `data/content.json` | Content ideas log |
| `data/performance.json` | Posted content performance |
| `data/settings.json` | Follower count and app settings |

**Important on Vercel:** Vercel's serverless environment has an ephemeral filesystem — writes to `/data` will not persist between deployments or serverless function restarts. For a permanent solution, migrate the API routes to use a database like [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [PlanetScale](https://planetscale.com), or store the JSON in a GitHub Gist / S3 bucket. For local use or a self-hosted server the current JSON approach works perfectly.
