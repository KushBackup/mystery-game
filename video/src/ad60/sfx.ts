/**
 * sfx.ts — the sound design, as a list of events on the picture's cues.
 *
 * SOUND EFFECTS ONLY — NO MUSIC (the client's call; ask before adding a bed).
 * Every sound is tied to something on screen, so each one lands on the word or
 * the cut it illustrates. scripts/reel/synth.mjs synthesizes the instruments
 * (no samples, no licences, deterministic) and calls `arrange()`; mix.mjs then
 * lays the voiceover over it and ducks these effects under the voice.
 *
 * The house rules (keep them when you re-arrange):
 *   every cut           a short whoosh peaking on the incoming frame (a new section louder)
 *   every caption       a soft key-strike as it lands
 *   every "!" XL word   a sub hit ON the spoken word
 *   strikes, redactions a paper rip
 *   phone notifications a bell each, rising in pitch
 *   counters            a tick every other frame
 *   before a twist      heartbeats, then a riser into the biggest boom
 *   the brand / the CTA a boom, a thud, a bell
 *
 * Erasable TypeScript only (Node imports it).
 */

import { CAPTIONS, CUE, SHOTS } from "./timeline.ts";

type O = { gain?: number; pan?: number; len?: number; from?: number; to?: number; f0?: number; f1?: number; decay?: number; f?: number; tock?: boolean };
export type Sfx = {
  kick: (frame: number, o?: O) => void;
  boom: (frame: number, o?: O) => void;
  tick: (frame: number, o?: O) => void;
  typeKey: (frame: number, o?: O) => void;
  bell: (frame: number, o?: O) => void;
  rip: (frame: number, o?: O) => void;
  whoosh: (frame: number, o?: O) => void;
  thud: (frame: number, o?: O) => void;
  heartbeat: (frame: number, o?: O) => void;
  scratch: (frame: number, len?: number, o?: O) => void;
  riser: (from: number, to: number, o?: O) => void;
};

export const arrange = (x: Sfx) => {
  // Every cut: a short whoosh peaking on the incoming frame.
  SHOTS.forEach((shot, i) => {
    if (i > 0) x.whoosh(shot.from - 5, { gain: shot.section ? 0.26 : 0.14, len: 0.28 });
  });

  // Every caption: a soft key-strike. Every extra-large word: a sub hit ON the word.
  CAPTIONS.forEach((c, ci) => {
    x.typeKey(Math.max(0, c.from), { gain: 0.14, pan: ci % 2 ? 0.2 : -0.2 });
    const lines = c.text.split(" / ");
    const xl = lines.findIndex((l) => l.startsWith("!"));
    if (xl >= 0) {
      const before = lines.slice(0, xl).join(" ").replace(/[*!]/g, "").split(/ +/).filter(Boolean).length;
      x.kick(c.wordAt[Math.min(before, c.wordAt.length - 1)], { gain: 0.95, f0: 190, f1: 42, decay: 0.3 });
    }
  });

  // HOOK
  x.rip(CUE.strike, { gain: 0.55, len: 0.24 });
  x.boom(CUE.murder, { gain: 0.9, len: 2 });
  x.heartbeat(CUE.killerInRoom, { gain: 0.7 });

  // STEP 1: the phone lands, the redaction glitches open and slams shut.
  x.whoosh(CUE.role.phoneIn - 4, { gain: 0.26, len: 0.35, from: 200, to: 1800 });
  x.thud(CUE.role.phoneIn + 10, { gain: 0.4 });
  for (let f = CUE.role.peekOn; f < CUE.role.peekOff; f += 1) x.typeKey(f, { gain: 0.26, pan: (f % 2) - 0.5 });
  x.rip(CUE.role.peekOff, { gain: 0.4, len: 0.16 });

  // STEP 2: a chime as each notification drops in; the marker loop.
  CUE.clues.cards.forEach((c, i) => x.bell(c + 1, { gain: 0.18, f: [1568, 1760, 2093][i] }));
  x.scratch(CUE.notes.circle, 0.42, { gain: 0.26 });

  // STEP 4: the counters tick, a whoosh when the lead changes hands.
  x.whoosh(CUE.vote.panelIn - 4, { gain: 0.22, len: 0.3 });
  for (let f = CUE.vote.barsFrom; f < CUE.vote.overtake + 14; f += 2) x.tick(f, { gain: 0.05, tock: f % 4 === 0, pan: 0.4 });
  x.whoosh(CUE.vote.overtake - 3, { gain: 0.3, len: 0.3, from: 800, to: 5000 });

  // STEP 5: the truth lands on every phone.
  x.boom(CUE.reveal, { gain: 0.75, len: 2 });
  x.bell(CUE.reveal + 2, { gain: 0.22, f: 1760 });

  // TWIST: a heartbeat, a riser, the biggest hit on "you".
  x.heartbeat(CUE.twist.from + 2, { gain: 0.8 });
  x.riser(CUE.twist.from + 6, CUE.twist.youHit, { gain: 0.3 });
  x.boom(CUE.twist.youHit, { gain: 1, len: 2.4 });
  x.rip(CUE.twist.youHit, { gain: 0.5, len: 0.24 });

  // CTA: the question lands, the brand thuds in, the button rings.
  x.boom(CUE.end.from, { gain: 0.6, len: 2.2 });
  x.thud(CUE.end.mark + 6, { gain: 0.36 });
  x.bell(CUE.end.cta, { gain: 0.28, f: 1174.66 });
  x.bell(CUE.end.cta + 10, { gain: 0.14, f: 1760 });

  // EVENT: the card rises, each line lands, the logos ring it out.
  x.whoosh(CUE.event.from - 5, { gain: 0.3, len: 0.35, from: 300, to: 2400 });
  x.boom(CUE.event.from, { gain: 0.7, len: 2.6 });
  [0, 1, 2, 3, 4].forEach((i) => x.typeKey(CUE.event.from + 2 + i * 5 + 3, { gain: 0.22, pan: -0.2 + i * 0.1 }));
  x.bell(CUE.event.from + 2 + 6 * 5 + 4, { gain: 0.26, f: 1174.66 });
  x.bell(CUE.event.from + 2 + 6 * 5 + 14, { gain: 0.14, f: 1568 });
};
