/**
 * The ghost tutorial: what a guest's own phone shows right after SIGNAL LOST,
 * the first time they become a ghost (TakenScreen in os/takeovers.jsx), and
 * again from the Ghost topic in Help. The user asked for it on 2026-10-03:
 * ghosts could still play, but nothing told them how. Like the Night, Word
 * and Sketch tutorials, it is an explicit exception to "players discover the
 * game".
 *
 * Six short hand-drawn clips (splash-film/ghost.html, shipped to
 * public/tutorial/ghost-N.mp4), then the ready card.
 *
 * Rules for every line here:
 *   1. Only a ghost sees it, and every ghost sees the same slides whatever
 *      their role was: never "your team", never a Killer-only line.
 *   2. True to the engine: engine/night.js (each ghost's nightly true clue,
 *      the whisper, the pass, which only carries a photo the ghost holds),
 *      last words (one photo posted to the Room on the day a guest is taken)
 *      and ghost sight (Photos → The Room, every clue the living got),
 *      morning.js (the ghost board), the Endgame votes, firestore.rules (the
 *      dead read the Room but can't post; Spirits is theirs). Help's Ghost
 *      topic and NIGHT.moves.pass/whisper in killersCopy.js say the same.
 *   3. Plain words, one idea a line, about 12 words a line.
 *   4. The clips' cast is the other tutorials' (Ada, Cleo, Dev, Zed). Zed is
 *      the ghost; nobody's death is shown.
 */

const BASE = import.meta.env?.BASE_URL ?? '/';
const clip = (n) => `${BASE}tutorial/ghost-${n}.mp4`;
const poster = (n) => `${BASE}tutorial/ghost-${n}.jpg`;

/** The film slides, in order. `title` is the big line, `line` the small one. */
export const FILM_SLIDES = Object.freeze([
  { id: 'rise', n: 1, title: 'Welcome to the spirit world.', line: 'You were killed, but you’re still in the game. Your side can still win.' },
  { id: 'mute', n: 2, title: 'The living can’t hear you.', line: 'You can read the Room, but not post. Except once: on the morning you’re killed, post one photo there.' },
  { id: 'truth', n: 3, title: 'Every night, a true clue photo.', line: 'Ghost photos never lie. In Photos, The Room shows every clue the living got.' },
  { id: 'pass', n: 4, title: 'Pass a photo to a living guest.', line: 'Open Night, pick a photo, then a guest. Or whisper them one word.' },
  { id: 'spirits', n: 5, title: 'Plot with the dead in Spirits.', line: 'Spirits is in Messages. Only ghosts can read it.' },
  { id: 'play', n: 6, title: 'Keep playing every morning.', line: 'Your scores go on a ghost board. In the final votes, the dead vote too.' },
].map((s) => ({ ...s, kind: 'film', clip: clip(s.n), poster: poster(s.n) })));

export const READY = Object.freeze({
  title: 'Haunt them well.',
  line: 'Night lights up after dark. Your first move is waiting there.',
  replayLine: 'Back to your haunted phone.',
});

/**
 * Warm the HTTP cache with the clips and posters, once per page, at low
 * priority, so a death never waits on the venue's wifi. Failures are ignored:
 * the slides fall back to posters, and then to their words.
 */
let warmed = false;
export function prefetchGhostTutorial() {
  if (warmed || typeof fetch !== 'function') return;
  warmed = true;
  for (const s of FILM_SLIDES) {
    for (const url of [s.poster, s.clip]) fetch(url, { priority: 'low' }).catch(() => {});
  }
}
