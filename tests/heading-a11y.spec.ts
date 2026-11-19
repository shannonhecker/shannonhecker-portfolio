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
    if (path === '/') expect(n).toBeGreaterThan(0); // the hero h1
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

test('/writing: the collection h1 is followed by three linked essay h2s', async ({ page }) => {
  await page.goto('/writing');
  const levels = await page.locator('main :is(h1,h2,h3)').evaluateAll(heads => heads.map(h => h.tagName));
  expect(levels).toEqual(['H1', 'H2', 'H2', 'H2']);
  await expect(page.locator('.writing-list a h2')).toHaveCount(3);
});
