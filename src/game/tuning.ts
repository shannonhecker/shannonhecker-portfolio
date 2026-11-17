// Movement tuning. Values come from the research report's table (SMB1 frame
// data, Celeste's open Player.cs), doubled because this canvas is 960×540 with
// 32px tiles where the references assume 16px tiles. The jump is designed as a
// height and a time-to-apex; gravity and launch speed are derived from them,
// so tuning is a design decision rather than a guess at constants.

export const TILE = 32;
export const VIEW_W = 960;
export const VIEW_H = 540;

const JUMP_HEIGHT = 4.2 * TILE; // a little over 4 tiles, so 4-tile steps are comfortable
const TIME_TO_APEX = 0.37; // seconds

export const T = {
  walkSpeed: 240, // px/s
  runSpeed: 300, // reached after holding a direction for runAfter seconds (no run button)
  runAfter: 0.6,
  accel: 2200, // px/s²
  turnAccel: 4400, // reversing brakes twice as hard
  friction: 1400, // release slide
  airMult: 0.65,

  gravity: (2 * JUMP_HEIGHT) / TIME_TO_APEX ** 2,
  jumpSpeed: (2 * JUMP_HEIGHT) / TIME_TO_APEX,
  fallMult: 2.2, // released or falling
  maxFall: 480,
  speedJumpBonus: 0.12, // extra launch at full run speed
  apexHangVy: 80, // half gravity near the top while jump is held
  apexHangMult: 0.5,

  coyote: 0.12, // s, generous for a non-gamer panel
  buffer: 0.12, // s
  cornerCorrect: 8, // px

  hitKnockX: 260,
  hitKnockY: 380,
  invuln: 1.0, // s
  maxHits: 3,
} as const;
