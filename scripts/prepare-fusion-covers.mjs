import fs from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const records=[];
for(const name of ['fusion-hero-discovery-composition','fusion-hero-performance-composition']){
 const source=`public/art/${name}.svg`,original=await fs.readFile(source,'utf8');
 for(const width of [800,1600,2400]){
  let svg=original;const images=[];
  for(const m of original.matchAll(/data:image\/[^;]+;base64,([^"\s]+)/g)){
   const input=Buffer.from(m[1],'base64'),meta=await sharp(input).metadata();
   const rasterWidth=Math.min(meta.width,Math.ceil(width*1.05));
   const resized=await sharp(input).resize({width:rasterWidth,withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const image=await sharp(resized.data,{raw:resized.info}).webp({lossless:true,effort:6}).toBuffer();
   const decoded=await sharp(image).ensureAlpha().raw().toBuffer();
   if(!decoded.equals(resized.data))throw new Error('Lossless encode changed pixels');
   svg=svg.replace(m[0],`data:image/webp;base64,${image.toString('base64')}`);
   images.push({originalWidth:meta.width,originalHeight:meta.height,width:resized.info.width,height:resized.info.height,losslessResizedPixelMatch:true});
  }
  const strip=s=>s.replace(/data:image\/[^;]+;base64,[^"\s]+/g,'RASTER');
  if(strip(original)!==strip(svg))throw new Error('SVG geometry changed');
  const output=`public/art/fusion-responsive/${name}-${width}.svg`;
  await fs.writeFile(output,svg);records.push({source,sourceSha256:createHash('sha256').update(original).digest('hex'),output,displayWidth:width,sourceBytes:Buffer.byteLength(original),bytes:Buffer.byteLength(svg),geometryIdentical:true,images});
 }
}
await fs.writeFile('docs/fusion-responsive-delivery.json',JSON.stringify({date:'2026-10-12',method:'Responsive display SVGs preserve original geometry; embedded screenshots resized with5% sampling margin and losslessWebP encoding. Original full-size sources unchanged. Configuration composition is pure vector and remains unchanged.',records},null,2)+'\n');
console.log('Prepared',records.length,'Fusion display SVGs');
