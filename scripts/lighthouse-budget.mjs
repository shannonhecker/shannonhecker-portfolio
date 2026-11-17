// Lighthouse budget: 95 or more in every category, on every listed page, mobile and desktop.
// Usage: npm run build && node scripts/lighthouse-budget.mjs [path ...]
//
// A single Lighthouse run on a shared CI machine swings by ten points or more when the
// machine is busy, and the first run after start-up is the slowest. So:
//   1. one warm-up run is thrown away;
//   2. a page that scores 95 or more everywhere on its first run passes;
//   3. a page that does not is run twice more and judged on the median of the three.
// The bar itself does not move. Every page is measured before the script exits, so one
// failing page does not hide the others. Reports of failing runs are kept as lh-*.json.
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, copyFileSync } from 'node:fs';

const PORT = 4321;
const ORIGIN = `http://localhost:${PORT}`;
const BAR = 95;
const DEFAULT_PAGES = ['/', '/fx', '/fusion', '/winking-star', '/deal-model', '/uoaui', '/work', '/work/tripup', '/writing', '/about'];
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;
const PRESETS = ['mobile', 'desktop'];
const CHROME_FLAGS = `--headless=new${process.env.CI ? ' --no-sandbox' : ''}`;

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore' });

async function ready() {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(ORIGIN)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('preview server did not start');
}

/** One Lighthouse run. Returns the four category scores out of 100. */
function run(path, preset) {
  const args = ['-y', 'lighthouse@12', ORIGIN + path, '--quiet', `--chrome-flags=${CHROME_FLAGS}`, '--output=json', '--output-path=lh.json'];
  if (preset === 'desktop') args.push('--preset=desktop');
  const result = spawnSync('npx', args, { stdio: ['ignore', 'ignore', 'inherit'] });
  if (result.status !== 0) throw new Error(`Lighthouse did not finish for ${path} (${preset})`);
  const { categories } = JSON.parse(readFileSync('lh.json', 'utf8'));
  return Object.fromEntries(Object.entries(categories).map(([key, value]) => [key, Math.round(value.score * 100)]));
}

const below = (scores) => Object.entries(scores).filter(([, score]) => score < BAR).map(([key]) => key);
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const slug = (path, preset) => `${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${preset}`;

let failed = 0;
try {
  await ready();
  run(PAGES[0], 'mobile'); // warm-up, thrown away

  for (const path of PAGES) for (const preset of PRESETS) {
    const runs = [run(path, preset)];
    if (below(runs[0]).length) {
      copyFileSync('lh.json', `lh-${slug(path, preset)}-1.json`);
      for (let n = 2; n <= 3; n++) {
        runs.push(run(path, preset));
        copyFileSync('lh.json', `lh-${slug(path, preset)}-${n}.json`);
      }
    }
    const judged = Object.fromEntries(Object.keys(runs[0]).map((key) => [key, median(runs.map((scores) => scores[key]))]));
    const low = below(judged);
    const detail = runs.length > 1 ? ` (median of ${runs.length}; performance runs ${runs.map((scores) => scores.performance).join(', ')})` : '';
    console.log(`${low.length ? 'FAIL' : 'ok  '} ${path} ${preset} ${JSON.stringify(judged)}${detail}`);
    if (low.length) { failed++; console.error(`     below ${BAR}: ${low.join(', ')}`); }
  }
} finally {
  server.kill();
}

if (failed) { console.error(`${failed} page and preset pair(s) under the Lighthouse budget`); process.exit(1); }
console.log('Lighthouse budget met on every page');
