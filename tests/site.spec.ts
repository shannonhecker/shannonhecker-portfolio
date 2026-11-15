import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

test('hero renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/I design tools\s*where mistakes\s*cost money\./);
  await expect(page.locator('.hero-art .game-poster img')).toBeVisible();
});

test('header glass follows scrolling in both themes and keeps links usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/panel');
  const nav = page.locator('.nav');
  const filter = () => nav.evaluate(el => getComputedStyle(el).backdropFilter);
  for (const dark of [false, true]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).not.toHaveClass(/solid/);
    const theme = page.getByRole('switch', { name: 'Dark mode' });
    if (await theme.getAttribute('aria-checked') !== String(dark)) await theme.click();
    expect(await filter()).toBe('none');
    const contact = nav.getByRole('link', { name: 'Contact', exact: true });
    await contact.hover();
    expect((await new AxeBuilder({ page }).include('.nav .cta').withTags(WCAG).analyze()).violations).toEqual([]);
    await contact.focus();
    expect((await new AxeBuilder({ page }).include('.nav .cta').withTags(WCAG).analyze()).violations).toEqual([]);
    await page.mouse.move(0, 300);

    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(nav).toHaveClass(/solid/);
    expect(await filter()).toContain('blur(16px)');
    expect(await nav.evaluate(el => getComputedStyle(el).backgroundColor)).toContain('0.78');
    await expect(nav.getByRole('link', { name: 'FX', exact: true })).toBeInViewport();
    await contact.hover();
    expect((await new AxeBuilder({ page }).include('.nav').withTags(WCAG).analyze()).violations).toEqual([]);
  }
  await nav.getByRole('link', { name: 'FX', exact: true }).click();
  await expect(page).toHaveURL(/\/fx$/);
});

for (const [label, id] of [['Work', 'work'], ['How I work', 'how']]) {
  test(`nav link "${label}" scrolls to #${id}`, async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport({ timeout: 5000 });
  });
}

for (const [label, path, title] of [
  ['FX', '/fx', 'FX execution analytics'], ['Fusion', '/fusion', 'Fusion analytics dashboard'],
  ['Winking Star', '/winking-star', 'Winking Star'], ['uoaui.ai', '/uoaui', 'uoaui.ai'], ['Deal Model', '/deal-model', 'Deal Model'],
]) {
  test(`nav link "${label}" opens ${path} and marks it current`, async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.locator('.nav').getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
  });
}

test('each case page ends with the next case', async ({ page }) => {
  await page.goto('/uoaui');
  const next = page.locator('.next-case a.row');
  await expect(next).toHaveAttribute('href', '/fx');
  await next.click();
  await expect(page).toHaveURL(/\/fx$/);
});

test('Winking Star tick demo reaches 6 of 6', async ({ page }) => {
  await page.goto('/winking-star#ws-loops');
  const group = page.getByRole('group', { name: 'Tick a routine' });
  for (const b of await group.getByRole('button').all()) await b.click();
  await expect(page.locator('#demo-stars')).toHaveText('6 of 6 stars');
  await expect(group.getByRole('button', { pressed: true })).toHaveCount(6);
});

test('links home go to /panel, so the panel line stays', async ({ page }) => {
  await page.goto('/fx');
  await expect(page.locator('.nav a.brand')).toHaveAttribute('href', '/panel');
  await expect(page.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('href', '/panel#work');
  await page.locator('.nav a.brand').click();
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByText('Portfolio for the Revolut design panel: product design, heading into AI')).toBeVisible();
});

test('private share: every page stays out of search', async ({ page }) => {
  for (const path of ['/', '/fx', '/fusion', '/uoaui', '/deal-model', '/winking-star', '/panel', '/build']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  }
});

test('/panel carries the panel line and stays out of the index', async ({ page }) => {
  await page.goto('/panel');
  await expect(page.getByText('Portfolio for the Revolut design panel: product design, heading into AI')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://shannonhecker-work.vercel.app/');
});

test('build log remains directly available', async ({ page }) => {
  await page.goto('/build');
  await expect(page.getByRole('heading', { level: 1, name: 'Build log' })).toBeVisible();
});

test('every external link opens in a new tab safely', async ({ page }) => {
  await page.goto('/');
  const ext = page.locator('a[href^="http"]');
  expect(await ext.count()).toBeGreaterThan(0);
  for (const a of await ext.all()) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

for (const width of [320, 390, 820, 1440]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
}

for (const [width, path] of [390, 820, 1440].flatMap((w) => ['/', '/fx', '/fusion', '/winking-star', '/deal-model', '/uoaui'].map((p) => [w, p] as const))) {
  test(`axe: zero violations at ${width}px on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // scan the settled page, not mid-reveal
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('page is complete and still', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js'))).toBe(false);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('.rv, .split .wd, .hero h1 .ln span')].filter((el) => getComputedStyle(el).opacity !== '1').length,
    );
    expect(hidden).toBe(0);
    expect(await page.locator('.idle-blink').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await page.goto('/winking-star');
    await expect(page.locator('.theme-gallery img')).toHaveCount(4);
    expect(await page.locator('.theme-gallery').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  });
});

test.describe('JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });
  test('all content is readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const id of ['work', 'how', 'links']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id} h2`).first()).toBeVisible();
    }
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('.rv, .split .wd')].filter((el) => getComputedStyle(el).opacity !== '1').length,
    );
    expect(hidden).toBe(0);
    // Product screens remain readable without a carousel or JavaScript.
    await page.goto('/winking-star');
    await expect(page.getByRole('heading', { name: 'The iPhone flow', exact: true })).toBeVisible();
    await expect(page.locator('.ws-app-steps figure')).toHaveCount(4);
  });
});

test.describe('mobile nav', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('offers every project in a visible menu and keeps the current section marked', async ({ page }) => {
    await page.goto('/');
    const button=page.getByRole('button',{name:'Menu',exact:true});
    await expect(button).toBeVisible();
    await expect(page.locator('.nav ul')).toBeHidden();
    await button.click();
    for(const label of ['Work','FX','Fusion','Winking Star','Deal Model','uoaui.ai','How I work']){
      await expect(page.locator('.nav').getByRole('link',{name:label,exact:true})).toBeInViewport();
    }
    await page.keyboard.press('Escape');await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded','false');
    await page.locator('#how').scrollIntoViewIfNeeded();
    await button.focus();await button.click();
    await expect(page.locator('.nav a.l', { hasText: 'How I work' })).toHaveAttribute('aria-current', 'true');
  });
});

test('avatar ambient motion has a persistent pause control', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('.companion-motion');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(btn).toHaveAccessibleName('Resume motion');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('.landing-companion')).toHaveAttribute('data-paused', 'true');
  expect(await page.locator('.idle-blink').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('print output shows every section with nothing hidden', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  expect(await page.locator('.nav').isVisible()).toBe(false);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.rv, .split .wd')].filter((el) => getComputedStyle(el).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
});

test('unknown paths get the 404 page', async ({ page }) => {
  const res = await page.goto('/nope');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /Back to the work/ })).toHaveAttribute('href', '/panel');
});

test('structured data names the person', async ({ page }) => {
  await page.goto('/');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld).toMatchObject({ '@type': 'Person', name: 'Shannon Hecker' });
});

test('no visible placeholders on any page', async ({ page }) => {
  for (const p of ['/', '/fx', '/fusion', '/winking-star', '/deal-model', '/uoaui']) {
    await page.goto(p);
    await expect(page.locator('.todo, .screen')).toHaveCount(0);
    expect(await page.locator('main').innerText()).not.toMatch(/\bTODO\b|__/);
  }
});
