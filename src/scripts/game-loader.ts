import { startScore, endScore } from './leaderboard';
import { track } from './analytics';
// Loads the game chunk only when someone presses Play. If the chunk fails,
// the poster stays and the rest of the page is untouched. Pressing Play opens
// the world map; a case page's "Play this case as a level" link (?level=n)
// starts that world directly. Between worlds a card states the facts and
// links to the case.
const root = document.querySelector<HTMLElement>('.play .game');
const canvas = document.getElementById('game') as HTMLCanvasElement | null;
const play = document.getElementById('game-play') as HTMLButtonElement | null;
const statusEl = document.getElementById('game-status');
const mapButton = document.getElementById('game-world');
const stageNav = document.querySelector<HTMLElement>('.game-stages');
const stageButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-stage]'));
function syncStage(n:number){
  const cast=document.querySelector<HTMLButtonElement>('[data-k=cast]');if(cast)cast.hidden=n!==7;
  stageButtons.forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.stage)===n)));
  mapButton?.setAttribute('data-stage',String(n));
}
const ends = Array.from(document.querySelectorAll<HTMLElement>('.game-end'));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

type Game = ReturnType<typeof import('../game/main').start>;
let game: Game | null = null;
let musicControl: ((on:boolean)=>void) | undefined;
let bootSequence = 0;
let soundOn = false;
const flight=document.querySelector<HTMLElement>('.game-flight');
let cancelFlight:(()=>void)|undefined;
function flyToUK(){
 if(!flight||reduceMotion)return Promise.resolve();
 game?.pause();musicControl?.(false);flight.hidden=false;
 flight.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
 return new Promise<void>(resolve=>{const finish=()=>{clearTimeout(timer);flight.hidden=true;cancelFlight=undefined;resolve();};const timer=setTimeout(finish,2400);cancelFlight=finish;});
}
flight?.querySelector('button')?.addEventListener('click',()=>cancelFlight?.());
function syncCompleted(){
 const done=game?.state().done??[];
 const cast=document.querySelector<HTMLButtonElement>('[data-k=cast]');if(cast)cast.hidden=game?.state().mode!=='level'||game?.state().level!==7;
 if(stageNav&&game)stageNav.hidden=game.state().mode!=='map';
 stageButtons.forEach(button=>{const n=Number(button.dataset.stage),complete=done.includes(n),locked=n===7&&!Array.from({length:7},(_,i)=>i).every(i=>done.includes(i));button.dataset.completed=String(complete);button.dataset.locked=String(locked);button.disabled=locked;button.setAttribute('aria-label',`${button.textContent?.trim()}${locked?', locked: complete all seven earlier stages':complete?', completed':''}`);});
}
const param = new URLSearchParams(location.search).get('level');
const fromCase = param !== null;
let chosen = Math.max(0, Math.min(ends.length - 1, (Number(param ?? '1') || 1) - 1));
syncStage(chosen);

type Mission = { text: string; have: number; need: number; done: boolean };
function showEnd(n: number | null, shipped = false, mission?: Mission) {
  if (root) root.dataset.result = String(n !== null);
  ends.forEach((e, i) => {
    e.hidden = i !== n;
    const badge = e.querySelector<HTMLElement>('.game-badge');
    if (badge) badge.hidden = !(i === n && shipped);
    const m = e.querySelector<HTMLElement>('.game-mission');
    if (m && i === n && mission) {
      m.hidden = false;
      m.dataset.done = String(mission.done);
      m.textContent = mission.done ? `★ Mission complete: ${mission.text}.` : `Mission: ${mission.text}. ${mission.need > 1 ? `${mission.have} of ${mission.need} this time.` : 'Not this time.'}`;
    }
  });
  if (n !== null) ends[n]?.querySelector<HTMLElement>('[data-next]')?.focus();
}

async function boot(level: number, toMap: boolean) {
  if (!root || !canvas) return;
  const crossingToUK=!toMap&&level===3&&game?.state().level===2&&game.state().finished;
  const sequence = ++bootSequence;
  cancelFlight?.();
  if (play) play.disabled = true;
  if (!game) {
    root.dataset.state = 'loading';
    root.setAttribute('aria-busy','true');
    if (statusEl) statusEl.textContent = 'Preparing your adventure…';
  }
  try {
    const mod = await import('../game/main');
    musicControl=mod.setMusicPlaying;
    setGameSound=mod.setSound;
    if (statusEl) statusEl.textContent = 'Preparing your adventure…';
    await mod.prepareArt();
    if (sequence !== bootSequence) return;
    showEnd(null);
    if(crossingToUK){await flyToUK();if(sequence!==bootSequence)return;}
    if(stageNav)stageNav.hidden=!toMap;
    canvas.tabIndex = 0;
    chosen = level;
    syncStage(level);
    if (game) (toMap ? game.showMap(level) : game.loadLevel(level));
    else {
      game = mod.start(canvas, {
        level,
        startOnMap: toMap,
        reduceMotion,
        onStatus: (m) => { if (statusEl) statusEl.textContent = m; },
        onLevelStart: (n) => { if(stageNav)stageNav.hidden=true; syncStage(n); showEnd(null); startScore(n); },
        onLevelEnd: (s) => { showEnd(s.level, s.collected >= s.total, s.mission); syncCompleted();void endScore(s, ends[s.level]); },
        onMapSelect: (n) => { chosen = n; syncStage(n); },
      });
      (window as unknown as { __game?: () => unknown }).__game = () => game?.state();
    }
    mod.setSound(soundOn);
    syncCompleted();
    // Keep the fullscreen resize and first canvas paint behind the loading scene.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    if (sequence !== bootSequence) return;
    root.dataset.state = 'playing';
  } catch {
    root.dataset.state = 'poster';
    if(statusEl)statusEl.textContent='The adventure could not load. Please try again.';
  } finally {
    if(sequence === bootSequence){root.removeAttribute('aria-busy');if(play)play.disabled=false;}
  }
}
// ---- full screen: Play opens it; Escape or the Exit button always leaves.
// Real full screen where the browser allows it; a fixed overlay otherwise.
const box = document.querySelector<HTMLElement>('.play');
const exitBtn = document.getElementById('game-exit') as HTMLButtonElement | null;
const fullBtn = document.getElementById('game-full') as HTMLButtonElement | null;
let full = false;
let fullscreenChanges=0;
let fullscreenQueue=Promise.resolve();
function changeNativeFullscreen(action:()=>Promise<void>){
  fullscreenChanges++;
  fullscreenQueue=fullscreenQueue.then(action).catch(()=>{}).finally(()=>{fullscreenChanges--;});
}
// The look of full screen, kept apart from its state so the look can outlast
// the state while the browser animates out of native full screen.
function showFull(on: boolean) {
  box?.classList.toggle('is-full', on);
  document.documentElement.classList.toggle('game-is-full', on);
  if (exitBtn) exitBtn.hidden = !on;
  if (!on) box?.scrollIntoView({ block: 'center' });
}
function setFull(on: boolean, deferLook = false) {
  if(!on&&cancelFlight){++bootSequence;cancelFlight();if(play)play.disabled=false;const current=game?.state();if(current?.finished)showEnd(current.level,current.collected>=current.total,current.mission);}
  full = on;
  if (!deferLook) showFull(on);
  window.dispatchEvent(new Event('portfolio-game-mode'));
  if (on) { canvas?.focus({ preventScroll: true }); game?.resume(); musicControl?.(true); }
  else { musicControl?.(false); if ((game?.state() as { mode?: string } | undefined)?.mode === 'level') game?.pause(); }
}
function enterFull() {
  if (!box || full) return;
  setFull(true);
  // must run inside the click that asked for it; a refusal keeps the overlay
  if (document.fullscreenEnabled) changeNativeFullscreen(async()=>{if(!document.fullscreenElement && full) await box.requestFullscreen?.();});
}
function exitFull() {
  if (!full) return;
  track('game_exit', { stage: game?.state().level ?? chosen });
  // Stop the game at once, but keep the full-screen look until the browser has
  // finished leaving native full screen. Dropping the look first makes macOS
  // animate a box that has already snapped back to its in-page style: a flash.
  const native = !!document.fullscreenElement;
  setFull(false, native);
  play?.focus({ preventScroll: true });
  if (native) changeNativeFullscreen(async()=>{ try { if(document.fullscreenElement) await document.exitFullscreen(); } finally { if(!full) showFull(false); } });
}
// the browser's own Escape (or its exit gesture) leaves real full screen
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && full && fullscreenChanges===0) setFull(false); });
// in the overlay, Escape leaves too (capture phase: before the game's own pause key)
window.addEventListener('keydown', (e) => { if (full && e.key === 'Escape' && !timeline?.open) { e.preventDefault(); e.stopPropagation(); exitFull(); } }, true);
exitBtn?.addEventListener('click', exitFull);
fullBtn?.addEventListener('click', () => { enterFull(); if (!game) boot(chosen, !fromCase); });

play?.addEventListener('click', () => { track('game_start'); enterFull(); boot(chosen, !fromCase); });
mapButton?.addEventListener('click',()=>{enterFull();void boot(chosen,true);});
stageButtons.forEach(button=>button.addEventListener('click',()=>{enterFull();void boot(Number(button.dataset.stage),false);}));
document.querySelectorAll<HTMLButtonElement>('.game-end [data-next]').forEach((b) =>
  b.addEventListener('click', () => boot(Number(b.dataset.next), false)),
);
document.querySelectorAll<HTMLButtonElement>('.game-end [data-map]').forEach((b) =>
  b.addEventListener('click', () => boot(Math.min(ends.length - 1, chosen + 1), true)),
);

// Sound: off by default, one toggle (brief).
const soundBtn = document.getElementById('game-sound') as HTMLButtonElement | null;
let setGameSound: ((on: boolean) => void) | undefined;
soundBtn?.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  // Called straight from the tap, with no await in between, so iPhone Safari
  // lets the audio start.
  if (game && setGameSound) { setGameSound(soundOn); canvas?.focus(); }
  else if (game) void import('../game/main').then(m => { m.setSound(soundOn); canvas?.focus(); });
});

// The story journal pauses the action and soundtrack. It lives inside the
// fullscreen element, so it stays available in native fullscreen too.
const timeline=document.querySelector<HTMLDialogElement>('#game-timeline');
const timelineOpen=document.querySelector<HTMLButtonElement>('#game-timeline-open');
let resumeAfterTimeline=false;
timelineOpen?.addEventListener('click',()=>{
  resumeAfterTimeline=!!game&&!game.state().paused&&full;
  timeline?.showModal();game?.pause();musicControl?.(false);
  window.dispatchEvent(new Event('portfolio-game-mode'));
});
timeline?.querySelector('button')?.addEventListener('click',()=>timeline.close());
timeline?.addEventListener('click',e=>{if(e.target!==timeline)return;const r=timeline.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)timeline.close();});
timeline?.addEventListener('close',()=>{if(resumeAfterTimeline&&full){game?.resume();canvas?.focus({preventScroll:true});musicControl?.(true);}else timelineOpen?.focus({preventScroll:true});});
timeline?.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=Array.from(timeline.querySelectorAll<HTMLElement>('button,a[href]'));const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});

// Touch: movement, jump and a contextual wand button, pointer-driven so multi-touch works.
document.querySelectorAll<HTMLButtonElement>('.game-touch button').forEach((b) => {
  const k = b.dataset.k as 'left' | 'right' | 'jump' | 'cast';
  // keep focus on the canvas, so a tap never reads as leaving the game
  const set = (v: boolean) => (e: Event) => {
    e.preventDefault();
    if (game) game.touch[k] = v;
    if (v) {
      canvas?.focus({ preventScroll: true });
      game?.resume();
    }
  };
  b.addEventListener('mousedown', (e) => e.preventDefault());
  b.addEventListener('pointerdown', set(true));
  b.addEventListener('pointerup', set(false));
  b.addEventListener('pointercancel', set(false));
  b.addEventListener('pointerleave', set(false));
});

// Decorative title motion runs only while its scene is actually being viewed.
const poster = document.querySelector<HTMLElement>('.game-poster');
if (poster) {
  let visible = false;
  const syncTitle = () => { poster.dataset.visible = String(visible && !document.hidden); };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncTitle(); }).observe(poster);
  document.addEventListener('visibilitychange', syncTitle);
}
// The title screen becomes actionable only after its handlers are attached.
if (play) play.disabled = false;

export {};
