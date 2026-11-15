// Shannon, era by era. Each world dresses her the way that year looked, so the
// character ages through the map: a school ponytail in Kaohsiung, side-swept
// bangs and a Breton top at university (2008–10), ombré tips and a Peter Pan
// collar in 2010, a lob and a camel coat in London (2015–16), a blazer at
// J.P. Morgan, and her own reference look today (wavy hair, cream turtleneck,
// wide pink trousers). Hand-placed pixels; nothing traced or generated.
// Head and torso are a 16×17 grid per era; legs are drawn per pose below.
import { sprite, canvas, flip, tint, type Palette } from './pixel';

type Legs = 'shorts' | 'skinny' | 'straight' | 'wide';
type Look = {
  grid: string[];
  pal: Palette; // w top, x/y accents, b bottoms, n shoes, h/H/t hair, r hair accessory
  legs: Legs;
  shoe: 'trainer' | 'flat';
  coat?: boolean; // London: the coat hangs over the top of the legs
  laptop?: boolean; // Next: AI, from her own reference
};

// Shared across eras: skin, eyes, blush, mouth, pearl/highlight, gold, outline.
const SKIN: Palette = { k: '#2a1a14', s: '#f4c9a4', e: '#2a1a14', c: '#f08c8c', m: '#c8505a', p: '#ffffff', a: '#f3a414', h: '#3a2418', H: '#5e3a2a' };

export type LookId = 'kaohsiung' | 'lingtung' | 'web' | 'london' | 'tower' | 'desk' | 'ai' | 'bedtime';

// Today's look, from her two references (Barclays, Next: AI).
const TODAY: Look = {
  grid: [
    '....kkkkkk......',
    '...khhHhhhkk....',
    '..khhhhHhhhhk...',
    '.khhhhhhhhhhhk..',
    '.khhhhhhhhhhhk..',
    '.khhshshhshhhhk.',
    '.khsssssssshhhk.',
    '.khspesspeshHhk.',
    '.khseesseesphhk.',
    '.khhcssssschhhk.',
    'kHhhhssmsshhhHk.',
    'khhhkWWWWWkhhhk.',
    'khhkwwWwwwwkhhk.',
    'khkswwwawwwwkhk.',
    '.kkswwwwwwwwskhk',
    '..kswwwwwwWWskk.',
    '...kwwwwwwwwkk..',
  ],
  pal: { h: '#4a2c20', H: '#6e4432', w: '#f7e8cc', b: '#f08ca4', n: '#f6efe2' },
  legs: 'wide', shoe: 'trainer',
};

export const LOOKS: Record<LookId, Look> = {
  // Growing up: high ponytail with a scrunchie, school PE tee with a navy trim, shorts.
  kaohsiung: {
    grid: [
      '....kkkkkk..kk..',
      '...khhHhhhkkrrk.',
      '..khhhhHhhhhkhhk',
      '..khhhhhhhhhkhhk',
      '..khhhhhhhhhhkhk',
      '..khhhhhhhhhhkhk',
      '..khsssssssshkhk',
      '..khspesspeshkhk',
      '..khseesseesk.kk',
      '..kkhcssssschk..',
      '...kkssmsssk....',
      '....kkxxxxkk....',
      '...kwwxwwxwwk...',
      '..kswwwwwwwwsk..',
      '..kswwwwwwwwsk..',
      '...kxwwwwwwxk...',
      '...kwwwwwwwwk...',
    ],
    pal: { h: '#1f1410', H: '#3a2a22', r: '#e5484d', w: '#ffffff', x: '#2b3654', b: '#2b3654', n: '#ffffff' },
    legs: 'shorts', shoe: 'trainer',
  },
  // Ling Tung, 2008–10: long straight hair, side-swept bangs, Breton stripes, skinny jeans.
  lingtung: {
    grid: [
      '....kkkkkk......',
      '...khhhhHhkk....',
      '..khhhhhhHhhk...',
      '.khhhhhhhhhhhk..',
      '.khhhhhhhhhhhk..',
      '.khsshhhhhhhhhk.',
      '.khssssssshhhhk.',
      '.khspesspeshhhk.',
      '.khseesseeshhhk.',
      '.khhcssssschhhk.',
      '.khhhssmsshhhhk.',
      '.khhhkwwwwkhhhk.',
      '.khhkxxxxxxkhhk.',
      '.khkswwwwwwskhk.',
      '.khkxxxxxxxxkhk.',
      '..kswwwwwwwwsk..',
      '...kxxxxxxxxk...',
    ],
    pal: { h: '#1f1410', H: '#3a2a22', w: '#ffffff', x: '#2b3654', b: '#3d5a80', n: '#161616' },
    legs: 'skinny', shoe: 'flat',
  },
  // Genuine C&C Inc., 2010: blunt fringe, ombré tips, mint top with a Peter Pan collar, coral skinnies.
  web: {
    grid: [
      '....kkkkkk......',
      '...khhHhhhkk....',
      '..khhhhHhhhhk...',
      '.khhhhhhhhhhhk..',
      '.khhhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      '.khsssssssshhhk.',
      '.khspesspeshhhk.',
      '.khseesseeshhhk.',
      '.khhcssssschhhk.',
      '.khhhssmsshhhhk.',
      '.khhhkyyyykhhhk.',
      '.khtkyyWWyykthk.',
      '.kttswwwwwwsttk.',
      '..ktswwwwwwstk..',
      '...kswwwwwwsk...',
      '...kwwwwwwwwk...',
    ],
    pal: { h: '#3a2418', H: '#5e3a2a', t: '#b9875a', w: '#9fe0c8', y: '#ffffff', b: '#f2766b', n: '#e8c4a8' },
    legs: 'skinny', shoe: 'flat',
  },
  // London, 2015–16: a lob, a camel coat over a white tee, black jeans, white trainers.
  london: {
    grid: [
      '....kkkkkk......',
      '...khhHhhhkk....',
      '..khhhhHhhhhk...',
      '.khhhhhhhhhhhk..',
      '.khhhhhhhhhhhk..',
      '.khhshhhhhhshhk.',
      '.khssssssssshhk.',
      '.khspesspesshhk.',
      '.khseesseesshhk.',
      '.khhcssssschhhk.',
      '.kHhhssmsshhhHk.',
      '..kkhkksskkhkk..',
      '..kwwxkyykxwwk..',
      '.kswwxyyyyxwwsk.',
      '.kswwxyyyyxwwsk.',
      '..kwwwxyyxwwwk..',
      '..kwwwwxxwwwwk..',
    ],
    pal: { h: '#3a2418', H: '#5e3a2a', w: '#c08a54', x: '#8a5a30', y: '#2b2b30', b: '#1f1f24', n: '#ffffff' },
    legs: 'skinny', shoe: 'trainer', coat: true,
  },
  // J.P. Morgan, 2016–25: sleek centre-parted hair, navy blazer, white shirt, tailored trousers.
  tower: {
    grid: [
      '....kkkkkk......',
      '...khhhhhhkk....',
      '..khhhHhhhhhk...',
      '.khhhhhhhhhhhk..',
      '.khhhhhhhhhhhk..',
      '.khhhhsshhhhhk..',
      '.khhssssssshhk..',
      '.khspesspeshhk..',
      '.khseesseesphk..',
      '.khhcssssschhk..',
      '.khhhssmsshhhk..',
      '..khhkksskkhhk..',
      '..kwkxyssyxkwk..',
      '.kswwxyyyyxwwsk.',
      '.kswwwxyyxwwwsk.',
      '..kwwwwxxwwwwk..',
      '..kwwwwwwwwwwk..',
    ],
    pal: { h: '#2a1a14', H: '#4a2c20', w: '#2b3654', x: '#1b2340', y: '#cfe0f5', b: '#1f1f24', n: '#161616' },
    legs: 'straight', shoe: 'flat',
  },
  desk: TODAY,
  ai: { ...TODAY, laptop: true },
  // Bedtime (Winking Star): claw-clip updo, face-framing strands, soft pyjamas.
  bedtime: {
    grid: [
      '....kkkkkk.kkk..',
      '...khhHhhhkrrrk.',
      '..khhhhHhhhkrrk.',
      '.khhhhhhhhhhkk..',
      '.khhhhhhhhhhhk..',
      '.khhshhhhhshhk..',
      '.khsssssssshk...',
      '.khspesspeshk...',
      '.khseesseeshk...',
      '.khhcssssschk...',
      '..khhssmsshk....',
      '...kkxxxxxkk....',
      '...kwxwwwxwk....',
      '..kswwxwwwwwsk..',
      '..kswwxwwwwwsk..',
      '...kwwxwwwwwk...',
      '...kwwwwwwwwk...',
    ],
    pal: { h: '#3a2418', H: '#5e3a2a', r: '#f3a414', w: '#b9d3f2', x: '#ffffff', b: '#b9d3f2', n: '#f7d7e0' },
    legs: 'straight', shoe: 'flat',
  },
};

/** Darken a #rrggbb colour (folds, creases). */
function shade(hex: string, f = 0.85) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v * f).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

type Pose = 'idle' | 'run' | 'jump' | 'fall' | 'hurt' | 'cheer';
const LEG_W: Record<Legs, number> = { shorts: 4, skinny: 4, straight: 4, wide: 5 };

function body(look: Look, pose: Pose, f: number) {
  const P = { ...SKIN, ...look.pal } as Palette;
  P.W = shade(P.w); P.B = shade(P.b); P.X = shade(P.x ?? P.w);
  const { c, g, px } = canvas(16, 24);
  const breathe = f === 1 && pose === 'idle' ? 1 : 0;
  const lw = LEG_W[look.legs];
  const leg = (x: number, lift: number, len = 5) => {
    px(x, 17, P.k, 1, len); px(x + lw - 1, 17, P.k, 1, len);
    px(x + 1, 17, P.b, lw - 2, len);
    if (look.legs === 'shorts') px(x + 1, 19, P.s, lw - 2, len - 2); // bare legs below the hem
    else if (look.legs === 'wide') px(x + 2, 18, P.B, 1, len - 2); // crease
    const sy = 17 + len - lift;
    if (look.shoe === 'trainer') { px(x - 1, sy, P.k, lw + 2, 2); px(x, sy, P.n, lw, 1); }
    else { px(x, sy, P.k, lw, 2); px(x, sy, P.n, lw, 1); }
  };
  px(3, 17, P.k, 10, 1); px(4, 17, P.b, 8, 1); // waistband
  // legs first: the grid (hair, torso) and the coat sit over them
  const [l, r] = look.legs === 'wide' ? [2, 9] : [3, 9];
  if (pose === 'idle' || pose === 'hurt') { leg(l, 0); leg(r, 0); }
  else if (pose === 'run') {
    const ph = (f / 6) * Math.PI * 2;
    const d = Math.round(Math.sin(ph) * 2);
    leg(l + 1 + d, Math.max(0, Math.round(Math.cos(ph) * 2)));
    leg(r - 1 - d, Math.max(0, Math.round(-Math.cos(ph) * 2)));
  } else if (pose === 'jump') { leg(l - 1, 2, 4); leg(r + 1, 0, 5); }
  else if (pose === 'fall') { leg(l - 1, 0, 5); leg(r + 1, 0, 5); }
  else if (pose === 'cheer') { leg(l, f ? 1 : 0); leg(r, f ? 0 : 1); }
  g.drawImage(sprite(look.grid, P), 0, breathe);
  if (look.coat) { px(2, 17 + breathe, P.k, 12, 3); px(3, 17 + breathe, P.w, 10, 2); px(7, 17 + breathe, P.x, 2, 2); }
  const sleeve = (x: number, y: number, h: number) => { px(x, y, P.w, 2, h); px(x, y + h, P.s, 2, 1); };
  if (pose === 'run') {
    const d = Math.round(Math.sin((f / 6) * Math.PI * 2) * 2);
    px(2, 14 - Math.max(0, -d), P.s, 1, 2); px(13, 14 - Math.max(0, d), P.s, 1, 2);
  } else if (pose === 'fall') { sleeve(0, 9, 3); sleeve(14, 9, 3); }
  else if (pose === 'hurt') { px(4, 7, P.s, 2, 2); px(8, 7, P.s, 2, 2); px(4, 8, P.e, 2, 1); px(8, 8, P.e, 2, 1); }
  else if (pose === 'cheer') {
    // both arms up, a little star in hand on the second frame (Winking Star nod)
    sleeve(0, 8 - f, 4); sleeve(14, 8 - f, 4);
    px(0, 7 - f, P.s, 2, 1); px(14, 7 - f, P.s, 2, 1);
    if (f) { px(1, 4, P.a, 1, 1); px(0, 5, P.a, 3, 1); px(1, 6, P.a, 1, 1); }
  }
  // Her laptop, held at the hip like her reference. Plain lid: no brand marks.
  if (look.laptop && pose !== 'cheer' && pose !== 'fall') {
    const y = 12 + breathe;
    px(0, y, P.k, 8, 6); px(1, y + 1, '#b8bcc6', 6, 4); px(1, y + 4, '#8d929e', 6, 1);
    px(5, y + 2, P.s, 3, 2); // her hand on the keys
  }
  return c;
}

/** The character's frames for one world's era. */
export function playerFrames(id: LookId) {
  const look = LOOKS[id];
  const make = (pose: Pose, n: number) => Array.from({ length: n }, (_, f) => body(look, pose, f));
  const right = {
    idle: make('idle', 2), run: make('run', 6), jump: make('jump', 1),
    fall: make('fall', 1), hurt: make('hurt', 1), cheer: make('cheer', 2),
  };
  const left = Object.fromEntries(Object.entries(right).map(([k, v]) => [k, v.map(flip)])) as typeof right;
  return { right, left, flash: tint(right.idle[0], '#ffffff') };
}

/** Half-face scooter helmet, worn in Kaohsiung while riding (16 wide, sits on the head). */
export function helmet() {
  return sprite([
    '....kkkkkkk.....',
    '..kkrrrrrrrkk...',
    '.krrrwwrrrrrrk..',
    '.krrrrrrrrrrrk..',
    'kkkkkkkkkkkkkkk.',
  ], { k: '#2a1a14', r: '#e5484d', w: '#ffb3b5' });
}
