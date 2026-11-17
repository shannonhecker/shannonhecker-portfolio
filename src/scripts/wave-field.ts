// Guilloché wave field. A port of the old site's canvas (legacy-static index.html,
// about.html, work.html): 90 hairlines, each a sum of three sines, one phase step
// apart, stroked with a colour gradient. Geometry, colours, line weight and speed are
// the old values. Differences: the three sines use the angle-addition identity (the
// same curve, a fraction of the trig work), the loop runs at 30 frames a second,
// stops when the canvas is off screen or the tab is hidden, and a short band uses
// fewer lines so they never close into a solid.

type Rgba = [number, number, number, number];
type Stop = [number, Rgba];

interface Spec {
  axis: 'x' | 'y'; // the direction the lines run
  n: number;
  speed: number; // radians per millisecond
  phaseStep: number;
  lineWidth: number;
  bandStart: number;
  bandEnd: number;
  ampl: number;
  bellFloor: number; // thinnest amplitude, as a share of the full one
  sheetVh?: number; // phones: lay the lines out on a sheet this many window heights tall
  pinned: boolean; // old parallax: the field stays put while its section scrolls past
  dark: Stop[];
  light: Stop[];
}

const rgba = (c: Rgba) => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;
const stops = (rows: [number, number, number, number, number][]): Stop[] => rows.map(([o, r, g, b, a]) => [o, [r, g, b, a]]);

// The index hero: lavender, cyan, periwinkle, teal. Light draws white lines over the glow.
const HERO: Spec = {
  axis: 'x', n: 90, speed: 0.00034, phaseStep: 0.17, lineWidth: 0.85, bandStart: 0.08, bandEnd: 0.92, ampl: 0.042, bellFloor: 0.4, sheetVh: 1.3, pinned: true,
  dark: stops([[0, 196, 181, 253, 0], [0.06, 196, 181, 253, 0.3], [0.35, 103, 232, 249, 0.3], [0.65, 129, 140, 248, 0.3], [0.94, 94, 234, 212, 0.3], [1, 94, 234, 212, 0]]),
  light: stops([[0, 150, 130, 235, 0], [0.06, 150, 130, 235, 0.3], [0.35, 40, 165, 200, 0.3], [0.65, 100, 110, 225, 0.3], [0.94, 30, 165, 150, 0.3], [1, 30, 165, 150, 0]]),
};
// About: the lines run top to bottom, amber into blue.
const ABOUT: Spec = {
  ...HERO, axis: 'y',
  dark: stops([[0, 255, 239, 168, 0], [0.06, 255, 239, 168, 0.3], [0.35, 200, 220, 210, 0.3], [0.65, 143, 201, 255, 0.3], [0.94, 143, 201, 255, 0.3], [1, 143, 201, 255, 0]]),
  light: stops([[0, 215, 165, 30, 0], [0.06, 215, 165, 30, 0.3], [0.35, 110, 170, 150, 0.3], [0.65, 70, 140, 225, 0.3], [0.94, 70, 140, 225, 0.3], [1, 70, 140, 225, 0]]),
};
// Work: the work page's pink and amber.
const WORK: Spec = {
  ...HERO, pinned: false,
  dark: stops([[0, 255, 145, 185, 0], [0.06, 255, 145, 185, 0.3], [0.35, 255, 198, 95, 0.3], [0.65, 255, 175, 135, 0.3], [0.94, 255, 205, 110, 0.3], [1, 255, 205, 110, 0]]),
  light: stops([[0, 230, 90, 150, 0], [0.06, 230, 90, 150, 0.3], [0.35, 220, 140, 20, 0.3], [0.65, 225, 120, 80, 0.3], [0.94, 220, 145, 30, 0.3], [1, 220, 145, 30, 0]]),
};
// Ask: the card's own family, pink into violet into blue and back, so the lines read as the card's
// edge continued. They are masked to flank the card on both sides (see wave-field.css).
const ASK: Spec = {
  axis: 'x', n: 85, speed: 0.00026, phaseStep: 0.19, lineWidth: 0.72, bandStart: 0.05, bandEnd: 0.95, ampl: 0.04, bellFloor: 0.35, pinned: false,
  dark: stops([[0, 236, 72, 153, 0], [0.06, 236, 72, 153, 0.3], [0.3, 168, 85, 247, 0.3], [0.5, 91, 141, 239, 0.3], [0.7, 168, 85, 247, 0.3], [0.94, 236, 72, 153, 0.3], [1, 236, 72, 153, 0]]),
  light: stops([[0, 214, 58, 140, 0], [0.06, 214, 58, 140, 0.3], [0.3, 140, 70, 225, 0.3], [0.5, 60, 110, 215, 0.3], [0.7, 140, 70, 225, 0.3], [0.94, 214, 58, 140, 0.3], [1, 214, 58, 140, 0]]),
};
// Writing: the head of the writing index. Cool teal into green, a quiet cousin of the hero.
const WRITING: Spec = {
  ...HERO, pinned: false,
  dark: stops([[0, 94, 234, 212, 0], [0.06, 94, 234, 212, 0.3], [0.38, 110, 231, 183, 0.3], [0.68, 103, 232, 249, 0.3], [0.94, 134, 239, 172, 0.3], [1, 134, 239, 172, 0]]),
  light: stops([[0, 20, 160, 140, 0], [0.06, 20, 160, 140, 0.3], [0.38, 40, 165, 105, 0.3], [0.68, 30, 150, 185, 0.3], [0.94, 60, 165, 100, 0.3], [1, 60, 165, 100, 0]]),
};
const SPECS: Record<string, Spec> = { hero: HERO, about: ABOUT, work: WORK, writing: WRITING, ask: ASK };

const MIN_GAP = 6; // closest two lines may sit, in CSS pixels
const FRAME_MS = 1000 / 30;
// The field must never be heavy, and nothing reliable tells a page whether a frame is cheap here.
// With graphics acceleration it costs next to nothing; without it (some headless browsers, old or
// locked-down devices) every hairline is painted on the processor: 14 ms for a phone-sized field, 24 ms
// for a large one. Timing the canvas cannot tell the two apart (reading a pixel back from an
// accelerated canvas takes 5 to 70 ms on a good machine), and a browser will say accelerated graphics
// are available while painting the canvas on the processor. So the field does not guess:
//  1. Its first picture is still, drawn a slice per frame so that no single step is long.
//  2. Motion starts when the visitor does anything (moves the pointer, touches, scrolls, presses a
//     key), or after 12 seconds. Someone looking at the page sees it move almost at once; a page that
//     is only being loaded does no animation work.
//  3. Once moving, the frame rate is watched. A field that cannot keep up steps down to a lighter
//     drawing (fewer points, one device pixel per CSS pixel, 20 frames a second) and then to still.
const SLICES = 6; // the still picture is drawn one line in six at a time
const WAKE_AFTER_MS = 12000;
const SLOW_MS = 24; // later on: a frame slower than this is too slow (a 60 Hz screen allows 16.7)
const WINDOW = 20; // the median of every 20 frames is watched
// What one field learns about this device, the others on the page adopt.
let deviceLevel = 0;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;

class WaveField {
  private ctx: CanvasRenderingContext2D;
  private spec: Spec;
  private host: HTMLElement;
  private stage: HTMLElement;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private lines: { base: number; amp: number; ph: number }[] = [];
  private grad: CanvasGradient | null = null;
  private steps = 240;
  // Per step, the sine and cosine of each harmonic's position along the line.
  private s1 = new Float32Array(0);
  private c1 = new Float32Array(0);
  private s2 = new Float32Array(0);
  private c2 = new Float32Array(0);
  private s3 = new Float32Array(0);
  private c3 = new Float32Array(0);
  private visible = false;
  private raf = 0;
  private last = 0;
  private t0 = 0;
  private fieldTop = 0;
  private scrollQueued = false;
  private level = 0; // 0 full, 1 lighter, 2 still
  private drewAt = 0; // the frame time of the last draw, while its paint is being timed
  private samples: number[] = [];
  private strikes = 0;
  private measured = false; // the first picture's paint has been timed

  constructor(private field: HTMLElement, private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.spec = SPECS[field.dataset.variant || 'hero'] || HERO;
    this.host = field.parentElement as HTMLElement;
    this.stage = field.querySelector('.wave-field__stage') as HTMLElement;

    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && (this.pending || !this.measured)) this.paintNow();
      this.sync();
    }).observe(canvas);
    // Once its section has left the window (the top 96px belong to the nav), the field fades out, so a
    // pinned field never leaves a faint strip under the nav. It fades back in when the section returns.
    new IntersectionObserver(([e]) => field.classList.toggle('is-away', !e.isIntersecting), { rootMargin: '-96px 0px 0px 0px' }).observe(this.host);
    document.addEventListener('visibilitychange', () => this.sync());
    new MutationObserver(() => this.theme()).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    reduced.addEventListener('change', () => this.motionChanged());
    if (this.spec.pinned) addEventListener('scroll', () => this.onScroll(), { passive: true });
    const avoid = field.dataset.avoid;
    if (avoid) {
      const target = this.host.querySelector(avoid);
      if (target) {
        new ResizeObserver(() => this.measureHole(target as HTMLElement)).observe(target);
        addEventListener('load', () => this.measureHole(target as HTMLElement));
        this.holeTarget = target as HTMLElement;
      }
    }
    this.resize();
  }

  wake() { this.sync(); }

  // The first picture: still, a slice per frame (see the note at the top of this file).
  private firstPaint() {
    this.measured = true;
    const now = performance.now();
    this.field.classList.add('is-measured');
    if (reduced.matches) { this.draw(now); return; }
    this.draw(now, 0);
    let slice = 1;
    const next = () => {
      if (slice >= SLICES || !this.sliced) return;
      this.draw(now, slice++);
      requestAnimationFrame(next);
    };
    this.sliced = true;
    requestAnimationFrame(next);
  }
  private sliced = false; // a sliced picture is in progress or on the canvas; a full redraw replaces it

  private adopt(level: number) {
    if (level <= this.level) return;
    this.level = level;
    if (level > deviceLevel) deviceLevel = level;
    this.strikes = 0;
    this.samples = [];
    this.drewAt = 0;
    this.field.dataset.level = String(level);
    if (level === 1) this.resize(); // redraw lighter; a still field keeps the picture it has
    else this.sync();
  }
  private holeTarget: HTMLElement | null = null;

  private get dark() {
    return root.dataset.theme !== 'light';
  }

  // The lines (not the glow) dissolve around the avoided element. The mask sits on the canvas, which
  // rides with the pinned stage, so the hole is kept in the canvas's own coordinates: measured
  // against the field (which never moves) and moved back by the stage's current shift.
  private holeX = 0;
  private holeY = 0;
  private shift = 0;

  private measureHole(t: HTMLElement) {
    const f = this.field.getBoundingClientRect();
    const r = t.getBoundingClientRect();
    if (!r.width || !f.width) return;
    this.holeX = r.left - f.left + r.width / 2 - this.canvas.offsetLeft;
    this.holeY = r.top - f.top + r.height / 2 - this.canvas.offsetTop;
    const s = this.field.style;
    s.setProperty('--hw', `${r.width * 0.95}px`);
    s.setProperty('--hh', `${r.height * 0.85}px`);
    this.placeHole();
  }

  private placeHole() {
    const s = this.field.style;
    s.setProperty('--hx', `${this.holeX}px`);
    s.setProperty('--hy', `${this.holeY - this.shift}px`);
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.dpr = this.level === 1 ? 1 : Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.w = r.width;
    this.h = r.height;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.build();
    const fr = this.field.getBoundingClientRect();
    this.fieldTop = fr.top + scrollY;
    if (this.holeTarget) this.measureHole(this.holeTarget);
    this.sync();
    this.paintNow();
  }

  // One picture straight away. A field that is off screen waits until it is first seen, so a page
  // never pays for a field nobody is looking at; the first picture each field draws is also timed.
  private paintNow() {
    if (!this.visible) { this.pending = true; return; }
    this.pending = false;
    if (!this.measured) { this.firstPaint(); this.sync(); return; }
    this.sliced = false;
    this.draw(performance.now());
  }
  private pending = false;

  private build() {
    const sp = this.spec;
    const along = sp.axis === 'x' ? this.w : this.h; // the length of each line
    // On a phone the hero is short against the old one, so the pattern is laid out on a
    // taller sheet (the lines past the bottom are simply not drawn). That keeps the
    // old spacing and sweep instead of a finer, flatter mesh.
    const tall = sp.sheetVh && innerWidth <= 900 ? Math.max(this.h, innerHeight * sp.sheetVh) : 0;
    const across = sp.axis === 'x' ? Math.max(this.h, tall) : this.w; // the way the lines are stacked
    const band = across * (sp.bandEnd - sp.bandStart);
    // A short band keeps the old pattern with fewer lines. Phase runs with position,
    // so the lines still sweep at the same angle.
    const n = Math.min(sp.n, Math.max(24, Math.floor(band / MIN_GAP) + 1));
    const k = (sp.n - 1) / (n - 1);
    const gap = band / (n - 1);
    const am = band * sp.ampl;
    this.lines = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const bell = sp.bellFloor + (1 - sp.bellFloor) * Math.sin(t * Math.PI);
      this.lines.push({ base: across * sp.bandStart + i * gap, amp: am * bell, ph: i * sp.phaseStep * k });
    }
    this.steps = Math.max(120, Math.min(240, Math.round(along / 4)));
    if (this.level === 1) this.steps = Math.max(60, Math.round(this.steps / 2));
    const m = this.steps + 1;
    this.s1 = new Float32Array(m); this.c1 = new Float32Array(m);
    this.s2 = new Float32Array(m); this.c2 = new Float32Array(m);
    this.s3 = new Float32Array(m); this.c3 = new Float32Array(m);
    for (let s = 0; s < m; s++) {
      const nx = s / this.steps;
      const a1 = nx * TAU * 2, a2 = nx * TAU * 4 + 1.4, a3 = nx * TAU * 6 + 2.8;
      this.s1[s] = Math.sin(a1); this.c1[s] = Math.cos(a1);
      this.s2[s] = Math.sin(a2); this.c2[s] = Math.cos(a2);
      this.s3[s] = Math.sin(a3); this.c3[s] = Math.cos(a3);
    }
    this.buildGradient();
  }

  private buildGradient() {
    const sp = this.spec;
    const g = sp.axis === 'x' ? this.ctx.createLinearGradient(0, 0, this.w, 0) : this.ctx.createLinearGradient(0, 0, 0, this.h);
    for (const [o, c] of this.dark ? sp.dark : sp.light) g.addColorStop(o, rgba(c));
    this.grad = g;
  }

  private theme() {
    this.buildGradient();
    this.redraw();
  }

  private redraw() {
    if (!this.visible) { this.pending = true; return; }
    this.sliced = false;
    this.draw(performance.now());
  }

  private motionChanged() {
    this.sync();
    this.redraw();
  }

  private animate() {
    return awake && this.measured && this.level < 2 && !reduced.matches && this.visible && !document.hidden;
  }

  private sync() {
    this.field.classList.toggle('is-moving', this.animate());
    if (this.animate()) {
      if (!this.raf) this.raf = requestAnimationFrame((t) => this.frame(t));
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (reduced.matches) {
      this.stage.style.transform = '';
      if (this.shift) { this.shift = 0; this.placeHole(); }
    }
  }

  private frame(ts: number) {
    this.raf = 0;
    if (!this.animate()) return;
    if (this.level < deviceLevel) { this.adopt(deviceLevel); return; }
    this.raf = requestAnimationFrame((t) => this.frame(t));
    if (this.drewAt) {
      const took = ts - this.drewAt;
      this.drewAt = 0;
      // A long gap is a hidden tab or a stalled page, not a slow paint.
      if (took < 250 && this.watch(took)) return;
    }
    if (ts - this.last < (this.level ? 50 : FRAME_MS) - 1) return;
    this.last = ts;
    if (!this.t0) this.t0 = ts;
    this.sliced = false;
    this.draw(ts);
    this.drewAt = ts;
  }

  // The frame-rate watch. Returns true when the field has just been stepped down.
  private watch(took: number) {
    this.samples.push(took);
    if (this.samples.length < WINDOW) return false;
    const median = this.samples.sort((a, b) => a - b)[WINDOW >> 1];
    this.samples = [];
    this.strikes = median > SLOW_MS ? this.strikes + 1 : 0;
    if (this.strikes < 2) return false;
    this.adopt(this.level + 1);
    return true;
  }

  // `slice` draws only every sixth line, starting at that line, on top of what is there.
  private draw(ts: number, slice = -1) {
    if (!this.grad || !this.w) return;
    // One still frame under reduced motion, at the animation's first moment.
    // Still pictures are the animation's first moment, so motion starts from them without a jump.
    const el = reduced.matches || slice >= 0 || !this.t0 ? 0 : ts - this.t0;
    const { ctx, spec, w, h, steps } = this;
    const run = spec.axis === 'x';
    if (slice <= 0) ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = this.grad;
    ctx.lineWidth = spec.lineWidth;
    const { s1, c1, s2, c2, s3, c3 } = this;
    const lenStep = (run ? w : h) / steps;
    const stride = slice < 0 ? 1 : SLICES;
    for (let i = Math.max(0, slice); i < this.lines.length; i += stride) {
      const ln = this.lines[i];
      const phi = el * spec.speed + ln.ph;
      const p2 = phi * 1.5, p3 = phi * 2.1;
      const sa = Math.sin(phi), ca = Math.cos(phi);
      const sb = Math.sin(p2), cb = Math.cos(p2);
      const sc = Math.sin(p3), cc = Math.cos(p3);
      const a1 = ln.amp, a2 = ln.amp * 0.28, a3 = ln.amp * 0.1;
      if (ln.base - a1 * 1.4 > (run ? h : w)) break; // below the visible sheet
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const off = ln.base + a1 * (sa * c1[s] + ca * s1[s]) + a2 * (sb * c2[s] + cb * s2[s]) + a3 * (sc * c3[s] + cc * s3[s]);
        const along = s * lenStep;
        if (run) s === 0 ? ctx.moveTo(along, off) : ctx.lineTo(along, off);
        else s === 0 ? ctx.moveTo(off, along) : ctx.lineTo(off, along);
      }
      ctx.stroke();
    }
    if (!this.canvas.classList.contains('is-ready')) this.canvas.classList.add('is-ready');
  }

  // The old parallax: while its section is on screen the field stays where it is in
  // the window, and the text scrolls over it.
  private onScroll() {
    if (this.scrollQueued || reduced.matches) return;
    this.scrollQueued = true;
    requestAnimationFrame(() => {
      this.scrollQueued = false;
      const y = scrollY - this.fieldTop;
      const inside = y > 0 && y < this.field.offsetHeight - 40;
      this.stage.style.transform = inside ? `translate3d(0,${y}px,0)` : '';
      if (this.holeTarget) {
        this.shift = inside ? y : 0;
        this.placeHole();
      }
    });
  }
}

// Motion waits for the visitor (or 12 seconds).
let awake = false;
const fields: WaveField[] = [];
function wake() {
  if (awake) return;
  awake = true;
  for (const type of WAKE_ON) removeEventListener(type, wake);
  for (const f of fields) f.wake();
}
const WAKE_ON = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const;

const start = () => {
  document.querySelectorAll<HTMLElement>('.wave-field').forEach((field) => {
    const canvas = field.querySelector<HTMLCanvasElement>('.wave-field__canvas');
    if (!canvas || !canvas.getContext) return;
    field.classList.add('is-on');
    fields.push(new WaveField(field, canvas));
  });
  for (const type of WAKE_ON) addEventListener(type, wake, { passive: true, once: true });
  setTimeout(wake, WAKE_AFTER_MS);
};
// Nothing of the field competes with the page: it starts once the page has loaded and is idle.
const whenIdle = () => {
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(start, { timeout: 1200 });
  else setTimeout(start, 200);
};
if (document.readyState === 'complete') whenIdle();
else addEventListener('load', whenIdle, { once: true });

export {};
