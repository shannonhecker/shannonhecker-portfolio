// Shared atlas assets, loaded on Play. The landing page pays no game-art cost.
// Each source keeps its proportions; only transparent atlas gutters were removed.
const assets = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<void>>();
export function illustrated(name: string) {
  const image = assets.get(name);
  return image?.complete && image.naturalWidth ? image : null;
}
function load(name: string, path = `/game/${name}.webp`) {
  const existing = pending.get(name);
  if (existing) return existing;
  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    assets.set(name, image);
    image.onload = image.onerror = () => resolve();
    image.src = path;
    // A failed connection must never prevent the original fallback game playing.
    setTimeout(resolve, 6000);
  });
  pending.set(name, promise);
  return promise;
}
export function prepareIllustrations() {
  return Promise.all([
    ...['world-map','star','journal','arrow','gem','stone','wood','desk','glass','clock','bug','cloud','moon','flag','finish','scooter','heart'].map((name) => load(name)),
    ...['kaohsiung','lingtung','web','london','tower','desk','ai','bedtime'].flatMap(era =>
      [1,2,3,4].map(frame => load(`hero-${era}-${frame}`, `/game/eras/${era}/${frame}.png`))),
    ...['mosquito','deadline','beetle','pigeon','meeting','change','hallucination','screen'].map((name) => load(`foe-${name}`)),
  ]);
}

/** Draw the complete image, bottom-centred in its bounds. */
export function drawIllustration(ctx: CanvasRenderingContext2D, name: string, x: number, bottom: number, w: number, h: number, flip = false) {
  const image = illustrated(name);
  if (!image) return false;
  const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
  const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(bottom));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(image, -width / 2, -height, width, height);
  ctx.restore();
  return true;
}
