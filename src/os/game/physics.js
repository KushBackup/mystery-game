/**
 * DEEP BLUE: the rules of the swim, pure and deterministic.
 *
 * No DOM, no clock, no Math.random. One call to step() is exactly one tick of
 * 1/60 s, so a 60 Hz phone and a 120 Hz phone given the same taps on the same
 * ticks produce the same run. The course is drawn from makeRng(seed, 'gate', i),
 * so every phone's nth attempt is the same course (the component seeds attempt
 * n with `${seed}:${n}`).
 *
 * Units are logical pixels of the 144x256 board and ticks. y grows downward.
 */

import { makeRng } from '../../lib/engine/rng.js';

// Board
export const W = 144;
export const H = 256;
export const FLOOR_Y = 232; // top of the sand; the sand strip is 24 px tall
export const TICK_MS = 1000 / 60;

// The whale. Its hitbox is smaller than its 16x10 sprite on purpose: forgiving.
export const WHALE_X = 36; // fixed screen x of the whale's centre
export const WHALE_HW = 5; // hitbox half-width  (10 px box)
export const WHALE_HH = 3.5; // hitbox half-height (7 px box)
export const START_Y = 112;

// Motion, per tick
export const GRAVITY = 0.14;
export const FLAP_VY = -2.3; // a flap sets vy (apex ~19 px, ~16 ticks)
export const MAX_FALL = 4.4; // water drag caps the sink rate
export const SCROLL = 1; // px per tick: whole pixels keep the scroll judder-free

// Gates
export const GATE_W = 22;
export const GATE_SPACING = 90; // one gate every 1.5 s
export const FIRST_GATE_X = 200; // world x of gate 0 (~2.7 s of open water first)
export const FRIENDLY_GAPS = [76, 70, 64]; // gates 0-2
export const GAP_START = 62; // gate 3 (widened for a bar crowd: an average player should clear 5-15)
export const GAP_SHRINK = 0.25; // px narrower per gate after that
export const GAP_MIN = 45;
export const GAP_EDGE_TOP = 24; // always some line visible above a gap
export const GAP_EDGE_BOTTOM = 20; // always some coral visible below a gap
export const FRIENDLY_DELTA = 26; // max centre shift between the early gates
export const MAX_DELTA = 48; // max centre shift between any two gates
export const HOOK_SHARE = 0.72; // share of gates whose top is fishing line (the rest: a hanging reef)

export function gapFor(i) {
  if (i < FRIENDLY_GAPS.length) return FRIENDLY_GAPS[i];
  return Math.max(GAP_MIN, Math.round(GAP_START - (i - FRIENDLY_GAPS.length) * GAP_SHRINK));
}

export const gateWorldX = (i) => FIRST_GATE_X + i * GATE_SPACING;

/**
 * The course for one seed: gate(i) => { x, gapY, gap, kind }.
 * x is the gate's left edge in world pixels, gapY the gap's centre, gap its
 * height. kind names the top obstacle: 'hook' (a curtain of fishing lines) or
 * 'coral' (a hanging reef). The bottom is always a coral pillar.
 *
 * Each gate's centre is bounded against the previous one, so gates are
 * computed in order and memoised; any index can be asked for in any order.
 */
export function makeCourse(seed) {
  const cache = [];
  const gate = (i) => {
    if (i < 0) return null;
    while (cache.length <= i) {
      const k = cache.length;
      const rng = makeRng(seed, 'gate', k);
      const gap = gapFor(k);
      const lo = GAP_EDGE_TOP + gap / 2;
      const hi = FLOOR_Y - GAP_EDGE_BOTTOM - gap / 2;
      const prev = k === 0 ? START_Y : cache[k - 1].gapY;
      const delta = k < FRIENDLY_GAPS.length ? FRIENDLY_DELTA : MAX_DELTA;
      const r = rng();
      const gapY = Math.round(Math.min(hi, Math.max(lo, prev + (r * 2 - 1) * delta)));
      const kind = k < 2 || rng() < HOOK_SHARE ? 'hook' : 'coral';
      cache.push(Object.freeze({ i: k, x: gateWorldX(k), gapY, gap, kind }));
    }
    return cache[i];
  };
  return gate;
}

export function initialState() {
  return {
    tick: 0,
    dist: 0, // world px scrolled
    y: START_Y,
    vy: 0,
    alive: true,
    score: 0,
    next: 0, // index of the next gate to score
    lastFlap: -999, // tick of the last flap, for the tail animation
    deadTick: -1,
    cause: null, // 'hook' | 'coral' | 'floor'
  };
}

function hitGate(g, top, bottom) {
  const gapTop = g.gapY - g.gap / 2;
  const gapBottom = g.gapY + g.gap / 2;
  if (top < gapTop) return g.kind === 'hook' ? 'hook' : 'coral';
  if (bottom > gapBottom) return 'coral';
  return null;
}

/** Advance exactly one tick. Pure: returns a new state. */
export function step(state, flap, course) {
  const s = { ...state, tick: state.tick + 1 };

  if (!s.alive) {
    // The body sinks to the sand; the world has stopped.
    if (s.y + WHALE_HH < FLOOR_Y) {
      s.vy = Math.min(s.vy + GRAVITY, MAX_FALL);
      s.y = Math.min(s.y + s.vy, FLOOR_Y - WHALE_HH);
    } else {
      s.vy = 0;
    }
    return s;
  }

  if (flap) {
    s.vy = FLAP_VY;
    s.lastFlap = state.tick;
  } else {
    s.vy = Math.min(s.vy + GRAVITY, MAX_FALL);
  }
  s.y += s.vy;

  // Ceiling: forgiving, the whale just bumps the surface.
  if (s.y - WHALE_HH < 0) {
    s.y = WHALE_HH;
    s.vy = 0;
  }

  s.dist = state.dist + SCROLL;
  const wx = s.dist + WHALE_X; // whale centre in world px

  // Score: a gate counts once its centre is behind the whale's centre.
  while (course(s.next).x + GATE_W / 2 < wx) {
    s.score += 1;
    s.next += 1;
  }

  const left = wx - WHALE_HW;
  const right = wx + WHALE_HW;
  const top = s.y - WHALE_HH;
  const bottom = s.y + WHALE_HH;
  const k = Math.floor((wx - FIRST_GATE_X) / GATE_SPACING);
  for (let i = Math.max(0, k - 1); i <= k + 1; i++) {
    const g = course(i);
    if (right > g.x && left < g.x + GATE_W) {
      const cause = hitGate(g, top, bottom);
      if (cause) {
        s.alive = false;
        s.cause = cause;
        s.deadTick = s.tick;
        s.vy = Math.max(0, s.vy * 0.3);
        return s;
      }
    }
  }

  if (bottom >= FLOOR_Y) {
    s.y = FLOOR_Y - WHALE_HH;
    s.vy = 0;
    s.alive = false;
    s.cause = 'floor';
    s.deadTick = s.tick;
  }
  return s;
}

/**
 * Play a whole run headless. flapTicks is a Set or array of tick numbers on
 * which to flap, or a policy function (state, course) => boolean.
 */
export function simulate(seed, flapTicks, maxTicks) {
  const course = makeCourse(seed);
  let policy;
  if (typeof flapTicks === 'function') policy = (s) => flapTicks(s, course);
  else {
    const set = flapTicks instanceof Set ? flapTicks : new Set(flapTicks);
    policy = (s) => set.has(s.tick);
  }
  let s = initialState();
  while (s.alive && s.tick < maxTicks) s = step(s, policy(s), course);
  return { score: s.score, ticks: s.tick, alive: s.alive };
}
