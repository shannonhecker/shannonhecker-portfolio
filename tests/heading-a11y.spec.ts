import { test, expect } from '@playwright/test';

// B11 (a): headings whose words are wrapped in inline-block spans for the entrance motion
// (the home hero h1 and every Split heading) are named by their full sentence, and the
// word spans are hidden from assistive tech, so a screen reader announces one sentence
// rather than one word at a time. B11 (b): essay titles on /writing sit under the "Essays" h2.
const PAGES = ['/', '/fx', '/fusion', '/deal-model', '/winking-star', '/uoaui'];
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

for (const path of PAGES) {
  test(`${path}: split headings have an accessible name equal to their visible text`, async ({ page }) => {
    await page.goto(path);
    const heads = page.locator('h1:has(.hero-word-window), :is(h2,h3).split');
    const n = await heads.count();
    if (path === '/') expect(n).toBeGreaterThan(1); // the hero h1 and the "How I work" heading
    for (let i = 0; i < n; i++) {
      const h = heads.nth(i);
      const visible = norm(await h.evaluate((el) => el.textContent || ''));
      const snapshot = await h.ariaSnapshot();
      const m = snapshot.match(/^- heading "(.*)" \[level=\d\]/);
      expect(m, `${path} heading ${i}: ${snapshot}`).not.toBeNull();
      expect(norm(m![1].replace(/\\"/g, '"'))).toBe(visible);
      // And the word spans are hidden from assistive tech.
      const exposed = await h.locator('.wd:not([aria-hidden="true"]), .hero-word-window:not([aria-hidden="true"])').count();
      expect(exposed, `${path} heading ${i}: spans not hidden`).toBe(0);
    }
  });
}

test('/writing: essay titles are h3 under the Essays h2, at the same visual size', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/writing');
  const titles = page.locator('main .writing-list a .title');
  await expect(titles).toHaveCount(3);
  for (let i = 0; i < 3; i++) await expect(titles.nth(i)).toHaveJSProperty('tagName', 'H3');
  expect(await page.locator('main .writing-list h2').count()).toBe(0);
  // Heading order: h1, then h2 "Essays", then the h3 titles inside it.
  const levels = await page.locator('main h1, main h2, main h3').evaluateAll((hs) => hs.map((h) => h.tagName));
  expect(levels[0]).toBe('H1');
  const firstH3 = levels.indexOf('H3');
  expect(levels.slice(0, firstH3)).toContain('H2');
  // Visual size unchanged: the title keeps the display size set by .writing-list .title.
  const size = await titles.first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(size).toBeGreaterThanOrEqual(48);
});
