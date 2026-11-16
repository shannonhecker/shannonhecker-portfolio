// Shared by the legacy importers (import-legacy.mjs and import-writing.mjs):
// a small HTML parser for the old static pages, and `git show` on the
// legacy-static branch. Nothing here rewrites words.
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BRANCH = 'legacy-static';

export class ImportError extends Error {}
let page = '';
/** Names the page being converted, so every failure says which one. */
export const setPage = (name) => { page = name; };
export const fail = (message) => { throw new ImportError(`${page}: ${message}`); };

// ---------------------------------------------------------------- HTML parsing
const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', nbsp: '\u00a0', middot: '\u00b7', hellip: '\u2026' };
export function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, body) => {
    if (body[0] === '#') return String.fromCodePoint(body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10));
    if (!(body in NAMED)) fail(`unknown character reference ${all}`);
    return NAMED[body];
  });
}
export function parse(html) {
  const rootNode = { tag: '#root', attrs: {}, children: [] };
  const stack = [rootNode];
  const token = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|[^<]+|</g;
  for (const m of html.matchAll(token)) {
    const [all, closing, tag, rawAttrs] = m;
    const top = stack[stack.length - 1];
    if (all.startsWith('<!--')) continue;
    if (!tag) { top.children.push({ tag: '#text', text: all }); continue; }
    const name = tag.toLowerCase();
    if (closing) {
      const at = stack.map((n) => n.tag).lastIndexOf(name);
      if (at < 1) fail(`closing </${name}> without an opening tag`);
      stack.length = at;
      continue;
    }
    const attrs = {};
    for (const a of (rawAttrs || '').matchAll(/([^\s=>/]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      attrs[a[1].toLowerCase()] = a[2] === undefined ? '' : decode(a[2].replace(/^["']|["']$/g, ''));
    }
    const node = { tag: name, attrs, children: [] };
    top.children.push(node);
    if (!VOID.has(name) && !all.endsWith('/>')) stack.push(node);
  }
  return rootNode;
}
export const classes = (n) => (n.attrs?.class ?? '').split(/\s+/).filter(Boolean);
export const hasClass = (n, c) => classes(n).includes(c);
export function all(node, test, out = []) {
  for (const c of node.children ?? []) { if (test(c)) out.push(c); all(c, test, out); }
  return out;
}
export const byClass = (node, c) => all(node, (n) => hasClass(n, c));
export const one = (node, c, what) => {
  const found = byClass(node, c);
  if (found.length !== 1) fail(`expected one .${c} (${what}), found ${found.length}`);
  return found[0];
};
export const elements = (node) => (node.children ?? []).filter((c) => c.tag !== '#text');
export function plain(node) {
  if (node.tag === '#text') return decode(node.text);
  return (node.children ?? []).map(plain).join('').replace(/\s+/g, ' ').trim();
}

export function git(args, options = {}) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 64 * 1024 * 1024, ...options });
}

