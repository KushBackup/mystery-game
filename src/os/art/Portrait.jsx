import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { brushMask, LAYERS } from './portraitArt';
import { cached, isCached, later, frame, keyOf, fontsReady, dprOf, seedNum, heightOf } from './portraitCache';

/**
 * A guest's contact photo: a full-length, hand-drawn picture of them at home,
 * built from their seven arrival answers (portraitArt.js says what each answer
 * draws). The room, hair, trousers and pose come from the guest's id, so the
 * same guest is the same picture on every phone and two guests never share one.
 *
 * Two framings of the one drawing:
 *   - `full`: the whole 3:4 photo, `size` wide. Setup and the contact card.
 *   - default: a square crop of head and shoulders, `size` across, for every
 *     list and board where a face sits beside a name. The top colour and
 *     glasses still read at 24 px.
 *   - `figure`: the person alone, head to shoes, `size` wide, on a
 *     transparent canvas: the guests standing in the Night app's lounge.
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
 *
 * Performance (Android, 2026-10-03): painting a photo costs a mid-range phone
 * about 100 ms, so it is painted once and cached (portraitCache.js). The
 * brush-on never repaints the drawing: it lets the cached new photo show
 * through a zigzag mask over a copy of the old one. Thumbnails that are not
 * cached yet are painted a few per frame, so a list of forty faces never
 * freezes the phone.
 */

const BRUSH_MS = 640;
const HOLD_MS = 1000 / 12; // drawn on twos

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Two scratch canvases for the brush-on (only Setup animates, one photo at a time).
let scratch = null;
function scratchPair(w, h) {
  if (!scratch) scratch = [document.createElement('canvas'), document.createElement('canvas')];
  for (const c of scratch) if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return scratch;
}

export default function Portrait({ traits, seed, size = 84, full = false, figure = false, mystery = false, ghost = false, rounded = 8, animate = false, className = '' }) {
  const ref = useRef(null);
  const shown = useRef(traits); // the answers the canvas last finished drawing
  const run = useRef(0);
  const n = seedNum(seed);
  const w = size;
  const h = heightOf(size, full, figure);
  const key = keyOf(traits);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const dpr = dprOf();
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    const opts = { traits, seed: n, full, figure, mystery };
    const id = ++run.current;
    const g = canvas.getContext('2d');
    const blit = (src = cached(pw, ph, opts)) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, pw, ph); g.drawImage(src, 0, 0); };

    const before = shown.current;
    const sized = canvas.width === pw && canvas.height === ph;
    const moving = animate && before && sized && !reduceMotion();
    // The family photo wears the shirt's colour, so a new top brushes that on too.
    const differs = (l) => (before[l] ?? null) !== (traits?.[l] ?? null) || (l === 'siblings' && differs('top'));
    const changed = moving ? LAYERS.filter(differs) : [];
    const refigure = moving && (before.gender ?? null) !== (traits?.gender ?? null);
    shown.current = traits;

    if (!refigure && !changed.length) {
      if (!sized) { canvas.width = pw; canvas.height = ph; }
      const ready = isCached(pw, ph, opts);
      if (ready || full || animate) blit();
      else later(() => { if (run.current === id) blit(); }); // a thumbnail: paint it when there's room
      if (!fontsReady()) document.fonts.ready.then(() => { if (run.current === id) blit(); });
      return undefined;
    }

    // Brush the change on: a copy of the old picture, with the finished new one
    // showing through broad strokes (or, for a new figure, fading in under it).
    // The new photo is painted on the first frame, after the tap has shown.
    const [old, mask] = scratchPair(pw, ph);
    const go = old.getContext('2d');
    go.setTransform(1, 0, 0, 1, 0, 0);
    go.clearRect(0, 0, pw, ph);
    go.drawImage(canvas, 0, 0);
    const gm = mask.getContext('2d');
    let next = null;
    let start = 0;
    let last = -1;
    let raf = 0;
    const tick = (now) => {
      if (run.current !== id) return;
      if (!next) { next = cached(pw, ph, opts); start = performance.now(); }
      const t = Math.max(0, Math.min(1, (now - start) / BRUSH_MS)); // `now` can predate `start`
      const step = Math.floor((now - start) / HOLD_MS);
      if (t >= 1) { blit(next); return; }
      if (step !== last) {
        last = step;
        if (refigure) {
          blit(next);
          g.globalAlpha = (1 - t) ** 1.5;
          g.drawImage(old, 0, 0);
          g.globalAlpha = 1;
        } else {
          const e = 1 - (1 - t) ** 2;
          blit(old);
          for (const l of changed) {
            gm.setTransform(1, 0, 0, 1, 0, 0);
            gm.globalCompositeOperation = 'source-over';
            gm.clearRect(0, 0, pw, ph);
            frame(gm, pw, full);
            const [bx, by, bw, bh] = brushMask(gm, l, n, e);
            // the old answer fades under the strokes as they cross its box
            g.save();
            frame(g, pw, full);
            g.beginPath();
            g.rect(bx, by, bw, bh);
            g.clip();
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.globalAlpha = t;
            g.drawImage(next, 0, 0);
            g.restore();
            gm.setTransform(1, 0, 0, 1, 0, 0);
            gm.globalCompositeOperation = 'source-in';
            gm.drawImage(next, 0, 0);
            g.drawImage(mask, 0, 0);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
    // `key` stands for `traits`: a new object with the same answers is the same picture
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, n, w, h, full, figure, mystery, animate]);

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

/**
 * A guest standing, by id: the figure alone, `size` wide, for the Night app's
 * lounge. A ghost is the same figure, faded to grey.
 */
export function Figure({ traits, pid, size = 30, ghost = false, className = '' }) {
  return <Portrait traits={traits?.[pid]} seed={pid} size={size} figure ghost={ghost} rounded={0} className={className} />;
}
