// Fails the build if anything that belongs to the private panel share leaks
// into the public site. Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const forbiddenInDist = ['shannonhecker-work', 'noindex', 'Revolut'];
const forbiddenInVercel = ['X-Robots-Tag', 'includeSubDomains', 'preload'];
const textExt = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|map)$/i;

const problems = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) { walk(file); continue; }
    if (!textExt.test(name)) continue;
    const text = readFileSync(file, 'utf8');
    for (const word of forbiddenInDist) {
      if (text.includes(word)) problems.push(`dist/${relative(dist, file)} contains "${word}"`);
    }
  }
}
try { walk(dist); } catch { problems.push('dist/ is missing: run npm run build first'); }

const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
for (const word of forbiddenInVercel) {
  if (vercel.includes(word)) problems.push(`vercel.json contains "${word}"`);
}

if (problems.length) {
  console.error(`check:public failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check:public passed');
