import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { EARLIER_SLUGS } from '../src/lib/earlier';

const HOST = 'https://shannonhecker.com';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function open(page: Page, path: string, theme: 'dark' | 'light' = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
  const res = await page.goto(path);
  expect(res!.status(), `GET ${path}`).toBe(200);
  return res!;
}
// Lazy images only load near the viewport; load them all before measuring.
async function loadImages(page: Page) {
  await page.evaluate(() => Promise.all([...document.images].map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
}

test('the ten earlier projects are listed in the agreed order', () => {
  expect([...EARLIER_SLUGS]).toEqual([
    'stock-dashboard', 'tripup', 'design-system', 'data-solution', 'ui-toolkit',
    'corporate-action', 'complex-assets', 'research', 'algo-center', 'dps-brand',
  ]);
});

for (const slug of EARLIER_SLUGS) {
  test.describe(`/work/${slug}`, () => {
    const path = `/work/${slug}`;

    test('is a real page with one heading and images that load', async ({ page }) => {
      const res = await open(page, path);
      expect(res.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 2, name: 'Outcomes', exact: true })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Outcomes' }).locator('li').first()).toBeVisible();
      await loadImages(page);
      // The small cover beside "Next project" is decorative (aria-hidden, empty alt) and not counted here.
      const images = await page.evaluate(() => [...document.images].filter((img) => !img.closest('[aria-hidden="true"]')).map((img) => ({
        src: img.currentSrc || img.src, alt: img.alt.trim(), width: img.naturalWidth,
        fit: getComputedStyle(img).objectFit,
      })));
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.alt, `alt on ${img.src}`).not.toBe('');
        expect(img.width, `naturalWidth of ${img.src}`).toBeGreaterThan(0);
        expect(img.fit, `object-fit on ${img.src}`).not.toBe('cover');
      }
    });

    for (const width of [390, 1440]) {
      test(`shows every image whole and does not scroll sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        await loadImages(page);
        const shapes = await page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>('main img')]
          .filter((img) => img.getClientRects().length > 0)
          .map((img) => ({ src: img.src, natural: img.naturalWidth / img.naturalHeight, shown: img.clientWidth / img.clientHeight })));
        for (const s of shapes) expect(Math.abs(s.shown / s.natural - 1), `proportions of ${s.src}`).toBeLessThan(0.01);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });
    }

    for (const theme of ['dark', 'light'] as const) {
      test(`axe: no serious or critical violations in ${theme}`, async ({ page }) => {
        await open(page, path, theme);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await loadImages(page);
        const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      });
    }

    test('is canonical on the public host and listed in the sitemap', async ({ page, request }) => {
      await open(page, path);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`${HOST}${path}`);
      expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(`${HOST}${path}`);
      expect(await (await request.get('/sitemap.xml')).text()).toContain(`<loc>${HOST}${path}</loc>`);
    });
  });
}

test.describe('figures stay as written', () => {
  const figures: Record<string, string[]> = {
    'corporate-action': ['40%', '60%'],
    'complex-assets': ['3x', '95%'],
    research: ['4x', '+35%'],
    'algo-center': ['60%'],
    'design-system': ['16+', '100%'],
    'data-solution': ['40+'],
    'ui-toolkit': ['30+'],
    tripup: ['15+'],
    'stock-dashboard': ['6+'],
  };
  for (const [slug, values] of Object.entries(figures)) {
    test(`/work/${slug}`, async ({ page }) => {
      await open(page, `/work/${slug}`);
      const text = await page.locator('main').innerText();
      for (const value of values) expect(text, `${value} on ${slug}`).toContain(value);
    });
  }
});

test('the stock dashboard page names no bank and no desk', async ({ page }) => {
  await open(page, '/work/stock-dashboard');
  await expect(page.locator('h1')).toHaveText('Stock dashboard design task');
  const html = (await page.content()).toLowerCase();
  const parts = await page.evaluate(() => ({
    text: document.body.innerText,
    srcs: [...document.images].flatMap((img) => [img.getAttribute('src') ?? '', img.getAttribute('srcset') ?? '', img.currentSrc]),
    alts: [...document.images].map((img) => img.alt),
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
  }));
  const everything = [parts.text, ...parts.srcs, ...parts.alts, parts.title, parts.description, ...parts.ld].join('\n').toLowerCase();
  for (const word of ['barclays', 'front office']) {
    expect(everything, `"${word}" in visible parts`).not.toContain(word);
    expect(html, `"${word}" anywhere in the document`).not.toContain(word);
  }
});

test('tripup describes itself to search engines', async ({ page }) => {
  await open(page, '/work/tripup');
  const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? '{}')));
  const types = blocks.map((b) => b['@type']);
  expect(types).toContain('CreativeWork');
  expect(types).toContain('BreadcrumbList');
  const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
  const last = crumbs.itemListElement[crumbs.itemListElement.length - 1];
  expect(last.item).toBe(`${HOST}/work/tripup`);
  const work = blocks.find((b) => b['@type'] === 'CreativeWork');
  expect(work.url).toBe(`${HOST}/work/tripup`);
});

test('each page ends with a link to the next project', async ({ page }) => {
  await open(page, '/work/tripup');
  await expect(page.locator('.earlier-next a')).toHaveAttribute('href', '/work/design-system');
  await open(page, '/work/dps-brand');
  await expect(page.locator('.earlier-next a')).toHaveAttribute('href', '/work/stock-dashboard');
});
