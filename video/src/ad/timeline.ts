/**
 * timeline.ts — the 15s Meta promo's single clock.
 *
 * SOUND LEADS PICTURE. The soundtrack is synthesized by
 * `scripts/synth-promo-audio.ts`, which imports THIS file, so every cut, word
 * hit and redaction wipe below is also the frame a kick, click or boom lands on.
 * Move a number here and both the picture and the audio follow on the next
 * `npm run promo:audio`.
 *
 * Tempo is 120 BPM at 30fps: one beat = 15 frames, an eighth = 7.5. Every scene
 * cut sits on the beat grid. Keep this file free of anything but erasable
 * TypeScript (no enums, no namespaces) — Node runs it directly with type
 * stripping when it builds the audio.
 */

export const FPS = 30;
export const BEAT = 15;
export const TOTAL = 450; // 15.0s

/** Scene boundaries — [from, to). Hard cuts, all on the beat. */
export const SCENE = {
  hook: [0, 60],
  identity: [60, 135],
  riddle: [135, 180],
  trade: [180, 225],
  board: [225, 270],
  vote: [270, 330],
  twist: [330, 375],
  end: [375, 450],
} as const;

/** Hook — one word per eighth note, then the redaction slam. Absolute frames. */
export const HOOK = {
  words: [-3, 8, 15, 23], // first word is already mid-entrance on frame 0
  killerIn: 30,
  killerOpen: 36,
} as const;

/** Identity — absolute frames. */
export const IDENTITY = {
  phoneIn: 62,
  nameOpen: 80,
  secretOpen: 105,
  headSwap: 98,
} as const;

/** Riddle — letters of the answer type on these absolute frames. */
export const RIDDLE = {
  answer: "CANDLE",
  typeAt: [151, 154, 157, 160, 163, 166],
  unlock: 170,
} as const;

/** Trade — the code scrambles, flies along the thread, lands. Absolute frames. */
export const TRADE = {
  code: "NIGHTJAR",
  scrambleFrom: 186,
  scrambleTo: 198,
  flyFrom: 199,
  flyTo: 213,
  land: 213,
} as const;

/** Board — pin cards land, then the marker circles one. Absolute frames. */
export const BOARD = {
  pins: [228, 233, 238, 243],
  circle: 251,
} as const;

/** Vote — the lead changes hands at `overtake`. Absolute frames. */
export const VOTE = {
  railFrom: 272,
  barsFrom: 280,
  overtake: 304,
} as const;

/** Twist — "THE KILLER / COULD BE / YOU." Absolute frames. */
export const TWIST = {
  line1: 330,
  line2: 337,
  youIn: 345,
  youOpen: 350,
} as const;

/** End card — the brand lands, then holds clean for ~2s. Absolute frames. */
export const END = {
  kicker: 376,
  wordmark: 378,
  line: 388,
  cta: 392,
} as const;
