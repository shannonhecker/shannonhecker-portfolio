import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOST = 'https://shannonhecker.com';
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function open(page: Page, path: string, theme: 'dark' | 'light' | null = 'dark') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (theme) await page.addInitScript((t) => { try { localStorage.setItem('portfolio-theme', t); } catch {} }, theme);
  const res = await page.goto(path);
  expect(res!.status(), `GET ${path}`).toBe(200);
}
// Straight and curly quotes are the same word; spaces are collapsed.
const flat = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const mainText = async (page: Page) => flat(await page.locator('main').innerText());

// Public biography, job titles and personal details kept in this edition.
const ABOUT_COPY = [
  // My approach
  'My approach',
  'I build what I design.',
  'I put early prototypes in front of the people who use them. Then I work through their feedback with product and engineering.',
  // Experience
  'Career', 'Experience',
  'uoaui.ai', 'Designer + Builder', '2026 to present',
  'I designed and built a visual web builder for designers. Its UI Kit and private-preview Builder support Salt, Material 3, Fluent 2, Carbon and the uoaui system.',
  'Barclays, London',
  'Sole designer on FX, covering trader, sales, ops, institutional and corporate-client surfaces. Leading a design system refactor across the platform. Most visual work is under NDA; happy to walk through it in an interview.',
  'J.P. Morgan, London',
  'I led UI for Fusion Analytics, defining components and accessibility patterns in Salt. Before Fusion, I led UI on Deal Model with two UX designers and teams across custody operations, sales, legal and product.',
  'Pegasus Global Travel, London', 'Graphic Designer', '2015',
  'Designed the company website end to end, plus promotional assets and video content. Brought the brand into one system across channels.',
  'Genuine C&C Inc, Taiwan', 'Visual Designer & Web Developer', '2011 to 2015',
  'Designed and maintained the B2B platform. Built the corporate website front-end. Led UI/UX direction for a client-facing network platform.',
  'Eastern Shine Production Co., Ltd.', 'Website Designer, Graphic Designer', '2011',
  'Designed web platforms with a usability focus. Art-directed a government video project from concept to delivery.',
  'Reeborn Information Co., Ltd.', 'Website Designer', '2008 to 2010',
  'Designed corporate visual identity and web platform interfaces. Produced digital content and product photography for e-commerce.',
  // Expertise
  'Capabilities', 'Expertise',
  'AI-assisted product design', 'Design strategy for enterprise software', 'Visual design at high fidelity',
  'Design systems (advanced Figma)', 'Research with expert users', 'Design mentoring & leadership',
  'Multi-stakeholder design decisions', 'Accessibility (WCAG 2.1 AA)', 'Trading platform UI/UX', 'Data visualisation',
  // The old home page's About section
  'Who I am',
  'Designing what traders and analysts use every day.',
  '15 yrs', 'In design, ten of them in fintech',
  '9 yrs', 'At J.P. Morgan, ending as Digital Product Designer VP',
  'AA WCAG', 'The standard I design to',
  'Shipping. Design system at Barclays across FX and MarketsOne.',
  'Reading. Designing Machine Learning Systems by Chip Huyen.',
  'Writing. The design system is the contract.',
  'Experimenting. uoaui.ai in private alpha.',
  'Outside work',
  'Based just outside London, a 40-minute ride from King’s Cross.',
  'Taiwan-born. English and Mandarin.',
  'Married with two kids, plus one fluffy cat called Quorra.',
  'Soya latte, extra shot. Strong leaf tea on design days.',
  // The "Let's Talk." block moved to the shared footer (tests/contact.spec.ts covers it).
].map(flat);

const ABOUT_INTRO = flat("I’m Shannon Hecker, a product designer in London. I lead design for FX and MarketsOne at Barclays.");

// Real characters (spaces included) per full line of the long paragraphs on the page.
// Every character is placed by its own client rect; lines are the distinct vertical
// positions; each paragraph's last (short) line is left out.
async function lineLength(page: Page) {
  return page.evaluate(() => {
    const full: number[] = [];
    let paragraphs = 0;
    for (const p of document.querySelectorAll<HTMLElement>('.about-page .about-prose')) {
      const perLine: { y: number; n: number }[] = [];
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        for (let i = 0; i < node.length; i++) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const r = range.getClientRects()[0];
          if (!r) continue;
          const y = r.top + r.height / 2;
          const line = perLine.find((l) => Math.abs(l.y - y) < 10);
          if (line) line.n += 1; else perLine.push({ y, n: 1 });
        }
      }
      if (perLine.length < 3) continue;
      paragraphs += 1;
      for (const l of perLine.slice(0, -1)) full.push(l.n);
    }
    return { average: full.reduce((a, b) => a + b, 0) / Math.max(full.length, 1), paragraphs };
  });
}

test.describe('/about', () => {
  test('has one h1 "About me" and the page title', async ({ page }) => {
    await open(page, '/about');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'About me', exact: true })).toBeVisible();
    await expect(page).toHaveTitle('About me · Shannon Hecker');
  });

  test('page head shares the large Writing title style', async ({ page }) => {
    const sizes: Record<string, number> = {};
    for (const path of ['/writing', '/about']) {
      await open(page, path);
      sizes[path] = await page.locator('main h1').evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
    }
    expect(sizes['/about']).toBe(sizes['/writing']);
  });

  test('the opening introduces Shannon and her current work', async ({ page }) => {
    await open(page, '/about');
    expect(await mainText(page)).toContain(ABOUT_INTRO);
  });

  test('states the corrected titles and dates', async ({ page }) => {
    await open(page, '/about');
    const text = await mainText(page);
    for (const s of ['Lead Product Designer', 'User Experience Designer', 'Digital Product Designer VP']) expect(text, s).toContain(s);
    // Barclays from Sep 2025; J.P. Morgan in two roles, each with its own dates.
    const barclays = page.locator('.about-job', { hasText: 'Barclays, London' });
    expect(flat(await barclays.innerText())).toContain('Lead Product Designer');
    expect(flat(await barclays.innerText())).toContain('Sep 2025 to present');
    const jpm = flat(await page.locator('.about-job', { hasText: 'J.P. Morgan, London' }).innerText());
    expect(jpm).toContain('User Experience Designer');
    expect(jpm).toContain('Aug 2016 to Jan 2023');
    expect(jpm).toContain('Digital Product Designer VP');
    expect(jpm).toContain('Feb 2023 to Sep 2025');
    // Education, as the owner's facts state it.
    const edu = flat(await page.locator('.about-education').innerText());
    expect(edu).toContain('Ling Tung University, Taiwan');
    expect(edu).toContain('BA Digital Media Arts & Management');
    expect(edu).toContain('2008 to 2010');
    expect(edu).toContain('London Metropolitan University');
    expect(edu).toContain('MA Digital Media');
    expect(edu).toContain('2015 to 2016');
  });

  test('never says the old titles', async ({ page }) => {
    await open(page, '/about');
    const html = flat(await page.content());
    const text = await mainText(page);
    for (const banned of ['Senior Product Designer', 'Vice President, Product Design', 'Design engineer at Barclays', 'Design engineer', 'VP Product Design']) {
      expect(text, `visible: ${banned}`).not.toContain(banned);
      expect(html, `markup: ${banned}`).not.toContain(banned);
    }
  });

  test('preserves the edited biography and career details', async ({ page }) => {
    await open(page, '/about');
    const text = await mainText(page);
    const missing = ABOUT_COPY.filter((w) => !text.includes(w));
    expect(missing).toEqual([]);
  });

  test('the old order of sections is kept: approach, experience, expertise', async ({ page }) => {
    await open(page, '/about');
    const text = await mainText(page);
    const at = (s: string) => text.indexOf(flat(s));
    expect(at('My approach')).toBeGreaterThan(-1);
    expect(at('My approach')).toBeLessThan(at('Experience'));
    expect(at('Experience')).toBeLessThan(at('Expertise'));
    expect(at('Expertise')).toBeLessThan(at('Education'));
    expect(at('Education')).toBeLessThan(at('Outside work'));
    // The page ends once: the contact block is the footer's, after the last section.
    await expect(page.locator('main #contact, .about-close')).toHaveCount(0);
    const body = flat(await page.locator('body').innerText());
    expect(body.indexOf('Outside work')).toBeLessThan(body.indexOf(flat('Let’s Talk.')));
  });

  test('the Resume link is the CV and the PDF is served', async ({ page, request }) => {
    await open(page, '/about');
    const cv = page.locator('main a[href="/assets/CV_ShannonH.pdf"]');
    await expect(cv.first()).toBeVisible();
    await expect(cv.first()).toContainText('Résumé');
    const res = await request.get('/assets/CV_ShannonH.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  });

  test('contact links: LinkedIn, email, and the close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/about');
    await expect(page.locator('main a[href="https://www.linkedin.com/in/shannonhecker"]').first()).toBeVisible();
    // The intro's own Email link stays in main; the "Let's Talk." block is the footer's.
    await expect(page.locator('main a[href="mailto:shannonheckerchen@gmail.com"]')).toHaveCount(1);
    const contactLinks = page.locator('.about-links a');
    await expect(contactLinks.locator('svg[aria-hidden="true"]:visible')).toHaveCount(3);
    for (const link of await contactLinks.all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const close = page.locator('footer #contact');
    await expect(close).toHaveCount(1);
    await expect(close.getByRole('heading', { name: 'Let’s Talk.' })).toBeVisible();
    await expect(close.locator('a[href^="mailto:"]')).toContainText('Email me directly');
  });

  test('the old Writing link goes to the essay', async ({ page }) => {
    await open(page, '/about');
    await expect(page.locator('main a[href="/writing/the-design-system-is-the-contract"]')).toBeVisible();
  });

  test('has no chat on it, and no job-seeking markup', async ({ page }) => {
    await open(page, '/about');
    await expect(page.locator('#ask, [data-ask], textarea')).toHaveCount(0);
    const text = flat(await page.locator('body').innerText());
    expect(text).not.toContain("I'm Shannon's AI");
    const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const joined = ld.join(' ');
    expect(joined).toContain('"Person"');
    expect(joined).toMatch(/"AboutPage"|"ProfilePage"/);
    expect(joined).not.toMatch(/seeks|jobSeeker|JobPosting|hiringOrganization|openToWork/i);
    expect(joined).not.toContain('Senior Product Designer');
  });

  test('the photo: alt text, loads, and keeps its proportions', async ({ page }) => {
    await open(page, '/about');
    const photo = page.locator('main .about-photo img');
    await expect(photo).toHaveCount(1);
    const alt = await photo.getAttribute('alt');
    expect(alt && alt.trim().length).toBeGreaterThan(10);
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    const m = await photo.evaluate((i: HTMLImageElement) => {
      const r = i.getBoundingClientRect();
      return { fit: getComputedStyle(i).objectFit, nw: i.naturalWidth, nh: i.naturalHeight, w: r.width, h: r.height };
    });
    expect(m.fit).not.toBe('cover');
    expect(Math.abs(m.w / m.h - m.nw / m.nh)).toBeLessThan(0.01);
  });

  test('nav About is the current page', async ({ page }) => {
    await open(page, '/about');
    await expect(page.locator('.nav a.l', { hasText: /^About$/ })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.nav a.l[aria-current]')).toHaveCount(1);
  });

  test('is canonical on the public host and in the sitemap', async ({ page, request }) => {
    await open(page, '/about');
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`${HOST}/about`);
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain(`<loc>${HOST}/about</loc>`);
  });

  test('opens in dark on a first visit', async ({ page }) => {
    await open(page, '/about', null);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('long paragraphs hold a 55 to 80 character measure on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, '/about');
    const { average, paragraphs } = await lineLength(page);
    expect(paragraphs).toBeGreaterThanOrEqual(2);
    expect(average, `average ${average.toFixed(1)}`).toBeGreaterThanOrEqual(55);
    expect(average, `average ${average.toFixed(1)}`).toBeLessThanOrEqual(80);
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`axe: no serious or critical violations in ${theme}`, async ({ page }) => {
      await open(page, '/about', theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
    });
  }

  for (const width of [390, 768, 1024, 1440]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, '/about');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }

  test('the Now section carries no date in its heading', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#now-title')).toHaveText('Now');
  });

  test('no dash in anything a visitor reads', async ({ page }) => {
    await open(page, '/about');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[–—]/);
  });
});
