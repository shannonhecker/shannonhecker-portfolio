// Redirect check. vercel.json `redirects` stay hand-written static JSON; this
// script is the source of truth they must match exactly:
//   node scripts/check-redirects.mjs                 static check against dist/
//   node scripts/check-redirects.mjs --self-test     parsing/comparison unit checks
//   node scripts/check-redirects.mjs --live <origin> request every legacy path on a host
// Live mode sends `x-vercel-protection-bypass: $VERCEL_BYPASS` when that variable is set.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CV = '/assets/CV_ShannonH.pdf';
const SHARE_IMAGE = '/og-card.png'; // keep in step with src/layouts/Base.astro

// Old files that map to a page that is not an earlier-project or article page.
export const FIXED = {
  '/index.html': '/',
  '/work.html': '/work',
  '/about.html': '/about',
  '/writing.html': '/writing',
  '/privacy.html': '/privacy',
  '/panel': '/',
  '/build': '/',
  '/project-analytics.html': '/fusion',
  '/project-deal-model.html': '/deal-model',
  '/project-uoaui.html': '/uoaui',
  '/project-ausos.html': '/uoaui',
  '/project-winkingstar.html': '/winking-star',
  // Old share image, shown in cached LinkedIn link previews.
  '/assets/og-preview.png': SHARE_IMAGE,
  '/assets/og-preview.webp': SHARE_IMAGE,
};

export function legacyField(markdown) {
  const m = /^legacy:\s*"?([^"\n]+?)"?\s*$/m.exec(markdown.split(/^---\s*$/m)[1] ?? '');
  return m ? m[1] : null;
}

// Pairs from content front matter: src/content/<dir>/<slug>.md -> /<prefix>/<slug>
export function contentRules(base = root) {
  const out = {};
  for (const [dir, prefix] of [['earlier', '/work'], ['writing', '/writing']]) {
    const d = join(base, 'src/content', dir);
    for (const f of readdirSync(d).filter((n) => n.endsWith('.md'))) {
      const legacy = legacyField(readFileSync(join(d, f), 'utf8'));
      if (!legacy) throw new Error(`${dir}/${f} has no legacy field`);
      out[`/${legacy}`] = `${prefix}/${f.replace(/\.md$/, '')}`;
    }
  }
  return out;
}

export const expectedRules = (base = root) => ({ ...FIXED, ...contentRules(base) });

// Compare configured redirects with the expected map; returns a list of problems.
export function compareRules(redirects, expected) {
  const problems = [];
  const seen = new Map();
  for (const r of redirects) {
    if (r.permanent !== true) problems.push(`${r.source} is not permanent: true`);
    if (/[?#]/.test(r.source)) problems.push(`${r.source} carries a query or hash`);
    if (seen.has(r.source)) problems.push(`${r.source} appears twice`);
    seen.set(r.source, r.destination);
  }
  for (const [src, dest] of Object.entries(expected)) {
    if (!seen.has(src)) problems.push(`missing rule ${src} -> ${dest}`);
    else if (seen.get(src) !== dest) problems.push(`${src} goes to ${seen.get(src)}, expected ${dest}`);
  }
  for (const src of seen.keys()) if (!(src in expected)) problems.push(`unexpected rule ${src}`);
  for (const [src, dest] of seen) if (seen.has(dest)) problems.push(`chain: ${src} -> ${dest} -> ${seen.get(dest)}`);
  if (seen.has(CV)) problems.push(`${CV} must not be redirected`);
  return problems;
}

export function destinationFile(dest, dist) {
  const clean = dest.replace(/\/$/, '') || '/index';
  return [join(dist, clean), join(dist, clean + '.html'), join(dist, clean, 'index.html')].find((p) => /\.[a-z0-9]+$/i.test(p) && existsSync(p));
}

// Live: is this response a permanent redirect to the expected path?
export function checkRedirectResponse(status, location, dest, origin) {
  if (status !== 308 && status !== 301) return `status ${status}, expected 308 or 301`;
  if (!location) return 'no Location header';
  let path;
  try { path = new URL(location, origin).pathname; } catch { return `bad Location ${location}`; }
  return path === dest ? null : `Location path ${path}, expected ${dest}`;
}

function legacyRootPages() {
  try {
    const list = execFileSync('git', ['ls-tree', '--name-only', 'legacy-static'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n');
    return list.filter((n) => n.endsWith('.html') && n !== '404.html');
  } catch { return null; }
}

function staticCheck() {
  const problems = [];
  const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const redirects = config.redirects ?? [];
  const expected = expectedRules();
  problems.push(...compareRules(redirects, expected));
  const dist = join(root, 'dist');
  if (!existsSync(dist)) problems.push('dist/ is missing: run npm run build first');
  else {
    for (const [src, dest] of Object.entries(expected)) if (!destinationFile(dest, dist)) problems.push(`${src}: destination ${dest} has no file in dist/`);
    if (!existsSync(join(dist, CV))) problems.push(`${CV} is missing from dist/`);
  }
  const legacy = legacyRootPages();
  if (!legacy) console.log('note: legacy-static branch not found, skipped cross-check against it');
  else for (const f of legacy) if (!(`/${f}` in expected)) problems.push(`legacy-static file /${f} has no rule`);
  if (problems.length) { console.error(problems.map((p) => 'FAIL ' + p).join('\n')); process.exit(1); }
  for (const r of redirects) console.log(`${r.source.padEnd(46)} -> ${r.destination}`);
  console.log(`\n${redirects.length} permanent redirects OK; ${CV} stays in dist/ and is not redirected`);
}

async function live(origin) {
  const headers = process.env.VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS } : {};
  const get = (p) => fetch(new URL(p, origin), { redirect: 'manual', headers });
  const problems = [];
  for (const [src, dest] of Object.entries(expectedRules())) {
    const res = await get(src);
    const bad = checkRedirectResponse(res.status, res.headers.get('location'), dest, origin);
    if (bad) problems.push(`${src}: ${bad}`);
    const target = await get(dest);
    if (target.status !== 200) problems.push(`${src}: destination ${dest} returned ${target.status}`);
    else console.log(`ok ${src} -> ${dest}`);
  }
  const cv = await get(CV);
  if (cv.status !== 200 || !(cv.headers.get('content-type') ?? '').includes('application/pdf')) problems.push(`${CV}: ${cv.status} ${cv.headers.get('content-type')}`);
  if (problems.length) { console.error(problems.map((p) => 'FAIL ' + p).join('\n')); process.exit(1); }
  console.log(`live check OK on ${origin}`);
}

function selfTest() {
  const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`self-test ${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); };
  eq(legacyField('---\ntitle: "x"\nlegacy: "project-tripup.html"\n---\nbody'), 'project-tripup.html', 'legacyField');
  eq(legacyField('---\ntitle: x\n---\nlegacy: "no.html"'), null, 'legacy outside front matter');
  const ok = { source: '/a.html', destination: '/a', permanent: true };
  eq(compareRules([ok], { '/a.html': '/a' }), [], 'match');
  eq(compareRules([{ ...ok, permanent: false }], { '/a.html': '/a' }).length, 1, 'not permanent');
  eq(compareRules([], { '/a.html': '/a' }), ['missing rule /a.html -> /a'], 'missing');
  eq(compareRules([{ ...ok, destination: '/b' }], { '/a.html': '/a' }).length, 1, 'wrong destination');
  eq(compareRules([ok, { source: '/a', destination: '/c', permanent: true }], { '/a.html': '/a', '/a': '/c' }).some((p) => p.startsWith('chain')), true, 'chain');
  eq(checkRedirectResponse(308, '/a', '/a', 'https://x.test'), null, 'live ok relative');
  eq(checkRedirectResponse(308, 'https://x.test/a?q=1#h', '/a', 'https://x.test'), null, 'live ok absolute');
  eq(checkRedirectResponse(200, null, '/a', 'https://x.test'), 'status 200, expected 308 or 301', 'live 200');
  eq(checkRedirectResponse(307, '/a', '/a', 'https://x.test').startsWith('status 307'), true, 'live 307');
  eq(checkRedirectResponse(308, '/b', '/a', 'https://x.test'), 'Location path /b, expected /a', 'live wrong');
  console.log('self-test OK');
}

const args = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  if (args[0] === '--self-test') selfTest();
  else if (args[0] === '--live') {
    if (!args[1]) { console.error('usage: --live <origin>'); process.exit(2); }
    await live(args[1]);
  } else { selfTest(); staticCheck(); }
}
