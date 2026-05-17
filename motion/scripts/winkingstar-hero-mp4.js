// Pure-Node hero video renderer for the Winking Star case study.
// Sidesteps Remotion's Chrome-based bundling on macOS 12 by compositing
// PNG frames directly with sharp, then encoding with ffmpeg-static.
//
// Run from motion/:  node scripts/winkingstar-hero-mp4.js

const sharp     = require('sharp');
const path      = require('path');
const fs        = require('fs');
const { execFileSync, spawnSync } = require('child_process');
const ffmpegBin = require('ffmpeg-static');

// ────────────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const ASSETS_DIR = path.resolve(ROOT, '../assets');
const FRAMES_DIR = path.resolve(ROOT, 'out/winkingstar-frames');
const FINAL_MP4  = path.resolve(ASSETS_DIR, 'winkingstar-hero.mp4');

const W = 1600;
const H = 700;          // 16/7 (close enough: 1600 × 700 = 16:7)
const FPS = 30;
const SECONDS = 10;
const TOTAL_FRAMES = FPS * SECONDS;       // 300
const PAD = 36;
const RADIUS = 14;

const SHOTS = [
  'winkingstar-shot-splash.webp',
  'winkingstar-shot-board.webp',
  'winkingstar-shot-petpals.webp',
];
const SHOT_FRAMES = Math.floor(TOTAL_FRAMES / SHOTS.length); // 100
const FADE = 14; // ~0.45s

const BG = { r: 248, g: 241, b: 228, alpha: 1 }; // earthy.cream #F8F1E4
// ────────────────────────────────────────────────────────────────────────────

const innerH = H - PAD * 2;
const innerW = W  - PAD * 2;

// Pre-load each shot as a buffer scaled to fit inside the inner padding area,
// with a rounded-corner alpha mask.
async function loadShot(src) {
  const file = path.resolve(ASSETS_DIR, src);
  // Resize to fit inside innerW × innerH preserving aspect.
  const resized = await sharp(file)
    .resize({ width: innerW, height: innerH, fit: 'inside' })
    .png()
    .toBuffer();

  // Apply rounded corners by masking.
  const meta = await sharp(resized).metadata();
  const w = meta.width, h = meta.height;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <rect x="0" y="0" width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/>
     </svg>`
  );
  const rounded = await sharp(resized)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  return { buf: rounded, w, h };
}

// Ken Burns: scale frame by [1.0, 1.05] across the shot window.
async function renderFrame(frameIdx, shots) {
  const layers = [];

  for (let i = 0; i < shots.length; i++) {
    const start = i * SHOT_FRAMES;
    const end   = start + SHOT_FRAMES;
    if (frameIdx < start || frameIdx >= end) continue;

    // Opacity: in for non-first shot, out for non-last shot.
    let opacity = 1;
    if (i > 0 && frameIdx < start + FADE) {
      opacity = (frameIdx - start) / FADE;
    } else if (i < shots.length - 1 && frameIdx >= end - FADE) {
      opacity = (end - frameIdx) / FADE;
    }
    // Also fade-in the second shot while first fades out: produce both layers.
    // We do this by NOT skipping the previous shot during its fade-out.
    // Simpler: compute previous shot's fade-out and add it too.

    const zoomT = (frameIdx - start) / SHOT_FRAMES;
    const scale = 1 + 0.05 * zoomT;

    const targetW = Math.round(shots[i].w * scale);
    const targetH = Math.round(shots[i].h * scale);

    const scaled = await sharp(shots[i].buf)
      .resize(targetW, targetH)
      .ensureAlpha(opacity)
      .png()
      .toBuffer();

    layers.push({
      input: scaled,
      left: Math.round((W  - targetW) / 2),
      top:  Math.round((H - targetH) / 2),
    });
  }

  // Cross-fade pair: when in the fade window between shot i and i+1, both
  // contribute. The loop above already handles fade-out for shot i ONLY if
  // it's the current frame's window. To include the OUTGOING shot during the
  // INCOMING shot's first FADE frames, we treat the previous shot specially.
  for (let i = 0; i < shots.length - 1; i++) {
    const handoffStart = (i + 1) * SHOT_FRAMES;
    if (frameIdx >= handoffStart && frameIdx < handoffStart + FADE) {
      const t = (frameIdx - handoffStart) / FADE;
      const outgoingOpacity = 1 - t;
      const zoomT = 1; // outgoing has reached its max zoom
      const scale = 1 + 0.05 * zoomT;
      const targetW = Math.round(shots[i].w * scale);
      const targetH = Math.round(shots[i].h * scale);

      const scaled = await sharp(shots[i].buf)
        .resize(targetW, targetH)
        .ensureAlpha(outgoingOpacity)
        .png()
        .toBuffer();

      layers.unshift({
        input: scaled,
        left: Math.round((W  - targetW) / 2),
        top:  Math.round((H - targetH) / 2),
      });
    }
  }

  const base = sharp({
    create: { width: W, height: H, channels: 4, background: BG },
  });
  return base.composite(layers).png().toBuffer();
}

(async () => {
  console.log(`ffmpeg: ${ffmpegBin}`);
  if (!fs.existsSync(ffmpegBin)) {
    console.error('ffmpeg-static binary missing');
    process.exit(1);
  }
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
  // Clean
  for (const f of fs.readdirSync(FRAMES_DIR)) fs.unlinkSync(path.join(FRAMES_DIR, f));

  console.log('Loading shots...');
  const shots = await Promise.all(SHOTS.map(loadShot));
  shots.forEach((s, i) => console.log(`  ${i + 1}. ${SHOTS[i]} → ${s.w}×${s.h}`));

  console.log(`Rendering ${TOTAL_FRAMES} frames @${FPS}fps...`);
  const t0 = Date.now();
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const png = await renderFrame(f, shots);
    const out = path.join(FRAMES_DIR, `f${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(out, png);
    if (f % 30 === 0) process.stdout.write(`  frame ${f}\n`);
  }
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Frames done in ${dt}s.`);

  // Encode with ffmpeg-static
  console.log('Encoding MP4...');
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
  if (r.status !== 0) {
    console.error('ffmpeg failed');
    process.exit(1);
  }

  // Poster: copy first frame to webp
  await sharp(path.join(FRAMES_DIR, 'f0000.png'))
    .webp({ quality: 85 })
    .toFile(path.resolve(ASSETS_DIR, 'winkingstar-poster.webp'));

  // Card image: pick a representative frame (mid of shot 2 = sample board)
  await sharp(path.join(FRAMES_DIR, `f${String(150).padStart(4, '0')}.png`))
    .resize({ width: 1200, height: 720, fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(path.resolve(ASSETS_DIR, 'winkingstar-card.webp'));

  const finalStat = fs.statSync(FINAL_MP4);
  console.log(`Done. MP4: ${(finalStat.size / 1024 / 1024).toFixed(2)} MB → ${FINAL_MP4}`);
})();
