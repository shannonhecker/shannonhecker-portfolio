import { test, expect, type Page } from '@playwright/test';
import { CASES } from '../src/lib/cases';
import { EARLIER_SLUGS } from '../src/lib/earlier';

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const res = await page.goto(path);
  expect(res!.status(), `GET ${path}`).toBe(200);
}
const navWork = (page: Page) => page.locator('.nav a.l', { hasText: /^Work$/ });

test.describe('/work', () => {
  test('has one h1 "Work" and the page title', async ({ page }) => {
    await open(page, '/work');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Work', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('Work · Shannon Hecker');
  });

  test('Selected lists the five cases in CASES order', async ({ page }) => {
    await open(page, '/work');
    await expect(page.getByRole('heading', { level: 2, name: 'Selected', exact: true })).toBeVisible();
    const links = page.getByRole('region', { name: 'Selected' }).getByRole('link');
    await expect(links).toHaveCount(5);
    expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(CASES.map((c) => c.href));
  });

  test('Earlier work lists the ten projects in EARLIER_SLUGS order', async ({ page }) => {
    await open(page, '/work');
    await expect(page.getByRole('heading', { level: 2, name: 'Earlier work', exact: true })).toBeVisible();
    const links = page.getByRole('region', { name: 'Earlier work' }).getByRole('link');
    await expect(links).toHaveCount(10);
    expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(EARLIER_SLUGS.map((s) => `/work/${s}`));
  });

  test('every listed link resolves 200', async ({ page, request }) => {
    await open(page, '/work');
    const hrefs = await page.locator('main a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThanOrEqual(15);
    for (const href of new Set(hrefs)) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });

  test('nav Work is the current page', async ({ page }) => {
    await open(page, '/work');
    await expect(navWork(page)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.nav a.l[aria-current]')).toHaveCount(1);
  });

  for (const width of [390, 1440]) for (const theme of ['dark', 'light']) {
    test(`every Selected artwork image loads at ${width} in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
      await open(page, '/work');
      const imgs = page.locator('#work .row img');
      await expect(imgs).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        await imgs.nth(i).scrollIntoViewIfNeeded();
        await expect.poll(() => imgs.nth(i).evaluate((el) => (el as HTMLImageElement).naturalWidth), { message: `artwork ${i + 1}` }).toBeGreaterThan(0);
        const box = await imgs.nth(i).boundingBox();
        expect(box!.height, `artwork ${i + 1} is visible`).toBeGreaterThan(100);
      }
    });
  }

  test('Selected has no empty cell: rows fill the grid at 1440, 1024 and 768', async ({ page }) => {
    for (const width of [1440, 1024, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await open(page, '/work');
      const tops = await page.locator('#work .index > .row').evaluateAll((rs) => rs.map((r) => { const b = r.getBoundingClientRect(); return [Math.round(b.top + scrollY), Math.round(b.left), Math.round(b.right)]; }));
      const rows = new Map<number, number[][]>();
      for (const t of tops) { const k = [...rows.keys()].find((y) => Math.abs(y - t[0]) < 4) ?? t[0]; rows.set(k, [...(rows.get(k) ?? []), t]); }
      for (const [, items] of rows) {
        const left = Math.min(...items.map((i) => i[1])), right = Math.max(...items.map((i) => i[2]));
        const filled = items.reduce((a, i) => a + (i[2] - i[1]), 0);
        expect(filled / (right - left), `row fill at ${width}`).toBeGreaterThan(0.85);
      }
    }
  });

  test('is in the sitemap', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('<loc>https://shannonhecker.com/work</loc>');
    for (const s of EARLIER_SLUGS) expect(xml).toContain(`<loc>https://shannonhecker.com/work/${s}</loc>`);
  });

  test('no horizontal scroll at phone and desktop widths', async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await open(page, '/work');
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `overflow at ${width}`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('home', () => {
  test('keeps five case rows, with More work directly after the fifth', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('#work .index .row')).toHaveCount(5);
    const more = page.locator('#work').getByRole('link', { name: 'More work', exact: true });
    await expect(more).toHaveCount(1);
    await expect(more).toHaveAttribute('href', '/work');
    const directlyAfter = await page.evaluate(() => {
      const index = document.querySelector('#work .index')!;
      const next = index.nextElementSibling;
      return !!next && next.matches('a, :has(> a)') && next.textContent?.trim() === 'More work';
    });
    expect(directlyAfter).toBe(true);
  });
});

test.describe('nav current state on work pages', () => {
  const ancestors = ['/work/tripup', ...CASES.map((c) => c.href)];
  for (const path of ancestors) {
    test(`${path} marks Work as an ancestor`, async ({ page }) => {
      await open(page, path);
      await expect(navWork(page)).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('.nav a.l[aria-current="page"]')).toHaveCount(0);
    });
  }
  test('the home page marks nothing current', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('.nav a.l[aria-current]')).toHaveCount(0);
  });
});

test.describe('links back to /work resolve', () => {
  test('earlier projects return to the archive and keep Work as their breadcrumb', async ({ page, request }) => {
    for (const slug of EARLIER_SLUGS) {
      await open(page, `/work/${slug}`);
      await expect(page.locator('.earlier-eyebrow a').first()).toHaveAttribute('href', '/work#earlier-title');
      const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ld.join('')).toContain('https://shannonhecker.com/work"');
    }
    await page.getByRole('link', {name: 'Earlier work', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Earlier work', exact: true})).toBeInViewport();
    expect((await request.get('/work')).status()).toBe(200);
  });

  for (const c of CASES) {
    test(`${c.href} "All projects" resolves to /work`, async ({ page, request }) => {
      await open(page, c.href);
      const link = page.locator('a.all-projects');
      await expect(link).toHaveAttribute('href', '/work');
      expect((await request.get('/work')).status()).toBe(200);
    });
  }
});
