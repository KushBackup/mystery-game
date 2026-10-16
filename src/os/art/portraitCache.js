import { drawPortrait, seedOf, ART_W, ART_H, FACE_CROP, FIGURE_CROP, LAYERS } from './portraitArt';

/**
 * Painting contact photos, cached, for Portrait.jsx.
 *
 * A photo costs a mid-range Android phone about 100 ms to paint (2026-10-03
 * audit), so each picture is painted once per size and reused, thumbnails
 * that are not ready yet are painted a few per frame (`later`), and Setup
 * paints the next tap's photo ahead of time (`warmPortrait`). Device pixels
 * are capped at 2x: the drawing is soft watercolour and a third more pixels
 * bought nothing a guest could see.
 */

const MAX_DPR = 2;
const FRAME_BUDGET_MS = 8;

export const keyOf = (traits) => (traits ? [...LAYERS, 'gender'].map((id) => traits[id] ?? '').join('|') : '-');
export const fontsReady = () => typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';
export const dprOf = () => Math.min(MAX_DPR, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
export const seedNum = (seed) => (typeof seed === 'number' ? seed : seedOf(seed ?? 'guest'));

/** Size the context so the drawing's units fill the canvas (or its head-and-shoulders crop, or the figure alone). */
export function frame(g, w, full, figure = false) {
  if (figure) {
    const k = w / FIGURE_CROP.w;
    g.setTransform(k, 0, 0, k, -FIGURE_CROP.x * k, -FIGURE_CROP.y * k);
  } else if (full) {
    const k = w / ART_W;
    g.setTransform(k, 0, 0, k, 0, 0);
  } else {
    const k = w / FACE_CROP.w;
    g.setTransform(k, 0, 0, k, -FACE_CROP.x * k, -FACE_CROP.y * k);
  }
}

/**
 * Finished photos by size and answers. Bounded by pixels, not count: one full
 * photo is ~260k pixels and a thumbnail ~6k, and an Android tab that holds
 * too much canvas memory gets killed.
 */
const CACHE = new Map(); // key -> canvas, least recently used first
const CACHE_PIXELS = 16e6;
let cachePixels = 0;

export const cacheKey = (w, h, { full, figure, mystery, seed, traits }) => `${figure ? 'P' : full ? 'F' : 'C'}${mystery ? 'M' : ''}${w}x${h}:${seed}:${keyOf(traits)}`;
export const isCached = (w, h, opts) => CACHE.has(cacheKey(w, h, opts));

/** The photo painted at w x h device pixels: from the cache, or painted now. */
export function cached(w, h, opts) {
  const key = cacheKey(w, h, opts);
  let c = CACHE.get(key);
  if (c) {
    CACHE.delete(key);
    CACHE.set(key, c);
    return c;
  }
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  frame(g, w, opts.full, opts.figure);
  drawPortrait(g, opts.traits ?? {}, opts.seed, { face: !opts.full && !opts.figure, figure: opts.figure, mystery: opts.mystery });
  if (fontsReady()) {
    CACHE.set(key, c);
    cachePixels += w * h;
    while (cachePixels > CACHE_PIXELS && CACHE.size > 1) {
      const [oldest, old] = CACHE.entries().next().value;
      CACHE.delete(oldest);
      cachePixels -= old.width * old.height;
    }
  }
  return c;
}

/** Paint a photo ahead of time, so the tap that shows it is instant. Same arguments as <Portrait>. */
export function warmPortrait({ traits, seed, size = 84, full = false, figure = false, mystery = false }) {
  if (typeof document === 'undefined') return;
  const dpr = dprOf();
  const h = heightOf(size, full, figure);
  cached(Math.round(size * dpr), Math.round(h * dpr), { traits, seed: seedNum(seed), full, figure, mystery });
}

/** A picture's height for its width: the 3:4 photo, the tall figure, or the square crop. */
export const heightOf = (w, full, figure) => (figure ? Math.round((w * FIGURE_CROP.h) / FIGURE_CROP.w) : full ? Math.round((w * ART_H) / ART_W) : w);

/** Photos waiting to be painted: a few per frame, so the frame still lands. */
const queue = [];
let pumping = false;
function pump() {
  const t0 = performance.now();
  while (queue.length && performance.now() - t0 < FRAME_BUDGET_MS) queue.shift()();
  if (queue.length) requestAnimationFrame(pump);
  else pumping = false;
}
export function later(job) {
  queue.push(job);
  if (!pumping) { pumping = true; requestAnimationFrame(pump); }
}
