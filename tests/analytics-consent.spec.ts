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
  await page.goto('/privacy?analytics-test=1');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as any).clarity)).toBe('function');
  await page.evaluate(() => { document.cookie = '_clck=a; Path=/'; document.cookie = '_clsk=b; Path=/'; });
  await page.locator('[data-analytics-settings]').first().click();
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  const called = await page.evaluate(() => ((window as any).clarity.q || []).some((a: ArrayLike<unknown>) => a[0] === 'consent' && a[1] === false));
  expect(called).toBe(true);
  const cookies = await page.evaluate(() => document.cookie);
  expect(cookies).not.toMatch(/_clck|_clsk/);
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
  expect(seen).toEqual([]);
});
