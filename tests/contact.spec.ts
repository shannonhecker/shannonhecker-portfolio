import { test, expect } from '@playwright/test';

// B1: the nav's Contact leads somewhere you can contact. The "Let's Talk." block lives
// in the shared footer, once per page, with a working mailto; the address itself is never
// shown as text.
const MAIL = 'mailto:shannonheckerchen@gmail.com';
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

for (const p of PAGES) {
  test.describe(`contact on ${p.type} (${p.path})`, () => {
    test('has exactly one #contact, in the footer, with a working mailto', async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('#contact')).toHaveCount(1);
      const block = page.locator('footer #contact');
      await expect(block).toHaveCount(1);
      await expect(block.getByRole('heading', { name: 'Let’s Talk.' })).toHaveCount(1);
      const mail = block.locator('a[href^="mailto:"]');
      await expect(mail).toHaveCount(1);
      await expect(mail).toHaveAttribute('href', MAIL);
      await expect(mail).toContainText('Email me directly');
    });

    test('the block sits above Live links and the nav Contact button targets it', async ({ page }) => {
      await page.goto(p.path);
      const order = await page.evaluate(() => {
        const c = document.querySelector('#contact')!;
        const l = document.querySelector('#links .foot')!;
        return !!(c.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(order).toBe(true);
      await expect(page.locator('.nav a.cta')).toHaveAttribute('href', '#contact');
    });

    test('Live links has an Email row with the same mailto, and the address is not shown as text', async ({ page }) => {
      await page.goto(p.path);
      const row = page.locator('#links .links a[href^="mailto:"]');
      await expect(row).toHaveCount(1);
      await expect(row).toHaveAttribute('href', MAIL);
      await expect(row).toContainText('Email');
      const text = await page.locator('footer#links').innerText();
      expect(text).not.toContain('gmail');
    });
  });
}

test('clicking Contact in the nav scrolls the block into view (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work');
  await page.locator('.nav a.cta').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact h2')).toBeInViewport();
});

test('the title is no larger than the page heads', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const size = (sel: string) => page.locator(sel).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(await size('#contact h2')).toBeLessThanOrEqual(await size('main h1'));
});

test('the footer statement sits clearly second under "Let’s Talk."', async ({ page }) => {
  for (const [w, minRatio] of [[1440, 1.8], [390, 1.4]] as const) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/about');
    const size = (sel: string) => page.locator(sel).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const second = await size('#links .big h2');
    expect(await size('#contact h2') / second, `at ${w}`).toBeGreaterThanOrEqual(minRatio);
    if (w === 1440) { expect(second).toBeGreaterThanOrEqual(30); expect(second).toBeLessThanOrEqual(36); }
  }
});
