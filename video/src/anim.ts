/**
 * anim.ts — the film's motion language, in one place.
 *
 * RULES ENCODED HERE
 *  - Entrances ease on Easing.bezier(0.16, 1, 0.3, 1) — the deck's `--ease`.
 *  - Anything that "lands" (pins, cards, rails) uses spring({damping: 200}):
 *    critically damped, so it settles without wobble.
 *  - The cold-open type slam is the one place that overshoots, via `slam()`.
 *  - Nothing EVER fades in on opacity alone. Every entrance pairs opacity with
 *    a transform: a 16-40px translate, or a 0.94 -> 1 scale.
 *
 * All transform values are returned as STRINGS so React passes them through to
 * CSS verbatim and never guesses at a unit. Uses the individual `translate` /
 * `scale` / `rotate` CSS properties rather than a `transform` shorthand, so
 * parent and child transforms compose instead of overwriting each other.
 */

import { Easing, interpolate, spring } from "remotion";

/** The deck's `--ease: cubic-bezier(.16,1,.3,1)`. Every entrance uses it. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Linear 0 -> 1 ramp on the house ease. The building block for everything. */
export const ramp = (
  frame: number,
  start: number,
  dur = 26,
  easing = EASE,
): number =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing });

/** Raw linear ramp with no easing — for rails, wipes and counters. */
export const linear = (frame: number, start: number, dur: number): number =>
  interpolate(frame, [start, start + dur], [0, 1], clamp);

export type EnterStyle = {
  opacity: number;
  translate: string;
  scale?: string;
};

/**
 * The house entrance: opacity + a small offset, eased.
 * `y` defaults to 28px — inside the 16-40px band the motion spec allows.
 */
export const enter = (
  frame: number,
  start: number,
  opts: { dur?: number; y?: number; x?: number; scaleFrom?: number } = {},
): EnterStyle => {
  const { dur = 26, y = 28, x = 0, scaleFrom } = opts;
  const p = ramp(frame, start, dur);
  const style: EnterStyle = {
    opacity: p,
    translate: `${(x * (1 - p)).toFixed(3)}px ${(y * (1 - p)).toFixed(3)}px`,
  };
  if (scaleFrom !== undefined) {
    const s = scaleFrom + (1 - scaleFrom) * p;
    style.scale = `${s.toFixed(4)}`;
  }
  return style;
};

/**
 * A critically damped landing — pins, cards, rails, anything that arrives and
 * stays put. `spring({config: {damping: 200}})` per the motion spec: no wobble.
 */
export const land = (
  frame: number,
  start: number,
  fps: number,
  opts: { dur?: number; y?: number; scaleFrom?: number; rotateFrom?: number; rotateTo?: number } = {},
): { opacity: number; translate: string; scale?: string; rotate?: string } => {
  const { dur = 34, y = 0, scaleFrom, rotateFrom, rotateTo = 0 } = opts;
  const s = spring({
    fps,
    frame: frame - start,
    config: { damping: 200 },
    durationInFrames: dur,
  });
  const out: { opacity: number; translate: string; scale?: string; rotate?: string } = {
    // Opacity resolves in the first half of the spring so the element is solid
    // while it is still settling — an element must never be readable mid-fade.
    opacity: interpolate(s, [0, 0.45], [0, 1], clamp),
    translate: `0px ${(y * (1 - s)).toFixed(3)}px`,
  };
  if (scaleFrom !== undefined) {
    out.scale = `${(scaleFrom + (1 - scaleFrom) * s).toFixed(4)}`;
  }
  if (rotateFrom !== undefined) {
    out.rotate = `${(rotateFrom + (rotateTo - rotateFrom) * s).toFixed(3)}deg`;
  }
  return out;
};

/**
 * The type slam — the ONE place the film overshoots. Used on the cold-open
 * wordmark so the title arrives with weight and settles back a hair.
 */
export const slam = (
  frame: number,
  start: number,
  fps: number,
  opts: { scaleFrom?: number; y?: number } = {},
): { opacity: number; translate: string; scale: string } => {
  const { scaleFrom = 1.14, y = 0 } = opts;
  const s = spring({
    fps,
    frame: frame - start,
    config: { damping: 13, stiffness: 120, mass: 0.7 },
  });
  return {
    opacity: interpolate(frame, [start, start + 5], [0, 1], clamp),
    translate: `0px ${(y * (1 - s)).toFixed(3)}px`,
    scale: `${(scaleFrom + (1 - scaleFrom) * s).toFixed(4)}`,
  };
};

/** The mirror of `enter()` — strips an element away at the end of a scene. */
export const exitUp = (
  frame: number,
  start: number,
  opts: { dur?: number; y?: number } = {},
): EnterStyle => {
  const { dur = 22, y = -26 } = opts;
  const p = ramp(frame, start, dur);
  return {
    opacity: 1 - p,
    translate: `0px ${(y * p).toFixed(3)}px`,
  };
};

/**
 * Stagger helper: the start frame of child `i`.
 * The spec's band is 4-10 frames between children; never reveal a group at once.
 */
export const stagger = (base: number, i: number, step = 7): number =>
  base + i * step;

/** A hairline rule that draws out from its left edge. */
export const ruleScaleX = (
  frame: number,
  start: number,
  dur = 30,
): string => `${ramp(frame, start, dur).toFixed(4)} 1`;

/** An amber counter that ticks up to `value` and holds. */
export const countTo = (
  frame: number,
  start: number,
  value: number,
  dur = 34,
): number => Math.round(ramp(frame, start, dur) * value);
