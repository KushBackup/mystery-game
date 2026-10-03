/**
 * The Word tutorial: what DEEP BLUE shows in the longer alarm of the first
 * Word morning, before the cards are dealt (engine/minigames.js introDay), and
 * again from the "?" in the game. The user asked for it on 2026-10-03: the
 * first game was badly explained, so the room should see what to do, and why,
 * right before playing it. Like the Night and Help apps, it is an explicit
 * exception to "players discover the game".
 *
 * Six short hand-drawn clips (splash-film/word.html, shipped to
 * public/tutorial/), then a practice wall, then the ready card.
 *
 * Rules for every line here:
 *   1. Role-neutral. Every phone shows exactly these slides, so a glance at a
 *      neighbour's phone says nothing about them.
 *   2. True to the engine: scoreWordDay and spoils (minigames.js), and the
 *      board's premise (morning.js; Help's "The board" page).
 *   3. Plain words, one idea a line, about 12 words a line.
 *   4. The example is never a live pair, word or hint. If POPCORN were in a
 *      pack's `wordPairs`, the tutorial would hand Killers the word on that
 *      day; if a live pair's hint were "A snack", a Killer shown it would think
 *      of popcorn and give themselves away. The dev check at the bottom names
 *      any collision. Help uses the same
 *      example (helpCopy.js, HelpSketch.jsx `word`).
 *   5. The practice wall is the wall in clips 4 and 5. Change them together.
 */

const BASE = import.meta.env?.BASE_URL ?? '/';
const clip = (n) => `${BASE}tutorial/word-${n}.mp4`;
const poster = (n) => `${BASE}tutorial/word-${n}.jpg`;

/** The tutorial's example. Killers would see the hint; everyone else the word. */
export const TUTORIAL_PAIR = Object.freeze({ word: 'Popcorn', hint: 'A snack' });

/** The film slides, in order. `title` is the big line, `line` the small one. */
export const FILM_SLIDES = Object.freeze([
  { id: 'wake', n: 1, title: 'Today’s game: WORD', line: 'Everyone plays. It takes two minutes.' },
  { id: 'cards', n: 2, title: 'Most of you get a secret word.', line: 'Killers only get a hint, so they have to fake it.' },
  { id: 'write', n: 3, title: 'Post one word that fits.', line: 'Never the word itself. That scores 0.' },
  { id: 'wall', n: 4, title: 'Every clue lands on one wall, in order.', line: 'Everyone can see who posted, and who waited.' },
  { id: 'pick', n: 5, title: 'Then pick the 3 clues that fit best.', line: 'A fair clue scores 100, plus 50 for every pick.' },
  { id: 'board', n: 6, title: 'The lowest score on the board dies.', line: 'Skip the game and you score 0.' },
].map((s) => ({ ...s, kind: 'film', clip: clip(s.n), poster: poster(s.n) })));

/**
 * The practice wall, in the order the clues landed. `fake` is the one
 * written by someone who only saw the hint. Nothing here is saved.
 */
export const PRACTICE = Object.freeze({
  title: 'Your turn. The word is POPCORN.',
  line: 'Tap the 3 clues that fit it best.',
  notes: [
    { id: 'cinema', clue: 'Cinema', why: 'Where you eat it.' },
    { id: 'butter', clue: 'Butter', why: 'What goes on top.' },
    { id: 'microwave', clue: 'Microwave', why: 'How you make it.' },
    { id: 'kernel', clue: 'Kernel', why: 'What it pops from.' },
    { id: 'crunchy', clue: 'Crunchy', why: 'Crunchy fits any snack. Did they know the word?', fake: true },
  ],
  // Shown once three are picked.
  doneClean: 'Nobody needed Crunchy. It came last, and it fits any snack.',
  doneFooled: 'Crunchy came last, and it fits any snack.',
  reveal: 'It was written by someone who only saw “A snack”.',
});

export const READY = Object.freeze({
  title: 'That’s it.',
  // The intro: the cards are still to come. {t} is the countdown.
  line: 'Your card arrives soon. Tap it to peek, and keep it to yourself.',
  // From the "?" in a running game.
  replayLine: 'Back to the game. The clock is still running.',
});

export const SLIDE_COUNT = FILM_SLIDES.length + 2;

/**
 * Warm the HTTP cache with the six clips and posters, once per page, at low
 * priority (night 1, and when the tutorial opens). The alarm then never waits
 * on the venue's wifi. Failures are ignored: the slides fall back to posters,
 * and then to their words.
 */
let warmed = false;
export function prefetchTutorial() {
  if (warmed || typeof fetch !== 'function') return;
  warmed = true;
  for (const s of FILM_SLIDES) {
    for (const url of [s.poster, s.clip]) fetch(url, { priority: 'low' }).catch(() => {});
  }
}

// Dev only: the example must never be a word a Killer could be playing for.
if (import.meta.env?.DEV) {
  import('./packs/index.js')
    .then(({ PACKS, dayKit }) => {
      const same = (a, b) => a.toLowerCase() === b.toLowerCase();
      const hit = Object.values(PACKS).filter((p) => dayKit(p).wordPairs.some((w) => same(w.word, TUTORIAL_PAIR.word) || same(w.hint, TUTORIAL_PAIR.hint)));
      if (hit.length) console.error(`[wordTutorial] "${TUTORIAL_PAIR.word}" / "${TUTORIAL_PAIR.hint}" collides with a live word pair in: ${hit.map((p) => p.id).join(', ')}. Change the tutorial's example.`);
    })
    .catch(() => {});
}
