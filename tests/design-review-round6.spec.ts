import { test, expect } from '@playwright/test';

// One focus ring: the same 3px solid ring, in the one --focus colour, on every stop of the home page in the
// light theme. The chat composer (its card shows the ring instead) and the game's own title button (a cream
// ring on a dark scene) are the two deliberate exceptions.
test('home keyboard focus uses one ring: 3px solid in the focus token colour', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'light');
    localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() }));
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const token = await page.evaluate(() => {
    const probe = document.createElement('i');
    probe.style.color = 'var(--focus)';
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  expect(token, 'the --focus token resolves to a colour').toMatch(/^rgb/);
  const seen = new Set<string>();
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      return {
        id: `${e.tagName}.${e.className}|${(e.textContent || '').trim().slice(0, 20)}`,
        composer: e.classList.contains('ask-input'),
        game: !!e.closest('.game-title-start'),
        width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor,
      };
    });
    if (!stop) continue;
    if (seen.has(stop.id)) break; // the tab order has wrapped
    seen.add(stop.id);
    if (stop.composer || stop.game) continue;
    expect(stop.width, stop.id).toBe('3px');
    expect(stop.style, stop.id).toBe('solid');
    expect(stop.color, stop.id).toBe(token);
  }
  expect(seen.size, 'the whole page was walked').toBeGreaterThan(30);
});

// The 404 avatar's dashed floor and the home companion's floor are whole dashes at both ends, at every width.
async function floorRuns(page: import('@playwright/test').Page, selector: string, pseudo: boolean, rgb: [number, number, number]) {
  const box = await page.locator(selector).first().boundingBox();
  const png = await page.screenshot({ clip: box!, animations: 'disabled' });
  return page.evaluate(async ({ b64, rgb, pseudo }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d')!;
    g.drawImage(img, 0, 0);
    // The row with the most floor-coloured pixels is the floor; its runs are the dashes.
    let bestRow = -1, bestCount = 0;
    const px = g.getImageData(0, 0, c.width, c.height).data;
    const near = (i: number) => Math.abs(px[i] - rgb[0]) < 14 && Math.abs(px[i + 1] - rgb[1]) < 14 && Math.abs(px[i + 2] - rgb[2]) < 14;
    for (let y = 0; y < c.height; y++) { let n = 0; for (let x = 0; x < c.width; x++) if (near((y * c.width + x) * 4)) n++; if (n > bestCount) { bestCount = n; bestRow = y; } }
    const runs: number[] = []; let run = 0;
    for (let x = 0; x < c.width; x++) { if (near((bestRow * c.width + x) * 4)) run++; else if (run) { runs.push(run); run = 0; } }
    if (run) runs.push(run);
    return { runs, scale: img.width / (img.width) , pseudo };
  }, { b64: png.toString('base64'), rgb, pseudo });
}

test('the 404 floor starts and ends on a whole dash at every width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { localStorage.setItem('portfolio-theme', 'light'); localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })); });
  for (const width of [1180, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/this-page-does-not-exist');
    await page.evaluate(() => document.fonts.ready);
    const { runs } = await floorRuns(page, '.not-found-stage', true, [0xcf, 0xae, 0x9c]);
    expect(runs.length, `${width}px has a row of dashes`).toBeGreaterThan(8);
    const mid = [...runs].sort((a, b) => a - b)[Math.floor(runs.length / 2)];
    expect(Math.abs(runs[0] - mid), `${width}px first dash ${runs[0]} vs ${mid}`).toBeLessThanOrEqual(1);
    expect(Math.abs(runs[runs.length - 1] - mid), `${width}px last dash ${runs[runs.length - 1]} vs ${mid}`).toBeLessThanOrEqual(1);
  }
});

test('the home companion floor is a whole number of dashes too', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { localStorage.setItem('portfolio-theme', 'light'); localStorage.setItem('portfolio-analytics-v1', JSON.stringify({ choice: 'no', at: Date.now() })); });
  for (const width of [390, 1180, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const path = page.locator('.companion-path').first();
    if (!(await path.isVisible())) continue;
    const style = await path.evaluate((e) => { const cs = getComputedStyle(e); return { repeat: cs.backgroundRepeat, size: cs.backgroundSize, w: e.getBoundingClientRect().width }; });
    expect(style.repeat, `${width}px floor tiles round to whole dashes`).toContain('round');
    expect(style.size).toBe('18px 6px');
  }
});

// Outcome values in one row share a top and their labels share a line.
test('algo-center outcomes sit on one line at 1440', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work/algo-center');
  await page.evaluate(() => document.fonts.ready);
  const tops = await page.locator('.earlier-outcomes .value').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height) }; }));
  expect(tops.length).toBe(3);
  expect(new Set(tops.map((t) => t.top)).size, JSON.stringify(tops)).toBe(1);
  expect(new Set(tops.map((t) => t.h)).size, 'each value is one line').toBe(1);
  const labels = await page.locator('.earlier-outcomes .label').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(labels).size, 'labels share a line').toBe(1);
});

test('the fifteen portfolio tiles form five desktop rows', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work');
  const tops = await page.locator('.all-gallery > a').evaluateAll(tiles => tiles.map(tile => Math.round(tile.getBoundingClientRect().top)));
  expect(tops).toHaveLength(15);
  for (let i = 0; i < tops.length; i += 3) expect(new Set(tops.slice(i, i + 3)).size).toBe(1);
  expect(new Set(tops).size).toBe(5);
});

test('archive artwork stays whole, full-width and lazy on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  const tiles = page.locator('.archive-card');
  await expect(tiles).toHaveCount(10);
  for (const tile of await tiles.all()) {
    const img = tile.locator('img');
    await expect(img).toHaveAttribute('loading','lazy');
    await expect(img).toHaveCSS('object-fit','contain');
    expect((await img.boundingBox())!.width).toBe((await tile.boundingBox())!.width);
  }
});

// A wide figure on a phone fades at the edge where more lies beyond; no fade when it all fits.
test('wide figures show an edge fade on a phone, and none at the ends', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work/tripup');
  const pan = page.locator('.earlier-pan[tabindex]').first();
  await pan.scrollIntoViewIfNeeded();
  const state = async () => pan.evaluate((e) => { const s = e.parentElement!; return { l: 'fadeL' in s.dataset, r: 'fadeR' in s.dataset }; });
  await pan.evaluate((e) => { e.scrollLeft = 0; });
  await expect.poll(state).toEqual({ l: false, r: true });
  await pan.evaluate((e) => { e.scrollLeft = (e.scrollWidth - e.clientWidth) / 2; });
  await expect.poll(state).toEqual({ l: true, r: true });
  await pan.evaluate((e) => { e.scrollLeft = e.scrollWidth; });
  await expect.poll(state).toEqual({ l: true, r: false });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(async () => page.evaluate(() => document.querySelectorAll('.earlier-stage[data-fade-l],.earlier-stage[data-fade-r]').length)).toBe(0);
});

// The earlier fact grid fills its row: no empty cell, whatever the number of facts.
test('earlier facts fill the row at 1440 and 1180', async ({ page }) => {
  for (const width of [1440, 1180]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ['stock-dashboard', 'tripup', 'design-system']) {
      await page.goto(`/work/${slug}`);
      const rect = await page.locator('.project-facts').evaluate((dl) => {
        const box = dl.getBoundingClientRect();
        const rows = new Map<number, { l: number; r: number }>();
        [...dl.children].forEach((c) => { const r = c.getBoundingClientRect(); const k = Math.round(r.top); const cur = rows.get(k) ?? { l: 1e9, r: -1e9 }; rows.set(k, { l: Math.min(cur.l, r.left), r: Math.max(cur.r, r.right) }); });
        return { left: box.left, right: box.right, rows: [...rows.values()] };
      });
      for (const row of rect.rows) { expect(Math.abs(row.l - rect.left), `${slug} ${width} left`).toBeLessThan(2); expect(Math.abs(row.r - rect.right), `${slug} ${width} right`).toBeLessThan(2); }
    }
  }
});

// About: the rail runs unbroken; a job's divider starts at the content column, to the right of the rail.
test('about timeline dividers start beside the rail, not across it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/about');
  const geo = await page.evaluate(() => {
    const jobs = [...document.querySelectorAll<HTMLElement>('.about-job')];
    const second = jobs[1];
    const rail = second.querySelector('.about-rail')!.getBoundingClientRect();
    const main = second.querySelector('.about-job-main')!.getBoundingClientRect();
    const before = getComputedStyle(second, '::before');
    const left = second.getBoundingClientRect().left;
    return { railRight: rail.right, mainLeft: main.left, borderTop: getComputedStyle(second).borderTopWidth, beforeLeft: before.left, beforeWidth: parseFloat(before.width), liLeft: left, gridLeft: main.left };
  });
  expect(geo.borderTop).toBe('0px');
  expect(Math.abs(geo.mainLeft - geo.railRight)).toBeLessThan(2);
  expect(geo.beforeWidth).toBeGreaterThan(300);
});
