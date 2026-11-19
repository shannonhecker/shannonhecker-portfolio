import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const content=JSON.parse(readFileSync(new URL('../src/data/user-flow-content.json',import.meta.url),'utf8')) as typeof import('../src/data/user-flow-content.json'); 

for(const project of ['fusion','ai','winking','deal'] as const){
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
