/**
 * content.ts — every piece of fixed on-screen copy that is NOT a caption.
 * (Captions live in timeline.ts, because they are timed to the voiceover.)
 *
 * THE MURDER MYSTERY EXPERIENCE (the Traitors/Mafia format), 2026-09-27. FACT DISCIPLINE: only facts the user supplied or
 * that are true of the game (src/data/traits.js, src/data/packs/greenr.js,
 * src/data/killersCopy.js). No prices, counts, ratings or testimonials.
 */

/** The CTA card. The button text matches the Meta CTA button the user chose. */
export const BRAND = {
  /** The question that pays off the hook, as two lines; line 2 gets the highlight box. */
  question: ["Can you catch", "the Killers?"] as const,
  /** The lockup, as spoken: a small kicker, then two lines; line 2 is set in the accent. */
  kicker: "The",
  name: ["Murder Mystery", "Experience"] as const,
  by: "by",
  logo: "logo-astral.png",
  cta: "Book now",
  tap: "Tap below to book",
};

/** The event card (the last ~5.5s). Supplied by the user: Greenr, Panjim, Goa · 3 October · 6 PM. */
export const EVENT = {
  kicker: "Happening at",
  day: "Saturday",
  date: "3 October",
  time: "6 PM",
  place: "Greenr, Panjim, Goa",
  withLine: "In collaboration with",
  logoA: "logo-astral.png",
  logoB: "logo-greenr.png",
};

/** The arrival quiz: three of the six real questions (src/data/traits.js), and the answer tapped. */
export const QUIZ = [
  { q: "What colour is your top?", options: ["Black", "White", "Blue / navy", "Print"], pick: 0 },
  { q: "Are you wearing glasses?", options: ["Yes", "No"], pick: 0 },
  { q: "What's on your feet?", options: ["Sneakers", "Formal shoes", "Boots", "Heels"], pick: 0 },
] as const;

/** The slot reel on the role card: the game's real roles (src/data/killersCopy.js). */
export const ROLES = ["Faithful", "Doctor", "Killer", "Detective", "Faithful", "Doctor", "Killer", "Faithful"] as const;

/** Clue banners — real clue lines from the Greenr story pack, one per trait. */
export const CLUES = [
  { icon: "glasses", text: "A lens cloth, dropped beside the body." },
  { icon: "shoe", text: "Rubber-sole prints in the wet garden soil." },
  { icon: "drink", text: "A wine ring on the table where they stood." },
] as const;

/** The dawn screen on every phone. The name is always a redaction bar, never a real guest. */
export const DAWN = { kicker: "Dawn", line: "is gone." };

/** A live banishment tally: redacted names, values at [start, flip, end]. */
export const TALLY = {
  title: "Round table",
  ask: "Banish who?",
  rows: [
    { key: "a", name: 250, vals: [0, 9, 10] },
    { key: "b", name: 300, vals: [0, 7, 15] },
    { key: "c", name: 210, vals: [0, 4, 5] },
  ],
  max: 16,
};

/** The banishment reveal card: it spins between the two teams and lands on the Faithful (the room was wrong). */
export const REVEAL = { killer: "Killer", faithful: "Faithful", after: "The room was wrong." };
