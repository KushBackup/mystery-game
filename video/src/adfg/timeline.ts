/**
 * timeline.ts — the brand-awareness reel, timed to the MUSIC. The file you edit.
 *
 * THIS REEL HAS NO VOICEOVER. It is a feel-good cut of the user's own edit
 * ("Murder mystery edit.mp4") for brand awareness: nothing is sold, there is
 * no date, price or button. The user chose (2026-09-28) to keep the edit's own
 * soundtrack — its music with the room's real laughter and voices mixed in —
 * and short text beats written for it. So the clock is the soundtrack:
 *
 *   AUDIO     the master's own track from AUDIO_IN (frame 134, 4.47s) to the
 *             kick at 39.10s, then spliced kick-to-kick onto 50.25s to carry
 *             the music under the sign-off, fading out. Built by
 *             scripts/reel/soundtrack.mjs from AUDIO below.
 *   SHOTS     reel frame = master frame − 134 for every body shot, so each
 *             face stays on the frame its own voice and laughter do. The music
 *             drops at reel frame 117. Before it, the edit strobed: flash, black,
 *             flash, black. The black beats are gone; the eight flashes play back
 *             to back, each cut within a frame of a kick of the filtered build.
 *   CAPTIONS  explicit frames. Each caption starts on a cut or a kick; `pop`
 *             lists the frame each word appears (missing words follow 4 frames
 *             apart). The red box grows word by word, as in every reel.
 *   KEEP-CLEAR  unchanged from the template: captions NEVER sit on heads, faces
 *             or important things. Every shot lists its `clear` bands, read off
 *             the probe sheets; checkCaptions() tests every frame with the lens
 *             move applied.
 *
 * Caption markup: " / " breaks a line, *segment* gets the red highlight box, a
 * line starting with "!" is set extra large (punch words).
 *
 * FACT DISCIPLINE — every line is true of the Killers Night format the next
 * night plays (secret roles, clues that point at a real guest, murders, a room
 * vote, three killers so "a killer", not "the killer"). No numbers, no quotes,
 * no date. The sign-off line is true: the next night is booked.
 *
 * Erasable TypeScript only: Node imports this file for the checks and the audio.
 */

import { PUSH, lensScale, onScreen, originPx } from "./lens.ts";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** Minimum gap (px) between text and anything it must keep clear of. Probe readings are ±15px. */
export const MARGIN = 24;

export const sec = (s: number) => Math.round(s * FPS);

/** The master frame the reel's first frame of audio comes from. */
export const AUDIO_IN = 134;
/** Reel frame of a body shot that starts on master frame `m`: picture stays on its own sound. */
const body = (m: number) => m - AUDIO_IN;

/** The reel: 39.0s. */
export const TOTAL = 1170;
/** The music drops here (master frame 251). */
export const DROP = body(251);
/** The sign-off starts here, after hands-on-heads (master frame 1184). */
// One frame early: the edit's frame 1140 is black, so hands-on-heads and the sign-off each move up a frame (33ms ahead of their sound).
export const SIGNOFF = body(1183);

/**
 * The soundtrack, as master-time segments laid end to end. The splice is kick
 * to kick on the same 123 BPM grid (both points measured onsets), with a 20ms
 * equal-power crossfade; the tail fades out under the logos.
 */
export const AUDIO = {
  master: "mm",
  parts: [
    { from: AUDIO_IN / FPS, to: 39.088 },
    { from: 50.261, to: 50.261 + (TOTAL / FPS - (39.088 - AUDIO_IN / FPS)) + 0.05 },
  ],
  crossfade: 0.02,
  fadeOut: 1.6,
  lufs: -14,
  truePeak: -1.5,
} as const;

// ------------------------------------------------------------ caption type ---

/** Caption type sizes. kit.tsx renders with these; the keep-clear check measures with them. */
export const CAPTION = { m: 90, xl: 236, lineM: 90 * 1.1, lineXl: 236 * 0.98 + 16 } as const;

// ---------------------------------------------------------------- captions ---

type CapSpec = { text: string; y: number; from: number; to?: number; pop?: number[]; align?: "left" | "center"; scale?: number };

/**
 * `y` is the caption block's vertical centre, chosen from the free bands of the
 * shots under it, inside the 270–1232 safe box. `from` is a cut or a kick. A
 * caption holds until the next one starts, or until `to` when the shot after
 * it has no free band (the role phone, the host's grin, the reaction burst):
 * those beats play clean rather than put words on a face.
 *
 * Most beats sit in the top band (y 350–380) because that is where this
 * footage is empty: ceilings, lamps and brick above the heads. The rest go
 * where a shot opens up — mid-frame over the laughing room, low under the
 * finger-wag (pushed up from the bottom edge), bottom-left beside the laptop.
 */
const CAP_SPECS: CapSpec[] = [
  // HOOK — A (a dinner) vs B (a murder); "POV" puts the viewer at the table. "murder" lands on the kick at 28.
  // "POV: dinner," is already up on frame 0 (the thumbnail frame).
  // Scale 0.8: the gasp's hair starts at y 455, so the hook has 270–431 to live in.
  { text: "POV: dinner, / but make it *murder.*", y: 350, scale: 0.8, from: 0, pop: [-6, -2, 12, 16, 20, 28] },
  // The open loop, paid off by "NOBODY saw it coming". "a killer": the new format deals three.
  // "a killer." on the kick at 72; it leaves on the kick at 87, before the two faces of the run-up.
  { text: "Someone in this room / is *a killer.*", y: 350, scale: 0.8, from: 43, to: 87, pop: [43, 47, 51, 55, 60, 72, 76] },
  // The drop. Clean over the role phone, which fills the frame (and says the name itself).
  { text: "Everyone gets / a *secret role.*", y: 380, from: DROP, to: body(280), pop: [DROP, DROP + 4, DROP + 10, DROP + 14, DROP + 18] },
  // "who's who" on the phone cut. Clean over the host's grin.
  { text: "Nobody knows / *who's who.*", y: 364, scale: 0.94, from: body(311), to: body(363), pop: [body(311), body(311) + 4, body(335), body(335) + 5] },
  { text: "Then someone / *gets murdered.*", y: 356, scale: 0.86, from: body(392), pop: [body(392), body(392) + 4, body(392) + 22, body(392) + 27] },
  // Over the laughing room: the heads sit low, so this one sits mid-frame.
  { text: "Everyone's / *a suspect.*", y: 480, from: body(485), pop: [body(485), body(485) + 9, body(485) + 13] },
  { text: "You accuse. / They *deny.*", y: 365, scale: 0.95, from: body(535), pop: [body(535), body(535) + 4, body(535) + 30, body(535) + 36] },
  // Low, under her face (the shot is pushed up from the bottom edge); the fingertip stays clear.
  { text: "Your best friend / *looks guilty.*", y: 1109, from: body(604), pop: [body(604), body(604) + 4, body(604) + 8, body(604) + 30, body(604) + 35] },
  // Bottom-left, beside the host and clear of the laptop.
  { text: "Every clue / points at / *someone.*", y: 1068, align: "left", scale: 0.8, from: body(679), pop: [body(679), body(679) + 4, body(705), body(705) + 5, body(705) + 10] },
  { text: "You don't / know who. / *Yet.*", y: 1068, align: "left", scale: 0.8, from: body(774), to: body(842), pop: [body(774), body(774) + 4, body(774) + 8, body(774) + 12, body(774) + 38] },
  // Leaves before his head rises into it (the edit pushes in on him).
  { text: "So you / *overthink everything.*", y: 350, scale: 0.8, from: body(842), to: body(842) + 50, pop: [body(842), body(842) + 4, body(842) + 12, body(842) + 20] },
  { text: "Then the room / *votes.*", y: 364, scale: 0.94, from: body(931), pop: [body(931), body(931) + 4, body(931) + 8, body(931) + 24] },
  { text: "And the killer / is…", y: 364, scale: 0.94, from: body(1000), pop: [body(1000), body(1000) + 4, body(1000) + 8, body(1024) + 6] },
  // The payoff on the three gasps (pushed down from the top edge). Full-size lines, not an XL word: an XL line
  // plus a second line would not fit above her face without a 35% push. Then the reaction burst plays clean.
  { text: "*NOBODY* / saw it coming.", y: 378, from: body(1060), to: body(1102), pop: [body(1060), body(1072), body(1072) + 4, body(1072) + 8] },
  // SIGN-OFF — belonging, not a pitch.
  { text: "Already planning / *the next one.*", y: 362, scale: 0.92, from: SIGNOFF, pop: [SIGNOFF, SIGNOFF + 4, SIGNOFF + 14, SIGNOFF + 18, SIGNOFF + 22] },
];

const wordCount = (text: string) => text.replace(/[*!]/g, "").split(/\s+|\//).filter((t) => t.replace(/[^\p{L}\p{N}…]/gu, "")).length;

export const CAPTIONS = CAP_SPECS.map((c, i) => {
  const n = wordCount(c.text);
  const pop = c.pop ?? [c.from];
  const wordAt = Array.from({ length: n }, (_, k) => pop[k] ?? pop[pop.length - 1] + 4 * (k - pop.length + 1));
  const to = c.to ?? CAP_SPECS[i + 1]?.from ?? TOTAL;
  return { text: c.text, y: c.y, align: c.align ?? ("center" as "left" | "center"), scale: c.scale ?? 1, from: c.from, to, wordAt };
});
export type CaptionData = (typeof CAPTIONS)[number];

/** Frame a caption appears. */
export const cap = (i: number) => CAPTIONS[i].from;

// ------------------------------------------------------------------- shots ---

/** A band a caption must keep clear of, in SOURCE-frame px (as read off the probe grid). */
export type Clear = {
  y: [number, number];
  x?: [number, number];
  from?: number;
  to?: number;
  what: string;
};

type ShotSpec = {
  key: string;
  src: string;
  kind: "clip" | "photo";
  /** Absolute start frame. The shot runs until the next one starts. */
  at: number;
  grade?: "warm" | "noir" | "dim" | "plate";
  origin?: string;
  push?: number;
  zoom?: number;
  /** A soft bone flash on the cut in: marks a new section. */
  section?: boolean;
  clear?: Clear[];
};

const TOP = "50% 0%"; // push in from the top edge: faces only ever move DOWN, away from the top-band text
const BOTTOM = "50% 100%"; // push in from the bottom edge: the face moves UP, opening the band below it

const SPECS: ShotSpec[] = [
  // Every `clear` band below was read off the probe sheets (scripts/reel/probe.mjs):
  // the union over the clip's first, middle and last frame, padded ~15px.
  // HOOK montage: cuts at 12 28 43 58 72 87 102 — the build's kicks sit at 12.3 27.6 42.9 57.6 72.2 87.5 101.4.
  // Only six of the edit's flashes have a free top band; the hook lives on those, the last two play clean.
  // The gasp is frame 0 and a flash-forward: the same guest is the payoff at NOBODY.
  { key: "gasp", src: "m_gasp", kind: "clip", at: 0, origin: TOP, clear: [{ y: [455, 1235], what: "her face" }] },
  {
    key: "think",
    src: "m_think",
    kind: "clip",
    at: 12,
    origin: TOP,
    clear: [
      { y: [565, 1320], what: "her face and the hand on her chin" },
      { y: [455, 625], x: [140, 400], what: "a guest behind her" },
    ],
  },
  { key: "table", src: "m_table", kind: "clip", at: 28, origin: TOP, clear: [{ y: [515, 1110], what: "the heads round the table" }] },
  { key: "table2", src: "m_table2", kind: "clip", at: 43, origin: TOP, clear: [{ y: [515, 1015], what: "the heads round the table" }] },
  { key: "laugh", src: "m_laugh", kind: "clip", at: 58, origin: TOP, clear: [{ y: [755, 1310], what: "his face and the clapping hands" }] },
  { key: "typing", src: "m_typing", kind: "clip", at: 72, origin: TOP, clear: [{ y: [585, 1300], what: "the phone and her hand" }] },
  // The run-up to the drop plays clean: both faces reach the top of frame.
  { key: "selfie", src: "m_selfie", kind: "clip", at: 87, clear: [{ y: [0, 1460], x: [0, 740], what: "her face" }] },
  { key: "phone", src: "m_phone", kind: "clip", at: 102, clear: [{ y: [280, 730], x: [330, 1060], what: "her face" }, { y: [1150, 1620], what: "her phone" }] },
  // BODY — frame-locked to the soundtrack.
  { key: "crowd", src: "b_crowd", kind: "clip", at: body(251), section: true, clear: [{ y: [560, 930], what: "the room's heads" }] },
  { key: "role", src: "b_role", kind: "clip", at: body(280), clear: [{ y: [170, 1255], what: "the phone (its screen names the game)" }] },
  { key: "group", src: "b_group", kind: "clip", at: body(311), clear: [{ y: [585, 1125], what: "the group's heads" }] },
  { key: "phones", src: "b_phones", kind: "clip", origin: TOP, at: body(335), clear: [{ y: [480, 1430], what: "the phone screen" }] },
  { key: "grin", src: "b_grin", kind: "clip", at: body(363), clear: [{ y: [0, 740], what: "the host's face" }] },
  {
    key: "reader",
    src: "b_reader",
    kind: "clip",
    origin: TOP,
    at: body(392),
    clear: [
      { y: [465, 670], what: "the reader and the man beside him" },
      { y: [770, 1215], what: "the seated heads and the phone in hand" },
    ],
  },
  { key: "laughs", src: "b_laughs", kind: "clip", at: body(485), clear: [{ y: [735, 905], what: "the laughing guest and the room's heads" }] },
  // Pushed down from the top edge so her head clears the two-line caption above it.
  {
    key: "orange",
    src: "b_orange",
    kind: "clip",
    at: body(535),
    origin: TOP,
    zoom: 1.12,
    clear: [
      { y: [430, 830], x: [130, 720], what: "her face" },
      { y: [670, 915], x: [690, 1080], what: "the guests behind her" },
      { y: [820, 1115], x: [570, 770], what: "the mic" },
    ],
  },
  // Pushed up from the bottom edge: her face rises, the band under it opens for the caption.
  {
    key: "finger",
    src: "b_finger",
    kind: "clip",
    at: body(604),
    origin: BOTTOM,
    zoom: 1.2,
    clear: [
      { y: [90, 1120], x: [230, 1080], what: "her face" },
      { y: [830, 1000], x: [80, 420], what: "the wagging fingertip" },
    ],
  },
  { key: "whip", src: "b_whip", kind: "clip", at: body(679), clear: [{ y: [540, 900], what: "the heads at the table" }] },
  {
    key: "laptop",
    src: "b_laptop",
    kind: "clip",
    at: body(705),
    clear: [
      { y: [0, 915], x: [0, 640], what: "the host's face" },
      { y: [690, 1520], x: [620, 1080], what: "the laptop and his hand on it" },
    ],
  },
  {
    key: "scratch",
    src: "b_scratch",
    kind: "clip",
    origin: TOP,
    at: body(842),
    clear: [
      // His head rises as the edit pushes in: y 590 at frame 0, 520 by frame 50, 290 by the end.
      { y: [460, 1060], to: 50, what: "his face (the edit pushes in on him)" },
      { y: [280, 1060], from: 50, what: "his face, pushed in" },
      { y: [820, 1160], x: [0, 360], what: "the laughing guests behind" },
    ],
  },
  { key: "mic", src: "b_mic", kind: "clip", at: body(931), clear: [{ y: [505, 820], what: "his face and the guest behind" }] },
  { key: "whip2", src: "b_whip2", kind: "clip", at: body(1000), clear: [{ y: [600, 730], x: [400, 700], what: "a guest (in the blur)" }] },
  { key: "whip3", src: "b_whip3", kind: "clip", at: body(1012), clear: [{ y: [980, 1200], what: "the table's heads (in the blur)" }] },
  { key: "stand", src: "b_stand", kind: "clip", origin: TOP, at: body(1024), clear: [{ y: [485, 1190], what: "the host, then the gasping guest" }] },
  // The payoff: the three gasps, each pushed down from the top edge to clear NOBODY above them.
  { key: "shock1", src: "b_shock1", kind: "clip", at: body(1060), section: true, origin: TOP, clear: [{ y: [770, 1215], what: "her face" }] },
  { key: "shock2", src: "b_shock2", kind: "clip", at: body(1072), origin: TOP, zoom: 1.16, clear: [{ y: [440, 1240], what: "her face" }] },
  { key: "shock3", src: "b_shock3", kind: "clip", at: body(1085), origin: TOP, zoom: 1.26, clear: [{ y: [405, 1240], what: "her face" }] },
  // The reaction burst — no text on it.
  { key: "man", src: "b_man", kind: "clip", at: body(1102), clear: [{ y: [0, 420], what: "his face" }, { y: [480, 730], x: [0, 520], what: "his phone" }] },
  { key: "cheek", src: "b_cheek", kind: "clip", at: body(1116), clear: [{ y: [170, 1260], what: "his face" }] },
  { key: "shout", src: "b_shout", kind: "clip", at: body(1128), clear: [{ y: [570, 910], what: "her face" }] },
  { key: "orange2", src: "b_orange2", kind: "clip", at: body(1140), clear: [{ y: [190, 960], what: "her face and the guest behind" }] },
  { key: "heads", src: "b_heads", kind: "clip", at: body(1155), clear: [{ y: [740, 1110], what: "the host, hands on his head" }] },
  // SIGN-OFF — a guest at the mic, smiling, then a plate (blurred to texture) under the logos.
  { key: "together", src: "e_mic", kind: "clip", at: SIGNOFF, section: true, origin: TOP, zoom: 1.12, clear: [{ y: [430, 1000], what: "her face and the guests behind" }] },
  { key: "plate", src: "e_plate", kind: "clip", at: SIGNOFF + 50, grade: "plate" },
];

export const SHOTS = SPECS.map((s, i) => ({ ...s, dur: (SPECS[i + 1]?.at ?? TOTAL) - s.at, from: s.at }));
export type Shot = (typeof SHOTS)[number];

/** Absolute start of a shot by key. */
export const at = (key: string, offset = 0) => {
  const s = SHOTS.find((x) => x.key === key);
  if (!s) throw new Error(`no shot ${key}`);
  return s.from + offset;
};

// ---------------------------------------------------------------- overlays ---

/** Where the graphics sit. scenes.tsx draws from these; OVERLAY_CLEAR keeps captions off them. */
export const LAYOUT = {
  /** The Astral Project × Greenr lockup on the plate (measured on a still). */
  logos: { top: 820, bottom: 1110 },
} as const;

/** No "how it works" steps in this reel. */
export const STEPS: { step: number; from: number; to: number }[] = [];

export const CUE = {
  drop: DROP,
  nobody: body(1060),
  signoff: { from: SIGNOFF, to: TOTAL, logos: SIGNOFF + 50 },
} as const;

/** Graphics that matter: a caption may not sit on these either. Canvas px, absolute frames. */
export const OVERLAY_CLEAR: { from: number; to: number; y: [number, number]; x?: [number, number]; what: string }[] = [
  { from: CUE.signoff.logos, to: TOTAL, y: [LAYOUT.logos.top, LAYOUT.logos.bottom], what: "the Astral × Greenr logos" },
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

/** Every piece of on-screen TEXT the keep-clear rule covers. */
export const TEXT = CAPTIONS.map((c) => ({ label: `"${c.text}"`, from: c.from, to: c.to, box: captionBox(c), isCaption: true }));

const hits = (a: [number, number], b: [number, number], m: number) => a[0] < b[1] + m && a[1] + m > b[0];

export type Collision = { caption: string; against: string; frame: number; captionY: [number, number]; bandY: [number, number] };

/**
 * RULE: text never sits on people's heads or on important things. Tests every
 * caption against every keep-clear band of every shot it is on screen over
 * (with that shot's exact lens scale, on every frame), and against every
 * graphic in OVERLAY_CLEAR.
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
    for (const g of OVERLAY_CLEAR) {
      if (g.from >= t.to || g.to <= t.from) continue;
      if (hits(box.y, g.y, MARGIN) && hits(box.x, g.x ?? [0, W], MARGIN)) {
        out.push({ caption: t.label, against: g.what, frame: Math.max(t.from, g.from), captionY: box.y, bandY: g.y });
      }
    }
  }
  return out;
};
