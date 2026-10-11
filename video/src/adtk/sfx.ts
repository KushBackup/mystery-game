/**
 * sfx.ts — the sound design, as a list of events on the picture's cues.
 *
 * SOUND EFFECTS ONLY — NO MUSIC (the client's call; ask before adding a bed).
 * Every sound is tied to something on screen, so each one lands on the word or
 * the cut it illustrates. scripts/reel/synth.mjs synthesizes the instruments
 * (no samples, no licences, deterministic) and calls `arrange()`; mix.mjs then
 * lays the voiceover over it and ducks these effects under the voice.
 *
 * The house rules:
 *   every cut           a short whoosh peaking on the incoming frame (a new section louder)
 *   every pane arriving a thud (the split screens fill one word at a time)
 *   every caption       a soft key-strike as it lands
 *   every "!" XL word   a sub hit ON the spoken word
 *   tiles, stamps       a tick or a bell
 *   the knives          a boom + rip
 *   the brand / the CTA a boom, a thud, a bell
 *
 * Erasable TypeScript only (Node imports it).
 */

import { CAPTIONS, CUE, LAYERS, SHOTS } from "./timeline.ts";

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
    if (i > 0) x.whoosh(shot.from - 5, { gain: shot.section ? 0.24 : 0.12, len: 0.26 });
  });
  // A pane that lights up after its shot starts: a soft thud, panned to its side.
  LAYERS.filter((L) => L.lightAt > 0).forEach((L) => x.thud(L.from + L.lightAt, { gain: 0.32, pan: (L.x0 / 1920) * 1.2 - 0.4 }));

  // Every caption: a soft key-strike. Every extra-large word: a sub hit ON the word.
  CAPTIONS.forEach((c, ci) => {
    x.typeKey(Math.max(0, c.from), { gain: 0.12, pan: ci % 2 ? 0.2 : -0.2 });
    const lines = c.text.split(" / ");
    const xl = lines.findIndex((l) => l.startsWith("!"));
    if (xl >= 0) {
      const before = lines.slice(0, xl).join(" ").replace(/[*!]/g, "").split(/ +/).filter(Boolean).length;
      // The six game names come in a rapid run: lighter hits so they don't blur into one.
      const hook = ci < 6;
      x.kick(c.wordAt[Math.min(before, c.wordAt.length - 1)], { gain: hook ? 0.6 : 0.9, f0: hook ? 150 : 190, f1: 42, decay: hook ? 0.18 : 0.3 });
    }
  });

  // HOOK: a tick as each game tile lands; the "one at a time" walk; "all six" slams together.
  CUE.tiles.pops.forEach((p, i) => x.tick(p, { gain: 0.16, pan: -0.5 + i * 0.2 }));
  for (let i = 0; i < 6; i++) x.tick(Math.round(CUE.tiles.oneAt + ((CUE.tiles.timeAt + 8 - CUE.tiles.oneAt) * i) / 6), { gain: 0.08, tock: true, pan: -0.5 + i * 0.2 });
  x.boom(CUE.tiles.six, { gain: 0.7, len: 1.6 });

  // THREE OF YOU ARE KILLERS: a heartbeat under the faces, the knives land.
  x.heartbeat(CUE.killers.from + 2, { gain: 0.6 });
  [0, 3, 6].forEach((d) => x.rip(CUE.killers.hit + d, { gain: 0.3, len: 0.14 }));
  x.boom(CUE.killers.hit, { gain: 0.85, len: 2 });

  // The title.
  x.boom(CUE.title.hit, { gain: 0.6, len: 1.8 });

  // STEP 1: the phone lands; the role slot clicks on each name.
  x.whoosh(CUE.role.phoneIn - 4, { gain: 0.22, len: 0.32, from: 200, to: 1800 });
  x.thud(CUE.role.phoneIn + 10, { gain: 0.36 });
  CUE.role.slots.forEach((s, i) => x.typeKey(s, { gain: 0.26, pan: 0.3 + i * 0.05 }));

  // STEP 2: a heartbeat in the dark; the reticle locks.
  x.heartbeat(CUE.night.from + 4, { gain: 0.55 });
  x.riser(CUE.night.lock - 14, CUE.night.lock, { gain: 0.16 });
  x.bell(CUE.night.lock, { gain: 0.16, f: 880 });

  // STEP 3: the games pop; the board ticks, then the rig.
  CUE.games.pops.forEach((p, i) => x.bell(p + 1, { gain: 0.16, f: [1174.66, 1396.91, 1760][i] }));
  x.whoosh(CUE.board.from - 4, { gain: 0.2, len: 0.3 });
  x.thud(CUE.board.dies, { gain: 0.4 });
  x.scratch(CUE.board.rig, 0.36, { gain: 0.3 });
  for (let f = CUE.board.rig; f < CUE.board.rig + 12; f += 2) x.tick(f, { gain: 0.06, tock: f % 4 === 0, pan: 0.4 });

  // STEP 4: a chime as each clue photo lands.
  CUE.clues.cards.forEach((c, i) => x.bell(c + 1, { gain: 0.18, f: [1568, 1760, 2093][i] }));

  // STEP 5: the dead keep playing.
  x.boom(CUE.die, { gain: 0.7, len: 2 });
  x.riser(CUE.ghost.from, CUE.ghost.from + 30, { gain: 0.12 });

  // TWIST: three knives, one room; the question lands.
  [0, 3, 6].forEach((d) => x.rip(CUE.knives.hit + d, { gain: 0.32, len: 0.14 }));
  x.boom(CUE.knives.hit, { gain: 0.8, len: 2 });
  x.heartbeat(CUE.knives.room, { gain: 0.6 });
  x.riser(CUE.knives.room + 6, CUE.catchYou, { gain: 0.26 });
  x.boom(CUE.catchYou, { gain: 0.95, len: 2.4 });

  // BRAND: the name booms in, the logos thud in as they're said.
  x.boom(CUE.brand.title, { gain: 0.7, len: 2.2 });
  x.thud(CUE.brand.astral + 4, { gain: 0.34 });
  x.thud(CUE.brand.sidequest + 4, { gain: 0.34 });

  // EVENT: the card rises, each line lands, the button rings.
  x.whoosh(CUE.event.from - 5, { gain: 0.28, len: 0.35, from: 300, to: 2400 });
  x.boom(CUE.event.from, { gain: 0.6, len: 2.6 });
  [CUE.event.friday, CUE.event.date, CUE.event.place].forEach((p, i) => x.typeKey(p + 3, { gain: 0.2, pan: -0.2 + i * 0.2 }));
  x.bell(CUE.event.book, { gain: 0.28, f: 1174.66 });
  x.bell(CUE.event.book + 10, { gain: 0.14, f: 1760 });
};
