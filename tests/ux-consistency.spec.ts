import {setTheme} from './theme-helper';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/','/panel','/fx','/fusion','/winking-star','/deal-model','/uoaui','/privacy','/build','/404'];
for(const route of ['/fusion','/winking-star','/fx','/deal-model','/uoaui']){
test(`${route} summary follows complete hero media and links to the outcome`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
   await page.goto(route);
   await expect(page.locator('.chapter-head .lead')).toHaveCSS('font-size','16px');
   const summary=page.getByRole('complementary',{name:'Case summary'});
   const hero=(await page.locator('.chapter-head').boundingBox())!;
   const bounds=(await summary.boundingBox())!;
   expect(bounds.y).toBeGreaterThanOrEqual(hero.y+hero.height);
   expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);
   const target=await summary.getByRole('link',{name:'Read the outcome'}).getAttribute('href');
   await expect(page.locator(target!)).toHaveCount(1);
   for(const theme of ['light','dark']){
    await setTheme(page,theme==='dark');
    expect((await new AxeBuilder({page}).include('.case-evidence').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
   }
 }
});
}
test('every page shares usable navigation, theme controls and an overflow-free shell',async({page})=>{
 test.setTimeout(90000);
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

test('section navigation follows each case’s actual reading order',async({page})=>{
 for(const route of ['/fx','/fusion','/winking-star','/deal-model','/uoaui']){
  await page.goto(route);
  expect(await page.locator('.chapter-stops a').evaluateAll(links=>{
   const targets=links.map(a=>document.getElementById((a as HTMLAnchorElement).hash.slice(1)));
   return targets.every((target,i)=>target&&(!i||!!(targets[i-1]!.compareDocumentPosition(target)&Node.DOCUMENT_POSITION_FOLLOWING)));
  })).toBe(true);
 }
});

test('supporting pages remain accessible in both themes',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/privacy','/build','/404']){
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
 await page.locator('.nav').getByRole('link',{name:'Winking Star',exact:true}).click();
 await expect(page).toHaveURL(/winking-star/);await context.close();
});

test('current project and analytics notice follow both themes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/fx');
 const active=page.locator('.nav a[aria-current="page"]');
 for(const theme of ['light','dark']){
  await setTheme(page,theme==='dark');
  await expect(active).toHaveText('FX');
  expect(await active.evaluate(e=>getComputedStyle(e).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  const notice=page.locator('#analytics-choice');await expect(notice).toBeVisible();
  expect(await notice.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(theme==='dark'?'rgb(23, 27, 34)':'rgb(255, 255, 255)');
  expect((await new AxeBuilder({page}).include('#analytics-choice').withTags(['wcag2aa']).analyze()).violations).toEqual([]);
 }
});

test('mobile menu links navigate and dismiss the disclosure',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const [label,path] of [['FX','/fx'],['Fusion','/fusion'],['Winking Star','/winking-star'],['Deal Model','/deal-model'],['uoaui.ai','/uoaui']]){
  await page.goto('/privacy');await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('.nav').getByRole('link',{name:label,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
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
 await menu.getByRole('link',{name:'How I work',exact:true}).scrollIntoViewIfNeeded();
 await expect(menu.getByRole('link',{name:'How I work',exact:true})).toBeInViewport();
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
 await expect(page.locator('.nav a[aria-current="page"]')).toHaveText('Fusion');
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

test('Winking Star journey separates setup, daily repetition and independent handoff',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/winking-star');
 const journey=page.locator('#winking-journey');
 await expect(journey.locator('.original-study')).toHaveCount(0);
 await expect(journey).not.toContainText('ten seconds');
 await expect(journey).not.toContainText('Not another chart');
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['light','dark']){
   await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
   const steps=journey.locator('.daily-loop li,.routine-progress li');
   await expect(steps).toHaveCount(6);
   for(const step of await steps.all())await expect(step).toBeVisible();
   expect(await journey.locator('.routine-journey').evaluate(n=>[...n.querySelectorAll('li')].every(e=>e.scrollWidth<=e.clientWidth+1))).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
 }
});

test('case summaries and content blocks keep consistent breathing room',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['/fusion','/fx','/winking-star','/deal-model','/uoaui']){
   await page.goto(route);
   const spacing=await page.evaluate(()=>{
    const summary=document.querySelector('.case-evidence')!;
    const note=summary.querySelector('.evidence-note')!;
    const gaps=[...document.querySelectorAll('.beat .body')].flatMap(parent=>{
     const children=[...parent.children].filter(el=>{const style=getComputedStyle(el);return el.getBoundingClientRect().height>0&&!['absolute','fixed'].includes(style.position)});
     return children.slice(1).flatMap((el,i)=>{const a=children[i].getBoundingClientRect(),b=el.getBoundingClientRect();return b.left<a.right&&b.right>a.left?[b.top-a.bottom]:[]});
    });
    return {bottom:summary.getBoundingClientRect().bottom-note.getBoundingClientRect().bottom,gaps};
   });
   expect(spacing.bottom,route).toBeGreaterThanOrEqual(31);
   expect(spacing.gaps.every(gap=>gap>=31),`${route} at ${width}: ${spacing.gaps}`).toBe(true);
  }
 }
});
