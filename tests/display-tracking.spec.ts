import { test, expect } from '@playwright/test';

// B10: at the largest display sizes the letters of the page-head words ("Work", "Writing",
// "About me") must not fuse. The three heads share one tracking token, --track-head. -0.06em
// fused r-i-t-i-n, and the judge's -0.045em still touched at 216px (checked in screenshots at
// 1440 and 1024), so the token is -0.03em. The test pins that value, so a tighter setting fails.
const HEADS = [
  { path: '/work', word: 'Work' },
  { path: '/writing', word: 'Writing' },
  { path: '/about', word: 'About me' },
];
const TRACK = -0.03;
const TOLERANCE = 0.002;

test('the shared token is -0.03em', async ({ page }) => {
  await page.goto('/work');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--track-head').trim())).toBe('-.03em');
});

for (const width of [1440, 1024, 390]) {
  for (const h of HEADS) {
    test(`${h.word} at ${width}: tracking is the token's -0.03em`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(h.path);
      const { size, tracking } = await page.locator('main h1').evaluate((e) => {
        const cs = getComputedStyle(e);
        return { size: parseFloat(cs.fontSize), tracking: parseFloat(cs.letterSpacing) };
      });
      if (width >= 1024) expect(size).toBeGreaterThanOrEqual(150);
      expect(Math.abs(tracking / size - TRACK)).toBeLessThanOrEqual(TOLERANCE);
    });
  }
}

test('the footer "Let\u2019s Talk." keeps its own -0.03em (the serif)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const { size, tracking } = await page.locator('#contact h2').evaluate((e) => {
    const cs = getComputedStyle(e);
    return { size: parseFloat(cs.fontSize), tracking: parseFloat(cs.letterSpacing) };
  });
  expect(Math.abs(tracking / size + 0.03)).toBeLessThanOrEqual(TOLERANCE);
});
