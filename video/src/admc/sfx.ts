/**
 * sfx.ts — sound effects only, no music (the house rule). Each sound is tied
 * to something on screen. Erasable TypeScript only.
 */

import { CAPTIONS, CUE, SHOTS } from "./timeline.ts";

type O = { gain?: number; pan?: number; len?: number; f?: number; f0?: number; f1?: number; decay?: number };
type Fn = (frame: number, o?: O) => void;
export type Sfx = { kick: Fn; boom: Fn; typeKey: Fn; bell: Fn; whoosh: Fn; thud: Fn; riser: (from: number, to: number, o?: O) => void };

export const arrange = (x: Sfx) => {
  // Every cut: a whoosh peaking on the incoming frame, louder into a new section.
  SHOTS.forEach((s, i) => {
    if (i > 0) x.whoosh(s.from - 5, { gain: s.section ? 0.26 : 0.14, len: 0.28 });
  });
  // Every caption word lands with a soft key-strike.
  CAPTIONS.forEach((c, ci) => c.wordAt.forEach((f, wi) => x.typeKey(Math.max(0, f), { gain: 0.14, pan: (ci + wi) % 2 ? 0.2 : -0.2 })));
  CUE.ctaWords.forEach((f, i) => x.typeKey(f, { gain: 0.14, pan: i % 2 ? 0.2 : -0.2 }));
  // The XL punch word: a sub hit ON the word, with a short riser into it.
  x.riser(CUE.punch - 14, CUE.punch, { gain: 0.25 });
  x.kick(CUE.punch, { gain: 0.95, f0: 190, f1: 42, decay: 0.3 });
  // The CTA: a boom, then the button thuds in and rings two bells.
  x.boom(CUE.cta, { gain: 0.8, len: 1.6 });
  x.thud(CUE.button, { gain: 0.5 });
  x.bell(CUE.button + 2, { gain: 0.22, f: 1174 });
  x.bell(CUE.button + 6, { gain: 0.18, f: 1760 });
};
