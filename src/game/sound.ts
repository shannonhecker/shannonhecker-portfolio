import {scores as tracks, melodySteps} from './music-score';
// Original synthesised sounds (no samples, no borrowed tunes). Off by default;
// the page's Sound toggle switches it on. One shared AudioContext, created on
// the first user gesture as browsers require.
let ac: AudioContext | null = null;
export let soundOn = false;
const effects=new Set<OscillatorNode>();
let deaths=0;
function stopEffects(){effects.forEach(voice=>{try{voice.stop();}catch{}});effects.clear();}
// iPhone Safari only starts audio inside a tap, and the first setSound() often
// runs just after one (the game module loads asynchronously). Any later tap or
// key press finishes the job, so sound never stays silently suspended.
function unlock() { if (soundOn && ac && ac.state !== 'running') void ac.resume(); }
if (typeof window !== 'undefined') for (const type of ['pointerdown', 'touchend', 'keydown'] as const) window.addEventListener(type, unlock, { capture: true, passive: true });
export function setSound(v: boolean) {
  soundOn = v;
  if (v && !ac) ac = new AudioContext();
  // Without this, an iPhone with its ringer switch on silent mutes Web Audio.
  if (v) { try { const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession; if (session) session.type = 'playback'; } catch {} }
  if (v) void ac?.resume();
  if(!v)stopEffects();
  syncMusic();
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, at = 0) {
  if (!soundOn || !ac) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  effects.add(o);o.onended=()=>{effects.delete(o);o.disconnect();g.disconnect();};
  o.start(t);
  o.stop(t + dur + 0.02);
}

// A rising fifth for the jump, a two-note "tick" for a collectible (a nod to
// Winking Star's star landing), a soft drop for a hit, and a short
// four-note phrase in D major for the finish.
export const sfx = {
  cast: () => tone(880,.16,'triangle',.055,1760),
  jump: () => tone(392, 0.12, 'square', 0.05, 587),
  collect: () => { tone(1175, 0.06, 'triangle', 0.07); tone(1568, 0.09, 'triangle', 0.07, undefined, 0.06); },
  power: () => [659,880,988,1319].forEach((f,i)=>tone(f,.15,'square',.045,undefined,i*.07)),
  stomp: () => tone(523, 0.1, 'square', 0.05, 196),
  hit: () => tone(220, 0.22, 'sawtooth', 0.05, 110),
  death: () => {
    deaths++;stopMusic();quietUntil=(ac?.currentTime??0)+1.05;
    [659,523,392,196].forEach((frequency,index)=>tone(frequency,index===3?.38:.14,'square',.045,index===3?98:undefined,index*.16));
    syncMusic();
  },
  finish: () => [587, 740, 880, 1175].forEach((f, i) => tone(f, i === 3 ? 0.36 : 0.12, 'square', 0.05, undefined, i * 0.11)),
};

// Original stage themes: distinct melodies, tempos, bass progressions and timbres.
// No recorded samples or borrowed game tunes.
let trackIndex=8,musicAllowed=false,power=false,timer:ReturnType<typeof setInterval>|undefined;
let nextNote=0,beat=0,quietUntil=0;
const voices=new Set<OscillatorNode>();
function musicNote(midi:number,when:number,duration:number,volume:number,type:OscillatorType,attack=.008,slideTo?:number){
 if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(440*2**((midi-69)/12),when);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,when+duration);
 g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(volume,when+Math.min(attack,duration/2));g.gain.exponentialRampToValueAtTime(.0001,when+duration);
 o.connect(g).connect(ac.destination);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect();};o.start(when);o.stop(when+duration+.02);
}
function stopMusic(){if(timer)clearInterval(timer);timer=undefined;voices.forEach(v=>{try{v.stop();}catch{}});voices.clear();}
function syncMusic(){
 if(!soundOn||!musicAllowed||document.hidden||!ac){stopMusic();return;}
 if(timer)return;nextNote=Math.max(ac.currentTime,quietUntil);const schedule=()=>{
  if(!ac)return;const track=tracks[trackIndex];
  while(nextNote<ac.currentTime+.18){
   const step=60/(power?Math.max(152,track.bpm*1.2):track.bpm)/2;
   const phrase=melodySteps[trackIndex],note=phrase[beat%phrase.length];
   if(note)musicNote(note.pitch+(power?12:0),nextNote,step*note.length*track.gate,track.lead==='sawtooth'?.012:.022,track.lead,track.attack);
   const bar=track.beatsPerBar*2,root=track.roots[Math.floor(beat/bar)%track.roots.length];
   const bass=track.bass[beat%track.bass.length];
   if(bass!==null)musicNote(root+bass,nextNote,step*(track.pad?3:1.2),.032,'triangle');
   if(track.pad&&beat%bar===0)track.pad.forEach(interval=>musicNote(root+12+interval,nextNote,step*(bar-.2),.005,'sine',.12));
   const drum=track.drums[beat%track.drums.length];
   if(drum==='k')musicNote(43,nextNote,.12,.042,'sine',.004,38);
   else if(drum==='s')musicNote(68,nextNote,.065,.013,'triangle',.003,100);
   else if(drum==='h')musicNote(100,nextNote,.024,.006,'square',.002);
   beat++;nextNote+=step*(1+(track.swing??0)*(beat%2===1?1:-1));
  }
 };schedule();timer=setInterval(schedule,90);
}
export function setMusicStage(stage:number|null){const index=stage===null?8:Math.max(0,Math.min(7,stage));if(index===trackIndex)return;trackIndex=index;beat=0;stopMusic();syncMusic();}
export function setMusicPlaying(on:boolean){musicAllowed=on;if(!on)stopEffects();syncMusic();}
export function setPowerMusic(on:boolean){power=on;}
export function audioState(){return {enabled:soundOn,playing:!!timer,power,voices:voices.size,effects:effects.size,track:tracks[trackIndex].name,stage:trackIndex===8?null:trackIndex,bpm:tracks[trackIndex].bpm,deaths};}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEffects();syncMusic();});
