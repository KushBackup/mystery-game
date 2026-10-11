/**
 * timeline.ts — the reel, timed to the voiceover. THE file you edit per ad.
 *
 * THREE KNIVES OUT × SIDEQUEST CLUB (2026-10-11): a 16:9 4K ad on a 1920×1080
 * canvas. Same mechanisms as the 9:16 reels, plus SPLIT SCREENS: a `panes`
 * shot puts three vertical clips side by side, each in its own third of the
 * frame, each with its own lens and keep-clear bands (in pane-local px, as
 * read off its probe sheet). A pane can arrive late (`at`) — the clue and the
 * talk/bluff/vote beats fill their three panes one word at a time.
 *
 * THE VOICEOVER IS THE CLOCK. public/<assets>/vo.mp3 is transcribed by
 * scripts/reel/transcribe.mjs into ./voWords.ts; every cut, caption and cue
 * below derives from it.
 *
 * KEEP-CLEAR: captions never sit on people's heads, faces or important things.
 * checkCaptions() tests every caption and the step chip against every band of
 * every shot and pane, on every frame, with the lens applied (lens.ts).
 *
 * Caption markup: " / " breaks a line, *segment* gets the red highlight box,
 * a line starting with "!" is extra large. The TEXT must match the spoken words.
 *
 * FACT DISCIPLINE — the six games, the roles (Killer, Doctor, Detective), the
 * three killers, the morning games, the rigged board, the trait clues
 * (glasses, sneakers, black top), the ghosts, "no app to download" and "come
 * solo" are all true of the game or confirmed by the user; the event details
 * are the user's, verbatim.
 *
 * Erasable TypeScript only: Node imports this file directly.
 */

import { GAPS, WORDS } from "./voWords.ts";
import { PUSH, lensScale, onScreen, originPx } from "./lens.ts";
import { REEL } from "./config.ts";

export const FPS = REEL.fps;
export const W = REEL.width;
export const H = REEL.height;
export const SAFE = REEL.safe;
/** A caption appears this many frames before its first word is spoken. */
const LEAD = 3;
/** Each word pops this many frames before it is spoken. */
const WORD_LEAD = 2;
/** A free cut this close before a caption pulls the caption onto the cut. */
const SNAP = 10;
/** Minimum gap (px) between text and anything it must keep clear of. */
export const MARGIN = 16;

export const sec = (s: number) => Math.round(s * FPS);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Start (s) of the first spoken `word` at or after `after` seconds. */
export const w = (word: string, after = 0) => {
  const hit = WORDS.find((x) => x.s >= after - 0.01 && norm(x.w) === norm(word));
  if (!hit) throw new Error(`VO word not found: ${word} after ${after}s`);
  return hit.s;
};

/**
 * A phrase begins where the speech resumes. transcribe.mjs already moved every
 * word that starts inside a silence to its end; this catches a phrase start
 * that sits right at the edge of one (within 80ms before it, or 120ms after).
 * It never snaps back past `after` (the previous phrase's first word), or two
 * quick phrases ("So you talk, you bluff") would collapse onto one gap.
 */
const phraseStart = (s: number, after = -1) => {
  for (const [start, end] of GAPS) {
    if (end <= after + 0.05) continue;
    if (s >= start - 0.08 && s <= end) return end;
    if (s > end && s - end < 0.12) return end;
  }
  return s;
};

// ------------------------------------------------------------ caption type ---

/** Caption type sizes (canvas px). kit.tsx renders with these; the keep-clear check measures with them. */
export const CAPTION = { m: 76, xl: 168, lineM: 76 * 1.1, lineXl: 168 * 0.98 + 16 } as const;
/** Pane centres for a three-way split. */
export const PANE_W = W / 3;
const PX = [PANE_W / 2, W / 2, W - PANE_W / 2];

// ---------------------------------------------------------------- captions ---

/**
 * `y` is the block's vertical centre, `x` its horizontal centre (default the
 * middle of the frame), `w` the widest it may wrap to. Choose y/x from the
 * shot's keep-clear bands.
 */
type CapSpec = { id: string; text: string; y: number; x?: number; w?: number; scale?: number };

const LOW = 900;
/** The hook's names sit on the middle pane's card. */
const CARD = { y: 730, x: W / 2, w: 620, scale: 0.46 } as const;
const CAP_SPECS: CapSpec[] = [
  // HOOK — the six games, rapid-fire (topic by 0.1s), then A vs B, then the open loop.
  { id: "mafia", text: "!*Mafia.*", ...CARD },
  { id: "among", text: "!*Among Us.*", ...CARD },
  { id: "under", text: "!*Undercover.*", ...CARD },
  { id: "pict", text: "!*Pictionary.*", ...CARD },
  { id: "flappy", text: "!*Flappy Bird.*", ...CARD },
  { id: "cluedo", text: "!*Cluedo.*", ...CARD },
  // Under the seniors' faces; then above the room's heads (the six tiles sit at the very top).
  { id: "played", text: "You've played them / *one at a time.*", y: 918 },
  { id: "allsix", text: "Now play / !*all six*", y: 340, scale: 0.8 },
  { id: "room", text: "in one night, / with the *whole room.*", y: 340 },
  { id: "killers", text: "And three of you are / !*killers.*", y: 850, scale: 0.9 },
  // WHAT
  { id: "title", text: "This is / !*Three Knives Out,*", y: 780, scale: 0.86 },
  { id: "live", text: "a live party game / on *your phone.*", y: 206 },
  // HOW 1 — the role (the phone is on the right)
  { id: "walk", text: "You *walk in*", y: LOW },
  { id: "role", text: "and get a / *secret role.*", y: 262, x: 640, w: 1000 },
  { id: "roles", text: "*Killer?* Doctor? / Detective?", y: 262, x: 640, w: 1000 },
  // HOW 2 — night, over the ceiling
  { id: "night", text: "Every *night,* the killers / pick a *target.*", y: 250 },
  // HOW 3 — morning
  { id: "morning", text: "Every *morning,* / the room plays", y: 224 },
  { id: "games", text: "*Undercover,* *Pictionary* / or *Flappy Bird.*", y: 700, x: 1260, w: 900 },
  { id: "lowest", text: "*Lowest score* / dies,", y: LOW, x: 560, w: 900 },
  { id: "rig", text: "and the killers / *rig the board.*", y: LOW, x: 560, w: 900 },
  // HOW 4 — clues
  { id: "clues", text: "Then clues drop / about *the killer.*", y: 924, x: 560, w: 900 },
  { id: "glasses", text: "!*Glasses?*", y: 920, x: 372, w: 540, scale: 0.6 },
  { id: "sneakers", text: "!*Sneakers?*", y: 920, x: PX[1], w: 600, scale: 0.56 },
  { id: "blacktop", text: "!*Black top?*", y: 964, x: 1550, w: 540, scale: 0.48 },
  // HOW 5 — talk, bluff, vote; and the dead keep playing
  { id: "talk", text: "So you / !*talk,*", y: LOW, x: PX[0], w: 600, scale: 0.7 },
  { id: "bluff", text: "you / !*bluff,*", y: LOW, x: PX[1], w: 600, scale: 0.7 },
  { id: "vote", text: "you vote / *someone out.*", y: 925, x: 1546, w: 552 },
  { id: "die", text: "!*Die?*", y: 760 },
  { id: "notout", text: "You're / *not out.*", y: 290, x: 560, w: 700, scale: 0.9 },
  { id: "ghosts", text: "*Ghosts* / keep playing.", y: 290, x: 560, w: 700, scale: 0.9 },
  // WHY
  { id: "noapp", text: "No app / to *download.*", y: 560, x: 1340, w: 900 },
  { id: "solo", text: "Come *solo*", y: 880, x: 1420, w: 760 },
  { id: "crew", text: "or bring / *your crew.*", y: 155 },
  // TWIST / CTA — closes the hook's loop ("three of you are killers")
  { id: "knives", text: "Three knives.", y: 250 },
  { id: "oneroom", text: "!*One room.*", y: 250 },
  { id: "catch", text: "Can you catch them / before they / *catch you?*", y: 880, scale: 0.9 },
];

const tokens = (text: string) => text.replace(/[*!]/g, "").split(/\s+|\//).map(norm).filter(Boolean);

/**
 * Align every caption to the VO, in order. Warns on any word that isn't what
 * is said. Two caption words may match one spoken token ("Black top" ~ VO
 * "Blacktop") — they share its time.
 */
const aligned = (() => {
  let k = 0;
  return CAP_SPECS.map((c) => {
    const toks = tokens(c.text);
    const times: number[] = [];
    let lastEnd = 0;
    for (let ti = 0; ti < toks.length; ti++) {
      const token = toks[ti];
      const lim = Math.min(WORDS.length, k + 4);
      let j = k;
      let joined = false;
      while (j < lim && norm(WORDS[j].w) !== token) {
        if (ti + 1 < toks.length && norm(WORDS[j].w) === token + toks[ti + 1]) {
          joined = true;
          break;
        }
        j++;
      }
      if (j >= lim) {
        j = k;
        console.warn(`[timeline] caption word "${token}" ~ VO "${WORDS[k]?.w}" — make the caption match the voiceover`);
      }
      times.push(WORDS[j].s);
      if (joined) {
        times.push(WORDS[j].s);
        ti++;
      }
      lastEnd = WORDS[j].e;
      k = j + 1;
    }
    return { ...c, times, lastEnd };
  });
})();

/** The brand lockup replaces captions from here: "Three Knives Out, by Astral Project…". */
const BRAND_AT = phraseStart(w("three", 50.9));
/** The event card arrives on "Friday" and holds ~3s past the last word. */
const EVENT_AT = sec(phraseStart(w("friday"))) - LEAD;
export const TOTAL = sec(WORDS[WORDS.length - 1].e + 3.0);

/** Captions before cut-snapping; shots tied to a caption use these. */
const RAW = aligned.map((c, i) => {
  const from = i === 0 ? -4 : sec(phraseStart(c.times[0], aligned[i - 1].times[0])) - LEAD;
  const next = aligned[i + 1];
  const to = next ? sec(phraseStart(next.times[0], c.times[0])) - LEAD : sec(BRAND_AT) - LEAD;
  const wordAt = c.times.map((t, wi) => (wi === 0 ? from : Math.max(from, sec(t) - WORD_LEAD)));
  return {
    id: c.id,
    text: c.text,
    y: c.y,
    x: c.x ?? W / 2,
    w: c.w ?? 1640,
    scale: c.scale ?? 1,
    from,
    to,
    wordAt,
    spokenTo: sec(c.lastEnd),
  };
});
const capIndex = (id: string) => {
  const i = RAW.findIndex((c) => c.id === id);
  if (i < 0) throw new Error(`no caption ${id}`);
  return i;
};
const rawCap = (id: string) => RAW[capIndex(id)].from;

// ------------------------------------------------------------------- shots ---

/** A band a caption must keep clear of, in SOURCE px of its shot or pane (as read off the probe grid). */
export type Clear = {
  y: [number, number];
  /** Horizontal span; omit for the full width of the shot or pane. */
  x?: [number, number];
  /** Shot-relative frame window; omit for the whole shot. */
  from?: number;
  to?: number;
  what: string;
};

export type Grade = "warm" | "noir" | "dim" | "plate" | "night" | "ghost";

type Pane = {
  /** A clip, or omit it and give `card` (a game key): the pane is a drawn card instead. */
  src?: string;
  card?: string;
  /** Absolute frame the pane arrives (default: with the shot). Before it, the pane is ink. */
  at?: number;
  origin?: string;
  zoom?: number;
  grade?: Grade;
  clear?: Clear[];
};

type ShotSpec = {
  key: string;
  kind: "clip" | "panes";
  /** A full-frame clip (public/<assets>/<src>.mp4). */
  src?: string;
  /** A split screen: three vertical clips, left to right. */
  panes?: Pane[];
  at: number;
  grade?: Grade;
  origin?: string;
  push?: number;
  zoom?: number;
  /** A bone flash on the cut in: marks a new section. */
  section?: boolean;
  clear?: Clear[];
};

const card = (k: string): Pane => ({ card: k, clear: [] });

const SPECS: ShotSpec[] = [
  // HOOK — every game name gets its own card in the middle pane; the footage either side cuts with it.
  { key: "mafia", kind: "panes", at: 0, panes: [{ src: "m_crowd", clear: [] }, card("mafia"), { src: "m_mic", clear: [] }] },
  { key: "among", kind: "panes", at: rawCap("among"), panes: [{ src: "a_lit", clear: [] }, card("among"), { src: "a_stare", clear: [] }] },
  { key: "under", kind: "panes", at: rawCap("under"), panes: [{ src: "u_scratch", clear: [] }, card("under"), { src: "u_palm", clear: [] }] },
  { key: "pict", kind: "panes", at: rawCap("pict"), panes: [{ src: "p_sketch", clear: [] }, card("pict"), { src: "p_paper", clear: [] }] },
  { key: "flappy", kind: "panes", at: rawCap("flappy"), panes: [{ src: "f_left", clear: [] }, card("flappy"), { src: "f_right", clear: [] }] },
  { key: "cluedo", kind: "panes", at: rawCap("cluedo"), panes: [{ src: "c_card", clear: [] }, card("cluedo"), { src: "c_think", clear: [] }] },
  // A / B
  {
    key: "seniors",
    kind: "clip",
    src: "o_seniors",
    at: rawCap("played"),
    section: true,
    // Pushed in about the bottom edge, so the sheet rises away from the caption below it.
    origin: "50% 96%",
    clear: [
      { y: [260, 545], x: [470, 1360], what: "the two faces" },
      { y: [545, 800], x: [470, 1520], what: "their hands and the sheet" },
    ],
  },
  { key: "laugh", kind: "clip", src: "o_laugh", at: sec(7.4), clear: [{ y: [380, 725], x: [0, 1480], what: "the three heads" }] },
  {
    key: "allsix",
    kind: "clip",
    src: "b_hands",
    at: rawCap("allsix"),
    clear: [
      { y: [470, 1080], x: [180, 1920], what: "the room's heads and the raised phone" },
      { y: [540, 800], x: [0, 170], what: "the poster on the left" },
    ],
  },
  { key: "wholeroom", kind: "clip", src: "b_room", at: rawCap("room"), clear: [{ y: [455, 1080], what: "the room's heads" }] },
  {
    key: "killers",
    kind: "panes",
    at: rawCap("killers"),
    grade: "noir",
    panes: [
      { src: "k_man", clear: [{ y: [40, 500], what: "his face" }] },
      { src: "k_glasses", clear: [{ y: [300, 650], x: [0, 470], what: "her face and hand" }, { y: [40, 270], x: [330, 470], what: "the face behind her" }] },
      { src: "k_eyes", clear: [{ y: [60, 470], what: "her face" }] },
    ],
  },
  // WHAT
  { key: "title", kind: "clip", src: "w_title", at: rawCap("title"), grade: "dim", section: true, clear: [] },
  {
    key: "phones",
    kind: "clip",
    src: "w_phones",
    at: rawCap("live"),
    clear: [
      { y: [355, 760], x: [0, 1480], what: "the table's heads" },
      { y: [740, 1080], x: [640, 1480], what: "a head in the foreground" },
    ],
  },
  // HOW 1
  {
    key: "walk",
    kind: "clip",
    src: "s_walk",
    at: rawCap("walk"),
    section: true,
    clear: [
      { y: [250, 440], x: [680, 1380], what: "the heads walking in" },
      { y: [270, 410], x: [440, 670], what: "the poster" },
    ],
  },
  { key: "role", kind: "clip", src: "s_host", at: rawCap("role"), grade: "dim", clear: [{ y: [430, 1080], what: "the host and the table" }] },
  // HOW 2
  { key: "night", kind: "clip", src: "n_room", at: rawCap("night"), grade: "night", section: true, clear: [{ y: [455, 1080], what: "the room's heads" }] },
  // HOW 3
  {
    key: "morning",
    kind: "clip",
    src: "g_room",
    at: rawCap("morning"),
    section: true,
    clear: [
      { y: [355, 760], x: [0, 1760], what: "the table's heads" },
      { y: [760, 1080], x: [820, 1480], what: "a head in the foreground" },
    ],
  },
  { key: "games", kind: "clip", src: "g_sketch", at: rawCap("games"), grade: "dim", clear: [{ y: [260, 960], x: [410, 760], what: "the phone" }] },
  { key: "board", kind: "clip", src: "r_board", at: rawCap("lowest"), grade: "dim", clear: [{ y: [300, 780], x: [0, 1100], what: "the guests' heads" }] },
  // HOW 4
  { key: "clues", kind: "clip", src: "l_phone", at: rawCap("clues"), grade: "dim", section: true, origin: "50% 100%", clear: [{ y: [270, 810], x: [450, 770], what: "the phone" }] },
  {
    key: "traits",
    kind: "panes",
    at: rawCap("glasses"),
    panes: [
      { src: "l_glasses", origin: "50% 0%", clear: [{ y: [150, 720], what: "her face" }] },
      { ...card("sneakers"), at: rawCap("sneakers") },
      {
        src: "l_black",
        at: rawCap("blacktop"),
        clear: [
          { y: [80, 712], what: "her face" },
          // Her name sticker is unreadable at this size (a pink square), so it is not kept clear.
        ],
      },
    ],
  },
  // HOW 5
  {
    key: "talk",
    kind: "panes",
    at: rawCap("talk"),
    section: true,
    panes: [
      { src: "v_talk", clear: [{ y: [230, 545], x: [0, 360], what: "his face" }] },
      { src: "v_bluff", at: rawCap("bluff"), clear: [{ y: [30, 490], what: "his face" }] },
      {
        src: "v_vote",
        at: rawCap("vote"),
        clear: [
          { y: [270, 625], x: [50, 420], what: "his face" },
          { y: [0, 345], x: [170, 640], what: "the hand going up" },
          { y: [440, 725], x: [450, 640], what: "her face" },
        ],
      },
    ],
  },
  { key: "die", kind: "clip", src: "d_empty", at: rawCap("die"), grade: "noir", clear: [] },
  {
    key: "ghost",
    kind: "clip",
    src: "d_ghost",
    at: rawCap("notout"),
    grade: "ghost",
    clear: [
      { y: [470, 1080], x: [0, 1000], what: "the seated guests' heads" },
      { y: [215, 1080], x: [1000, 1920], what: "the standing guest and the table" },
    ],
  },
  // WHY
  { key: "noapp", kind: "clip", src: "y_phone", at: rawCap("noapp"), section: true, clear: [{ y: [320, 910], x: [450, 770], what: "the phone" }] },
  { key: "solo", kind: "clip", src: "y_solo", at: rawCap("solo"), clear: [{ y: [0, 1080], x: [0, 1010], what: "her face" }] },
  {
    key: "crew",
    kind: "panes",
    at: rawCap("crew"),
    panes: [
      { src: "y_crew1", clear: [{ y: [250, 1080], what: "the table's heads" }] },
      { src: "y_crew2", origin: "50% 0%", clear: [{ y: [270, 1080], what: "the crowd's heads" }] },
      { src: "y_crew3", clear: [{ y: [290, 640], x: [100, 400], what: "her face" }, { y: [180, 520], x: [400, 640], what: "the guest behind her" }] },
    ],
  },
  // TWIST / CTA
  { key: "knives", kind: "clip", src: "t_room", at: rawCap("knives"), section: true, clear: [{ y: [690, 1080], what: "the room's heads" }] },
  {
    key: "catch",
    kind: "panes",
    at: rawCap("catch"),
    panes: [
      { src: "t_point", clear: [{ y: [500, 625], x: [50, 230], what: "her face" }, { y: [735, 1080], x: [0, 170], what: "a head in the foreground" }] },
      { src: "t_mic", clear: [{ y: [340, 600], x: [60, 420], what: "his face" }] },
      { src: "t_hands", clear: [{ y: [350, 700], x: [0, 470], what: "her face" }] },
    ],
  },
  { key: "brand", kind: "clip", src: "e_clap", at: sec(BRAND_AT) - LEAD, grade: "dim", section: true },
  { key: "event", kind: "clip", src: "e_plate", at: EVENT_AT, grade: "plate" },
];

export const SHOTS = SPECS.map((s, i) => ({ ...s, dur: (SPECS[i + 1]?.at ?? TOTAL) - s.at, from: s.at }));
export type Shot = (typeof SHOTS)[number];

/**
 * Every picture on screen as a box: a full-frame shot is one layer, a split
 * screen is three. The renderer, the cutter, the probe and the check all read
 * this, so a pane's lens and bands are modelled exactly like a shot's.
 */
export const LAYERS = SHOTS.flatMap((s) => {
  if (s.kind === "clip") {
    return [
      {
        key: s.key,
        src: s.src as string,
        card: undefined as string | undefined,
        lightAt: 0,
        from: s.from,
        dur: s.dur,
        x0: 0,
        width: W,
        pane: false,
        origin: s.origin,
        zoom: s.zoom ?? 1,
        push: s.push ?? PUSH.clip,
        grade: (s.grade ?? "warm") as Grade,
        clear: s.clear ?? [],
      },
    ];
  }
  // A pane with a later `at` is on screen from the shot's start, dimmed, and lights up on its word.
  return (s.panes ?? []).map((p, i) => {
    const from = s.from;
    return {
      key: `${s.key}.${i}`,
      src: p.src ?? "",
      card: p.card,
      lightAt: Math.max(0, (p.at ?? s.from) - s.from),
      from,
      dur: s.from + s.dur - from,
      x0: i * PANE_W,
      width: PANE_W,
      pane: true,
      origin: p.origin,
      zoom: p.zoom ?? 1,
      push: s.push ?? PUSH.clip,
      grade: (p.grade ?? s.grade ?? "warm") as Grade,
      clear: p.clear ?? [],
    };
  });
});
export type Layer = (typeof LAYERS)[number];

/** Captions, with any caption pulled onto a free cut that lands in the silence just before it. */
export const CAPTIONS = (() => {
  const tied = new Set(RAW.map((c) => c.from));
  const free = SHOTS.map((s) => s.from).filter((f) => !tied.has(f));
  const out = RAW.map((c) => ({ ...c, wordAt: [...c.wordAt] }));
  for (let i = 1; i < out.length; i++) {
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
export const cap = (id: string) => CAPTIONS[capIndex(id)].from;

/** Absolute start of a shot by key. */
export const at = (key: string, offset = 0) => {
  const s = SHOTS.find((x) => x.key === key);
  if (!s) throw new Error(`no shot ${key}`);
  return s.from + offset;
};

// ---------------------------------------------------------------- overlays ---

/** Where the graphics sit (canvas px). scenes.tsx draws from these; OVERLAY_CLEAR keeps captions off them. */
export const LAYOUT = {
  /** The six game tiles across the top of the A/B beat. */
  tiles: { top: 40, size: 112, gap: 22, label: 30 },
  /** The hook's game card (middle pane): the icon block. */
  card: { iconTop: 250, icon: 270 },
  /** The role card's phone, right of centre. */
  phone: { left: 1300, top: 96, width: 330 },
  /** The morning's three game tiles, centred. */
  games: { top: 250, size: 210, gap: 60, cx: 1290 },
  /** The leaderboard card, right half. */
  board: { left: 1110, top: 120, width: 640, rowH: 104 },
  /** Clue banners, right half. */
  banners: { left: 1110, top: 150, width: 660 },
  /** The "HOW IT WORKS · n/5" pill + five bars. */
  chip: { top: 60, bottom: 112, left: 96, right: 610 },
  /** Where the night's reticle drifts from, and the guest it locks on (read off the n_dark probe). */
  target: { fromX: 560, fromY: 660, x: 1140, y: 600 },
  /** Three knives above a caption. */
  knives: { top: 470, size: 150 },
  /** The killers beat's knives sit high: the middle pane's face is below them. */
  knivesHigh: { top: 110, size: 150 },
} as const;

/** The five "How it works" steps, as frame ranges for the progress chip. */
export const STEPS = [
  { step: 1, from: cap("walk"), to: cap("night") },
  { step: 2, from: cap("night"), to: cap("morning") },
  { step: 3, from: cap("morning"), to: cap("clues") },
  { step: 4, from: cap("clues"), to: cap("talk") },
  { step: 5, from: cap("talk"), to: cap("noapp") },
];

const spoken = (word: string, after = 0) => sec(w(word, after)) - WORD_LEAD;

/** Every cue is an absolute frame on a spoken word. */
export const CUE = {
  /** The six game cards of the hook, one per name. */
  cards: [spoken("mafia"), spoken("among"), spoken("undercover"), spoken("pictionary"), spoken("flappy"), spoken("cluedo")],
  /** Then all six as a row of tiles: lit one at a time, then all at once. */
  tiles: {
    from: cap("played"),
    to: cap("killers"),
    pops: [0, 1, 2, 3, 4, 5].map((i) => cap("played") + i * 2),
    oneAt: spoken("one", 7),
    timeAt: spoken("time", 7.5),
    allSix: spoken("all", 8.5),
    six: spoken("six", 8.8),
    room: spoken("room", 11.5),
  },
  killers: { from: cap("killers"), to: cap("title"), hit: spoken("killers", 13) },
  title: { from: cap("title"), to: cap("live"), hit: spoken("three", 14.3) },
  role: {
    from: cap("role"),
    to: cap("night"),
    phoneIn: spoken("secret") - 4,
    slots: [spoken("killer", 20), spoken("doctor", 20.5), spoken("detective", 21)],
  },
  night: { from: cap("night"), to: cap("morning"), lock: spoken("target") },
  games: { from: cap("games"), to: cap("lowest"), pops: [spoken("undercover", 26.5), spoken("pictionary", 27.3), spoken("flappy", 28)] },
  board: { from: cap("lowest"), to: cap("clues"), lowest: spoken("lowest", 28.8), dies: spoken("dies"), rig: spoken("rig") },
  clues: { from: cap("clues"), to: cap("glasses"), cards: [spoken("clues", 32), spoken("drop", 32.5), spoken("killer", 33)] },
  traits: { pops: [spoken("glasses"), spoken("sneakers"), spoken("blacktop")] },
  talk: { pops: [spoken("talk"), spoken("bluff"), spoken("vote")] },
  die: spoken("die"),
  ghost: { from: cap("notout"), to: cap("noapp") },
  knives: { from: cap("knives"), to: cap("catch"), hit: spoken("three", 46.8), room: spoken("room", 48) },
  catchYou: spoken("you", 50.5),
  brand: {
    from: sec(BRAND_AT) - LEAD,
    to: EVENT_AT,
    title: spoken("three", 50.9),
    by: spoken("by", 52),
    astral: spoken("astral"),
    sidequest: spoken("sidequest"),
  },
  event: {
    from: EVENT_AT,
    to: TOTAL,
    friday: spoken("friday"),
    date: spoken("october"),
    place: spoken("backroom"),
    book: spoken("book"),
  },
} as const;

/** Graphics that matter: a caption may not sit on these either. Canvas px, absolute frames. */
const tileRow = (() => {
  const T = LAYOUT.tiles;
  const width = 6 * T.size + 5 * T.gap;
  return { x: [W / 2 - width / 2, W / 2 + width / 2] as [number, number], y: [T.top, T.top + T.size + T.label + 14] as [number, number] };
})();
const gameRow = (() => {
  const G = LAYOUT.games;
  const width = 3 * G.size + 2 * G.gap;
  return { x: [G.cx - width / 2, G.cx + width / 2] as [number, number], y: [G.top, G.top + G.size + 60] as [number, number] };
})();

export const OVERLAY_CLEAR: { from: number; to: number; y: [number, number]; x?: [number, number]; what: string }[] = [
  { from: STEPS[0].from, to: STEPS[4].to, y: [LAYOUT.chip.top, LAYOUT.chip.bottom], x: [LAYOUT.chip.left, LAYOUT.chip.right], what: "the step chip" },
  { from: CUE.tiles.from, to: CUE.tiles.to, y: tileRow.y, x: tileRow.x, what: "the six game tiles" },
  {
    from: CUE.role.phoneIn,
    to: CUE.role.to,
    y: [LAYOUT.phone.top, LAYOUT.phone.top + LAYOUT.phone.width * 2.16],
    x: [LAYOUT.phone.left - 20, LAYOUT.phone.left + LAYOUT.phone.width + 20],
    what: "the role phone",
  },
  { from: CUE.games.pops[0], to: CUE.games.to, y: gameRow.y, x: gameRow.x, what: "the three game tiles" },
  {
    from: CUE.board.from,
    to: CUE.board.to,
    y: [LAYOUT.board.top, LAYOUT.board.top + 110 + 5 * LAYOUT.board.rowH],
    x: [LAYOUT.board.left, LAYOUT.board.left + LAYOUT.board.width],
    what: "the leaderboard",
  },
  {
    from: CUE.clues.cards[0],
    to: CUE.clues.to,
    y: [LAYOUT.banners.top, LAYOUT.banners.top + 3 * 150],
    x: [LAYOUT.banners.left, LAYOUT.banners.left + LAYOUT.banners.width],
    what: "the clue banners",
  },
  { from: CUE.killers.from, to: CUE.killers.to, y: [LAYOUT.knivesHigh.top, LAYOUT.knivesHigh.top + LAYOUT.knivesHigh.size], x: [W / 2 - 330, W / 2 + 330], what: "the three knives" },
  { from: CUE.title.from, to: CUE.title.to, y: [LAYOUT.knives.top, LAYOUT.knives.top + LAYOUT.knives.size], x: [W / 2 - 330, W / 2 + 330], what: "the three knives" },
  { from: CUE.knives.from, to: CUE.knives.to, y: [LAYOUT.knives.top, LAYOUT.knives.top + LAYOUT.knives.size], x: [W / 2 - 330, W / 2 + 330], what: "the three knives" },
];

// --------------------------------------------------------------- the check ---

/** The box a caption occupies: exact height from CAPTION × scale, a conservative width estimate. */
export const captionBox = (c: { text: string; y: number; x?: number; w?: number; scale?: number }) => {
  const k = c.scale ?? 1;
  const lines = c.text.split(" / ");
  const h = lines.reduce((acc, l) => acc + (l.startsWith("!") ? CAPTION.lineXl : CAPTION.lineM), 0) * k;
  const width = Math.min(
    c.w ?? 1640,
    Math.max(...lines.map((l) => l.replace(/[*!]/g, "").length * (l.startsWith("!") ? CAPTION.xl * 0.62 : CAPTION.m * 0.56) * k + 40)),
  );
  const cx = c.x ?? W / 2;
  const x: [number, number] = [cx - width / 2, cx + width / 2];
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

/** A layer's keep-clear band on screen at layer-relative frame `rel` (canvas px). Panes clip at their edges. */
export const bandOnScreen = (L: Layer, k: Clear, rel: number) => {
  const [ox, oy] = originPx(L.origin, L.width, H);
  const sc = lensScale(rel, L.dur, L.push, L.zoom);
  const y = onScreen(k.y[0], k.y[1], oy, sc);
  const xl = k.x ? onScreen(k.x[0], k.x[1], ox, sc) : ([0, L.width] as [number, number]);
  const x: [number, number] = [L.x0 + Math.max(0, xl[0]), L.x0 + Math.min(L.width, xl[1])];
  return { x, y };
};

export type Collision = { caption: string; against: string; frame: number; captionY: [number, number]; bandY: [number, number] };

/**
 * RULE: text never sits on people's heads or on important things. Tests every
 * caption and the step chip against every keep-clear band of every layer it is
 * on screen over (exact lens, every frame), and every caption against every
 * graphic in OVERLAY_CLEAR. One entry per text/band pair.
 */
export const checkCaptions = (): Collision[] => {
  const out: Collision[] = [];
  for (const t of TEXT) {
    const box = t.box;
    for (const L of LAYERS) {
      for (const k of L.clear) {
        const from = Math.max(t.from, L.from + (k.from ?? 0));
        const to = Math.min(t.to, L.from + (k.to ?? L.dur));
        for (let f = from; f < to; f++) {
          const b = bandOnScreen(L, k, f - L.from);
          if (b.x[1] <= b.x[0]) continue;
          if (hits(box.y, b.y, MARGIN) && hits(box.x, b.x, MARGIN)) {
            out.push({ caption: t.label, against: `${L.key}: ${k.what}`, frame: f, captionY: box.y, bandY: b.y });
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
