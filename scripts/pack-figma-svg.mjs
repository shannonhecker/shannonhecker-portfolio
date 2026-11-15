// Re-encode embedded PNGs without changing decoded pixels or SVG artwork.
// Usage: node scripts/pack-figma-svg.mjs public/art/example.svg [...]
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const records = [];
for (const path of process.argv.slice(2)) {
  const original = await readFile(path, 'utf8');
  let packed = original;
  const images = [];
  for (const match of original.matchAll(/data:image\/png;base64,([^"\s]+)/g)) {
    const png = Buffer.from(match[1], 'base64');
    const webp = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
    const [before, after] = await Promise.all([
      sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(webp).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    const identical = before.info.width === after.info.width &&
      before.info.height === after.info.height && before.data.equals(after.data);
    const used = identical && webp.length < png.length;
    if (used) packed = packed.replace(match[0], `data:image/webp;base64,${webp.toString('base64')}`);
    images.push({ pngBytes: png.length, webpBytes: webp.length, identical, used,
      pixelSha256: hash(before.data), width: before.info.width, height: before.info.height });
  }
  if (packed !== original) await writeFile(path, packed);
  records.push({ path, sourceSha256: hash(original), packedSha256: hash(packed),
    sourceBytes: Buffer.byteLength(original), packedBytes: Buffer.byteLength(packed), images });
}
process.stdout.write(`${JSON.stringify(records, null, 2)}\n`);
