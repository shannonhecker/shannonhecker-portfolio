import type { ThemeId } from './art';

// Detailed plates are original Higgsfield artwork, prepared only after Play.
// The procedural scene remains a network fallback.
const plates = new Map<ThemeId, HTMLImageElement>();
export function prepareScenery(ids: ThemeId[]) {
  return Promise.all(ids.map((id) => {
    scenery(id);
    const image = plates.get(id)!;
    return Promise.race([image.decode().catch(() => {}), new Promise<void>((resolve) => setTimeout(resolve, 6000))]);
  }));
}
export function scenery(id: ThemeId) {
  let image = plates.get(id);
  if (!image) {
    image = new Image();
    image.decoding = 'async';
    image.src = `/game/scene-${id}.webp`;
    plates.set(id, image);
  }
  return image.complete && image.naturalWidth ? image : null;
}

// A quiet, clearly bounded collision surface, in the same daylight palette
// as the cover. Pixel details are drawn at world resolution, not enlarged.
export function ground(ctx: CanvasRenderingContext2D, x: number, y: number, top: boolean, id: ThemeId) {
  const grass=['kaohsiung','lingtung','london','bedtime'].includes(id);
  const night=id==='ai'||id==='desk';
  ctx.fillStyle=night?'#302952':grass?'#9f633f':'#526b91';ctx.fillRect(x,y,32,32);
  ctx.fillStyle=night?'#1b1733':grass?'#663c32':'#283852';
  ctx.fillRect(x,y+30,32,2);ctx.fillRect(x+30,y,2,32);
  ctx.fillRect(x+4,y+12,6,4);ctx.fillRect(x+19,y+23,5,3);
  if(top){ctx.fillStyle='#15243c';ctx.fillRect(x,y,32,2);ctx.fillStyle=grass?'#72c841':night?'#9c83eb':'#8dc5e2';ctx.fillRect(x,y+2,32,6);ctx.fillStyle=grass?'#398443':'#405b80';for(let n=0;n<32;n+=8)ctx.fillRect(x+n,y+8,6,4);}
}
