import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/logo.jpg");
const out = path.join(__dirname, "../public");

// Load and get metadata
const img = sharp(readFileSync(src));
const meta = await img.metadata();
const size = Math.min(meta.width, meta.height);
const left = Math.floor((meta.width - size) / 2);
const top = Math.floor((meta.height - size) / 2);

// Circular crop mask
function circleSvg(s) {
  return Buffer.from(`<svg width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/2}" fill="white"/></svg>`);
}

async function make(outputSize, filename) {
  const base = await sharp(readFileSync(src))
    .extract({ left, top, width: size, height: size })
    .resize(outputSize, outputSize)
    .toBuffer();

  const mask = await sharp(circleSvg(outputSize)).png().toBuffer();

  await sharp(base)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(path.join(out, filename));

  console.log(`✓ ${filename}`);
}

await make(180, "apple-touch-icon.png");
await make(32, "favicon-32x32.png");
await make(16, "favicon-16x16.png");

// favicon.ico from 32x32
const ico32 = await sharp(readFileSync(src))
  .extract({ left, top, width: size, height: size })
  .resize(32, 32)
  .png()
  .toBuffer();
await sharp(ico32).toFile(path.join(out, "favicon.ico"));
console.log("✓ favicon.ico");

console.log("All favicons generated!");
