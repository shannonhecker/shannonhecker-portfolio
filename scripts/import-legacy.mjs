// One-off import of the ten earlier project pages from the old static site.
//
//   node scripts/import-legacy.mjs
//
// Reads each page with `git show legacy-static:<file>`, writes
// src/content/earlier/<slug>.md and copies the images it uses from
// legacy-static:assets/ into src/assets/earlier/<slug>/. The script is kept for
// the record; run it again only to regenerate the files from the legacy branch.
//
// It does not rewrite words. The only changes it makes:
//   1. Em and en dashes. The legacy project pages contain none, so this is a
//      guard: a dash between two numbers becomes "to", any other dash stops the
//      import so that a person picks the right replacement for that sentence.
//   2. The stock dashboard page, whose retitle, lead and Barclays and Front
//      Office removals are listed in STOCK below and in
//      docs/superpowers/review/stock-dashboard-changes.md.
//   3. Section labels in the meta row ("Project Type") are written in sentence
//      case ("Project type").
//
// If an expected part of a page is missing, the script prints the page and the
// part and exits non-zero. It never writes an empty field.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRANCH = 'legacy-static';

// Order is the order the pages are shown in (src/lib/earlier.ts).
const PAGES = [
  { slug: 'stock-dashboard', legacy: 'project-barclays-data-viz.html' },
  { slug: 'tripup', legacy: 'project-tripup.html' },
  { slug: 'design-system', legacy: 'project-design-system.html' },
  { slug: 'data-solution', legacy: 'project-data-solution.html' },
  { slug: 'ui-toolkit', legacy: 'project-ui-toolkit.html' },
  { slug: 'corporate-action', legacy: 'project-corporate-action.html' },
  { slug: 'complex-assets', legacy: 'project-complex-assets.html' },
  { slug: 'research', legacy: 'project-research.html' },
  { slug: 'algo-center', legacy: 'project-algo-center.html' },
  { slug: 'dps-brand', legacy: 'project-dps-brand.html' },
];

// The stock dashboard is shown as a design task: no bank, no desk. Each entry
// must be found exactly where it is expected or the import stops.
const STOCK = {
  title: ['Barclays Data Visualisation', 'Stock dashboard design task'],
  lead: [
    'Stock performance dashboard for Barclays Front Office. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts.',
    'Stock performance dashboard design task. Six companies, two sectors, clear visualisations, and desktop-to-iPad layouts.',
  ],
  dropMeta: ['Client'],
  dropTags: ['Barclays'],
  alts: [
    ['Barclays stock dashboard: desktop, tablet, and mobile views', 'Stock dashboard: desktop, tablet, and mobile views'],
    ['Barclays stock dashboard: detailed chart modules, heatmap, and sector views', 'Stock dashboard: detailed chart modules, heatmap, and sector views'],
  ],
  files: [['barclays-banner.webp', 'stock-dashboard-banner.webp'], ['barclays-02.webp', 'stock-dashboard-02.webp']],
};

class ImportError extends Error {}
let page = '';
const fail = (message) => { throw new ImportError(`${page}: ${message}`); };

// ---------------------------------------------------------------- HTML parsing
const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', nbsp: '\u00a0', middot: '\u00b7', hellip: '\u2026' };
function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, body) => {
    if (body[0] === '#') return String.fromCodePoint(body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10));
    if (!(body in NAMED)) fail(`unknown character reference ${all}`);
    return NAMED[body];
  });
}
function parse(html) {
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
const classes = (n) => (n.attrs?.class ?? '').split(/\s+/).filter(Boolean);
const hasClass = (n, c) => classes(n).includes(c);
function all(node, test, out = []) {
  for (const c of node.children ?? []) { if (test(c)) out.push(c); all(c, test, out); }
  return out;
}
const byClass = (node, c) => all(node, (n) => hasClass(n, c));
const one = (node, c, what) => {
  const found = byClass(node, c);
  if (found.length !== 1) fail(`expected one .${c} (${what}), found ${found.length}`);
  return found[0];
};
const elements = (node) => (node.children ?? []).filter((c) => c.tag !== '#text');
function plain(node) {
  if (node.tag === '#text') return decode(node.text);
  return (node.children ?? []).map(plain).join('').replace(/\s+/g, ' ').trim();
}

// ------------------------------------------------------------------- the words
// Only dashes change. A range of numbers becomes "to"; anything else needs a person.
function dashes(text, where) {
  if (!/[\u2013\u2014]/.test(text)) return text;
  const ranged = text.replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, '$1 to $2');
  if (/[\u2013\u2014]/.test(ranged)) fail(`dash in ${where}: "${text}". Pick a period, colon or comma pair by hand.`);
  return ranged;
}
const md = (text) => text.replace(/([\\*_`<[\]])/g, '\\$1');

function inline(nodes, where) {
  let out = '';
  for (const n of nodes) {
    if (n.tag === '#text') { out += md(decode(n.text).replace(/\s+/g, ' ')); continue; }
    if (n.tag === 'strong' || n.tag === 'em') {
      const mark = n.tag === 'strong' ? '**' : '*';
      const inner = inline(n.children, where);
      const lead = inner.match(/^\s*/)[0], trail = inner.match(/\s*$/)[0];
      const core = inner.trim();
      if (!core) continue;
      out += `${lead}${mark}${core}${mark}${trail}`;
      continue;
    }
    fail(`unsupported <${n.tag}> inside ${where}`);
  }
  return out.replace(/\s+/g, ' ');
}
const para = (n, where) => dashes(inline(n.children, where).trim(), where);

// ------------------------------------------------------------------- one page
function git(args, options = {}) {
  return execFileSync('git', args, { cwd: root, maxBuffer: 64 * 1024 * 1024, ...options });
}

function convert({ slug, legacy }, order) {
  page = legacy;
  const html = git(['show', `${BRANCH}:${legacy}`], { encoding: 'utf8' });
  const start = html.indexOf('<main id="main-content"'), end = html.indexOf('</main>');
  if (start < 0 || end < 0) fail('no <main id="main-content"> found');
  const main = parse(html.slice(start, end + 7));

  const text = (c, what) => {
    const n = one(main, c, what);
    const t = plain(n);
    if (!t) fail(`.${c} (${what}) is empty`);
    return dashes(t, what);
  };
  let title = text('proj-title-post', 'h1 title');
  let summary = text('proj-lead', 'lead');

  // Meta row: Client or Project, Project Type, Year, Role.
  let role = '', dates = '';
  const details = [];
  for (const item of byClass(main, 'proj-meta-item')) {
    const label = plain(one(item, 'proj-meta-label', 'meta label'));
    const value = dashes(plain(one(item, 'proj-meta-value', `meta value of ${label}`)), `meta ${label}`);
    if (!value) fail(`meta "${label}" is empty`);
    if (label === 'Role') role = value;
    else if (label === 'Year') dates = value;
    else if (!(slug === 'stock-dashboard' && STOCK.dropMeta.includes(label))) details.push({ label: label.charAt(0) + label.slice(1).toLowerCase(), value });
  }
  if (!role) fail('no Role in the meta row');
  if (!dates) fail('no Year in the meta row');

  // Cover.
  const coverNode = one(main, 'proj-cover', 'cover image');
  // `source` is the file name on the legacy branch, `file` the name it is saved under.
  const useImage = (src, alt) => {
    const file = (src ?? '').replace(/^assets\//, '');
    if (!file || file === src) fail(`image src "${src}" is not under assets/`);
    if (!alt?.trim()) fail(`image ${file} has no alt text`);
    return { source: file, file, alt: dashes(alt.trim(), `alt of ${file}`) };
  };
  const cover = useImage(coverNode.attrs.src, coverNode.attrs.alt);

  // Outcomes tiles.
  const outcomes = byClass(main, 'proj-outcome').map((o) => ({
    value: dashes(plain(one(o, 'proj-outcome-num', 'outcome value')), 'outcome value'),
    label: dashes(plain(one(o, 'proj-outcome-label', 'outcome label')), 'outcome label'),
  }));
  if (!outcomes.length || outcomes.some((o) => !o.value || !o.label)) fail('no outcome tiles, or one is empty');

  // Tags.
  let tags = dashes(plain(one(main, 'proj-tags-list', 'tags')), 'tags').split(' \u00b7 ').map((t) => t.trim()).filter(Boolean);
  if (!tags.length) fail('no tags');

  // Body, in order.
  const aboutMain = one(main, 'proj-about-main', 'content column');
  const body = [];
  const bodyImages = [];
  const addImage = (img) => {
    const u = useImage(img.attrs.src, img.attrs.alt);
    bodyImages.push(u);
    body.push({ image: u });
  };
  const paragraphs = (container, where) => {
    for (const n of elements(container)) {
      if (n.tag === 'p') {
        const only = elements(n);
        const t = plain(n);
        if (only.length === 1 && only[0].tag === 'strong' && plain(only[0]) === t && /^Decision \d/.test(t)) { body.push({ h3: dashes(t, where) }); continue; }
        const line = para(n, where);
        if (!line) fail(`empty paragraph in ${where}`);
        body.push({ p: line });
      } else if (n.tag === 'ol' && hasClass(n, 'proj-a11y-list')) {
        const items = elements(n).map((li) => {
          if (li.tag !== 'li') fail(`unexpected <${li.tag}> in the checks list`);
          const label = plain(elements(li).find((e) => e.tag === 'span') ?? fail('check item has no label'));
          const name = label.replace(/^\d+\s*\u00b7\s*/, '');
          const p = elements(li).find((e) => e.tag === 'p') ?? fail('check item has no text');
          return { name: dashes(name, 'check label'), text: para(p, 'check text') };
        });
        if (!items.length) fail('checks list is empty');
        body.push({ ol: items });
      } else fail(`unsupported <${n.tag}> in ${where}`);
    }
  };
  for (const n of elements(aboutMain)) {
    if (hasClass(n, 'proj-tags')) continue;
    if (n.tag === 'figure' && hasClass(n, 'proj-nda')) {
      body.push({ nda: { title: plain(one(n, 'proj-nda-title', 'NDA title')), lead: plain(one(n, 'proj-nda-lead', 'NDA lead')), text: plain(one(n, 'proj-nda-body', 'NDA text')) } });
      continue;
    }
    if (n.tag === 'figure') {
      const img = elements(n).find((e) => e.tag === 'img') ?? fail('figure without an image');
      addImage(img);
      continue;
    }
    if (n.tag === 'img') { addImage(n); continue; }
    if (hasClass(n, 'proj-about-block')) {
      const h3 = elements(n).find((e) => hasClass(e, 'proj-about-h3')) ?? fail('section without a heading');
      const heading = dashes(plain(h3), 'section heading');
      if (heading === 'Outcomes') continue; // shown from the front matter
      body.push({ h2: heading });
      const bodies = elements(n).filter((e) => hasClass(e, 'proj-body'));
      if (!bodies.length) fail(`section "${heading}" has no text`);
      // The checks list sits beside the intro text, not inside .proj-body.
      for (const child of elements(n)) {
        if (hasClass(child, 'proj-body') || (child.tag === 'ol' && hasClass(child, 'proj-a11y-list')) || (child.tag === 'p')) {
          if (child.tag === 'p') { const line = para(child, `section "${heading}"`); if (line) body.push({ p: line }); }
          else if (child.tag === 'ol') paragraphs({ children: [child] }, `section "${heading}"`);
          else paragraphs(child, `section "${heading}"`);
        }
      }
      continue;
    }
    fail(`unsupported <${n.tag} class="${n.attrs.class ?? ''}"> in the content column`);
  }
  if (!body.some((b) => b.h2)) fail('no body sections found');

  // The stock dashboard names neither the bank nor the desk.
  if (slug === 'stock-dashboard') {
    const swap = (value, [from, to], what) => { if (value !== from) fail(`stock dashboard ${what} is not the expected text ("${value}")`); return to; };
    title = swap(title, STOCK.title, 'title');
    summary = swap(summary, STOCK.lead, 'lead');
    for (const [from, to] of STOCK.alts) {
      const hit = [cover, ...bodyImages].filter((i) => i.alt === from);
      if (hit.length !== 1) fail(`stock dashboard alt "${from}" not found exactly once`);
      hit[0].alt = to;
    }
    for (const t of STOCK.dropTags) { if (!tags.includes(t)) fail(`stock dashboard tag "${t}" not found`); tags = tags.filter((x) => x !== t); }
    for (const [from, to] of STOCK.files) {
      const hit = [cover, ...bodyImages].filter((i) => i.source === from);
      if (hit.length !== 1) fail(`stock dashboard image ${from} not found exactly once`);
      hit[0].file = to;
    }
  }
  const copies = [...new Map([cover, ...bodyImages].map((i) => [i.file, { from: i.source, to: i.file }])).values()];

  // Markdown.
  const q = JSON.stringify;
  const dir = `../../assets/earlier/${slug}`;
  const front = [
    '---',
    `title: ${q(title)}`,
    `summary: ${q(summary)}`,
    `role: ${q(role)}`,
    `dates: ${q(dates)}`,
    `order: ${order}`,
    `legacy: ${q(legacy)}`,
    details.length ? 'details:' : 'details: []',
    ...details.flatMap((d) => [`  - label: ${q(d.label)}`, `    value: ${q(d.value)}`]),
    'outcomes:',
    ...outcomes.flatMap((o) => [`  - value: ${q(o.value)}`, `    label: ${q(o.label)}`]),
    'tags:',
    ...tags.map((t) => `  - ${q(t)}`),
    `cover: ${dir}/${cover.file}`,
    `coverAlt: ${q(cover.alt)}`,
    '---',
    '',
  ];
  const out = [];
  for (const b of body) {
    if (b.h2) out.push(`## ${md(b.h2)}`);
    else if (b.h3) out.push(`### ${md(b.h3)}`);
    else if (b.p) out.push(b.p);
    else if (b.image) out.push(`![${b.image.alt.replace(/([\\[\]])/g, '\\$1')}](${dir}/${b.image.file})`);
    else if (b.ol) out.push(b.ol.map((it, i) => `${i + 1}. **${md(it.name)}**\n\n   ${it.text}`).join('\n\n'));
    else if (b.nda) {
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      out.push(`<aside class="earlier-note" aria-labelledby="earlier-note-title">\n<h2 id="earlier-note-title">${esc(b.nda.title)}</h2>\n<p>${esc(b.nda.lead)}</p>\n<p>${esc(b.nda.text)}</p>\n</aside>`);
    }
  }
  const file = front.join('\n') + out.join('\n\n') + '\n';
  // The `legacy` line keeps the old file name for the redirects; it is never shown.
  if (slug === 'stock-dashboard' && /barclays|front office/i.test(file.replace(/^legacy:.*$/m, ''))) fail('stock dashboard output still mentions Barclays or Front Office');
  return { slug, file, copies };
}

// ----------------------------------------------------------------------- main
const problems = [];
const results = [];
PAGES.forEach((p, i) => {
  try { results.push(convert(p, i + 1)); } catch (error) {
    if (error instanceof ImportError) problems.push(error.message); else throw error;
  }
});
if (problems.length) {
  console.error(`import-legacy failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
mkdirSync(join(root, 'src/content/earlier'), { recursive: true });
for (const { slug, file, copies } of results) {
  writeFileSync(join(root, 'src/content/earlier', `${slug}.md`), file);
  const dir = join(root, 'src/assets/earlier', slug);
  mkdirSync(dir, { recursive: true });
  for (const { from, to } of copies) writeFileSync(join(dir, to), git(['show', `${BRANCH}:assets/${from}`]));
  console.log(`${slug}: ${file.split('\n').length} lines, ${copies.length} image${copies.length === 1 ? '' : 's'}`);
}
