import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { drawPortrait, seedOf, ART_W, ART_H, FACE_CROP, LAYERS } from './portraitArt';

/**
 * A guest's contact photo: a full-length, hand-drawn picture of them at home,
 * built from their six arrival answers (portraitArt.js says what each answer
 * draws). The room, hair, trousers and pose come from the guest's id, so the
 * same guest is the same picture on every phone and two guests never share one.
 *
 * Two framings of the one drawing:
 *   - `full`: the whole 3:4 photo, `size` wide. Setup and the contact card.
 *   - default: a square crop of head and shoulders, `size` across, for every
 *     list and board where a face sits beside a name. The top colour and
 *     glasses still read at 24 px.
 *
 * Skin is always the paper and the hair is pencil, because neither is an
 * answer: the picture never claims a skin or hair colour, only what they
 * said. `mystery` shades the face out and leaves the hair off, for a person
 * nobody has named yet (Gallery's sketch of the hand). A ghost's photo is
 * the same picture, faded to grey.
 *
 * `animate` (Setup only): when an answer changes, its part of the picture is
 * brushed on over ~0.6 s, held on twos like a hand-drawn film, while the old
 * one fades; a gender change fades the old figure off the new one. Every tap
 * starts at once, so a guest can flick through options and watch each land.
 * Under reduced motion it simply changes.
 */

const CACHE = new Map(); // key -> canvas, for the static frames every list redraws
const CACHE_MAX = 240;
const BRUSH_MS = 640;
const HOLD_MS = 1000 / 12; // drawn on twos

const keyOf = (traits) => (traits ? [...LAYERS, 'gender'].map((id) => traits[id] ?? '').join('|') : '-');
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fontsReady = () => typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded';

/** Paint one frame into a canvas sized w x h device pixels. */
function paint(canvas, { traits, seed, full, reveal, prev, mystery }) {
  const g = canvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (full) {
    const k = canvas.width / ART_W;
    g.setTransform(k, 0, 0, k, 0, 0);
  } else {
    const k = canvas.width / FACE_CROP.w;
    g.setTransform(k, 0, 0, k, -FACE_CROP.x * k, -FACE_CROP.y * k);
  }
  drawPortrait(g, traits ?? {}, seed, { reveal, prev, face: !full, mystery });
}

function cached(w, h, opts) {
  const key = `${opts.full ? 'F' : 'C'}${opts.mystery ? 'M' : ''}${w}x${h}:${opts.seed}:${keyOf(opts.traits)}`;
  let c = CACHE.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    paint(c, opts);
    if (fontsReady()) {
      CACHE.set(key, c);
      if (CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value);
    }
  }
  return c;
}

export default function Portrait({ traits, seed, size = 84, full = false, mystery = false, ghost = false, rounded = 8, animate = false, className = '' }) {
  const ref = useRef(null);
  const shown = useRef(traits); // the answers the canvas last finished drawing
  const run = useRef(0);
  const n = typeof seed === 'number' ? seed : seedOf(seed ?? 'guest');
  const w = size;
  const h = full ? Math.round((size * ART_H) / ART_W) : size;
  const key = keyOf(traits);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const dpr = Math.min(3, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    const g = canvas.getContext('2d');
    const blit = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, pw, ph); g.drawImage(cached(pw, ph, { traits, seed: n, full, mystery }), 0, 0); };

    const before = shown.current;
    const moving = animate && before && !reduceMotion();
    const changed = moving ? LAYERS.filter((id) => (before[id] ?? null) !== (traits?.[id] ?? null)) : [];
    const refigure = moving && (before.gender ?? null) !== (traits?.gender ?? null);
    shown.current = traits;

    if (refigure) {
      // a new figure: the old picture fades off the new one, held on twos
      const old = document.createElement('canvas');
      old.width = pw;
      old.height = ph;
      old.getContext('2d').drawImage(canvas, 0, 0);
      const id = ++run.current;
      const start = performance.now();
      let last = -1;
      let raf = 0;
      const tick = (now) => {
        if (run.current !== id) return;
        const t = Math.min(1, (now - start) / BRUSH_MS);
        const step = Math.floor((now - start) / HOLD_MS);
        if (step !== last || t >= 1) {
          last = step;
          blit();
          if (t < 1) { g.globalAlpha = (1 - t) ** 1.5; g.drawImage(old, 0, 0); g.globalAlpha = 1; }
        }
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => { cancelAnimationFrame(raf); };
    }

    if (!changed.length) {
      blit();
      if (!fontsReady()) document.fonts.ready.then(() => { if (ref.current === canvas && shown.current === traits) blit(); });
      return undefined;
    }

    // brush the changed answers on, held on twos
    const id = ++run.current;
    const start = performance.now();
    let last = -1;
    let raf = 0;
    const tick = (now) => {
      if (run.current !== id) return;
      const t = Math.min(1, (now - start) / BRUSH_MS);
      const step = Math.floor((now - start) / HOLD_MS);
      if (t >= 1) { blit(); return; }
      if (step !== last) {
        last = step;
        const e = 1 - (1 - t) ** 2;
        paint(canvas, { traits, seed: n, full, mystery, prev: before, reveal: Object.fromEntries(changed.map((l) => [l, e])) });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
    // `key` stands for `traits`: a new object with the same answers is the same picture
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, n, w, h, full, mystery, animate]);

  useEffect(() => () => { run.current += 1; }, []);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={className}
      style={{ width: w, height: h, borderRadius: rounded, display: 'block', filter: ghost ? 'grayscale(1) contrast(0.9)' : undefined, opacity: ghost ? 0.7 : 1 }}
      aria-hidden="true"
    />
  );
}

/**
 * A guest's photo by id, wherever the phone shows a person (the board, the
 * poll, the verdict, the finale), so the room recognises the same face in
 * every app. `traits` is the shell's map of everyone's answers (ctx.traits).
 */
export function Face({ traits, pid, size = 40, ghost = false, round = false, className = '' }) {
  return (
    <Portrait
      traits={traits?.[pid]}
      seed={pid}
      size={size}
      ghost={ghost}
      rounded={round ? size / 2 : Math.max(4, Math.round(size / 7))}
      className={`os-face ${className}`}
    />
  );
}
