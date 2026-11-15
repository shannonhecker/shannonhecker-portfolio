// Run through use_figma with `cards` from figma-workflow-summaries.json.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('460:9348'));
const changed=[];
for(const item of cards){
 const card=await figma.getNodeByIdAsync(item.nodeId);
 for(const t of card.findAllWithCriteria({types:['TEXT']}))for(const seg of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(seg.fontName);
 const dark=item.theme==='dark',a=dark?'#b9d5b8':'#4f7352',f=dark?'#edf0f4':'#202932',m=dark?'#b8c0ca':'#56616b',l=dark?'#46515f':'#d6dce1',s=dark?'#222933':'#ffffff';
 const rect=(x,y,w,h,stroke=l,fill=s)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}"/>`;
 const text=(x,y,v,size=11,color=m)=>`<text x="${x}" y="${y}" font-family="Inter" font-size="${size}" fill="${color}">${v}</text>`;
 const path=(d,color=a)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
 const tick=(x,y,color=a)=>path(`M${x} ${y}l3 3 6-7`,color);
 let art='';
 if(item.step===0){
  art=text(8,17,'Your family',12,f)+text(8,35,'Choose whose routines to open');
  for(let i=0;i<2;i++){const x=8+i*150;art+=rect(x,47,140,118,i===0?a:l)+`<circle cx="${x+28}" cy="76" r="17" fill="${i===0?a:l}"/>`+text(x+23,80,i===0?'L':'M',12,s)+text(x+53,74,i===0?'Leo':'Maya',12,f)+text(x+53,92,i===0?'Selected':'Choose child',10)+path(`M${x+14} 115h112 M${x+14} 135h72`,l)+text(x+14,154,i===0?'Routines for Leo':'Routines for Maya',10);}
 }
 if(item.step===1){
  art=rect(4,4,304,167)+text(14,24,'Leo · this week',12,f)+text(14,44,'Tap the routine for the right day',10);
  ['M','T','W','T','F','S','S'].forEach((v,i)=>art+=text(114+i*26,64,v,10));
  ['Teeth','Reading','Bath'].forEach((v,r)=>{art+=text(14,87+r*26,v,11,f);for(let c=0;c<7;c++){const on=(r===0&&c<3)||(r===1&&c<2);art+=rect(108+c*26,73+r*26,20,20,on?a:l,on?a:s);if(on)art+=tick(113+c*26,83+r*26,s);}});
 }
 if(item.step===2){
  art=rect(4,4,304,166)+text(15,25,'Stars help the weekly pet grow',12,f)+text(15,45,'Progress builds across completed routines',10);
  ['Egg','Hatching','Growing','Grown'].forEach((v,i)=>{const x=38+i*78;art+=`<ellipse cx="${x}" cy="83" rx="15" ry="20" fill="${i<2?a:s}" stroke="${a}" stroke-width="1.5"/>`;if(i===1)art+=path(`M${x-9} 84l6-6 5 7 7-8`,s);if(i>=2)art+=`<circle cx="${x-5}" cy="80" r="2" fill="${a}"/><circle cx="${x+5}" cy="80" r="2" fill="${a}"/>`;art+=text(x-v.length*2.6,119,v,10);if(i<3)art+=path(`M${x+23} 83h25m-5-4 5 4-5 4`);});
  art+=text(15,150,'Monday → a new egg for the next week',11);
 }
 if(item.step===3){
  art=rect(5,8,120,42)+text(17,26,'Parent',12,f)+text(17,42,'Share invite link',10)+path('M130 29h49m-5-4 5 4-5 4')+rect(187,8,120,42)+text(197,26,'Second adult',12,f)+text(197,42,'Join the family',10);
  art+=path('M65 54v15h91v12 M247 54v15h-91')+rect(48,84,216,88,a)+text(62,105,'One shared family board',12,f)+text(62,125,'Teeth',11)+text(160,125,'Reading',11)+tick(123,122)+tick(228,122)+path('M62 139h188',l)+text(62,159,'Same children · same routines',10);
 }
 const previous=card.children.find(n=>n.name.startsWith('Schematic'));
 const index=card.children.indexOf(previous);const node=figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="312" height="180" viewBox="0 0 312 180">${art}</svg>`);node.name=previous.name;card.insertChild(index,node);previous.remove();
 const texts=card.children.filter(n=>n.type==='TEXT');texts[1].fontSize=16;texts[1].lineHeight={unit:'PIXELS',value:22};texts[2].fontSize=14;texts[2].lineHeight={unit:'PIXELS',value:20};
 card.resize(336,348);changed.push({id:card.id,width:card.width,height:card.height,art:node.id});
}
return {changed};
