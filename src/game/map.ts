// The world map, drawn like a real one: Taiwan and Great Britain from real
// coastline coordinates (simplified, projected with a cos(latitude) squeeze),
// a dashed flight from Taipei to London, a London inset with the Thames, and
// Next: AI as an uncharted island with a dashed coast. Not to scale, and it
// says so. Everything is rasterised once into an art-resolution canvas with
// hard pixel edges; the game draws nodes and the character on top.
import { canvas, sprite, text, textWidth } from './pixel';

/** Original computer-company badge for the first professional design stage. */
export function workIcon() {
  return sprite([
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kbbbbbbbbbbbbk.',
    '.kbwwbbbbbbbwbk.',
    '.kbwbbbbbbwwbbk.',
    '.kbbbbbbbwwbbbk.',
    '.kbbbbbbwwbbbbk.',
    '.kbbbbbwwbbbbbk.',
    '.kbbbbwwbbbbbbk.',
    '.kkkkkkkkkkkkkk.',
    '......kkkk......',
    '....kkkkkkkk....',
    '................',
    '..kkkkkkkkkkkk..',
    '..kwwwwwwwwwwk..',
    '..kkkkkkkkkkkk..',
  ],{k:'#17283f',b:'#55bbcb',w:'#fff3d5'});
}

type LL = [number, number]; // [lon, lat]

// Simplified coastlines, clockwise.
const TAIWAN: LL[] = [
  [121.54, 25.3], [121.74, 25.14], [122.0, 25.0], [121.85, 24.6], [121.62, 23.98], [121.48, 23.4], [121.15, 22.75], [120.9, 22.3],
  [120.85, 21.9], [120.72, 21.93], [120.6, 22.36], [120.27, 22.62], [120.1, 23.0], [120.15, 23.45], [120.3, 24.05], [120.5, 24.3],
  [120.92, 24.82], [121.1, 25.05], [121.4, 25.18],
];
const BRITAIN: LL[] = [
  [-5.0, 58.62], [-3.07, 58.64], [-3.1, 58.44], [-3.1, 58.0], [-3.7, 57.62], [-2.0, 57.69], [-1.78, 57.5], [-2.1, 57.15], [-2.8, 56.45],
  [-2.6, 56.2], [-3.2, 56.02], [-2.6, 56.05], [-2.0, 55.77], [-1.43, 55.0], [-0.6, 54.49], [-0.08, 54.12], [0.12, 53.58], [0.35, 53.15],
  [0.3, 52.85], [1.3, 52.93], [1.75, 52.48], [1.15, 51.79], [0.6, 51.5], [1.45, 51.38], [1.35, 51.12], [0.25, 50.73], [-1.1, 50.78],
  [-2.45, 50.52], [-4.1, 50.35], [-5.2, 49.96], [-5.7, 50.05], [-4.5, 51.0], [-3.0, 51.4], [-3.95, 51.6], [-5.3, 51.88], [-4.3, 52.25], [-4.15, 52.6],
  [-4.75, 52.8], [-4.4, 53.4], [-3.0, 53.4], [-3.05, 53.8], [-3.0, 54.9], [-5.0, 54.65], [-4.7, 55.5], [-5.8, 55.3], [-5.6, 56.0], [-5.7, 56.5],
  [-5.8, 57.3], [-5.7, 57.8],
];

/** Project lon/lat into a box: left/top in art px, k px per degree of latitude. */
function project(pts: LL[], left: number, top: number, k: number, lon0: number, lat0: number, lat: number): [number, number][] {
  const sq = Math.cos((lat * Math.PI) / 180);
  return pts.map(([lo, la]) => [left + (lo - lon0) * sq * k, top + (lat0 - la) * k]);
}

const TW = (lo: number, la: number) => project([[lo, la]], 372, 44, 54, 120.1, 25.3, 23.5)[0];
const UK = (lo: number, la: number) => project([[lo, la]], 26, 46, 21, -5.8, 58.64, 54)[0];

// Node centres, in path order (one per world). Taiwan by real city, London
// stops inside the inset (no claims about which office), AI on the uncharted island.
const tp = TW(121.56, 25.04), tc = TW(120.62, 24.13), kh = TW(120.31, 22.63);
export const LONDON = UK(-0.12, 51.5).map(Math.round) as [number, number];
export const INSET = { x: 140, y: 150, w: 172, h: 96 };
export const NODES: [number, number][] = [
  [Math.round(kh[0]) + 4, Math.round(kh[1])], // 1 Kaohsiung
  [Math.round(tc[0]) + 6, Math.round(tc[1])], // 2 Ling Tung, Taichung
  [Math.round(tp[0]), Math.round(tp[1]) + 4], // 3 Genuine C&C Inc., Taipei (confirmed by Shannon)
  [170, 174], // 4 London (in the inset)
  [226, 214], // 5 J.P. Morgan
  [282, 174], // 6 Barclays
  [294, 98], // 7 Next: AI, uncharted
  [222, 104], // 8 Bedtime bonus, a small island
];

const SEA = '#b8d7e6', SHALLOW = '#d5e8ee', LAND = '#efe5c4', HILL = '#e2d4a8', COAST = '#6f5d3a', INK = '#2b3654', GRID = '#c4dee9';

/** Fill a polygon with hard pixel edges (even-odd scanlines). */
function fillPoly(px: (x: number, y: number, c: string, w?: number, h?: number) => void, pts: [number, number][], col: string) {
  const ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    const yc = y + 0.5, xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + ((yc - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) px(Math.round(xs[i]), y, col, Math.round(xs[i + 1]) - Math.round(xs[i]), 1);
  }
}

/** Outline land pixels that touch the sea, and shade a shallow-water band. */
function coast(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, dashed = false) {
  const im = g.getImageData(x0, y0, w, h), d = im.data;
  const isLand = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const i = (y * w + x) * 4;
    return d[i] > 200 && d[i + 1] > 190 && d[i + 2] < 215; // the land colour family
  };
  const edge: [number, number][] = [], shallow: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const l = isLand(x, y);
    const n = isLand(x - 1, y) || isLand(x + 1, y) || isLand(x, y - 1) || isLand(x, y + 1);
    const allN = isLand(x - 1, y) && isLand(x + 1, y) && isLand(x, y - 1) && isLand(x, y + 1);
    if (l && !allN) edge.push([x, y]);
    else if (!l && (n || isLand(x - 2, y) || isLand(x + 2, y) || isLand(x, y - 2) || isLand(x, y + 2))) shallow.push([x, y]);
  }
  g.fillStyle = SHALLOW; for (const [x, y] of shallow) g.fillRect(x0 + x, y0 + y, 1, 1);
  g.fillStyle = COAST; for (const [x, y] of edge) if (!dashed || (x + y) % 4 < 2) g.fillRect(x0 + x, y0 + y, 1, 1);
}

/** Selection outlines, one per world, filled in by mapBase(): pixels that hug
 * the real coastline (Taiwan, the two islands) or the London inset's frame. */
export const SELECT_RINGS: [number, number][][] = [[], [], [], []];

/** Sea pixels exactly 2 px outside the land inside a box: a line that follows the coast. */
function ringOf(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number) {
  const d = g.getImageData(x0, y0, w, h).data;
  let m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = d[i * 4] > 200 && d[i * 4 + 1] > 190 && d[i * 4 + 2] < 215 ? 1 : 0;
  const grow = (a: Uint8Array) => {
    const b = a.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a[y * w + x] && ((x > 0 && a[y * w + x - 1]) || (x < w - 1 && a[y * w + x + 1]) || (y > 0 && a[(y - 1) * w + x]) || (y < h - 1 && a[(y + 1) * w + x]))) b[y * w + x] = 1;
    return b;
  };
  const d1 = grow(m), d2 = grow(d1);
  const out: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d2[y * w + x] && !d1[y * w + x]) out.push([x0 + x, y0 + y]);
  return out;
}

export function mapBase(): HTMLCanvasElement {
  const { c, g, px } = canvas(480, 270);
  // sea, graticule, a few waves
  px(0, 0, SEA, 480, 270);
  for (let x = 20; x < 480; x += 40) for (let y = 0; y < 270; y += 2) px(x, y, GRID);
  for (let y = 30; y < 270; y += 40) for (let x = 0; x < 480; x += 2) px(x, y, GRID);
  for (let i = 0; i < 26; i++) { const x = (i * 97) % 460 + 10, y = (i * 53) % 230 + 30; px(x, y, '#b9def0', 3, 1); px(x + 3, y - 1, '#b9def0', 2, 1); }

  // land
  const tw = project(TAIWAN, 372, 44, 54, 120.1, 25.3, 23.5);
  const uk = project(BRITAIN, 26, 46, 21, -5.8, 58.64, 54);
  fillPoly(px, tw, LAND); fillPoly(px, uk, LAND);
  SELECT_RINGS[0] = ringOf(g, 360, 30, 120, 210); // Taiwan
  // Taiwan's Central Mountain Range, Britain's Pennines: hatched hills
  const [m0x, m0y] = TW(121.4, 24.7), [m1x, m1y] = TW(120.85, 22.4);
  for (let t = 0; t <= 1; t += 0.06) px(Math.round(m0x + (m1x - m0x) * t) - 3, Math.round(m0y + (m1y - m0y) * t), HILL, 6, 2);
  for (let y = 120; y < 175; y += 6) px(Math.round(UK(-2.2, 54.5)[0]) - 2, y, HILL, 5, 2);
  // a small island for the bonus world
  fillPoly(px, [[212, 96], [230, 94], [236, 104], [226, 114], [210, 110]], LAND);
  SELECT_RINGS[3] = ringOf(g, 200, 84, 46, 40); // the bonus island
  coast(g, 0, 0, 480, 270);
  // the uncharted AI island: its coast is dashed, still being drafted
  fillPoly(px, [[274, 84], [300, 78], [316, 92], [310, 112], [282, 116], [270, 102]], LAND);
  coast(g, 262, 70, 64, 56, true);
  SELECT_RINGS[2] = ringOf(g, 258, 66, 70, 62); // the AI island

  // flight: a dashed arc from Taipei to London, with a little plane at the top
  const [ax, ay] = [NODES[2][0] - 6, NODES[2][1] - 6], [bx, by] = LONDON, cx = 270, cy = -24;
  let lastPlane: [number, number] = [0, 0];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120, x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cx + t * t * bx, y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cy + t * t * by;
    if (i % 4 < 2) px(Math.round(x), Math.round(y), INK, 2, 1);
    if (i === 60) lastPlane = [Math.round(x), Math.round(y)];
  }
  const [qx, qy] = lastPlane; // a small plane heading west
  px(qx - 5, qy - 1, '#ffffff', 11, 3); px(qx - 6, qy, '#ffffff', 1, 1); px(qx - 1, qy - 5, '#ffffff', 3, 11); px(qx + 4, qy - 3, '#ffffff', 2, 7);
  px(qx - 5, qy, INK, 11, 1);

  // the London inset: a frame, leader lines to London, the Thames with its loop
  const I = INSET;
  // London: the inset's frame, just outside its border
  for (let x = I.x - 4; x <= I.x + I.w + 3; x++) for (const y of [I.y - 4, I.y + I.h + 3]) SELECT_RINGS[1].push([x, y]);
  for (let y = I.y - 4; y <= I.y + I.h + 3; y++) for (const x of [I.x - 4, I.x + I.w + 3]) SELECT_RINGS[1].push([x, y]);
  for (let t = 0; t <= 1; t += 0.03) { px(Math.round(LONDON[0] + (I.x - LONDON[0]) * t), Math.round(LONDON[1] + (I.y - LONDON[1]) * t), INK); px(Math.round(LONDON[0] + (I.x - LONDON[0]) * t), Math.round(LONDON[1] + (I.y + I.h - LONDON[1]) * t), INK); }
  px(LONDON[0] - 2, LONDON[1] - 2, INK, 5, 5); px(LONDON[0] - 1, LONDON[1] - 1, '#e5484d', 3, 3);
  px(I.x - 2, I.y - 2, INK, I.w + 4, I.h + 4); px(I.x, I.y, '#f5eed6', I.w, I.h);
  for (let x = I.x; x < I.x + I.w; x++) {
    const u = (x - I.x) / I.w;
    // a meander, then the Isle of Dogs loop near the east end
    const y = I.y + 52 + Math.round(Math.sin(u * 7) * 6 + (u > 0.62 && u < 0.86 ? Math.sin(((u - 0.62) / 0.24) * Math.PI) * 14 : 0));
    px(x, y - 2, '#7fb3d6', 1, 5);
  }
  for (let i = 0; i < 40; i++) { const x = I.x + 6 + ((i * 41) % (I.w - 12)), y = I.y + 6 + ((i * 29) % (I.h - 12)); px(x, y, '#e6dcbc', 4, 3); } // streets, loosely
  text(g, 'LONDON', I.x + I.w - 28, I.y + 4, INK);

  // labels, compass, the honest bit
  const [twx, twy] = TW(121.3, 23.2).map(Math.round), [ukx, uky] = UK(-3.2, 56.9).map(Math.round);
  text(g, 'TAIWAN', twx - 12, twy, '#8a7a52');
  g.drawImage(flagTaiwan(), twx - 8, twy - 14);
  text(g, 'UNITED', ukx - 10, uky, '#8a7a52');
  text(g, 'KINGDOM', ukx - 12, uky + 7, '#8a7a52');
  g.drawImage(flagUK(), ukx - 6, uky - 14);
  const nx = 456, ny = 246; // compass
  px(nx - 1, ny - 12, INK, 3, 24); px(nx - 12, ny - 1, INK, 24, 3); px(nx - 1, ny - 12, '#e5484d', 3, 10);
  text(g, 'N', nx - 1, ny - 20, INK);
  text(g, 'NOT TO SCALE', 346, 258, '#4a5a6a');
  return c;
}

/** Where a node's two label lines go: under it, or to the left for Taiwan's west coast. */
export function labelAt(i: number, s: string, line: number): [number, number] {
  const [x, y] = NODES[i];
  if (i <= 2) return [x - 16 - textWidth(s), y - 6 + line * 8];
  return [Math.round(x - textWidth(s) / 2), y + 14 + line * 8];
}

// Flags, hand-placed at 16×10 with a 1 px frame. Simplified the way pixel art
// has to be: the Union Jack without its counterchange, Taiwan's sun as a
// 3 px disc with eight rays.
function frame(draw: (px: ReturnType<typeof canvas>['px']) => void) {
  const f = canvas(18, 12); f.px(0, 0, '#2a1a14', 18, 12); draw((x, y, c, w = 1, h = 1) => f.px(x + 1, y + 1, c, w, h)); return f.c;
}
export function flagUK() {
  return frame((px) => {
    const W = 16, H = 10;
    px(0, 0, '#012169', W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W, v = (y + 0.5) / H, d = Math.min(Math.abs(u - v), Math.abs(u - (1 - v)));
      if (d < 0.07) px(x, y, '#c8102e'); else if (d < 0.16) px(x, y, '#ffffff');
    }
    px(6, 0, '#ffffff', 4, H); px(0, 3, '#ffffff', W, 4);
    px(7, 0, '#c8102e', 2, H); px(0, 4, '#c8102e', W, 2);
  });
}
export function flagTaiwan() {
  return frame((px) => {
    px(0, 0, '#fe0000', 16, 10); px(0, 0, '#000095', 8, 5);
    px(3, 1, '#ffffff', 3, 3); // the white sun
    for (const [x, y] of [[4, 0], [4, 4], [2, 2], [6, 2], [2, 0], [6, 0], [2, 4], [6, 4]]) px(x, y, '#ffffff');
  });
}

/** Brand-colour badges for the London stops: a plate in the organisation's
 * colour under its name. Not their logos (no trademarked artwork), and the
 * colours are close matches, kept here so they are easy to correct. */
export const BRAND: Record<number, { bg: string; accent: string; fg: string }> = {
  3: { bg: '#231f20', accent: '#e4007c', fg: '#ffffff' }, // London Met
  4: { bg: '#331207', accent: '#2c5aae', fg: '#ffffff' }, // J.P. Morgan: wordmark brown, octagon blue (sampled from Shannon's file)
  5: { bg: '#00395d', accent: '#00aeef', fg: '#ffffff' }, // Barclays
};

// School buildings for the two places she studied, in place of the level's
// pickup icon. 16×14, hand-placed. Ling Tung: a cream campus block with a
// red-tiled roof and a flagpole. London Met: a brick building with tall
// windows, a pediment and steps.
export const SCHOOL_ICONS: Record<number, () => HTMLCanvasElement> = {
  1: () => sprite([
    '.......k........',
    '.......kff......',
    '.......kf.......',
    '..kkkkkkkkkkkk..',
    '.krrrrrrrrrrrrk.',
    'krrrrrrrrrrrrrrk',
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwbbwbbwwbbwbbwk',
    'kwbbwbbwwbbwbbwk',
    'kwwwwwwkkwwwwwwk',
    'kwbbwbbkdkwbbwwk',
    'kwwwwwwkdkwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ], { k: '#2a1a14', r: '#c8463a', f: '#e5484d', w: '#f4ead2', b: '#6aa9d8', d: '#8a5a30' }),
  3: () => sprite([
    '.......kk.......',
    '.....kkwwkk.....',
    '...kkwwwwwwkk...',
    '.kkwwwwwwwwwwkk.',
    'kkkkkkkkkkkkkkkk',
    'krrkwrkwwkrwkrrk',
    'krrkbrkwwkrbkrrk',
    'krrkbrkwwkrbkrrk',
    'krrkbrkwwkrbkrrk',
    'krrkkrkwwkrkkrrk',
    'krrrrrkddkrrrrrk',
    'kkkkkkkddkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ], { k: '#2a1a14', r: '#a5523a', w: '#efe6d2', b: '#6aa9d8', d: '#5a3a22' }),
};

// Barclays: the eagle, from the logo file Shannon supplied, box-downsampled
// to 15×16 (not redrawn, so the shape stays the brand's own). Cyan on white,
// as the mark appears. Shannon chose to show it; remove this entry to go back
// to the plain brand-colour tile.
// J.P. Morgan: the octagon from the logo file Shannon supplied, downsampled to
// 16×16. At that size its four white seams vanish, so they are put back at
// 1 px each, where the logo has them (the pinwheel around the square hole).
export const LOGO_ICONS: Record<number, { icon: () => HTMLCanvasElement; bg: string }> = {
  4: {
    bg: '#ffffff',
    icon: () => sprite([
      '....b.bbbbbb....',
      '...bb.bbbbbbb...',
      '..bbb.bbbbbbbb..',
      '.bbbb.bbbbbbbbb.',
      'bbbbb.bbbbbbbbbb',
      'bbbbb...........',
      'bbbbb......bbbbb',
      'bbbbb......bbbbb',
      'bbbbb......bbbbb',
      'bbbbb......bbbbb',
      '...........bbbbb',
      'bbbbbbbbbb.bbbbb',
      '.bbbbbbbbb.bbbb.',
      '..bbbbbbbb.bbb..',
      '...bbbbbbb.bb...',
      '....bbbbbb.b....',
    ], { b: '#2c5aae' }),
  },
  5: {
    bg: '#ffffff',
    icon: () => sprite([
      '.....bbb.......',
      '......bbb......',
      '.bbb..bbb..bbb.',
      '.bbb..bbb..bbb.',
      'bbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbb.',
      '.bbb.bbbbb.bbb.',
      '...b.bbbbb.b...',
      '....bbbbbbb....',
      '....bbbbbbb....',
      '....bbbbbbb....',
      '......bbb......',
    ], { b: '#00aeef' }),
  },
};
