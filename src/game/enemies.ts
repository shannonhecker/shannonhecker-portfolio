// Small enemies, one kind per world, each a noun from that chapter of
// Shannon's story. Stomp from above to clear one; touching one from the side
// costs a hit. None of them is an employer, a client or a person: they are
// the everyday things a designer clears. Original sprites, 12×10 art px, two
// frames each (feet or wings alternate). Nothing borrowed from any game.
import { sprite, type Palette } from './pixel';
import type { LookId } from './looks';

export type Foe = {
  name: string; // what the status line calls one, singular
  frames: HTMLCanvasElement[];
  fly?: boolean; // hovers on a short beat instead of walking
  flee?: boolean; // flies off when stomped instead of flattening
};

const OUT = '#2a1a14';
// Two frames from one body: the last row alternates (feet or wing beat).
function walker(body: string[], feetA: string, feetB: string, pal: Palette) {
  return [sprite([...body, feetA], { k: OUT, ...pal }), sprite([...body, feetB], { k: OUT, ...pal })];
}

export const FOES: Record<LookId, () => Foe> = {
  // Kaohsiung summers: mosquitoes, hovering at head height.
  kaohsiung: () => ({
    name: 'mosquito', fly: true,
    frames: [
      sprite(['..ww....ww..', '.wwww..wwww.', '..wwwwwwww..', '....kkkk....', '...kgggkk...', 'kkkgegggk...', '...kgggggk..', '....kkkkk...', '...k.k.k....', '..k..k..k...'], { k: OUT, w: '#dbeef8', g: '#5a5048', e: '#e5484d' }),
      sprite(['............', '............', '.wwwwkkwwww.', 'wwwwkkkkwwww', '...kgggkk...', 'kkkgegggk...', '...kgggggk..', '....kkkkk...', '...k.k.k....', '..k..k..k...'], { k: OUT, w: '#dbeef8', g: '#5a5048', e: '#e5484d' }),
    ],
  }),
  // Ling Tung: deadline alarm clocks, bells and all.
  lingtung: () => ({
    name: 'deadline',
    frames: walker([
      '.kk......kk.', 'krrk.kk.krrk', '.kkkkrrkkkk.', '.krwwwwwwrk.', 'krwwwkwwwwrk', 'krwwwkwwwwrk', 'krwwwkkkwwrk', '.krwwwwwwrk.', '..kkkkkkkk..',
    ], '..kk....kk..', '...kk..kk...', { r: '#e5484d', w: '#ffffff' }),
  }),
  // Genuine C&C Inc.: software bugs.
  web: () => ({
    name: 'bug',
    frames: walker([
      '..k......k..', '...k....k...', '...kkkkkk...', '..kggggggk..', 'kkgegggegkkk', '..kggkkggk..', 'kkggggggggkk', '..kgggggggk.', '...kkkkkk...',
    ], '..k..k..k...', '...k..k..k..', { g: '#2fbf71', e: '#ffffff' }),
  }),
  // London: pigeons. Stomp one and it flaps off, unharmed.
  london: () => ({
    name: 'pigeon', flee: true,
    frames: walker([
      '.....kkk....', '....kgggk...', '....kgegko..', '...kpgggkoo.', '..kpppggk...', 'kkgggggggk..', 'kwggggggggk.', '.kkwwwgggk..', '...kkkkkk...',
    ], '....o..o....', '...o....o...', { g: '#8f98a8', e: '#f3a414', p: '#7c5aa6', w: '#c9d0da', o: '#e88a3a' }),
  }),
  // J.P. Morgan: meeting invites, a little calendar on legs.
  tower: () => ({
    name: 'meeting invite',
    frames: walker([
      '..k......k..', '.kkkkkkkkkk.', '.krrrrrrrrk.', '.kkkkkkkkkk.', '.kwwwwwwwwk.', '.kwkwwwwkwk.', '.kwwwwwwwwk.', '.kwwkkkkwwk.', '.kkkkkkkkkk.',
    ], '..kk....kk..', '...kk..kk...', { r: '#4a90d9', w: '#ffffff' }),
  }),
  // Barclays: late change requests, as sticky notes.
  desk: () => ({
    name: 'late change',
    frames: walker([
      '.kkkkkkkkk..', '.kyyyyyyyyk.', '.kyykyykyyk.', '.kyyyyyyyyk.', '.kyykkkkyyk.', '.kyyyyyyyyk.', '.kyyyyyyfk..', '.kyyyyyyk...', '.kkkkkkk....',
    ], '..kk...kk...', '...kk.kk....', { y: '#ffd84a', f: '#e0b42a' }),
  }),
  // Next: AI: hallucinations, a glitching blob. Stomp to verify.
  ai: () => ({
    name: 'hallucination',
    frames: [
      sprite(['....kkkk....', '..kkvvvvkk..', '.kvvvvvvvvk.', '.kvwkvvwkvk.', 'kvvvvvvvvvvk', 'kvvvlvvvlvvk', '.kkvvvvvvkk.', 'kvvkvvvvkvvk', '.k..kkkk..k.', '............'], { k: OUT, v: '#a78bfa', w: '#ffffff', l: '#5b4f86' }),
      sprite(['....kkkk....', '..kkvvvvkk..', '.kvvvvvvvvk.', 'kvwkvvwkvk..', '.kvvvvvvvvvk', 'kvvvvlvvvlvk', '.kkvvvvvvkk.', '.kvvkvvvvkvk', '..k.kkkk.k..', '............'], { k: OUT, v: '#a78bfa', w: '#ffffff', l: '#5b4f86' }),
    ],
  }),
  // Bedtime: glowing screens that want "five more minutes".
  bedtime: () => ({
    name: 'screen',
    frames: walker([
      '.kkkkkkkkkk.', '.kbbbbbbbbk.', '.kbwkbbwkbk.', '.kbbbbbbbbk.', '.kbbkkkkbbk.', '.kbbbbbbbbk.', '.kkkkkkkkkk.', '....kkkk....', '...k....k...',
    ], '..kk....kk..', '...kk..kk...', { b: '#7cc4e8', w: '#ffffff' }),
  }),
};
