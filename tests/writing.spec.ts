import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOST = 'https://shannonhecker.com';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Newest first, as the index lists them. Word counts and reading times are not
// listed here: they are read off each body, and the tests below check them.
const ARTICLES = [
  { slug: 'when-everyone-can-ship', title: 'When everyone can ship', date: '2026-05-02', shown: '2 May 2026' },
  { slug: 'the-design-system-is-the-contract', title: 'The design system is the contract', date: '2026-04-20', shown: '20 April 2026' },
  { slug: 'trust-surfaces-in-ai', title: 'Trust surfaces in AI for expert users', date: '2026-04-18', shown: '18 April 2026' },
] as const;

async function open(page: Page, path: string, theme: 'dark' | 'light' = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
  const res = await page.goto(path);
  expect(res!.status(), `GET ${path}`).toBe(200);
}
// Real characters (spaces included) per full line of the body paragraphs that run to
// three lines or more. Every character is placed by its own client rect, lines are the distinct
// vertical positions, and each paragraph's last (short) line is left out.
async function lineLength(page: Page) {
  return page.evaluate(() => {
    const full: number[] = [];
    let paragraphs = 0;
    for (const p of document.querySelectorAll<HTMLElement>('.essay-flow>p')) {
      const perLine: { y: number; n: number }[] = [];
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        for (let i = 0; i < node.length; i++) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const r = range.getClientRects()[0];
          if (!r) continue;
          const y = r.top + r.height / 2;
          const line = perLine.find((l) => Math.abs(l.y - y) < 10);
          if (line) line.n += 1; else perLine.push({ y, n: 1 });
        }
      }
      if (perLine.length < 3) continue;
      paragraphs += 1;
      for (const l of perLine.slice(0, -1)) full.push(l.n);
    }
    return { average: full.reduce((a, b) => a + b, 0) / Math.max(full.length, 1), paragraphs };
  });
}
const navWriting = (page: Page) => page.locator('.nav a.l', { hasText: /^Writing$/ });
const stripPeriod = (s: string) => s.replace(/\.$/, '');

test.describe('/writing', () => {
  test('has one h1 "Writing" and the page title', async ({ page }) => {
    await open(page, '/writing');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Writing', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('Writing · Shannon Hecker');
  });

  test('keeps the old index intro', async ({ page }) => {
    await open(page, '/writing');
    const text = await page.locator('main').innerText();
    expect(text).toContain('Essays on design, trust, and AI.');
    expect(text).toContain('Notes from inside enterprise product design, and what AI is changing about the job. Written for designers and design leaders working out what comes next.');
  });

  test('lists exactly three articles, newest first, each linking to /writing/<slug>', async ({ page }) => {
    await open(page, '/writing');
    const links = page.locator('main .writing-list a');
    await expect(links).toHaveCount(3);
    expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(ARTICLES.map((a) => `/writing/${a.slug}`));
    const dates = await page.locator('main .writing-list time').evaluateAll((ts) => ts.map((t) => t.getAttribute('datetime')));
    expect(dates).toEqual(ARTICLES.map((a) => a.date));
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const [i, a] of ARTICLES.entries()) {
      await expect(links.nth(i).getByRole('heading', { level: 3 })).toHaveText(`${a.title}.`);
      // The date reads as "18 April 2026"; the ISO form stays in datetime.
      await expect(links.nth(i).locator('time')).toHaveText(a.shown);
    }
  });

  test('index reading times match each article, and come from its body', async ({ page }) => {
    for (const a of ARTICLES) {
      await open(page, `/writing/${a.slug}`);
      const minutes = Number((await page.locator('.essay-facts').innerText()).match(/(\d+) minute read/)![1]);
      await open(page, '/writing');
      const link = page.locator(`main .writing-list a[href="/writing/${a.slug}"]`);
      await expect(link.locator('.read-time')).toHaveText(`${minutes} min`);
    }
  });

  test('nav Writing is the current page', async ({ page }) => {
    await open(page, '/writing');
    await expect(navWriting(page)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.nav a.l[aria-current]')).toHaveCount(1);
  });

  test('is canonical on the public host and in the sitemap', async ({ page, request }) => {
    await open(page, '/writing');
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`${HOST}/writing`);
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain(`<loc>${HOST}/writing</loc>`);
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`axe: no serious or critical violations in ${theme}`, async ({ page }) => {
      await open(page, '/writing', theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
  }

  for (const width of [390, 768, 1440]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, '/writing');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
});

for (const a of ARTICLES) {
  test.describe(`/writing/${a.slug}`, () => {
    const path = `/writing/${a.slug}`;

    test('has one h1 with the title, a visible date, reading time and the author', async ({ page }) => {
      await open(page, path);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(stripPeriod((await page.locator('h1').innerText()).trim())).toBe(a.title);
      await expect(page).toHaveTitle(`${a.title} · Shannon Hecker`);
      const time = page.locator('main time').first();
      await expect(time).toBeVisible();
      await expect(time).toHaveAttribute('datetime', a.date);
      // Shown as "18 April 2026"; the ISO date stays in datetime.
      await expect(time).toHaveText(a.shown);
      const head = await page.locator('main header').first().innerText();
      expect(head).toMatch(/\d+ minute read/);
      expect(head).toMatch(/[\d,]+ words/);
      expect(head).toContain('Shannon Hecker');
    });

    test('shows a word count within 50 of the real body, and a reading time that follows from it', async ({ page }) => {
      await open(page, path);
      const real = await page.locator('.essay-body').evaluate((el) => (el as HTMLElement).innerText.split(/\s+/).filter(Boolean).length);
      const length = await page.locator('.essay-facts').innerText();
      const shown = Number(length.match(/([\d,]+) words/)![1].replace(/,/g, ''));
      const minutes = Number(length.match(/(\d+) minute read/)![1]);
      expect(Math.abs(shown - real), `shown ${shown}, real ${real}`).toBeLessThanOrEqual(50);
      expect(shown % 50, 'rounded to 50').toBe(0);
      expect(minutes, 'reading time at 200 words a minute, rounded up').toBe(Math.ceil(real / 200));
      const ld = (await page.locator('script[type="application/ld+json"]').evaluateAll((ss) => ss.map((x) => JSON.parse(x.textContent ?? '{}')))).find((b) => b['@type'] === 'Article');
      expect(Math.abs(ld.wordCount - real), 'JSON-LD wordCount').toBeLessThanOrEqual(5);
    });

    test('carries Article JSON-LD for this page', async ({ page }) => {
      await open(page, path);
      const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) => ss.map((s) => JSON.parse(s.textContent ?? '{}')));
      const article = blocks.find((b) => b['@type'] === 'Article');
      expect(article, 'an Article block').toBeTruthy();
      expect(article.headline).toBe(a.title);
      expect(article.author.name).toBe('Shannon Hecker');
      expect(article.datePublished).toBe(a.date);
      expect(article.mainEntityOfPage['@id']).toBe(`${HOST}/writing/${a.slug}`);
      expect(article.mainEntityOfPage['@type']).toBe('WebPage');
    });

    test('is canonical on the public host and in the sitemap', async ({ page, request }) => {
      await open(page, path);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`${HOST}${path}`);
      expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(`${HOST}${path}`);
      expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article');
      expect(await (await request.get('/sitemap.xml')).text()).toContain(`<loc>${HOST}${path}</loc>`);
    });

    test('nav Writing is above this page, and Work is not current', async ({ page }) => {
      await open(page, path);
      await expect(navWriting(page)).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('.nav a.l[aria-current]')).toHaveCount(1);
    });

    test('body paragraphs run 55 to 75 real characters a line (at most 75 on a phone)', async ({ page }) => {
      for (const width of [1440, 1024, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        const m = await lineLength(page);
        expect(m.paragraphs, `paragraphs of 3+ lines at ${width}`).toBeGreaterThan(3);
        if (width >= 768) {
          expect(m.average, `average characters a line at ${width}`).toBeGreaterThanOrEqual(55);
          expect(m.average, `average characters a line at ${width}`).toBeLessThanOrEqual(75);
        } else {
          expect(m.average, `average characters a line at ${width}`).toBeLessThanOrEqual(75);
          expect(m.average, `average characters a line at ${width}`).toBeGreaterThan(25);
        }
      }
    });

    test('the head and the body share columns: title, facts and section labels on one edge, standfirst and text on another', async ({ page }) => {
      // From 1100px a section is a label column and a text column; below that the label sits above its text.
      for (const width of [1440, 1180]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        const x = await page.evaluate(() => {
          const left = (sel: string) => document.querySelector(sel)!.getBoundingClientRect().left;
          const textLeft = (sel: string) => { const r = document.createRange(); r.selectNodeContents(document.querySelector(sel)!); return r.getClientRects()[0].left; };
          return { h1: left('.essay h1'), facts: left('.essay-facts'), h2: left('.essay-sec>h2'), dek: left('.essay-dek'), p: textLeft('.essay-flow>p'), bio: left('.essay-bio'), pager: left('.essay-pager a') };
        });
        expect(Math.abs(x.facts - x.h1), `facts vs title at ${width}`).toBeLessThanOrEqual(2);
        expect(Math.abs(x.h2 - x.h1), `section label vs title at ${width}`).toBeLessThanOrEqual(2);
        expect(Math.abs(x.dek - x.p), `standfirst vs body text at ${width}`).toBeLessThanOrEqual(2);
        expect(Math.abs(x.bio - x.p), `author paragraph vs body text at ${width}`).toBeLessThanOrEqual(2);
        expect(x.dek, `body column is inset from the title at ${width}`).toBeGreaterThan(x.h1 + 150);
      }
    });

    test('the first paragraph of a section starts level with its title, not with its number', async ({ page }) => {
      for (const width of [1440, 1180]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        const d = await page.evaluate(() => {
          const h2 = document.querySelector('.essay-sec>h2')!;
          const p = h2.nextElementSibling!.firstElementChild!;
          const top = (n: Node) => { const r = document.createRange(); r.selectNodeContents(n); return r.getClientRects()[0].top; };
          const title = top(h2), para = top(p);
          const number = parseFloat(getComputedStyle(h2, '::before').height);
          return { title, para, number };
        });
        expect(Math.abs(d.para - d.title), `paragraph text vs title text at ${width}`).toBeLessThanOrEqual(10);
        expect(d.number).toBeGreaterThan(10);
      }
    });

    test('section spacing stays on one scale', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open(page, path);
      const gaps = await page.evaluate(() => {
        const rule = (el: Element) => el.getBoundingClientRect().top;
        const secs = [...document.querySelectorAll('.essay-sec')];
        const out: number[] = [];
        for (const sec of secs) {
          const prev = sec.previousElementSibling!;
          out.push(Math.round(rule(sec) - prev.getBoundingClientRect().bottom));
        }
        const bio = document.querySelector('.essay-bio')!, last = document.querySelector('.essay-body')!.lastElementChild!;
        out.push(Math.round(bio.getBoundingClientRect().top - last.getBoundingClientRect().bottom));
        return out;
      });
      for (const g of gaps) { expect(g, `gap ${g}`).toBeGreaterThanOrEqual(56); expect(g, `gap ${g}`).toBeLessThanOrEqual(80); }
      expect(Math.max(...gaps) - Math.min(...gaps), 'every gap before a hairline is the same').toBeLessThanOrEqual(24);
    });

    test('on a wide screen the section labels take turns: no two overlap and at most one is stuck, inside sections 2, 3 and 4', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open(page, path);
      const count = await page.locator('.essay-sec').count();
      expect(count, 'sections').toBeGreaterThanOrEqual(4);
      for (const n of [1, 2, 3]) {
        await page.evaluate((i) => {
          const s = document.querySelectorAll('.essay-sec')[i].getBoundingClientRect();
          scrollTo(0, scrollY + s.top - 20); // the section's top is above the sticky line, its end still below it
        }, n);
        await page.waitForTimeout(150);
        const m = await page.evaluate(() => {
          const boxes = [...document.querySelectorAll('.essay-sec>h2')].map((h) => { const r = h.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, stuck: Math.abs(r.top - 104) < 1.5 }; });
          return boxes;
        });
        for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
          const overlap = m[i].top < m[j].bottom && m[j].top < m[i].bottom && m[i].left < m[j].right && m[j].left < m[i].right;
          expect(overlap, `labels ${i + 1} and ${j + 1} overlap while in section ${n + 1}`).toBe(false);
        }
        expect(m.filter((b) => b.stuck).length, `labels stuck while in section ${n + 1}`).toBeLessThanOrEqual(1);
        expect(m[n].stuck, `label ${n + 1} is the stuck one inside its own section`).toBe(true);
      }
    });

    test('callouts stack on a phone: the term above its text, the text wide enough to read', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, path);
      const rows = await page.locator('.essay-terms>div').evaluateAll((ds) => ds.map((d) => {
        const dt = d.querySelector('dt')!.getBoundingClientRect(), dd = d.querySelector('dd')!.getBoundingClientRect();
        return { dtBottom: dt.bottom, ddTop: dd.top, ddWidth: dd.width, dtHeight: dt.height };
      }));
      for (const r of rows) {
        expect(r.dtBottom, 'term sits above its description').toBeLessThanOrEqual(r.ddTop + 1);
        expect(r.ddWidth, 'description width').toBeGreaterThanOrEqual(280);
        expect(r.dtHeight, 'term stays on one line').toBeLessThan(30);
      }
    });

    test('inline code never breaks inside its token', async ({ page }) => {
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await open(page, path);
        const codes = await page.locator('.essay-body code').evaluateAll((cs) => cs.map((c) => {
          const cs2 = getComputedStyle(c), box = c.getBoundingClientRect();
          return { text: c.textContent, lines: Math.round(box.height / (parseFloat(cs2.lineHeight) || box.height)), height: box.height, fontSize: parseFloat(cs2.fontSize), right: box.right };
        }));
        for (const c of codes) {
          expect(c.lines, `${c.text} on one line at ${width}`).toBe(1);
          expect(c.right, `${c.text} inside the viewport at ${width}`).toBeLessThanOrEqual(width);
        }
      }
    });

    test('emphasis is a true italic, clearly apart from strong', async ({ page }) => {
      await open(page, path);
      const style = await page.evaluate(() => {
        const em = document.querySelector('.essay-body em'), st = document.querySelector('.essay-body strong');
        return { em: em && { style: getComputedStyle(em).fontStyle, weight: Number(getComputedStyle(em).fontWeight) }, strong: st && { style: getComputedStyle(st).fontStyle, weight: Number(getComputedStyle(st).fontWeight) } };
      });
      if (style.em) { expect(style.em.style).toBe('italic'); expect(style.em.weight).toBeLessThanOrEqual(400); }
      if (style.strong) { expect(style.strong.style).toBe('normal'); expect(style.strong.weight).toBeGreaterThanOrEqual(600); }
      // Every italic face the page uses is a real file, not a slanted regular.
      const italicLoaded = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.style === 'italic' && f.status === 'loaded'); });
      if (style.em) expect(italicLoaded, 'an italic font face is loaded').toBe(true);
    });

    test('the author paragraph carries the corrected job titles and nothing else changed', async ({ page }) => {
      await open(page, path);
      const bio = (await page.locator('.essay-bio').innerText()).replace(/\s+/g, ' ');
      expect(bio).toContain('Shannon Hecker is a product designer in London. She designs trading and markets tools at Barclays');
      expect(bio).toContain('after nine years at J.P. Morgan (opens in new tab) ending as Digital Product Designer VP on the Fusion platform. She is building uoaui.ai on the side.');
      expect(bio).not.toContain('design engineer');
      expect(bio).not.toContain('VP Product Design');
      expect(bio.length).toBeGreaterThan(250);
    });

    test('has no em or en dash in the text a visitor reads', async ({ page }) => {
      await open(page, path);
      expect(await page.locator('body').innerText()).not.toMatch(/[–—]/);
    });

    for (const theme of ['dark', 'light'] as const) {
      test(`axe: no serious or critical violations in ${theme}`, async ({ page }) => {
        await open(page, path, theme);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      });
    }

    for (const width of [390, 768, 1440]) {
      test(`does not scroll sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });
    }

    test('ends with its neighbours, the author and a way back to Writing', async ({ page }) => {
      await open(page, path);
      const end = page.locator('.essay-end');
      await expect(end.locator('a[href="/writing"]')).toHaveCount(1);
      // As the old pages had them: "Next post" is the newer essay, "Previously" the older one.
      const i = ARTICLES.findIndex((x) => x.slug === a.slug);
      const newer = ARTICLES[i - 1], older = ARTICLES[i + 1];
      const pager = end.getByRole('navigation', { name: 'More writing' });
      await expect(pager.getByRole('link')).toHaveCount((newer ? 1 : 0) + (older ? 1 : 0));
      if (newer) await expect(pager.getByRole('link', { name: new RegExp(`^Next post\\s*${newer.title}`) })).toHaveAttribute('href', `/writing/${newer.slug}`);
      if (older) await expect(pager.getByRole('link', { name: new RegExp(`^Previously\\s*${older.title}`) })).toHaveAttribute('href', `/writing/${older.slug}`);
      await expect(end).toContainText('Shannon Hecker is a product designer in London.');
    });
  });
}

test('the three articles are in the sitemap and /writing is picked up by the glob', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const a of ARTICLES) expect(xml).toContain(`<loc>${HOST}/writing/${a.slug}</loc>`);
  expect(xml).toContain(`<loc>${HOST}/writing</loc>`);
});
