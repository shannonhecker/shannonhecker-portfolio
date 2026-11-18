import { test, expect } from '@playwright/test';

test('selected projects show the authored artwork and let visitors open it at full size', async ({ page }) => {
  for (const path of ['/fx', '/fusion', '/deal-model', '/winking-star', '/uoaui']) {
    await page.goto(path);
    const images = page.locator('.overview-art figure img');
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((el: HTMLImageElement) => el.decode());
      expect(await image.getAttribute('alt')).toBeTruthy();
      const link = image.locator('xpath=ancestor::a[1]');
      await expect(link).toHaveAttribute('target', '_blank');
      expect((await page.request.get((await link.getAttribute('href'))!)).ok()).toBe(true);
    }
  }
});
