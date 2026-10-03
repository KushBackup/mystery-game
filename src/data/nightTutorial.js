/**
 * The Night tutorial: what the Night app shows the first time a guest opens
 * it in a game (before their move), and again from the "?" in its bar. The
 * user asked for it on 2026-10-03: nobody could tell what to do in Night. Like
 * the Word and Sketch tutorials, the Night app's own copy and Help, it is an
 * explicit exception to "players discover the game".
 *
 * Eight short hand-drawn clips (splash-film/night.html, shipped to
 * public/tutorial/night-N.mp4), then the ready card.
 *
 * Rules for every line here:
 *   1. Role-neutral. Every phone shows exactly these slides, in this order:
 *      it explains every role's move, so watching it gives nothing away about
 *      whose phone it is. Never "your role", never a slide only one role sees.
 *   2. True to the engine: engine/night.js (the poll, watchP, the clue, the
 *      Doctor's save and their rule, the trace, ghosts) and engine/morning.js
 *      (the rigged score sinks to the bottom of the board). `NIGHT` in
 *      killersCopy.js and the Help app say the same things at more length.
 *   3. Plain words, one idea a line, about 12 words a line.
 *   4. The clips' cast is the morning tutorials' (Ada, Ben, Cleo, Dev, Zed).
 *      Nobody in them is named as a Killer: the Killers are two hooded
 *      shadows, so no player reads a cast member's look as a hint.
 */

const BASE = import.meta.env?.BASE_URL ?? '/';
const clip = (n) => `${BASE}tutorial/night-${n}.mp4`;
const poster = (n) => `${BASE}tutorial/night-${n}.jpg`;

/** The film slides, in order. `title` is the big line, `line` the small one. */
export const FILM_SLIDES = Object.freeze([
  { id: 'fall', n: 1, title: 'Night falls. Everyone makes one secret move.', line: 'Open Night every night. Nobody else sees your screen.' },
  { id: 'killers', n: 2, title: 'The Killers vote on who to take.', line: 'At dawn, their pick’s score sinks to the bottom of the morning board.' },
  { id: 'watch', n: 3, title: 'Watch a guest.', line: 'If they sneak out to strike, you may see them. About 6 times in 10.' },
  { id: 'dig', n: 4, title: 'Or dig through the logs.', line: 'A sure clue photo at dawn: one answer the Killer gave when they arrived.' },
  { id: 'doctor', n: 5, title: 'The Doctor keeps one guest safe.', line: 'If the Killers chose them, they live. Never the same guest twice in a row.' },
  { id: 'trace', n: 6, title: 'The Detective traces two phones.', line: 'At dawn: did one of those two strike tonight? Yes or no.' },
  { id: 'ghost', n: 7, title: 'The dead still play.', line: 'Ghosts whisper one word to a living guest. Their clues are always true.' },
  { id: 'dawn', n: 8, title: 'Your result arrives at dawn.', line: 'No move? You dig through the logs. You can change your move until night ends.' },
].map((s) => ({ ...s, kind: 'film', clip: clip(s.n), poster: poster(s.n) })));

export const READY = Object.freeze({
  title: 'Your move is next.',
  // The first time: the guest's own move is behind this page.
  line: 'Only you see it. Keep your screen to yourself.',
  // From the "?": back to the move they were making.
  replayLine: 'Back to your move. The night is still running.',
});

/**
 * Warm the HTTP cache with the clips and posters, once per page, at low
 * priority (during the casting, and when the tutorial opens), so Night 1
 * never waits on the venue's wifi. Failures are ignored: the slides fall back
 * to posters, and then to their words.
 */
let warmed = false;
export function prefetchNightTutorial() {
  if (warmed || typeof fetch !== 'function') return;
  warmed = true;
  for (const s of FILM_SLIDES) {
    for (const url of [s.poster, s.clip]) fetch(url, { priority: 'low' }).catch(() => {});
  }
}
