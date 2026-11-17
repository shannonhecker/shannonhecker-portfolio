import {test,expect} from '@playwright/test';
for(const route of ['/fx','/fusion','/winking-star','/deal-model','/uoaui']){
 test(`${route} heading stays inside the viewport with motion enabled`,async({page})=>{
  await page.goto(route);
  await page.locator('h1').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
  for(const width of [320,390,768,1024,1280,1440,1920]){
   await page.setViewportSize({width,height:900});
   const bounds=await page.locator('h1').boundingBox();
   expect(bounds!.x).toBeGreaterThanOrEqual(0);
   expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
 });
}


test('section heading reveal stays within the page when resizing to mobile mid-scroll',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/fx');
 const heading=page.locator('#fx-problem .h-sub');
 await heading.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY-window.innerHeight*.85));
 await page.waitForTimeout(800);await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 const b=await heading.boundingBox();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(390);
});
