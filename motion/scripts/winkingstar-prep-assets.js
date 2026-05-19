// One-shot script: convert Winking Star source assets to portfolio WebPs.
// Run from motion/ with explicit source roots:
//   WINKINGSTAR_IOS_ASSETS=/path/to/weekly-superstar-ios/assets \
//   WINKINGSTAR_SCREENSHOT_DIR=/path/to/screenshot-dir \
//   node scripts/winkingstar-prep-assets.js
// Outputs land in ../assets/ in the portfolio root.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const IOS_ROOT = process.env.WINKINGSTAR_IOS_ASSETS;
const SCREENSHOT_ROOT = process.env.WINKINGSTAR_SCREENSHOT_DIR;
const OUT_ROOT  = path.resolve(__dirname, '../../assets');

if (!IOS_ROOT || !SCREENSHOT_ROOT) {
  console.error('Set WINKINGSTAR_IOS_ASSETS and WINKINGSTAR_SCREENSHOT_DIR before running this source-prep script.');
  process.exit(1);
}

const jobs = [
  // ── Brand doodle illustrations (1:1, 800px) ──────────────────────────────
  { src: `${IOS_ROOT}/ui-icons/illustrations/doodle-map.png`,
    out: `${OUT_ROOT}/winkingstar-doodle-map.webp`,
    fit: 'inside', width: 800, height: 800, quality: 85 },
  { src: `${IOS_ROOT}/ui-icons/illustrations/doodle-treasure-box.png`,
    out: `${OUT_ROOT}/winkingstar-doodle-treasure.webp`,
    fit: 'inside', width: 800, height: 800, quality: 85 },

  // ── Pet-pal art (1:1, 600px, contain on cream so transparency reads well)
  ...['bear', 'fox', 'unicorn', 'deer', 'elephant', 'robot'].map(p => ({
    src: `${IOS_ROOT}/graphics/${p}.png`,
    out: `${OUT_ROOT}/winkingstar-petpal-${p}.webp`,
    fit: 'contain', width: 600, height: 600, quality: 82,
    background: { r: 248, g: 241, b: 228 }, // earthy.cream
  })),

  // ── Screenshots (max-width 1600, keep portrait/landscape aspect) ────────
  { src: `${SCREENSHOT_ROOT}/winkingstar-progress-installed.png`,
    out: `${OUT_ROOT}/winkingstar-shot-splash.webp`,
    fit: 'inside', width: 1600, quality: 82 },
  { src: `${SCREENSHOT_ROOT}/winkingstar-demo-board.png`,
    out: `${OUT_ROOT}/winkingstar-shot-board.webp`,
    fit: 'inside', width: 1600, quality: 82 },
  { src: `${SCREENSHOT_ROOT}/winkingstar-copy-pet-iphone.png`,
    out: `${OUT_ROOT}/winkingstar-shot-petpals.webp`,
    fit: 'inside', width: 1600, quality: 82 },
  { src: `${SCREENSHOT_ROOT}/winkingstar-treasure-ipad.png`,
    out: `${OUT_ROOT}/winkingstar-shot-ipad-treasure.webp`,
    fit: 'inside', width: 1800, quality: 82 },
];

(async () => {
  let ok = 0, fail = 0;
  for (const j of jobs) {
    try {
      if (!fs.existsSync(j.src)) {
        console.error(`MISSING SOURCE: ${j.src}`);
        fail++; continue;
      }
      let pipe = sharp(j.src);
      const opts = { fit: j.fit, width: j.width };
      if (j.height) opts.height = j.height;
      if (j.background) opts.background = j.background;
      pipe = pipe.resize(opts);
      if (j.background) pipe = pipe.flatten({ background: j.background });
      await pipe.webp({ quality: j.quality, effort: 5 }).toFile(j.out);
      const stat = fs.statSync(j.out);
      console.log(`OK  ${path.basename(j.out)}  (${(stat.size/1024).toFixed(0)} KB)`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${j.src}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\n${ok} ok / ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
