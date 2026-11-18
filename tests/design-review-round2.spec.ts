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

  test('at 1440 it stops at the cap, with the newest question on its top edge', async ({ page }) => {
    await visit(page, '/', 1440, 900, { reduced: true, reply: LONG });
    const cap = await page.locator('#ask-messages').evaluate((log) => parseFloat(getComputedStyle(log).maxHeight));
    for (const q of ['One', 'Two']) {
      await page.locator('#ask-input').fill(q);
      await page.locator('#ask-send').click();
      await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
    }
    await expect(page.locator('.ask-msg--ai')).toHaveCount(3);
    const m = await page.locator('#ask-messages').evaluate((log) => {
      const users = log.querySelectorAll('.ask-msg--user');
      return { clientH: log.clientHeight, scrollH: log.scrollHeight, edge: users[users.length - 1].getBoundingClientRect().top - log.getBoundingClientRect().top };
    });
    expect(Math.abs(m.clientH - cap)).toBeLessThanOrEqual(1);
    expect(m.scrollH).toBeGreaterThan(m.clientH);
    expect(Math.abs(m.edge), 'the newest question sits on the top edge').toBeLessThanOrEqual(1);
  });

  test('at 390 the log is not a box with its own scroll: the page carries the conversation', async ({ page }) => {
    await visit(page, '/', 390, 844, { reduced: true, reply: LONG });
    for (const q of ['One', 'Two']) {
      await page.locator('#ask-input').fill(q);
      await page.locator('#ask-send').click();
      await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
    }
    const m = await page.locator('#ask-messages').evaluate((log) => ({ max: getComputedStyle(log).maxHeight, over: getComputedStyle(log).overflowY, extra: log.scrollHeight - log.clientHeight, h: log.clientHeight }));
    expect(m.max).toBe('none');
    expect(m.over).toBe('visible');
    expect(m.extra).toBeLessThanOrEqual(1);
    expect(m.h).toBeGreaterThan(400);
  });

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
      await page.locator('.product-links a').first().scrollIntoViewIfNeeded();
      expect(hits(await box(page, '.product-links a'), await box(page, '#analytics-choice'))).toBe(false);
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
});

test.describe('3: About sits on the page grid', () => {
  test('at 1440 the text blocks have at most six distinct left edges, and the facts sit under the opening on grid lines', async ({ page }) => {
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
    // The three figures sit under the opening (columns 7 to 12 of the twelve-column grid), so the page has the
    // four edges it had plus the two later figure columns (9 and 11).
    expect(clusters.length, `left edges: ${clusters.join(', ')}`).toBeLessThanOrEqual(6);
    expect(m.facts.map((x) => [734, 962, 1191].some((g) => Math.abs(x - g) <= 2)).every(Boolean), `facts ${m.facts}`).toBe(true);
    expect(Math.abs(m.facts[0] - m.who), 'the first figure starts where the opening starts').toBeLessThanOrEqual(2);
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
          return { top: Math.round(r.top), left: Math.round(r.left), right: r.right, parts, size: parseFloat(getComputedStyle(value).fontSize), fig: value.classList.contains('figure'), mixed: (li as HTMLElement).dataset.pair === 'mixed' };
        });
        const cover = document.querySelector('.earlier-cover')!.getBoundingClientRect().top + scrollY;
        const titleSize = parseFloat(getComputedStyle(document.querySelector('.earlier h1')!).fontSize);
        const outcomesSize = parseFloat(getComputedStyle(document.querySelector('.earlier-results h2')!).fontSize);
        return { cells, cover, titleSize, outcomesSize, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, wrapRight: document.querySelector('.earlier .wrap')!.getBoundingClientRect().right };
      });
      expect(m.overflow).toBeLessThanOrEqual(0);
      const tops = [...new Set(m.cells.map((c) => c.top))];
      const firstRow = m.cells.filter((c) => c.top === tops[0]);
      expect(firstRow.length, 'the first row has two figures').toBe(m.cells.length === 1 ? 1 : 2);
      for (const c of m.cells) {
        for (const p of c.parts) { expect(p.over, 'nothing overflows its cell').toBeLessThanOrEqual(1); expect(p.right).toBeLessThanOrEqual(m.wrapRight + 1); }
        if (c.fig && !c.mixed) expect(c.size).toBeGreaterThanOrEqual(40);
      }
      expect(m.cover, 'the cover is within a screen and a quarter').toBeLessThan(844 * 1.35);
      expect(m.outcomesSize).toBeGreaterThanOrEqual(14);
      expect(m.titleSize).toBeGreaterThan(m.outcomesSize);
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
  // A slide on a white ground sits on a white stage in both themes; a cover that fills its own frame sits on the tonal one.
  for (const [slug, theme, stage] of [['corporate-action', 'dark', 'rgb(255, 255, 255)'], ['design-system', 'dark', 'rgb(255, 255, 255)'], ['research', 'dark', ''], ['corporate-action', 'light', 'rgb(255, 255, 255)'], ['research', 'light', '']] as const) {
    test(`/work/${slug} in ${theme}: one stage and no outline on the image`, async ({ page }) => {
      await visit(page, `/work/${slug}`, 1440, 900, { theme, reduced: true });
      const m = await page.locator('.earlier-cover img').evaluate((img) => {
        const frame = getComputedStyle(img.closest('.earlier-stage')!);
        const s = getComputedStyle(img);
        return { outline: s.outlineStyle, frameBg: frame.backgroundColor, frameBorder: frame.borderTopWidth };
      });
      expect(m.outline).toBe('none');
      expect(m.frameBorder).toBe('0px');
      expect(m.frameBg).not.toBe('rgba(0, 0, 0, 0)');
      if (stage) expect(m.frameBg).toBe(stage);
    });
  }
});

test.describe('B1: the log never slices through a line at its top edge', () => {
  for (const [w, h, theme] of [[1440, 900, 'dark'], [390, 844, 'light'], [390, 844, 'dark'], [1440, 900, 'light']] as const) {
    test(`after three exchanges at ${w} in ${theme}`, async ({ page }) => {
      await visit(page, '/', w, h, { theme, reduced: true });
      for (const q of ['What was hardest about the FX work?', 'What roles are you looking for?', 'How do you approach a new design problem?']) {
        await page.locator('#ask-input').fill(q);
        await page.locator('#ask-send').click();
        await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
      }
      await expect(page.locator('.ask-msg--ai')).toHaveCount(4);
      const m = await page.locator('#ask-messages').evaluate((log) => {
        const top = log.getBoundingClientRect().top;
        const wrap = log.closest('.ask-main')!.getBoundingClientRect();
        const bad: string[] = [];
        for (const el of log.querySelectorAll(':scope > .ask-msg, :scope > .ask-error')) {
          const r = el.getBoundingClientRect();
          if (r.bottom <= top + 0.5) continue; // entirely above: out of sight
          if (r.top < top - 1) bad.push(`${el.className} starts ${Math.round(top - r.top)}px above the edge`);
        }
        return { bad, gap: top - wrap.top, scrolls: log.scrollHeight - log.clientHeight > 1 };
      });
      expect(m.bad).toEqual([]);
      // The card's edge replaces the old rule: it never scrolls, and the first line sits clear of it.
      expect(m.gap, 'air between the card edge and the first line').toBeGreaterThanOrEqual(20);
      expect(m.scrolls).toBe(w > 900);
    });
  }

  test('on a phone the new question lands just under the nav and the composer is reachable', async ({ page }) => {
    await visit(page, '/', 390, 844, { reduced: true });
    for (const q of ['One', 'Two', 'Three']) {
      await page.locator('#ask-input').fill(q);
      await page.locator('#ask-send').click();
      await expect(page.locator('#ask-messages')).not.toHaveAttribute('aria-busy', 'true');
    }
    const r = await page.evaluate(() => { const u = [...document.querySelectorAll('.ask-msg--user')].pop()!.getBoundingClientRect(); const navH = document.querySelector('.nav')!.getBoundingClientRect().height; return { top: u.top, navH }; });
    expect(r.top).toBeGreaterThanOrEqual(r.navH);
    expect(r.top).toBeLessThan(r.navH + 120);
  });
});

// ---------------------------------------------------------------------------------------------
// Round 3
// ---------------------------------------------------------------------------------------------
test.describe('round 3: earlier projects on phones', () => {
  test('S1: under 640px the cover frame is the full content width, and a wide cover pans inside it', async ({ page }) => {
    for (const slug of ['design-system', 'corporate-action', 'research', 'stock-dashboard']) {
      await visit(page, `/work/${slug}`, 390, 844, { theme: 'dark', reduced: true });
      const m = await page.evaluate(() => {
        const frame = document.querySelector('.earlier-cover .earlier-stage')!;
        const pan = frame.querySelector<HTMLElement>('.earlier-pan')!;
        const img = frame.querySelector('img')!;
        const wrap = document.querySelector('.earlier .wrap')!;
        const wr = wrap.getBoundingClientRect();
        const gutter = parseFloat(getComputedStyle(wrap).paddingLeft);
        return { w: frame.getBoundingClientRect().width, content: wr.width - 2 * gutter, pans: pan.scrollWidth > pan.clientWidth, overflowX: getComputedStyle(pan).overflowX, imgW: img.getBoundingClientRect().width, nat: img.naturalWidth, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(Math.abs(m.w - m.content), slug).toBeLessThanOrEqual(1);
      expect(m.overflow, `${slug} does not scroll the page sideways`).toBeLessThanOrEqual(0);
      expect(m.overflowX).toBe('auto');
      // A banner this wide keeps a readable width and pans; nothing is cropped (the image is shown whole inside the scroller).
      expect(m.pans, `${slug} pans`).toBe(true);
      expect(m.imgW).toBeGreaterThan(m.content);
      await page.unrouteAll();
    }
  });
  test('S1: on a wide screen a cover that is a white slide keeps a white stage with room around it', async ({ page }) => {
    await visit(page, '/work/design-system', 1440, 900, { theme: 'dark', reduced: true });
    const m = await page.locator('.earlier-cover .earlier-stage').evaluate((e) => ({ pad: parseFloat(getComputedStyle(e).paddingTop), bg: getComputedStyle(e).backgroundColor }));
    expect(m.pad).toBeGreaterThanOrEqual(24);
    expect(m.bg).toBe('rgb(255, 255, 255)');
  });
  for (const slug of EARLIER_SLUGS) {
    test(`/work/${slug}: facts identify the date and role, and paired figures match`, async ({ page }) => {
      await visit(page, `/work/${slug}`, 390, 844, { reduced: true });
      const m = await page.evaluate(() => {
        const lis = [...document.querySelectorAll('.earlier-outcomes li')];
        const rows = new Map<number, number[]>();
        for (const li of lis) { const t = Math.round(li.getBoundingClientRect().top); const v = parseFloat(getComputedStyle(li.querySelector('.value')!).fontSize); rows.set(t, [...(rows.get(t) || []), v]); }
        return { rows: [...rows.values()] };
      });
      await expect(page.locator('.earlier-facts dt')).toHaveText(['Year', 'Role']);
      for (const r of m.rows) { if (r.length === 2) expect(r[0], `a row of two reads evenly: ${r}`).toBe(r[1]); }
    });
  }
});

test.describe('round 3: footer, About, 404, nav, menu', () => {
  test('S2: the footer rows are about 52px with 44px targets, and it ends 48px under its last line (plus the bar)', async ({ page }) => {
    await visit(page, '/', 390, 844, { reduced: true });
    const m = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#links .links a')].map((a) => a.getBoundingClientRect().height);
      const f = document.getElementById('links')!;
      return { rows, pad: parseFloat(getComputedStyle(f).paddingBottom) };
    });
    for (const r of m.rows) { expect(r).toBeGreaterThanOrEqual(44); expect(r).toBeLessThanOrEqual(54); }
    expect(m.pad).toBe(48);
    await page.unrouteAll();
    await visit(page, '/', 390, 844, { asked: true, reduced: true });
    const open = await page.evaluate(() => ({ pad: parseFloat(getComputedStyle(document.getElementById('links')!).paddingBottom), bar: document.getElementById('analytics-choice')!.offsetHeight }));
    expect(open.pad).toBeGreaterThanOrEqual(48 + open.bar);
  });

  for (const w of [390, 360]) {
    test(`S3: the three page heads fit on one line and share one size at ${w}`, async ({ page }) => {
      const sizes: number[] = [];
      for (const path of ['/work', '/writing', '/about']) {
        await visit(page, path, w, 740, { reduced: true });
        const m = await page.locator('main h1').evaluate((h) => { const r = document.createRange(); r.selectNodeContents(h); const lines = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return { size: parseFloat(getComputedStyle(h).fontSize), lines: lines.size, track: getComputedStyle(h).letterSpacing, over: document.documentElement.scrollWidth - document.documentElement.clientWidth }; });
        expect(m.lines, `${path} at ${w}`).toBe(1);
        expect(m.over).toBeLessThanOrEqual(0);
        sizes.push(m.size);
        await page.unrouteAll();
      }
      expect(new Set(sizes).size).toBe(1);
    });
  }

  test('S3: the About stats use the earlier-projects outcome grid and figure size on a phone', async ({ page }) => {
    await visit(page, '/work/design-system', 390, 844, { reduced: true });
    const fig = await page.locator('.earlier-outcomes .value.figure').first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    await page.unrouteAll();
    await visit(page, '/about', 390, 844, { reduced: true });
    const m = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('.about-facts > div')].map((c) => { const r = c.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), w: r.width, dt: parseFloat(getComputedStyle(c.querySelector('dt')!).fontSize), over: c.querySelector('dt')!.scrollWidth - c.querySelector('dt')!.clientWidth }; });
      return { cells, rule: getComputedStyle(document.querySelector('.about-facts')!).borderTopWidth };
    });
    expect(m.cells[0].top).toBe(m.cells[1].top);
    expect(m.cells[1].left).toBeGreaterThan(m.cells[0].left + 100);
    expect(m.cells[2].top).toBeGreaterThan(m.cells[0].top);
    expect(m.cells[2].w).toBeGreaterThan(m.cells[0].w * 1.8);
    for (const c of m.cells) { expect(c.dt).toBe(fig); expect(c.over).toBeLessThanOrEqual(0); }
    expect(m.rule).toBe('1px');
  });

  test('P4: the role table runs to the same right edge as the hairlines at 1440', async ({ page }) => {
    await visit(page, '/about', 1440, 900, { reduced: true });
    const m = await page.evaluate(() => ({ table: document.querySelector('.about-roles')!.getBoundingClientRect().right, rule: document.querySelector('.about-job')!.getBoundingClientRect().right, content: document.querySelector('.about-jobs')!.getBoundingClientRect().right }));
    expect(Math.abs(m.table - m.rule)).toBeLessThanOrEqual(1);
    expect(Math.abs(m.table - m.content)).toBeLessThanOrEqual(1);
  });

  for (const w of [390, 1440]) {
    test(`S4: the 404 is a comfortable, centred block under the nav with the nav's tonal button, a curly apostrophe, the five case links and the wave field at ${w}`, async ({ page }) => {
      await visit(page, '/no-such-page', w, w === 390 ? 844 : 900, { reduced: true });
      const m = await page.evaluate(() => {
        const main = document.querySelector('main')!.getBoundingClientRect();
        const cta = document.querySelector('main .cta-link')!;
        const cs = getComputedStyle(cta);
        const nav = getComputedStyle(document.querySelector('.nav .cta')!);
        const cta0 = cta.getBoundingClientRect();
        const h1 = document.querySelector('main h1')!.getBoundingClientRect();
        return { top: main.top, h: main.height, footer: document.querySelector('footer')!.getBoundingClientRect().top, vh: innerHeight, bg: cs.backgroundColor, border: cs.borderTopColor, navBg: nav.backgroundColor, navBorder: nav.borderTopColor, text: document.querySelector('main h1')!.textContent, tall: cta0.height, h1top: h1.top, ctaBottom: cta0.bottom };
      });
      // min(70svh, 640px) tall, so the footer's opening line can show beneath it.
      expect(m.h).toBeGreaterThanOrEqual(Math.min(m.vh * 0.7, 640) - 1);
      expect(m.footer).toBeGreaterThanOrEqual(m.top + m.h - 1);
      expect(m.text).toBe('This page doesn’t exist.');
      expect(m.tall).toBeGreaterThanOrEqual(44);
      expect(m.bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(m.border).not.toBe(m.bg.replace('rgba', 'rgb'));
      // Content sits in the middle band of the screen, not under the nav or at the foot.
      expect(m.h1top).toBeGreaterThan(m.vh * 0.15);
      expect(m.ctaBottom).toBeLessThan(m.vh * 0.85);
      expect(await page.locator('main .not-found-cases a').count()).toBe(5);
      await expect(page.locator('main .wave-field')).toHaveCount(1);
    });
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`P5: the scrolled phone nav is 97% opaque in ${theme}`, async ({ page }) => {
      await visit(page, '/', 390, 844, { theme, reduced: true });
      await page.evaluate(() => scrollTo({ top: 900, behavior: 'instant' }));
      await expect.poll(() => page.evaluate(() => document.querySelector('.nav')!.classList.contains('solid'))).toBe(true);
      const a = await page.evaluate(() => { const m = getComputedStyle(document.querySelector('.nav')!).backgroundColor.match(/[\d.]+/g)!.map(Number); return m[m.length - 1]; });
      expect(a).toBeGreaterThanOrEqual(0.965);
    });
  }

  test('P6: the phone menu links start on the same left edge as the Menu heading, and the highlight still extends past it', async ({ page }) => {
    await visit(page, '/about', 390, 844, { reduced: true });
    await page.locator('.site-menu-toggle').click();
    const m = await page.evaluate(() => {
      const h = document.querySelector('.menu-intro span')!.getBoundingClientRect().left;
      const links = [...document.querySelectorAll('.site-menu-panel a.l')];
      const text = links.map((a) => { const r = document.createRange(); r.selectNodeContents(a); return r.getBoundingClientRect().left; });
      const hl = getComputedStyle(links[2], '::before');
      return { h, text, pseudoLeft: links[2].getBoundingClientRect().left - 12, bg: hl.backgroundColor, inset: [hl.left, hl.right] };
    });
    for (const t of m.text) expect(Math.abs(t - m.h)).toBeLessThanOrEqual(1);
    expect(m.bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(m.inset).toEqual(['-12px', '-12px']);
  });
});
