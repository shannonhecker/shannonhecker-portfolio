// Register authorized Nano Banana source sheets into crisp, outlined game frames.
// Usage: node scripts/art/prepare-era-sprites.mjs /path/to/source-sheets
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Supply the source sheet directory');
const names = ['kaohsiung', 'lingtung', 'web', 'london', 'tower', 'desk', 'ai', 'bedtime'];
async function isolateFigure(cell) {
  const { data, info } = await sharp(cell).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const size = info.width * info.height, visited = new Uint8Array(size);
  const queue = new Int32Array(size);
  let largest = [];
  for (let start = 0; start < size; start++) {
    if (visited[start] || data[start * 4 + 3] < 128) continue;
    let head = 0, tail = 1; queue[0] = start; visited[start] = 1;
    while (head < tail) {
      const p = queue[head++], x = p % info.width, y = Math.floor(p / info.width);
      for (const n of [x ? p - 1 : -1, x < info.width - 1 ? p + 1 : -1, y ? p - info.width : -1, y < info.height - 1 ? p + info.width : -1]) {
        if (n >= 0 && !visited[n] && data[n * 4 + 3] >= 128) { visited[n] = 1; queue[tail++] = n; }
      }
    }
    if (tail > largest.length) largest = queue.slice(0, tail);
  }
  const keep = new Uint8Array(size);
  for (const p of largest) keep[p] = 1;
  for (let p = 0; p < size; p++) if (!keep[p]) data[p * 4 + 3] = 0;
  return sharp(data, { raw: info }).png().toBuffer();
}
for (const [index, name] of names.entries()) {
  const { data, info } = await sharp(`${source}/${index}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let p = 0; p < data.length; p += 4) {
    const [r, g, b] = data.subarray(p, p + 3);
    if (r > 135 && b > 135 && r - g > 65 && b - g > 65) data[p + 3] = 0;
  }
  const keyed = await sharp(data, { raw: info }).png().toBuffer();
  const frames = [];
  for (let col = 0; col < 4; col++) {
    const left = Math.round(col * info.width / 4);
    const cell = await sharp(keyed).extract({ left, top: 0,
      width: Math.round((col + 1) * info.width / 4) - left,
      // The office sheet returned two complete rows; keep its first cycle.
      height: index === 4 ? Math.floor(info.height / 2) : info.height,
    }).png().toBuffer();
    frames.push(await sharp(await isolateFigure(cell)).trim({ threshold: 12 }).png().toBuffer());
  }
  const metas = await Promise.all(frames.map(frame => sharp(frame).metadata()));
  const scale = Math.min(44 / Math.max(...metas.map(m => m.height)), 30 / Math.max(...metas.map(m => m.width)));
  await mkdir(`public/game/eras/${name}`, { recursive: true });
  for (let frame = 0; frame < 4; frame++) {
    const width = Math.round(metas[frame].width * scale), height = Math.round(metas[frame].height * scale);
    const pixels = await sharp(frames[frame]).resize(width, height, { kernel: 'nearest' }).png({ palette: true, colours: 16, dither: 0 }).toBuffer();
    const { data: rgba } = await sharp({ create: { width: 34, height: 48, channels: 4, background: '#00000000' } })
      .composite([{ input: pixels, left: Math.floor((34 - width) / 2), top: 47 - height }]).raw().toBuffer({ resolveWithObject: true });
    // A solid one-logical-pixel silhouette survives bright and dark scenery.
    // Never blur the outline or interpolate the pixel grid.
    const original = Buffer.from(rgba);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 34; x++) {
      const p = (y * 34 + x) * 4;
      if (original[p + 3] >= 128) { rgba[p + 3] = 255; continue; }
      const edge = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => {
        const xx = x + dx, yy = y + dy;
        return xx >= 0 && xx < 34 && yy >= 0 && yy < 48 && original[(yy * 34 + xx) * 4 + 3] >= 128;
      });
      rgba.set(edge ? [26, 24, 39, 255] : [0, 0, 0, 0], p);
    }
    await sharp(rgba, { raw: { width: 34, height: 48, channels: 4 } }).png().toFile(`public/game/eras/${name}/${frame + 1}.png`);
  }
}
