// Import of the Writing index and its three articles from the old static site.
//
//   node scripts/import-legacy.mjs writing      (or: node scripts/import-writing.mjs)
//
// Reads writing.html and writing-<slug>.html with `git show legacy-static:<file>`
// and writes src/content/writing/<slug>.md plus src/data/writing-index.json.
// It is the `writing` mode of import-legacy.mjs; it lives in its own file because
// import-legacy.mjs was already long. Both share scripts/lib/legacy-html.mjs.
//
// The articles are the owner's writing: words move across exactly. The only
// change the script can make is to an em or en dash, and only where DASH_FIXES
// names the exact text and its replacement (chosen by a person, sentence by
// sentence). The legacy articles contain no such dash, so DASH_FIXES is empty;
// if one ever appears the import stops and says where.
//
// What is not copied as text, and why (nothing a visitor reads is dropped):
//   - <hr/> between sections: each one sits directly before a numbered <h2>, which
//     now carries the hairline. The script checks that.
//   - The section numbers "01" to "07": rendered from a CSS counter. The script
//     checks they run 1, 2, 3 ... so the counter shows the same numbers.
//   - "Next post" / "Previously" links: rebuilt from the dates by Article.astro.
//     The script checks the legacy links point at the same neighbours.
//   - The author paragraph: one shared block in Article.astro (site chrome, not essay
//     prose). The script checks every legacy article carries exactly the text in
//     BIO_LEGACY, and that Article.astro carries that text with only the two
//     title corrections in BIO_FIXES (the owner's ruling, Fix round 1).
//   - The word count and reading time: not copied. The old figures were round guesses;
//     src/lib/writing.ts reads both off the rendered body. The script still checks the
//     legacy pages agree with themselves.
//   - Callouts (a small label and a paragraph) become a <dl>: the label is the term,
//     the paragraph the description. Adjacent callouts join into one list.
//
// If an expected part of a page is missing, or markup the script does not know
// turns up, it prints the page and the part and exits non-zero.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImportError, setPage, fail, parse, decode, all, hasClass, byClass, one, elements, plain, git, root, BRANCH } from './lib/legacy-html.mjs';

const SLUGS = ['the-design-system-is-the-contract', 'trust-surfaces-in-ai', 'when-everyone-can-ship'];

// { slug, from, to }: `from` must occur exactly once in that article's text.
const DASH_FIXES = [];

// The author paragraph on every legacy article, as plain text.
const BIO_LEGACY =
  'Shannon Hecker is a design engineer in London. She designs trading and markets tools at Barclays (opens in new tab), after nine years at J.P. Morgan (opens in new tab) ending as VP Product Design on the Fusion platform. She is building uoaui.ai on the side. A multi-design-system component composition tool for designers who think in systems. Get in touch via email or LinkedIn (opens in new tab).';
// What src/layouts/Article.astro carries: the legacy text with the two job titles
// corrected to the owner's facts. Each `from` must occur exactly once. Nothing else changes.
const BIO_FIXES = [
  ['is a design engineer in London', 'is a product designer in London'],
  ['ending as VP Product Design on the Fusion platform', 'ending as Digital Product Designer VP on the Fusion platform'],
];
const squashAll = (t) => t.replace(/\s+/g, '');
function bioForSite() {
  let out = BIO_LEGACY;
  for (const [from, to] of BIO_FIXES) {
    if (out.split(from).length !== 2) fail(`BIO_FIXES: "${from}" must occur exactly once in the legacy author paragraph`);
    out = out.replace(from, to);
  }
  return out;
}
/** The template's author paragraph must say exactly bioForSite(). */
function checkTemplateBio() {
  setPage('src/layouts/Article.astro');
  const src = readFileSync(join(root, 'src/layouts/Article.astro'), 'utf8');
  const m = src.match(/<p class="essay-bio">([\s\S]*?)<\/p>/);
  if (!m) fail('no <p class="essay-bio"> in the template');
  // The visually hidden "(opens in new tab)" spans are part of the text, as on the legacy page.
  const text = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
  if (squashAll(text) !== squashAll(bioForSite())) fail(`the template's author paragraph is not the legacy text with BIO_FIXES applied:\n  template: ${text.replace(/\s+/g, ' ').trim()}\n  expected: ${bioForSite()}`);
}

const DASH = /[\u2013\u2014]/;
let slugNow = '';
function words(text, where) {
  let out = text;
  for (const fix of DASH_FIXES.filter((f) => f.slug === slugNow)) {
    if (out.split(fix.from).length - 1 > 1) fail(`dash fix "${fix.from}" matches more than once in ${where}`);
    out = out.replace(fix.from, fix.to);
  }
  if (DASH.test(out)) fail(`dash in ${where}: "${out}". Add a DASH_FIXES entry with a replacement chosen for that sentence.`);
  return out;
}

// ------------------------------------------------------------- inline renderers
const mdText = (t) => t.replace(/([\\*_`<[\]])/g, '\\$1').replace(/&/g, '&amp;');
const htmlText = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const squash = (t) => t.replace(/\s+/g, ' ');

// kind: 'md' for Markdown text, 'html' for text written inside raw HTML.
function inline(nodes, kind, where) {
  let out = '';
  for (const n of nodes) {
    if (n.tag === '#text') { out += (kind === 'md' ? mdText : htmlText)(squash(decode(n.text))); continue; }
    if (n.tag === 'strong' || n.tag === 'em') {
      const inner = inline(n.children, kind, where);
      const core = inner.trim();
      if (!core) { out += inner; continue; }
      const lead = inner.match(/^\s*/)[0], trail = inner.match(/\s*$/)[0];
      if (kind === 'md') { const m = n.tag === 'strong' ? '**' : '*'; out += `${lead}${m}${core}${m}${trail}`; }
      else out += `${lead}<${n.tag}>${core}</${n.tag}>${trail}`;
      continue;
    }
    if (n.tag === 'code') {
      const t = plain(n);
      if (t.includes('`')) fail(`backtick inside <code> in ${where}`);
      out += kind === 'md' ? `\`${t}\`` : `<code>${htmlText(t)}</code>`;
      continue;
    }
    fail(`unsupported <${n.tag}> inside ${where}`);
  }
  return squash(out);
}
function line(node, kind, where) {
  const t = inline(node.children, kind, where).trim();
  if (!t) fail(`empty text in ${where}`);
  words(plain(node), where); // the dash guard runs on the words as written
  return words(t, where);
}
// A paragraph that begins like Markdown syntax would be read as something else.
const mdSafe = (node, rendered, where) => { const t = plain(node); if (/^(\d+[.)]\s|[#>+*-]|={3,}|-{3,})/.test(t)) fail(`${where} starts like Markdown syntax: "${t.slice(0, 30)}"`); return rendered; };

// ----------------------------------------------------------------- one article
function readMeta(html, where) {
  const description = (html.match(/<meta name="description" content="([^"]*)"/) ?? fail(`no meta description in ${where}`))[1];
  const ldText = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) ?? fail(`no JSON-LD in ${where}`))[1];
  return { description: decode(description), ld: JSON.parse(ldText) };
}

function article(slug) {
  const file = `writing-${slug}.html`;
  setPage(file);
  slugNow = slug;
  const html = git(['show', `${BRANCH}:${file}`], { encoding: 'utf8' });
  const { description, ld } = readMeta(html, file);
  const start = html.indexOf('<main id="main"'), end = html.indexOf('</main>');
  if (start < 0 || end < 0) fail('no <main id="main"> found');
  const main = parse(html.slice(start, end + 7));

  if (!ld.headline) fail('JSON-LD has no headline');
  const title = words(ld.headline, 'headline');
  if (ld['@type'] !== 'Article') fail('JSON-LD is not an Article');
  if (ld.description !== description) fail('JSON-LD description differs from the meta description');
  if (ld.datePublished !== ld.dateModified) fail('datePublished and dateModified differ');
  if (ld.author?.name !== 'Shannon Hecker') fail('JSON-LD author is not Shannon Hecker');
  const published = ld.datePublished;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(published)) fail(`odd date "${published}"`);

  // Head.
  const eyebrow = plain(one(main, 'essay-eyebrow', 'eyebrow'));
  const em = eyebrow.match(/^Writing \u00b7 (\d{4}-\d{2}-\d{2}) \u00b7 (\d+) minute read$/);
  if (!em) fail(`unexpected eyebrow "${eyebrow}"`);
  if (em[1] !== published) fail(`eyebrow date ${em[1]} differs from JSON-LD ${published}`);
  const minutes = Number(em[2]);
  const h1 = plain(one(main, 'essay-title', 'h1'));
  if (h1 !== `${title}.`) fail(`h1 "${h1}" is not the headline plus a full stop`);
  const dek = words(plain(one(main, 'essay-dek', 'standfirst')), 'standfirst');
  const meta = elements(one(main, 'essay-meta', 'meta row')).map(plain);
  if (meta.length !== 3 || meta[0] !== 'Shannon Hecker' || meta[1] !== '\u00b7') fail(`unexpected meta row ${JSON.stringify(meta)}`);
  const wm = meta[2].match(/^([\d,]+) words$/);
  if (!wm) fail(`unexpected word count "${meta[2]}"`);
  const wordCount = Number(wm[1].replace(/,/g, ''));
  if (wordCount !== ld.wordCount) fail(`word count ${wordCount} differs from JSON-LD ${ld.wordCount}`);

  // Body, in order.
  const art = all(main, (n) => n.tag === 'article' && hasClass(n, 'essay-body'))[0] ?? fail('no <article class="essay-body">');
  const body = [];
  const prev = []; // essay-prev blocks: [label, href, text]
  let bio = null;
  let section = 0;
  let pendingRule = false;
  const nodes = elements(art);
  const callouts = (group) => {
    const pairs = [];
    for (const c of group) {
      const kids = elements(c);
      let i = 0;
      while (i < kids.length) {
        const label = kids[i], text = kids[i + 1];
        if (!label || label.tag !== 'span' || !hasClass(label, 'label')) fail(`callout does not start with a label (found <${label?.tag}>)`);
        if (!text || text.tag !== 'p') fail(`callout label "${plain(label)}" is not followed by a paragraph`);
        pairs.push({ dt: words(plain(label), 'callout label'), dd: mdSafe(text, line(text, 'md', `callout "${plain(label)}"`), `callout "${plain(label)}"`) });
        i += 2;
      }
    }
    if (!pairs.length) fail('empty callout');
    return pairs;
  };
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.tag === 'hr') {
      if (nodes[i + 1]?.tag !== 'h2') fail('an <hr> that is not directly before an <h2>');
      pendingRule = true;
      continue;
    }
    if (n.tag === 'h2') {
      const num = elements(n).find((e) => e.tag === 'span' && hasClass(e, 'n')) ?? fail('<h2> without a section number');
      section += 1;
      if (plain(num) !== String(section).padStart(2, '0')) fail(`section number "${plain(num)}" breaks the 01, 02 ... run`);
      if (section > 1 && !pendingRule) fail(`section ${section} has no <hr> before it`);
      pendingRule = false;
      const text = words(squash(decode(n.children.filter((c) => c !== num).map((c) => (c.tag === '#text' ? c.text : fail('markup inside <h2>'))).join(''))).trim(), 'section heading');
      body.push({ h2: text });
      continue;
    }
    if (n.tag === 'p') { body.push({ p: mdSafe(n, line(n, 'md', 'paragraph'), 'paragraph') }); continue; }
    if (n.tag === 'blockquote') { body.push({ quote: mdSafe(n, line(n, 'md', 'blockquote'), 'blockquote') }); continue; }
    if (n.tag === 'div' && hasClass(n, 'callout')) {
      const group = [n];
      while (nodes[i + 1]?.tag === 'div' && hasClass(nodes[i + 1], 'callout')) group.push(nodes[++i]);
      body.push({ dl: callouts(group) });
      continue;
    }
    if (n.tag === 'div' && hasClass(n, 'essay-prev')) {
      const label = plain(one(n, 'essay-prev-label', 'link label'));
      const link = all(n, (e) => e.tag === 'a')[0] ?? fail('essay-prev without a link');
      prev.push({ label, href: link.attrs.href, text: plain(link) });
      continue;
    }
    if (n.tag === 'div' && hasClass(n, 'essay-bio')) { bio = plain(n); continue; }
    fail(`unsupported <${n.tag} class="${n.attrs.class ?? ''}"> in the article`);
  }
  if (section < 1) fail('no sections found');
  if (pendingRule) fail('an <hr> with no section after it');
  // plain() trims each text node, so compare with the spaces taken out.
  if (bio === null || squashAll(bio) !== squashAll(BIO_LEGACY)) fail(`author paragraph differs from BIO_LEGACY:\n  ${bio}`);
  const ending = body.at(-1);
  if (!ending?.p) fail('the article does not end with a paragraph');

  const keywords = String(ld.keywords ?? '').split(',').map((k) => words(k.trim(), 'keyword')).filter(Boolean);
  return { slug, file, title, description: words(description, 'meta description'), published, minutes, wordCount, dek, keywords, body, prev, h1 };
}

// ------------------------------------------------------------------- the index
function index() {
  const file = 'writing.html';
  setPage(file);
  slugNow = '';
  const html = git(['show', `${BRANCH}:${file}`], { encoding: 'utf8' });
  const description = (html.match(/<meta name="description" content="([^"]*)"/) ?? fail('no meta description'))[1];
  const start = html.indexOf('<main id="main"'), end = html.indexOf('</main>');
  if (start < 0 || end < 0) fail('no <main id="main"> found');
  const main = parse(html.slice(start, end + 7));
  if (plain(one(main, 'wr-eyebrow', 'eyebrow')) !== 'Writing') fail('index eyebrow is not "Writing"');
  const intro = {
    title: words(plain(one(main, 'wr-title', 'h1')), 'index title'),
    dek: words(plain(one(main, 'wr-dek', 'intro')), 'index intro'),
    description: words(decode(description), 'index description'),
  };
  const items = byClass(main, 'wr-item').map((a) => {
    const slug = (a.attrs.href ?? '').replace(/^writing-/, '').replace(/\.html$/, '');
    const spans = elements(one(a, 'wr-item-meta', 'item meta')).filter((s) => !hasClass(s, 'sep')).map(plain);
    const read = spans[1]?.match(/^(\d+) min$/);
    if (spans.length !== 2 || !read) fail(`unexpected item meta ${JSON.stringify(spans)}`);
    return {
      slug,
      title: words(plain(one(a, 'wr-item-title', 'item title')), `index title of ${slug}`),
      date: spans[0],
      minutes: Number(read[1]),
      blurb: words(plain(one(a, 'wr-item-dek', 'item standfirst')), `index standfirst of ${slug}`),
      readLabel: plain(one(a, 'wr-item-read', 'read label')),
    };
  });
  if (items.length !== SLUGS.length) fail(`expected ${SLUGS.length} index entries, found ${items.length}`);
  for (const it of items) if (it.readLabel !== 'Read essay') fail(`unexpected link label "${it.readLabel}"`);
  return { intro, items };
}

// ------------------------------------------------------------------------ main
const problems = [];
let idx, arts = [];
try {
  idx = index();
  arts = SLUGS.map(article);
  checkTemplateBio();
  // The index and the articles must agree, and the "Next post"/"Previously" links
  // must point where the dates say they should.
  const byDate = [...arts].sort((a, b) => b.published.localeCompare(a.published));
  if (idx.items.map((i) => i.slug).join() !== byDate.map((a) => a.slug).join()) fail('the index is not newest first, or lists other articles');
  for (const it of idx.items) {
    const a = arts.find((x) => x.slug === it.slug);
    setPage(a.file);
    if (it.title !== a.h1) fail(`index title "${it.title}" differs from the article h1 "${a.h1}"`);
    if (it.date !== a.published) fail(`index date ${it.date} differs from ${a.published}`);
    if (it.minutes !== a.minutes) fail(`index says ${it.minutes} min, the article ${a.minutes}`);
    const at = byDate.indexOf(a);
    const newer = byDate[at - 1], older = byDate[at + 1];
    const expected = [newer && ['Next post', `writing-${newer.slug}.html`, `${newer.h1.replace(/\.$/, '')} \u2192`], older && ['Previously', `writing-${older.slug}.html`, `${older.h1.replace(/\.$/, '')} \u2192`]].filter(Boolean);
    const got = a.prev.map((p) => [p.label, p.href, p.text]).sort((x, y) => (x[0] === 'Next post' ? -1 : 1) - (y[0] === 'Next post' ? -1 : 1));
    if (JSON.stringify(got) !== JSON.stringify(expected)) fail(`neighbour links differ from the dates.\n  legacy:   ${JSON.stringify(got)}\n  expected: ${JSON.stringify(expected)}`);
  }
} catch (error) {
  if (error instanceof ImportError) problems.push(error.message); else throw error;
}
if (problems.length) {
  console.error(`import-writing failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

const q = JSON.stringify;
mkdirSync(join(root, 'src/content/writing'), { recursive: true });
mkdirSync(join(root, 'src/data'), { recursive: true });
for (const a of arts) {
  const it = idx.items.find((i) => i.slug === a.slug);
  const front = [
    '---',
    `title: ${q(a.title)}`,
    `description: ${q(a.description)}`,
    `published: ${a.published}`,
    // The old file name (writing-<slug>.html), kept for the redirects; never shown.
    `legacy: ${q(a.file)}`,
    // The standfirst under the title on the article page.
    `dek: ${q(a.dek)}`,
    // The line under the title on the index, which the old site worded differently.
    `blurb: ${q(it.blurb)}`,
    'keywords:',
    ...a.keywords.map((k) => `  - ${q(k)}`),
    '---',
    '',
  ];
  const out = a.body.map((b) => {
    if (b.h2) return `## ${mdText(b.h2)}`;
    if (b.p) return b.p;
    if (b.quote) return `> ${b.quote}`;
    // Raw HTML for the list, Markdown for the text in it: the blank lines let the
    // text go through the same pipeline as every other paragraph.
    return `<dl class="essay-terms">\n${b.dl.map((x) => `<div><dt>${htmlText(x.dt)}</dt><dd>\n\n${x.dd}\n\n</dd></div>`).join('\n')}\n</dl>`;
  });
  writeFileSync(join(root, 'src/content/writing', `${a.slug}.md`), front.join('\n') + out.join('\n\n') + '\n');
  console.log(`${a.slug}: ${a.body.length} blocks, ${a.body.filter((b) => b.h2).length} sections`);
}
writeFileSync(join(root, 'src/data/writing-index.json'), JSON.stringify(idx.intro, null, 2) + '\n');
console.log('writing-index.json: title, intro, description');
