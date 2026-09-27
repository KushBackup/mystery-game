/**
 * footage.ts — where every clip and photo comes from.
 *
 * `node scripts/reel/cut.mjs <instance>` cuts each clip from its master,
 * starting at `in`, for exactly as long as the timeline needs it (the longest
 * shot that uses it, plus half a frame). `out` is the master's next shot
 * boundary from `scan.mjs` — the cut REFUSES to run past it, because that
 * would show a frame of the next shot. Copy `out` from scenes.json exactly. Real speed, always: if a line is longer
 * than the shot, split the line across two shots in timeline.ts.
 *
 * Photos are cropped to 1080×1920 once (`vf` is an ffmpeg filter chain).
 * Logos are transparent PNGs cropped to their content, placed in
 * public/<assets>/ by hand (see the skill's design reference).
 *
 * WORKED EXAMPLE: the Astral Project × Greenr ad. Master = the GameNight reel
 * (1080×1920, 60fps HEVC, 88s); `#n` in each note is its shot number in
 * out/scan/GameNight/scenes.md.
 *
 * Pure data (Node imports it).
 */

export const MASTERS: Record<string, string> = {
  gn: "C:/Users/Kush/Downloads/GameNight.MP4",
};

export const CLIPS: Record<string, { master: string; in: number; out: number; note: string }> = {
  h1_room: { master: "gn", in: 58.13, out: 60.633, note: "#26 the room, standing — the hook" },
  h2_phones: { master: "gn", in: 55.97, out: 58.117, note: "#25 phones up across the room" },
  r1_phone: { master: "gn", in: 71.9, out: 77.083, note: "#31 curly man laughing, a woman in front" },
  g_standing: { master: "gn", in: 22.2, out: 23.983, note: "#6 standing round the tables" },
  z_room: { master: "gn", in: 60.7, out: 65.2, note: "#27 wide room, people standing" },
  s5_women: { master: "gn", in: 20.93, out: 22.183, note: "#5 two women on the sofa" },
  s2_walk: { master: "gn", in: 4.2, out: 5.25, note: "#1 walking in through the gate — the later, wider part, so the head sits below the step chip" },
  q_clap: { master: "gn", in: 85.33, out: 88.167, note: "#34 wide, clapping (behind the role phone)" },
  q_crowd: { master: "gn", in: 36.32, out: 38.083, note: "#14 wide crowd at night (behind the role phone)" },
  c1_tables: { master: "gn", in: 45.7, out: 47.617, note: "#20 seated tables (behind the clue notifications)" },
  n1_notes: { master: "gn", in: 44.2, out: 45.65, note: "#19 the handwritten suspect sheet" },
  r2_micman: { master: "gn", in: 31.3, out: 32.4, note: "#11 man with the mic — TALK" },
  t2_curly: { master: "gn", in: 34.8, out: 36.3, note: "#13 curly man with the mic — BLUFF" },
  v1_hands: { master: "gn", in: 66.6, out: 69.6, note: "#29 hands up with phones — the vote" },
  ae_room: { master: "gn", in: 77.1, out: 81.033, note: "#32 wide, standing crowd" },
  j1_laugh: { master: "gn", in: 74.6, out: 77.083, note: "#31 (later) the laughing pair" },
  k2_shrug: { master: "gn", in: 54.35, out: 55.967, note: "#24 the host, hands up" },
  c_scooter: { master: "gn", in: 5.3, out: 11.983, note: "#2 the scooter ride — 'or come solo'" },
  j2_winners: { master: "gn", in: 81.05, out: 85.317, note: "#33 the winners" },
  z_room2: { master: "gn", in: 62.5, out: 65.2, note: "#27 (later) wide room" },
  f_lights: { master: "gn", in: 41.44, out: 42.767, note: "#17 crowd under the fairy lights, suspect sheets in hand" },
  f_debate: { master: "gn", in: 42.79, out: 44.183, note: "#18 a group arguing it out — ACCUSE" },
};

/**
 * The reference photos arrived as chat attachments (temporary files). Once
 * cropped, the jpg in public/<assets>/ IS the master; cut.mjs skips a photo
 * whose source file no longer exists.
 */
const ATTACH = "C:/Users/Kush/AppData/Local/Temp/claude/s--Kush-UnityProjects-mystery-game/8a633f87-93b6-45a7-8009-73e48e76d37c/images";

export const PHOTOS: Record<string, { file: string; vf: string; note: string }> = {
  p1_point: { file: `${ATTACH}/1.png`, vf: "crop=1080:1920:840:0", note: "the 'Everyone has a secret' poster (its headline is inked over in the twist)" },
  p2_table: { file: `${ATTACH}/2.png`, vf: "crop=652:1159:1010:761,scale=1080:1920:flags=lanczos", note: "the long table, below its burned-in caption" },
  p3_reveal: { file: `${ATTACH}/3.jpg`, vf: "crop=1728:3072:1417:0,scale=1080:1920:flags=lanczos", note: "the reveal screen on a table of notes" },
};
