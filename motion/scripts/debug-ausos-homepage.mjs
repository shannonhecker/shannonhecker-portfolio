import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, "..", "out", "ausos-demo");

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
const page = await ctx.newPage();

await page.goto("https://ausos.ai/", { waitUntil: "networkidle", timeout: 60_000 });

// What's the URL after navigation? (in case redirect to /login)
console.log("Final URL:", page.url());

// Collect counts of likely selectors
const counts = await page.evaluate(() => {
  const sels = [
    ".hero-product",
    "[data-preview-stage]",
    ".preview-topbar",
    ".preview-shell",
    ".preview-sidebar",
    "[aria-label='Design Hub preview demo']",
    ".hero",
    "main",
    "[id='demo']",
  ];
  const out = {};
  for (const s of sels) out[s] = document.querySelectorAll(s).length;
  return out;
});
console.log("Selector counts:", JSON.stringify(counts, null, 2));

const bbox = await page.locator(".hero-product").first().boundingBox().catch(() => null);
console.log(".hero-product boundingBox:", bbox);

await page.screenshot({ path: path.join(OUT_DIR, "debug-fullpage.png"), fullPage: true });
await page.screenshot({ path: path.join(OUT_DIR, "debug-viewport.png"), fullPage: false });

await ctx.close();
await browser.close();
