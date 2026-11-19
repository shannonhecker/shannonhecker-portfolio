import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const maps=JSON.parse(readFileSync(new URL('../src/data/figma-decision-maps.json',import.meta.url),'utf8')); 

for(const project of ['fusion','ai','winking','deal'] as const) {
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
