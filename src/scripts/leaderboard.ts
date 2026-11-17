import type { GameState } from '../game/main';
import { track } from './analytics';
let attempt = 0;
let token: Promise<string | null> = Promise.resolve(null);
const post = async (path: string, body: unknown) => {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Try again shortly.');
  return data;
};
export function startScore(stage: number) {
  attempt++;
  track('level_start', { level_name: String(stage + 1), stage });
  // This receipt is functional game storage, separate from optional Analytics.
  token = post('/api/game-run', { stage }).then(data => data.token as string).catch(() => null);
}
export async function endScore(state: GameState, end: HTMLElement) {
  const current = attempt;
  track('level_end', { level_name: String(state.level + 1), stage: state.level, success: true, collected: state.collected, hits: state.hits, active_seconds: Math.round(state.elapsed / 1000) });
  const section = end.querySelector<HTMLElement>('.scoreboard')!;
  const form = section.querySelector<HTMLFormElement>('form')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const status = section.querySelector<HTMLElement>('[role="status"]')!;
  const list = section.querySelector<HTMLOListElement>('ol')!;
  const score = Math.max(100, 100 + state.collected * 25 - state.hits * 10);
  section.querySelector<HTMLElement>('[data-score]')!.textContent = String(score);
  input.value = ''; button.disabled = true; button.textContent = 'Share my score';
  status.textContent = ''; list.replaceChildren();
  async function refresh() {
    try {
      const response = await fetch(`/api/leaderboard?stage=${state.level}`, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (current !== attempt) return;
      list.replaceChildren();
      for (const entry of data.entries) {
        const item = document.createElement('li');
        const name = document.createElement('span'); name.textContent = entry.nickname;
        const points = document.createElement('strong'); points.textContent = `${entry.score} pts`;
        item.append(name, points); list.append(item);
      }
      if (!data.entries.length) { const item = document.createElement('li'); item.textContent = 'A fresh trail. Share the first score.'; list.append(item); }
    } catch { if (current === attempt) list.textContent = 'The scoreboard is resting. Your game still counts.'; }
  }
  void refresh();
  const run = await token;
  if (current !== attempt) return;
  if (!run) { button.disabled = true; status.textContent = 'Online scores are unavailable for this run. You can keep exploring.'; return; }
  button.disabled = false;
  form.onsubmit = async event => {
    event.preventDefault();
    if (current !== attempt || button.disabled) return;
    button.disabled = true; status.textContent = 'Saving your score…';
    try {
      const result = await post('/api/leaderboard', { token: run, nickname: input.value, collected: state.collected, hits: state.hits, elapsed: Math.round(state.elapsed) });
      if (current !== attempt) return;
      button.textContent = 'Score shared'; status.textContent = 'Your score is shared. Thanks for playing!';
      track('post_score', { score: result.score, level: state.level + 1 });
      void refresh();
    } catch (error) {
      if (current !== attempt) return;
      button.disabled = false; status.textContent = error instanceof Error ? error.message : 'Please try again.';
    }
  };
}
