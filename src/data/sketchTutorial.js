/**
 * The Sketch tutorial: what DEEP BLUE shows in the longer alarm of the first
 * Sketch morning, before the pens come out (engine/minigames.js introDay), and
 * again from the "?" in the game. The user asked for it on 2026-10-03: the
 * second game was badly explained, so the room should see what to do, and
 * why, right before playing it. Like Word's tutorial, the Night app and Help,
 * it is an explicit exception to "players discover the game".
 *
 * Six short hand-drawn clips (splash-film/sketch.html, shipped to
 * public/tutorial/), then a guess practice (the user's pick), then the ready
 * card.
 *
 * Rules for every line here:
 *   1. Role-neutral. Every phone shows exactly these slides. Sketch has no
 *      role in it at all: every living guest, Killers too, draws their own word.
 *   2. True to the engine: scoreDrawDay, DRAW_SHOW_MS, DRAW_ASSIGN and the
 *      step lengths (minigames.js), and the top-three reward (morning.js; the
 *      Word tutorial's last slide says the same).
 *   3. Plain words, one idea a line, about 12 words a line.
 *   4. The tutorial's words (Teapot, Penguin, Cupcake, Windmill) are in no
 *      pack's `drawWords`, so nobody is handed a drawing they already practised.
 *      The dev check at the bottom names any collision.
 *   5. The practice teapot is Ada's teapot in clips 2 and 3 (splash-film/sketch-clips.js
 *      TEAPOT). Change them together.
 */

import { DRAW_ASSIGN, DRAW_SHOW_MS, STEPS } from '../lib/engine/minigames.js';
import { encode } from '../os/game/strokes.js';

const BASE = import.meta.env?.BASE_URL ?? '/';
const clip = (n) => `${BASE}tutorial/sketch-${n}.mp4`;
const poster = (n) => `${BASE}tutorial/sketch-${n}.jpg`;

const DRAW_S = STEPS.draw[0][1];

/** The words the clips draw. None may be a live draw word. */
export const TUTORIAL_WORDS = Object.freeze(['Teapot', 'Penguin', 'Cupcake', 'Windmill']);

/** The film slides, in order. `title` is the big line, `line` the small one. */
export const FILM_SLIDES = Object.freeze([
  { id: 'wake', n: 1, title: 'Today’s game: SKETCH', line: 'Everyone plays. It takes about two minutes.' },
  { id: 'cards', n: 2, title: 'Everyone gets a different secret word.', line: 'Killers too. Keep yours to yourself.' },
  { id: 'draw', n: 3, title: `Draw it. You have ${DRAW_S} seconds.`, line: 'No letters, no numbers. Just draw.' },
  { id: 'guess', n: 4, title: 'Then guess other people’s drawings.', line: 'Type what you see. The faster you get it, the more it scores.' },
  { id: 'score', n: 5, title: 'Your drawing scores too.', line: '+30 every time someone guesses it. Draw clearly.' },
  { id: 'top', n: 6, title: 'The top 3 each win a clue photo.', line: 'Nobody is killed in the morning game. Play well to win a clue.' },
].map((s) => ({ ...s, kind: 'film', clip: clip(s.n), poster: poster(s.n) })));

// --- The practice drawing --------------------------------------------------------------

/** A wobbly loop, the way a finger draws one: points round an ellipse from `a0` to `a1` (radians). */
function loop(cx, cy, rx, ry, a0, a1, step = 0.12, wob = 1.6, seed = 1) {
  const pts = [];
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const w = Math.sin(a * 5 + seed) * wob + Math.sin(a * 11 + seed * 3) * wob * 0.5;
    pts.push([cx + Math.cos(a) * (rx + w), cy + Math.sin(a) * (ry + w)]);
  }
  return pts;
}

/** A line through `pts`, filled in every few units. */
function line(pts, every = 5) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / every));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

const PI = Math.PI;
const TEAPOT_STROKES = [
  // Body, lid, knob, base.
  { ink: 0, points: loop(126, 156, 64, 50, -PI * 0.92, PI * 1.06, 0.12, 1.8, 2) },
  { ink: 0, points: loop(126, 108, 40, 16, PI, PI * 2, 0.16, 1, 4) },
  { ink: 0, points: line([[84, 110], [168, 108]]) },
  { ink: 0, points: loop(126, 86, 8, 7, 0, PI * 2, 0.4, 0.6, 1) },
  { ink: 0, points: line([[92, 204], [96, 212], [158, 212], [162, 203]]) },
  // Spout and handle.
  { ink: 0, points: line([[184, 140], [206, 128], [226, 104], [236, 98], [232, 112], [214, 140], [190, 176]], 4) },
  { ink: 0, points: line([[68, 126], [48, 124], [36, 140], [40, 164], [56, 176], [70, 178]], 4) },
  // A blue band and its dots.
  { ink: 2, points: line([[70, 150], [100, 160], [126, 162], [152, 160], [184, 150]], 4) },
  { ink: 2, points: loop(104, 178, 3, 3, 0, PI * 2, 0.8, 0.2, 1) },
  { ink: 2, points: loop(130, 182, 3, 3, 0, PI * 2, 0.8, 0.2, 2) },
  { ink: 2, points: loop(156, 178, 3, 3, 0, PI * 2, 0.8, 0.2, 3) },
  // Steam.
  { ink: 2, points: line([[234, 86], [228, 74], [238, 62], [230, 48]], 3) },
  { ink: 2, points: line([[218, 84], [214, 74], [222, 64]], 3) },
];

/** The practice guess: a teapot, drawn the way a guest might draw it with a finger. Nothing is saved. */
export const PRACTICE = Object.freeze({
  title: 'Your turn. What is this?',
  line: 'Type your guess. The faster, the more it scores.',
  by: 'Ben',
  strokes: encode(TEAPOT_STROKES),
  // Any form scores (minigames.js matchesWord). The first is what the reveal says.
  answer: 'Teapot/tea pot/kettle/pot',
  showMs: DRAW_SHOW_MS,
  right: (n) => `Correct! +${n}`,
  rightLine: `In the game you get up to ${DRAW_ASSIGN} of these.`,
  timeUp: 'Time! It was a TEAPOT.',
  again: 'Try again',
});

export const READY = Object.freeze({
  title: 'That’s it.',
  // The intro: the word is still to come.
  line: 'Your word arrives soon. Draw fast, guess faster.',
  // From the "?" in a running game.
  replayLine: 'Back to the game. The clock is still running.',
});

/**
 * Warm the HTTP cache with the six clips and posters, once per page, at low
 * priority (the night before, and when the tutorial opens). The alarm then
 * never waits on the venue's wifi. Failures are ignored: the slides fall back
 * to posters, and then to their words.
 */
let warmed = false;
export function prefetchSketchTutorial() {
  if (warmed || typeof fetch !== 'function') return;
  warmed = true;
  for (const s of FILM_SLIDES) {
    for (const url of [s.poster, s.clip]) fetch(url, { priority: 'low' }).catch(() => {});
  }
}

// Dev only: no tutorial word may be a word someone could be dealt.
if (import.meta.env?.DEV) {
  import('./packs/index.js')
    .then(({ PACKS, dayKit }) => {
      const forms = (w) => w.split('/').map((x) => x.trim().toLowerCase());
      const ours = TUTORIAL_WORDS.map((w) => w.toLowerCase());
      const hit = Object.values(PACKS).filter((p) => dayKit(p).drawWords.some((w) => forms(w).some((f) => ours.includes(f))));
      if (hit.length) console.error(`[sketchTutorial] a tutorial word (${TUTORIAL_WORDS.join(', ')}) is a live draw word in: ${hit.map((p) => p.id).join(', ')}. Change the tutorial's words.`);
    })
    .catch(() => {});
}
