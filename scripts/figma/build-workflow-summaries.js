// Run in Figma's use_figma context with `content` supplied from workflow-summaries.json.
await figma.loadFontAsync({family:'Inter',style:'Regular'});
await figma.loadFontAsync({family:'Inter',style:'Medium'});
const page=figma.createPage(); page.name='Workflow summaries · illustrated';
await figma.setCurrentPageAsync(page);
const created=[page.id], frames=[], exports=[];
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const paint=h=>[{type:'SOLID',color:rgb(h)}];
const colors={fusion:['#705d8d','#c8b6e2'],winking:['#4f7352','#b9d5b8'],fx:['#496a83','#a4cbe6'],deal:['#8b5168','#e3b3c6'],ai:['#8b5168','#e3b3c6']};
function text(parent,value,size,color,width,medium=false){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Inter',style:medium?'Medium':'Regular'};t.characters=value;t.fontSize=size;t.lineHeight={unit:'PIXELS',value:size*1.4};t.fills=paint(color);t.textAutoResize='HEIGHT';t.resize(width,t.height);created.push(t.id);return t;}
function box(parent,name,width,height,bg){const n=figma.createAutoLayout('VERTICAL');parent.appendChild(n);n.name=name;n.resize(width,height);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.fills=bg?paint(bg):[];created.push(n.id);return n;}
function artwork(key,i,c){
 const {accent:a,muted:m,surface:s,line:l,fg:f}=c;
 const rect=(x,y,w,h,fill=s,stroke=l,r=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
 const line=(d,color=a,sw=2)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const label=(x,y,v,size=11,color=m)=>`<text x="${x}" y="${y}" fill="${color}" font-family="Inter" font-size="${size}">${v}</text>`;
 const dot=(x,y,r=4,fill=a)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
 const check=(x,y)=>line(`M ${x} ${y} l 4 4 l 8 -9`);
 const bars=()=>[0,1,2,3,4].map((v)=>rect(55+v*36,111-v*12,20,15+v*12,a,a,2)).join('');
 const table=(selected=1)=>[0,1,2,3].map(r=>rect(28,45+r*19,256,15,r===selected?a:s,l,2)+line(`M 44 ${53+r*19} h 48 M 125 ${53+r*19} h 30 M 195 ${53+r*19} h 65`,r===selected?s:m,2)).join('');
 const chart=()=>line('M 26 115 H 286 M 26 43 V 115',l)+line('M 30 103 L 64 93 L 99 99 L 137 66 L 176 78 L 220 51 L 284 37');
 let art='';
 if(key==='winking'){
  if(i===0)art=[0,1,2].map((v)=>rect(25+v*93,25,78,95,s,v===0?a:l)+dot(64+v*93,61,18,v===0?a:l)+label(42+v*93,104,v===0?'Selected':'Child',11,v===0?a:m)).join('');
  if(i===1)art=rect(29,18,254,110)+label(43,39,'THIS WEEK',10)+[0,1,2].map(r=>line(`M 44 ${60+r*24} h 66`,m)+[0,1,2,3,4].map(v=>rect(128+v*28,48+r*24,18,18,r===1&&v===2?a:s,l,3)).join('')).join('')+check(188,79);
  if(i===2)art=rect(26,23,260,108)+label(43,45,'WEEKLY PET',10)+`<ellipse cx="86" cy="83" rx="24" ry="29" fill="${s}" stroke="${a}" stroke-width="2"/>`+line('M 71 83 l 10 -8 l 8 9 l 10 -12')+line('M 140 85 H 268',l,3)+[0,1,2,3].map(v=>dot(145+v*38,85,6,v<2?a:l)).join('')+label(140,112,'Daily stars add up',11);
  if(i===3)art=dot(44,62,18)+dot(268,62,18)+rect(103,27,106,93)+line('M 44 85 V 100 H 103 M 268 85 V 100 H 209')+label(124,51,'Family',13,f)+[0,1,2].map(v=>line(`M 119 ${70+v*15} h 62`,m)).join('');
 }else if(key==='fusion'){
  if(i===0)art=rect(30,18,252,112)+label(46,39,'DATA CUBES',10)+[0,1,2].map(v=>rect(44,51+v*22,224,17,v===0?a:s,l,2)+label(52,64+v*22,['Portfolio','Performance','Risk'][v],10,v===0?s:m)).join('');
  if(i===1)art=[0,1,2].map(v=>rect(27+v*91,18,81,22)+label(36+v*91,33,['Period','Assets','Compare'][v],10)).join('')+table(2);
  if(i===2)art=rect(23,16,266,118)+chart()+label(39,34,'Performance',11);
  if(i===3)art=rect(26,15,260,120)+label(41,36,'BOARD REPORT',10)+rect(42,48,104,67)+rect(159,48,108,31)+rect(159,88,108,27)+line('M 50 99 L 73 80 L 96 89 L 132 62');
 }else if(key==='fx'){
  if(i<3)art=rect(18,15,276,122)+chart()+(i===0?dot(137,66,5)+rect(150,32,101,27)+label(159,50,'Fill details',11):i===1?rect(150,37,124,71)+label(161,57,'Order actions',11,f)+label(161,78,'Change limit',11)+label(161,97,'Cancel order',11):line('M 29 75 H 282',a,2)+rect(221,62,63,26,a,a)+label(232,79,'LIMIT',10,s));
  if(i===3)art=rect(49,12,214,128)+label(65,32,'REVIEW CHANGE',10)+line('M 66 51 H 242 M 66 72 H 242',l)+rect(65,87,80,24)+label(79,103,'Cancel',11)+rect(157,87,90,24,a,a)+label(169,103,'Continue',11,s);
  if(i===4)art=rect(40,21,232,106)+label(59,44,'Confirm the change',14,f)+line('M 59 63 H 244',l)+rect(58,79,196,29,a,a)+label(115,98,'Confirm',12,s);
  if(i===5)art=rect(30,16,252,117)+label(47,38,'ORDER HISTORY',10)+[0,1,2].map(v=>dot(50,58+v*26,3)+line(`M 63 ${58+v*26} H 262`,l)).join('')+line('M 50 58 V 111',a,1);
 }else if(key==='deal'){
  if(i===0)art=rect(29,15,254,120)+label(45,37,'NEW DEAL',10)+[0,1,2].map(v=>rect(44,49+v*23,224,17)+label(54,61+v*23,['Name','Region · Segment','Deal lead'][v],10)).join('');
  if(i===1)art=rect(25,17,262,117)+label(42,37,'PORTFOLIO',10)+table(0);
  if(i===2)art=rect(24,16,264,119)+label(41,35,'PRICING ITERATION',10)+bars();
  if(i===3)art=rect(24,16,264,119)+label(40,35,'COMPARE PROPOSALS',10)+[0,1,2].map(v=>rect(41+v*79,47,69,73,s,v===1?a:l)+line(`M ${54+v*79} 64 h 42 M ${54+v*79} 81 h 32 M ${54+v*79} 101 h 40`,v===1?a:m)).join('');
  if(i===4)art=rect(30,17,252,116)+label(47,39,'PROPOSAL REVIEW',10)+line('M 48 59 H 258 M 48 76 H 220',l)+rect(46,90,220,27,a,a)+check(96,103)+label(119,108,'Sign off',12,s);
 }else{
  if(i===0)art=rect(24,21,264,107)+label(42,45,'Describe your screen',13,f)+line('M 43 66 H 241 M 43 81 H 214',l)+rect(190,94,80,22,a,a)+label(207,110,'Generate',10,s);
  if(i===1)art=rect(24,18,264,116)+rect(39,34,43,85)+rect(94,34,176,24)+rect(94,68,83,51)+rect(187,68,83,51)+line('M 49 50 h 20 M 49 64 h 20 M 49 78 h 20',m);
  if(i===2)art=[0,1,2,3].map(v=>rect(22+v*72,24,64,103)+label(27+v*72,45,['Salt','Material','Fluent','Carbon'][v],9)+rect(30+v*72,55,48,28)+rect(30+v*72,91,48,21,a,a)).join('');
  if(i===3)art=rect(24,21,264,111)+[0,1,2].map(v=>label(42,47+v*30,['Density','Theme','Charts'][v],11)+line(`M 125 ${43+v*30} H 265`,l,3)+dot(155+v*36,43+v*30,5)).join('');
  if(i===4)art=rect(25,19,262,113)+label(44,43,'REACT',10)+line('M 70 67 l -15 12 l 15 12 M 242 67 l 15 12 l -15 12 M 167 60 l -20 39')+line('M 93 70 h 36 M 94 85 h 31 M 191 70 h 27 M 186 85 h 33',m);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="312" height="150" viewBox="0 0 312 150">${art}</svg>`;
}
let index=0;
for(const [key,p] of Object.entries(content))for(const theme of ['light','dark']){
 const dark=theme==='dark';const c={accent:colors[key][dark?1:0],muted:dark?'#b8c0ca':'#56616b',surface:dark?'#222933':'#ffffff',line:dark?'#46515f':'#d6dce1',fg:dark?'#edf0f4':'#202932',bg:dark?'#171d23':'#f6f8fa'};
 const root=box(page,`${p.name} · visual workflow · ${theme}`,744,200,c.bg);root.x=160+index*840;root.y=220;index++;root.paddingLeft=root.paddingRight=root.paddingTop=root.paddingBottom=24;root.itemSpacing=20;root.primaryAxisSizingMode='AUTO';
 text(root,p.name+' / Workflow at a glance',22,c.fg,696,true);
 text(root,'Illustrated summary · read in numbered order',14,c.muted,696);
 for(let i=0;i<p.steps.length;i+=2){
  const row=box(root,'Sequence '+(i+1)+'–'+Math.min(i+2,p.steps.length),696,370,null);row.layoutMode='HORIZONTAL';row.itemSpacing=24;
  for(let j=i;j<Math.min(i+2,p.steps.length);j++){
   const step=p.steps[j],card=box(row,`${String(j+1).padStart(2,'0')} · ${step.t}`,336,370,c.surface);card.paddingLeft=card.paddingRight=12;card.paddingTop=card.paddingBottom=16;card.itemSpacing=10;card.cornerRadius=4;card.strokes=paint(c.line);card.strokeWeight=1;
   text(card,`${String(j+1).padStart(2,'0')} / ${String(p.steps.length).padStart(2,'0')}`,12,c.accent,312,true);
   const art=figma.createNodeFromSvg(artwork(key,j,c));card.appendChild(art);art.name='Schematic · '+step.t;created.push(art.id,...art.findAll().map(n=>n.id));
   text(card,step.t,20,c.fg,312,true);
   text(card,step.d,16,c.muted,312);
   if(step.branch)text(card,step.branch.t+' → '+step.branch.d,14,c.accent,312,true);
   exports.push({key,theme,step:j,nodeId:card.id,width:336,height:370});
  }
 }
 if(p.caption)text(root,p.caption,14,c.muted,696);
 frames.push({key,theme,nodeId:root.id,width:root.width,height:root.height});
}
return {pageId:page.id,createdNodeIds:created,frames,exports};
