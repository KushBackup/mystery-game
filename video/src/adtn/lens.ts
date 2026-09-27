/**
 * lens.ts — the camera move every shot gets, as plain math both sides share:
 * the React layer animates it, and the keep-clear check (timeline.ts) uses the
 * SAME function to predict where a face will be on every frame of a shot.
 *
 * A shot is scaled about its `origin` by
 *
 *   zoom × (1 + push·ease(f / dur) + KICK·e^(−f / KICK_TAU))
 *
 *   zoom   base reframe (default 1). Use it to lift a subject clear of a caption
 *          band: zooming about an origin at the top edge moves everything down.
 *   push   the slow push-in across the shot (clips 6%, photos 12% — a still is
 *          never allowed to sit dead).
 *   KICK   the cut's punch: +4.5% on the first frame, gone in ~10 frames.
 *
 * Pure TypeScript, no imports: Node runs this file directly (type stripping).
 */

export const PUSH = { clip: 0.06, photo: 0.12 } as const;
export const KICK = 0.045;
export const KICK_TAU = 3.5;
export const DEFAULT_ORIGIN = "50% 45%";

/** A CSS cubic-bezier easing, solved numerically — the same curve as Remotion's Easing.bezier. */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1;
  const b = (p1: number, p2: number) => 3 * p2 - 6 * p1;
  const c = (p1: number) => 3 * p1;
  const at = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
  const tFor = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (Math.abs(s) < 1e-7) break;
      t -= (at(t, x1, x2) - x) / s;
    }
    if (t >= 0 && t <= 1 && Math.abs(at(t, x1, x2) - x) < 1e-6) return t;
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 50; i++) {
      const v = at(t, x1, x2);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : at(tFor(x), y1, y2));
};

/** The house ease: every push and entrance uses it. */
export const EASE_OUT = bezier(0.16, 1, 0.3, 1);

/** The lens scale on shot-relative frame `f`. */
export const lensScale = (f: number, dur: number, push: number, zoom = 1) => {
  const p = EASE_OUT(Math.min(1, Math.max(0, f / Math.max(1, dur))));
  const kick = f < 0 ? 0 : KICK * Math.exp(-f / KICK_TAU);
  return zoom * (1 + push * p + kick);
};

/** "52% 28%" -> [x, y] in canvas px. */
export const originPx = (origin: string | undefined, w = 1080, h = 1920): [number, number] => {
  const [ox, oy] = (origin ?? DEFAULT_ORIGIN).split(/\s+/).map((v) => parseFloat(v) / 100);
  return [ox * w, oy * h];
};

/** Where a source-frame span [a, b] lands on screen at scale `s` about `o` (one axis). */
export const onScreen = (a: number, b: number, o: number, s: number): [number, number] => [o + (a - o) * s, o + (b - o) * s];
