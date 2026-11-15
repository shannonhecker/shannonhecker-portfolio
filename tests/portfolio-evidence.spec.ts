import { test, expect } from '@playwright/test';

for (const path of ['/uoaui', '/fusion']) {
test(`${path}: chapter jumps stay in place while deferred product screenshots load`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/*', async route => {
    if (route.request().resourceType() === 'image') await held;
    await route.continue();
  });
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const images = page.locator('.product-capture .shot img');
    const unreserved = await images.evaluateAll(elements => elements.filter(el => {
      const img = el as HTMLImageElement;
      const box = img.getBoundingClientRect();
      return !box.height || Math.abs(box.width / box.height - Number(img.getAttribute('width')) / Number(img.getAttribute('height'))) > .02;
    }).map(el => el.getAttribute('alt')));
    expect(unreserved).toEqual([]);
    await page.locator('.section-open').click();
    await page.getByRole('navigation', { name: 'Case study sections' }).getByRole('link', { name: 'Decision map', exact: true }).click();
    const heading = page.getByRole('heading', { name: 'Decision map', exact: true });
    await expect(heading).toBeInViewport();
    const before = (await heading.boundingBox())!.y;
    release();
    await images.evaluateAll(async elements => {
      await Promise.all(elements.map(async el => {
        const img = el as HTMLImageElement;
        img.loading = 'eager';
        await img.decode();
      }));
    });
    await expect(heading).toBeInViewport();
    expect(Math.abs((await heading.boundingBox())!.y - before)).toBeLessThan(4);
  } finally {
    release();
  }
});

}

for (const path of ['/fx', '/fusion', '/winking-star', '/deal-model', '/uoaui']) {
  test(`${path}: every case navigation target exists and evidence remains readable`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const nav = page.getByRole('navigation', { name: 'Case study sections' });
    for (const link of await nav.locator('a[href^="#"]').all()) {
      const href = (await link.getAttribute('href'))!;
      await expect(page.locator(href)).toHaveCount(1);
    }
    await nav.locator('.section-open').click();
    await nav.getByRole('link', { name: 'Decision map', exact: true }).click();
    await expect(nav.locator('dialog')).not.toHaveAttribute('open', '');
    await expect(page.getByRole('heading', { name: 'Decision map', exact: true })).toBeInViewport();
    for (const width of [320, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.locator('.decision-map li, .process-journey li, .persona-roles article, .authored-decisions li, .authored-journey li, .authored-persona').evaluateAll((els) =>
        els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent?.slice(0, 50)),
      );
      expect(overflow).toEqual([]);
    }
  });
}

test('the game cover stays static and makes no video request under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (r) => { if (r.url().includes('working-order-cover.mp4')) requests.push(r.url()); });
  await page.goto('/panel');
  await page.locator('.game-poster').hover();
  await page.getByRole('button', { name: 'Start adventure' }).focus();
  await expect(page.locator('.game-poster img')).toBeVisible();
  await expect(page.locator('.game-cover-motion')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('case evidence keeps its full image proportions after loading', async ({ page }) => {
  for (const path of ['/fx', '/fusion', '/uoaui', '/deal-model', '/winking-star']) {
    await page.goto(path);
    await page.locator('.evidence img, .phone img, #ws-hero .shot img, .fx-original-flow img').evaluateAll(async (imgs) => {
      await Promise.all(imgs.map(async (el) => { const img = el as HTMLImageElement; img.loading = 'eager'; await img.decode(); }));
    });
    const cropped = await page.locator('.evidence img, .phone img, #ws-hero .shot img, .fx-original-flow img').evaluateAll((imgs) => imgs.filter((el) => {
      const img = el as HTMLImageElement, box = img.getBoundingClientRect();
      return Math.abs(box.width / box.height - img.naturalWidth / img.naturalHeight) > 0.02;
    }).map((el) => el.getAttribute('alt')));
    expect(cropped).toEqual([]);
  }
});


test('current product recordings stay paused until requested and use their full frame', async ({ page }) => {
  for (const path of ['/fx', '/fusion', '/uoaui']) {
    await page.goto(path);
    const video = page.locator('.demo video');
    await video.scrollIntoViewIfNeeded();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video.locator('source')).toHaveAttribute('src', /-current\.(webm|mp4)$/);
    await video.evaluate(async (v: HTMLVideoElement) => { await v.play(); v.pause(); });
    const dimensions = await video.evaluate((v: HTMLVideoElement) => ({ natural: v.videoWidth / v.videoHeight, rendered: v.clientWidth / v.clientHeight }));
    expect(Math.abs(dimensions.natural - dimensions.rendered)).toBeLessThan(0.02);
    for (const link of await page.getByRole('link', { name: /^View full size/ }).all()) {
      const response = await page.request.get((await link.getAttribute('href'))!);
      expect(response.ok()).toBe(true);
    }
  }
});

test('section drawer supports keyboard, outside dismissal and small screens', async ({ page }) => {
  await page.goto('/fx');
  await page.getByRole('button', { name: 'No thanks' }).click();
  const opener = page.locator('.section-open');
  const drawer = page.getByRole('dialog', { name: 'Sections' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 640 });
    await opener.click();
    await expect(drawer).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/avatar-cursor-active/);
    await expect(opener).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Close sections' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(drawer.getByRole('link', { name: 'All projects' })).toBeFocused();
    await drawer.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
    const box = (await drawer.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(Math.abs(box.x + box.width - width)).toBeLessThan(1);
    expect(box.height).toBe(640);
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await opener.click();
    await page.mouse.click(5, 320);
    await expect(drawer).not.toBeVisible();
    await expect(opener).toBeFocused();
    await opener.click();
    await page.getByRole('button', { name: 'Close sections' }).click();
    await expect(drawer).not.toBeVisible();
  }
});
