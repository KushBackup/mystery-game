/**
 * theme.ts — the single source of truth for colour and type.
 *
 * Every token below is lifted verbatim from the `:root` block of
 * ../pitch-deck/index.html so the film and the deck are provably the same
 * design system. Do not add colours here. Do not improvise new ones in scenes.
 *
 * PALETTE RULES (enforced by review, not by code):
 *   red   — the ONLY hot accent. Tags, rules, threads, emphasis. Never a gradient.
 *   amber — numerals and data ONLY. Never body text.
 *   bone  — paper and primary text. Never pure white.
 *   No purple, no teal, no second accent, no glassmorphism.
 */

import { loadFont as loadDisplayFont } from "@remotion/google-fonts/BigShoulders";
import { loadFont as loadReadFont } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";

export const C = {
  ink: "#0C0D0F", // canvas
  ink2: "#141518", // raised panel
  ink3: "#1C1E22", // phone bezel / table stripe
  bone: "#EDE7DA", // paper + primary text on ink
  bone2: "#D8D0BF", // aged paper
  red: "#E03127", // THE accent
  redDeep: "#8E1811", // accent on bone surfaces
  amber: "#D8A33C", // numerals and data ONLY
  dim: "rgba(237,231,218,.62)", // secondary text on ink
  dim2: "rgba(237,231,218,.42)", // tertiary text on ink
  line: "rgba(237,231,218,.16)", // hairline on ink
  line2: "rgba(237,231,218,.08)", // faint hairline on ink
  lineB: "rgba(12,13,15,.22)", // hairline on bone
  boneBody: "#4A453C", // body text on bone paper
  boneMeta: "#5A544A", // meta text on bone paper
} as const;

/**
 * FONT LOADING
 *
 * `loadFont()` from @remotion/google-fonts calls `delayRender()` internally and
 * only calls `continueRender()` once the FontFace has actually loaded, so no
 * frame — including frame 0 — can ever render in a fallback font.
 *
 * TRAP: the @remotion/google-fonts export is `BigShoulders`, NOT
 * `BigShouldersDisplay`. Google renamed the family "Big Shoulders Display" to
 * "Big Shoulders"; the package tracks the new name. The deck's CSS lists both
 * (`'Big Shoulders Display','Big Shoulders'`) which is why they render alike.
 *
 * Weights and subsets are always specified explicitly — required in Remotion v5
 * and it keeps the render fast by not fetching all 9 weights of every family.
 */
const display = loadDisplayFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});
const readNormal = loadReadFont("normal", {
  weights: ["300", "400"],
  subsets: ["latin"],
});
const readItalic = loadReadFont("italic", {
  weights: ["300", "400"],
  subsets: ["latin"],
});
const mono = loadMonoFont("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

// `readItalic` is loaded for its side effect (the italic FontFace); the family
// name is identical to the normal style, so only one reference is needed.
void readItalic;

export const F = {
  /** Big Shoulders — ALL headlines, ALL numerals. Uppercase, tight tracking. */
  disp: display.fontFamily,
  /** Newsreader — narrative body and pull quotes. Italic is the emphasis vehicle. */
  read: readNormal.fontFamily,
  /** IBM Plex Mono — every label, kicker, tag, timestamp, chrome element. */
  mono: mono.fontFamily,
} as const;

/** Headline style base. Sizes are always passed per-scene. */
export const dispStyle = (size: number, weight: 700 | 800 = 800) =>
  ({
    fontFamily: F.disp,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 0.88,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    color: C.bone,
  }) as const;

/** Narrative body. `italic` is the emphasis vehicle, never bold. */
export const readStyle = (size: number, weight: 300 | 400 = 300) =>
  ({
    fontFamily: F.read,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1.5,
    color: C.dim,
  }) as const;

/** Mono chrome: labels, kickers, tags, timestamps. Uppercase, wide tracking. */
export const monoStyle = (size: number, tracking = 0.24) =>
  ({
    fontFamily: F.mono,
    fontWeight: 500,
    fontSize: size,
    letterSpacing: `${tracking}em`,
    textTransform: "uppercase",
  }) as const;
