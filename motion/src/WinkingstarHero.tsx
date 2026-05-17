import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  staticFile,
} from 'remotion';

// 16/7 aspect to match other portfolio case-study covers
export const WINKINGSTAR_HERO = {
  width: 1600,
  height: 700,
  fps: 30,
  durationInFrames: 300, // 10 seconds total
} as const;

const BG_LIGHT = '#F8F1E4'; // earthy.cream

// Each shot has its own per-image background so the iPhone frames sit on the
// right brand colour. The hero rotates through them with cross-fades.
const SHOTS = [
  { src: 'winkingstar-shot-splash.webp',   alt: 'Winking Star splash screen — smiling star with doodle decorations' },
  { src: 'winkingstar-shot-board.webp',    alt: 'Winking Star — sample family board with sibling cards and tab nav' },
  { src: 'winkingstar-shot-petpals.webp',  alt: 'Winking Star — pet pal celebrations and recent activity' },
];

const FRAMES_PER_SHOT = Math.floor(WINKINGSTAR_HERO.durationInFrames / SHOTS.length);
const FADE = 14; // ~0.45s cross-fade

export const WinkingstarHero: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: BG_LIGHT }}>
      {SHOTS.map((shot, i) => {
        const start = i * FRAMES_PER_SHOT;
        const end = start + FRAMES_PER_SHOT;

        // Fade in at the start of this shot's window, fade out at the end.
        const fadeIn = interpolate(
          frame,
          [start, start + FADE],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );
        const fadeOut = interpolate(
          frame,
          [end - FADE, end],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        // First shot: no fade-in (already visible from t=0).
        // Last shot: no fade-out (we loop, so the cut at end is fine).
        let opacity = fadeIn * fadeOut;
        if (i === 0) opacity = fadeOut;
        if (i === SHOTS.length - 1) opacity = fadeIn;

        // Gentle Ken Burns: 1.00 -> 1.05 across the shot's window.
        const zoom = interpolate(
          frame,
          [start, end],
          [1.0, 1.05],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        );

        return (
          <AbsoluteFill
            key={shot.src}
            style={{
              opacity,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 36,
            }}
          >
            <Img
              src={staticFile(shot.src)}
              alt={shot.alt}
              style={{
                height: '100%',
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                objectFit: 'contain',
                borderRadius: 14,
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
