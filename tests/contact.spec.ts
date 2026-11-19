import { test, expect } from '@playwright/test';

// B1: the nav's Contact leads somewhere you can contact. The "Let's Talk." block lives
// in the shared footer, once per page, with a working mailto; the address itself is never
// shown as text.
const MAIL = 'mailto:shannonheckerchen@gmail.com';
const PAGES = [
  { path: '/', type: 'home' },
  { path: '/how-i-work', type: 'approach' },
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

    test('the footer keeps contact and privacy controls without the Live links directory', async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('.nav a[href="#contact"]')).toHaveCount(1);
      await expect(page.locator('footer .links, footer .foot')).toHaveCount(0);
      await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    });
  });
}

test('clicking Contact in the nav scrolls the block into view (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work');
  await page.locator('.nav a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact h2')).toBeInViewport();
});

test('the title is no larger than the page heads', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const size = (sel: string) => page.locator(sel).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(await size('#contact h2')).toBeLessThanOrEqual(await size('main h1'));
});

test('contact is the only heading in the shared footer', async ({ page }) => {
  await page.goto('/how-i-work');
  await expect(page.locator('footer').getByRole('heading')).toHaveText(['Let’s Talk.']);
});
