// Generates the raster favicon set and the Open Graph image into public/.
// public/favicon.svg is the SH mark from shannonhecker.com (light/dark aware).
// Run with `node scripts/make-meta-images.mjs`; outputs are committed.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const fav = await readFile('public/favicon.svg', 'utf8');
// Raster icons can't follow the OS theme, so they sit the ink mark on white.
const solid = fav
  .replace(/<style>.*?<\/style>/, '')
  .replace('viewBox="-4 -8 88 88">', 'viewBox="-20 -24 120 120"><rect x="-20" y="-24" width="120" height="120" fill="#ffffff"/><g fill="#161616">')
  .replace('</svg>', '</g></svg>');
await sharp(Buffer.from(solid)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const png32 = await sharp(Buffer.from(solid)).resize(32, 32).png().toBuffer();
// Minimal single-image ICO wrapping the PNG.
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png32.length, 14); head.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([head, png32]));

// OG: the hero's UI crop at 1200x630.
await sharp('src/assets/img/ui-fx-cover.jpg').resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og.jpg');
console.log('ok');
