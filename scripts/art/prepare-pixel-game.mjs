// Normalize the authorized Nano Banana sheets without changing their source files.
// Usage: node scripts/art/prepare-pixel-game.mjs /path/to/pixel-v2
import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const source=process.argv[2];
if(!source)throw new Error('Supply the source sheet directory');
const out='public/game';await mkdir(`${out}/avatar-walk`,{recursive:true});
const names=['kaohsiung','lingtung','web','london','tower','desk','ai','bedtime'];
for(let i=0;i<8;i++){
 const flat=await sharp(`${source}/${i}.png`).resize(480,270,{fit:'contain',kernel:'nearest',background:'#172944'}).png({palette:true,colours:32,dither:0}).toBuffer();
 await sharp(flat).webp({lossless:true}).toFile(`${out}/scene-${names[i]}.webp`);
}
for(const [i,name,w,h] of [[11,'world-map',480,270],[12,'banner',960,240]]){
 const flat=await sharp(`${source}/${i}.png`).resize(w,h,{fit:'contain',kernel:'nearest',background:'#39bdd5'}).png({palette:true,colours:32,dither:0}).toBuffer();
 await sharp(flat).webp({lossless:true}).toFile(`${out}/${name}.webp`);
}
async function slots(index,columns,rows){
 const {data,info}=await sharp(`${source}/${index}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=4){const [r,g,b]=data.subarray(i,i+3);if(r>150&&b>150&&g<110&&r-g>70&&b-g>70)data[i+3]=0;}
 const keyed=await sharp(data,{raw:info}).png().toBuffer();const result=[];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
 const left=Math.round(x*info.width/columns),top=Math.round(y*info.height/rows);
 const cell=await sharp(keyed).extract({left,top,width:Math.round((x+1)*info.width/columns)-left,height:Math.round((y+1)*info.height/rows)-top}).png().toBuffer();
 result.push(await sharp(cell).trim({threshold:12}).png().toBuffer());
 }return result;
}
const objectNames=['star','journal','arrow','gem','stone','wood','desk','glass','clock','bug','cloud','moon','flag','finish','scooter','heart'];
const objects=await slots(9,4,4);
for(let i=0;i<objects.length;i++){
 const pixels=await sharp(objects[i]).resize(32,32,{fit:'inside',kernel:'nearest'}).png({palette:true,colours:16,dither:0}).toBuffer();
 await sharp(pixels).webp({lossless:true}).toFile(`${out}/${objectNames[i]}.webp`);
}
const enemies=await slots(10,8,1),foes=['mosquito','deadline','beetle','pigeon','meeting','change','hallucination','screen'];
for(let i=0;i<enemies.length;i++)await sharp(enemies[i]).resize(24,24,{fit:'inside',kernel:'nearest'}).webp({lossless:true}).toFile(`${out}/foe-${foes[i]}.webp`);
const frames=await slots(8,4,1);const metas=await Promise.all(frames.map(f=>sharp(f).metadata()));
const scale=46/Math.max(...metas.map(m=>m.height));
for(let i=0;i<frames.length;i++){
 const w=Math.round(metas[i].width*scale),h=Math.round(metas[i].height*scale);
 const sprite=await sharp(frames[i]).resize(w,h,{kernel:'nearest'}).png({palette:true,colours:20,dither:0}).toBuffer();
 await sharp({create:{width:32,height:48,channels:4,background:'#00000000'}}).composite([{input:sprite,left:Math.floor((32-w)/2),top:48-h}]).png().toFile(`${out}/avatar-walk/0${i+1}.png`);
}
// Keep prompts and provider receipts beside the production script.
await writeFile('docs/game-art-generation.json',JSON.stringify({provider:'Higgsfield / Nano Banana 2.1',credits:26,date:'2026-10-10',requests:JSON.parse(await readFile(`${source}/requests.json`)),jobs:JSON.parse(await readFile(`${source}/jobs.json`))},null,2));
