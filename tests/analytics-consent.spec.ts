import { test, expect, type Page } from '@playwright/test';

const HOSTS = /googletagmanager\.com|google-analytics\.com|clarity\.ms/;
const watch = (page: Page) => {
  const seen: string[] = [];
  page.on('request', r => { if (HOSTS.test(r.url())) seen.push(r.url()); });
  return seen;
};
const mock = (page: Page) => page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms/, route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

test('nothing before a choice', async ({ page }) => {
  const seen = watch(page);
  await page.goto('/?analytics-test=1');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#analytics-choice')).toBeVisible();
  expect(seen).toEqual([]);
});

test('no means no', async ({ page }) => {
  const seen = watch(page);
  const errors: Error[] = [];
  page.on('pageerror', e => errors.push(e));
  await page.goto('/?analytics-test=1');
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  for (const path of ['/fx', '/work']) {
    await page.goto(`${path}?analytics-test=1`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#analytics-choice')).toBeHidden();
  }
  await page.goto('/?analytics-test=1');
  await page.waitForLoadState('networkidle');
  await page.locator('#game-play').click();
  await expect(page.locator('.play')).toHaveClass(/is-full/);
  // The chat form check belongs to Task 10; the chat widget does not exist yet.
  expect(seen).toEqual([]);
  expect(errors).toEqual([]);
});

test('yes loads both', async ({ page }) => {
  await mock(page);
  const seen = watch(page);
  await page.goto('/?analytics-test=1');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => seen.some(u => u.includes('googletagmanager.com/gtag/js?id=G-795LXWTYWM'))).toBe(true);
  await expect.poll(() => seen.some(u => u.includes('clarity.ms/tag/w42m2jben0'))).toBe(true);
});

test('changing to no after yes stops Clarity', async ({ page }) => {
  await mock(page);
  const seen = watch(page);
  await page.goto('/privacy?analytics-test=1');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as any).clarity)).toBe('function');
  await page.evaluate(() => {
    document.cookie = '_clck=a; Path=/'; document.cookie = '_clsk=b; Path=/'; document.cookie = '_ga=c; Path=/';
    (window as any).__marker = 1;
    const q = (window as any).clarity.q;
    (window as any).__calls = () => q.map((a: ArrayLike<unknown>) => JSON.stringify(Array.from(a)));
    (window as any).__keep = () => { sessionStorage.setItem('calls', JSON.stringify(q.map((a: ArrayLike<unknown>) => Array.from(a)))); };
    window.addEventListener('pagehide', () => (window as any).__keep());
  });
  const before = seen.length;
  await page.locator('[data-analytics-settings]').first().click();
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__marker).catch(() => undefined)).toBeUndefined();
  const calls = JSON.parse(await page.evaluate(() => sessionStorage.getItem('calls') || '[]').then(String)) as unknown[][];
  expect(calls.some(a => a[0] === 'consent' && a[1] === false)).toBe(true);
  expect(calls.some(a => a[0] === 'consentv2' && JSON.stringify(a[1]) === JSON.stringify({ ad_Storage: 'denied', analytics_Storage: 'denied' }))).toBe(true);
  await page.waitForLoadState('networkidle');
  expect(seen.slice(before)).toEqual([]);
  expect(await page.evaluate(() => typeof (window as any).clarity)).toBe('undefined');
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/_clck|_clsk|_ga/);
  await expect(page.locator('#analytics-status')).toHaveText('Analytics off. Your choice is saved.');
});

test('privacy page names both', async ({ page }) => {
  await page.goto('/privacy');
  const text = await page.locator('main, body').first().innerText();
  expect(text).toContain('Google Analytics');
  expect(text).toContain('Microsoft Clarity');
});

test('the flag is ignored off localhost', async ({ page, request }) => {
  const host = 'https://flag-check.example';
  await page.route(`${host}/**`, async route => {
    const url = new URL(route.request().url());
    await route.fulfill({ response: await request.get(`http://localhost:4329${url.pathname}${url.search}`) });
  });
  await mock(page);
  const seen = watch(page);
  await page.goto(`${host}/?analytics-test=1`);
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#analytics-status')).toContainText('Analytics allowed');
  expect(seen).toEqual([]);
});

test('yes tells Clarity with the v2 consent call', async ({ page }) => {
  await mock(page);
  await page.goto('/?analytics-test=1');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  const q = await page.evaluate(() => ((window as any).clarity.q || []).map((a: ArrayLike<unknown>) => Array.from(a)));
  expect(q[0]).toEqual(['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]);
});

test('an expired yes loads nothing and shows the banner', async ({ page }) => {
  const seen = watch(page);
  await page.addInitScript(() => localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'yes', at: Date.now() - 200 * 86400000 })));
  await page.goto('/?analytics-test=1');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#analytics-choice')).toBeVisible();
  expect(seen).toEqual([]);
});

test('a no made in another tab stops this page', async ({ context }) => {
  await context.route(HOSTS, route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const seen: string[] = [];
  context.on('request', r => { if (HOSTS.test(r.url())) seen.push(r.url()); });
  const one = await context.newPage();
  await one.goto('/?analytics-test=1');
  await one.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => one.evaluate(() => typeof (window as any).clarity)).toBe('function');
  await one.evaluate(() => { (window as any).__marker = 1; });
  const two = await context.newPage();
  await two.goto('/privacy');
  await two.evaluate(() => localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })));
  await expect.poll(() => one.evaluate(() => (window as any).__marker).catch(() => undefined)).toBeUndefined();
  await one.waitForLoadState('networkidle');
  const before = seen.length;
  await one.reload();
  await one.waitForLoadState('networkidle');
  expect(seen.length).toBe(before);
  expect(await one.evaluate(() => typeof (window as any).clarity)).toBe('undefined');
});

test('the scoreboard and the chat are masked for Clarity', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ask[data-clarity-mask="true"]')).toHaveCount(1);
  const lists = page.locator('ol[aria-label="Top ten scores"]');
  expect(await lists.count()).toBeGreaterThan(0);
  expect(await lists.evaluateAll(els => els.every(e => e.getAttribute('data-clarity-mask') === 'true'))).toBe(true);
  const forms = page.locator('form:has(input[name="nickname"])');
  expect(await forms.count()).toBeGreaterThan(0);
  expect(await forms.evaluateAll(els => els.every(e => e.getAttribute('data-clarity-mask') === 'true'))).toBe(true);
});
