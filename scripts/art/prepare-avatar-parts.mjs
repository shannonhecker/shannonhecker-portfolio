// Register the generated eye/mouth components to the approved 320 × 480 body.
// Usage: node scripts/art/prepare-avatar-parts.mjs /path/to/face-parts.png
import sharp from 'sharp';
import fs from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Supply the Nano Banana facial-part sheet.');
const atlas = await sharp(source).resize(1908,1280).png().toBuffer();
const base = 'public/art/avatar-idle-0.webp';
const width=320,height=480;
const skin = Buffer.from(`<svg width="320" height="480"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fbd6b5"/><stop offset="1" stop-color="#fbd0ad"/></linearGradient></defs><path fill="url(#s)" d="M128 87Q135 80 143 88L148 98 143 110 129 110 123 101 123 93Z M168 87Q176 81 182 88L188 96 186 105 180 110 166 108 161 98 162 92Z"/></svg>`);
const patches = {
  half: [[798,278,166,119,121,85,26,24],[1065,278,136,119,163,85,24,24]],
  closed: [[1435,278,164,119,121,85,26,24],[1700,278,139,119,163,85,24,24]],
  smile: [[958,1080,144,70,145,110,19,10]],
};
await fs.mkdir('public/art/avatar-parts',{recursive:true});
for(const [name,regions] of Object.entries(patches)){
 const layers=name==='smile'?[]:[{input:skin,left:0,top:0}];
 for(const [left,top,w,h,x,y,tw,th] of regions){
  const {data,info}=await sharp(atlas).extract({left,top,width:w,height:h}).resize(tw,th).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let py=0;py<th;py++)for(let px=0;px<tw;px++){
   const i=(py*tw+px)*4;
   const [r,g,b]=data.subarray(i,i+3);
   if(name!=='smile'){
    // Remove the sheet's complexion, retaining only generated lashes/iris/whites.
    const ink=r<130&&g<100&&b<90;
    const white=r>210&&g>205&&b>200;
    data[i+3]=ink||white?255:0;
    if(x===163&&px>=tw-2)data[i+3]=0;
   }else{
    // Keep only the mouth; background remains the original face.
    data[i+3]=(r-g>45&&g<160)||(r>230&&g>225&&b>215)?255:0;
   }
  }
  layers.push({input:await sharp(data,{raw:info}).png().toBuffer(),left:x,top:y});
 }
 const output=`public/art/avatar-parts/${name}.webp`;
 await sharp({create:{width,height,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:true}).toFile(output);
 const registered=await sharp(base).composite([{input:output}]).png().toBuffer();
 await sharp(registered).resize(640,960,{kernel:'nearest'}).png().toFile(`/private/tmp/portfolio-review/redraw/registered-${name}.png`);
}
