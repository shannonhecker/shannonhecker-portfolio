import { test, expect } from '@playwright/test';
import { issue, verify, validateResult, stageLimits, nickname } from '../server/scoreboard';
import { POST as start } from '../api/game-run';
import { POST as submit } from '../api/leaderboard';

test('run receipts reject tampering, expiration and environment replay', () => {
  process.env.KV_REST_API_TOKEN = 'test-only-key';
  process.env.VERCEL_ENV = 'preview';
  const token = issue(0, 10000);
  expect(verify(token, 20000).stage).toBe(0);
  expect(() => verify(token + 'x', 20000)).toThrow();
  expect(() => verify(token, 8000000)).toThrow();
  process.env.VERCEL_ENV = 'production';
  expect(() => verify(token, 20000)).toThrow();
  process.env.VERCEL_ENV = 'preview';
});
test('scores use bounded game data and no supplied score', () => {
  const run = { stage: 0, started: 10000 };
  const valid = { nickname: '', elapsed: 9000, collected: 2, hits: 1, score: 999999 };
  expect(validateResult(valid, run, 20000)).toEqual({ nickname: 'Explorer', score: 140, stage: 0 });
  for (const changed of [{ collected: stageLimits[0].pickups + 1 }, { collected: -1 }, { hits: -1 }, { elapsed: 20000 }, { elapsed: 0 }]) expect(() => validateResult({ ...valid, ...changed }, run, 20000)).toThrow();
  expect(() => nickname('<script>alert(1)</script>')).toThrow();
  expect(() => nickname('someone@example.com')).toThrow();
  expect(nickname('星星')).toBe('星星');
});
test('cross-origin and invalid submissions stop before storage', async () => {
  const req = (path: string, origin: string, body: unknown) => new Request(`https://example.com/api/${path}`, { method:'POST', headers:{ origin, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  expect((await start(req('game-run','https://attacker.test',{stage:0}))).status).toBe(403);
  expect((await start(req('game-run','https://example.com',{stage:900}))).status).toBe(400);
  expect((await submit(req('leaderboard','https://example.com',{token:'forged'}))).status).toBe(400);
});
test('analytics remains blocked before consent and after refusal', async ({ page }) => {
  const google: string[] = [];
  page.on('request', request => { if (/google-analytics|googletagmanager/.test(request.url())) google.push(request.url()); });
  await page.goto('/panel');
  await expect(page.getByRole('heading',{name:'Optional analytics'})).toBeVisible();
  expect(google).toEqual([]);
  await page.getByRole('button',{name:'No thanks',exact:true}).click();
  await page.reload();
  await expect(page.locator('#analytics-choice')).toBeHidden();
  expect(google).toEqual([]);
  await page.getByRole('button',{name:'Analytics settings',exact:true}).click();
  await expect(page.locator('#analytics-choice')).toBeVisible();
});
test('production consent loads one tag and sanitizes page URL; revocation disables collection', async ({ page, request }) => {
  const host = 'https://shannonhecker-work.vercel.app';
  await page.route(`${host}/**`, async route => {
    const url = new URL(route.request().url());
    const response = await request.get(`http://localhost:4329${url.pathname}${url.search}`);
    await route.fulfill({ response });
  });
  let tags = 0;
  await page.route('https://www.googletagmanager.com/**', async route => { tags++; await route.fulfill({ contentType:'text/javascript', body:'' }); });
  await page.goto(`${host}/panel?private=do-not-send`);
  expect(tags).toBe(0);
  await page.getByRole('button',{name:'Allow analytics',exact:true}).click();
  await expect.poll(() => tags).toBe(1);
  const events = await page.evaluate(() => (window as any).dataLayer.map((item: IArguments) => Array.from(item)));
  expect(JSON.stringify(events)).not.toContain('do-not-send');
  expect(events.some((row: unknown[]) => row[0] === 'event' && row[1] === 'page_view')).toBe(true);
  await page.getByRole('button',{name:'Analytics settings',exact:true}).click();
  await page.getByRole('button',{name:'No thanks',exact:true}).click();
  expect(await page.evaluate(() => (window as any)['ga-disable-G-795LXWTYWM'])).toBe(true);
  await page.waitForLoadState('networkidle');
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(tags).toBe(1);
  await page.unrouteAll({ behavior: 'wait' });
});
