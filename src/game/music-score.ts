// Original miniature scores. Pitch is MIDI; length is measured in eighth notes.
// Each scene has its own metre, phrasing, accompaniment and opening motif.
export type Phrase = [pitch: number, length: number][];
export type StageScore = {
 name: string; bpm: number; beatsPerBar: number; lead: OscillatorType;
 melody: Phrase; roots: number[]; bass: (number|null)[]; drums: string;
 swing?: number; gate: number; attack?: number; pad?: number[];
};
export const scores: StageScore[] = [
 {
  name:'Harbour morning',bpm:116,beatsPerBar:4,lead:'square',swing:.16,gate:.55,
  melody:[[74,2],[69,1],[71,1],[74,1],[0,1],[78,2],[76,3],[74,1],[71,2],[69,2],[66,1],[69,1],[74,2],[71,1],[69,1],[66,2],[64,3],[66,1],[62,2],[0,2]],
  roots:[38,43,35,33],bass:[0,null,null,7,null,null,12,7],drums:'k..hk.h.',
 },
 {
  name:'Campus sketchbook',bpm:102,beatsPerBar:3,lead:'triangle',gate:.88,
  melody:[[72,2],[76,1],[79,1],[76,2],[74,3],[77,1],[81,2],[79,2],[76,2],[72,2],[71,4],[0,2],[69,2],[72,1],[76,1],[79,2],[77,3],[74,1],[71,2],[67,2],[71,2],[74,2],[72,4],[0,2]],
  roots:[36,41,33,43],bass:[0,null,7,null,12,null],drums:'',
 },
 {
  name:'Pixel workshop',bpm:142,beatsPerBar:4,lead:'square',gate:.36,
  melody:[[64,1],[0,1],[76,1],[0,2],[71,1],[74,2],[79,1],[76,1],[0,1],[71,1],[67,2],[0,2],[69,1],[0,2],[72,1],[76,1],[74,1],[72,2],[66,1],[69,1],[0,1],[74,1],[71,2],[64,2]],
  roots:[40,36,45,35],bass:[0,null,12,null,7,null,12,7],drums:'kh.shkhh',
 },
 {
  name:'London rain',bpm:68,beatsPerBar:4,lead:'sine',gate:.96,attack:.06,pad:[0,7,10],
  melody:[[76,5],[0,1],[74,2],[72,4],[69,3],[0,1],[71,4],[74,2],[72,2],[67,6],[0,2],[69,3],[72,3],[76,2],[74,4],[72,2],[69,2],[68,4],[71,2],[68,2],[64,6],[0,2]],
  roots:[45,43,41,40],bass:[0,null,null,null,null,null,null,null],drums:'',
 },
 {
  name:'City ascent',bpm:118,beatsPerBar:4,lead:'triangle',gate:.72,
  melody:[[67,3],[71,1],[74,2],[79,2],[78,1],[79,1],[83,2],[81,2],[79,2],[76,3],[79,1],[84,2],[83,2],[81,2],[78,2],[74,2],[0,2],[71,2],[74,1],[79,1],[83,4],[84,2],[83,1],[81,1],[79,4],[76,2],[79,2],[72,2],[76,2],[74,6],[0,2]],
  roots:[43,40,36,38],bass:[0,null,7,null,12,null,7,null],drums:'k.h.s.h.',
 },
 {
  name:'Market pulse',bpm:150,beatsPerBar:4,lead:'sawtooth',gate:.3,
  melody:[[62,1],[74,1],[0,1],[69,1],[72,2],[69,1],[65,1],[64,1],[76,1],[0,1],[71,1],[74,1],[71,1],[67,2],[65,1],[77,1],[72,1],[0,1],[74,2],[72,1],[69,1],[61,1],[73,1],[69,1],[64,1],[61,2],[0,2]],
  roots:[38,40,41,33],bass:[0,12,0,12,0,12,7,12],drums:'khshkhsh',
 },
 {
  name:'New possibilities',bpm:94,beatsPerBar:4,lead:'sine',gate:.9,attack:.025,pad:[0,7,14],
  melody:[[78,3],[85,1],[82,2],[0,2],[80,2],[75,2],[78,3],[0,1],[82,3],[87,1],[85,2],[82,2],[78,4],[73,2],[0,2],[75,3],[82,1],[80,2],[0,2],[78,2],[73,2],[70,4],[73,2],[78,2],[82,2],[85,2],[78,6],[0,2]],
  roots:[42,44,46,37],bass:[0,null,null,null,7,null,null,null],drums:'..h...h.',
 },
 {
  name:'Storybook showdown',bpm:128,beatsPerBar:4,lead:'square',gate:.62,
  melody:[[69,2],[69,1],[81,1],[76,2],[72,2],[71,3],[74,1],[77,2],[76,2],[72,1],[76,1],[81,2],[83,1],[81,1],[79,2],[76,3],[74,1],[71,2],[0,2],[69,1],[72,1],[76,2],[81,2],[84,2],[83,1],[81,1],[77,2],[74,2],[71,2],[72,1],[76,1],[81,2],[76,1],[72,1],[69,2],[68,2],[71,2],[76,2],[68,2]],
  roots:[45,41,38,40],bass:[0,0,null,7,0,0,12,7],drums:'k.shkksh',
 },
 {
  name:'The scenic route',bpm:86,beatsPerBar:3,lead:'triangle',gate:.8,
  melody:[[62,2],[69,1],[66,1],[74,2],[71,3],[69,1],[67,2],[71,2],[74,2],[76,2],[74,3],[71,1],[62,2]],
  roots:[38,43,35,33],bass:[0,null,7,null,null,null],drums:'',
 },
];
export const melodySteps = scores.map(score => score.melody.flatMap(([pitch,length]) =>
 Array.from({length},(_,i) => i===0&&pitch ? {pitch,length} : null)));
