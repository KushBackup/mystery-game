/**
 * dots.ts — the 32 players, as geometry.
 *
 * Scenes 2 and 3 are one continuous idea: the same 32 dots sit in five tight
 * cliques (the problem), then break apart into a connected network (the
 * mechanism). For that to read, the cluster positions must be IDENTICAL at the
 * end of scene 2 and the start of scene 3 — so both scenes import from here.
 *
 * Every position is derived from `random(seed)` from remotion, never
 * Math.random(), so each of the parallel render threads produces the same frame.
 */

import { random } from "remotion";

export const DOT_COUNT = 32;

/** Five cliques, sized 7/7/6/6/6 = 32. Normalised 0..1 inside the dot box. */
const CLUSTER_CENTRES: [number, number][] = [
  [0.13, 0.27],
  [0.38, 0.12],
  [0.71, 0.29],
  [0.24, 0.72],
  [0.64, 0.79],
];
const CLUSTER_SIZES = [7, 7, 6, 6, 6];

/** Which clique dot `i` belongs to. */
export const clusterOf = (i: number): number => {
  let acc = 0;
  for (let c = 0; c < CLUSTER_SIZES.length; c++) {
    acc += CLUSTER_SIZES[c];
    if (i < acc) return c;
  }
  return CLUSTER_SIZES.length - 1;
};

export type Pt = { x: number; y: number };

/** Where the dots drift in from — loose and unarranged. */
export const scatterPos = (i: number): Pt => ({
  x: 0.06 + random(`sx-${i}`) * 0.88,
  y: 0.08 + random(`sy-${i}`) * 0.84,
});

/**
 * The five tight groups. Guests default to the people they came with:
 * a small deterministic radius keeps each clique visibly closed.
 */
export const clusterPos = (i: number): Pt => {
  const c = clusterOf(i);
  const [cx, cy] = CLUSTER_CENTRES[c];
  const a = random(`ca-${i}`) * Math.PI * 2;
  const r = 0.015 + random(`cr-${i}`) * 0.037;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 1.15 };
};

/**
 * The network. A jittered 8x4 lattice — spread wide enough that no dot is
 * adjacent to its old clique, which is the whole point of the beat.
 */
export const networkPos = (i: number): Pt => {
  const cols = 8;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    // Generous jitter: a clean lattice would read as a diagram, not a room.
    x: 0.055 + (col / (cols - 1)) * 0.89 + (random(`nx-${i}`) - 0.5) * 0.085,
    y: 0.1 + (row / 3) * 0.8 + (random(`ny-${i}`) - 0.5) * 0.1,
  };
};

/**
 * The information graph, as drawn. Only cross-clique pairs qualify — a thread
 * inside a clique would say the opposite of what this scene is about.
 */
export const EDGES: [number, number][] = (() => {
  const out: [number, number][] = [];
  const seen = new Set<string>();
  for (const step of [11, 7, 19]) {
    for (let i = 0; i < DOT_COUNT; i++) {
      const j = (i * step + 5) % DOT_COUNT;
      if (i === j) continue;
      if (clusterOf(i) === clusterOf(j)) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(i < j ? [i, j] : [j, i]);
      if (out.length >= 24) return out;
    }
  }
  return out;
})();

/**
 * A bowed quadratic between two points in pixel space — the red thread never
 * runs straight, it always has the sag of an actual piece of string.
 */
export const bow = (a: Pt, b: Pt, seed: string, amount = 0.16): string => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular, with a deterministic side and magnitude.
  const side = random(`bs-${seed}`) > 0.5 ? 1 : -1;
  const mag = len * amount * (0.6 + random(`bm-${seed}`) * 0.8) * side;
  const cx = (a.x + b.x) / 2 + (-dy / len) * mag;
  const cy = (a.y + b.y) / 2 + (dx / len) * mag;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
};

/** Maps a normalised point into a pixel rect. */
export const toRect = (
  p: Pt,
  rect: { x: number; y: number; w: number; h: number },
): Pt => ({ x: rect.x + p.x * rect.w, y: rect.y + p.y * rect.h });
