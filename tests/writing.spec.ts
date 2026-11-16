import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOST = 'https://shannonhecker.com';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Newest first, as the index lists them.
const ARTICLES = [
  { slug: 'when-everyone-can-ship', title: 'When everyone can ship', date: '2026-05-02', read: '7 minute read', words: '1,500 words' },
  { slug: 'the-design-system-is-the-contract', title: 'The design system is the contract', date: '2026-04-20', read: '8 minute read', words: '1,200 words' },
  { slug: 'trust-surfaces-in-ai', title: 'Trust surfaces in AI for expert users', date: '2026-04-18', read: '7 minute read', words: '1,400 words' },
] as const;

async function open(page: Page, path: string, theme: 'dark' | 'light' = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
  const res = await page.goto(path);
  expect(res!.status(), `GET ${path}`).toBe(200);
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
      await expect(links.nth(i).getByRole('heading', { level: 2 })).toHaveText(`${a.title}.`);
      await expect(links.nth(i)).toContainText(a.date);
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
      await expect(time).toHaveText(a.date);
      const head = await page.locator('main header').first().innerText();
      expect(head).toContain(a.read);
      expect(head).toContain(a.words);
      expect(head).toContain('Shannon Hecker');
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

    test('body paragraphs stay within a 75ch measure', async ({ page }) => {
      for (const width of [1440, 1024, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        const widest = await page.evaluate(() => {
          const ps = [...document.querySelectorAll<HTMLElement>('.essay-body p')];
          const c = document.createElement('canvas').getContext('2d')!;
          let worst = 0;
          for (const p of ps) {
            const cs = getComputedStyle(p);
            c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            const zero = c.measureText('0').width;
            const inner = p.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            worst = Math.max(worst, inner / zero);
          }
          return { worst, count: ps.length };
        });
        expect(widest.count, 'paragraphs').toBeGreaterThan(5);
        expect(widest.worst, `measure at ${width}`).toBeLessThanOrEqual(75);
      }
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
      await expect(end).toContainText('Shannon Hecker is a design engineer in London.');
    });
  });
}

test('the three articles are in the sitemap and /writing is picked up by the glob', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const a of ARTICLES) expect(xml).toContain(`<loc>${HOST}/writing/${a.slug}</loc>`);
  expect(xml).toContain(`<loc>${HOST}/writing</loc>`);
});
