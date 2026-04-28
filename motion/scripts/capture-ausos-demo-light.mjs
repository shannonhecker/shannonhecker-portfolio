// Capture ausos.ai demo with the built-in light theme on.
//
// Design-Hub's hero.css ships a complete `[data-preview-mode="light"]`
// variant (~30 rules) that re-skins every preview element for light surfaces.
// We just toggle that attribute via Playwright before recording, then run
// the same pipeline as the dark capture (crop → 25→50fps minterpolate → 2x
// lanczos upscale → h264).

import { chromium } from "playwright";
import { mkdir, readdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out", "ausos-demo-light");
const RAW_DIR = path.join(OUT_DIR, "raw");
const FINAL_MP4 = path.join(OUT_DIR, "ausos-demo-light.mp4");
const FFMPEG = path.join(ROOT, "node_modules", "ffmpeg-static", "ffmpeg");

const VIEWPORT_W = 1440;
const VIEWPORT_H = 1100;
const RECORD_MS = 31_000;

await rm(RAW_DIR, { recursive: true, force: true });
await mkdir(RAW_DIR, { recursive: true });

console.log("Launching chromium");
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
  recordVideo: {
    dir: RAW_DIR,
    size: { width: VIEWPORT_W, height: VIEWPORT_H },
  },
});
const page = await ctx.newPage();

console.log("Navigating to https://ausos.ai/");
await page.goto("https://ausos.ai/", { waitUntil: "networkidle", timeout: 60_000 });

const demo = page.locator(".hero-product").first();
await demo.waitFor({ state: "visible", timeout: 30_000 });
await demo.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

// Inject Design-Hub's light-theme rules verbatim, but rewrite the selectors
// from `[data-preview-mode="light"]` → unconditional, with !important so they
// win over the per-system dark accent overrides in hero.css:735+. Source:
// Design-Hub/src/components/hero.css lines 780-798 (outer) + 1389-1468 (inner).
console.log("Injecting light-theme stylesheet");
await page.addStyleTag({
  content: `
    html, body { overflow: hidden !important; }

    .hero-product {
      --preview-accent: #6750a4 !important;
      --preview-accent-2: #b3261e !important;
      --preview-on-accent: #ffffff !important;
      --preview-surface: rgba(255, 255, 255, 0.92) !important;
      --preview-surface-strong: rgba(255, 255, 255, 0.72) !important;
      --preview-border: rgba(41, 35, 58, 0.13) !important;

      border-color: rgba(103, 80, 164, 0.18) !important;
      background:
        radial-gradient(ellipse at 18% 100%, rgba(103, 80, 164, 0.11), transparent 34rem),
        radial-gradient(ellipse at 92% 4%, rgba(179, 38, 30, 0.075), transparent 32rem),
        linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 252, 0.9)),
        #fefbff !important;
      box-shadow:
        0 34px 100px rgba(28, 24, 38, 0.18),
        0 0 70px rgba(103, 80, 164, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
    }
    .hero-product .preview-topbar { border-bottom-color: rgba(41, 35, 58, 0.1) !important; }
    .hero-product .preview-dots span { background: rgba(41, 35, 58, 0.22) !important; }
    .hero-product .preview-title { color: rgba(29, 27, 32, 0.76) !important; }
    .hero-product .preview-status { color: var(--preview-accent) !important; }
    .hero-product .preview-demo-control {
      border-color: rgba(41, 35, 58, 0.12) !important;
      background: rgba(255, 255, 255, 0.74) !important;
      color: rgba(29, 27, 32, 0.68) !important;
      box-shadow: 0 1px 2px rgba(28, 24, 38, 0.06) !important;
    }
    .hero-product .preview-progress-track { background: rgba(103, 80, 164, 0.1) !important; }
    .hero-product .preview-sidebar { border-right-color: rgba(41, 35, 58, 0.1) !important; }
    .hero-product .preview-tab { color: rgba(29, 27, 32, 0.52) !important; }
    .hero-product .preview-tab--active {
      color: var(--preview-on-accent) !important;
      background: var(--preview-accent) !important;
    }
    .hero-product .preview-prompt,
    .hero-product .preview-toolbar { color: rgba(29, 27, 32, 0.62) !important; }
    .hero-product .preview-board { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78) !important; }
    .hero-product .preview-toolbar span,
    .hero-product .preview-hero-card,
    .hero-product .preview-metrics div,
    .hero-product .preview-detail-list { box-shadow: 0 1px 2px rgba(28, 24, 38, 0.04) !important; }
    .hero-product .preview-hero-card strong,
    .hero-product .preview-metrics strong,
    .hero-product .preview-detail-row strong { color: #1d1b20 !important; }
    .hero-product .preview-hero-card p { color: rgba(29, 27, 32, 0.64) !important; }
    .hero-product .preview-metrics span,
    .hero-product .preview-detail-row span { color: rgba(29, 27, 32, 0.54) !important; }
    .hero-product .preview-detail-row { background: rgba(103, 80, 164, 0.055) !important; }
  `,
});
await page.waitForTimeout(800);

const bb = await demo.boundingBox();
if (!bb) {
  console.error("No bounding box for .hero-product — aborting.");
  process.exit(1);
}

const INSET = 6;
const cropX = Math.round(bb.x + INSET);
const cropY = Math.round(bb.y + INSET);
const cropW = Math.floor((bb.width - INSET * 2) / 2) * 2;
const cropH = Math.floor((bb.height - INSET * 2) / 2) * 2;
console.log(`Demo bbox: x=${cropX} y=${cropY} w=${cropW} h=${cropH} (inset ${INSET}px)`);

console.log(`Recording for ${RECORD_MS / 1000}s`);
await page.waitForTimeout(RECORD_MS);

await ctx.close();
await browser.close();

const webm = (await readdir(RAW_DIR)).find((f) => f.endsWith(".webm"));
if (!webm) {
  console.error("No webm produced — recording failed.");
  process.exit(1);
}
const webmPath = path.join(RAW_DIR, webm);
console.log("Raw recording:", webmPath);

console.log("Cropping + minterpolate 50fps + 2x lanczos upscale → mp4");
await new Promise((resolve, reject) => {
  const child = spawn(FFMPEG, [
    "-hide_banner",
    "-loglevel", "error",
    "-y",
    "-i", webmPath,
    "-vf", `crop=${cropW}:${cropH}:${cropX}:${cropY},minterpolate=fps=50:mi_mode=mci:me_mode=bidir:vsbmc=1,scale=iw*2:ih*2:flags=lanczos`,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "20",
    "-preset", "medium",
    "-an",
    FINAL_MP4,
  ]);
  child.stderr.on("data", (d) => process.stderr.write(d.toString()));
  child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
});

console.log("Saved:", FINAL_MP4);
