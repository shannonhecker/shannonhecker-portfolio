// Register generated arm poses to the approved avatar. The face, hair, torso,
// trousers and shoes remain the original pixels in every animation frame.
// Usage: node scripts/art/prepare-greeting.mjs /path/to/greeting-sheet.png
import sharp from 'sharp';
import fs from 'node:fs/promises';
const source=process.argv[2];
if(!source)throw new Error('Supply the three-pose greeting sheet.');
const out='public/art/avatar-greeting';await fs.mkdir(out,{recursive:true});
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
// Remove the generator's translucent halo, keeping crisp opaque sprite pixels.
for(let i=3;i<data.length;i+=4)data[i]=data[i]>=244?255:0;
const mask=path=>Buffer.from(`<svg width="320" height="480"><path d="${path}" fill="white"/></svg>`);
const erase=mask('M85 220 L126 209 L121 240 L121 300 L85 300 Z');
const base=await sharp('public/art/avatar-idle-0.webp').composite([{input:erase,blend:'dest-out'}]).png().toBuffer();
const paths=['M79 174 L107 168 L130 190 L141 210 L141 236 L103 239 L78 221 Z','M78 110 L124 109 L132 149 L143 176 L142 214 L100 218 L78 196 Z'];
for(let n=1;n<=2;n++){
 const sx=Math.round(n*info.width/3),ex=Math.round((n+1)*info.width/3);let x0=ex,y0=info.height,x1=0,y1=0;
 for(let y=0;y<info.height;y++)for(let x=sx;x<ex;x++)if(data[(y*info.width+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 let hx0=ex,hx1=0;for(let y=y0;y<y0+100;y++)for(let x=sx;x<ex;x++)if(data[(y*info.width+x)*4+3]){hx0=Math.min(hx0,x);hx1=Math.max(hx1,x);}
 const scale=450/(y1-y0+1),left=Math.round(165-((hx0+hx1)/2-x0)*scale);
 const sprite=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize({height:450,kernel:'nearest'}).png().toBuffer();
 const registered=await sharp({create:{width:320,height:480,channels:4,background:'#00000000'}}).composite([{input:sprite,left,top:20}]).png().toBuffer();
 const arm=await sharp(registered).composite([{input:mask(paths[n-1]),blend:'dest-in'}]).png().toBuffer();
 const posed=await sharp(base).composite([{input:arm}]).png().toBuffer();
 if(n===2){
  const handMask=mask('M91 109 L129 109 L128 145 L119 157 L99 155 L91 141 Z');
  const hand=await sharp(registered).composite([{input:handMask,blend:'dest-in'}]).webp({lossless:true}).toBuffer();
  const hairBehind=await sharp('public/art/avatar-idle-0.webp').composite([{input:handMask,blend:'dest-in'}]).png().toBuffer();
  const cleared=await sharp(posed).composite([{input:handMask,blend:'dest-out'}]).png().toBuffer();
  await sharp(cleared).composite([{input:hairBehind}]).webp({quality:92,alphaQuality:100,effort:6}).toFile(`${out}/wave.webp`);
  await fs.writeFile(`${out}/hand.webp`,hand);
 }else await sharp(posed).webp({quality:92,alphaQuality:100,effort:6}).toFile(`${out}/lift.webp`);
}
