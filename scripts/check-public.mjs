// Fails the build if anything that belongs to the private panel share leaks
// into the public site. Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const forbiddenInDist = ['shannonhecker-work', 'noindex', 'Revolut'];
const forbiddenInVercel = ['X-Robots-Tag', 'includeSubDomains', 'preload'];
const textExt = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|map)$/i;

const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
const policy = JSON.parse(vercel).headers.flatMap(rule => rule.headers).find(header => header.key === 'Content-Security-Policy').value;
const scriptSources = policy.split(';').map(part => part.trim()).find(part => part.startsWith('script-src ')).split(/\s+/);
const problems = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) { walk(file); continue; }
    if (!textExt.test(name)) continue;
    const text = readFileSync(file, 'utf8');
    if (name.endsWith('.html')) {
      for (const [, attributes, body] of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!body.trim() || /\btype=["']application\/(?:ld\+)?json["']/i.test(attributes)) continue;
        const hash = createHash('sha256').update(body).digest('base64');
        if (!scriptSources.includes(`'sha256-${hash}'`)) problems.push(`${relative(dist, file)} contains an inline script missing from the CSP`);
      }
    }
    for (const word of forbiddenInDist) {
      if (text.includes(word)) problems.push(`dist/${relative(dist, file)} contains "${word}"`);
    }
  }
}
try {
  walk(dist);
} catch (error) {
  problems.push(error.code === 'ENOENT' ? 'dist/ is missing: run npm run build first' : `could not read dist/: ${error.message}`);
}

if (scriptSources.includes("'unsafe-inline'")) problems.push('Inline scripts require explicit hashes');
for (const word of forbiddenInVercel) {
  if (vercel.includes(word)) problems.push(`vercel.json contains "${word}"`);
}

if (problems.length) {
  console.error(`check:public failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check:public passed');
