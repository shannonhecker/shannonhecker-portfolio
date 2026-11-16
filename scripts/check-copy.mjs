// Fails if a built page has an em dash or en dash in text a visitor reads.
// Strips scripts, styles and tags first, then also checks attribute text
// (alt, aria-label, meta content, title) that tags would otherwise hide.
// Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const dash = /[\u2013\u2014]/;
const dashes = /[\u2013\u2014]/g;
const attrs = /\b(?:alt|title|aria-label|aria-description|content|placeholder)="([^"]*)"/gi;

const problems = [];
function context(text, index) {
  return text.slice(Math.max(0, index - 30), index + 30).replace(/\s+/g, ' ').trim();
}
function check(file, text) {
  const rel = `dist/${relative(dist, file)}`;
  const visible = text
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  for (const match of visible.matchAll(attrs)) {
    const at = match[1].search(dash);
    if (at !== -1) problems.push(`${rel} (attribute): "${context(match[1], at)}"`);
  }
  const body = visible.replace(/<[^>]*>/g, ' ');
  for (const hit of body.matchAll(dashes)) problems.push(`${rel}: "${context(body, hit.index)}"`);
  // JSON-LD is script content a visitor never sees directly but search engines read.
  for (const match of text.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    const ld = match[1].search(dash);
    if (ld !== -1) problems.push(`${rel} (JSON-LD): "${context(match[1], ld)}"`);
  }
}
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (/\.html$/i.test(name)) check(file, readFileSync(file, 'utf8'));
  }
}
try {
  walk(dist);
} catch (error) {
  problems.push(error.code === 'ENOENT' ? 'dist/ is missing: run npm run build first' : `could not read dist/: ${error.message}`);
}

if (problems.length) {
  console.error(`check:copy failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check:copy passed');
