// Preserve exact authored source SVGs; optimize only home display derivatives.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
const widths=[400,800,1200,1600,2000];
const records=[];
for(const project of ['fx','fusion','ai','winking']) for(const variant of ['current','mobile-current']) {
 const source=`public/art/home-${project}-composition-${variant}.svg`;
 const original=await fs.readFile(source);const svg=original.toString();
 for(const width of widths){
  const extension='svg';
  const output=`public/art/home-responsive/${project}-${variant}-${width}.${extension}`;
  let data;
  {
   let result=svg;
   for(const match of svg.matchAll(/data:image\/[^;]+;base64,([^"\s]+)/g)){
    const image=Buffer.from(match[1],'base64');const metadata=await sharp(image).metadata();
    // Each phone occupies under half the composition width; keep generous sampling.
    const target=Math.min(metadata.width,Math.ceil(width*(project==='winking'?.5:1.5)));
    const resized=await sharp(image).resize({width:target,withoutEnlargement:true}).webp(project==='winking'?{lossless:true,effort:6}:{quality:95,effort:5}).toBuffer();
    result=result.replace(match[0],`data:image/webp;base64,${resized.toString('base64')}`);
   }
   const strip=s=>s.replace(/data:image\/[^;]+;base64,[^"\s]+/g,'RASTER');
   if(strip(result)!==strip(svg))throw new Error(`Geometry changed: ${source}`);
   data=Buffer.from(result);
  }
  await fs.writeFile(output,data);
  records.push({source,sourceSha256:createHash('sha256').update(original).digest('hex'),output,width,bytes:data.length,originalBytes:original.length,vectorGeometryPreserved:true});
 }
}
await fs.writeFile('docs/home-responsive-delivery.json',JSON.stringify({date:'2026-10-12',method:'All original SVG geometry preserved. Only embedded raster screenshots resized and encoded for display; Winking uses lossless encoding, other covers quality95 WebP. Original SVG exports untouched.',records},null,2)+'\n');
console.log('Prepared',records.length,'derivatives');
