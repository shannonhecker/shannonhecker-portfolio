// Winking Star case-study hero video.
//
// 12-second composition built scene-by-scene with sharp + ffmpeg-static.
// Pure-Node — bypasses Remotion's Chrome dependency which times out on
// macOS 12. See ../../docs/superpowers/specs/2026-05-17-winkingstar-case-study-design.md
// for the storyboard rationale.
//
// Run from motion/:  node scripts/winkingstar-hero-mp4.js

const sharp     = require('sharp');
const path      = require('path');
const fs        = require('fs');
const { spawnSync } = require('child_process');
const ffmpegBin = require('ffmpeg-static');

// ── Constants ──────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const ASSETS_DIR = path.resolve(ROOT, '../assets');
const IOS_ASSETS = path.resolve(process.env.HOME, 'Documents/Cursor/weekly-superstar-ios/assets');
const FRAMES_DIR = path.resolve(ROOT, 'out/winkingstar-frames');
const FINAL_MP4  = path.resolve(ASSETS_DIR, 'winkingstar-hero.mp4');
const POSTER     = path.resolve(ASSETS_DIR, 'winkingstar-poster.webp');
const CARD       = path.resolve(ASSETS_DIR, 'winkingstar-card.webp');

const W = 1600, H = 700;          // 16:7 frame
const FPS = 30;
const SECONDS = 12;
const TOTAL_FRAMES = FPS * SECONDS;        // 360
const PAD = 36;
const RADIUS = 14;

const BG = { r: 248, g: 241, b: 228, alpha: 1 };          // earthy.cream #F8F1E4
const COCOA = '#5A3A2E';                                  // earthy.cocoa
const IVORY = '#FFFAF0';                                  // earthy.ivory

// ── Scene timeline (frames are 30fps) ──────────────────────────────────────
// 0.0–1.0s   icon zoom in
// 1.0–1.5s   icon hold
// 1.5–2.0s   cross-fade icon → loading screen
// 2.0–3.5s   loading screen + loading bar fills
// 3.5–4.0s   cross-fade loading → Home product
// 4.0–5.5s   Home tab held
// 5.5–6.5s   ✦ tap moment on Home card
// 6.5–7.0s   cross-fade Home → Activity
// 7.0–8.0s   Activity tab held
// 8.0–9.0s   ✦ tap moment on Activity "Shaul is growing" panel
// 9.0–9.5s   cross-fade Activity → iPad Treasure
// 9.5–10.5s  iPad Treasure held
// 10.5–11.5s ✦ tap moment on iPad mystery drawer
// 11.5–12.0s outro hold (loop point: HTML JS seeks back to 4.0s)

const T = {
  iconZoom:   { s: 0,   e: 30  },   // 1.0s
  iconHold:   { s: 30,  e: 45  },   // 0.5s
  iconToLoad: { s: 45,  e: 60  },   // 0.5s
  loading:    { s: 60,  e: 105 },   // 1.5s
  loadToHome: { s: 105, e: 120 },   // 0.5s
  homeHold:   { s: 120, e: 165 },   // 1.5s
  homeTap:    { s: 165, e: 195 },   // 1.0s
  homeToAct:  { s: 195, e: 210 },   // 0.5s
  actHold:    { s: 210, e: 225 },   // 0.5s
  actScroll:  { s: 225, e: 249 },   // 0.8s — pan down 12% to reveal Weekly Goal
  actTap:     { s: 249, e: 279 },   // 1.0s
  actToTreas: { s: 279, e: 294 },   // 0.5s
  treasHold:  { s: 294, e: 300 },   // 0.2s (compressed to make room for scroll)
  treasTap:   { s: 300, e: 330 },   // 1.0s
  outroHold:  { s: 330, e: 360 },   // 1.0s
};
const ACTIVITY_SCROLL_FRACTION = 0.12; // pan 12% of the activity image height
const LOOP_START_FRAME = T.loadToHome.s; // 105 — HTML JS seeks here on end

// ── Tap positions (centre of target, expressed as a fraction of the source
//    image dimensions so they survive any resize). Measured by eye from the
//    fresh /private/tmp/winkingstar-*.png captures.
const TAPS = {
  home:         { fx: 0.30, fy: 0.38 },  // "Leo the Brave" card centre on demo-board
  // Activity tap fires AFTER the scroll, so fy is the trophy/Weekly Goal area
  // in the original image (which is now visually centred post-scroll).
  activity:     { fx: 0.50, fy: 0.78 },  // "Park picnic" Weekly Goal trophy row
  ipadTreasure: { fx: 0.30, fy: 0.56 },  // "3 surprises found" treasure-room panel (iconic)
};

// ── Helpers ────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

// Load + pre-resize an image to fit inside a target box, returning the
// buffer plus its scaled dims (so callers can position centred).
async function loadFit(src, maxW, maxH) {
  const file = src;
  const buf = await sharp(file)
    .resize({ width: maxW, height: maxH, fit: 'inside' })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  // Original dims for tap-coord remapping
  const origMeta = await sharp(file).metadata();
  return { buf, w: meta.width, h: meta.height, ow: origMeta.width, oh: origMeta.height };
}

// Sharp blank canvas with cream bg, then composite given layers and flatten
// to RGB so libx264 → yuv420p has no alpha residue.
function compose(layers) {
  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(layers)
    .flatten({ background: BG })
    .png()
    .toBuffer();
}

// Resize image to scale × its loaded dims, keep alpha, set opacity. Returns a
// composite layer with centred positioning.
async function layerScaled(shot, scale, opacity) {
  if (opacity <= 0) return null;
  const targetW = Math.round(shot.w * scale);
  const targetH = Math.round(shot.h * scale);
  if (targetW < 1 || targetH < 1) return null;
  const buf = await sharp(shot.buf)
    .resize(targetW, targetH)
    .ensureAlpha(opacity)
    .png()
    .toBuffer();
  return {
    input: buf,
    left: Math.round((W - targetW) / 2),
    top:  Math.round((H - targetH) / 2),
  };
}

// Same as above but no per-frame resize (uses pre-sized buf as-is). No
// sub-pixel jitter because pixel data is bit-identical across all frames.
// `offsetY` (optional) shifts the layer vertically — used for scroll motion.
async function layerStatic(shot, opacity, offsetY = 0) {
  if (opacity <= 0) return null;
  const buf = await sharp(shot.buf).ensureAlpha(opacity).png().toBuffer();
  return {
    input: buf,
    left: Math.round((W - shot.w) / 2),
    top:  Math.round((H - shot.h) / 2) + Math.round(offsetY),
  };
}

// SVG loading bar overlay. fillT = 0..1.
const BAR_W = 240;
const BAR_H = 10;
function loadingBarSvg(fillT) {
  const fillW = Math.round(BAR_W * clamp(fillT, 0, 1));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${BAR_W}" height="${BAR_H}">
    <rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H/2}" fill="${IVORY}" stroke="${COCOA}" stroke-opacity="0.40" stroke-width="1" />
    <rect x="0" y="0" width="${fillW}" height="${BAR_H}" rx="${BAR_H/2}" fill="${COCOA}" />
  </svg>`);
}

// SVG tap indicator: solid dot + expanding ring. t = 0..1 across the tap window.
//   0.00–0.20 fade in dot
//   0.20–0.70 ring expands + fades; dot stays solid
//   0.70–1.00 dot fades out
function tapIndicatorSvg(t) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const dotR = 18;

  let dotOpacity = 1;
  if (t < 0.20)      dotOpacity = t / 0.20;
  else if (t > 0.70) dotOpacity = 1 - ((t - 0.70) / 0.30);

  const ringT = clamp((t - 0.20) / 0.50, 0, 1);
  const ringR = lerp(dotR, 90, easeOutCubic(ringT));
  // Two stacked strokes: cocoa ring (low alpha) for contrast on light + ivory
  // ring on top — reads on busy/light backgrounds without going washed-out.
  const ringOpacity = 1 - ringT;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${COCOA}" stroke-width="3" opacity="${(ringOpacity * 0.55).toFixed(3)}" />
    <circle cx="${cx}" cy="${cy}" r="${ringR - 1}" fill="none" stroke="${IVORY}" stroke-width="2" opacity="${ringOpacity.toFixed(3)}" />
    <circle cx="${cx}" cy="${cy}" r="${dotR + 1}" fill="none" stroke="${IVORY}" stroke-width="2" opacity="${dotOpacity.toFixed(3)}" />
    <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${COCOA}" opacity="${dotOpacity.toFixed(3)}" />
  </svg>`);
}

// Compute the centre (x, y) in the FINAL composited frame for a tap target
// expressed as fractions (fx, fy) of the source image.
function tapXY(shot, tap) {
  const offsetX = Math.round((W - shot.w) / 2);
  const offsetY = Math.round((H - shot.h) / 2);
  return {
    x: offsetX + Math.round(tap.fx * shot.w),
    y: offsetY + Math.round(tap.fy * shot.h),
  };
}

// ── Scene renderers ────────────────────────────────────────────────────────
//
// Each renderer takes the global frame index and the pre-loaded asset map
// (`A`) and returns a PNG buffer for that frame.

// 0.0–1.0s : app icon fades in + scales 0.6 → 1.0 (ease-out)
async function renderIconZoom(f, A) {
  const t = (f - T.iconZoom.s) / (T.iconZoom.e - T.iconZoom.s);
  const ease = easeOutCubic(clamp(t, 0, 1));
  const scale = lerp(0.6, 1.0, ease);
  const opacity = clamp(t * 1.4, 0, 1);
  const layer = await layerScaled(A.icon, scale, opacity);
  return compose([layer].filter(Boolean));
}

// 1.0–1.5s : icon settles
async function renderIconHold(f, A) {
  const layer = await layerStatic(A.icon, 1);
  return compose([layer]);
}

// 1.5–2.0s : cross-fade icon → loading screen
async function renderIconToLoad(f, A) {
  const t = (f - T.iconToLoad.s) / (T.iconToLoad.e - T.iconToLoad.s);
  const iconL = await layerStatic(A.icon, 1 - t);
  const loadL = await layerStatic(A.loading, t);
  return compose([iconL, loadL].filter(Boolean));
}

// 2.0–3.5s : splash held; loading bar fills below the star figure.
// Using `splash-source.png` — the latest shipped splash, doodle star matching
// the app icon. No wordmark in the new direction; loading bar carries the
// "we're loading" cue alone.
async function renderLoading(f, A) {
  const t = (f - T.loading.s) / (T.loading.e - T.loading.s);
  const layers = [];
  const loadL = await layerStatic(A.loading, 1);
  layers.push(loadL);

  // On splash-source.png the star sits centred (~42% down) and the bottom
  // half is doodle border + open cream. Place the bar at 64% of the image
  // height — below the star, above the bottom doodles.
  const barTopOnImage = Math.round(A.loading.h * 0.64);
  const barTopInFrame = Math.round((H - A.loading.h) / 2) + barTopOnImage;
  const loadingLeftInFrame = Math.round((W - A.loading.w) / 2);
  const barLeftInFrame = loadingLeftInFrame + Math.round((A.loading.w - BAR_W) / 2);

  layers.push({
    input: loadingBarSvg(easeOutCubic(t)),
    left: barLeftInFrame,
    top: barTopInFrame,
  });
  return compose(layers);
}

// 3.5–4.0s : cross-fade loading → Home product
async function renderLoadToHome(f, A) {
  const t = (f - T.loadToHome.s) / (T.loadToHome.e - T.loadToHome.s);
  const loadL = await layerStatic(A.loading, 1 - t);
  const homeL = await layerStatic(A.home,    t);
  return compose([loadL, homeL].filter(Boolean));
}

// Helper: render a product shot with optional tap indicator at local-t.
// `offsetY` (optional) shifts the shot vertically (for scroll motion); the
// tap indicator follows the shot.
async function renderProductShot(shotKey, tapKey, tapLocalT, A, offsetY = 0) {
  const shot = A[shotKey];
  const layers = [];
  const base = await layerStatic(shot, 1, offsetY);
  layers.push(base);

  if (tapKey != null && tapLocalT >= 0 && tapLocalT <= 1) {
    const tap = TAPS[tapKey];
    const { x, y } = tapXY(shot, tap);
    const svg = tapIndicatorSvg(tapLocalT);
    const size = 220;
    layers.push({
      input: svg,
      left: Math.round(x - size / 2),
      top:  Math.round(y - size / 2) + Math.round(offsetY),
    });
  }
  return compose(layers);
}

// Cross-fade between two product shots.
async function renderProductCrossfade(fromKey, toKey, t, A) {
  const fromL = await layerStatic(A[fromKey], 1 - t);
  const toL   = await layerStatic(A[toKey],   t);
  return compose([fromL, toL].filter(Boolean));
}

// ── Master dispatcher ──────────────────────────────────────────────────────
async function renderFrame(f, A) {
  if (f < T.iconZoom.e)      return renderIconZoom(f, A);
  if (f < T.iconHold.e)      return renderIconHold(f, A);
  if (f < T.iconToLoad.e)    return renderIconToLoad(f, A);
  if (f < T.loading.e)       return renderLoading(f, A);
  if (f < T.loadToHome.e)    return renderLoadToHome(f, A);

  // Home hold
  if (f < T.homeHold.e)      return renderProductShot('home', null, -1, A);

  // Home tap
  if (f < T.homeTap.e) {
    const t = (f - T.homeTap.s) / (T.homeTap.e - T.homeTap.s);
    return renderProductShot('home', 'home', t, A);
  }

  // Home → Activity cross-fade
  if (f < T.homeToAct.e) {
    const t = (f - T.homeToAct.s) / (T.homeToAct.e - T.homeToAct.s);
    return renderProductCrossfade('home', 'activity', t, A);
  }

  // Activity hold (no scroll yet)
  if (f < T.actHold.e)       return renderProductShot('activity', null, -1, A, 0);

  // Activity scroll — pan down by ACTIVITY_SCROLL_FRACTION of shot height
  if (f < T.actScroll.e) {
    const t = (f - T.actScroll.s) / (T.actScroll.e - T.actScroll.s);
    const scrollPx = -easeOutCubic(t) * A.activity.h * ACTIVITY_SCROLL_FRACTION;
    return renderProductShot('activity', null, -1, A, scrollPx);
  }

  // Activity tap — stays at scrolled position
  if (f < T.actTap.e) {
    const t = (f - T.actTap.s) / (T.actTap.e - T.actTap.s);
    const scrollPx = -A.activity.h * ACTIVITY_SCROLL_FRACTION;
    return renderProductShot('activity', 'activity', t, A, scrollPx);
  }

  // Activity → iPad Treasure cross-fade (activity stays scrolled)
  if (f < T.actToTreas.e) {
    const t = (f - T.actToTreas.s) / (T.actToTreas.e - T.actToTreas.s);
    const scrollPx = -A.activity.h * ACTIVITY_SCROLL_FRACTION;
    const fromL = await layerStatic(A.activity, 1 - t, scrollPx);
    const toL   = await layerStatic(A.ipadTreasure, t);
    return compose([fromL, toL].filter(Boolean));
  }

  // Treasure hold
  if (f < T.treasHold.e)     return renderProductShot('ipadTreasure', null, -1, A);

  // Treasure tap
  if (f < T.treasTap.e) {
    const t = (f - T.treasTap.s) / (T.treasTap.e - T.treasTap.s);
    return renderProductShot('ipadTreasure', 'ipadTreasure', t, A);
  }

  // Outro hold (freeze the final treasure frame for the loop seam)
  return renderProductShot('ipadTreasure', null, -1, A);
}

// ── Asset loading ──────────────────────────────────────────────────────────
const innerW = W - PAD * 2;
const innerH = H - PAD * 2;

// Apply rounded-corner mask used on the product shots in the frame.
async function withRoundedCorners(buf, w, h) {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <rect x="0" y="0" width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/>
     </svg>`
  );
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

async function loadShotWithRound(src, maxW, maxH) {
  const fit = await loadFit(src, maxW, maxH);
  const rounded = await withRoundedCorners(fit.buf, fit.w, fit.h);
  return { ...fit, buf: rounded };
}

// ── Encoding ───────────────────────────────────────────────────────────────
function encodeMp4() {
  const args = [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAMES_DIR, 'f%04d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-crf', '22',
    '-preset', 'medium',
    FINAL_MP4,
  ];
  const r = spawnSync(ffmpegBin, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed');
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  if (!ffmpegBin || !fs.existsSync(ffmpegBin)) {
    console.error('ffmpeg-static binary missing');
    process.exit(1);
  }
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
  for (const f of fs.readdirSync(FRAMES_DIR)) fs.unlinkSync(path.join(FRAMES_DIR, f));

  console.log('Loading assets...');
  // Icon: square — size for hero "logo reveal" feel, ~480px tall on 700px frame
  const iconBox = 480;
  // Loading: portrait — size up to inner height
  const loadingBoxH = innerH;
  const loadingBoxW = Math.round(loadingBoxH * (941 / 1672));
  // Product shots: fit to inner area, portrait
  // (sizes vary; sharp's `inside` keeps aspect)

  const A = {
    icon:         await loadFit(`${IOS_ASSETS}/icon.png`, iconBox, iconBox),
    // splash-source.png (May 13) is the latest shipped splash — orange doodle
    // star matching the app icon. Replaces the older landscape-based
    // loading.png (May 8).
    loading:      await loadFit(`${IOS_ASSETS}/source/splash-source.png`, loadingBoxW, loadingBoxH),
    home:         await loadShotWithRound(`${ASSETS_DIR}/winkingstar-shot-board.webp`,   innerW, innerH),
    activity:     await loadShotWithRound('/private/tmp/winkingstar-iphone-responsive-activity.png', innerW, innerH),
    ipadTreasure: await loadShotWithRound(`${ASSETS_DIR}/winkingstar-shot-ipad-treasure.webp`, innerW, innerH),
  };
  for (const k of Object.keys(A)) console.log(`  ${k.padEnd(13)}  ${A[k].w}×${A[k].h}`);

  console.log(`Rendering ${TOTAL_FRAMES} frames @${FPS}fps...`);
  const t0 = Date.now();
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const png = await renderFrame(f, A);
    const out = path.join(FRAMES_DIR, `f${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(out, png);
    if (f % 30 === 0) process.stdout.write(`  frame ${f}\n`);
  }
  console.log(`Frames done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);

  console.log('Encoding MP4...');
  encodeMp4();

  // Poster: a frame from the loading scene with the bar mid-fill (good
  // "above-the-fold while video loads" still).
  const posterSrc = path.join(FRAMES_DIR, `f${String(80).padStart(4, '0')}.png`);
  await sharp(posterSrc).webp({ quality: 85 }).toFile(POSTER);

  // Card: the Activity tap moment (richest content; covers OG).
  const cardSrc = path.join(FRAMES_DIR, `f${String(220).padStart(4, '0')}.png`);
  await sharp(cardSrc)
    .resize({ width: 1200, height: 720, fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(CARD);

  const finalStat = fs.statSync(FINAL_MP4);
  console.log(`Done. MP4: ${(finalStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`LOOP_START_FRAME = ${LOOP_START_FRAME} → seek to ${(LOOP_START_FRAME / FPS).toFixed(2)}s on 'ended'`);
})();
