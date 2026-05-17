// Static hero banner: three iPhone screenshots tilted on cream.
// Replaces the animated MP4 as the page cover; the MP4 moves into the
// "In the app" content section below.
//
// Run from motion/:  node scripts/winkingstar-hero-banner.js

const sharp = require('sharp');
const path  = require('path');

const ROOT       = path.resolve(__dirname, '..');
const ASSETS_DIR = path.resolve(ROOT, '../assets');

const W = 1600, H = 700;                     // 16:7 to match other case-study covers
const BG = { r: 248, g: 241, b: 228, alpha: 1 }; // earthy.cream #F8F1E4
const PHONE_H = 600;                          // phone height in the frame
const RADIUS  = 28;                           // rounded corners on the phone screenshots

const SHOTS = [
  { src: `${ASSETS_DIR}/winkingstar-shot-board.webp`,  rotate: -6, cx: 380 },
  { src: '/private/tmp/winkingstar-iphone-responsive-activity.png', rotate: 0,  cx: 800 },
  { src: `${ASSETS_DIR}/winkingstar-shot-petpals.webp`, rotate: 6,  cx: 1220 },
];

async function loadPhone(src, rotateDeg) {
  // 1. Resize so height = PHONE_H, preserve aspect
  const resized = await sharp(src)
    .resize({ height: PHONE_H, fit: 'inside' })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();

  // 2. Round corners
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">
       <rect x="0" y="0" width="${meta.width}" height="${meta.height}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/>
     </svg>`
  );
  const rounded = await sharp(resized)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Rotate with transparent corners
  if (rotateDeg === 0) {
    return { buf: rounded, w: meta.width, h: meta.height };
  }
  const rotated = await sharp(rounded)
    .rotate(rotateDeg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const rMeta = await sharp(rotated).metadata();
  return { buf: rotated, w: rMeta.width, h: rMeta.height };
}

(async () => {
  const phones = await Promise.all(SHOTS.map(s => loadPhone(s.src, s.rotate)));
  const layers = phones.map((p, i) => ({
    input: p.buf,
    left: Math.round(SHOTS[i].cx - p.w / 2),
    top:  Math.round((H - p.h) / 2),
  }));

  const out = path.resolve(ASSETS_DIR, 'winkingstar-hero-banner.webp');
  await sharp({
    create: { width: W, height: H, channels: 4, background: BG },
  })
    .composite(layers)
    .flatten({ background: BG })
    .webp({ quality: 88, effort: 5 })
    .toFile(out);

  console.log(`Wrote ${out}`);
  for (let i = 0; i < phones.length; i++) {
    console.log(`  phone ${i}: ${phones[i].w}×${phones[i].h} centred at x=${SHOTS[i].cx}, rotate=${SHOTS[i].rotate}°`);
  }
})();
