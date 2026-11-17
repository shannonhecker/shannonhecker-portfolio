// Full-page screenshots of every template at phone and desktop size, dark and light.
// Usage: npm run build && node scripts/qa-shots.mjs [path ...]
// Output: test-results/qa-shots/<page>-<width>-<theme>.png
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4393;
const ORIGIN = `http://localhost:${PORT}`;
const OUT = 'test-results/qa-shots';
const DEFAULT_PAGES = ['/', '/fx', '/work', '/work/tripup', '/work/stock-dashboard', '/writing', '/writing/trust-surfaces-in-ai', '/about', '/privacy'];
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;
const SIZES = [[390, 844], [1440, 900]];
const THEMES = ['dark', 'light'];

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore' });
async function ready() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(ORIGIN)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview server did not start');
}

try {
  await ready();
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [width, height] of SIZES) for (const theme of THEMES) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 500 ? 2 : 1, reducedMotion: 'reduce' });
    // A saved theme and a saved "no" to analytics, so the notice does not cover the page.
    await context.addInitScript((t) => {
      localStorage.setItem('portfolio-theme', t);
      localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() }));
    }, theme);
    const page = await context.newPage();
    for (const path of PAGES) {
      await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
      // Every image eager, the page walked top to bottom in steps, then wait until every image has
      // loaded (complete and a real width), so no lazy image is missing from the full-page capture.
      await page.evaluate(() => document.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; }));
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight / 2)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
        scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {
        console.warn(`images still missing on ${path}`);
      });
      // Artwork far below the window is skipped by content-visibility until it is near; a full-page capture
      // would show it empty. Paint everything for the capture.
      await page.addStyleTag({ content: '*{content-visibility:visible!important}' });
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);
      const name = path === '/' ? 'home' : path.slice(1).replaceAll('/', '_');
      await page.screenshot({ path: `${OUT}/${name}-${width}-${theme}.png`, fullPage: true });
      if (path === '/' && (await page.locator('#ask').count())) {
        await page.locator('#ask').scrollIntoViewIfNeeded();
        await page.locator('#ask').screenshot({ path: `${OUT}/ask-${width}-${theme}.png` });
      }
      console.log(`${name} ${width} ${theme}`);
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
