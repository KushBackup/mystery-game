/**
 * timeline.ts — the 5s sample's edit as data. No VO: the words are timed at a
 * brisk ~2.6-4 words/s by hand, like the soundtrack-driven adfg reel.
 * Erasable TypeScript only (synth.mjs imports it with Node).
 */

export const FPS = 30;
export const TOTAL = 150;

/** Three shots: the world (hook), the block (punch), the plate (CTA). */
export const SHOTS = [
  { name: "world", from: 0, dur: 48, section: false },
  { name: "block", from: 48, dur: 52, section: true },
  { name: "plate", from: 100, dur: 50, section: true },
] as const;

/** Captions in absolute frames. Markup is the skill's: " / " break, *box*, "!" XL. */
export const CAPTIONS = [
  { text: "Same old / *Minecraft* world?", y: 520, from: -4, to: 48, wordAt: [-2, 6, 15, 24] },
  { text: "Build it / !*bigger.*", y: 560, from: 48, to: 100, wordAt: [48, 56, 66] },
] as const;

export const CUE = {
  punch: 66, // "bigger." lands: sub kick + red flash
  cta: 100, // CTA card: boom
  ctaWords: [100, 108, 117, 125], // "Your world, your rules."
  button: 128, // the button lands: thud + bells
  tap: 134,
} as const;
