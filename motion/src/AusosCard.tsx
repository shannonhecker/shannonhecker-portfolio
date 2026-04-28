import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  subsets: ["latin"],
  weights: ["500"],
});

export const AUSOS_CARD = {
  width: 1280,
  height: 720,
  fps: 30,
  durationInFrames: 90,
} as const;

const BG_DEEP = "#0b0e1a";
const BG_SOFT = "#13182a";
const ACCENT_A = "#b490f5";
const ACCENT_B = "#5ee7df";
const FG = "#ffffff";

const MARK_RATIO = 216 / 356;

const AusosMark: React.FC<{ width: number; fill?: string }> = ({
  width,
  fill = FG,
}) => (
  <svg
    width={width}
    height={width * MARK_RATIO}
    viewBox="26 96 356 216"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M107.705 148.072C123.184 148.072 136.998 151.701 149.146 158.961C161.49 166.024 171.188 175.737 178.242 188.097C185.492 200.458 189.215 214.487 189.411 230.183V299.345C189.411 302.68 188.333 305.427 186.178 307.585C184.023 309.547 181.279 310.528 177.948 310.528C174.618 310.528 171.875 309.547 169.72 307.585C167.564 305.427 166.487 302.68 166.487 299.345V281.451C160.475 289.898 152.834 296.844 143.561 302.288C132.393 308.762 119.657 312 105.354 312C90.267 312 76.7471 308.468 64.7951 301.404C52.8431 294.145 43.34 284.335 36.2864 271.974C29.4288 259.613 26 245.683 26 230.183C26 214.487 29.5266 200.458 36.5802 188.097C43.8299 175.737 53.6273 166.024 65.9713 158.961C78.3152 151.701 92.2266 148.072 107.705 148.072Z"
      fill={fill}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M300.295 147.864C315.969 147.864 329.881 151.4 342.029 158.472C354.373 165.544 364.072 175.269 371.126 187.645C378.18 200.022 381.804 214.167 382 230.079C382 245.795 378.375 259.841 371.126 272.218C364.072 284.594 354.373 294.319 342.029 301.391C329.881 308.463 315.969 312 300.295 312C284.62 312 270.611 308.463 258.267 301.391C245.923 294.319 236.223 284.594 229.169 272.218C222.116 259.841 218.589 245.795 218.589 230.079C218.589 214.167 222.116 200.022 229.169 187.645C236.223 175.269 245.923 165.544 258.267 158.472C270.61 151.4 284.62 147.864 300.295 147.864Z"
      fill={fill}
    />
    <path
      d="M326.673 96C329.808 96 332.454 96.9829 334.609 98.9475C336.96 100.912 338.136 103.466 338.136 106.609C338.136 109.949 336.96 112.601 334.609 114.565C332.454 116.333 329.808 117.217 326.673 117.217H273.622C270.487 117.217 267.744 116.333 265.392 114.565C263.237 112.601 262.159 109.949 262.159 106.609C262.159 103.466 263.237 100.912 265.392 98.9475C267.744 96.9829 270.487 96 273.622 96H326.673Z"
      fill={fill}
    />
  </svg>
);

const LETTERS = ["a", "u", "s", "o", "s"] as const;

export const AusosCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const markW = 200;
  const markH = markW * MARK_RATIO;
  const wordFont = 150;
  const wordW = 410;
  const gap = 28;
  const lockupW = markW + gap + wordW;

  const markIn = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 120 },
    durationInFrames: 22,
  });
  const markScale = interpolate(markIn, [0, 1], [0.55, 1]);
  const markOpacity = markIn;

  const settleEase = (t: number) =>
    t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lockupT = settleEase(
    interpolate(frame, [30, 52], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const markOffsetWithinGroup = interpolate(
    lockupT,
    [0, 1],
    [(lockupW - markW) / 2, 0],
  );

  const accentMix = interpolate(frame, [30, 42, 54], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const breath =
    frame > 78
      ? 1 + Math.sin(((frame - 78) / fps) * Math.PI * 2) * 0.006
      : 1;

  const loopFade = interpolate(frame, [86, 89], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const groupX = (W - lockupW) / 2;
  const groupY = (H - markH) / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_DEEP,
        backgroundImage: `radial-gradient(ellipse 60% 55% at 50% 52%, ${BG_SOFT} 0%, ${BG_DEEP} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: accentMix * 0.35,
          background: `radial-gradient(ellipse 36% 28% at 50% 52%, ${ACCENT_A}55 0%, transparent 60%), radial-gradient(ellipse 28% 22% at 50% 52%, ${ACCENT_B}33 0%, transparent 70%)`,
          mixBlendMode: "screen",
          filter: "blur(8px)",
        }}
      />

      <AbsoluteFill style={{ opacity: loopFade }}>
        <div
          style={{
            position: "absolute",
            left: groupX,
            top: groupY,
            width: lockupW,
            height: markH,
            transform: `scale(${breath})`,
            transformOrigin: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: markOffsetWithinGroup,
              top: (markH - markH * markScale) / 2,
              width: markW * markScale,
              height: markH * markScale,
              opacity: markOpacity,
              filter: `drop-shadow(0 0 ${accentMix * 18}px ${ACCENT_A}aa)`,
            }}
          >
            <AusosMark width={markW * markScale} />
          </div>

          <div
            style={{
              position: "absolute",
              left: markW + gap,
              top: 0,
              height: markH,
              display: "flex",
              alignItems: "center",
              fontFamily,
              fontSize: wordFont,
              fontWeight: 500,
              color: FG,
              letterSpacing: -2,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {LETTERS.map((char, i) => {
              const start = 50 + i * 5;
              const end = start + 14;
              const lt = interpolate(frame, [start, end], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const eased = settleEase(lt);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: eased,
                    transform: `translateY(${(1 - eased) * 18}px)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
