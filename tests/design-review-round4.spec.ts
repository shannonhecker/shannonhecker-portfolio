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
      return { head: top('.earlier-head'), cover: top('.earlier-cover'), results: top('.earlier-results'), next: top('.earlier-next') };
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
    await expect(page.locator('.earlier-facts dt')).toHaveText(['Year', 'Role']);
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

test.describe('Work: the earlier list', () => {
  test('hovering a row shows its cover (18vw, between 200 and 280px) without moving anything, and nothing loads before that', async ({ page }) => {
    await open(page, '/work', 1440, 'dark', false);
    const row = page.locator('.earlier-list li').nth(2);
    const img = row.locator('.row-preview img');
    // Not displayed, so a lazy image is never requested.
    expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(false);
    const before = await page.locator('.earlier-list').evaluate((e) => e.getBoundingClientRect().height);
    await row.locator('a').scrollIntoViewIfNeeded();
    await row.locator('a').hover();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect.poll(() => row.locator('.row-preview').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    const m = await row.locator('.row-preview').evaluate((e) => ({ w: e.getBoundingClientRect().width, alt: e.querySelector('img')!.getAttribute('alt'), pos: getComputedStyle(e).position }));
    expect(Math.round(m.w)).toBe(Math.round(Math.min(280, Math.max(200, 0.18 * 1440))));
    expect(m.alt).toBe('');
    expect(m.pos).toBe('absolute');
    expect(await page.locator('.earlier-list').evaluate((e) => e.getBoundingClientRect().height)).toBe(before);
    expect(await row.locator('a').evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('keyboard focus shows the preview too, with a 3px ring', async ({ page }) => {
    await open(page, '/work', 1440);
    const a = page.locator('.earlier-list a').first();
    await a.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(a).toBeFocused();
    expect(await a.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('3px');
    await expect(page.locator('.earlier-list li').first().locator('.row-preview')).toBeVisible();
  });

  test('under 1100px there is no preview', async ({ page }) => {
    await open(page, '/work', 1000);
    await page.locator('.earlier-list a').first().hover();
    await expect(page.locator('.earlier-list .row-preview').first()).toBeHidden();
  });

  test('the page title, archive heading and earlier project titles have a clear hierarchy', async ({ page }) => {
    await open(page, '/work', 1440);
    const t = await page.evaluate(() => {
      const s = (sel: string) => { const c = getComputedStyle(document.querySelector(sel)!); return { size: c.fontSize, weight: c.fontWeight, ls: c.letterSpacing, family: c.fontFamily }; };
      return { selected: s('main h1'), earlier: s('.work-earlier-head h2'), row: s('.earlier-list h3') };
    });
    expect(parseFloat(t.selected.size)).toBeGreaterThan(parseFloat(t.earlier.size));
    expect(parseFloat(t.earlier.size)).toBeGreaterThan(parseFloat(t.row.size));
    expect(t.row.weight).toBe('500');
    expect(parseFloat(t.row.ls) / parseFloat(t.row.size)).toBeCloseTo(-0.025, 3);
  });
});

test.describe('Writing', () => {
  test('the index head carries the wave field, first in the section', async ({ page }) => {
    await open(page, '/writing', 1440);
    const head = page.locator('.writing-head');
    await expect(head).toHaveClass(/has-wave-field/);
    expect(await head.evaluate((e) => e.firstElementChild!.classList.contains('wave-field'))).toBe(true);
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

  test('on a wide screen the section labels stay under the nav while their text scrolls', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 1440);
    const h2 = page.locator('.essay-sec > h2').nth(1);
    expect(await h2.evaluate((e) => getComputedStyle(e).position)).toBe('sticky');
    const box = (await h2.boundingBox())!;
    await page.evaluate((y) => scrollTo(0, y), box.y + 150);
    const now = (await h2.boundingBox())!;
    expect(now.y).toBeGreaterThanOrEqual(90);
    expect(now.y).toBeLessThan(220);
  });

  test('on a phone the labels sit inline and do not stick', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 390);
    expect(await page.locator('.essay-sec > h2').first().evaluate((e) => getComputedStyle(e).position)).toBe('static');
  });
});

test.describe('About', () => {
  test('the figures sit under the opening, and the small line is right-aligned', async ({ page }) => {
    await open(page, '/about', 1440);
    const m = await page.evaluate(() => ({
      who: document.querySelector('.about-who')!.getBoundingClientRect().left,
      facts: document.querySelector('.about-facts')!.getBoundingClientRect().left,
      align: getComputedStyle(document.querySelector('.about-meta')!).textAlign,
    }));
    expect(Math.abs(m.facts - m.who)).toBeLessThanOrEqual(1);
    expect(m.align).toBe('right');
  });
});
