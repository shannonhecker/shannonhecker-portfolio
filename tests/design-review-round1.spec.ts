import { test, expect, type Page } from '@playwright/test';
import { EARLIER_SLUGS } from '../src/lib/earlier';

// Design review, round 1: the earlier-project template, About, Privacy and Work.
// Each test pins one finding from the independent review.

async function open(page: Page, path: string, width: number, theme: 'dark' | 'light' = 'dark') {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
  await page.goto(path);
}
async function loadImages(page: Page) {
  await page.evaluate(() => Promise.all([...document.images].map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}); })));
}
const flat = (s: string) => s.replace(/\s+/g, ' ').trim();

test.describe('images are never shown wider than their own pixels', () => {
  const pages = [...EARLIER_SLUGS.map((s) => `/work/${s}`), '/about'];
  for (const path of pages) {
    for (const width of [390, 1440]) {
      test(`${path} at ${width}px`, async ({ page }) => {
        await open(page, path, width);
        await loadImages(page);
        const imgs = await page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>('main img')]
          // The small decorative cover beside "Next project" is aria-hidden and never needs the full source.
          .filter((i) => i.getClientRects().length > 0 && !i.closest('[aria-hidden="true"]'))
          .map((i) => ({
            src: i.currentSrc.split('/').pop(), shown: i.getBoundingClientRect().width, intrinsic: Number(i.getAttribute('width')),
            largest: Math.max(0, ...(i.srcset || '').split(',').map((c) => parseInt(c.trim().split(/\s+/)[1] || '0', 10))),
            hasSrcset: !!i.srcset,
          })));
        expect(imgs.length).toBeGreaterThan(0);
        for (const i of imgs) {
          expect(i.intrinsic, `width attribute on ${i.src}`).toBeGreaterThan(0);
          expect(i.shown, `${i.src} shown at ${i.shown}px of ${i.intrinsic}px`).toBeLessThanOrEqual(i.intrinsic + 0.5);
          // A 2x phone is offered the largest source, never a downscaled one.
          expect(i.hasSrcset, `srcset on ${i.src}`).toBe(true);
          expect(i.largest, `largest source of ${i.src}`).toBe(i.intrinsic);
        }
      });
    }
  }
});

test('each editorial introduction shares its own content edge at 1440', async ({ page }) => {
  for (const [path, body] of [['/writing/trust-surfaces-in-ai', '.essay-flow > p'], ['/about', '.about-approach .about-prose'], ['/writing', '.writing-list .title']]) {
    await open(page, path, 1440);
    const left = (selector: string) => page.locator(selector).first().evaluate(el => el.getBoundingClientRect().left);
    expect(Math.abs(await left('main h1') - await left(body))).toBeLessThanOrEqual(1);
  }
});

test.describe('earlier-project template, finding 4', () => {
  test('the h1 is at least 44px on a phone', async ({ page }) => {
    await open(page, '/work/tripup', 390);
    expect(await page.locator('h1').evaluate((h) => parseFloat(getComputedStyle(h).fontSize))).toBeGreaterThanOrEqual(44);
  });
  for (const width of [390, 1440]) {
    test(`the Next project title is clearly smaller than the h1 at ${width}`, async ({ page }) => {
      await open(page, '/work/tripup', width);
      const sizes = await page.evaluate(() => ({
        h1: parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize),
        next: parseFloat(getComputedStyle(document.querySelector('.earlier-next .row h3')!).fontSize),
      }));
      expect(sizes.next).toBeLessThanOrEqual(sizes.h1 * 0.75);
    });
  }
  test('outcome labels keep a hyphenated word on one line', async ({ page }) => {
    for (const width of [390, 768, 1024, 1440]) {
      await open(page, '/work/tripup', width);
      const lines = await page.locator('.earlier-outcomes .nb').evaluateAll((els) => els.map((e) => e.getClientRects().length));
      expect(lines.length).toBeGreaterThan(0);
      for (const n of lines) expect(n, `at ${width}`).toBe(1);
    }
  });
});

test.describe('covers sit as framed cards', () => {
  for (const slug of EARLIER_SLUGS) {
    test(`/work/${slug}: the cover is whole on one stage; a white slide gets a white stage with room, the others fill their frame`, async ({ page }) => {
      await open(page, `/work/${slug}`, 1440, 'dark');
      const m = await page.locator('.earlier-cover').evaluate((frame) => {
        const stage = frame.querySelector('.earlier-stage')!;
        const f = stage.getBoundingClientRect();
        const img = frame.querySelector('img')!;
        const i = img.getBoundingClientRect();
        const cs = getComputedStyle(img);
        return { insetTop: i.top - f.top, insetLeft: i.left - f.left, insetRight: f.right - i.right, insetBottom: f.bottom - i.bottom, fit: cs.objectFit, outline: cs.outlineStyle, radius: parseFloat(getComputedStyle(stage).borderTopLeftRadius), matte: frame.classList.contains('is-matte'), bg: getComputedStyle(stage).backgroundColor, top: frame.getBoundingClientRect().top + scrollY };
      });
      expect(m.fit).not.toBe('cover');
      expect(m.outline).toBe('none');
      expect(m.radius).toBeGreaterThan(0);
      expect(m.top, 'the cover starts in the first screen at 1440x900').toBeLessThan(700);
      if (m.matte) {
        expect(m.bg).toBe('rgb(255, 255, 255)');
        for (const k of ['insetTop', 'insetBottom', 'insetLeft', 'insetRight'] as const) expect(m[k]).toBeGreaterThanOrEqual(24);
      } else {
        for (const k of ['insetTop', 'insetBottom', 'insetLeft', 'insetRight'] as const) expect(Math.abs(m[k])).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe('About, finding 5', () => {
  test('the supporting profile sections draw a continuous rule across their two columns', async ({ page }) => {
    await open(page, '/about', 1440);
    const rules = await page.evaluate(() => [...document.querySelectorAll('.about-education, .about-now, .about-outside')].map((sec) => {
      const wrapEl = sec.querySelector('.wrap')!;
      const wrap = wrapEl.getBoundingClientRect();
      const wrapRight = wrap.right - parseFloat(getComputedStyle(wrapEl).paddingRight);
      const label = sec.querySelector('.about-label')!;
      const content = sec.querySelector('.about-content')!;
      // A job's rule is drawn by its ::before, starting at the content column beside the rail (the rail runs unbroken).
      const w = (el: Element) => parseFloat(getComputedStyle(el).borderTopWidth) || (el.classList.contains('about-job') ? parseFloat(getComputedStyle(el, '::before').height) || 0 : 0);
      const topOf = (el: Element) => Math.round(el.getBoundingClientRect().top);
      // The rule on the right is the content's own, or the top rule of its first row (a two-column
      // list draws one per column, so the rule is the rows that start level with the label's).
      const rows = w(content) > 0 ? [content] : [...content.children].filter((c) => w(c) > 0 && Math.abs(topOf(c) - topOf(label)) <= 1);
      return { name: sec.className, label: w(label), right: rows.length > 0, same: rows.length > 0, rightEdge: Math.round(Math.max(0, ...rows.map((r) => r.getBoundingClientRect().right))), wrapRight: Math.round(wrapRight) };
    }));
    expect(rules).toHaveLength(3);
    for (const r of rules) {
      expect(r.label, r.name).toBe(1);
      expect(r.right, r.name).toBe(true);
      expect(r.same, r.name).toBe(true);
      expect(r.rightEdge, r.name).toBe(r.wrapRight);
    }
  });
  test('career and expertise headings lead their full-width lists', async ({ page }) => {
    await open(page, '/about', 1440);
    for (const selector of ['.about-experience', '.about-expertise']) {
      const sec = page.locator(selector);
      const head = (await sec.getByRole('heading', { level: 2 }).boundingBox())!;
      const list = (await sec.locator('.about-content').boundingBox())!;
      expect(head.y + head.height).toBeLessThanOrEqual(list.y);
      expect(Math.abs(head.x - list.x)).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Privacy, finding 6', () => {
  const EXPECTED = [
  "Privacy · 16 November 2026",
  "Your visit, your choice.",
  "Optional analytics",
  "I use Google Analytics and Microsoft Clarity to understand page visits, reading depth and which game levels people play. Both load only after you choose “Allow analytics”. Until then nothing is requested from Google or Microsoft.",
  "Google Analytics records technical information such as device and browser details and uses cookies to distinguish visits. I keep advertising features off. Microsoft Clarity records clicks, scrolling and page movement as session replays and heatmaps. Clarity masks text typed into inputs by default, and I have also marked the scoreboard, its nickname form and the Ask Shannon chat so they are masked in recordings. I do not send nicknames, form entries or URL query strings to Google Analytics. Clarity records the page address as it loads, so I cannot promise the same for query strings there. Reports are private to my Google and Clarity accounts.",
  "You can change your choice using Analytics settings in the footer. Choosing no stops both tools. If Clarity was running, the page reloads so it stops completely. I clear the cookies this site set for them, but Microsoft may set its own cookies on its own domains, and I cannot clear those. I remember your choice on this browser for six months. Declining does not affect the portfolio or the game. Counts reflect consenting visits, not an exact count of people.",
  "Google’s privacy policy (opens in a new tab) · Microsoft’s privacy statement (opens in a new tab)",
  "Ask Shannon chat",
  "When you use Ask Shannon, your message goes to my private chat server and then to Anthropic so the assistant can reply, and I keep chat logs for up to 30 days.",
  "Contact and sales",
  "If you email me, I use your email address and anything you include only to reply. I do not sell personal information.",
  "The game scoreboard",
  "The game remembers completed stages and mission stars in this browser’s local storage. This progress stays on your device and is separate from analytics and the public scoreboard. Clearing this site’s browser data resets it.",
  "Playing does not publish your result. At the end of a stage, you can choose to share your score with an optional nickname. That nickname and score appear on the public stage scoreboard. Please use a made-up nickname, not your real name or contact details.",
  "Scores are stored with Upstash through Vercel. Each stage keeps up to 100 results, with the best ten displayed. A random run receipt prevents duplicate submissions and expires after two hours. To limit spam, a temporary keyed address digest expires after an hour; raw addresses are not stored in the scoreboard database. Vercel and Upstash also process operational data to provide their services.",
  "This is a friendly game, with basic score checks, not a competitive tournament. For removal of a score, contact me through LinkedIn (opens in a new tab) with the stage, nickname and score.",
  ];
  test('keeps every sentence, in order', async ({ page }) => {
    await open(page, '/privacy', 1440);
    const text = flat(await page.locator('main').innerText());
    expect(text).toBe(flat(EXPECTED.join(' ')));
  });
  test('keeps both links to the other parties and the LinkedIn link', async ({ page }) => {
    await open(page, '/privacy', 1440);
    const hrefs = await page.locator('main a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs).toEqual(['https://policies.google.com/privacy', 'https://privacy.microsoft.com/privacystatement', 'https://www.linkedin.com/in/shannonhecker/']);
  });
  test('the privacy text uses the archived centred reading column', async ({ page }) => {
    await open(page, '/privacy', 1440);
    const box = await page.locator('.privacy .wrap').boundingBox();
    expect(box!.width).toBeLessThanOrEqual(760);
    expect(Math.abs(box!.x * 2 + box!.width - 1440)).toBeLessThanOrEqual(1);
    const body = await page.locator('.privacy-text p').first().evaluate(el => getComputedStyle(el).fontSize);
    expect(parseFloat(body)).toBeGreaterThanOrEqual(16);
  });
  test('draws a hairline above every section and keeps the analytics control working', async ({ page }) => {
    await open(page, '/privacy', 1440);
    const borders = await page.locator('.privacy-sec').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderTopWidth));
    expect(borders).toEqual(['1px', '1px', '1px', '1px']);
    await expect(page.locator('[data-analytics-settings]').first()).toBeVisible();
    await expect(page.locator('#analytics-status')).toHaveCount(1);
  });
  test('the page has a single sensible measure at 1440 and does not scroll sideways at 390', async ({ page }) => {
    await open(page, '/privacy', 390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});

test('Work: all fifteen captions stay inside their own link', async ({ page }) => {
  await open(page, '/work', 1440);
  const tiles=page.locator('.all-gallery > a');
  await expect(tiles).toHaveCount(15);
  for(const tile of await tiles.all()){
    const card=(await tile.boundingBox())!, caption=(await tile.getByRole('heading').boundingBox())!;
    expect(caption.y).toBeGreaterThanOrEqual(card.y);
    expect(caption.y+caption.height).toBeLessThanOrEqual(card.y+card.height);
  }
});

test.describe('Essays, findings 8 and 9', () => {
  for (const slug of ['trust-surfaces-in-ai', 'the-design-system-is-the-contract', 'when-everyone-can-ship']) {
    test(`/writing/${slug}: the terms table stops at the text measure`, async ({ page }) => {
      await open(page, `/writing/${slug}`, 1440);
      const m = await page.evaluate(() => {
        const para = document.querySelector('.essay-flow > p')!.getBoundingClientRect();
        const text = document.querySelector('.essay-flow > p')!;
        const pad = parseFloat(getComputedStyle(text).paddingRight);
        return { measureRight: para.right - pad, tables: [...document.querySelectorAll('.essay-terms')].map((t) => t.getBoundingClientRect().right) };
      });
      for (const r of m.tables) expect(r).toBeLessThanOrEqual(m.measureRight + 1);
    });
  }
  test('body paragraphs break lines with text-wrap pretty', async ({ page }) => {
    await open(page, '/writing/trust-surfaces-in-ai', 1440);
    expect(await page.locator('.essay-flow > p').first().evaluate((p) => getComputedStyle(p).textWrap)).toMatch(/pretty/);
    await open(page, '/work/tripup', 1440);
    expect(await page.locator('.project-story-lead').first().evaluate((p) => getComputedStyle(p).textWrap)).toMatch(/pretty/);
  });
});
