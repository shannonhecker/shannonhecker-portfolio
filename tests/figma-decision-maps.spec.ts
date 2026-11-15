import {setTheme} from './theme-helper';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const maps=JSON.parse(readFileSync(new URL('../src/data/figma-decision-maps.json',import.meta.url),'utf8')); 

for(const [project,route] of [['fx','/fx'],['fusion','/fusion'],['ai','/uoaui'],['winking','/winking-star'],['deal','/deal-model']]) {
 test(`${project} Figma map follows theme and stays usable on phones`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(route);
  const consent=page.getByRole('button',{name:'No thanks'});
  if(await consent.isVisible())await consent.click();
  if(project==='fx'){
   await expect(page.locator('.figma-decision-map')).toHaveCount(0);
   await expect(page.locator('.figma-user-flow')).toHaveCount(1);
   await expect(page.locator('#fx-decision-map-title')).toHaveText('Decision map');
   return;
  }
  for(const width of [320,390,760,1440]){
   await page.setViewportSize({width,height:900});
   for(const theme of ['light','dark']){
    await setTheme(page,theme==='dark');
    const image=page.locator('.figma-decision-map img:visible');
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('src',`/art/decision-maps/${project}-${theme}.svg`);
    await image.evaluate(async(node:HTMLImageElement)=>{node.loading='eager';await node.decode();});
    const sizes=await image.evaluate((node:HTMLImageElement)=>({w:node.clientWidth,h:node.clientHeight,nw:node.naturalWidth,nh:node.naturalHeight}));
    expect(Math.abs(sizes.w/sizes.h-sizes.nw/sizes.nh)).toBeLessThan(.01);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(width<=760){
     const figure=page.locator('.figma-decision-map');
     const region=figure.locator('.map-scroll');
     expect(sizes.w).toBeLessThanOrEqual(width);
     expect(await region.evaluate(n=>n.scrollWidth-n.clientWidth)).toBeLessThanOrEqual(1);
     await figure.getByRole('button',{name:'Enlarge map',exact:true}).click();
     await expect.poll(()=>image.evaluate(n=>n.clientWidth)).toBe(1120);
     await expect.poll(()=>region.evaluate(n=>Math.abs(n.scrollLeft-(n.scrollWidth-n.clientWidth)/2))).toBeLessThan(2);
     await region.focus();const before=await region.evaluate(n=>n.scrollLeft);await page.keyboard.press('ArrowRight');
     await expect.poll(()=>region.evaluate(n=>n.scrollLeft)).toBeGreaterThan(before);
     await figure.getByRole('button',{name:'Fit to screen',exact:true}).click();
     await expect(figure.getByRole('button',{name:'Enlarge map',exact:true})).toHaveAttribute('aria-pressed','false');
     expect(await region.evaluate(n=>n.scrollWidth-n.clientWidth)).toBeLessThanOrEqual(1);
    }
   }
  }
  await expect(page.locator('.map-transcript')).toHaveCount(0);
  await expect(page.locator('main details')).toHaveCount(0);
  await expect(page.getByText('Decision map in detail',{exact:true})).toHaveCount(0);
  await expect(page.locator('a[href*="figma.com"]')).toHaveCount(0);
 });
 test(`${project} exported Figma text fits its nodes in both themes`,async({page})=>{
  for(const theme of ['light','dark']){
   await page.goto(`/art/decision-maps/${project}-${theme}.svg`);
   await expect(page.locator('[id="Editable decision nodes"] > g')).toHaveCount(maps.maps.find((m:any)=>m.key===project&&m.theme===theme).nodeCount);
   await page.evaluate(()=>document.fonts.ready);
   const issues=await page.evaluate(()=>{
    const layer=[...document.querySelectorAll('g')].find(g=>g.id==='Editable decision nodes')!;
    const errors:string[]=[];
    for(const node of [...layer.children]){
     const shape=node.querySelector('rect');if(!shape)continue;
     const box=shape.getBoundingClientRect();let bottom=box.top;
     for(const t of [...node.querySelectorAll('text')]){
      const b=t.getBoundingClientRect();
      if(b.left<box.left-1||b.right>box.right+1||b.top<bottom-1||b.bottom>box.bottom+1)errors.push(t.textContent||'');
      bottom=b.bottom;
     }
    }
    return errors;
   });
   expect(issues).toEqual([]);
  }
 });
}
