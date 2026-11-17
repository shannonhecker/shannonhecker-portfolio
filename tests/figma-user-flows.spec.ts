import {setTheme} from './theme-helper';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const explanations=JSON.parse(readFileSync(new URL('../src/data/visual-explanations.json',import.meta.url),'utf8'));
const content=JSON.parse(readFileSync(new URL('../src/data/user-flow-content.json',import.meta.url),'utf8')) as typeof import('../src/data/user-flow-content.json'); 

for(const [project,route] of [['fx','/fx'],['fusion','/fusion'],['ai','/uoaui'],['winking','/winking-star'],['deal','/deal-model']] as const){
 test(`${project} user flow preserves readable mobile size, theme and text alternatives`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(route);
  const consent=page.getByRole('button',{name:'No thanks'});if(await consent.isVisible())await consent.click();
  const flow=page.locator('.figma-user-flow');const region=flow.locator('.user-flow-scroll');
  for(const width of [320,390,760,1440]){
   await page.setViewportSize({width,height:900});
   for(const theme of ['light','dark']){
    await setTheme(page,theme==='dark');
    const img=region.locator('img:visible');await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('src',`/art/user-flows/${project}-${theme}.svg`);
    await img.evaluate(async(n:HTMLImageElement)=>{n.loading='eager';await n.decode();});
    const s=await img.evaluate((n:HTMLImageElement)=>({w:n.clientWidth,h:n.clientHeight,nw:n.naturalWidth,nh:n.naturalHeight}));
    expect(Math.abs(s.w/s.h-s.nw/s.nh)).toBeLessThan(.01);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(width<=760){
     expect(s.w).toBeLessThanOrEqual(width);
     expect(await region.evaluate(n=>n.scrollWidth-n.clientWidth)).toBeLessThanOrEqual(1);
     await flow.getByRole('button',{name:'Enlarge map',exact:true}).click();
     await expect.poll(()=>img.evaluate(n=>n.clientWidth)).toBe(1120);
     await expect.poll(()=>region.evaluate(n=>Math.abs(n.scrollLeft-(n.scrollWidth-n.clientWidth)/2))).toBeLessThan(2);
     await region.focus();const before=await region.evaluate(n=>n.scrollLeft);await page.keyboard.press('ArrowRight');await expect.poll(()=>region.evaluate(n=>n.scrollLeft)).toBeGreaterThan(before);
     await flow.getByRole('button',{name:'Fit to screen',exact:true}).click();
     await expect(flow.getByRole('button',{name:'Enlarge map',exact:true})).toHaveAttribute('aria-pressed','false');
     expect(await region.evaluate(n=>n.scrollWidth-n.clientWidth)).toBeLessThanOrEqual(1);
    }
   }
  }
  await expect(flow.locator('.user-flow-transcript')).toHaveCount(0);
  await expect(flow.getByRole('heading',{name:'User flow in detail',exact:true})).toHaveCount(0);
  await expect(flow.getByRole('heading',{name:'Actions, branches and returns',exact:true})).toHaveCount(0);
  await expect(flow.locator('details')).toHaveCount(0);
  await expect(page.locator('a[href*="figma.com"]')).toHaveCount(0);
  await expect(flow.locator('.flow-scope')).toContainText(content[project].scope);
 });
 test(`${project} explanation artwork fits, follows theme and retains scope`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
  const consent=page.getByRole('button',{name:'No thanks'});if(await consent.isVisible())await consent.click();
  const section=page.locator('.visual-explanation');
  for(const width of [320,390,820,1440]){
   await page.setViewportSize({width,height:900});
   for(const theme of ['light','dark']){
    await setTheme(page,theme==='dark');await page.evaluate(()=>document.fonts.ready);
    const arts=section.locator('[role=img]:visible');
    await expect(arts).toHaveCount(explanations[project].cards.length);
    for(const [i,art]of(await arts.all()).entries()){
     await expect(art).toHaveClass(new RegExp(`explanation-${theme}`));
     await expect(art).toHaveAttribute('aria-label',explanations[project].cards[i].title+'. '+explanations[project].cards[i].diagramDescription+'. '+explanations[project].cards[i].body);
     const bounds=await art.evaluate(n=>{const r=n.getBoundingClientRect();return {w:r.width,clipped:[...n.querySelectorAll('text')].filter(t=>{const b=t.getBoundingClientRect();return b.left<r.left-1||b.right>r.right+1||b.bottom>r.bottom+1||b.top<r.top-1;}).map(t=>t.textContent)};});
     expect(bounds.w).toBeGreaterThan(250);expect(bounds.w).toBeLessThanOrEqual(337);expect(bounds.clipped).toEqual([]);
     await expect(section.locator('.explanation-copy h5').nth(i)).toHaveText(explanations[project].cards[i].title);
     await expect(art.locator('text[font-size="20"]')).toHaveCount(0);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   }
  }
  await expect(section.locator('.explanation-caption')).toHaveText(explanations[project].caption);
  await expect(page.locator('main details')).toHaveCount(0);
 });
 test(`${project} user-flow labels fit and connectors attach to the correct nodes`,async({page})=>{
  const graph=content[project];
  for(const edge of graph.edges){
   const source=graph.nodes.find(n=>n.id===edge.source)!;const target=graph.nodes.find(n=>n.id===edge.target)!;
   for(const [node,point] of [[source,edge.points[0]],[target,edge.points.at(-1)!]] as const){
    const [x,y]=point;
    expect(x>=node.x&&x<=node.x+node.width&&y>=node.y&&y<=node.y+node.height).toBe(true);
    expect(x===node.x||x===node.x+node.width||y===node.y||y===node.y+node.height).toBe(true);
   }
  }
  for(const theme of ['light','dark']){
   await page.goto(`/art/user-flows/${project}-${theme}.svg`);await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('[id="Editable user flow nodes"] > g')).toHaveCount(graph.nodes.length);
   const errors=await page.evaluate(()=>{
    const nodes=[...document.querySelector('[id="Editable user flow nodes"]')!.children];const errors:string[]=[];
    const rects=nodes.map(n=>n.querySelector('rect')!.getBoundingClientRect());
    nodes.forEach((n,i)=>{const r=rects[i];let previous=r.top;for(const t of n.querySelectorAll('text')){const b=t.getBoundingClientRect();if(b.left<r.left-1||b.right>r.right+1||b.top<previous-1||b.bottom>r.bottom+1)errors.push('Node text: '+t.textContent);previous=b.bottom;}});
    const labels=[...document.querySelectorAll('g')].filter(g=>g.id.startsWith('Path label'));
    for(const l of labels){const b=l.getBoundingClientRect();for(const r of rects)if(b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top)errors.push('Label overlaps node: '+l.textContent);}
    return errors;
   });
   expect(errors).toEqual([]);
  }
 });
}
