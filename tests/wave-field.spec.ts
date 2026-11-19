import { test, expect, type Page } from '@playwright/test';

// The wave field is decorative: a canvas of fine lines behind the home hero, the head of
// About and Work, and low behind the Ask Shannon section.
const pages: { route: string; fields: number }[] = [
  { route: '/', fields: 2 }, // the hero and the ask section
  { route: '/about', fields: 1 },
  { route: '/work', fields: 1 },
];

// A field draws its first picture when it is first seen, so every field is brought into view once.
async function ready(page: Page, count: number) {
  const canvases = page.locator('.wave-field__canvas');
  for (let i = 0; i < count; i++) {
    await canvases.nth(i).scrollIntoViewIfNeeded();
    await expect(canvases.nth(i)).toHaveClass(/is-ready/);
  }
  await page.evaluate(() => scrollTo(0, 0));
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

test('wave field is one still picture until the visitor does something, then it moves', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about');
  await ready(page, 1);
  await page.waitForTimeout(400); // the slices of the still picture have landed
  const a = await frames(page);
  await page.waitForTimeout(600);
  expect((await frames(page))[0], 'nothing is redrawn while the page is only being looked at').toEqual(a[0]);
  await expect(page.locator('.wave-field')).not.toHaveClass(/is-moving/);
  await page.mouse.move(200, 300);
  await expect(page.locator('.wave-field')).toHaveClass(/is-moving/);
  await page.waitForTimeout(600);
  expect((await frames(page))[0]).not.toEqual(a[0]);
});

test('the homepage hero begins moving without visitor input', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.wave-field[data-variant="hero"]')).toHaveClass(/is-moving/);
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

test('the still picture is whole: its slices cover the canvas, and the glow shows without drifting', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const field = page.locator('.wave-field[data-variant="hero"]');
  await expect(field).toHaveClass(/is-measured/);
  await page.waitForTimeout(500);
  const glow = field.locator('.wave-field__glow');
  expect(Number(await glow.evaluate((g) => getComputedStyle(g).opacity))).toBeGreaterThan(0.2);
  expect(await glow.locator('span').first().evaluate((g) => getComputedStyle(g).animationName)).toBe('none');
  const rows = await field.locator('canvas').evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let inked = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x += 8) if (d[(y * c.width + x) * 4 + 3] > 0) { inked++; break; }
    return inked / c.height;
  });
  expect(rows, 'most rows of the canvas carry a line').toBeGreaterThan(0.5);
});

test('motion starts from the still picture without a jump', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about');
  await ready(page, 1);
  await page.waitForTimeout(400);
  // Count the pixels that change between the still picture and the first moments of motion: a
  // continuous start changes few of them, a jump in phase changes most of the inked ones.
  const before = await page.locator('.wave-field__canvas').evaluate((c: HTMLCanvasElement) => Array.from(c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data.filter((_, i) => i % 4 === 3)));
  await page.keyboard.press('Shift');
  await expect(page.locator('.wave-field')).toHaveClass(/is-moving/);
  const after = await page.locator('.wave-field__canvas').evaluate((c: HTMLCanvasElement) => Array.from(c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data.filter((_, i) => i % 4 === 3)));
  let inked = 0, flipped = 0;
  for (let i = 0; i < before.length; i++) { if (before[i] > 0) { inked++; if (after[i] === 0) flipped++; } }
  expect(flipped / inked, 'most inked pixels are still inked a moment later').toBeLessThan(0.5);
});
