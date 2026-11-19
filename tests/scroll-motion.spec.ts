import {test,expect} from '@playwright/test';

test('home hero text and scene have distinct reversible scroll depth',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await page.waitForTimeout(1500);
 const word=page.locator('.hero-word').first();
 const copy=page.locator('.hero-copy-depth');
 const scene=page.locator('.companion-stage');
 const y=async(locator:typeof word)=>locator.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42);
 await page.evaluate(()=>window.scrollTo(0,220));
 await expect(page.locator('.hero-story')).toHaveAttribute('data-scroll-motion','true');
 await page.waitForTimeout(1000);
 const down={word:await y(word),copy:await y(copy),scene:await y(scene)};
 expect(down.word).toBeLessThan(-10);expect(down.copy).toBeLessThan(-10);expect(down.scene).toBeLessThan(-15);
 expect(Math.abs(down.word-down.copy)).toBeGreaterThan(3);
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(1000);
 expect(Math.abs(await y(word))).toBeLessThan(1);expect(Math.abs(await y(copy))).toBeLessThan(1);
 await page.evaluate(()=>window.scrollTo(0,220));await page.waitForTimeout(1000);
 expect(await y(word)).toBeCloseTo(down.word,0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>y(word)).toBe(0);expect(await y(copy)).toBe(0);expect(await y(scene)).toBe(0);
 await expect(page.locator('h1')).toHaveText('Shannon Hecker');
});

test('scrolling keeps the featured artwork and caption inside their tile', async ({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const tile=page.locator('.featured-gallery .row').first();
 for(const f of [.9,.4,.9]){
  await tile.evaluate((el,f)=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-innerHeight*f),f);
  const inside=await tile.evaluate(el=>{
   const frame=el.getBoundingClientRect(),title=el.querySelector('h3')!.getBoundingClientRect();
   return title.top>=frame.top&&title.bottom<=frame.bottom;
  });
  expect(inside).toBe(true);
 }
});

test('section headings keep words aligned throughout their one-time entrance',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const heading=page.locator('#how .split');
 await heading.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-innerHeight*.8));
 await expect(heading).toHaveAttribute('data-scroll-motion','true');
 const aligned=await heading.evaluate(async el=>{
  for(let i=0;i<35;i++){
   await new Promise(requestAnimationFrame);
   if([...el.querySelectorAll('.wd')].some(w=>getComputedStyle(w).transform!=='none'||getComputedStyle(w).clipPath!=='none'))return false;
  }return true;
 });
 expect(aligned).toBe(true);
 await expect(heading).toHaveCSS('opacity','1');
 await page.evaluate(()=>window.scrollTo(0,0));
 await expect(heading).toHaveCSS('opacity','1');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(heading.locator('.wd').first()).toHaveCSS('transform','none');
});

test('touch scroll settles every heading without horizontal overflow',async({browser})=>{
 const context=await browser.newContext({baseURL:'http://localhost:4329',viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();await page.goto('/');
 const heading=page.locator('#how .split');
 await heading.scrollIntoViewIfNeeded();
 await expect(heading).toHaveAttribute('data-scroll-motion','true');
 await heading.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-180));
 await page.waitForTimeout(500);
 expect(await heading.locator('.wd').first().evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await context.close();
});
