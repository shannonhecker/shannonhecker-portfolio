let context: AudioContext | null = null;

// Start Web Audio during the Play gesture, before the game and its art finish loading.
export function activateGameAudio() {
  try {
    context ??= new AudioContext();
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
    if (context.state !== 'running') void context.resume().catch(() => {});
  } catch { /* The game can still run when Web Audio is unavailable. */ }
  return context;
}
