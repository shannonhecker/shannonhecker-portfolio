import { test, expect } from '@playwright/test';

// B8: one date format. Essays and the Writing index show "18 April 2026" (ISO stays in
// datetime); ranges on About and in the earlier list use "to", never a hyphen.
test('no essay or index date is shown in ISO form', async ({ page }) => {
  for (const path of ['/writing', '/writing/trust-surfaces-in-ai', '/writing/when-everyone-can-ship', '/writing/the-design-system-is-the-contract']) {
    await page.goto(path);
    const shown = await page.locator('main time').allInnerTexts();
    expect(shown.length, path).toBeGreaterThan(0);
    for (const t of shown) expect(t, path).toMatch(/^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/);
  }
});

test('the date display comes from one shared en-GB formatter', async ({ page }) => {
  await page.goto('/writing/trust-surfaces-in-ai');
  const iso = await page.locator('main time').first().getAttribute('datetime');
  const text = await page.locator('main time').first().innerText();
  expect(text).toBe(new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso!)));
});

test('the gallery leads to the UI Toolkit dates, written as a range', async ({ page }) => {
  await page.goto('/work');
  const row = page.locator('#earlier a[href="/work/ui-toolkit"], a[href="/work/ui-toolkit"]').first();
  await expect(row).toBeVisible();
  expect(await page.locator('main').innerText()).not.toMatch(/\b\d{4}-\d{4}\b/);
  await row.click();
  await expect(page.locator('main')).toContainText('2016 to 2018');
  expect(await page.locator('main').innerText()).not.toMatch(/\b\d{4}-\d{4}\b/);
});

test('About keeps its month-and-year ranges', async ({ page }) => {
  await page.goto('/about');
  const text = await page.locator('main').innerText();
  expect(text).toContain('Sep 2025 to present');
  expect(text).toContain('Aug 2016 to Jan 2023');
});
