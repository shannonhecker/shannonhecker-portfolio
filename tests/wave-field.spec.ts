import { test, expect, type Page } from '@playwright/test';

// The wave field is decorative: a canvas of fine lines behind the home hero, the head of
// About and Work, and low behind the Ask Shannon section.
const pages: { route: string; fields: number }[] = [
  { route: '/', fields: 2 }, // the hero and the ask section
  { route: '/about', fields: 1 },
  { route: '/work', fields: 1 },
];

async function ready(page: Page, count: number) {
  await expect(page.locator('.wave-field__canvas.is-ready')).toHaveCount(count);
}
const frames = (page: Page) => page.$$eval('.wave-field__canvas', (cs) => (cs as HTMLCanvasElement[]).map((c) => c.toDataURL()));

for (const theme of ['dark', 'light']) {
  for (const { route, fields } of pages) {
    test(`wave field on ${route} is decorative and drawn (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('portfolio-theme', t), theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      await ready(page, fields);
      const info = await page.$$eval('.wave-field', (fs) =>
        fs.map((f) => {
          const c = f.querySelector('canvas') as HTMLCanvasElement;
          const ctx = c.getContext('2d')!;
          const px = ctx.getImageData(0, 0, c.width, c.height).data;
          let inked = 0;
          for (let i = 3; i < px.length; i += 4) if (px[i] > 0) inked++;
          return {
            hidden: f.getAttribute('aria-hidden'),
            fieldEvents: getComputedStyle(f).pointerEvents,
            canvasEvents: getComputedStyle(c).pointerEvents,
            focusable: c.tabIndex >= 0 || f.querySelector('a,button,input,[tabindex]') !== null,
            inked,
            behind: getComputedStyle(f).zIndex,
          };
        }),
      );
      expect(info).toHaveLength(fields);
      for (const f of info) {
        expect(f.hidden).toBe('true');
        expect(f.fieldEvents).toBe('none');
        expect(f.canvasEvents).toBe('none');
        expect(f.focusable).toBe(false);
        expect(f.inked).toBeGreaterThan(500);
        expect(f.behind).toBe('0');
      }
    });
  }
}

for (const { route, fields } of pages) {
  test(`wave field on ${route} holds still under reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await ready(page, fields);
    const a = await frames(page);
    await page.waitForTimeout(500);
    const b = await frames(page);
    expect(b).toEqual(a);
  });
}

test('wave field moves when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about');
  await ready(page, 1);
  const a = await frames(page);
  await page.waitForTimeout(600);
  const b = await frames(page);
  expect(b[0]).not.toEqual(a[0]);
});

test('wave field does not cover or block the content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await ready(page, 2);
  // A tap at the middle of the headline lands on the headline, not on the field.
  const hit = await page.evaluate(() => {
    const h = document.querySelector('.hero h1')!.getBoundingClientRect();
    return document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2)?.closest('.wave-field') !== null;
  });
  expect(hit).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
