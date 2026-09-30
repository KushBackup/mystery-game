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

  // HOOK: a reticle locks per word; each lock is a tick-and-thud.
  CUE.reticles.locks.forEach((l, i) => {
    x.whoosh(l - 4, { gain: 0.12, len: 0.18, from: 1200, to: 4200 });
    x.thud(l + 3, { gain: 0.32 });
    x.tick(l + 3, { gain: 0.16, pan: [-0.4, 0, 0.4][i] });
  });
  // The stare: the room drops out to a single heartbeat under the breath.
  x.heartbeat(CUE.stare.from, { gain: 0.75 });
  x.boom(CUE.brand, { gain: 0.55, len: 1.6 });

  // STEP 1: the phone lands; each tap; the progress rush; the card flips, the reel spins, the redaction slams.
  x.whoosh(CUE.arrival.phoneIn - 4, { gain: 0.26, len: 0.35, from: 200, to: 1800 });
  x.thud(CUE.arrival.phoneIn + 10, { gain: 0.36 });
  CUE.arrival.taps.forEach((t, i) => x.bell(t, { gain: 0.12, f: [1318.5, 1568, 1760][i] }));
  x.whoosh(CUE.arrival.flip, { gain: 0.24, len: 0.3, from: 600, to: 3000 });
  for (let f = CUE.arrival.flip + 9; f < CUE.arrival.land; f += 2) x.tick(f, { gain: 0.07, tock: f % 4 === 0, pan: 0.2 });
  x.thud(CUE.arrival.land + 2, { gain: 0.5 });
  x.rip(CUE.arrival.land + 2, { gain: 0.35, len: 0.14 });

  // STEP 2: the lights stutter out; the blade; every phone at once.
  [0, 2, 4].forEach((d) => x.tick(CUE.night.fall + d, { gain: 0.12, tock: d === 2 }));
  x.boom(CUE.night.fall + 2, { gain: 0.35, len: 1.8 });
  x.whoosh(CUE.night.kill - 4, { gain: 0.4, len: 0.22, from: 2000, to: 9000 });
  x.rip(CUE.night.kill, { gain: 0.6, len: 0.2 });
  for (let i = 0; i < 8; i++) x.typeKey(CUE.dawn.phonesIn + (i % 4 + Math.floor(i / 4) * 2) * 2, { gain: 0.07, pan: (i % 4) / 2 - 0.75 });
  x.boom(CUE.dawn.light, { gain: 0.8, len: 2 });
  x.bell(CUE.dawn.light + 1, { gain: 0.22, f: 1760 });
  x.bell(CUE.dawn.light + 1, { gain: 0.14, f: 2637 });

  // STEP 3: a chime per clue; a marker scratch per loop.
  CUE.clues.cards.forEach((c, i) => x.bell(c + 1, { gain: 0.18, f: [1568, 1760, 2093][i] }));
  x.scratch(CUE.loops.glasses, 0.38, { gain: 0.26 });
  x.scratch(CUE.loops.shoes, 0.38, { gain: 0.26 });
  x.scratch(CUE.loops.drink, 0.38, { gain: 0.26 });

  // STEP 4: the counters tick, a whoosh as the lead changes; the card spins and lands.
  x.whoosh(CUE.vote.panelIn - 4, { gain: 0.22, len: 0.3 });
  for (let f = CUE.vote.barsFrom; f < CUE.vote.overtake + 14; f += 2) x.tick(f, { gain: 0.05, tock: f % 4 === 0, pan: 0.4 });
  x.whoosh(CUE.vote.overtake - 3, { gain: 0.3, len: 0.3, from: 800, to: 5000 });
  for (let f = CUE.reveal.spin; f < CUE.reveal.land; f += 3) x.whoosh(f, { gain: 0.08, len: 0.12, from: 900, to: 2600 });
  x.boom(CUE.reveal.land, { gain: 0.6, len: 1.6 });
  x.bell(CUE.reveal.land + 1, { gain: 0.2, f: 1174.66 });

  // STEP 5: the kill lands, the heart stops; the ghost rises.
  x.boom(CUE.killed, { gain: 0.7, len: 1.4 });
  x.heartbeat(CUE.killed + 8, { gain: 0.5 });
  x.riser(SHOTS.find((s) => s.key === "ghost")!.fx!.at, SHOTS.find((s) => s.key === "ghost")!.fx!.at + 40, { gain: 0.14 });

  // TWIST: the reticles again, a heartbeat, a riser, the biggest hit on "you".
  CUE.reticles2.locks.forEach((l) => x.thud(l + 3, { gain: 0.3 }));
  x.heartbeat(CUE.twist.from + 2, { gain: 0.8 });
  x.riser(CUE.twist.from + 4, CUE.twist.youHit, { gain: 0.3 });
  x.boom(CUE.twist.youHit, { gain: 1, len: 2.4 });
  x.rip(CUE.twist.youHit, { gain: 0.5, len: 0.24 });

  // CTA: the question lands, the brand thuds in, the button rings.
  x.boom(CUE.end.from, { gain: 0.6, len: 2.2 });
  x.thud(CUE.end.mark + 6, { gain: 0.36 });
  x.thud(CUE.end.mark2 + 4, { gain: 0.4 });
  x.bell(CUE.end.cta, { gain: 0.2, f: 1174.66 });

  // EVENT: each line lands on its spoken word; the button rings; the logos close it.
  x.whoosh(CUE.event.from - 5, { gain: 0.3, len: 0.35, from: 300, to: 2400 });
  x.boom(CUE.event.from, { gain: 0.55, len: 2.6 });
  x.typeKey(CUE.event.place + 3, { gain: 0.22, pan: -0.2 });
  x.thud(CUE.event.date + 3, { gain: 0.4 });
  x.typeKey(CUE.event.time + 3, { gain: 0.22, pan: 0.2 });
  x.bell(CUE.event.button, { gain: 0.28, f: 1174.66 });
  x.bell(CUE.event.button + 10, { gain: 0.14, f: 1760 });
  x.typeKey(CUE.event.button + 11, { gain: 0.16 });
};
