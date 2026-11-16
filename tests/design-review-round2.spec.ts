import { test, expect, type Page } from '@playwright/test';
import { EARLIER_SLUGS } from '../src/lib/earlier';

// Design review, round 2: the chat log, the analytics notice, About's grid, the earlier-project
// pages on phones, the Writing index, the phone nav, Privacy and the earlier covers.
// Every number here is measured on the rendered page.
const API = 'https://ask-shannon-api.onrender.com/**';
const SHORT = 'data: {"text":"I lead with the job the user is doing, then narrow from three options."}\n\ndata: [DONE]\n\n';
const LONG = `data: {"text":"${'I prototype early, run quick research loops and pressure test decisions with product and engineering. '.repeat(8)}"}\n\ndata: [DONE]\n\n`;

async function visit(page: Page, path: string, w: number, h: number, opts: { theme?: 'light' | 'dark'; asked?: boolean; reduced?: boolean; reply?: string } = {}) {
  await page.setViewportSize({ width: w, height: h });
  if (opts.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(API, (route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    return route.fulfill({ status: 200, contentType: 'text/event-stream', headers: { 'access-control-allow-origin': '*' }, body: opts.reply ?? SHORT });
  });
  await page.addInitScript(([t, asked]) => {
    try {
      localStorage.setItem('portfolio-theme', t as string);
      if (!asked) localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() }));
    } catch { /* storage blocked */ }
  }, [opts.theme ?? 'dark', !!opts.asked]);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}
type Box = { x: number; y: number; width: number; height: number };
const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())! as Box;
const hits = (a: Box, b: Box) => !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);

test.describe('1: the chat log is exactly as tall as its content, up to the cap', () => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`no void above the greeting after an answer at ${w}`, async ({ page }) => {
      await visit(page, '/', w, h, { reduced: true });
      await page.locator('#ask-input').fill('How do you approach a new design problem?');
      await page.locator('#ask-send').click();
      await expect(page.locator('.ask-msg--ai').last()).toContainText('I lead with');
      const m = await page.locator('#ask-messages').evaluate((log) => {
        const cs = getComputedStyle(log);
        const first = log.firstElementChild!.getBoundingClientRect();
        const last = log.lastElementChild!.getBoundingClientRect();
        const r = log.getBoundingClientRect();
        return { clientH: log.clientHeight, scrollH: log.scrollHeight, padTop: parseFloat(cs.paddingTop), padBottom: parseFloat(cs.paddingBottom), topGap: first.top - r.top, bottomGap: r.bottom - last.bottom, inline: log.getAttribute('style') || '' };
      });
      expect(m.scrollH - m.clientH, 'the log is no taller than its content').toBeLessThanOrEqual(1);
      expect(m.topGap, 'the greeting starts at the log top').toBeLessThanOrEqual(m.padTop + 2);
      expect(m.bottomGap, 'the answer ends at the log foot').toBeLessThanOrEqual(m.padBottom + 2);
      expect(m.inline, 'no fixed height is left behind').not.toContain('height');
    });
  }

  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`it stops at the cap and scrolls with the latest message in view at ${w}`, async ({ page }) => {
      await visit(page, '/', w, h, { reduced: true, reply: LONG });
      const cap = await page.locator('#ask-messages').evaluate((log) => parseFloat(getComputedStyle(log).maxHeight));
      for (const q of ['One', 'Two']) {
        await page.locator('#ask-input').fill(q);
        await page.locator('#ask-send').click();
        await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
      }
      await expect(page.locator('.ask-msg--ai')).toHaveCount(3);
      const m = await page.locator('#ask-messages').evaluate((log) => ({ clientH: log.clientHeight, scrollH: log.scrollHeight, top: log.scrollTop }));
      expect(Math.abs(m.clientH - cap)).toBeLessThanOrEqual(1);
      expect(m.scrollH).toBeGreaterThan(m.clientH);
      expect(m.scrollH - m.top - m.clientH, 'latest message in view').toBeLessThanOrEqual(2);
    });
  }

  test('under reduced motion the height changes at once, with no transition', async ({ page }) => {
    await visit(page, '/', 1440, 900, { reduced: true });
    await page.locator('#ask-input').fill('Hi');
    await page.locator('#ask-send').click();
    await expect(page.locator('.ask-msg--ai').last()).toContainText('I lead with');
    expect(await page.locator('#ask-messages').evaluate((log) => (log.getAttribute('style') || '') + (log as HTMLElement).dataset.growing)).not.toMatch(/transition|height/);
  });

  test('with motion allowed the box eases rather than jumping', async ({ page }) => {
    await visit(page, '/', 1440, 900);
    const before = (await box(page, '#ask-messages')).height;
    await page.locator('#ask-input').fill('Hi');
    await page.locator('#ask-send').click();
    // Within a frame or two of the question appearing the height is still between old and new.
    await expect(page.locator('.ask-msg--user')).toHaveCount(1);
    const seen = await page.evaluate(() => new Promise<number[]>((res) => {
      const log = document.getElementById('ask-messages')!; const hs: number[] = [];
      const t0 = performance.now();
      const tick = () => { hs.push(log.getBoundingClientRect().height); if (performance.now() - t0 < 600) requestAnimationFrame(tick); else res(hs); };
      tick();
    }));
    const final = seen[seen.length - 1];
    expect(final).toBeGreaterThan(before + 40);
    // Never settles with a fixed height inline afterwards.
    expect(await page.locator('#ask-messages').evaluate((l) => l.getAttribute('style') || '')).not.toContain('height');
  });
});

test.describe('2: the analytics notice is a quiet bar on the bottom edge', () => {
  const pages = ['/', '/fx', '/work/tripup', '/writing/trust-surfaces-in-ai', '/about', '/privacy', '/writing'];
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`one form on every page type: full width, attached to the bottom, hairline on top at ${w}`, async ({ page }) => {
      for (const path of pages) {
        await visit(page, path, w, h, { asked: true, reduced: true });
        await expect(page.locator('#analytics-choice')).toBeVisible();
        const n = await box(page, '#analytics-choice');
        expect(n.x, path).toBe(0);
        expect(Math.round(n.width), path).toBe(w);
        expect(Math.round(n.y + n.height), `${path} is attached to the bottom edge`).toBe(h);
        const s = await page.locator('#analytics-choice').evaluate((el) => { const c = getComputedStyle(el); return { top: c.borderTopWidth, other: [c.borderLeftWidth, c.borderRightWidth, c.borderBottomWidth], radius: c.borderTopLeftRadius, shadow: c.boxShadow, bg: c.backgroundColor, bodyBg: getComputedStyle(document.body).backgroundColor }; });
        expect(s.top).toBe('1px');
        expect(s.other).toEqual(['0px', '0px', '0px']);
        expect(s.radius).toBe('0px');
        expect(s.shadow).toBe('none');
        expect(s.bg).toBe(s.bodyBg);
        await page.unrouteAll();
      }
    });

    test(`its text starts under the logo and its last control ends under the nav's at ${w}`, async ({ page }) => {
      for (const path of ['/', '/fx', '/about']) {
        await visit(page, path, w, h, { asked: true, reduced: true });
        const logo = await box(page, '.nav .brand');
        const text = await box(page, '#analytics-choice .analytics-text');
        const last = await box(page, '#analytics-choice .analytics-actions button:last-child');
        const navEnd = await box(page, w > 760 ? '.nav .cta' : '.nav .site-menu-toggle svg');
        expect(Math.abs(text.x - logo.x), `${path} left edge`).toBeLessThanOrEqual(1);
        // The phone's menu icon is drawn 2px inside its 24px box (round caps), so its visible end is that far in.
        const inset = w > 760 ? 0 : 2;
        expect(Math.abs(last.x + last.width - (navEnd.x + navEnd.width - inset)), `${path} right edge`).toBeLessThanOrEqual(1);
        await page.unrouteAll();
      }
    });
  }

  test('the bar is at most 80px tall at 1440 and 200px at 390, and the two buttons weigh the same', async ({ page }) => {
    await visit(page, '/', 1440, 900, { asked: true, reduced: true });
    expect((await box(page, '#analytics-choice')).height).toBeLessThanOrEqual(80);
    const look = () => page.locator('#analytics-choice button').evaluateAll((bs) => bs.map((b) => { const c = getComputedStyle(b); return [c.backgroundColor, c.color, c.borderTopColor, c.fontWeight, c.fontSize, Math.round(b.getBoundingClientRect().height)].join('|'); }));
    const l = await look();
    expect(l).toHaveLength(2);
    expect(l[0]).toBe(l[1]);
    await page.unrouteAll();
    await visit(page, '/', 390, 844, { asked: true, reduced: true });
    expect((await box(page, '#analytics-choice')).height).toBeLessThanOrEqual(200);
  });

  test('on a phone it is compact, keeps its row of controls together and 44px touch targets', async ({ page }) => {
    await visit(page, '/', 390, 844, { asked: true, reduced: true });
    const m = await page.evaluate(() => {
      const root = document.getElementById('analytics-choice')!;
      const cs = getComputedStyle(root);
      const p = getComputedStyle(root.querySelector('p')!);
      const b = [...root.querySelectorAll('button')].map((e) => ({ h: e.getBoundingClientRect().height, reach: parseFloat(getComputedStyle(e, '::after').height) }));
      const tops = [...root.querySelectorAll('button, a')].map((e) => Math.round(e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2));
      return { padTop: cs.paddingTop, padBottom: cs.paddingBottom, size: p.fontSize, line: parseFloat(p.lineHeight) / parseFloat(p.fontSize), b, tops };
    });
    expect(m.padTop).toBe('16px');
    expect(parseFloat(m.padBottom)).toBeGreaterThanOrEqual(12);
    expect(m.size).toBe('14px');
    expect(m.line).toBeCloseTo(1.45, 2);
    for (const x of m.b) { expect(x.h).toBeLessThanOrEqual(41); expect(x.reach).toBeGreaterThanOrEqual(44); }
    expect(Math.max(...m.tops) - Math.min(...m.tops), 'Privacy details and the buttons share a row').toBeLessThanOrEqual(4);
    expect((await box(page, '#analytics-choice a')).height).toBeGreaterThanOrEqual(44);
  });

  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`with the bar open, nothing the visitor scrolls to ends up under it at ${w}`, async ({ page }) => {
      await visit(page, '/', w, h, { asked: true, reduced: true });
      const bar = await box(page, '#analytics-choice');
      for (const sel of ['#ask-input', '#ask-send', '.ask-note a', '#ask-suggestions button', '#ask-form', 'footer .legal-links a', 'footer [data-analytics-settings]']) {
        await page.locator(sel).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(80);
        expect(hits((await box(page, sel)) as Box, bar), sel).toBe(false);
      }
      await page.unrouteAll();
      await visit(page, '/fx', w, h, { asked: true, reduced: true });
      await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' }));
      await expect(page.locator('.section-open')).toBeVisible();
      expect(hits(await box(page, '.section-open'), await box(page, '#analytics-choice'))).toBe(false);
    });

    test(`at the foot of a page the footer's controls end up above it at ${w}`, async ({ page }) => {
      for (const path of ['/', '/fx', '/work/tripup', '/writing/trust-surfaces-in-ai', '/about']) {
        await visit(page, path, w, h, { asked: true, reduced: true });
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
        await page.waitForTimeout(150);
        const notice = await box(page, '#analytics-choice');
        for (const sel of ['.legal-links a', '[data-analytics-settings]', '.copyright a']) {
          for (const l of await page.locator(sel).all()) {
            if (!(await l.isVisible())) continue;
            expect(hits((await l.boundingBox())! as Box, notice), `${path} ${sel}`).toBe(false);
          }
        }
        await page.unrouteAll();
      }
    });
  }

  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`focusing the composer, and sending a question, leave it fully above the bar at ${w}`, async ({ page }) => {
      await visit(page, '/', w, h, { asked: true, reduced: true });
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.locator('#ask-input').focus();
      await expect.poll(async () => { const f = await box(page, '#ask-form'); const bar = await box(page, '#analytics-choice'); return f.y + f.height <= bar.y + 0.5 && f.y >= 0; }).toBe(true);
      await page.locator('#ask-input').fill('How do you approach a new design problem?');
      await page.locator('#ask-send').click();
      await expect(page.locator('.ask-msg--ai').last()).toContainText('I lead with');
      await expect.poll(async () => { const f = await box(page, '#ask-form'); const bar = await box(page, '#analytics-choice'); return f.y + f.height <= bar.y + 0.5; }).toBe(true);
    });
  }

  test('the Sections button is lifted above the bar while it is open and drops back when it closes', async ({ page }) => {
    await visit(page, '/fx', 1440, 900, { asked: true, reduced: true });
    await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' }));
    const open = (await box(page, '.section-open'));
    expect(open.y + open.height).toBeLessThanOrEqual((await box(page, '#analytics-choice')).y);
    const lifted = open.y;
    await page.getByRole('button', { name: 'No thanks' }).click();
    await expect(page.locator('#analytics-choice')).toBeHidden();
    expect((await box(page, '.section-open')).y).toBeGreaterThan(lifted);
  });
});

test.describe('3: About sits on the page grid', () => {
  test('at 1440 the text blocks have at most four distinct left edges, and the facts fall on grid lines', async ({ page }) => {
    await visit(page, '/about', 1440, 900, { reduced: true });
    const m = await page.evaluate(() => {
      const edges: number[] = [];
      const sel = 'main h1, main h2, main h3, main p, main dt, main dd, main li, main figure img, main a';
      for (const el of document.querySelectorAll(sel)) {
        // Only blocks that carry their own words (or a picture) count.
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) || el.tagName === 'IMG';
        if (!own) continue;
        if (el.closest('.about-links') || el.classList.contains('about-role-dates')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        edges.push(Math.round(r.left));
      }
      const wrap = document.querySelector('.about-intro .wrap')!.getBoundingClientRect();
      const facts = [...document.querySelectorAll('.about-facts dt')].map((e) => Math.round(e.getBoundingClientRect().left));
      const who = Math.round(document.querySelector('.about-who')!.getBoundingClientRect().left);
      return { edges, facts, who, wrapLeft: Math.round(wrap.left) };
    });
    const clusters: number[] = [];
    for (const e of [...m.edges].sort((a, b) => a - b)) if (!clusters.some((c) => Math.abs(c - e) <= 3)) clusters.push(e);
    expect(clusters, `left edges: ${clusters.join(', ')}`).toHaveLength(4);
    expect(m.facts.map((x) => Math.abs(x - 392) <= 2 || Math.abs(x - 734) <= 2 || Math.abs(x - 1076) <= 2).every(Boolean), `facts ${m.facts}`).toBe(true);
    expect(Math.abs(m.facts[1] - m.who), 'the opening starts on the middle fact').toBeLessThanOrEqual(2);
    expect(Math.abs(m.facts[0] - 392)).toBeLessThanOrEqual(2);
  });

  test('the facts rule and the multi-column rules are each one continuous line', async ({ page }) => {
    await visit(page, '/about', 1440, 900, { reduced: true });
    const m = await page.evaluate(() => {
      const facts = document.querySelector('.about-facts')!;
      const fr = facts.getBoundingClientRect();
      const cells = [...facts.children].map((c) => ({ border: getComputedStyle(c).borderTopWidth, left: c.getBoundingClientRect().left, right: c.getBoundingClientRect().right }));
      const lis = [...document.querySelectorAll('.about-list--two > li')].map((l) => l.getBoundingClientRect());
      const rows: Record<number, { l: number; r: number }[]> = {};
      for (const r of lis) (rows[Math.round(r.top)] ||= []).push({ l: r.left, r: r.right });
      return { rule: getComputedStyle(facts).borderTopWidth, left: fr.left, right: fr.right, cells, rows: Object.values(rows) };
    });
    expect(m.rule).toBe('1px');
    for (const c of m.cells) expect(c.border).toBe('0px');
    for (let i = 1; i < m.cells.length; i++) expect(Math.abs(m.cells[i].left - m.cells[i - 1].right)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(m.right - 1391)).toBeLessThanOrEqual(2);
    expect(m.rows.length).toBeGreaterThan(2);
    for (const row of m.rows) for (let i = 1; i < row.length; i++) expect(Math.abs(row[i].l - row[i - 1].r), 'Expertise rules abut').toBeLessThanOrEqual(0.5);
  });
});

test.describe('4 and 5: earlier projects on a phone', () => {
  for (const slug of EARLIER_SLUGS) {
    test(`/work/${slug}: outcomes in two columns that fit, and a clear heading hierarchy`, async ({ page }) => {
      await visit(page, `/work/${slug}`, 390, 844, { reduced: true });
      const m = await page.evaluate(() => {
        const lis = [...document.querySelectorAll('.earlier-outcomes li')];
        const cells = lis.map((li) => {
          const r = li.getBoundingClientRect();
          const parts = [...li.querySelectorAll('.value, .label')].map((e) => ({ over: e.scrollWidth - e.clientWidth, right: e.getBoundingClientRect().right }));
          const value = li.querySelector('.value')!;
          return { top: Math.round(r.top), left: Math.round(r.left), right: r.right, parts, size: parseFloat(getComputedStyle(value).fontSize), fig: value.classList.contains('figure') };
        });
        const cover = document.querySelector('.earlier-cover')!.getBoundingClientRect().top + scrollY;
        const h2 = [...document.querySelectorAll('.earlier-sec > h2')].map((e) => parseFloat(getComputedStyle(e).fontSize));
        const h3 = [...document.querySelectorAll('.earlier-sec-body > h3')].map((e) => parseFloat(getComputedStyle(e).fontSize));
        return { cells, cover, h2, h3, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, wrapRight: document.querySelector('.earlier .wrap')!.getBoundingClientRect().right };
      });
      expect(m.overflow).toBeLessThanOrEqual(0);
      const tops = [...new Set(m.cells.map((c) => c.top))];
      const firstRow = m.cells.filter((c) => c.top === tops[0]);
      expect(firstRow.length, 'the first row has two figures').toBe(m.cells.length === 1 ? 1 : 2);
      for (const c of m.cells) {
        for (const p of c.parts) { expect(p.over, 'nothing overflows its cell').toBeLessThanOrEqual(1); expect(p.right).toBeLessThanOrEqual(m.wrapRight + 1); }
        if (c.fig) expect(c.size).toBeGreaterThanOrEqual(40);
      }
      expect(m.cover, 'the cover is within a screen and a quarter').toBeLessThan(844 * 1.35);
      for (const s of m.h2) expect(s).toBe(26);
      for (const s of m.h3) { expect(s).toBeLessThanOrEqual(21); expect(s).toBeGreaterThanOrEqual(18); }
    });
  }
});

test('6: the Writing index titles start on the content column at 1440', async ({ page }) => {
  await visit(page, '/writing', 1440, 900, { reduced: true });
  const lefts = await page.locator('.writing-list .title').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left));
  expect(lefts).toHaveLength(3);
  for (const l of lefts) expect(Math.abs(l - 392)).toBeLessThanOrEqual(1.5);
  const dates = await page.locator('.writing-list .date').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left));
  for (const d of dates) expect(Math.abs(d - 49)).toBeLessThanOrEqual(1.5);
});

test.describe('7: the scrolled nav on a phone is nearly opaque', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: 92% on a phone, the desktop bar keeps its own mix`, async ({ page }) => {
      const alpha = () => page.evaluate(() => {
        const nav = document.querySelector('.nav')!;
        const bg = getComputedStyle(nav).backgroundColor;
        const m = bg.match(/[\d.]+/g)!.map(Number);
        return { solid: nav.classList.contains('solid'), alpha: bg.startsWith('color(') ? (m.length > 3 ? m[m.length - 1] : 1) : (m.length > 3 ? m[3] : 1) };
      });
      await visit(page, '/', 390, 844, { theme, reduced: true });
      await page.evaluate(() => scrollTo({ top: 900, behavior: 'instant' }));
      await expect.poll(async () => (await alpha()).solid).toBe(true);
      expect((await alpha()).alpha).toBeGreaterThanOrEqual(0.9);
      await page.unrouteAll();
      await visit(page, '/', 1440, 900, { theme, reduced: true });
      await page.evaluate(() => scrollTo({ top: 900, behavior: 'instant' }));
      await expect.poll(async () => (await alpha()).solid).toBe(true);
      expect((await alpha()).alpha).toBeLessThan(0.85);
    });
  }
});

test.describe('8: Privacy', () => {
  test('(opens in a new tab) is for screen readers only, and Analytics settings is a real button', async ({ page }) => {
    await visit(page, '/privacy', 1440, 900, { asked: false, reduced: true });
    await page.evaluate(() => localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })));
    await page.reload();
    const spans = page.locator('main a .vh');
    await expect(spans).toHaveCount(3);
    for (const s of await spans.all()) {
      await expect(s).toHaveText(' (opens in a new tab)');
      const b = (await s.boundingBox())!;
      expect(b.width).toBeLessThanOrEqual(2);
      expect(b.height).toBeLessThanOrEqual(2);
    }
    const inline = page.locator('main button.privacy-inline');
    await expect(inline).toHaveText('Analytics settings');
    expect(await inline.evaluate((e) => ({ tag: e.tagName, attr: e.hasAttribute('data-analytics-settings'), u: getComputedStyle(e).textDecorationLine, size: getComputedStyle(e).fontSize, p: getComputedStyle(e.parentElement!).fontSize }))).toEqual({ tag: 'BUTTON', attr: true, u: 'underline', size: await page.locator('.privacy-text > p').first().evaluate((e) => getComputedStyle(e).fontSize), p: await page.locator('.privacy-text > p').first().evaluate((e) => getComputedStyle(e).fontSize) });
    await expect(page.locator('#analytics-choice')).toBeHidden();
    await inline.click();
    await expect(page.locator('#analytics-choice')).toBeVisible();
    await expect(page.locator('#analytics-choice button').first()).toBeFocused();
    // The footer control is still there and does the same.
    await page.getByRole('button', { name: 'No thanks' }).click();
    await page.locator('footer [data-analytics-settings]').click();
    await expect(page.locator('#analytics-choice')).toBeVisible();
  });
});

test.describe('9: earlier covers carry one quiet frame', () => {
  for (const [slug, theme] of [['corporate-action', 'dark'], ['design-system', 'dark'], ['research', 'dark'], ['corporate-action', 'light'], ['research', 'light']] as const) {
    test(`/work/${slug} in ${theme}: a tonal frame and no outline on the image`, async ({ page }) => {
      await visit(page, `/work/${slug}`, 1440, 900, { theme, reduced: true });
      const m = await page.locator('.earlier-cover img').evaluate((img) => {
        const frame = getComputedStyle(img.closest('.earlier-cover')!);
        const s = getComputedStyle(img);
        return { outline: s.outlineStyle, outlineWidth: s.outlineWidth, frameBg: frame.backgroundColor, frameBorder: frame.borderTopWidth };
      });
      expect(m.outline).toBe('none');
      expect(m.frameBorder).toBe('0px');
      expect(m.frameBg).not.toBe('rgba(0, 0, 0, 0)');
    });
  }
});
