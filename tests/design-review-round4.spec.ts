import { test, expect, type Page } from '@playwright/test';
import { EARLIER_SLUGS } from '../src/lib/earlier';

// Design review, round 4: the inner pages (earlier projects, Work's earlier list, Writing, About)
// brought to the case pages' level: cover above the fold, numbered accent kickers, hover previews.

async function open(page: Page, path: string, width: number, theme: 'dark' | 'light' = 'dark', reduced = true) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })); } catch {} }, theme);
  await page.goto(path);
}

test.describe('earlier projects', () => {
  test('the cover follows the head and the outcomes come after it', async ({ page }) => {
    await open(page, '/work/tripup', 1440);
    const m = await page.evaluate(() => {
      const top = (s: string) => document.querySelector(s)!.getBoundingClientRect().top + scrollY;
      return { head: top('.project-masthead'), cover: top('.earlier-cover'), results: top('.earlier-results'), next: top('.earlier-next') };
    });
    expect(m.head).toBeLessThan(m.cover);
    expect(m.cover).toBeLessThan(m.results);
    expect(m.results).toBeLessThan(m.next);
    expect(m.cover, 'the cover starts in the first screen').toBeLessThan(700);
  });

  test('the cover shows in the first phone screen', async ({ page }) => {
    await open(page, '/work/tripup', 390);
    const top = await page.locator('.earlier-cover').evaluate((e) => e.getBoundingClientRect().top + scrollY);
    expect(top).toBeLessThan(844 - 60);
  });

  test('the white slides sit on a white stage; the dark and full-bleed covers do not', async ({ page }) => {
    for (const [slug, matte] of [['design-system', true], ['algo-center', true], ['stock-dashboard', true], ['tripup', false], ['research', false]] as const) {
      await open(page, `/work/${slug}`, 1440);
      expect(await page.locator('.earlier-cover').evaluate((e) => e.classList.contains('is-matte')), slug).toBe(matte);
    }
  });

  test('every figure links to the full-size file in a new tab', async ({ page }) => {
    for (const slug of EARLIER_SLUGS) {
      await open(page, `/work/${slug}`, 1440);
      const links = page.locator('.earlier-fig-open');
      const count = await links.count();
      expect(count, slug).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        await expect(links.nth(i)).toHaveAttribute('target', '_blank');
        await expect(links.nth(i)).toHaveAttribute('href', /\.webp$/);
        await expect(links.nth(i)).toHaveAccessibleName(/full-size image/i);
      }
    }
  });

  test('on a phone a very wide figure pans inside its frame and can be scrolled from the keyboard', async ({ page }) => {
    await open(page, '/work/tripup', 390);
    await page.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.decode().catch(() => {}); })));
    const pan = page.locator('.earlier-cover .earlier-pan');
    expect(await pan.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
    expect(await pan.getAttribute('tabindex')).toBe('0');
    expect(await pan.getAttribute('aria-label')).toMatch(/scroll sideways/i);
    await pan.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => pan.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('on a wide screen the pan frame is not a tab stop', async ({ page }) => {
    await open(page, '/work/tripup', 1440);
    await expect(page.locator('.earlier-pan[tabindex]')).toHaveCount(0);
  });

  test('facts stay concise and the next project shows its cover', async ({ page }) => {
    await open(page, '/work/tripup', 1440);
    await expect(page.locator('.project-facts dt')).toHaveText(['Project', 'Project type', 'Year', 'Role']);
    const next = page.locator('.earlier-next .row');
    await expect(next.locator('.n')).toHaveCount(0);
    await next.locator('img').evaluate((i: HTMLImageElement) => { i.loading = 'eager'; return i.decode(); });
    const w = await next.locator('.thumb').evaluate((e) => e.getBoundingClientRect().width);
    // The cover fills its label column (the column less one gutter), so it reads as part of the row.
    expect(w).toBeGreaterThanOrEqual(280);
    expect(w).toBeLessThanOrEqual(340);
    expect(await next.evaluate((e) => e.querySelector('.thumb')!.getBoundingClientRect().right <= e.querySelector('h3')!.getBoundingClientRect().left)).toBe(true);
    expect(await next.locator('.meta').evaluate((e) => getComputedStyle(e).textWrap)).toMatch(/pretty/);
    // One rule above the band, not two.
    expect(await page.locator('.earlier-next .index').evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe('0px');
  });
});

test.describe('Work gallery archive', () => {
  for (const width of [390, 820, 1440]) {
    test(`archive artwork is visible before hover and keyboard focus remains clear at ${width}`, async ({ page }) => {
      await open(page, '/work', width);
      const card = page.locator('.archive-card').first();
      await card.scrollIntoViewIfNeeded();
      const image = card.locator('img');
      await image.evaluate((element: HTMLImageElement) => element.decode());
      await expect(image).toBeVisible();
      await expect(image).toHaveCSS('object-fit', 'contain');
      await expect(card.getByRole('heading')).toBeVisible();
      await card.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(card).toBeFocused();
      await expect(card).toHaveCSS('outline-width','3px');
    });
  }
});

test.describe('Writing', () => {
  test('the collection title and deck share a centred reading column', async ({ page }) => {
    await open(page, '/writing', 1440);
    await expect(page.locator('.writing-head > .wave-field')).toHaveCount(1);
    const header = page.locator('.writing-head > .wrap');
    const bounds = (await header.boundingBox())!;
    expect(bounds.x + bounds.width / 2).toBeCloseTo(720);
    expect(bounds.width).toBeLessThanOrEqual(840);
    await expect(header.getByRole('heading', { level: 1 })).toContainText('Essays');
  });

  test('the essay body starts close under the head, and the pager titles end in a full stop', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 1440);
    const gap = await page.evaluate(() => {
      const facts = document.querySelector('.essay-facts')!.getBoundingClientRect().bottom;
      const dek = document.querySelector('.essay-dek')!.getBoundingClientRect().bottom;
      const p = document.querySelector('.essay-flow > p')!.getBoundingClientRect().top;
      return p - Math.max(facts, dek);
    });
    expect(gap).toBeLessThanOrEqual(64);
    for (const t of await page.locator('.essay-pager .t').allInnerTexts()) expect(t.replace(/\s*→\s*$/, '')).toMatch(/\.$/);
  });

  test('on a wide screen the numbered headings scroll with their paragraphs', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 1440);
    const h2 = page.locator('.essay-sec > h2').nth(1);
    expect(await h2.evaluate(el => getComputedStyle(el).position)).toBe('static');
  });

  test('on a phone the labels sit inline and do not stick', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 390);
    expect(await page.locator('.essay-sec > h2').first().evaluate((e) => getComputedStyle(e).position)).toBe('static');
  });
});

test.describe('About', () => {
  test('the figures sit under the opening, and the approach introduction is left-aligned', async ({ page }) => {
    await open(page, '/about', 1440);
    const m = await page.evaluate(() => ({
      who: document.querySelector('.about-who')!.getBoundingClientRect().left,
      facts: document.querySelector('.about-facts')!.getBoundingClientRect().left,
      align: getComputedStyle(document.querySelector('.about-meta')!).textAlign,
    }));
    expect(Math.abs(m.facts - m.who)).toBeLessThanOrEqual(1);
    expect(m.align).toBe('left');
  });
});
