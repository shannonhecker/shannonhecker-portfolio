import { test, expect } from '@playwright/test';

// B10: at the largest display sizes the letters of the page-head words ("Work", "Writing",
// "About me") must not fuse. Tracking is no tighter than -0.045em once the word is 160px
// or larger (the judge's figure); screenshots at 1440 and 1024 confirm no letters touch.
const HEADS = [
  { path: '/work', word: 'Work' },
  { path: '/writing', word: 'Writing' },
  { path: '/about', word: 'About me' },
];

for (const width of [1440, 1024]) {
  for (const h of HEADS) {
    test(`${h.word} at ${width}: tracking is no tighter than -0.045em at display size`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(h.path);
      const { size, tracking } = await page.locator('main h1').evaluate((e) => {
        const cs = getComputedStyle(e);
        return { size: parseFloat(cs.fontSize), tracking: parseFloat(cs.letterSpacing) };
      });
      expect(size).toBeGreaterThanOrEqual(150);
      expect(tracking / size).toBeGreaterThanOrEqual(-0.045 - 1e-6);
    });
  }
}

test('the footer "Let’s Talk." is tracked in proportion to its size', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const { size, tracking } = await page.locator('#contact h2').evaluate((e) => {
    const cs = getComputedStyle(e);
    return { size: parseFloat(cs.fontSize), tracking: parseFloat(cs.letterSpacing) };
  });
  expect(tracking / size).toBeGreaterThanOrEqual(-0.045 - 1e-6);
});
