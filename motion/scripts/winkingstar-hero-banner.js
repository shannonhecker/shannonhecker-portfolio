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
// Phones near-fill canvas vertically. With ±6° tilt the rotated bounding
// box adds ~35px each side, so 680 source height + 35×2 rotation extents
// = 750 — slightly bigger than canvas; we crop the overhang post-rotate.
const PHONE_H = 680;
const RADIUS  = 36;

// Tighter horizontal spread — phones cluster toward canvas centre.
const SHOTS = [
  { src: `${ASSETS_DIR}/winkingstar-shot-board.webp`,  rotate: -6, cx: 350 },
  { src: '/private/tmp/winkingstar-iphone-responsive-activity.png', rotate: 0,  cx: 800 },
  { src: `${ASSETS_DIR}/winkingstar-shot-petpals.webp`, rotate: 6,  cx: 1250 },
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
  let buf, w, h;
  if (rotateDeg === 0) {
    buf = rounded; w = meta.width; h = meta.height;
  } else {
    buf = await sharp(rounded)
      .rotate(rotateDeg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const rMeta = await sharp(buf).metadata();
    w = rMeta.width; h = rMeta.height;
  }

  // 4. Sharp's composite requires layers fit within canvas; if rotation
  //    pushed the bounding box past the canvas height, crop a centred
  //    H-tall slice. The phone "extends beyond the frame" visually
  //    (editorial style matching TripUp's edge-to-edge density).
  if (h > H) {
    const offset = Math.floor((h - H) / 2);
    buf = await sharp(buf)
      .extract({ left: 0, top: offset, width: w, height: H })
      .png()
      .toBuffer();
    h = H;
  }
  if (w > W) {
    const offset = Math.floor((w - W) / 2);
    buf = await sharp(buf)
      .extract({ left: offset, top: 0, width: W, height: h })
      .png()
      .toBuffer();
    w = W;
  }
  return { buf, w, h };
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
