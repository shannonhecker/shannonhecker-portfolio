import { test, expect } from '@playwright/test';

test('the game cover stays static and makes no video request under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (r) => { if (r.url().includes('working-order-cover.mp4')) requests.push(r.url()); });
  await page.goto('/');
  await page.locator('.game-poster').hover();
  await page.getByRole('button', { name: 'Start adventure' }).focus();
  await expect(page.locator('.game-poster img')).toBeVisible();
  await expect(page.locator('.game-cover-motion')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('case evidence keeps its full image proportions after loading', async ({ page }) => {
  for (const path of ['/fx', '/fusion', '/uoaui', '/deal-model', '/winking-star']) {
    await page.goto(path);
    await page.locator('.overview-art img').evaluateAll(async (imgs) => {
      await Promise.all(imgs.map(async (el) => { const img = el as HTMLImageElement; img.loading = 'eager'; await img.decode(); }));
    });
    const cropped = await page.locator('.overview-art img').evaluateAll((imgs) => imgs.filter((el) => {
      const img = el as HTMLImageElement, box = img.getBoundingClientRect();
      return Math.abs(box.width / box.height - img.naturalWidth / img.naturalHeight) > 0.02;
    }).map((el) => el.getAttribute('alt')));
    expect(cropped).toEqual([]);
  }
});
