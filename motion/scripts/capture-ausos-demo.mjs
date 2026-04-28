// Capture the live ausos.ai .hero-product carousel as a real-time mp4.
//
// Switched from element.screenshot loop (slow, ~1.5fps wall clock) to
// Playwright's recordVideo (captures viewport at the page's natural rate)
// followed by an ffmpeg crop down to the demo's bounding box.
//
// Result: 30s mp4 that plays back at the same 6s/step cadence as ausos.ai.

import { chromium } from "playwright";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "out", "ausos-demo");
const RAW_DIR = path.join(OUT_DIR, "raw");
const FINAL_MP4 = path.join(OUT_DIR, "ausos-demo.mp4");
const FFMPEG = path.join(ROOT, "node_modules", "ffmpeg-static", "ffmpeg");

const VIEWPORT_W = 1440;
const VIEWPORT_H = 1100;
const RECORD_MS = 31_000; // 1s lead-in + one 30s carousel cycle (5 × 6s)
// We let recordVideo.size default to viewport (Playwright at deviceScaleFactor=2
// renders the page with 2x supersampling and downsamples to viewport size in
// the recording — sharper than a true 1x render). The final mp4 is then 2x
// upscaled with lanczos in the ffmpeg pass, so the browser never has to upscale
// further on retina displays.

await rm(RAW_DIR, { recursive: true, force: true });
await mkdir(RAW_DIR, { recursive: true });

console.log("Launching chromium");
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
  // recordVideo's default size caps at 800px width (loses crop resolution).
  // Pin it to viewport CSS size so bbox coords map 1:1, then we 2x-upscale
  // with lanczos in the ffmpeg pass below.
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

// No CSS isolation — surgical hiding broke the demo's ancestors last try.
// The recorded viewport will include marketing chrome, but the ffmpeg crop
// at the end strips everything except the demo's bounding box anyway.
// Just kill scrollbars so they don't sneak into the crop region.
await page.addStyleTag({
  content: `html, body { overflow: hidden !important; }`,
});
await page.waitForTimeout(300);
const bb = await demo.boundingBox();
if (!bb) {
  console.error("No bounding box for .hero-product — aborting.");
  process.exit(1);
}
// Inset the crop a few pixels on each side so the demo's rounded-corner
// edge / 1px border / drop shadow don't slice into the cover gradient as
// a hard line. Round to even pixels (h264 yuv420p requires even dims).
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

// Find the recorded webm
const webm = (await readdir(RAW_DIR)).find((f) => f.endsWith(".webm"));
if (!webm) {
  console.error("No webm produced — recording failed.");
  process.exit(1);
}
const webmPath = path.join(RAW_DIR, webm);
console.log("Raw recording:", webmPath);

console.log("Cropping + transcoding to h264 mp4");
await new Promise((resolve, reject) => {
  const child = spawn(FFMPEG, [
    "-hide_banner",
    "-loglevel", "error",
    "-y",
    "-i", webmPath,
    // Filter chain:
    //  1. crop to demo bbox
    //  2. minterpolate 25fps → 50fps with bidirectional MCI — Playwright's
    //     recordVideo is locked at 25fps which reads as laggy on 60Hz displays.
    //     Bidirectional motion-compensated interpolation handles cross-fades
    //     and discrete UI updates without the warping that plain MCI causes.
    //  3. lanczos 2x upscale so retina displays don't need to upscale further.
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
