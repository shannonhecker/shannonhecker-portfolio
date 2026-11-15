// Tiny pixel-art toolkit. Art is authored at 1 art px = 2 world px, so the
// 960×540 world renders on a 480×270 canvas scaled up with nearest-neighbour.

export type Palette = Record<string, string>;

/** Compile a character grid into a canvas. '.' and ' ' are transparent. */
export function sprite(rows: string[], pal: Palette): HTMLCanvasElement {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (!ch || ch === '.' || ch === ' ') continue;
      g.fillStyle = pal[ch] ?? '#ff00ff';
      g.fillRect(x, y, 1, 1);
    }
  return c;
}

/** Blank art canvas for procedural drawing. */
export function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return { c, g, px: (x: number, y: number, col: string, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); } };
}

/** Mirror a sprite horizontally (for facing left). */
export function flip(src: HTMLCanvasElement): HTMLCanvasElement {
  const { c, g } = canvas(src.width, src.height);
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

/** Solid-colour silhouette of a sprite (hurt flash). */
export function tint(src: HTMLCanvasElement, col: string): HTMLCanvasElement {
  const { c, g } = canvas(src.width, src.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

// 3×5 pixel font for the HUD, map and signs: A–Z, 0–9 and a little punctuation.
const FONT: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'], '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'], '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'], '/': ['..#', '..#', '.#.', '#..', '#..'], ' ': ['...', '...', '...', '...', '...'],
  '-': ['...', '...', '###', '...', '...'], '.': ['...', '...', '...', '...', '.#.'], '·': ['...', '...', '.#.', '...', '...'],
  ':': ['...', '.#.', '...', '.#.', '...'], "'": ['.#.', '.#.', '...', '...', '...'], '&': ['.#.', '#.#', '.#.', '#.#', '.##'],
  '+': ['...', '.#.', '###', '.#.', '...'], '>': ['#..', '.#.', '..#', '.#.', '#..'], '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '★': ['.#.', '###', '.#.', '#.#', '...'],
};
/** Width in art px of a string drawn by text() at a given scale. */
export const textWidth = (s: string, scale = 1) => Math.max(0, s.length * 4 * scale - scale);
export function text(g: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, scale = 1) {
  g.fillStyle = col;
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const glyph = FONT[ch];
    if (glyph) for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (glyph[r][k] === '#') g.fillRect(cx + k * scale, y + r * scale, scale, scale);
    cx += 4 * scale;
  }
}
