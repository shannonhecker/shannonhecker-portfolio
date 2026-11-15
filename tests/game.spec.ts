import { test, expect, type Page } from '@playwright/test';
import { LEVELS } from '../src/game/levels';
import { NODES } from '../src/game/map';
import { T } from '../src/game/tuning';

const state = (page: Page) => page.evaluate(() => (window as unknown as { __game: () => any }).__game());

test('slow game artwork stays behind the loading scene until the map is ready', async({page})=>{
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/game/world-map.webp',async route=>{await gate;await route.continue();});
  await page.goto('/');
  await page.getByRole('button',{name:'Start adventure'}).click();
  await expect(page.locator('.game-loading')).toBeVisible();
  await expect(page.locator('.game-poster')).toBeHidden();
  await expect(page.locator('.play .game')).toHaveAttribute('aria-busy','true');
  release();
  await expect(page.locator('.play .game')).toHaveAttribute('data-state','playing');
  await expect(page.locator('.game-loading')).toBeHidden();
  await expect.poll(async()=> (await state(page)).mode).toBe('map');
});

// Press Play (which opens the career map), then Space to start the first world.
async function boot(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
  await page.keyboard.press('Space');
  await expect.poll(async () => (await state(page)).mode).toBe('level');
  await expect.poll(async () => (await state(page)).grounded).toBe(true);
}

test('large-screen HUD keeps hard pixel edges', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await boot(page);
  const game = page.locator('#game');
  await expect(game).toHaveCSS('image-rendering', 'pixelated');
  const shades = await game.evaluate((el) => {
    const pixels = (el as HTMLCanvasElement).getContext('2d')!.getImageData(8, 6, 48, 10).data;
    const colours = new Set<string>();
    for (let i = 0; i < pixels.length; i += 4) colours.add([...pixels.slice(i, i + 4)].join(','));
    return [...colours];
  });
  // Text and strip only: interpolated edges introduce extra colours.
  expect(shades).toHaveLength(2);
  expect(shades).toContain('48,72,90,255');
});

test('nothing runs until Play is pressed', async ({ page }) => {
  const chunks: string[] = [];
  page.on('request', (r) => { if (/\/_astro\/main\.[^/]+\.js$/.test(r.url())) chunks.push(r.url()); });
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(chunks).toEqual([]);
  await expect(page.locator('.play .game')).toHaveAttribute('data-state', 'poster');
});

test('the game boots on click and the player can jump', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#game')).toBeFocused();
  const before = await state(page);
  expect(before.grounded).toBe(true);
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.keyboard.down('Space');
  await expect.poll(async () => (await state(page)).y, { timeout: 2000 }).toBeLessThan(before.y - 40);
  await page.keyboard.up('Space');
  // Space and arrows belong to the game while it has focus, not to the page.
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
});

test('Escape pauses, and Tab still leaves the game (no keyboard trap)', async ({ page }) => {
  await boot(page);
  await page.keyboard.press('Escape');
  expect((await state(page)).paused).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.locator('#game')).not.toBeFocused();
});

// The AI bridges rise and fall. Run toward each landing rather than holding
// right through the apex: that overshoots the narrow draft platforms on CI.
async function runAiBridges(page: Page) {
  const rows = LEVELS[6].rows;
  const surfaces: {left:number;right:number;row:number}[] = [];
  rows.forEach((line,row) => {
    for (const match of line.matchAll(/D+|#+/g)) {
      const left=match.index!;
      if(match[0][0]==='#' && rows[row-1]?.[left]==='#') continue;
      surfaces.push({left:left*32,right:(left+match[0].length)*32,row});
    }
  });
  surfaces.sort((a,b)=>a.left-b.left);
  let direction=0, target:typeof surfaces[number]|undefined, jumping=false;
  const steer=async(next:number)=>{
    if(next===direction)return;
    if(direction)await page.keyboard.up(direction>0?'ArrowRight':'ArrowLeft');
    if(next)await page.keyboard.down(next>0?'ArrowRight':'ArrowLeft');
    direction=next;
  };
  try {
    for(let i=0;i<2000;i++) {
      const s=await state(page);
      if(s.finished)return s;
      const center=s.x+10;
      if(s.grounded){
        if(jumping){await page.keyboard.up('Space');jumping=false;target=undefined;await page.waitForTimeout(30);continue;}
        const support=surfaces.find(p=>Math.abs(s.y+44-p.row*32)<2 && center>=p.left && center<p.right);
        if(!support){await page.waitForTimeout(30);continue;}
        const next=surfaces.find(p=>p.left>=support.right);
        if(!next){await steer(1);await page.waitForTimeout(30);continue;}
        if(center<support.right-32){await steer(1);await page.waitForTimeout(30);continue;}
        target=next;jumping=true;await page.keyboard.down('Space');
      }
      if(target){
        const landing=Math.min((target.left+target.right)/2,target.left+64);
        const distance=landing-center;
        // Releasing a direction still coasts under the real engine's air friction.
        const stopping=Math.max(8,s.vx*s.vx/(2*T.friction*T.airMult));
        await steer(distance>stopping?1:distance<-stopping?-1:0);
        if(s.vy>=0 && !s.grounded)await page.keyboard.up('Space');
      }
      await page.waitForTimeout(30);
    }
    return state(page);
  } finally {
    await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowLeft');await page.keyboard.up('Space');
  }
}

async function runLevel(page: Page, n: number) {
  if(n===6)return runAiBridges(page);
  const L = LEVELS[n].rows;
  const solid = (x: number, y: number) => L[y]?.[x] === '#';
  const standable = (x: number, y: number) => solid(x, y) || ['=', 'M', 'D'].includes(L[y]?.[x] ?? ' ');
  await page.keyboard.down('ArrowRight');
  let lastX = 0, stuck = 0, capturedWand = false;
  // generous budget: like a person, the bot may need a retry or two on moving platforms
  for (let i = 0; i < 2000; i++) {
    const s = await state(page);
    if (s.finished) break;
    if(n===7&&s.boss?.hp>0&&s.x>s.boss.home-220){
      await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowLeft');await page.keyboard.up('Space');
      await page.keyboard.down('x');
      if(!capturedWand&&s.wandHits===1){await page.screenshot({path:test.info().outputPath('wand-boss.png')});capturedWand=true;}
      await page.waitForTimeout(60);
      continue;
    }
    if(n===7&&s.boss?.hp===0){await page.keyboard.up('x');await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');if(s.x>165*32)await page.keyboard.down('Space');}
    const tx = Math.floor((s.x + 10) / 32), row = Math.floor((s.y + 44) / 32);
    // a pit is a column with no floor anywhere below; a raised platform's edge just drops you down
    const pit = (x: number) => { for (let y = row; y < L.length; y++) if (standable(x, y)) return false; return true; };
    const gap = pit(tx + 1) && pit(tx + 2);
    const wall = solid(tx + 1, row - 1) || solid(tx + 1, row - 2);
    const step = [1, 2, 3].some((d) => ['=', 'D'].includes(L[row - d]?.[tx + 2] ?? ' '));
    const hazard = L[row - 1]?.[tx + 1] === '^' || L[row - 1]?.[tx + 2] === '^';
    stuck = Math.abs(s.x - lastX) < 1 ? stuck + 1 : 0; lastX = s.x;
    if (s.grounded && (gap || wall || hazard || step || stuck > 3)) {
      await page.keyboard.down('Space'); await page.waitForTimeout(300); await page.keyboard.up('Space');
    } else await page.waitForTimeout(30);
  }
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('ArrowLeft');await page.keyboard.up('Space');
  return state(page);
}

// The J.P. Morgan tower is vertical: climb each floor's staircase of desks,
// then go up through the stairwell onto the next floor.
async function climbTower(page: Page) {
  const L = LEVELS[4].rows; const T = 32; const Wd = L[0].length;
  const at = (x: number, y: number) => L[y]?.[x] ?? ' ';
  let s = await state(page);
  for (let i = 0; i < 700 && !s.finished; i++) {
    s = await state(page);
    const cx = (s.x + 10) / T, feet = Math.round((s.y + 44) / T);
    // next desk: a '=' run 3 rows up; else the ceiling gap: '#' row 3 rows up with a hole
    const up = feet - 3;
    let target: number | null = null, slab = false;
    const runs: [number, number][] = []; let a = -1;
    for (let x = 0; x <= Wd; x++) { const c = at(x, up); if (c === '=' && a < 0) a = x; if (c !== '=' && a >= 0) { runs.push([a, x - 1]); a = -1; } }
    if (runs.length) target = (runs[0][0] + runs[0][1]) / 2;
    else if (at(1, up) === '#' || at(Wd - 2, up) === '#') {
      // find the gap in the slab
      let g0 = -1, g1 = -1; for (let x = 1; x < Wd - 1; x++) if (at(x, up) === ' ') { if (g0 < 0) g0 = x; g1 = x; }
      if (g0 >= 0) { target = (g0 + g1) / 2; slab = true; }
    }
    if (!s.grounded) { await page.waitForTimeout(30); continue; }
    if (target === null) { // top floor: walk to the finish
      await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight'); continue;
    }
    const dx = target - cx;
    if (slab) {
      // land on the slab on the side the current desk sits under
      let g0 = -1, g1 = -1; for (let x = 1; x < Wd - 1; x++) if (at(x, up) === ' ') { if (g0 < 0) g0 = x; g1 = x; }
      let d0 = Math.floor(cx), d1 = Math.floor(cx); while (at(d0 - 1, feet) === '=') d0--; while (at(d1 + 1, feet) === '=') d1++;
      const right = d1 > g1;
      const launch = right ? g1 - 0.5 : g0 + 1.5;
      const ddx = launch - cx;
      if (Math.abs(ddx) > 0.5) { const k = ddx > 0 ? 'ArrowRight' : 'ArrowLeft'; await page.keyboard.down(k); await page.waitForTimeout(50); await page.keyboard.up(k); continue; }
      await page.keyboard.down('Space'); await page.waitForTimeout(300);
      const side = right ? 'ArrowRight' : 'ArrowLeft';
      await page.keyboard.down(side); await page.waitForTimeout(350); await page.keyboard.up('Space'); await page.waitForTimeout(250); await page.keyboard.up(side);
      continue;
    }
    const k = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.down(k); await page.keyboard.down('Space'); await page.waitForTimeout(330); await page.keyboard.up('Space'); await page.waitForTimeout(150); await page.keyboard.up(k);
  }
  return state(page);
}

const CASE_LINK: Record<number, string> = { 4: '/fusion', 5: '/fx', 6: '/uoaui', 7: '/winking-star' };
for (const n of [0, 1, 2, 3, 4, 5, 6, 7]) {
  test(`world ${n + 1} (${LEVELS[n].theme}) can be finished`, async ({ page }) => {
    test.setTimeout(180000);
    await page.addInitScript(() => { (window as unknown as { __gameAssist: object }).__gameAssist = { invuln: true }; });
    if(n===7)await page.addInitScript(()=>{if(!localStorage.getItem('working-order-progress-v2'))localStorage.setItem('working-order-progress-v2',JSON.stringify({done:[0,1,2,3,4,5,6],missions:[]}));});
    await page.goto(`/?level=${n + 1}#top`);
    await page.getByRole('button', { name: 'Start adventure' }).click();
    await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
    const s = n === 4 ? await climbTower(page) : await runLevel(page, n);
    expect(s.finished, `stopped at tile ${Math.floor(s.x / 32)}, row ${Math.floor((s.y + 44) / 32)}`).toBe(true);
    expect(s.level).toBe(n);
    expect(s.achievements.length).toBeGreaterThan(0);
    // the card states the facts and, where there is one, links to the case
    const card = page.locator(`.game-end[data-end="${n}"]`);
    await expect(card).toBeVisible({ timeout: 5000 });
    if (CASE_LINK[n]) await expect(card.getByRole('link', { name: 'Read the case →' })).toHaveAttribute('href', CASE_LINK[n]);
    // every card reports that world's mission
    await expect(card.locator('.game-mission')).toContainText('Mission');
    // the bot picks up the scooter and rides it to the sea: Kaohsiung's mission
    if (n === 0) { expect(s.missions).toContain(0); await expect(card.locator('.game-mission')).toContainText('Mission complete'); }
    if(n===2){await card.locator('[data-next="3"]').click();await expect(page.locator('.game-flight')).toBeVisible();await expect(page.locator('.game-flight')).toContainText('2013');await page.getByRole('button',{name:'Skip flight'}).click();await expect.poll(async()=>(await state(page)).level).toBe(3);}
    if(n===7){expect(s.wandHits).toBe(3);expect(s.weapon).toBe('starlight-wand');expect(s.boss.hp).toBe(0);expect((await state(page)).flagRaised).toBe(true);await page.reload();await page.getByRole('button',{name:'Start adventure'}).click();await page.locator('#game-world').click();await expect(page.locator('.game-stages [data-stage="7"]')).toHaveAttribute('data-completed','true');expect((await state(page)).done).toContain(7);}
  });
}

async function startWorld(page: Page, n: number, invuln = false) {
  if (invuln) await page.addInitScript(() => { (window as unknown as { __gameAssist: object }).__gameAssist = { invuln: true }; });
  await page.goto(`/?level=${n + 1}#top`);
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
  await expect.poll(async () => (await state(page)).grounded).toBe(true);
}

test('small enemies: landing on one clears it and counts toward the mission', async ({ page }) => {
  await startWorld(page, 2, true); // 捷元電腦: squash 4 bugs
  const before = await state(page);
  expect(before.foes).toBeGreaterThanOrEqual(before.mission.need);
  expect(before.mission.text).toBe('Squash 4 bugs');
  // Let the first walking bug approach on this flat stretch. A blind stream
  // of jumps could miss every bug or fall into a pit, depending on frame timing.
  await page.waitForFunction(() => {
    const s = (window as unknown as { __game: () => any }).__game();
    return s.grounded && s.enemies.some((e: { x: number }) => e.x - s.x >= 32 && e.x - s.x <= 45);
  }, undefined, { timeout: 18000 });
  await page.keyboard.down('Space');
  await page.waitForTimeout(260);
  await page.keyboard.up('Space');
  await expect.poll(async () => (await state(page)).stomped, { timeout: 2500 }).toBeGreaterThan(0);
  const s = await state(page);
  expect(s.stomped).toBeGreaterThan(0);
  expect(s.mission.have).toBe(s.stomped);
});

test('small enemies: walking into one from the side is a hit', async ({ page }) => {
  await startWorld(page, 2);
  // Stay before the optional power star and let the enemy approach.
  let s = await state(page);
  for (let i = 0; i < 900 && s.hits === 0; i++) { await page.waitForTimeout(20); s = await state(page); }
  await page.keyboard.up('ArrowRight');
  // the hit came first; the knockback may then drop her onto it, which is fine
  expect(s.hits).toBeGreaterThan(0);
  expect(s.stomped).toBe(0);
});

test('every world has a mission, shown in the HUD state', async ({ page }) => {
  await page.addInitScript(()=>localStorage.setItem('working-order-progress-v2',JSON.stringify({done:[0,1,2,3,4,5,6],missions:[]})));
  for (const n of [1, 3, 4, 5, 6, 7]) {
    await startWorld(page, n);
    const s = await state(page);
    expect(s.mission.text.length).toBeGreaterThan(5);
    expect(s.mission.need).toBeGreaterThan(0);
    expect(s.mission.done).toBe(false);
  }
});

test('Play opens the career map; arrows step world by world and Space starts it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
  expect((await state(page)).mode).toBe('map');
  // four choices: Taiwan, London, Next: AI, Bonus. One step lands on London's first stage.
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#game-world')).toHaveAttribute('data-stage','3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#game-world')).toHaveAttribute('data-stage','6');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#game-world')).toHaveAttribute('data-stage','0'); // wraps back to Taiwan
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await state(page)).mode).toBe('level');
  expect((await state(page)).level).toBe(3);
});

test('stages of a world play on: the card offers the next stage, then the next world', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.game-end[data-end="0"] [data-next]')).toHaveText('Next stage');
  await expect(page.locator('.game-end[data-end="2"] [data-next]')).toHaveText('Next world: London');
  await expect(page.locator('.game-end[data-end="5"] [data-next]')).toHaveText('Next world: AI');
  await expect(page.locator('.game-end[data-end="6"] [data-next]')).toHaveText('Bonus: Bedtime');
  await expect(page.locator('.game-end[data-end="1"] .game-kicker')).toContainText('World 1-2');
  await expect(page.locator('.game-stages button')).toHaveCount(8);
});

test('Kaohsiung: the scooter makes you faster', async ({ page }) => {
  await page.goto('/?level=1#top');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => (await state(page)).riding, { timeout: 6000 }).toBe(true);
  // read the speed as soon as it builds: a fixed wait could land after the
  // pit at tiles 26 to 28, which a bot holding Right rides straight into
  await expect.poll(async () => Math.abs((await state(page)).vx), { timeout: 1500, intervals: [50] }).toBeGreaterThan(330);
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: test.info().outputPath('opaque-scooter.png') });
});

test('hazards hurt (three hits restart the level)', async ({ page }) => {
  await page.goto('/?level=5#top');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
  // stand in the tower's falling-sheet lane on the ground floor and wait
  // nudge into the lane (x 440 to 468) with short taps
  for (let i = 0; i < 60; i++) {
    const x = (await state(page)).x;
    if (x >= 440 && x <= 468) break;
    const k = x < 440 ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.down(k); await page.waitForTimeout(x < 380 || x > 520 ? 200 : 40); await page.keyboard.up(k);
    await page.waitForTimeout(120);
  }
  // The walk crosses the optional star. First let its protection expire,
  // then allow complete falling-sheet cycles rather than combining both waits.
  await expect.poll(async () => (await state(page)).powerSeconds, { timeout: 10000 }).toBe(0);
  await expect.poll(async () => (await state(page)).hits, { timeout: 8000 }).toBeGreaterThan(0);
});

test('a case page links to its chapter of the game without starting it', async ({ page }) => {
  await page.goto('/fusion');
  const link = page.getByRole('link', { name: /Play this chapter in the game/ });
  await expect(link).toHaveAttribute('href', '/panel?level=5#adventure');
  await link.click();
  await expect(page.locator('#game-world')).toHaveAttribute('data-stage','4');
  await expect(page.locator('.play .game')).toHaveAttribute('data-state', 'poster');
});

test('the site still works if the game chunk fails to load', async ({ page }) => {
  await page.route(/\/_astro\/main\.[^/]+\.js$/, (r) => r.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await expect(page.locator('.play .game')).toHaveAttribute('data-state', 'poster');
  await expect(page.getByRole('button', { name: 'Start adventure' })).toBeEnabled();
  await expect(page.locator('#links h2')).toBeVisible();
});

test.describe('JavaScript off', () => {
  test.use({ javaScriptEnabled: false });
  test('the game shows a static poster and no dead Play button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.game-poster img')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start adventure' })).toBeHidden();
  });
});

test('sound is off by default and has one toggle', async ({ page }) => {
  await page.goto('/');
  const btn = page.getByRole('button', { name: 'Sound' });
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Start adventure' }).click();
  await page.waitForFunction(() => (window as unknown as { __game?: () => unknown }).__game?.());
});


test('the final level stays locked until all seven earlier stages are complete',async({page})=>{
 for(const done of [[],[0,1,2,3,4,5]]){
  await page.goto('/');await page.evaluate(done=>localStorage.setItem('working-order-progress-v2',JSON.stringify({done,missions:[]})),done);
  await page.goto('/?level=8');await page.getByRole('button',{name:'Start adventure'}).click();await page.waitForFunction(() => (window as any).__game?.());
  await expect.poll(async()=>(await state(page)).mode).toBe('map');
  await expect(page.locator('.game-stages [data-stage="7"]')).toBeDisabled();
  await page.locator('#game').press('Space');expect((await state(page)).mode).toBe('map');
  await expect(page.locator('#game-status')).toContainText('Final level locked');
  await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>localStorage.setItem('working-order-progress-v2',JSON.stringify({done:[0,1,2,3,4,5,6],missions:[]})));
 await page.goto('/?level=8');await page.getByRole('button',{name:'Start adventure'}).click();await page.waitForFunction(() => (window as any).__game?.());
 await expect.poll(async()=>(await state(page)).mode).toBe('level');expect((await state(page)).level).toBe(7);
});


test('starlight wand supports touch, cooldown and pause, and stays out of earlier levels', async ({ page }) => {
  await page.emulateMedia({ media: 'screen' });
  await page.addInitScript(()=>localStorage.setItem('working-order-progress-v2',JSON.stringify({done:[0,1,2,3,4,5,6],missions:[]})));
  await startWorld(page,7,true);
  expect((await state(page)).weapon).toBe('starlight-wand');
  const cast=page.locator('[data-k="cast"]');
  await expect(cast).not.toHaveAttribute('hidden');
  await cast.dispatchEvent('pointerdown');
  await expect.poll(async()=>(await state(page)).bolts.length).toBe(1);
  await cast.dispatchEvent('pointerup');
  expect((await state(page)).castCooldown).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Timeline',exact:true}).click();
  const paused=await state(page);
  await page.waitForTimeout(250);
  expect((await state(page)).bolts).toEqual(paused.bolts);
  await page.locator('#game-timeline button').first().click();
  await page.locator('#game-world').click();
  await expect(cast).toHaveAttribute('hidden');
  await page.locator('.game-stages [data-stage="0"]').click();
  await expect.poll(async()=>(await state(page)).weapon).toBeNull();
  await page.keyboard.press('x');
  expect((await state(page)).bolts).toHaveLength(0);
});

test.describe('mobile fullscreen map', () => {
  test.use({ hasTouch: true, isMobile: true });
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    test(`map stays readable at ${viewport.width} × ${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.getByRole('button', { name: 'Start adventure' }).click();
      await expect(page.locator('.game')).toHaveAttribute('data-state', 'playing');
      await expect(page.locator('.game-touch')).toBeHidden();
      const canvas = page.locator('#game');
      const bounds = await canvas.boundingBox();
      expect(bounds!.height).toBeGreaterThan(viewport.width < viewport.height ? 400 : 290);
      expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 1);
      if (viewport.width < viewport.height) {
        await expect(page.locator('.game-map-hint')).toBeVisible();
        expect(await page.locator('.game').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
        // A drag beginning on a marker must not start a level.
        const x = bounds!.x + NODES[0][0] / 480 * bounds!.width;
        const y = bounds!.y + NODES[0][1] / 270 * bounds!.height;
        await canvas.dispatchEvent('pointerdown', { pointerId: 1, clientX: x, clientY: y });
        await canvas.dispatchEvent('pointerup', { pointerId: 1, clientX: x - 100, clientY: y });
        expect((await state(page)).mode).toBe('map');
      }
      await page.touchscreen.tap(bounds!.x + NODES[0][0] / 480 * bounds!.width, bounds!.y + NODES[0][1] / 270 * bounds!.height);
      await expect.poll(async () => (await state(page)).mode).toBe('level');
      await expect(page.locator('.game-touch')).toBeVisible();
      await page.locator('#game-exit').click();
      await expect(page.locator('.play')).not.toHaveClass(/is-full/);
    });
  }
});
