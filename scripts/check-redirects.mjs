// Redirect check. vercel.json `redirects` stay hand-written static JSON; this
// script is the source of truth they must match exactly.
// With cleanUrls: true Vercel first 308s /x.html to /x, and only then matches
// user redirects, so rule sources are the CLEAN form (no .html). An old address
// is therefore a two-hop path: /x.html -> /x (Vercel) -> new page (our rule).
// A legacy page whose clean path is already a real page (/about) needs no rule.
//   node scripts/check-redirects.mjs                 static check against dist/
//   node scripts/check-redirects.mjs --self-test     parsing/comparison unit checks
//   node scripts/check-redirects.mjs --live <origin> request every legacy path on a host
// Live mode sends `x-vercel-protection-bypass: $VERCEL_BYPASS` when that variable is set.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CV = '/assets/CV_ShannonH.pdf';
const SHARE_IMAGE = '/og-card.png'; // keep in step with src/layouts/Base.astro

// Old addresses (as linked externally) that map to a page that is not an earlier-project or article page.
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

// Every old address -> new page (used by --live).
export const legacyMap = (base = root) => ({ ...FIXED, ...contentRules(base) });

export const cleanPath = (p) => p.replace(/\.html$/, '');

// Rules vercel.json must hold: clean-form sources; a legacy page whose clean
// path already is its destination (/about.html -> /about) is served by Vercel's
// own clean-URL redirect and needs no rule.
export function expectedRules(base = root) {
  const out = {};
  for (const [src, dest] of Object.entries(legacyMap(base))) if (cleanPath(src) !== dest) out[cleanPath(src)] = dest;
  return out;
}

// Compare configured redirects with the expected map; returns a list of problems.
export function compareRules(redirects, expected, cleanUrls = true) {
  const problems = [];
  const seen = new Map();
  for (const r of redirects) {
    if (r.permanent !== true) problems.push(`${r.source} is not permanent: true`);
    if (cleanUrls && r.source.endsWith('.html')) problems.push(`${r.source} ends in .html but cleanUrls is true: Vercel redirects /x.html to /x before user redirects run, so this rule never matches. Use ${cleanPath(r.source)}`);
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
export function checkHop(status, location, from) {
  if (status !== 308 && status !== 301) return { error: `status ${status}, expected 308 or 301` };
  if (!location) return { error: 'no Location header' };
  try { return { next: new URL(location, from) }; } catch { return { error: `bad Location ${location}` }; }
}

// Follow redirects by hand. fetchHop(url) -> { status, location }. Returns { hops, final, error }.
export async function followRedirects(startUrl, origin, fetchHop, maxHops = 2) {
  let url = new URL(startUrl);
  for (let hops = 0; ; hops++) {
    const { status, location } = await fetchHop(url);
    if (status !== 308 && status !== 301 && status !== 302 && status !== 307) return { hops, final: url, status };
    if (hops === maxHops) return { hops, final: url, error: `more than ${maxHops} hops` };
    const hop = checkHop(status, location, url);
    if (hop.error) return { hops, final: url, error: `hop ${hops + 1} (${url.pathname}): ${hop.error}` };
    if (hop.next.origin !== new URL(origin).origin) return { hops, final: url, error: `hop ${hops + 1} leaves ${origin}: ${hop.next.href}` };
    url = hop.next;
  }
}

// Judge a followRedirects result against the expected destination and hop budget.
export function judge(res, dest, maxHops, exactHops) {
  if (res.error) return res.error;
  if (res.final.pathname !== dest) return `ended at ${res.final.pathname}, expected ${dest}`;
  if (res.hops > maxHops) return `${res.hops} hops, at most ${maxHops}`;
  if (exactHops !== undefined && res.hops !== exactHops) return `${res.hops} hops, expected exactly ${exactHops}`;
  if (res.status !== 200) return `destination returned ${res.status}`;
  return null;
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
  problems.push(...compareRules(redirects, expected, config.cleanUrls === true));
  const dist = join(root, 'dist');
  if (!existsSync(dist)) problems.push('dist/ is missing: run npm run build first');
  else {
    for (const [src, dest] of Object.entries(legacyMap())) if (!destinationFile(dest, dist)) problems.push(`${src}: destination ${dest} has no file in dist/`);
    if (!existsSync(join(dist, CV))) problems.push(`${CV} is missing from dist/`);
  }
  const legacy = legacyRootPages();
  if (!legacy) console.log('note: legacy-static branch not found, skipped cross-check against it');
  else for (const f of legacy) if (!(`/${f}` in legacyMap())) problems.push(`legacy-static file /${f} has no entry in the legacy map`);
  if (problems.length) { console.error(problems.map((p) => 'FAIL ' + p).join('\n')); process.exit(1); }
  for (const r of redirects) console.log(`${r.source.padEnd(46)} -> ${r.destination}`);
  console.log(`\n${redirects.length} permanent redirects OK; ${CV} stays in dist/ and is not redirected`);
}

async function live(origin) {
  const headers = process.env.VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS } : {};
  const fetchHop = async (url) => {
    const res = await fetch(url, { redirect: 'manual', headers });
    return { status: res.status, location: res.headers.get('location') };
  };
  const problems = [];
  for (const [src, dest] of Object.entries(legacyMap())) {
    const full = await followRedirects(new URL(src, origin), origin, fetchHop);
    const bad = judge(full, dest, 2);
    if (bad) problems.push(`${src}: ${bad}`);
    else console.log(`ok ${src} -> ${dest} (${full.hops} hops)`);
    // The clean form is what our rule matches: exactly one hop, unless it already is the page.
    const clean = cleanPath(src);
    if (clean !== src || src in FIXED) {
      const one = await followRedirects(new URL(clean, origin), origin, fetchHop);
      const badClean = judge(one, dest, 1, clean === dest ? 0 : 1);
      if (badClean) problems.push(`${clean} (clean form): ${badClean}`);
    }
  }
  const cv = await fetch(new URL(CV, origin), { redirect: 'manual', headers });
  if (cv.status !== 200 || !(cv.headers.get('content-type') ?? '').includes('application/pdf')) problems.push(`${CV}: ${cv.status} ${cv.headers.get('content-type')}`);
  if (problems.length) { console.error(problems.map((p) => 'FAIL ' + p).join('\n')); process.exit(1); }
  console.log(`live check OK on ${origin}`);
}

async function selfTest() {
  const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`self-test ${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); };
  eq(legacyField('---\ntitle: "x"\nlegacy: "project-tripup.html"\n---\nbody'), 'project-tripup.html', 'legacyField');
  eq(legacyField('---\ntitle: x\n---\nlegacy: "no.html"'), null, 'legacy outside front matter');
  const ok = { source: '/b', destination: '/a', permanent: true };
  eq(compareRules([ok], { '/b': '/a' }), [], 'match');
  eq(compareRules([{ ...ok, permanent: false }], { '/b': '/a' }).length, 1, 'not permanent');
  eq(compareRules([], { '/b': '/a' }), ['missing rule /b -> /a'], 'missing');
  eq(compareRules([{ ...ok, destination: '/z' }], { '/b': '/a' }).length, 1, 'wrong destination');
  eq(compareRules([ok, { source: '/a', destination: '/c', permanent: true }], { '/b': '/a', '/a': '/c' }).some((p) => p.startsWith('chain')), true, 'chain');
  eq(compareRules([{ source: '/a.html', destination: '/a', permanent: true }], { '/a.html': '/a' }).some((p) => p.includes('cleanUrls is true')), true, '.html source rejected');
  eq(compareRules([{ source: '/a.html', destination: '/a', permanent: true }], { '/a.html': '/a' }, false).some((p) => p.includes('cleanUrls')), false, '.html allowed without cleanUrls');
  eq(cleanPath('/project-tripup.html'), '/project-tripup', 'cleanPath');
  const x = expectedRules();
  eq(['/about', '/work', '/writing', '/privacy'].some((k) => k in x), false, 'page-named clean sources get no rule');
  eq(x['/project-tripup'], '/work/tripup', 'clean source for tripup');
  eq(Object.keys(x).some((k) => k.endsWith('.html')), false, 'no .html sources expected');
  eq(checkHop(308, '/a', new URL('https://x.test/b')).next.href, 'https://x.test/a', 'hop relative');
  eq(checkHop(200, null, new URL('https://x.test/')).error, 'status 200, expected 308 or 301', 'hop 200');
  eq(checkHop(307, '/a', new URL('https://x.test/')).error.startsWith('status 307'), true, 'hop 307');
  const site = { '/old.html': [308, '/old'], '/old': [308, '/new'], '/new': [200], '/loop': [308, '/loop'], '/off': [308, 'https://evil.test/new'] };
  const fh = async (u) => { const [status, location] = site[u.pathname] ?? [404]; return { status, location }; };
  const go = (p, o = 'https://x.test') => followRedirects(new URL(p, 'https://x.test'), o, fh);
  eq(judge(await go('/old.html'), '/new', 2), null, 'two hops ok');
  eq(judge(await go('/old'), '/new', 1, 1), null, 'one hop exact');
  eq(judge(await go('/old.html'), '/new', 1) !== null, true, 'too many hops');
  eq(judge(await go('/old.html'), '/other', 2) !== null, true, 'wrong destination');
  eq(judge(await go('/off'), '/new', 2).includes('leaves'), true, 'other origin rejected');
  eq(judge(await go('/loop'), '/loop', 2).includes('more than'), true, 'loop stopped');
  eq(judge(await go('/missing'), '/missing', 2), 'destination returned 404', 'dest 404');
  console.log('self-test OK');
}

const args = process.argv.slice(2);
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (args[0] === '--self-test') await selfTest();
  else if (args[0] === '--live') {
    if (!args[1]) { console.error('usage: --live <origin>'); process.exit(2); }
    await live(args[1]);
  } else { await selfTest(); staticCheck(); }
}
