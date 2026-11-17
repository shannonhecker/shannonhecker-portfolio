import { test, expect, type Page } from '@playwright/test';

// Design and accessibility review, round 1: the analytics notice, the chat's layout and focus,
// the footer's small controls, the home page's rhythm, and the measured contrast of the controls
// that were too faint. Every number here was measured on the page, not on the source.
const API = 'https://ask-shannon-api.onrender.com/**';

async function visit(page: Page, path: string, theme: 'light' | 'dark', analytics: 'asked' | 'no' = 'no') {
  await page.route(API, (route) => route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' }, body: '' }));
  await page.addInitScript(([t, a]) => {
    try {
      localStorage.setItem('portfolio-theme', t);
      if (a === 'no') localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() }));
    } catch { /* storage blocked */ }
  }, [theme, analytics]);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// Resolve any CSS colour (including color-mix) to sRGB through a canvas, then take WCAG contrast.
async function contrast(page: Page, a: string, b: string) {
  return page.evaluate(([x, y]) => {
    const px = (css: string) => {
      const c = document.createElement('canvas'); c.width = c.height = 1;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.clearRect(0, 0, 1, 1); g.fillStyle = css; g.fillRect(0, 0, 1, 1);
      return Array.from(g.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const lum = (rgb: number[]) => {
      const [r, gg, bb] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
    };
    const l1 = lum(px(x)), l2 = lum(px(y));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, [a, b]);
}

const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())!;
const hits = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
  !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test('A1: the skip link is readable when focused (4.5:1)', async ({ page }) => {
      await visit(page, '/', theme);
      await page.keyboard.press('Tab');
      const skip = page.locator('a.skip');
      await expect(skip).toBeFocused();
      const [fg, bg] = await skip.evaluate((el) => { const s = getComputedStyle(el); return [s.color, s.backgroundColor]; });
      expect(await contrast(page, fg, bg)).toBeGreaterThanOrEqual(4.5);
    });

    test('A2: the card edge, the mic and the theme switch have a 3:1 edge', async ({ page }) => {
      await visit(page, '/', theme);
      const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      for (const sel of ['#ask-mic', '.theme-toggle']) {
        const edge = await page.locator(sel).evaluate((el) => getComputedStyle(el).borderTopColor);
        expect(await contrast(page, edge, pageBg), sel).toBeGreaterThanOrEqual(3);
      }
      // The chat's own edge is the card's gradient ring: every stop must hold 3:1 on the card.
      const { cardBg, stops } = await page.locator('#ask .ask-main').evaluate((el) => {
        const s = getComputedStyle(el);
        return { cardBg: s.backgroundColor, stops: ['--ask-pink', '--ask-violet', '--ask-blue', '--ask-olive'].map((n) => getComputedStyle(document.querySelector('#ask')!).getPropertyValue(n).trim()) };
      });
      for (const c of stops) expect(await contrast(page, c, cardBg), c).toBeGreaterThanOrEqual(3);
    });

    test('D6: one focus ring on the composer, following the card (a violet box-shadow ring, no outline)', async ({ page }) => {
      await visit(page, '/', theme);
      await page.locator('#ask-input').focus();
      const m = await page.evaluate(() => {
        const card = getComputedStyle(document.querySelector('#ask .ask-main')!);
        const form = getComputedStyle(document.querySelector('#ask-form')!);
        const input = getComputedStyle(document.querySelector('#ask-input')!);
        return { shadow: card.boxShadow, ring: getComputedStyle(document.querySelector('#ask')!).getPropertyValue('--ask-ring').trim(), formOutline: form.outlineStyle, inputOutline: input.outlineStyle, radius: card.borderTopLeftRadius };
      });
      // No second outline round the composer: the ring is on the card and shares its 28px corner.
      expect(m.formOutline).toBe('none');
      expect(m.inputOutline).toBe('none');
      expect(m.radius).toBe('28px');
      // A 3px gap in the page colour, then a 2px ring, both listed ahead of the glows.
      expect(m.shadow).toMatch(/0px 0px 0px 3px/);
      expect(m.shadow).toMatch(/0px 0px 0px 5px/);
      const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(await contrast(page, m.ring, pageBg)).toBeGreaterThanOrEqual(3);
    });
  });
}

test.describe('D1: the analytics notice never covers the chat composer', () => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await visit(page, '/', 'dark', 'asked');
      await expect(page.locator('#analytics-choice')).toBeVisible();
      await page.locator('#ask-input').scrollIntoViewIfNeeded();
      await page.locator('#ask-send').scrollIntoViewIfNeeded();
      const notice = await box(page, '#analytics-choice');
      expect(hits(await box(page, '#ask-input'), notice)).toBe(false);
      expect(hits(await box(page, '#ask-send'), notice)).toBe(false);
      // On the gutter, not 12px from the edge.
      const gutter = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.wrap')!).paddingLeft));
      // One form on every page: a bar attached to the bottom edge, full width (round 2).
      expect(gutter).toBeGreaterThan(0);
      expect(notice.x).toBe(0);
      expect(Math.round(notice.width)).toBe(w);
    });
  }

  test('the page reserves its height while it is open, and gives it back when closed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, '/', 'dark', 'asked');
    const reserved = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--consent-h')) || 0);
    const n = await box(page, '#analytics-choice');
    expect(await reserved()).toBeGreaterThanOrEqual(n.height);
    await page.getByRole('button', { name: 'No thanks', exact: true }).click();
    await expect.poll(reserved).toBe(0);
  });

  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`on a case page it stays clear of the Sections button at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await visit(page, '/fx', 'dark', 'asked');
      await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' }));
      await expect(page.locator('#analytics-choice')).toBeVisible();
      await expect(page.locator('.section-open')).toBeVisible();
      expect(hits(await box(page, '#analytics-choice'), await box(page, '.section-open'))).toBe(false);
      if (w < 400) {
        const gutter = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.wrap')!).paddingLeft));
        const s = await box(page, '.section-open');
        expect(Math.abs(s.x + s.width - (w - gutter))).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe('D2: the empty chat is only as tall as its greeting', () => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await visit(page, '/', 'dark');
      const empty = (await box(page, '#ask-messages')).height;
      const greeting = (await box(page, '#ask-messages .ask-greeting')).height;
      expect(empty).toBeLessThan(greeting + 80);
      await page.route('https://ask-shannon-api.onrender.com/api/chat', (route) =>
        route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"text":"Hello."}\n\ndata: [DONE]\n\n' }));
      await page.locator('#ask-input').fill('Hi');
      await page.locator('#ask-send').click();
      await expect(page.locator('.ask-msg--ai').last()).toContainText('Hello.');
      const grown = (await box(page, '#ask-messages')).height;
      expect(grown).toBeGreaterThan(empty + 60);
      // From here the log is as tall as what is in it, up to its cap (see design-review-round2).
      await page.locator('#ask-input').fill('Again');
      await page.locator('#ask-send').click();
      await expect(page.locator('.ask-msg--ai')).toHaveCount(3);
      expect((await box(page, '#ask-messages')).height).toBeGreaterThanOrEqual(grown);
    });
  }
});

test.describe('D3, D4: the chat is one centred column under a centred header', () => {
  for (const [w, h] of [[1440, 900], [1024, 800]] as const) {
    test(`card, suggestions and note share the page centre at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await visit(page, '/', 'dark');
      const centre = async (sel: string) => { const b = await box(page, sel); return b.x + b.width / 2; };
      const want = await page.evaluate(() => document.documentElement.clientWidth / 2);
      expect(Math.abs((await centre('#ask .ask-main')) - want)).toBeLessThanOrEqual(1);
      expect(Math.abs((await centre('#ask .ask-side')) - want)).toBeLessThanOrEqual(1);
      expect(Math.abs((await centre('#ask .ask-head .h-section')) - want)).toBeLessThanOrEqual(1);
    });
  }
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    test(`header spacing and section padding match at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await visit(page, '/', 'dark');
      const m = (id: string, content: string) => page.evaluate(([i, c]) => {
        const s = document.querySelector(i)!; const e = s.querySelector('.eyebrow')!.getBoundingClientRect();
        const h2 = s.querySelector('h2')!.getBoundingClientRect(); const body = s.querySelector(c)!.getBoundingClientRect();
        const cs = getComputedStyle(s);
        return { eyebrowToH2: Math.round(h2.top - e.bottom), h2ToBody: Math.round(body.top - h2.bottom), pt: cs.paddingTop, pb: cs.paddingBottom };
      }, [id, content]);
      expect(await m('#ask', '.ask-grid')).toEqual(await m('#how', '.principles'));
    });
  }
});

test('D5, D11: the gaps around the optional adventure follow the section rhythm', async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await visit(page, '/', 'dark');
    const g = await page.evaluate(() => {
      const top = (s: string) => document.querySelector(s)!.getBoundingClientRect().top;
      const bottom = (s: string) => document.querySelector(s)!.getBoundingClientRect().bottom;
      const rhythm = parseFloat(getComputedStyle(document.querySelector('#how')!).paddingTop);
      return {
        rhythm,
        moreToAdventure: top('#adventure .hero-bonus') - bottom('.more-work'),
        gameToHow: top('#how') - bottom('#adventure .hero-bonus'),
        howToEyebrow: top('#how .eyebrow') - top('#how'),
      };
    });
    expect(Math.abs(g.moreToAdventure - g.rhythm), `more work, ${w}`).toBeLessThanOrEqual(2);
    expect(Math.abs(g.howToEyebrow - g.rhythm), `how top, ${w}`).toBeLessThanOrEqual(2);
    // The hairline above How I work sits the same distance below the game as above the eyebrow.
    expect(Math.abs((g.gameToHow) - g.rhythm)).toBeLessThanOrEqual(2);
  }
});

test('D7: a clicked suggestion leaves no filled pill behind', async ({ page }) => {
  await visit(page, '/', 'light');
  await page.route('https://ask-shannon-api.onrender.com/api/chat', (route) =>
    route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"text":"Sure."}\n\ndata: [DONE]\n\n' }));
  await page.locator('#ask-suggestions button').first().scrollIntoViewIfNeeded();
  const ink = await page.locator('#ask-suggestions button').nth(2).evaluate((e) => getComputedStyle(e).color);
  await page.locator('#ask-suggestions button').first().click();
  await expect(page.locator('.ask-msg--ai').last()).toContainText('Sure.');
  await page.waitForTimeout(400);
  const fills = () => page.locator('#ask-suggestions button').evaluateAll((els) => els.map((e) => getComputedStyle(e).color));
  // The pointer is still over the clicked pill, but it stays quiet (ink text, not the filled hover colours).
  expect((await fills()).every((c) => c === ink)).toBe(true);
  // Moving the pointer away and back brings the hover fill back.
  const b = (await page.locator('#ask-suggestions button').nth(1).boundingBox())!;
  await page.mouse.move(b.x + 20, b.y + b.height / 2, { steps: 8 });
  await page.mouse.move(b.x + 60, b.y + b.height / 2, { steps: 8 });
  expect(await page.locator('#ask-suggestions button').nth(1).evaluate((e) => getComputedStyle(e).color)).not.toBe(ink);
});

test.describe('D8, A3: the footer', () => {
  test('one underline on the email line, and 24px between the small links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await visit(page, '/', 'dark');
    const mail = await page.locator('.foot-mail').evaluate((el) => ({ link: getComputedStyle(el).display, arrow: getComputedStyle(el.querySelector('span')!).display }));
    // The arrow is plain inline text inside the link, so the underline is not split in two.
    expect(mail.arrow).toBe('inline');
    expect(['block', 'inline', 'inline-block']).toContain(mail.link);
    await expect(page.locator('[data-avatar-cursor-toggle]')).toBeVisible();
    const r = await page.locator('.legal-links > *:visible').evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.right]; }));
    expect(r.length).toBe(3);
    expect(Math.round(r[1][0] - r[0][1])).toBe(24);
    expect(Math.round(r[2][0] - r[1][1])).toBe(24);
  });
  for (const [w, h, min] of [[1440, 900, 24], [390, 844, 44]] as const) {
    test(`the small controls are at least ${min}px tall at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await visit(page, '/', 'dark', 'asked');
      const small: string[] = [];
      for (const sel of ['.legal-links a', '[data-analytics-settings]', '[data-avatar-cursor-toggle]', '.copyright a', '#analytics-choice a', '#analytics-choice button']) {
        for (const l of await page.locator(sel).all()) {
          if (!(await l.isVisible())) continue;
          const b = (await l.boundingBox())!;
          // The notice's phone buttons look 40px tall and reach 44px through an invisible extension.
          const reach = sel === '#analytics-choice button' && min === 44 ? await l.evaluate((el) => parseFloat(getComputedStyle(el, '::after').height)) : 0;
          if (Math.max(b.height, reach) < min - 0.5) small.push(`${sel} ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
      }
      expect(small).toEqual([]);
    });
  }
});

test('D9: case pages keep one divider above the footer, and the Sections button clears the end', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/fx', 'dark');
  const row = await page.locator('.next-case .row').evaluate((el) => getComputedStyle(el).borderBottomWidth);
  expect(row).toBe('0px');
  const pad = await page.locator('.next-case').evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(pad).toBeGreaterThanOrEqual(16 + 48 + 16);
});

test('D10: case titles start on the same edge whatever the digits', async ({ page }) => {
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await visit(page, '/', 'dark');
    const rows = await page.locator('#work .row').evaluateAll((els) => els.map((r) => ({
      x: r.getBoundingClientRect().x, h3: r.querySelector('h3')!.getBoundingClientRect().x, tnum: getComputedStyle(r.querySelector('.n')!).fontVariantNumeric,
    })));
    expect(rows.length).toBe(5);
    // The gallery alternates sides on desktop, so the cases on the same side share one title edge;
    // on a phone every title starts on the same edge.
    rows.forEach((r, i) => {
      expect(r.tnum).toContain('tabular-nums');
      const ref = rows[w > 900 ? i % 2 : 0];
      expect(Math.abs(r.h3 - r.x - (ref.h3 - ref.x))).toBeLessThanOrEqual(0.5);
    });
  }
});

test('A4: the home page has its own title and keeps the default description', async ({ page }) => {
  await visit(page, '/', 'dark');
  await expect(page).toHaveTitle('Shannon Hecker · Product designer in London');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^Hi, I'm Shannon Hecker, a product designer in London\./);
});

test('A5: the chat has no aside landmark inside it', async ({ page }) => {
  await visit(page, '/', 'dark');
  await expect(page.locator('#ask aside')).toHaveCount(0);
  await expect(page.locator('#ask .ask-side')).toHaveCount(1);
});

test('A6: each "Read the case" link names its case', async ({ page }) => {
  await visit(page, '/', 'dark');
  const names = await page.locator('a.game-read').evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
  expect(names.length).toBe(4);
  expect(new Set(names).size).toBe(4);
  for (const n of names) expect(n.startsWith('Read the case →')).toBe(true);
});

test('A7: a chat failure is announced once, by the log', async ({ page }) => {
  await visit(page, '/', 'light');
  await page.route('https://ask-shannon-api.onrender.com/api/chat', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"x"}' }));
  await page.locator('#ask-input').fill('Hello?');
  await page.locator('#ask-send').click();
  await expect(page.locator('#ask-messages .ask-error')).toBeVisible();
  await expect(page.locator('#ask-status')).toHaveText('');
  const live = await page.locator('#ask-messages').evaluate((el) => ({ role: el.getAttribute('role'), live: el.getAttribute('aria-live'), busy: el.getAttribute('aria-busy') }));
  expect(live.role).toBe('log');
  expect(live.busy).toBeNull();
});
