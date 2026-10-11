/**
 * content.ts — every piece of fixed on-screen copy that is NOT a caption.
 * (Captions live in timeline.ts, because they are timed to the voiceover.)
 *
 * THREE KNIVES OUT, 2026-10-11. FACT DISCIPLINE: only facts the user supplied
 * or that are true of the game (src/data/killersCopy.js, helpCopy.js). No
 * prices, counts of guests, ratings or testimonials. The leaderboard and clue
 * cards are illustrative and every name on them is a redaction bar.
 */

/** The six games the night pays homage to (the user's list), in the order spoken. */
export const GAMES = [
  { key: "mafia", label: "Mafia" },
  { key: "among", label: "Among Us" },
  { key: "under", label: "Undercover" },
  { key: "pict", label: "Pictionary" },
  { key: "flappy", label: "Flappy Bird" },
  { key: "cluedo", label: "Cluedo" },
] as const;

/** The game's public name (the user's call, 2026-10-11) and its partners. */
export const BRAND = {
  name: "Three Knives Out",
  by: "by",
  logoA: "logo-astral.png",
  logoB: "logo-sidequest.png",
};

/** The role card: the game's real roles (src/data/killersCopy.js). */
export const ROLES = ["Killer", "Doctor", "Detective"] as const;

/** The morning board: redacted names, scores. Row `target` is rigged to the bottom on "rig". */
export const BOARD = {
  title: "This morning",
  rows: [
    { name: 230, score: 940 },
    { name: 190, score: 810 },
    { name: 260, score: 720 },
    { name: 210, score: 560 },
    { name: 170, score: 380 },
  ],
  target: 1,
  lowest: "Lowest",
};

/** Clue banners as they arrive on a phone. */
export const BANNERS = ["New clue photo", "New clue photo", "New clue photo"] as const;

/** The event card (the last ~6.5s). Supplied by the user: Backroom, Anjuna · Friday 16 October · with SideQuest Club. No time, on purpose. */
export const EVENT = {
  kicker: "Live game night",
  day: "Friday",
  date: "16 October",
  place: "Backroom, Anjuna",
  withLine: "Astral Project × SideQuest Club",
  cta: "Book now",
  logoA: "logo-astral.png",
  logoB: "logo-sidequest.png",
};
