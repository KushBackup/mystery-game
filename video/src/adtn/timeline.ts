/**
 * timeline.ts — the reel, timed to the voiceover. THE file you edit per ad.
 *
 * KILLERS NIGHT × Greenr, Panjim (Saturday 3 October, 6 PM). Built from the
 * footage-reel-ad template; every mechanism below is the template's.
 *
 * THE VOICEOVER IS THE CLOCK. public/<assets>/vo.mp3 is transcribed by
 * scripts/reel/transcribe.mjs into ./voWords.ts (every word's start/end + the
 * silences between phrases). Everything below derives from it:
 *
 *   CAPTIONS  the on-screen script. Each caption is aligned to the VO in order
 *             (a warning prints if its words don't match what is said), appears
 *             LEAD frames before its phrase (snapped to the end of the silence
 *             before it), and every word pops WORD_LEAD frames before it is
 *             spoken. If a cut lands in the silence just before a phrase, the
 *             caption starts ON the cut, so captions change with the picture.
 *   SHOTS     the footage, cut on phrase starts, at REAL SPEED. A clip is never
 *             longer than its uncut shot in the master, so a long line gets a
 *             second shot (the `sec()` starts). footage.ts says where each clip
 *             comes from; scripts/reel/cut.mjs cuts it to exactly the length
 *             the timeline needs.
 *   KEEP-CLEAR  captions NEVER sit on people's heads or on important things.
 *             Every shot lists its `clear` bands (read off the probe sheets);
 *             every graphic that matters is in OVERLAY_CLEAR. checkCaptions()
 *             tests every caption against both, on every frame, with the exact
 *             lens move applied (lens.ts). The studio console, check.mjs and
 *             the render gate all run it; the SafeZone composition draws it.
 *
 * Caption markup: " / " breaks a line, *segment* gets the red highlight box
 * (it grows word by word with the voice), a line starting with "!" is set
 * extra large (punch words). The TEXT must match the spoken words.
 *
 * FACT DISCIPLINE — nothing here names a price, a count of guests, a rating or
 * a testimonial. Event details come only from the client.
 *
 * Erasable TypeScript only (no enums/namespaces; `import type` for types):
 * Node imports this file directly for the checks and the sound design.
 */

import { GAPS, WORDS } from "./voWords.ts";
import { PUSH, lensScale, onScreen, originPx } from "./lens.ts";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** A caption appears this many frames before its first word is spoken. */
const LEAD = 3;
/** Each word pops this many frames before it is spoken, so it is readable on the syllable. */
const WORD_LEAD = 2;
/** A free cut this close before a caption pulls the caption onto the cut. */
const SNAP = 10;
/** Minimum gap (px) between text and anything it must keep clear of. Generous: probe readings are ±15px. */
export const MARGIN = 24;

export const sec = (s: number) => Math.round(s * FPS);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Start (s) of the first spoken `word` at or after `after` seconds. */
export const w = (word: string, after = 0) => {
  const hit = WORDS.find((x) => x.s >= after - 0.01 && norm(x.w) === norm(word));
  if (!hit) throw new Error(`VO word not found: ${word} after ${after}s`);
  return hit.s;
};

/** A phrase begins where the speech resumes: snap to a silence's end within 0.5s. */
const phraseStart = (s: number) => {
  let best = s;
  let dist = 0.5;
  for (const [, end] of GAPS) {
    const d = Math.abs(end - s);
    if (d < dist) {
      dist = d;
      best = end;
    }
  }
  return best;
};

// ------------------------------------------------------------ caption type ---

/** Caption type sizes. kit.tsx renders with these; the keep-clear check measures with them. */
export const CAPTION = { m: 90, xl: 236, lineM: 90 * 1.1, lineXl: 236 * 0.98 + 16 } as const;

// ---------------------------------------------------------------- captions ---

/** `scale` shrinks the whole caption (both line sizes) to fit a tight free band — e.g. 0.9 for a punch word over a close-up. */
type CapSpec = { text: string; y: number; align?: "left" | "center"; scale?: number };

/**
 * `y` is the caption block's vertical centre. Choose it from the shot's
 * keep-clear bands: the caption must fit in a FREE band of the 270–1232 safe
 * box. Vary it beat to beat (top / bottom), but never onto a face.
 */
const CAP_SPECS: CapSpec[] = [
  // HOOK — A (Mafia, a table of friends), B (the whole room: the topic by 2.5s), the open loop (three Killers).
  { text: "Ever played *Mafia* / with your friends?", y: 390 },
  { text: "Now the / *whole room* / plays.", y: 460 },
  { text: "And three of them / are *Killers.*", y: 470 },
  // WHAT
  { text: "This is / *Killers Night,*", y: 440 },
  { text: "a live party game / on *your phone.*", y: 470 },
  { text: "Here's how / it *works.*", y: 845, align: "left" },
  // HOW 1 — arrive, answer, get a role
  { text: "*Walk in,*", y: 760 },
  { text: "answer six / *quick questions,*", y: 500 },
  { text: "and get a / *secret role.*", y: 500 },
  // HOW 2 — the night, the dawn
  { text: "At *night,*", y: 560 },
  { text: "the Killers / !*Kill.*", y: 560 },
  { text: "Every phone shows / *who died,*", y: 480 },
  { text: "at the / *same second.*", y: 480 },
  // HOW 3 — the clues are about real people
  { text: "Then the / *clues drop,*", y: 480 },
  { text: "and they're about / *real people.*", y: 474 },
  { text: "!*Glasses.*", y: 470, scale: 0.7 },
  { text: "!*Shoes.*", y: 490, scale: 0.9 },
  { text: "The drink / in *their hand.*", y: 820 },
  { text: "So you / !*Look.*", y: 850, scale: 0.75 },
  { text: "You / !*Ask.*", y: 1000, scale: 0.9 },
  { text: "You / !*Bluff.*", y: 531, scale: 0.9 },
  // HOW 4 — the round table
  { text: "Then the room votes / *someone out.*", y: 480 },
  { text: "Killer, / or *Faithful?*", y: 480 },
  // HOW 5 — the dead play on
  { text: "Get *killed?*", y: 470 },
  { text: "You're / *not out.*", y: 480 },
  { text: "You play on / as a *Ghost.*", y: 480 },
  // WHY
  { text: "No *script,*", y: 470 },
  { text: "no app / to *download.*", y: 470 },
  { text: "Come *solo* / or bring friends,", y: 560 },
  { text: "and leave / knowing *everyone.*", y: 470 },
  // TWIST — closes the hook's loop
  { text: "And those / *three Killers?*", y: 470 },
  { text: "One of them / could be / !*You.*", y: 980, align: "left" },
];

const words = (text: string) => text.replace(/[*!]/g, "").split(/\s+|\//).map(norm).filter(Boolean);

/** Align every caption to the VO, in order. Warns on any word that isn't what is said. */
const aligned = (() => {
  let k = 0;
  return CAP_SPECS.map((c) => {
    const times: number[] = [];
    let lastEnd = 0;
    for (const token of words(c.text)) {
      let j = k;
      const lim = Math.min(WORDS.length, k + 4);
      while (j < lim && norm(WORDS[j].w) !== token) j++;
      if (j >= lim) {
        j = k;
        console.warn(`[timeline] caption word "${token}" ~ VO "${WORDS[k]?.w}" — make the caption match the voiceover`);
      }
      times.push(WORDS[j].s);
      lastEnd = WORDS[j].e;
      k = j + 1;
    }
    return { ...c, times, lastEnd };
  });
})();

/** The end card's first line, which ends the last caption. */
const END_LINE = phraseStart(w("can", 46.5));

/** Captions before cut-snapping; shots tied to a caption use these. */
const RAW = aligned.map((c, i) => {
  // The hook is on screen from frame 0: its first word is already popping on the first frame.
  const from = i === 0 ? -4 : sec(phraseStart(c.times[0])) - LEAD;
  const next = aligned[i + 1];
  const to = next ? sec(phraseStart(next.times[0])) - LEAD : sec(END_LINE) - LEAD;
  const wordAt = c.times.map((t, wi) => (wi === 0 ? from : Math.max(from, sec(t) - WORD_LEAD)));
  return { text: c.text, y: c.y, align: c.align ?? ("center" as "left" | "center"), scale: c.scale ?? 1, from, to, wordAt, spokenTo: sec(c.lastEnd) };
});
const rawCap = (i: number) => RAW[i].from;

// ------------------------------------------------------------------- shots ---

/** A band a caption must keep clear of, in SOURCE-frame px (as read off the probe grid). */
export type Clear = {
  /** Vertical span [top, bottom]. */
  y: [number, number];
  /** Horizontal span [left, right]; omit for full width (the safe default). */
  x?: [number, number];
  /** Shot-relative frame window; omit for the whole shot. */
  from?: number;
  to?: number;
  /** What it is — printed on a collision and drawn on the SafeZone stills. */
  what: string;
};

type ShotSpec = {
  key: string;
  /** Clip (public/<assets>/<src>.mp4) or photo (<src>.jpg). Clips are defined in footage.ts. */
  src: string;
  kind: "clip" | "photo";
  /** Absolute start frame. The shot runs until the next one starts. */
  at: number;
  grade?: "warm" | "noir" | "dim" | "plate" | "ghost";
  /** Lens origin, "x% y%". */
  origin?: string;
  /** Push-in override (default PUSH[kind]). */
  push?: number;
  /** Base reframe scale (default 1): zoom about an edge origin to move a subject clear of a caption. */
  zoom?: number;
  /** A white flash on the cut in: marks a new section. */
  section?: boolean;
  /** KEEP-CLEAR: every head, face and important thing in the shot. */
  clear?: Clear[];
  /**
   * A shot-level effect, from ABSOLUTE frame `at`:
   *   slash  the frame splits along a diagonal blade cut (the night's kill)
   *   ghost  the picture drains to grey and leaves a trailing echo of itself
   */
  fx?: { kind: "slash" | "ghost"; at: number };
};

/** The event card starts here, after the VO's last word and a clean hold on the button. */
const EVENT_AT = sec(52.3);
export const TOTAL = sec(57.8); // the VO (51.5s) + the CTA hold + the 5.5s event card

/** The table shot (1.6s) runs out mid-hook; the room shot takes over. */
const TABLE_OUT = sec(1.58);

/** The ghost shot's keep-clear bands (the laughing pair). */
const GHOST_CLEAR: Clear[] = [{ y: [580, 1310], what: "the laughing pair" }];

const SPECS: ShotSpec[] = [
  // Every `clear` band below was read off the probe sheets (scripts/reel/probe.mjs):
  // the union over the clip's first, middle and last frame, padded ~15px.
  // HOOK — zoomed from the top edge so the table's heads sit below the hook caption.
  {
    key: "table",
    src: "h_table",
    kind: "clip",
    at: 0,
    origin: "50% 0%",
    zoom: 1.15,
    clear: [{ y: [470, 1260], what: "the table's heads (standing and seated)" }],
  },
  // The table shot runs out at 1.6s: the wide room takes the end of the hook line and all of the next.
  { key: "room", src: "h_room", kind: "clip", at: TABLE_OUT, clear: [{ y: [750, 1320], what: "the room's heads" }] },
  { key: "three", src: "h_phones", kind: "clip", at: rawCap(2), clear: [{ y: [880, 1920], what: "the crowd and the two in front" }] },
  // WHAT
  { key: "laugh", src: "w_laugh", kind: "clip", at: rawCap(3), section: true, clear: [{ y: [620, 1320], what: "his head and hers" }] },
  // The table shot is shorter than its line: cut to it on "live".
  {
    key: "tables",
    src: "w_tables",
    kind: "clip",
    at: sec(w("live")),
    clear: [
      { y: [820, 1030], what: "the seated heads" },
      { y: [990, 1280], x: [150, 620], what: "the head in the foreground" },
    ],
  },
  {
    key: "host",
    src: "w_host",
    kind: "clip",
    at: rawCap(5),
    clear: [
      { y: [360, 720], what: "the host's face" },
      { y: [780, 920], x: [760, 960], what: "his phone" },
    ],
  },
  // HOW 1
  { key: "walk", src: "s_walk", kind: "clip", at: rawCap(6), section: true, clear: [{ y: [100, 510], x: [260, 1080], what: "his head (walking away)" }] },
  { key: "quiz", src: "s_dimcrowd", kind: "clip", at: rawCap(7), grade: "dim", clear: [{ y: [800, 1150], what: "heads" }] },
  { key: "role", src: "s_crowd", kind: "clip", at: rawCap(8), grade: "dim", clear: [{ y: [800, 1480], what: "heads" }] },
  // HOW 2
  { key: "night", src: "n_crowd", kind: "clip", at: rawCap(9), fx: { kind: "slash", at: sec(w("kill")) }, clear: [{ y: [790, 1110], what: "the crowd's heads" }] },
  { key: "dawn", src: "n_room", kind: "clip", at: rawCap(11), grade: "dim", clear: [{ y: [800, 1110], what: "the room's heads" }] },
  // HOW 3
  { key: "clues", src: "c_lights", kind: "clip", at: rawCap(13), grade: "dim", clear: [{ y: [820, 1320], what: "heads under the fairy lights" }] },
  // Zoomed from the top edge so the heads clear the caption under the step chip.
  { key: "people", src: "c_group", kind: "clip", at: rawCap(14), origin: "50% 0%", zoom: 1.15, clear: [{ y: [520, 1010], what: "the group's heads" }] },
  {
    key: "glasses",
    src: "c_glasses",
    kind: "clip",
    at: rawCap(15),
    origin: "50% 0%",
    zoom: 1.08,
    clear: [
      { y: [550, 830], x: [540, 920], what: "her face and glasses" },
      { y: [760, 1010], x: [430, 620], what: "her phone" },
      { y: [820, 1010], x: [0, 420], what: "faces at the table behind" },
    ],
  },
  {
    key: "shoes",
    src: "c_shoes",
    kind: "clip",
    at: rawCap(16),
    clear: [
      { y: [680, 910], what: "the faces" },
      { y: [1620, 1730], x: [320, 640], what: "her sandals" },
    ],
  },
  {
    key: "drink",
    src: "p2_table",
    kind: "photo",
    at: rawCap(17),
    clear: [
      { y: [0, 640], what: "the faces round the table" },
      { y: [1000, 1460], x: [590, 820], what: "the bottle" },
    ],
  },
  {
    key: "look",
    src: "c_look",
    kind: "clip",
    at: rawCap(18),
    clear: [
      { y: [350, 690], what: "the two faces" },
      { y: [1000, 1560], x: [275, 575], what: "the kitten" },
    ],
  },
  { key: "ask", src: "c_ask", kind: "clip", at: rawCap(19), clear: [{ y: [470, 820], what: "the three heads" }] },
  // Zoomed from the top edge: his face drops away from the punch word above it.
  { key: "bluff", src: "c_bluff", kind: "clip", at: rawCap(20), origin: "50% 0%", zoom: 1.13, clear: [{ y: [630, 1170], what: "his face" }] },
  // HOW 4
  {
    key: "vote",
    src: "v_hands",
    kind: "clip",
    at: rawCap(21),
    clear: [
      { y: [940, 1120], what: "heads (under the tally)" },
      { y: [1250, 1410], x: [780, 930], what: "the phone held up to vote" },
    ],
  },
  { key: "reveal", src: "v_blur", kind: "clip", at: rawCap(22), grade: "dim", clear: [{ y: [780, 1050], what: "heads" }] },
  // HOW 5
  { key: "killed", src: "g_empty", kind: "clip", at: rawCap(23), clear: [{ y: [0, 320], x: [820, 1080], what: "a guest in the background" }] },
  { key: "ghost", src: "g_ghost", kind: "clip", at: rawCap(24), origin: "50% 0%", zoom: 1.1, fx: { kind: "ghost", at: sec(w("play", 36)) - 6 }, clear: GHOST_CLEAR },
  // WHY
  { key: "script", src: "y_mic", kind: "clip", at: rawCap(26), section: true, clear: [{ y: [600, 1110], what: "his face" }] },
  {
    key: "app",
    src: "y_room",
    kind: "clip",
    at: rawCap(27),
    clear: [
      { y: [790, 1000], what: "the room's heads" },
      { y: [840, 1120], x: [0, 520], what: "a guest in the foreground" },
    ],
  },
  { key: "solo", src: "y_scooter", kind: "clip", at: rawCap(28), clear: [{ y: [840, 1620], what: "the rider's helmet" }] },
  { key: "everyone", src: "y_winners", kind: "clip", at: rawCap(29), clear: [{ y: [680, 910], what: "the winners' faces" }] },
  // TWIST — the hook's crowd again, the reticles return; then the pointing poster.
  { key: "those", src: "h_phones", kind: "clip", at: rawCap(30), section: true, clear: [{ y: [880, 1920], what: "the crowd and the two in front" }] },
  {
    key: "you",
    src: "p1_point",
    kind: "photo",
    at: rawCap(31),
    grade: "noir",
    origin: "30% 70%",
    clear: [
      { y: [0, 720], x: [300, 960], what: "her face" },
      { y: [1300, 1720], x: [120, 470], what: "the pointing hand" },
    ],
  },
  // CTA + EVENT — one photo under both cards, dimmed and blurred to a plate (texture, not a subject).
  { key: "end", src: "p2_table", kind: "photo", at: sec(END_LINE) - LEAD, grade: "plate", section: true },
];

export const SHOTS = SPECS.map((s, i) => ({ ...s, dur: (SPECS[i + 1]?.at ?? TOTAL) - s.at, from: s.at }));
export type Shot = (typeof SHOTS)[number];

/** Captions, with any caption pulled onto a free cut that lands in the silence just before it. */
export const CAPTIONS = (() => {
  const tied = new Set(RAW.map((c) => c.from));
  const free = SHOTS.map((s) => s.from).filter((f) => !tied.has(f));
  const out = RAW.map((c) => ({ ...c, wordAt: [...c.wordAt] }));
  for (let i = 1; i < out.length; i++) {
    // Only a cut in the silence AFTER the previous line has finished being spoken.
    const prevDone = out[i - 1].spokenTo;
    const cut = free.find((f) => f < out[i].from && f >= out[i].from - SNAP && f >= prevDone);
    if (cut !== undefined) {
      out[i].from = cut;
      out[i].wordAt[0] = cut;
      out[i - 1].to = cut;
    }
  }
  return out;
})();
export type CaptionData = (typeof CAPTIONS)[number];

/** Frame a caption appears. */
export const cap = (i: number) => CAPTIONS[i].from;

/** Absolute start of a shot by key. */
export const at = (key: string, offset = 0) => {
  const s = SHOTS.find((x) => x.key === key);
  if (!s) throw new Error(`no shot ${key}`);
  return s.from + offset;
};

/** A spoken word's frame, WORD_LEAD early: the frame its caption word pops. */
const said = (word: string, after = 0) => sec(w(word, after)) - WORD_LEAD;

// ---------------------------------------------------------------- overlays ---

/** Where the graphics sit. scenes.tsx draws from these; OVERLAY_CLEAR keeps captions off them. */
export const LAYOUT = {
  /** The arrival phone (quiz, then the role card). Its lower half runs under the platform UI: decoration only. */
  phone: { left: 250, top: 700, width: 580 },
  /** The dawn grid: 4 × 2 small phones. */
  grid: { top: 650, left: 87, cols: 4, rows: 2, width: 192, gap: 22, rowGap: 30 },
  cluesTop: 640,
  voteTop: 640,
  reveal: { top: 640, width: 560 },
  /** The Killer card that slams in on "you" (right of the left-aligned twist caption). */
  twistCard: { left: 724, top: 820, width: 284, height: 340 },
  /** The "HOW IT WORKS · n/5" pill + five bars. Measured on a still: x 72–710, y 292–351. */
  chip: { top: 292, bottom: 351, left: 72, right: 710 },
} as const;
const GRID_H = LAYOUT.grid.rows * LAYOUT.grid.width * 2.16 + (LAYOUT.grid.rows - 1) * LAYOUT.grid.rowGap;

/**
 * The five "How it works" steps, as frame ranges for the progress chip.
 * `since` marks a range that RESUMES a step after a gap (the chip steps aside
 * while a shot's faces fill the top of the frame): it fades back in, full.
 */
export const STEPS: { step: number; from: number; to: number; since?: number }[] = [
  // Step 1's chip waits for "answer six quick questions": in the walk-in shot his head is where the chip sits.
  { step: 1, from: cap(7), to: cap(9) },
  { step: 2, from: cap(9), to: cap(13) },
  // Step 3 steps aside for the drink photo and the sofa (faces fill the top of both).
  { step: 3, from: cap(13), to: cap(17) },
  { step: 3, from: cap(19), to: cap(21), since: cap(13) },
  { step: 4, from: cap(21), to: cap(23) },
  { step: 5, from: cap(23), to: cap(26) },
];

/** Every cue is an absolute frame on a spoken word. */
export const CUE = {
  /** Three reticles lock onto the crowd, one per word: "three · them · Killers". */
  reticles: { from: cap(2), to: cap(3), locks: [said("three"), said("them"), said("killers")] },
  reticles2: { from: cap(30), to: cap(31), locks: [said("those", 43), said("three", 43), said("killers", 43)] },
  brand: said("killers", 5.5),
  /** The arrival phone: quiz screens on "answer / quick / questions", then the role card flips on "secret" and lands on "role". */
  arrival: {
    from: cap(7),
    to: cap(9),
    phoneIn: cap(7) + 2,
    // One question every ~0.55s: long enough to read the question, short enough to feel quick.
    taps: [cap(7) + 12, cap(7) + 29, cap(7) + 45],
    flip: said("secret") - 2,
    land: said("role") + 2,
  },
  night: { fall: said("night", 14.5), kill: sec(w("kill")) },
  dawn: { from: cap(11), to: cap(13), phonesIn: cap(11) + 2, light: said("same") },
  clues: { from: cap(13), to: cap(14), cards: [said("clues", 19.5), said("drop") + 4, said("drop") + 16] },
  /** Hand-drawn marker loops round the trait in shot, on the spoken word. */
  loops: { glasses: said("glasses") + 2, shoes: said("shoes") + 2, drink: said("drink") + 2 },
  vote: { from: cap(21), to: cap(22), panelIn: said("votes") - 2, barsFrom: said("votes") + 4, overtake: said("out", 30.8) },
  reveal: { from: cap(22), to: cap(23), spin: said("killer", 31.5), land: said("faithful") + 8 },
  killed: said("killed"),
  twist: { from: cap(31), to: sec(END_LINE) - LEAD, youHit: said("you", 45.8) },
  end: {
    from: sec(END_LINE) - LEAD,
    to: EVENT_AT,
    line: sec(END_LINE) - LEAD,
    mark: sec(phraseStart(w("killers", 48.3))) - LEAD,
    by: said("astral", 49),
    cta: sec(phraseStart(w("book"))) - LEAD,
  },
  event: { from: EVENT_AT, to: TOTAL },
} as const;

/** Graphics that matter: a caption may not sit on these either. Canvas px, absolute frames. */
export const OVERLAY_CLEAR: { from: number; to: number; y: [number, number]; x?: [number, number]; what: string }[] = [
  ...STEPS.map((st) => ({ from: st.from, to: st.to, y: [LAYOUT.chip.top, LAYOUT.chip.bottom] as [number, number], x: [LAYOUT.chip.left, LAYOUT.chip.right] as [number, number], what: "the step chip" })),
  {
    from: CUE.arrival.phoneIn,
    to: CUE.arrival.to,
    y: [LAYOUT.phone.top, H],
    x: [LAYOUT.phone.left - 30, LAYOUT.phone.left + LAYOUT.phone.width + 30],
    what: "the arrival phone",
  },
  { from: CUE.dawn.phonesIn, to: CUE.dawn.to, y: [LAYOUT.grid.top, LAYOUT.grid.top + GRID_H], what: "the dawn phones" },
  { from: CUE.clues.cards[0], to: CUE.clues.to, y: [LAYOUT.cluesTop, LAYOUT.cluesTop + 2 * 176 + 150], what: "the clue banners" },
  { from: CUE.vote.panelIn, to: CUE.vote.to, y: [LAYOUT.voteTop, LAYOUT.voteTop + 430], what: "the vote card" },
  {
    from: CUE.reveal.from,
    to: CUE.reveal.to,
    y: [LAYOUT.reveal.top, LAYOUT.reveal.top + 560],
    x: [(W - LAYOUT.reveal.width) / 2, (W + LAYOUT.reveal.width) / 2],
    what: "the reveal card",
  },
  {
    from: CUE.twist.youHit,
    to: CUE.twist.to,
    y: [LAYOUT.twistCard.top, LAYOUT.twistCard.top + LAYOUT.twistCard.height],
    x: [LAYOUT.twistCard.left, LAYOUT.twistCard.left + LAYOUT.twistCard.width],
    what: "the Killer card",
  },
];

// --------------------------------------------------------------- the check ---

/** The box a caption occupies: exact height from CAPTION × scale, a conservative width estimate. */
export const captionBox = (c: { text: string; y: number; align?: string; scale?: number }) => {
  const k = c.scale ?? 1;
  const lines = c.text.split(" / ");
  const h = lines.reduce((acc, l) => acc + (l.startsWith("!") ? CAPTION.lineXl : CAPTION.lineM), 0) * k;
  const width = Math.min(
    936,
    Math.max(...lines.map((l) => l.replace(/[*!]/g, "").length * (l.startsWith("!") ? CAPTION.xl * 0.62 : CAPTION.m * 0.56) * k + 40)),
  );
  const x: [number, number] = c.align === "left" ? [72, 72 + width] : [W / 2 - width / 2, W / 2 + width / 2];
  const y: [number, number] = [c.y - h / 2, c.y + h / 2];
  return { x, y };
};

/** Every piece of on-screen TEXT the keep-clear rule covers: the captions and the step chip. */
export const TEXT = [
  ...CAPTIONS.map((c) => ({ label: `"${c.text}"`, from: c.from, to: c.to, box: captionBox(c), isCaption: true })),
  ...STEPS.map((st) => ({
    label: `the step chip (${st.step}/5)`,
    from: st.from,
    to: st.to,
    box: { x: [LAYOUT.chip.left, LAYOUT.chip.right] as [number, number], y: [LAYOUT.chip.top, LAYOUT.chip.bottom] as [number, number] },
    isCaption: false,
  })),
];

const hits = (a: [number, number], b: [number, number], m: number) => a[0] < b[1] + m && a[1] + m > b[0];

export type Collision = { caption: string; against: string; frame: number; captionY: [number, number]; bandY: [number, number] };

/**
 * RULE: text never sits on people's heads or on important things. Tests every
 * caption and the step chip against every keep-clear band of every shot it is
 * on screen over (with that shot's exact lens scale, on every frame), and every
 * caption against every graphic in OVERLAY_CLEAR. One entry per text/band pair.
 */
export const checkCaptions = (): Collision[] => {
  const out: Collision[] = [];
  for (const t of TEXT) {
    const box = t.box;
    for (const s of SHOTS) {
      const [ox, oy] = originPx(s.origin, W, H);
      const push = s.push ?? PUSH[s.kind];
      for (const k of s.clear ?? []) {
        const from = Math.max(t.from, s.from + (k.from ?? 0));
        const to = Math.min(t.to, s.from + (k.to ?? s.dur));
        for (let f = from; f < to; f++) {
          const sc = lensScale(f - s.from, s.dur, push, s.zoom ?? 1);
          const y = onScreen(k.y[0], k.y[1], oy, sc);
          const x = k.x ? onScreen(k.x[0], k.x[1], ox, sc) : ([0, W] as [number, number]);
          if (hits(box.y, y, MARGIN) && hits(box.x, x, MARGIN)) {
            out.push({ caption: t.label, against: `${s.key}: ${k.what}`, frame: f, captionY: box.y, bandY: y });
            break;
          }
        }
      }
    }
    if (!t.isCaption) continue;
    for (const g of OVERLAY_CLEAR) {
      if (g.from >= t.to || g.to <= t.from) continue;
      if (hits(box.y, g.y, MARGIN) && hits(box.x, g.x ?? [0, W], MARGIN)) {
        out.push({ caption: t.label, against: g.what, frame: Math.max(t.from, g.from), captionY: box.y, bandY: g.y });
      }
    }
  }
  return out;
};
