import { expect, test, type Page } from '@playwright/test';

// Hold the module responses while leaving the actual site CSS and synchronous
// boot scripts in place. A fresh visitor can be in this state on a slow network.
async function beforeModules(page: Page, path: string, check: () => Promise<void>) {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/_astro/*.js', async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(path, { waitUntil: 'commit' });
    await page.waitForFunction(() => document.readyState !== 'loading' &&
      Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).every(link => link.sheet));
    await page.evaluate(() => {
      // Observe the first frame even when the runner takes time to schedule the assertion.
      for (const animation of document.getAnimations()) {
        animation.pause();
        animation.currentTime = 0;
      }
    });
    await check();
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
}

test('a new phone visitor can read the headline and use the work link before modules arrive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await beforeModules(page, '/', async () => {
    const heading = page.getByRole('heading', { level: 1, name: 'I design tools where mistakes cost money.' });
    const actionable = page.getByRole('link', { name: 'Explore my work' });

    for (const el of [heading, ...await heading.locator('.hero-word').all(), actionable]) {
      expect(await el.evaluate(node => node.checkVisibility({ opacityProperty: true, visibilityProperty: true }))).toBe(true);
    }
    await expect(actionable).toBeInViewport({ ratio: 1 });
    await actionable.click({ timeout: 1500, noWaitAfter: true });
    await expect(page).toHaveURL(/#work$/);
  });
});

test('the first project image and title fit above the fresh phone consent notice before modules arrive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await beforeModules(page, '/work', async () => {
    const card = page.locator('main a[href="/fx"]').first();
    const notice = page.locator('#analytics-choice');
    expect(await notice.isVisible()).toBe(true);
    const bottom = (await notice.boundingBox())!.y;
    await card.locator('img').evaluate((image: HTMLImageElement) => image.decode());
    for (const el of [card.locator('img'), card.getByRole('heading')]) {
      expect(await el.evaluate(node => node.checkVisibility({ opacityProperty: true, visibilityProperty: true }))).toBe(true);
      const bounds = (await el.boundingBox())!;
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(bottom);
    }
  });
});
