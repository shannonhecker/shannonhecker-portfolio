// Hand-authored pixel art. Every sprite is either a character grid or a few
// lines of deliberate pixel placement; nothing is generated or traced.
// Style: Mario-era 16-bit platformer (chunky outlines, bright pickups, tiled
// ground) with every noun from Shannon's three cases. No pipes, no ? blocks,
// no mushrooms, no flagpole.
import { sprite, canvas, text } from './pixel';

// The player lives in looks.ts: one look per era.
export { playerFrames, helmet } from './looks';

// ---------------------------------------------------------------- themes
export type ThemeId = 'kaohsiung' | 'lingtung' | 'web' | 'london' | 'tower' | 'desk' | 'ai' | 'bedtime';
export type Theme = {
  id: ThemeId;
  sky: string;
  ground: HTMLCanvasElement; // top-surface tile
  fill: HTMLCanvasElement; // tile below the surface
  platform: HTMLCanvasElement; // one-way platform tile
  pickup: HTMLCanvasElement[]; // 2-frame bob
  hazard: HTMLCanvasElement; // the level's own hazard
  finish: HTMLCanvasElement;
  check: HTMLCanvasElement;
  spike: HTMLCanvasElement;
  far: HTMLCanvasElement; // parallax layer, 480 wide
  near: HTMLCanvasElement; // parallax layer, 480 wide
  ink: string;
  hud: string;
  pickup2?: HTMLCanvasElement; // a second pickup ('u'), used by the tower
  draft?: HTMLCanvasElement; // a platform still being drafted ('D'), used by AI
  weather?: 'rain';
  sign?: { bg: string; fg: string }; // floor signs
};

function tile(draw: (px: ReturnType<typeof canvas>['px']) => void) { const t = canvas(16, 16); draw(t.px); return t.c; }

// World 6 · The Desk (Barclays, FX): a night trading floor.
function desk(): Theme {
  const sky = '#0e1530';
  const ground = tile((px) => { px(0, 0, '#4a90d9', 16, 2); px(0, 2, '#23305a', 16, 14); for (let x = 1; x < 16; x += 4) px(x, 6, '#2e3c6e', 2, 1); });
  const fill = tile((px) => { px(0, 0, '#1b2547', 16, 16); px(0, 7, '#23305a', 16, 1); px(7, 0, '#23305a', 1, 7); px(3, 8, '#23305a', 1, 8); });
  // Platforms are candlestick bars: alternating green and red bodies with wicks.
  const platform = tile((px) => { px(0, 2, '#161616', 16, 6); px(1, 3, '#2fbf71', 6, 4); px(9, 3, '#e5484d', 6, 4); px(4, 0, '#9aa7c7', 1, 2); px(12, 0, '#9aa7c7', 1, 2); px(4, 8, '#9aa7c7', 1, 2); px(11, 8, '#9aa7c7', 1, 2); });
  // Pickup: a price dot, the marker a fill leaves on the FX chart.
  const dot = sprite([
    '....kk....',
    '...kbbk...',
    '..kbwwbk..',
    '.kbwwbbbk.',
    'kbbwbbbbbk',
    'kbbbbbbbbk',
    '.kbbbbbbk.',
    '..kbbbbk..',
    '...kbbk...',
    '....kk....',
  ], { k: '#0b1a33', b: '#4a90d9', w: '#cfe3fb' });
  const sheet = sprite([
    'kkkkkkkkkkkk',
    'kwwwwwwwwwwk',
    'kgggggggggwk',
    'kwkwwkwwkwwk',
    'kgggggggggwk',
    'kwkwwkwwkwwk',
    'kgggggggggwk',
    'kwkwwkwwkwwk',
    'kgggggggggwk',
    'kwkwwkwwkwwk',
    'kwwwwwwwwwwk',
    'kkkkkkkkkkkk',
  ], { k: '#161616', w: '#f4f1ea', g: '#2fbf71' });
  // Finish: a trading terminal with the order ticket filled.
  const finish = sprite([
    '..kkkkkkkkkkkk..',
    '..kddddddddddk..',
    '..kdgdddddrddk..',
    '..kdggddrrdddk..',
    '..kddgggrddddk..',
    '..kddddddddddk..',
    '..kkkkkkkkkkkk..',
    '.......kk.......',
    '.....kkkkkk.....',
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwkkkwkkkwakkkwk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ], { k: '#161616', d: '#0b1a33', g: '#2fbf71', r: '#e5484d', w: '#c9d2e6', a: '#f3a414' });
  const far = canvas(480, 270);
  // flat skyline, lit windows in the house orange
  for (let x = 0, i = 0; x < 480; i++) {
    const w = 18 + ((i * 37) % 26), h = 60 + ((i * 53) % 110);
    far.px(x, 270 - h, '#16204a', w, h);
    for (let wy = 270 - h + 6; wy < 262; wy += 8) for (let wx = x + 3; wx < x + w - 3; wx += 5) if ((wx * 7 + wy * 13 + i) % 9 === 0) far.px(wx, wy, '#f3a414', 2, 2);
    x += w + 2;
  }
  const near = canvas(480, 270);
  // a ticker line along the floor of the trading room
  for (let x = 0; x < 480; x += 2) near.px(x, 214 + Math.round(Math.sin(x / 23) * 6 + Math.sin(x / 7) * 2), '#2e3c6e', 2, 1);
  return { id: 'desk', sky, ground, fill, platform, pickup: [dot, dot], hazard: sheet, finish, check: post('#4a90d9'), spike: spike('#9aa7c7', '#161616'), far: far.c, near: near.c, ink: '#f4f1ea', hud: '#cfe3fb' };
}

// Bonus · Bedtime (Winking Star): cream, botanical doodles, the app's palette.
function bedtime(): Theme {
  const sky = '#f7f5ef';
  const ground = tile((px) => { px(0, 0, '#12351f', 16, 2); px(0, 2, '#a9d5b2', 16, 3); px(0, 5, '#eef3dd', 16, 11); px(3, 9, '#ded6c8', 2, 1); px(10, 12, '#ded6c8', 2, 1); });
  const fill = tile((px) => { px(0, 0, '#eef3dd', 16, 16); px(5, 4, '#ded6c8', 2, 1); px(12, 11, '#ded6c8', 2, 1); });
  // Platforms are the app's activity cards: cream card, border, a ticked star spot.
  const platform = tile((px) => { px(0, 0, '#ded6c8', 16, 9); px(1, 1, '#fffdf8', 14, 7); px(2, 3, '#f3a414', 3, 3); px(7, 3, '#12351f', 6, 1); px(7, 5, '#a9d5b2', 4, 1); });
  const star = sprite(['....k....', '...kak...', 'kkkkaakkk', 'kaaaaaaak', '.kaaaaak.', '..kaaak..', '.kaakaak.', '.kak.kak.', '.kk...kk.'], { k: '#7a4a00', a: '#f3a414' });
  // Hazard: the nag loop. A grey cloud of "!" that circles a spot.
  const nag = sprite([
    '.....kkkk.........',
    '...kkggggkk.kkkk..',
    '..kggggggggkggggk.',
    '.kggggrgggrggggggk',
    'kgggggrgggrgggggk.',
    'kgggggrgggrggggggk',
    'kgggggrgggrggggggk',
    '.kggggggggggggggk.',
    '.kggggrgggrgggggk.',
    '..kkggggggggggkk..',
    '....kkkkkkkkkk....',
  ], { k: '#4a4a48', g: '#d6d6d2', r: '#e5484d' });
  // Finish: the egg that hatches into this week's pet.
  const finish = sprite([
    '......kkkk......',
    '....kkwwwwkk....',
    '...kwwwwwwwwk...',
    '..kwwwsswwwwwk..',
    '..kwwwwsswwwwk..',
    '.kwwwwwwwwwwwwk.',
    '.kwwswwwwwwswwk.',
    '.kwwwsswwwsswwk.',
    '.kwwwwwwwwwwwwk.',
    '..kwwwwwwwwwwk..',
    '...kkwwwwwwkk...',
    '.....kkkkkk.....',
  ], { k: '#12351f', w: '#fffdf8', s: '#a9d5b2' });
  const far = canvas(480, 270);
  // botanical doodles in the app's sage, peach and teal
  // soft hills, then big leaf sprigs on top
  for (let x = 0; x < 480; x++) {
    const h1 = 70 + Math.round(Math.sin(x / 38) * 18 + Math.sin(x / 17) * 6);
    far.px(x, 270 - h1, '#e4efd9', 1, h1);
    const h2 = 44 + Math.round(Math.sin(x / 26 + 2) * 12);
    far.px(x, 270 - h2, '#cfe6cf', 1, h2);
  }
  const leaf = (x: number, y: number, c: string) => {
    for (let i = 0; i < 34; i++) far.px(x + Math.round(Math.sin(i / 5) * 4), y + i, c, 2, 1);
    for (let k = 0; k < 4; k++) { const ly = y + 4 + k * 7, d = k % 2 ? 1 : -1; far.px(x + d * 3, ly, c, 6 * d > 0 ? 6 : 6, 3); far.px(x + d * 6 + (d < 0 ? -4 : 0), ly + 1, c, 5, 2); }
  };
  [[40, 158, '#7fbf8f'], [130, 150, '#f5b9a0'], [220, 166, '#7fbf8f'], [310, 152, '#9db8d6'], [400, 162, '#f5b9a0'], [455, 156, '#7fbf8f']].forEach(([x, y, c]) => leaf(x as number, y as number, c as string));
  const near = canvas(480, 270);
  [[60, 40], [180, 70], [260, 30], [360, 60], [440, 35]].forEach(([x, y]) => { near.px(x, y, '#f3a414', 1, 3); near.px(x - 1, y + 1, '#f3a414', 3, 1); });
  return { id: 'bedtime', sky, ground, fill, platform, pickup: [star, star], hazard: nag, finish, check: post('#f3a414'), spike: spike('#ded6c8', '#12351f'), far: far.c, near: near.c, ink: '#12351f', hud: '#12351f' };
}

// Checkpoint: a small marker post (not a flag).
function post(col: string) { return sprite(['.kkk.', 'kcckk', 'kcccK'.replace('K', 'k'), '.kkk.', '..k..', '..k..', '..k..', '..k..', '..k..', '.kkk.'], { k: '#161616', c: col }); }
function spike(fill: string, ink: string) {
  return sprite([
    '..k....k....k...',
    '..k....k....k...',
    '.kfk..kfk..kfk..',
    '.kfk..kfk..kfk..',
    'kfffkkfffkkfffk.',
    'kfffkkfffkkfffk.',
    'kkkkkkkkkkkkkkk.',
  ].map((r) => r.slice(0, 15) + 'k'), { k: ink, f: fill });
}



/** The pet that hatches at the end of Bedtime. */
export const pet = () => sprite([
  '..k.......k.....',
  '.kak.....kak....',
  '.kaakkkkkaak....',
  'kaaaaaaaaaaak...',
  'kaakaaaaakaak...',
  'kaaaaapaaaaak...',
  '.kaaaaaaaaak....',
  '.kaaaaaaaaakk...',
  '.kaaaaaaaaakak..',
  '.kakkkkkkakkak..',
  '.kk......kk.k...',
], { k: '#12351f', a: '#f3a414', p: '#d98c78' });

// ---------------------------------------------------------------- the journey
// World 1 · Kaohsiung: the city by the park, by the sea. You ride a scooter.
function kaohsiung(): Theme {
  const sky = '#ffe1d2';
  const ground = tile((px) => { px(0, 0, '#d8d2c4', 16, 2); px(0, 2, '#4a4e57', 16, 14); px(2, 8, '#f2e3a0', 6, 1); px(0, 15, '#3a3d45', 16, 1); });
  const fill = tile((px) => { px(0, 0, '#3a3d45', 16, 16); px(0, 7, '#454952', 16, 1); px(7, 0, '#454952', 1, 7); });
  // Platforms are shop awnings, red and white.
  const platform = tile((px) => { px(0, 0, '#7a2e2e', 16, 1); for (let x = 0; x < 16; x += 4) { px(x, 1, '#e5484d', 2, 6); px(x + 2, 1, '#fff6ea', 2, 6); } px(0, 7, '#7a2e2e', 16, 1); });
  // Pickup: bubble tea.
  const tea = sprite([
    '....kk....',
    '....kk....',
    '..kkkkkk..',
    '.kllllllk.',
    '.kttttttk.',
    '.kttttttk.',
    '..kttttk..',
    '..kpttpk..',
    '..kpppp k.'.replace(' ', 'k'),
    '...kkkk...',
  ].map((r) => r.slice(0, 10)), { k: '#4a2a1a', l: '#f4f1ea', t: '#d9a066', p: '#3a2216' });
  const cone = sprite([
    '..k....k....k...',
    '.kok..kok..kok..',
    '.kwk..kwk..kwk..',
    'kooo kkooo kkooo'.replace(/ /g, 'k').slice(0, 16),
    'kkkkkkkkkkkkkkk.',
  ].map((r) => r.padEnd(16, '.')), { k: '#3a2216', o: '#ff8a3d', w: '#fff6ea' });
  // Finish: the lighthouse by the harbour.
  const finish = sprite([
    '......kkkk......',
    '.....kyyyyk.....',
    '.....kkkkkk.....',
    '......kwwk......',
    '......kwwk......',
    '.....kwwwwk.....',
    '.....krrrrk.....',
    '.....kwwwwk.....',
    '....kwwwwwwk....',
    '....kwwkwwwk....',
    '...kkkkkkkkkk...',
  ], { k: '#3a2216', y: '#f3a414', w: '#fff6ea', r: '#e5484d' });
  const far = canvas(480, 270);
  far.px(330, 60, '#f3b591', 34, 34); far.px(326, 66, '#f3b591', 42, 22); // late sun
  // Quiet stepped clouds and distant roofs echo the illustrated game cover.
  for (const [x, y] of [[28, 64], [138, 40], [390, 98]]) {
    far.px(x, y, '#fff2e6', 38, 4); far.px(x + 8, y - 4, '#fff2e6', 22, 4);
    far.px(x + 14, y - 7, '#fff2e6', 10, 3);
  }
  // city blocks and a tall two-legged tower on the skyline
  for (let x = 0, i = 0; x < 480; i++) {
    const w = 16 + ((i * 29) % 22), h = 40 + ((i * 47) % 70);
    far.px(x, 200 - h, '#e8b7a0', w, h + 70);
    far.px(x, 200 - h, '#d79e8c', w, 2);
    for (let wy = 207 - h; wy < 210; wy += 11) for (let wx = x + 4; wx < x + w - 4; wx += 7) far.px(wx, wy, '#f7d6bc', 3, 5);
    x += w + 3;
  }
  far.px(196, 70, '#e8ac6c', 6, 130); far.px(214, 70, '#e8ac6c', 6, 130); far.px(196, 70, '#e8ac6c', 24, 10); far.px(205, 46, '#e8ac6c', 6, 24);
  // the sea, a strip of blue at the bottom
  far.px(0, 236, '#7fb7d9', 480, 34); for (let x = 0; x < 480; x += 9) far.px(x, 240 + (x % 3) * 4, '#b9dcef', 5, 1);
  const near = canvas(480, 270);
  // park trees: round canopies on trunks
  for (const x of [20, 110, 230, 330, 430]) {
    near.px(x + 8, 196, '#6b4a2b', 4, 24);
    near.px(x, 172, '#628e70', 20, 24); near.px(x - 4, 180, '#628e70', 28, 12);
    near.px(x + 4, 168, '#8fb58f', 10, 6); near.px(x, 177, '#8fb58f', 8, 4);
    near.px(x + 13, 184, '#4f775e', 8, 7); near.px(x + 9, 202, '#9b7752', 1, 16);
  }
  return { id: 'kaohsiung', sky, ground, fill, platform, pickup: [tea, tea], hazard: cone, finish, check: post('#e5484d'), spike: cone, far: far.c, near: near.c, ink: '#3a2a22', hud: '#5a3a1e' };
}

// World 2 · Ling Tung University: BA Digital Media Arts & Management.
function lingtung(): Theme {
  const sky = '#dff1fb';
  const ground = tile((px) => { px(0, 0, '#3f8a46', 16, 2); px(0, 2, '#6fbf73', 16, 3); px(0, 5, '#c79a6b', 16, 11); px(4, 9, '#b0855a', 2, 1); px(11, 12, '#b0855a', 2, 1); });
  const fill = tile((px) => { px(0, 0, '#c79a6b', 16, 16); px(4, 4, '#b0855a', 2, 1); px(11, 10, '#b0855a', 2, 1); });
  // Platforms are sketchbooks: white pages on a black spiral.
  const platform = tile((px) => { px(0, 0, '#161616', 16, 8); px(1, 1, '#ffffff', 14, 6); for (let x = 1; x < 16; x += 3) px(x, 0, '#9aa7c7', 1, 2); px(3, 4, '#4a90d9', 5, 1); px(9, 3, '#e5484d', 3, 3); });
  // Pickup: a colour swatch card.
  const swatch = sprite(['kkkkkkkk', 'krrrrrrk', 'krrrrrrk', 'kyyyyyyk', 'kyyyyyyk', 'kbbbbbbk', 'kbbbbbbk', 'kwwwwwwk', 'kkkkkkkk'], { k: '#161616', r: '#e5484d', y: '#f3a414', b: '#4a90d9', w: '#ffffff' });
  const paper = sprite(['..kkkk..', '.kwwwwk.', 'kwkwwwwk', 'kwwwkwwk', 'kwkwwwwk', '.kwwkwk.', '..kkkk..'], { k: '#6b6b6b', w: '#ffffff' });
  const pencils = sprite([
    '..g....g....g...',
    '.kyk..kyk..kyk..',
    '.kyk..kyk..kyk..',
    '.kyk..kyk..kyk..',
    'kkkkkkkkkkkkkkk.',
  ].map((r) => r.padEnd(16, '.')), { k: '#3a2a22', y: '#f3c24a', g: '#4a4a48' });
  // Finish: an easel with a finished piece.
  const finish = sprite([
    '...kkkkkkkkkk...',
    '...kbbbbbbbbk...',
    '...kbyybbrrbk...',
    '...kbyybbrrbk...',
    '...kbbbbgggbk...',
    '...kkkkkkkkkk...',
    '....k......k....',
    '...k...kk...k...',
    '..k....kk....k..',
  ], { k: '#5a3a1e', b: '#e6f2fb', y: '#f3a414', r: '#e5484d', g: '#6fbf73' });
  const far = canvas(480, 270);
  for (let x = 0, i = 0; x < 480; i++) { const w = 50 + ((i * 23) % 30), h = 40 + ((i * 31) % 30); far.px(x, 230 - h, '#c9e0ec', w, h + 40); for (let wy = 236 - h; wy < 226; wy += 9) for (let wx = x + 5; wx < x + w - 5; wx += 8) far.px(wx, wy, '#e9f4fa', 4, 4); x += w + 14; }
  const near = canvas(480, 270);
  for (const x of [40, 170, 300, 420]) { near.px(x + 6, 210, '#6b4a2b', 3, 22); near.px(x, 194, '#7fbf8f', 16, 18); }
  return { id: 'lingtung', sky, ground, fill, platform, pickup: [swatch, swatch], hazard: paper, finish, check: post('#4a90d9'), spike: pencils, far: far.c, near: near.c, ink: '#3a2a22', hud: '#3a4a5a' };
}

// World 3 · Genuine C&C Inc.: web and visual designer, B2C.
function web(): Theme {
  const sky = '#e9ecf2';
  const ground = tile((px) => { px(0, 0, '#6b7280', 16, 2); px(0, 2, '#b8bfcc', 16, 14); px(0, 8, '#a6aebd', 16, 1); px(8, 2, '#a6aebd', 1, 6); });
  const fill = tile((px) => { px(0, 0, '#b8bfcc', 16, 16); px(0, 8, '#a6aebd', 16, 1); px(8, 0, '#a6aebd', 1, 8); });
  // Platforms are browser windows: a title bar with three dots.
  const platform = tile((px) => { px(0, 0, '#161616', 16, 8); px(1, 1, '#d5dae4', 14, 2); px(2, 1, '#e5484d', 1, 1); px(4, 1, '#f3a414', 1, 1); px(6, 1, '#2fbf71', 1, 1); px(1, 3, '#ffffff', 14, 4); px(3, 4, '#4a90d9', 6, 1); });
  // Pickup: an HTML tag.
  const tag = sprite(['..k.......k...', '.kbk.....kbk..', 'kbk..kk...kbk.', 'kbk..kb...kbk.', '.kbk.kb..kbk..', '..kbkb..kbk...', '...kbk...k....', '....k.........'], { k: '#0b1a33', b: '#4a90d9' });
  // Hazard: a falling 404.
  const e404 = canvas(14, 9); e404.px(0, 0, '#161616', 14, 9); e404.px(1, 1, '#e5484d', 12, 7);
  text(e404.g, '404', 1, 2, '#ffffff');
  // Finish: the site goes live.
  const live = canvas(16, 14); live.px(0, 0, '#161616', 16, 14); live.px(1, 1, '#d5dae4', 14, 2); live.px(1, 3, '#ffffff', 14, 10); live.px(5, 7, '#2fbf71', 2, 2); live.px(7, 8, '#2fbf71', 2, 2); live.px(9, 5, '#2fbf71', 2, 4);
  const far = canvas(480, 270);
  // big pixel monitors and product boxes, the shop floor of a computer company
  for (let x = 10, i = 0; x < 480; i++) {
    if (i % 2) { far.px(x, 150, '#d5dae4', 70, 50); far.px(x + 6, 156, '#c3cad8', 58, 38); far.px(x + 30, 200, '#d5dae4', 10, 14); far.px(x + 18, 214, '#d5dae4', 34, 4); x += 90; }
    else { far.px(x, 180, '#cdd3df', 40, 60); far.px(x + 4, 186, '#dfe4ec', 32, 10); x += 52; }
  }
  const near = canvas(480, 270);
  return { id: 'web', sky, ground, fill, platform, pickup: [tag, tag], hazard: e404.c, finish: live.c, check: post('#2fbf71'), spike: spike('#9aa7c7', '#161616'), far: far.c, near: near.c, ink: '#161616', hud: '#3a4a5a' };
}

// World 4 · London: MA Digital Media, London Metropolitan University. It rains.
function london(): Theme {
  const sky = '#aeb7c2';
  const ground = tile((px) => { px(0, 0, '#c6ced8', 16, 2); px(0, 2, '#6d7682', 16, 14); px(0, 8, '#626a75', 16, 1); px(8, 2, '#626a75', 1, 6); px(3, 3, '#8e98a5', 3, 1); });
  const fill = tile((px) => { px(0, 0, '#626a75', 16, 16); px(0, 8, '#59606a', 16, 1); px(8, 0, '#59606a', 1, 8); });
  // Platforms are stacks of books.
  const platform = tile((px) => { px(0, 0, '#161616', 16, 9); px(1, 1, '#2b3654', 14, 2); px(1, 3, '#e5484d', 14, 2); px(1, 5, '#7fbf8f', 14, 3); px(3, 1, '#f3a414', 1, 2); px(10, 6, '#f4f1ea', 3, 1); });
  const book = sprite(['kkkkkkkkk', 'kwwwkwwwk', 'kwkwkwkwk', 'kwwwkwwwk', 'kwkwkwkwk', 'kwwwkwwwk', 'kkkkkkkkk'], { k: '#2b3654', w: '#f4f1ea' });
  const cloud = sprite([
    '.....kkkk.........',
    '...kkggggkk.kkkk..',
    '..kggggggggkggggk.',
    '.kggggggggggggggk.',
    'kggggggggggggggggk',
    '.kkkkkkkkkkkkkkkk.',
    '..b...b...b...b...',
    '...b...b...b...b..',
  ], { k: '#4a525c', g: '#7b8592', b: '#9cc3e6' });
  // Finish: the graduation cap.
  const cap = sprite([
    '.......kk.......',
    '....kkkkkkkk....',
    '.kkkkkkkkkkkkkk.',
    '....kkkkkkkkky..',
    '.....kkkkkk..y..',
    '.....kkkkkk..yy.',
    '...gggggggggg...',
    '...gggggggggg...',
    '..gggggggggggg..',
  ], { k: '#161616', y: '#f3a414', g: '#9aa3ad' });
  const far = canvas(480, 270);
  for (let x = 0, i = 0; x < 480; i++) { const w = 22 + ((i * 19) % 24), h = 40 + ((i * 41) % 50); far.px(x, 220 - h, '#8f99a6', w, h + 50); x += w + 2; }
  // a clock tower and a big wheel on the skyline
  far.px(120, 90, '#7d8794', 18, 140); far.px(124, 70, '#7d8794', 10, 20); far.px(127, 58, '#7d8794', 4, 12); far.px(123, 100, '#c6ced8', 12, 12); far.px(128, 104, '#7d8794', 1, 4);
  for (let a = 0; a < Math.PI * 2; a += 0.05) far.px(340 + Math.round(Math.cos(a) * 46), 150 + Math.round(Math.sin(a) * 46), '#7d8794', 2, 2);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) for (let r = 0; r < 46; r += 2) far.px(340 + Math.round(Math.cos(a) * r), 150 + Math.round(Math.sin(a) * r), '#8f99a6', 1, 1);
  far.px(336, 196, '#7d8794', 8, 40);
  const near = canvas(480, 270);
  return { id: 'london', sky, ground, fill, platform, pickup: [book, book], hazard: cloud, finish: cap, check: post('#e5484d'), spike: spike('#161616', '#161616'), far: far.c, near: near.c, ink: '#161616', hud: '#2b3654', weather: 'rain' };
}

// World 5 · The Tower: J.P. Morgan, London. Intern to VP, one floor at a time.
function tower(): Theme {
  const sky = '#eef1f6';
  const ground = tile((px) => { px(0, 0, '#161616', 16, 2); px(0, 2, '#4a5568', 16, 14); px(0, 9, '#3f4859', 16, 1); });
  const fill = tile((px) => { px(0, 0, '#c9d0db', 16, 16); px(0, 15, '#b6becb', 16, 1); px(15, 0, '#b6becb', 1, 16); });
  // Platforms are desks: a wood top with a screen on it.
  const platform = tile((px) => { px(0, 0, '#5a3a24', 16, 3); px(0, 1, '#8a5a3b', 16, 1); px(1, 3, '#5a3a24', 2, 5); px(13, 3, '#5a3a24', 2, 5); });
  // Pickups: colour swatches on the lower floors (UI and visual), flow arrows
  // higher up (UX). Shannon's work grew from the first into both.
  const swatch = sprite(['kkkkkkkk', 'krrrrrrk', 'krrrrrrk', 'kyyyyyyk', 'kyyyyyyk', 'kbbbbbbk', 'kbbbbbbk', 'kkkkkkkk'], { k: '#161616', r: '#e5484d', y: '#f3a414', b: '#4a90d9' });
  const flow = sprite(['kkk......', 'kbk......', 'kbkkkkk..', 'kbbbbbbk.', 'kbkkkkbbk', '.k...kbbk', '.....kbk.', '.....kkk.'], { k: '#0b1a33', b: '#2fbf71' });
  const sheet = sprite(['kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kgggggggggwk', 'kwkwwkwwkwwk', 'kgggggggggwk', 'kwkwwkwwkwwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk'], { k: '#161616', w: '#f4f1ea', g: '#4a90d9' });
  // Finish: the Fusion dashboard at the top.
  const finish = sprite([
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwkkkkkkwwwwwwwk',
    'kwwwwwwwwwwwbwwk',
    'kwwwwwwwwwbwbwwk',
    'kwwwwwwwbwbwbwwk',
    'kwwwwwbwbwbwbwwk',
    'kwwwbwbwbwbwbwwk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
    '.......kk.......',
    '.......kk.......',
    '....kkkkkkkk....',
  ], { k: '#161616', w: '#ffffff', b: '#4a90d9' });
  const far = canvas(480, 270);
  // floor-to-ceiling windows onto the city
  for (let x = 8; x < 480; x += 60) { far.px(x, 0, '#d6e4f3', 52, 270); for (let y = 140; y < 270; y += 16) far.px(x + 4 + ((x / 60) % 3) * 8, y, '#bcd0e6', 14, 10); }
  const near = canvas(480, 270);
  for (let x = 0; x < 480; x += 60) near.px(x, 0, '#dde3ec', 8, 270);
  return { id: 'tower', sky, ground, fill, platform, pickup: [swatch, swatch], pickup2: flow, hazard: sheet, finish, check: post('#4a90d9'), spike: spike('#9aa7c7', '#161616'), far: far.c, near: near.c, ink: '#161616', hud: '#2b3654', sign: { bg: '#161616', fg: '#ffffff' } };
}

// World 7 · Next: AI. Platforms are drafted as you approach; you decide.
function ai(): Theme {
  const sky = '#15121f';
  const ground = tile((px) => { px(0, 0, '#a78bfa', 16, 1); px(0, 1, '#2d2742', 16, 15); px(0, 8, '#352e4d', 16, 1); });
  const fill = tile((px) => { px(0, 0, '#2d2742', 16, 16); px(0, 8, '#352e4d', 16, 1); });
  // Platforms are glass panels; drafts are the same panel as a dashed outline.
  const platform = tile((px) => { px(0, 0, '#c4b5fd', 16, 1); px(0, 1, '#3b3357', 16, 6); px(0, 7, '#a78bfa', 16, 1); px(2, 3, '#5b4f86', 5, 1); });
  const draft = tile((px) => { for (let x = 0; x < 16; x += 4) { px(x, 0, '#a78bfa', 2, 1); px(x + 1, 7, '#a78bfa', 2, 1); } px(0, 0, '#a78bfa', 1, 8); px(15, 0, '#a78bfa', 1, 8); });
  const spark = sprite(['....w....', '....w....', '...wpw...', 'wwwpppwww', '...wpw...', '....w....', '....w....'], { w: '#f3e8ff', p: '#c4b5fd' });
  // Hazard: noise, output that looks right and isn't.
  const noise = sprite([
    'k.kk.kkk.kk.k',
    '.mmm.mm.mmmm.',
    'kmcmmmmcmmmmk',
    '.mmmcmmmmmcm.',
    'kmmmmmcmmmmmk',
    '.mm.mmmm.mmm.',
    'k.kk.kk.kkk.k',
  ], { k: '#15121f', m: '#c026d3', c: '#f0abfc' });
  // Finish: a door marked NEXT.
  const door = canvas(16, 24); door.px(0, 0, '#a78bfa', 16, 24); door.px(2, 2, '#15121f', 12, 22); door.px(4, 4, '#3b3357', 8, 20); text(door.g, '>', 6, 10, '#f3e8ff');
  const far = canvas(480, 270);
  for (let y = 10; y < 270; y += 20) for (let x = 10; x < 480; x += 20) far.px(x, y, '#2a2340', 1, 1);
  for (const [x, y, r] of [[90, 80, 40], [330, 120, 56], [420, 60, 24]]) for (let k = r; k > 0; k -= 6) far.px(x - k, y - k / 2, k > r / 2 ? '#1d1830' : '#241e3a', k * 2, k);
  const near = canvas(480, 270);
  for (const [x, y] of [[60, 50], [200, 30], [280, 90], [420, 40]]) { near.px(x, y, '#c4b5fd', 1, 3); near.px(x - 1, y + 1, '#c4b5fd', 3, 1); }
  return { id: 'ai', sky, ground, fill, platform, draft, pickup: [spark, spark], hazard: noise, finish: door.c, check: post('#a78bfa'), spike: spike('#5b4f86', '#a78bfa'), far: far.c, near: near.c, ink: '#c4b5fd', hud: '#c4b5fd' };
}

/** Solid rose scooter: enclosed panels, dark chassis and opaque tyres.
 * Drawn on the same art grid as the rider, facing right. */
export const scooter = () => sprite([
  '...................kkkk...',
  '...................kwwk...',
  '...................kppk...',
  '..kkkkkkkk.........kppk...',
  '..knnnnnnk.........kppk...',
  '..kkkkkkkkk........kppk...',
  '.kpppppppppk.......kpppk..',
  'kphhhhhppppk.......kphppk.',
  'kppppppppppk.......kphppk.',
  'kppppppppppk.......kppppk.',
  'kppppppppppkkkkkkkkkppppk.',
  '.kppppppppppppppppppppppk.',
  '..kkkkkkkkkkkkkkkkkkkkkk..',
  '..kknnk............kknnk..',
  '..knwwnk..........knwwnk..',
  '..knwwnk..........knwwnk..',
  '...kkkk............kkkk...',
], { k:'#172239', p:'#cf6e85', h:'#f4b3bf', n:'#34445f', w:'#fff0d7' });

export const THEMES: Record<ThemeId, () => Theme> = { kaohsiung, lingtung, web, london, tower, desk, ai, bedtime };
