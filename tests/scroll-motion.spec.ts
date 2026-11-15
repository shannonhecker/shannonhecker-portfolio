import {test,expect} from '@playwright/test';

test('home hero text and scene have distinct reversible scroll depth',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/panel');
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
 await expect(page.locator('h1')).toHaveText('I design tools where mistakes cost money.');
});

test('home artwork and captions follow scroll in both directions',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/panel');
 const row=page.locator('#work .row').first();
 const position=async(fraction:number)=>row.evaluate((el,f)=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-innerHeight*f),fraction);
 const artwork=row.locator('.home-artwork');const title=row.locator('h3');
 const y=async(locator:typeof artwork)=>locator.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m42);
 await position(.93);await expect(row).toHaveAttribute('data-scroll-motion','true');await page.waitForTimeout(900);
 expect(await y(artwork)).toBeGreaterThan(20);expect(await y(title)).toBeGreaterThan(10);
 await title.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-innerHeight*.4));await page.waitForTimeout(900);
 await expect.poll(async()=>Math.abs(await y(artwork)),{timeout:2000}).toBeLessThan(1);await expect.poll(async()=>Math.abs(await y(title)),{timeout:2000}).toBeLessThan(1);
 await position(.93);await page.waitForTimeout(900);expect(await y(artwork)).toBeGreaterThan(20);
 await row.focus();expect(Math.abs(await y(artwork))).toBeLessThan(1);
 await page.waitForTimeout(600);expect(Math.abs(await y(artwork))).toBeLessThan(1);
 await row.blur();await position(.93);await page.waitForTimeout(900);expect(await y(artwork)).toBeGreaterThan(20);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>y(artwork),{timeout:1000}).toBe(0);
});

test('section headings keep words aligned throughout their one-time entrance',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/panel');
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
 const page=await context.newPage();await page.goto('/fx');
 const heading=page.locator('#fx-problem .h-sub');
 await heading.scrollIntoViewIfNeeded();
 await expect(heading).toHaveAttribute('data-scroll-motion','true');
 await heading.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-180));
 await page.waitForTimeout(500);
 expect(await heading.locator('.wd').first().evaluate(el=>getComputedStyle(el).clipPath)).toBe('none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await context.close();
});
