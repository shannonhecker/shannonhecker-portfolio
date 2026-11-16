import { test, expect } from '@playwright/test';

const HOST = 'https://shannonhecker.com';

test('every page is indexable', async ({ page }) => {
  for (const path of ['/', '/fx', '/fusion', '/deal-model', '/winking-star', '/uoaui', '/privacy']) {
    await page.goto(path);
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count()) expect(await robots.getAttribute('content')).not.toMatch(/noindex/);
    const canonical = (await page.locator('link[rel="canonical"]').getAttribute('href')) ?? '';
    expect(canonical.startsWith(HOST), `canonical on ${path}`).toBe(true);
    expect(canonical).toBe(new URL(path, HOST).href);
    expect(((await page.locator('meta[property="og:url"]').getAttribute('content')) ?? '').startsWith(HOST)).toBe(true);
    expect(((await page.locator('meta[property="og:image"]').getAttribute('content')) ?? '').startsWith(HOST)).toBe(true);
  }
});

test('no panel page', async ({ request }) => {
  expect((await request.get('/panel')).status()).toBe(404);
  expect((await request.get('/build')).status()).toBe(404);
});

// astro preview does not apply vercel.json: old project addresses 404 and
// /about.html is served as a plain file, never redirected. Redirect coverage
// lives in `npm run check:redirects`, not in this suite.
test('local preview does not apply legacy redirects', async ({ request }) => {
  expect((await request.get('/project-tripup.html', { maxRedirects: 0 })).status()).toBe(404);
  expect((await request.get('/about.html', { maxRedirects: 0 })).status()).toBe(200);
});

test('hero has no panel line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/I design tools\s*where mistakes\s*cost money\./);
  expect(await page.locator('body').innerText()).not.toContain('Revolut');
});

test.describe('theme choice', () => {
  test('old theme choice is honoured', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('theme', 'light'); } catch {} });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
  test('first visit opens in dark', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
  test('the new key wins over the old one', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('theme', 'light'); localStorage.setItem('portfolio-theme', 'dark'); } catch {} });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test('sitemap lists the home page and not the 404', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain(`<loc>${HOST}/</loc>`);
  expect(xml).toContain(`<loc>${HOST}/fx</loc>`);
  expect(xml).not.toContain('/404');
  expect(xml).not.toContain('/panel');
});

test('robots.txt points at the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Allow: /');
  expect(txt).toContain(`Sitemap: ${HOST}/sitemap.xml`);
});

test('nav carries Work, Writing and About', async ({ page }) => {
  await page.goto('/fx');
  await expect(page.locator('.nav a.brand')).toHaveAttribute('href', '/');
  for (const [label, href] of [['Work', '/work'], ['Writing', '/writing'], ['About', '/about']]) {
    await expect(page.locator('.nav').getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
});

test('winking star page has no private publisher details', async ({ page }) => {
  await page.goto('/winking-star');
  const text = await page.locator('body').innerText();
  expect(text).not.toContain('legal name');
  expect(text).not.toContain('Yu-Hsuan');
  expect(text).not.toContain('App Store publisher');
});

test('game timeline has no family entries', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toContain('I had a baby');
});
