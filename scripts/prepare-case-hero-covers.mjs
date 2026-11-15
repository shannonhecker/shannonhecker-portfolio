import fs from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
await fs.mkdir('public/art/case-responsive',{recursive:true});
const records=[];
for(const [name,ratio] of [['winking-hero-composition',.33],['deal-hero-composition',.75],['ai-hero-builder-composition',1.05],['ai-hero-kit-composition',1.05]]){
 const source=`public/art/${name}.svg`,original=await fs.readFile(source,'utf8');
 for(const width of [400,800,1600,2400]){
  let svg=original;const images=[];
  for(const m of original.matchAll(/data:image\/[^;]+;base64,([^"\s]+)/g)){
   const input=Buffer.from(m[1],'base64'),meta=await sharp(input).metadata();
   const target=Math.min(meta.width,Math.ceil(width*ratio));
   if(target>=meta.width){images.push({originalWidth:meta.width,originalHeight:meta.height,width:meta.width,height:meta.height,losslessResizedPixelMatch:true,encoding:'Original embedded bytes retained'});continue;}
   const resized=await sharp(input).resize({width:target,withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   let image=await sharp(resized.data,{raw:{width:resized.info.width,height:resized.info.height,channels:resized.info.channels}}).webp({lossless:true,effort:6}).toBuffer();
   let format='webp';
   if(!(await sharp(image).ensureAlpha().raw().toBuffer()).equals(resized.data)){ image=await sharp(resized.data,{raw:{width:resized.info.width,height:resized.info.height,channels:resized.info.channels}}).png({compressionLevel:9}).toBuffer();format='png'; }
   if(!(await sharp(image).ensureAlpha().raw().toBuffer()).equals(resized.data))throw new Error('Lossless mismatch');
   const displayLossy=name!=='ai-hero-kit-composition';
   if(displayLossy){image=await sharp(resized.data,{raw:{width:resized.info.width,height:resized.info.height,channels:resized.info.channels}}).webp({quality:95,effort:6}).toBuffer();format='webp';}
   svg=svg.replace(m[0],`data:image/${format};base64,${image.toString('base64')}`);
   images.push({originalWidth:meta.width,originalHeight:meta.height,width:resized.info.width,height:resized.info.height,losslessResizedPixelMatch:!displayLossy,encoding:displayLossy?'WebP quality95 display derivative':format+' lossless'});
  }
  const strip=s=>s.replace(/data:image\/[^;]+;base64,[^"\s]+/g,'RASTER');
  if(strip(svg)!==strip(original))throw new Error('Geometry changed');
  const output=`public/art/case-responsive/${name}-${width}.svg`;await fs.writeFile(output,svg);
  records.push({source,sourceSha256:createHash('sha256').update(original).digest('hex'),output,displayWidth:width,rasterFootprintRatio:ratio,sourceBytes:Buffer.byteLength(original),bytes:Buffer.byteLength(svg),geometryIdentical:true,images});
 }
}
await fs.writeFile('docs/case-hero-responsive-delivery.json',JSON.stringify({date:'2026-10-12',method:'Exact vector wrapper retained. Embedded screenshot sizes follow screen footprint with sampling margin. AI kit uses lossless encoding; other display-only rasters use WebP quality95. Original SVGs and full-size links unchanged.',records},null,2)+'\n');console.log('Prepared',records.length,'hero derivatives');
