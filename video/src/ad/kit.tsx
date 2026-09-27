/**
 * kit.tsx — the promo's motion vocabulary.
 *
 * Built for a 1080x1920 Meta placement, so every piece here is sized in real
 * pixels for that canvas. Colour and type come from ../theme.ts only: red is the
 * one hot accent, amber is numerals only, bone is never pure white.
 *
 * META SAFE ZONE (Reels, 2026): key content lives inside x 72–1008, y 270–1240.
 * The top ~14% carries the account name and "Sponsored"; the bottom ~35% carries
 * the caption and the CTA button. Decorative things (a phone's lower half, the
 * lamp, the grain) may run under the UI; words and the thing being shown may not.
 * `SafeZone` draws that box for precheck stills.
 */

import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { EASE } from "../anim";

export const W = 1080;
export const H = 1920;
export const SAFE = { left: 72, right: 1008, top: 270, bottom: 1240 } as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 on the house ease between two absolute frames. */
export const prog = (frame: number, from: number, dur: number, easing = EASE) =>
  interpolate(frame, [from, from + dur], [0, 1], { ...clamp, easing });

/** A decaying impact: 1 at `hit`, falling off exponentially. 0 before it. */
export const impact = (frame: number, hit: number, tau = 4) =>
  frame < hit ? 0 : Math.exp(-(frame - hit) / tau);

// ------------------------------------------------------------------ stage ---

/**
 * The room every shot is in: ink, a lamp pool that breathes and flickers, the
 * deck's halftone, then (above the content) film grain and a vignette.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  frame: number;
  lamp?: "amber" | "red" | "both" | "none";
  lampY?: number;
  safeZone?: boolean;
}> = ({ children, frame, lamp = "amber", lampY = 520, safeZone = false }) => {
  // A lamp that is never quite still: slow breath + an occasional 2-frame dip.
  const breath = 0.9 + 0.1 * Math.sin(frame / 11);
  const dip = random(`flick-${Math.floor(frame / 2)}`) > 0.93 ? 0.78 : 1;
  const lampOp = breath * dip;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      {lamp === "amber" || lamp === "both" ? (
        <div
          style={{
            position: "absolute",
            left: -520,
            top: lampY - 1000,
            width: 2000,
            height: 2000,
            opacity: lampOp,
            background:
              "radial-gradient(circle, rgba(216,163,60,.16), rgba(216,163,60,.05) 38%, transparent 64%)",
          }}
        />
      ) : null}
      {lamp === "red" || lamp === "both" ? (
        <div
          style={{
            position: "absolute",
            left: -460,
            top: lampY - 900,
            width: 2000,
            height: 1800,
            opacity: lampOp,
            background: "radial-gradient(ellipse, rgba(224,49,39,.20), rgba(224,49,39,.05) 40%, transparent 66%)",
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: 0.4,
          backgroundImage: "radial-gradient(circle, rgba(237,231,218,.10) 1px, transparent 1.5px)",
          backgroundSize: "16px 16px",
        }}
      />

      {children}

      <Grain frame={frame} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 380px 120px rgba(0,0,0,.82)", pointerEvents: "none" }} />
      {safeZone ? <SafeZone /> : null}
    </AbsoluteFill>
  );
};

/**
 * Film grain — one noise tile, re-offset every frame from a seeded random, so
 * it crawls like stock but costs one background paint rather than a filter
 * per frame.
 */
const GRAIN_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.93 0 0 0 0 0.9 0 0 0 0 0.85 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)'/%3E%3C/svg%3E")`;

const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity: 0.075,
      backgroundImage: GRAIN_TILE,
      backgroundSize: "260px 260px",
      backgroundPosition: `${Math.round(random(`gx${frame}`) * 260)}px ${Math.round(random(`gy${frame}`) * 260)}px`,
    }}
  />
);

const SafeZone: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.top, background: "rgba(0,160,255,.18)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: "rgba(0,160,255,.18)" }} />
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top,
        width: SAFE.right - SAFE.left,
        height: SAFE.bottom - SAFE.top,
        outline: "3px dashed rgba(0,200,255,.9)",
      }}
    />
  </AbsoluteFill>
);

// ----------------------------------------------------------------- camera ---

/**
 * Camera — a slow push across the shot, plus a scale kick on every hit.
 * Everything inside moves as one plate, which is what sells it as a lens and
 * not a CSS transition.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  frame: number;
  from: number;
  to: number;
  push?: number;
  drift?: number;
  hits?: number[];
  kick?: number;
  origin?: string;
}> = ({ children, frame, from, to, push = 0.045, drift = 0, hits = [], kick = 0.035, origin = "50% 45%" }) => {
  const p = interpolate(frame, [from, to], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const k = hits.reduce((acc, h) => acc + impact(frame, h, 3.5), 0);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: origin,
        scale: `${(1 + push * p + kick * Math.min(1.5, k)).toFixed(5)}`,
        translate: `${(drift * p).toFixed(2)}px 0px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * WhipIn — the montage's cut: the incoming shot arrives already moving, with a
 * few frames of horizontal motion blur, so a hard cut reads as a pan.
 */
export const WhipIn: React.FC<{ children: React.ReactNode; frame: number; at: number; dir?: 1 | -1 }> = ({
  children,
  frame,
  at,
  dir = 1,
}) => {
  const p = prog(frame, at, 9, Easing.bezier(0.1, 0.9, 0.2, 1));
  return (
    <AbsoluteFill
      style={{
        translate: `${(dir * 140 * (1 - p)).toFixed(2)}px 0px`,
        filter: p < 0.98 ? `blur(${(10 * (1 - p)).toFixed(2)}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- type ---

export const disp = (size: number, color: string = C.bone, weight: 700 | 800 = 800): React.CSSProperties => ({
  fontFamily: F.disp,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 0.86,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  color,
});

export const mono = (size: number, color: string = C.dim, tracking = 0.24): React.CSSProperties => ({
  fontFamily: F.mono,
  fontWeight: 500,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  textTransform: "uppercase",
  color,
});

/**
 * MaskLine — the headline reveal: the line rises out of its own baseline
 * behind a clip, then (optionally) leaves upward through the top. Clipped with
 * `clip-path` rather than `overflow` so the inset can be padded for descenders
 * and the red full stop without re-flowing the stack.
 */
export const MaskLine: React.FC<{
  children: React.ReactNode;
  frame: number;
  at: number;
  out?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ children, frame, at, out, dur = 9, style }) => {
  const pin = prog(frame, at, dur, Easing.bezier(0.16, 1, 0.3, 1));
  const pout = out === undefined ? 0 : prog(frame, out, 6, Easing.bezier(0.5, 0, 0.75, 0));
  // 125%, not 100%: the clip is padded for descenders, so a line parked at
  // 100% would show a sliver of its cap-height through the padding.
  const y = (1 - pin) * 125 - pout * 125;
  return (
    <div style={{ clipPath: "inset(-12% -4% -10% -4%)", ...style }}>
      <div style={{ translate: `0px ${y.toFixed(3)}%`, willChange: "translate" }}>{children}</div>
    </div>
  );
};

/**
 * Redact — a solid red bar that SLAMS on over its text, then retreats to the
 * right so the words read left-to-right as they surface. The brand's device.
 */
export const Redact: React.FC<{
  children: React.ReactNode;
  frame: number;
  on?: number;
  open: number;
  dur?: number;
  color?: string;
  pad?: string;
  style?: React.CSSProperties;
}> = ({ children, frame, on, open, dur = 10, color = C.red, pad = "-2% -3%", style }) => {
  const slam = on === undefined ? 1 : prog(frame, on, 4, Easing.bezier(0.2, 0.9, 0.2, 1));
  const lift = prog(frame, open, dur, Easing.bezier(0.65, 0, 0.35, 1));
  const covering = frame < open || lift < 1;
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ opacity: frame < open ? 0 : 1 }}>{children}</span>
      {covering ? (
        <span
          style={{
            position: "absolute",
            inset: pad,
            background: color,
            transformOrigin: frame < open ? "left center" : "right center",
            scale: `${(frame < open ? slam : 1 - lift).toFixed(4)} 1`,
          }}
        />
      ) : null}
    </span>
  );
};

/**
 * Scramble — a code that resolves out of noise one letter at a time, left to
 * right. Seeded per frame, so every render is identical.
 */
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&";
export const scramble = (text: string, frame: number, from: number, to: number, seed = "s"): string => {
  if (frame >= to) return text;
  if (frame < from) return text.replace(/./g, " ");
  const p = (frame - from) / (to - from);
  const settled = Math.floor(p * text.length);
  return text
    .split("")
    .map((ch, i) =>
      i < settled ? ch : GLYPHS[Math.floor(random(`${seed}-${i}-${Math.floor(frame / 1)}`) * GLYPHS.length)],
    )
    .join("");
};

/**
 * Glitch — a two-frame chromatic split on a hit. On-palette on purpose: the
 * fringes are red and bone, never cyan/magenta.
 */
export const glitch = (frame: number, at: number, len = 5): React.CSSProperties => {
  if (frame < at || frame >= at + len) return {};
  const j = random(`gl-${frame}`) - 0.5;
  return {
    translate: `${(j * 18).toFixed(1)}px 0px`,
    textShadow: `${(-10 * (1 + j)).toFixed(1)}px 0 ${C.red}, ${(8 * (1 - j)).toFixed(1)}px 0 rgba(237,231,218,.55)`,
  };
};

// ------------------------------------------------------------------ parts ---

/** The red block tag — mono, bone on red. */
export const Tag: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  children,
  size = 22,
  style,
}) => (
  <span
    style={{
      ...mono(size, C.bone, 0.22),
      display: "inline-block",
      background: C.red,
      padding: `${size * 0.35}px ${size * 0.6}px ${size * 0.3}px`,
      lineHeight: 1,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Mono kicker with the red em-dash lead. */
export const Kicker: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 24,
  color = C.dim,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <span style={{ width: 44, height: 4, background: C.red, flexShrink: 0 }} />
    <span style={{ ...mono(size, color) }}>{children}</span>
  </div>
);

/**
 * Phone — a native-built handset. The screen is drawn, not screenshotted, so
 * nothing on it can go stale or leak the live case.
 */
export const Phone: React.FC<{
  children: React.ReactNode;
  width: number;
  style?: React.CSSProperties;
}> = ({ children, width, style }) => {
  const k = width / 520;
  const height = width * 2.16;
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        borderRadius: 72 * k,
        background: C.ink3,
        padding: 14 * k,
        boxShadow: `0 ${60 * k}px ${120 * k}px rgba(0,0,0,.7), inset 0 0 0 ${2 * k}px rgba(237,231,218,.10)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 60 * k,
          background: C.ink,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(237,231,218,.06)",
        }}
      >
        {/* Dynamic-island pill. #000 on purpose — the deck's notch is true black. */}
        <div
          style={{
            position: "absolute",
            top: 16 * k,
            left: "50%",
            translate: "-50% 0",
            width: 150 * k,
            height: 40 * k,
            borderRadius: 20 * k,
            background: "#000",
            zIndex: 3,
          }}
        />
        {children}
      </div>
    </div>
  );
};

/** A padlock that springs open at `open`. Drawn, never an icon font or emoji. */
export const Padlock: React.FC<{ frame: number; open: number; size?: number; color?: string }> = ({
  frame,
  open,
  size = 64,
  color = C.ink,
}) => {
  const p = prog(frame, open, 10, Easing.bezier(0.34, 1.56, 0.64, 1));
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 50 60" style={{ overflow: "visible" }}>
      <g style={{ translate: `0px ${(-7 * p).toFixed(2)}px`, rotate: `${(-28 * p).toFixed(2)}deg`, transformOrigin: "36px 26px" }}>
        <path d="M14 27 V17 a11 11 0 0 1 22 0 V27" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
      <rect x={6} y={26} width={38} height={30} rx={4} fill={color} />
      <circle cx={25} cy={39} r={4} fill={C.bone} />
      <rect x={23.5} y={40} width={3} height={8} fill={C.bone} />
    </svg>
  );
};

/**
 * Ghost — a huge outlined word low in the frame, drifting against the camera.
 * It lives in the band Meta's Reels UI covers, so it can never carry meaning;
 * on Feed and Stories, where that band is visible, it gives the shot depth.
 */
export const Ghost: React.FC<{ frame: number; from: number; word: string; top?: number; dir?: 1 | -1 }> = ({
  frame,
  from,
  word,
  top = 1330,
  dir = 1,
}) => {
  const t = frame - from;
  const up = prog(frame, from, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top,
        whiteSpace: "nowrap",
        ...disp(400, "transparent"),
        WebkitTextStroke: "2px rgba(237,231,218,.11)",
        opacity: up,
        translate: `${(dir * (-t * 2.2) + (dir > 0 ? 0 : -260)).toFixed(2)}px ${((1 - up) * 40).toFixed(2)}px`,
      }}
    >
      {word}
    </div>
  );
};

/** Reads the frame for a scene in ABSOLUTE film frames (timeline.ts numbers). */
export const useAbs = (sceneFrom: number) => useCurrentFrame() + sceneFrom;
