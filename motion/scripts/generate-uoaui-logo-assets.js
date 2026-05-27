// Rebuild the uoaui wordmark assets while preserving the existing mark and
// bitmap glyph styling from the previous lockup.
//
// Run from the repository root:
//   node motion/scripts/generate-uoaui-logo-assets.js

const path = require("path");
const sharp = require("../node_modules/sharp");

const ROOT = path.resolve(__dirname, "../..");
const ASSETS = path.join(ROOT, "assets");
const LOCKUP = path.join(ASSETS, "uoaui-logo-lockup.png");
const SOURCE_LOCKUP = path.join(__dirname, "../public/source-ausos-logo-lockup.png");
const SOURCE_CARD = path.join(__dirname, "../public/source-ausos-card.webp");
const SOURCE_SQUARE = path.join(__dirname, "../public/source-ausos-square.webp");

const W = 454;
const H = 91;

async function glyph(source, left, top, width, height, outLeft, outTop = top) {
  return {
    input: await sharp(source)
      .extract({ left, top, width, height })
      .png()
      .toBuffer(),
    left: outLeft,
    top: outTop,
  };
}

const iGlyph = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <g fill="#fff">
      <circle cx="429" cy="28.5" r="5.5"/>
      <rect x="424.5" y="39" width="9" height="39" rx="4.5"/>
    </g>
  </svg>
`);

async function buildLockup() {
  const sourceLockup = await sharp(SOURCE_LOCKUP).png().toBuffer();

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      // Original mark, including the small bar above the right dot.
      await glyph(sourceLockup, 0, 0, 132, H, 0, 0),
      // uoaui, assembled from the previous bitmap glyphs where available.
      await glyph(sourceLockup, 220, 0, 49, H, 151, 0),
      await glyph(sourceLockup, 338, 18, 53, H - 18, 215, 18),
      await glyph(sourceLockup, 151, 0, 54, H, 283, 0),
      await glyph(sourceLockup, 220, 0, 49, H, 352, 0),
      { input: iGlyph, left: 0, top: 0 },
    ])
    .png()
    .toFile(LOCKUP);
}

async function logoLayer(width) {
  return sharp(LOCKUP).resize({ width }).png().toBuffer();
}

async function writeLogoCard({ source, width, height, out, logoWidth, blur = 24, format = "png" }) {
  const background = await sharp(source)
    .resize({ width, height, fit: "cover" })
    .blur(blur)
    .png()
    .toBuffer();
  const logo = await logoLayer(logoWidth);
  const logoMeta = await sharp(logo).metadata();
  const image = sharp(background).composite([
    {
      input: logo,
      left: Math.round((width - logoMeta.width) / 2),
      top: Math.round((height - logoMeta.height) / 2),
    },
  ]);

  if (format === "webp") {
    await image.webp({ quality: 88, effort: 5 }).toFile(out);
    return;
  }

  await image.png().toFile(out);
}

async function main() {
  await buildLockup();
  await writeLogoCard({
    source: SOURCE_CARD,
    width: 1200,
    height: 720,
    out: path.join(ASSETS, "uoaui-card.webp"),
    logoWidth: 430,
    format: "webp",
  });
  await writeLogoCard({
    source: SOURCE_CARD,
    width: 1600,
    height: 960,
    out: path.join(ASSETS, "uoaui-card.png"),
    logoWidth: 572,
  });
  await writeLogoCard({
    source: SOURCE_CARD,
    width: 1280,
    height: 720,
    out: path.join(ASSETS, "uoaui-card-1280x720.png"),
    logoWidth: 458,
  });
  await writeLogoCard({
    source: SOURCE_SQUARE,
    width: 1000,
    height: 1000,
    out: path.join(ASSETS, "uoaui.webp"),
    logoWidth: 560,
    blur: 28,
    format: "webp",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
