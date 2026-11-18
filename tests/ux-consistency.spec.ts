import {setTheme} from './theme-helper';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/','/fx','/fusion','/winking-star','/deal-model','/uoaui','/privacy','/404','/work','/work/tripup','/work/stock-dashboard','/writing','/writing/trust-surfaces-in-ai','/about'];
test('every page shares usable navigation, theme controls and an overflow-free shell',async({page})=>{
 test.setTimeout(process.env.CI ? 300_000 : 90_000);
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,820,1440]){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
   await page.goto(route);
   await expect(page.locator('h1')).toHaveCount(1);
   await expect(page.locator('#main')).toHaveCount(1);
   for(const theme of ['light','dark']){
    await setTheme(page,theme==='dark');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   }
   if(width<=1100){
    await page.getByRole('button',{name:'Menu',exact:true}).click();
    await expect(page.locator('.nav ul')).toBeVisible();
    const menu=(await page.locator(width<=760?'.nav':'.nav ul').boundingBox())!;
    expect(menu.x).toBe(0);expect(menu.width).toBe(width);
    if(width<=760){expect(menu.y).toBe(0);expect(menu.height).toBe(1000);}
    else await expect(page.locator('.nav-actions')).toBeVisible();
    await expect(page.getByRole('button',{name:'Close menu',exact:true})).toBeVisible();
    for(const link of await page.locator('.nav ul a').all())await expect(link).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Menu',exact:true})).toBeFocused();
   }else await expect(page.getByRole('button',{name:'Menu',exact:true})).toBeHidden();
  }
 }
});

test('supporting pages remain accessible in both themes',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/privacy','/404']){
  await page.goto(route);
  for(const theme of ['light','dark']){
   await setTheme(page,theme==='dark');
   expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  }
 }
});

test('mobile navigation works without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const page=await context.newPage();await page.goto('http://localhost:4329/privacy');
 await expect(page.locator('.nav ul')).toBeVisible();
 await expect(page.getByRole('button',{name:'Menu',exact:true})).toBeHidden();
 // /work, /writing and /about are built in later tasks, so check the links are there and visible, not followed.
 for(const label of ['Work','Writing','About'])await expect(page.locator('.nav').getByRole('link',{name:label,exact:true})).toBeVisible();
 await page.locator('.nav .brand').click();
 await expect(page).toHaveURL(/localhost:4329\/$/);await context.close();
});

test('analytics notice follows both themes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/fx');
 for(const theme of ['light','dark']){
  await setTheme(page,theme==='dark');
  const notice=page.locator('#analytics-choice');await expect(notice).toBeVisible();
  expect(await notice.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(theme==='dark'?'rgb(23, 27, 34)':'rgb(255, 255, 255)');
  expect((await new AxeBuilder({page}).include('#analytics-choice').withTags(['wcag2aa']).analyze()).violations).toEqual([]);
 }
});

test('mobile menu links navigate and dismiss the disclosure',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/privacy','/fx']){
  await page.goto(route);await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('.nav .brand').click();
  await expect(page).toHaveURL(/localhost:4329\/$/);
  await expect(page.getByRole('button',{name:'Menu',exact:true})).toHaveAttribute('aria-expanded','false');
 }
});

 test('mobile menu scrolls within a short viewport and keeps its toggle reachable',async({page})=>{
 await page.setViewportSize({width:667,height:320});
 await page.goto('/privacy');
 const toggle=page.getByRole('button',{name:'Menu',exact:true});
 await toggle.click();
 const menu=page.locator('#site-menu-panel');
 const bounds=(await menu.boundingBox())!;
 expect(bounds.y+bounds.height).toBeLessThanOrEqual(320);
 await menu.getByRole('link',{name:'About',exact:true}).scrollIntoViewIfNeeded();
 await expect(menu.getByRole('link',{name:'About',exact:true})).toBeInViewport();
 const close=page.getByRole('button',{name:'Close menu',exact:true});
 await expect(close).toBeInViewport();
 await close.click();await expect(menu).toBeHidden();
 });

 test('drawer isolates the page, traps keyboard focus and releases it on close or resize',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/fusion');
 await expect(page.locator('.nav-actions')).toBeHidden();
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await expect(page.locator('#main')).toHaveAttribute('inert','');
 await expect(page.locator('html')).toHaveClass(/site-menu-open/);
 const contact=page.locator('.nav .cta');await contact.focus();await page.keyboard.press('Tab');
 await expect(page.locator('.nav .brand')).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(contact).toBeFocused();
 for(const dark of [false,true]){
  await page.getByRole('switch',{name:'Dark mode'}).setChecked(dark);
  expect((await new AxeBuilder({page}).include('.nav').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
 }
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Menu',exact:true})).toBeFocused();
 await expect(page.locator('#main')).not.toHaveAttribute('inert','');
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await page.setViewportSize({width:1440,height:900});
 await expect(page.locator('html')).not.toHaveClass(/site-menu-open/);
 await expect(page.locator('#main')).not.toHaveAttribute('inert','');
 await expect(contact).toBeVisible();
 });
