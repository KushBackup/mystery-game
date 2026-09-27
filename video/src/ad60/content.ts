/**
 * content.ts — every piece of fixed on-screen copy that is NOT a caption.
 * (Captions live in timeline.ts, because they are timed to the voiceover.)
 *
 * WORKED EXAMPLE values: the Astral Project murder-mystery ad, 2026-09-26.
 * FACT DISCIPLINE: only put facts here the user supplied or that are true of
 * the product. No invented prices, dates, counts, ratings or testimonials.
 */

/** The CTA card, and the reveal line on the drawn phone. */
export const BRAND = {
  /** The question that pays off the hook, as two lines; line 2 gets the highlight box. */
  question: ["Can you catch", "the killer?"] as const,
  kicker: "Astral Project’s",
  /** The wordmark, two words; word 2 is set in the accent. */
  name: ["Murder", "Mystery"] as const,
  cta: "Book your night",
  tap: "Tap below to book",
  /** What the phone's redaction glitches open to (the "you might be…" tease). */
  roleReveal: "THE KILLER",
};

/** The event card (the last ~5s). Logos are transparent PNGs in public/<ASSET_DIR>/, cropped to content. */
export const EVENT = {
  kicker: "Next game night",
  day: "Saturday",
  date: "3 October",
  time: "6 PM – 9 PM",
  place: "Greenr, Panjim, Goa",
  withLine: "In collaboration with",
  logoA: "logo-astral.png",
  logoB: "logo-greenr.png",
};

/** Notification banners for a "things arrive on your phone" beat. Invented, product-true. */
export const CLUE_LINES = ["The killer arrived before you did.", "The killer has never lost at cards.", "The killer is sitting near you."];

/** A live tally: bar-name widths (redacted names, never real people) and values at [start, flip, end]. */
export const TALLY = {
  rows: [
    { key: "a", name: 250, vals: [0, 9, 10] },
    { key: "b", name: 300, vals: [0, 7, 15] },
    { key: "c", name: 210, vals: [0, 4, 5] },
  ],
  max: 16,
};
