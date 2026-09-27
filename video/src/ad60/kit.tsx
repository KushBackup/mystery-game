/**
 * kit.tsx — the reel's vocabulary: footage, captions, chip, fx.
 *
 * The first two cuts dressed real footage in the explainer's poster language
 * (condensed display type, mono kickers, heavy ink scrims). Review said the
 * graphics weren't working, and the ads that run longest on Meta in this
 * category all look native instead: bright footage that fills the frame, and
 * short captions that pop in word by word with one word in a highlight box.
 * This kit builds that look.
 *
 *   Shot / Photo  — one clip or still, graded, pushed, kicked on the cut.
 *                   ALWAYS REAL SPEED: there is deliberately no playback-rate prop.
 *   Caption       — the caption system: " / " line breaks, *highlight* segments,
 *                   "!" extra-large punch lines. Each word pops on the frame it is
 *                   SPOKEN in the voiceover (timeline.ts aligns them).
 *   StepChip      — "How it works" and five progress bars, fixed top-left.
 *   Rays / Flash / Film — the poster's red rays, a decaying hit, grain + vignette.
 *
 * TYPE. Inter Tight at 800/900 with tight tracking, the closest free match to
 * the heavy grotesk on the user's own event posters. The Big Shoulders
 * wordmark is kept for the brand lockup only, so the logo is unchanged.
 * COLOUR still comes from ../theme.ts: bone text, the red highlight, ink.
 */

import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/InterTight";
import { ASSET_DIR, C } from "./theme";
import { impact, prog } from "./fx";
import { DEFAULT_ORIGIN, PUSH, lensScale } from "./lens";
import { CAPTION } from "./timeline";
import type { CaptionData } from "./timeline";

const inter = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
export const SANS = inter.fontFamily;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const X = 72;
export const INNER = 936;

export type Grade = "warm" | "noir" | "dim" | "plate";

const FILTER: Record<Grade, string> = {
  // Bright on purpose: the footage carries the ad, the captions carry their own shadow.
  warm: "contrast(1.08) saturate(1.04) brightness(1.02)",
  noir: "grayscale(1) contrast(1.4) brightness(0.95)",
  // Under a graphic (phone, notifications): pushed back, not hidden.
  dim: "contrast(1.05) saturate(0.8) brightness(0.55) blur(2px)",
  // Under a full-screen card (CTA, event): texture only. Faces must not be recognisable through it.
  plate: "contrast(1.05) saturate(0.7) brightness(0.5) blur(10px)",
};

type MediaProps = { frame: number; src: string; dur: number; grade?: Grade; origin?: string; push?: number; zoom?: number };

/** Shot — one clip, from its first frame, at 1x, for `dur` frames. The lens is lens.ts, shared with the keep-clear check. */
export const Shot: React.FC<MediaProps> = ({ frame, src, dur, grade = "warm", origin = DEFAULT_ORIGIN, push = PUSH.clip, zoom = 1 }) => (
  <AbsoluteFill style={{ transformOrigin: origin, scale: lensScale(frame, dur, push, zoom).toFixed(5) }}>
    <OffthreadVideo
      src={staticFile(`${ASSET_DIR}/${src}.mp4`)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: FILTER[grade] }}
    />
  </AbsoluteFill>
);

/** Photo — a still with a Ken Burns push; a still is never allowed to sit dead. */
export const Photo: React.FC<MediaProps> = ({ frame, src, dur, grade = "warm", origin = DEFAULT_ORIGIN, push = PUSH.photo, zoom = 1 }) => (
  <AbsoluteFill style={{ transformOrigin: origin, scale: lensScale(frame, dur, push, zoom).toFixed(5) }}>
    <Img src={staticFile(`${ASSET_DIR}/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: FILTER[grade] }} />
  </AbsoluteFill>
);

// --------------------------------------------------------------- captions ---

type Seg = { t: string; hl: boolean };
type Line = { xl: boolean; segs: Seg[] };

/** "Come solve a / !*Murder* / instead." -> three lines, the middle one XL and highlighted. */
export const parseCaption = (text: string): Line[] =>
  text.split(" / ").map((raw) => {
    const xl = raw.startsWith("!");
    const body = xl ? raw.slice(1) : raw;
    const segs: Seg[] = [];
    body.split(/(\*[^*]+\*)/).forEach((part) => {
      if (!part) return;
      if (part.startsWith("*") && part.endsWith("*")) segs.push({ t: part.slice(1, -1), hl: true });
      else segs.push({ t: part, hl: false });
    });
    return { xl, segs };
  });

/** The caption's text shadow: a tight dark edge plus a soft drop, readable on any frame. */
export const CAP_SHADOW = "0 0 2px rgba(0,0,0,.85), 0 3px 0 rgba(0,0,0,.3), 0 8px 28px rgba(0,0,0,.55)";

/** Sizes live in timeline.ts (CAPTION) because the keep-clear check measures with them. */
const SIZE = { m: CAPTION.m, xl: CAPTION.xl };

/** One word: pops up from below with a slight overshoot, 4 frames to readable. */
const Word: React.FC<{ frame: number; at: number; children: string; fps: number; box?: React.CSSProperties }> = ({ frame, at, children, fps, box }) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 240, mass: 0.6 } });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: interpolate(frame, [at, at + 2], [0, 1], clamp),
        translate: `0px ${((1 - s) * 22).toFixed(2)}px`,
        scale: `${(0.72 + 0.28 * s).toFixed(4)}`,
        transformOrigin: "50% 80%",
        whiteSpace: "nowrap",
        ...box,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Caption — one on-screen line group, in ABSOLUTE frames. `wordAt[n]` is the
 * frame word n pops (as it is spoken); a highlighted segment's red box grows
 * with it, one word at a time.
 */
export const Caption: React.FC<{ frame: number; wordAt: number[]; text: string; y?: number; align?: "left" | "center"; fps: number; scale?: number }> = ({
  frame,
  wordAt,
  text,
  y = 960,
  align = "center",
  fps,
  scale = 1,
}) => {
  const tAt = (n: number) => wordAt[Math.min(n, wordAt.length - 1)];
  const lines = parseCaption(text);
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        width: INNER,
        top: y,
        translate: "0px -50%",
        textAlign: align,
        fontFamily: SANS,
        color: C.bone,
        textShadow: CAP_SHADOW,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            fontSize: (line.xl ? SIZE.xl : SIZE.m) * scale,
            fontWeight: line.xl ? 900 : 800,
            lineHeight: line.xl ? 0.98 : 1.1,
            letterSpacing: line.xl ? "-0.045em" : "-0.03em",
            wordSpacing: line.xl ? 0 : "0.08em",
            textTransform: line.xl ? "uppercase" : "none",
            margin: line.xl ? `${6 * scale}px 0 ${10 * scale}px` : 0,
          }}
        >
          {line.segs.map((seg, si) => {
            // Spaces are separate from the popping words, never inside one:
            // a trailing space inside an inline-block is dropped at layout.
            const tokens = seg.t.split(/( +)/).filter(Boolean);
            if (!seg.hl) {
              return (
                <React.Fragment key={si}>
                  {tokens.map((w, wi) => {
                    if (/^ +$/.test(w)) return <React.Fragment key={wi}> </React.Fragment>;
                    const el = (
                      <Word key={wi} frame={frame} at={tAt(n)} fps={fps}>
                        {w}
                      </Word>
                    );
                    n += 1;
                    return el;
                  })}
                </React.Fragment>
              );
            }
            // A highlighted segment grows WORD BY WORD with the voice: each word
            // carries its own slice of the red box, and the space between two
            // words fills in when the second one is spoken.
            const wordIdx = tokens.map((t) => !/^ +$/.test(t));
            const lastWord = wordIdx.lastIndexOf(true);
            const padX = line.xl ? "0.1em" : "0.16em";
            const r = (line.xl ? 22 : 14) * scale;
            const base = n;
            let k = 0;
            const at = tokens.map((t) => (/^ +$/.test(t) ? -1 : tAt(base + k++)));
            n = base + k;
            return (
              <React.Fragment key={si}>
                {tokens.map((w, wi) => {
                  if (!wordIdx[wi]) {
                    const nextAt = at[wi + 1] ?? Infinity;
                    return (
                      <span key={wi} style={{ display: "inline-block", background: frame >= nextAt ? C.red : "transparent", padding: "0.02em 0 0.04em" }}>
                        {" "}
                      </span>
                    );
                  }
                  const isFirst = wi === 0;
                  const isLast = wi === lastWord;
                  return (
                    <Word
                      key={wi}
                      frame={frame}
                      at={at[wi]}
                      fps={fps}
                      box={{
                        background: C.red,
                        padding: `0.02em ${isLast ? padX : 0} 0.04em ${isFirst ? padX : 0}`,
                        borderRadius: `${isFirst ? r : 0}px ${isLast ? r : 0}px ${isLast ? r : 0}px ${isFirst ? r : 0}px`,
                        textShadow: "0 2px 0 rgba(0,0,0,.18)",
                      }}
                    >
                      {w}
                    </Word>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** The caption track: each caption holds from `from` until the next one arrives. */
export const Captions: React.FC<{ frame: number; caps: CaptionData[]; fps: number }> = ({ frame, caps, fps }) => (
  <>
    {caps.map((c, i) =>
      frame >= c.from && frame < c.to ? <Caption key={i} frame={frame} wordAt={c.wordAt} text={c.text} y={c.y} align={c.align} fps={fps} scale={c.scale} /> : null,
    )}
  </>
);

/** StepChip — "How it works" plus five bars; the current step's bar fills as it arrives. */
export const StepChip: React.FC<{ frame: number; step: number; first: boolean }> = ({ frame, step, first }) => {
  const inP = first ? prog(frame, 0, 8) : 1;
  const fill = prog(frame, 2, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        top: 292,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: inP,
        translate: `${((1 - inP) * -24).toFixed(2)}px 0px`,
        fontFamily: SANS,
      }}
    >
      <span
        style={{
          background: C.red,
          color: C.bone,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          padding: "12px 22px 11px",
          borderRadius: 999,
          boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        }}
      >
        How it works · {step}/5
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ width: 44, height: 9, borderRadius: 9, background: "rgba(237,231,218,.3)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.35)" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: C.bone,
                transformOrigin: "left center",
                scale: `${(i < step ? 1 : i === step ? fill : 0).toFixed(4)} 1`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ fx -----

/**
 * Rays — the poster's red speed rays, radiating from a focal point, turning
 * slowly. The centre is masked clear so they frame a face rather than cross it.
 */
export const Rays: React.FC<{ frame: number; cx?: number; cy?: number; opacity?: number; count?: number }> = ({
  frame,
  cx = 620,
  cy = 760,
  opacity = 0.8,
  count = 46,
}) => {
  const R = 2600;
  const spin = frame * 0.06;
  const rays = Array.from({ length: count }).map((_, i) => {
    const a0 = (i / count) * Math.PI * 2 + random(`ray-a-${i}`) * 0.08;
    const w = 0.008 + random(`ray-w-${i}`) * 0.018;
    const inner = 380 + random(`ray-r-${i}`) * 260;
    const p = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
    return `M${p(a0, inner)} L${p(a0 - w, R)} L${p(a0 + w, R)} Z`;
  });
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: "none",
        mixBlendMode: "screen",
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, transparent 0, transparent 360px, black 560px)`,
        maskImage: `radial-gradient(circle at ${cx}px ${cy}px, transparent 0, transparent 360px, black 560px)`,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g style={{ transformOrigin: `${cx}px ${cy}px`, rotate: `${spin.toFixed(3)}deg` }}>
          {rays.map((d, i) => (
            <path key={i} d={d} fill={i % 3 === 0 ? C.redDeep : C.red} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Flash — a full-frame hit, decaying exponentially from `at`. */
export const Flash: React.FC<{ frame: number; at: number; color?: string; peak?: number; tau?: number }> = ({
  frame,
  at,
  color = C.red,
  peak = 0.7,
  tau = 4,
}) => {
  const v = impact(frame, at, tau) * peak;
  if (v < 0.005) return null;
  return <AbsoluteFill style={{ background: color, opacity: v, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

const GRAIN_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.93 0 0 0 0 0.9 0 0 0 0 0.85 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Film — light grain, a soft vignette and thin ink bands under the platform UI. */
export const Film: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(12,13,15,.45) 0%, rgba(12,13,15,0) 16%, rgba(12,13,15,0) 70%, rgba(12,13,15,.55) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.055,
        backgroundImage: GRAIN_TILE,
        backgroundSize: "260px 260px",
        backgroundPosition: `${Math.round(random(`g60x${frame}`) * 260)}px ${Math.round(random(`g60y${frame}`) * 260)}px`,
      }}
    />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 280px 60px rgba(0,0,0,.42)", pointerEvents: "none" }} />
  </>
);

/** Sequence for a shot, placed at its absolute start. */
export const At: React.FC<{ from: number; dur: number; name: string; children: React.ReactNode }> = ({ from, dur, name, children }) => (
  <Sequence from={from} durationInFrames={dur} name={name} layout="absolute-fill">
    {children}
  </Sequence>
);
