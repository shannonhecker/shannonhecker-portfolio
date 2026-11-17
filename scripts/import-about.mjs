// The `about` mode of the legacy importer.
//
//   node scripts/import-legacy.mjs about      (or: node scripts/import-about.mjs)
//
// The old About lives in two places: about.html (My approach, Experience, Expertise)
// and the About section of index.html (portrait, opening, three figures, links, Now,
// Outside work). This prints every section of both, in page order, as plain text, so
// the page (src/pages/about.astro) can be placed by hand against it. It writes nothing.
//
// It also names, for the owner's eye, the lines that the page does not carry as written:
//   - a title or date that the owner's facts correct (see TITLE_WORDS),
//   - an em or en dash (none today; one would have to be replaced by a person),
//   - a personal detail (family or home life), which docs/superpowers/review/about-changes.md
//     lists under "For you to confirm".
// Words are never rewritten here. Shared parser: scripts/lib/legacy-html.mjs.
import { setPage, fail, parse, all, hasClass, elements, plain, git, BRANCH, ImportError } from './lib/legacy-html.mjs';

const TITLE_WORDS = /Design engineer|Senior Product Designer|Vice President|VP Product Design|Product Designer VP|User Experience Designer|Lead Product Designer|\b20\d\d\b/;
const PERSONAL = /married|kids|cat called|St Albans|Taiwan-born/i;
const DASH = /[\u2013\u2014]/;
const CHAT = /Shannon.s AI|chat|Ask Shannon|Speech to text|Send message|Ask about my work/i;

const show = (text) => {
  const marks = [TITLE_WORDS.test(text) && 'TITLE/DATE', DASH.test(text) && 'DASH', PERSONAL.test(text) && 'PERSONAL', CHAT.test(text) && 'CHAT (not carried)'].filter(Boolean);
  console.log(`    ${text}${marks.length ? `   <${marks.join(', ')}>` : ''}`);
};
const section = (name) => console.log(`\n== ${name}`);

function main(file, selector) {
  setPage(file);
  const html = git(['show', `${BRANCH}:${file}`], { encoding: 'utf8' });
  const start = html.indexOf('<main id="main-content"');
  const end = html.indexOf('</main>');
  if (start < 0 || end < 0) fail('no <main id="main-content">');
  const tree = parse(html.slice(start, end + 7).replace(/<br\b[^>]*>/g, ' '));
  const found = selector(tree);
  if (!found.length) fail('expected sections were not found');
  return found;
}

// A section's visible text, one line per block element, in order.
function lines(node, out = []) {
  const kids = elements(node);
  const blockTags = new Set(['p', 'h1', 'h2', 'h3', 'li', 'span', 'div', 'a', 'strong', 'em', 'dt', 'dd']);
  const leaf = kids.length === 0 || kids.every((k) => ['strong', 'em', 'a', 'br', 'span'].includes(k.tag) && !hasClass(k, 'sh-text'));
  if (leaf) { const t = plain(node); if (t) out.push(t); return out; }
  for (const k of kids) if (blockTags.has(k.tag) || k.children) lines(k, out);
  return out;
}

try {
  console.log(`About, from ${BRANCH}: about.html`);
  const aboutSections = main('about.html', (t) => all(t, (n) => n.tag === 'section'));
  for (const s of aboutSections) {
    section(`<section class="${(s.attrs.class ?? '').trim()}">`);
    for (const l of lines(s)) show(l);
  }
  console.log(`\nAbout, from ${BRANCH}: index.html, the About section`);
  const home = main('index.html', (t) => all(t, (n) => n.tag === 'section' && n.attrs.id === 'about'));
  for (const s of home) {
    for (const l of lines(s)) show(l);
    for (const a of all(s, (n) => n.tag === 'a')) console.log(`    link: ${plain(a)} -> ${a.attrs.href}`);
    for (const i of all(s, (n) => n.tag === 'img')) console.log(`    image: ${i.attrs.src} alt="${i.attrs.alt}" ${i.attrs.width}x${i.attrs.height}`);
  }
  console.log(`\nAbout, from ${BRANCH}: index.html, the contact section (Let's Talk; the chat is built separately, on Home only)`);
  for (const s of main('index.html', (t) => all(t, (n) => n.tag === 'section' && n.attrs.id === 'contact'))) {
    for (const l of lines(s)) show(l);
    for (const a of all(s, (n) => n.tag === 'a')) console.log(`    link: ${plain(a)} -> ${a.attrs.href}`);
  }
} catch (error) {
  if (error instanceof ImportError) { console.error(`import-about failed: ${error.message}`); process.exit(1); }
  throw error;
}
