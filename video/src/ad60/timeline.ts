/**
 * timeline.ts — the reel, timed to the voiceover. THE file you edit per ad.
 *
 * WORKED EXAMPLE: the Astral Project × Greenr murder-mystery ad (2026-09-26).
 * For a new ad, replace CAP_SPECS, SPECS, the cue words in CUE, LAYOUT and the
 * event timings — and keep every mechanism.
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
  // HOOK — A (the viewer's usual night), B (the alternative: the topic by 2.4s), the open loop.
  { text: "Bored of the / *same* night out?", y: 495 },
  { text: "Come solve the / !*Murder* / instead.", y: 640 },
  { text: "The killer is / *in this room.*", y: 440 },
  // WHAT
  { text: "It's a / *murder mystery* game", y: 1075 },
  { text: "the *whole room* / plays.", y: 600 },
  { text: "Here's how / it *works.*", y: 849 },
  // HOW 1–5
  { text: "You *walk in*", y: 760 },
  { text: "and get a / *secret role.*", y: 560 },
  { text: "You might even / be *the killer.*", y: 560 },
  { text: "Clues drop on / *your phone*", y: 480 },
  { text: "and every clue / points at *someone.*", y: 600 },
  // The punch words sit ABOVE the talkers (their shots push in from the top edge) or below the group.
  { text: "So you / !*Talk,*", y: 536, scale: 0.9 },
  { text: "you / !*Bluff,*", y: 536, scale: 0.9 },
  { text: "you / !*Accuse.*", y: 966, scale: 0.9 },
  { text: "Then the *whole room* / votes.", y: 479 },
  { text: "Vote wrong and / *the killer wins.*", y: 479 },
  { text: "The truth hits / *every phone*", y: 480 },
  { text: "at the exact / *same second.*", y: 480 },
  // WHY
  { text: "No *acting skills* / needed,", y: 1080 },
  { text: "no app / to *download.*", y: 1080 },
  { text: "Come with / *friends*", y: 1080 },
  { text: "or come / *solo.*", y: 700 },
  { text: "Everyone ends up / talking to *everyone.*", y: 1080 },
  { text: "Real guests, / *real night.*", y: 520 },
  // TWIST — set low-left, over her top, clear of her face and the pointing hand.
  { text: "And the killer?", y: 830, align: "left" },
  { text: "It could be / !*You.*", y: 900, align: "left" },
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
const END_LINE = phraseStart(w("can", 43));

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
  grade?: "warm" | "noir" | "dim" | "plate";
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
};

/** The Greenr event card starts here, after the VO's last word. */
const EVENT_AT = sec(48.4);
export const TOTAL = sec(53.5); // 1605 frames — the VO (48.2s) + the 5s event card

/** The secret-role redaction glitches open on the spoken "killer"; the background cuts with it. */
const PEEK = sec(w("killer", 14));

const SPECS: ShotSpec[] = [
  // Every `clear` band below was read off the probe sheets (scripts/reel/probe.mjs):
  // the union over the clip's first, middle and last frame, padded ~15px.
  // HOOK
  { key: "bored", src: "h1_room", kind: "clip", at: 0, clear: [{ y: [640, 1000], what: "the crowd's heads" }] },
  { key: "murder", src: "h2_phones", kind: "clip", at: rawCap(1), clear: [{ y: [920, 1540], what: "the crowd, the two in front, the phone" }] },
  {
    key: "inroom",
    src: "r1_phone",
    kind: "clip",
    at: sec(4.5) - 1, // the phones-up shot runs out at 4.5s
    clear: [{ y: [590, 1400], what: "the curly man and the woman in front" }],
  },
  // WHAT
  { key: "game", src: "g_standing", kind: "clip", at: rawCap(3), section: true, clear: [{ y: [470, 930], what: "the standing group's heads" }] },
  {
    key: "room",
    src: "z_room",
    kind: "clip",
    at: rawCap(4),
    clear: [
      { y: [790, 1000], what: "the room's heads" },
      { y: [950, 1500], x: [0, 150], what: "a guest at the left edge" },
    ],
  },
  {
    key: "phone",
    src: "s5_women",
    kind: "clip",
    at: rawCap(5),
    clear: [
      { y: [350, 710], what: "the two women's faces" },
      { y: [990, 1410], x: [250, 620], what: "the kitten" },
    ],
  },
  // HOW — the later, wider part of the walk-in: his head stays high, clear of the caption.
  { key: "walk", src: "s2_walk", kind: "clip", at: sec(11.3), section: true, clear: [{ y: [60, 610], x: [150, 1080], what: "his head (walking away)" }] },
  { key: "role", src: "q_clap", kind: "clip", at: rawCap(7), grade: "dim", clear: [{ y: [740, 960], what: "heads" }] },
  { key: "role2", src: "q_crowd", kind: "clip", at: PEEK, grade: "dim", clear: [{ y: [760, 960], what: "heads" }] },
  { key: "clues", src: "c1_tables", kind: "clip", at: rawCap(9), grade: "dim", clear: [{ y: [760, 1310], what: "seated heads" }] },
  { key: "notes", src: "n1_notes", kind: "clip", at: rawCap(10), clear: [{ y: [870, 1170], x: [280, 790], what: "the circled line" }] },
  { key: "notes2", src: "f_lights", kind: "clip", at: sec(18.9), clear: [{ y: [740, 1210], what: "heads under the fairy lights" }] },
  // Close-ups push in from the TOP edge (origin 50% 0%): the face moves down, away from the caption above it.
  {
    key: "talk",
    src: "r2_micman",
    kind: "clip",
    at: rawCap(11),
    origin: "50% 0%",
    zoom: 1.18,
    clear: [
      { y: [590, 1110], what: "his face" },
      { y: [990, 1360], x: [540, 1010], what: "his hand and the mic" },
    ],
  },
  {
    key: "bluff",
    src: "t2_curly",
    kind: "clip",
    at: rawCap(12),
    origin: "50% 0%",
    clear: [
      { y: [690, 1125], what: "his face" },
      { y: [1150, 1340], x: [100, 340], what: "the mic" },
    ],
  },
  { key: "accuse", src: "f_debate", kind: "clip", at: rawCap(13), clear: [{ y: [430, 780], what: "the three heads" }] },
  { key: "vote", src: "v1_hands", kind: "clip", at: rawCap(14), clear: [{ y: [1250, 1410], x: [640, 900], what: "the phone held up to vote" }] },
  { key: "vote2", src: "ae_room", kind: "clip", at: sec(25.47), clear: [{ y: [780, 1010], what: "the room's heads" }] },
  // Zoomed about the top edge so the phone sits below the caption band all shot.
  { key: "reveal", src: "p3_reveal", kind: "photo", at: rawCap(16), origin: "52% 0%", zoom: 1.08, clear: [{ y: [587, 1375], x: [270, 810], what: "the reveal phone" }] },
  // WHY
  { key: "acting", src: "j1_laugh", kind: "clip", at: rawCap(18), section: true, clear: [{ y: [410, 925], what: "the laughing faces" }] },
  { key: "friends", src: "k2_shrug", kind: "clip", at: sec(33.7), clear: [{ y: [440, 780], what: "his face" }] },
  { key: "solo", src: "c_scooter", kind: "clip", at: rawCap(21), clear: [{ y: [850, 1650], what: "the rider's helmet" }] },
  { key: "everyone", src: "j2_winners", kind: "clip", at: rawCap(22), clear: [{ y: [640, 930], what: "the winners' faces" }] },
  {
    key: "realnight",
    src: "z_room2",
    kind: "clip",
    at: rawCap(23),
    clear: [
      { y: [810, 960], what: "the room's heads" },
      { y: [840, 1090], x: [0, 320], what: "a guest in the foreground" },
    ],
  },
  // TWIST
  {
    key: "twist",
    src: "p1_point",
    kind: "photo",
    at: rawCap(24),
    grade: "noir",
    origin: "30% 70%",
    section: true,
    clear: [
      { y: [0, 740], x: [130, 960], what: "her face" },
      { y: [1280, 1680], x: [100, 520], what: "the pointing hand" },
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

// ---------------------------------------------------------------- overlays ---

/** Where the graphics sit. scenes.tsx draws from these; OVERLAY_CLEAR keeps captions off them. */
export const LAYOUT = {
  phone: { left: 260, top: 760, width: 560 },
  cluesTop: 620,
  voteTop: 610,
  /** The "HOW IT WORKS · n/5" pill + five bars. Measured on a still: x 72–710, y 292–351. */
  chip: { top: 292, bottom: 351, left: 72, right: 710 },
} as const;

/** The five "How it works" steps, as frame ranges for the progress chip. */
export const STEPS = [
  // Step 1's chip waits for "and get a secret role": in the walk-in shot his head is where the chip sits.
  { step: 1, from: cap(7), to: cap(9) },
  { step: 2, from: cap(9), to: cap(11) },
  { step: 3, from: cap(11), to: cap(14) },
  { step: 4, from: cap(14), to: cap(16) },
  { step: 5, from: cap(16), to: cap(18) },
];

/** Every cue is an absolute frame on a spoken word. */
export const CUE = {
  strike: sec(w("out")), // the red line through "same night out?"
  murder: sec(w("murder")) - WORD_LEAD, // the MURDER boom
  killerInRoom: sec(w("killer")),
  role: { from: cap(7), to: cap(9), phoneIn: cap(7) + 4, peekOn: PEEK, peekOff: PEEK + 10 },
  clues: { from: cap(9), to: cap(10), cards: [sec(w("drop")) - 2, sec(w("phone", 16)) - 2, sec(w("phone", 16)) + 10] },
  notes: { from: cap(10), to: at("notes2"), circle: sec(w("points")) + 4 },
  words3: [sec(w("talk")), sec(w("bluff")), sec(w("accuse"))],
  vote: { from: cap(14), to: cap(16), panelIn: sec(w("whole", 22)), barsFrom: sec(w("room", 23)), overtake: sec(w("wrong")) },
  reveal: cap(16),
  twist: { from: cap(24), to: sec(END_LINE) - LEAD, youHit: sec(w("you", 42.5)) - WORD_LEAD },
  end: {
    from: sec(END_LINE) - LEAD,
    to: EVENT_AT,
    line: sec(END_LINE) - LEAD,
    mark: sec(phraseStart(w("astro"))) - LEAD,
    cta: sec(phraseStart(w("book"))) - LEAD,
  },
  event: { from: EVENT_AT, to: TOTAL },
} as const;

/** Graphics that matter: a caption may not sit on these either. Canvas px, absolute frames. */
export const OVERLAY_CLEAR: { from: number; to: number; y: [number, number]; x?: [number, number]; what: string }[] = [
  { from: STEPS[0].from, to: STEPS[4].to, y: [LAYOUT.chip.top, LAYOUT.chip.bottom], x: [LAYOUT.chip.left, LAYOUT.chip.right], what: "the step chip" },
  {
    from: CUE.role.phoneIn,
    to: CUE.role.to,
    y: [LAYOUT.phone.top, H],
    x: [LAYOUT.phone.left - 30, LAYOUT.phone.left + LAYOUT.phone.width + 30],
    what: "the role phone",
  },
  { from: CUE.clues.cards[0], to: CUE.clues.to, y: [LAYOUT.cluesTop, LAYOUT.cluesTop + 2 * 176 + 140], what: "the clue notifications" },
  { from: CUE.vote.panelIn, to: CUE.vote.to, y: [LAYOUT.voteTop, LAYOUT.voteTop + 430], what: "the vote card" },
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
