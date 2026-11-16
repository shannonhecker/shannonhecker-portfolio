import { test, expect, type Page } from '@playwright/test';

// One left edge and one right edge on every page type: the nav's logo and the
// page's h1 start together, and the nav's right-hand control ends where the
// main content ends. Measured in CSS pixels, within 1px.
const PAGES = [
  { path: '/', type: 'home' },
  { path: '/fx', type: 'case' },
  { path: '/work', type: 'work index' },
  { path: '/work/tripup', type: 'earlier project' },
  { path: '/writing', type: 'writing index' },
  { path: '/writing/trust-surfaces-in-ai', type: 'essay' },
  { path: '/about', type: 'about' },
  { path: '/privacy', type: 'privacy' },
];
const WIDTHS = [390, 768, 1024, 1440];

async function edges(page: Page) {
  return page.evaluate(() => {
    const box = (el: Element | null) => (el ? el.getBoundingClientRect() : null);
    const logo = document.querySelector('.nav .brand');
    // The brand's visible mark: the full name on wide screens, the logo mark on phones.
    const visible = logo && [...logo.children].find((c) => (c as HTMLElement).getClientRects().length > 0);
    const h1 = document.querySelector('main h1, h1');
    // The nav's right control: the hamburger on phones and tablets, the Contact button above.
    const ctrl = [...document.querySelectorAll('.nav .site-menu-toggle, .nav .nav-actions .cta')].filter((e) => (e as HTMLElement).getClientRects().length > 0).pop() || null;
    // On phones the menu button has no frame, so its visible edge is the icon's last stroke, not its 44px hit area.
    let ctrlRight: number | null = null;
    if (ctrl) {
      const framed = parseFloat(getComputedStyle(ctrl).borderRightWidth) > 0 || ctrl.classList.contains('cta');
      const glyph = ctrl.querySelector('svg path');
      ctrlRight = !framed && glyph ? Math.max(...[...ctrl.querySelectorAll('svg path')].filter((p) => (p as SVGGraphicsElement).getClientRects().length).map((p) => p.getBoundingClientRect().right)) + 0.85 : ctrl.getBoundingClientRect().right;
    }
    const main = document.querySelector('main');
    // The content's right edge: the rightmost hairline-or-text block edge inside main, taken from the
    // widest direct section wrapper (.wrap or the case band's wrap), padding removed.
    const wraps = [...document.querySelectorAll('main.wrap, main .wrap')]
      .filter((e) => (e as HTMLElement).getClientRects().length > 0 && e.getBoundingClientRect().width > 200);
    const content = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight) };
    };
    const cw = wraps.map(content);
    return {
      logoLeft: visible ? box(visible)!.left : null,
      h1Left: h1 ? box(h1)!.left : null,
      ctrlRight,
      contentLeft: cw.length ? Math.min(...cw.map((c) => c.left)) : null,
      contentRight: cw.length ? Math.max(...cw.map((c) => c.right)) : null,
      mainLeft: main ? box(main)!.left : null,
      vw: document.documentElement.clientWidth,
    };
  });
}

test.describe('B4: one gutter, one max width', () => {
  for (const w of WIDTHS) {
    for (const p of PAGES) {
      test(`${p.type} (${p.path}) at ${w}: nav logo, h1 and content share one left edge`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(p.path);
        const e = await edges(page);
        expect(e.logoLeft, 'logo').not.toBeNull();
        expect(e.h1Left, 'h1').not.toBeNull();
        expect(Math.abs(e.logoLeft! - e.h1Left!), `logo ${e.logoLeft} vs h1 ${e.h1Left}`).toBeLessThanOrEqual(1);
        expect(Math.abs(e.logoLeft! - e.contentLeft!), `logo ${e.logoLeft} vs content ${e.contentLeft}`).toBeLessThanOrEqual(1);
      });
      // The right edge matters where the nav shows a control at the right: phones, and tablets
      // where the menu button sits at the end. At 1440 the Contact button ends the row.
      test(`${p.type} (${p.path}) at ${w}: nav right control ends where content ends`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(p.path);
        const e = await edges(page);
        expect(e.ctrlRight, 'nav control').not.toBeNull();
        // At the max width both edges are centred by the same max, so they still agree.
        expect(Math.abs(e.ctrlRight! - e.contentRight!), `control ${e.ctrlRight} vs content ${e.contentRight}`).toBeLessThanOrEqual(1);
      });
    }
  }
});
