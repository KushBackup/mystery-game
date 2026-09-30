/**
 * footage.ts — where every clip and photo comes from.
 *
 * `node scripts/reel/cut.mjs src/adtn` cuts each clip from its master,
 * starting at `in`, for exactly as long as the timeline needs it. `out` is the
 * master's next shot boundary from scan.mjs (out/scan/GameNight/scenes.json);
 * the cut refuses to run past it. Real speed, always.
 *
 * Master = the GameNight reel (1080×1920, 60fps HEVC, 88s). `#n` in each note
 * is its shot number in out/scan/GameNight/scenes.md. Shots #7, #10 and #22 are
 * letterboxed landscape clips and #4 carries the old case's burned-in title:
 * all dropped. A few shots are used twice, at different moments of the shot
 * (or once bright and once dimmed under a graphic); the notes say which.
 *
 * Pure data (Node imports it).
 */

export const MASTERS: Record<string, string> = {
  gn: "C:/Users/Kush/Downloads/GameNight.MP4",
};

export const CLIPS: Record<string, { master: string; in: number; out: number; note: string }> = {
  // HOOK
  h_open: { master: "gn", in: 38.1, out: 40.067, note: "#15 a guest bursting with excitement, card held up — the OPENING frame" },
  h_clap: { master: "gn", in: 85.35, out: 88.167, note: "#34 (early, before the pan blurs) guests clapping" },
  h_room: { master: "gn", in: 58.13, out: 60.633, note: "#26 the whole room, standing" },
  h_phones: { master: "gn", in: 55.967, out: 58.117, note: "#25 phones up across the room — the three reticles (and the twist callback)" },
  h_stare: { master: "gn", in: 32.45, out: 34.783, note: "#12 (early) a guest at the mic, mid-sentence — the hook's pause, no caption" },
  // WHAT
  w_laugh: { master: "gn", in: 72.6, out: 77.083, note: "#31 (early, after the rack focus lands) the curly man laughing with friends" },
  w_tables: { master: "gn", in: 45.66, out: 47.617, note: "#20 seated tables, phones out — 'a live party game'" },
  w_group: { master: "gn", in: 22.19, out: 23.983, note: "#6 a group huddled round their phones — 'on your phone!'" },
  w_host: { master: "gn", in: 54.32, out: 55.967, note: "#24 the host, hands up — 'here's how it works'" },
  // HOW 1
  s_walk: { master: "gn", in: 4.2, out: 5.25, note: "#1 walking in through the gate (the later, wider part)" },
  s_dimcrowd: { master: "gn", in: 79.2, out: 81.033, note: "#32 (later) the standing crowd (dim, behind the arrival quiz)" },
  s_crowd: { master: "gn", in: 36.3, out: 38.083, note: "#14 wide crowd at night (dim, behind the role card)" },
  // HOW 2
  n_crowd: { master: "gn", in: 77.1, out: 81.033, note: "#32 wide standing crowd — night falls, the slash" },
  d_road: { master: "gn", in: 12.0, out: 16.55, note: "#3 the road in morning light (dim, behind the dawn phone grid: no people)" },
  // HOW 3
  c_dimlaugh: { master: "gn", in: 75.2, out: 77.083, note: "#31 (late) the laughing pair (dim, behind the clue banners)" },
  c_people: { master: "gn", in: 60.65, out: 65.2, note: "#27 (early) the room's guests, standing — 'real people'" },
  c_glasses: { master: "gn", in: 47.62, out: 49.55, note: "#21 a woman in glasses reading her phone at the mic — GLASSES" },
  c_shoes: { master: "gn", in: 81.05, out: 85.317, note: "#33 (early) full-length, her sandals in shot — SHOES" },
  c_look: { master: "gn", in: 20.93, out: 22.183, note: "#5 two friends on the sofa — LOOK" },
  c_ask: { master: "gn", in: 42.79, out: 44.183, note: "#18 a group arguing it out — ASK" },
  c_bluff: { master: "gn", in: 34.8, out: 36.3, note: "#13 the curly man grinning at the mic — BLUFF" },
  // HOW 4
  v_hands: { master: "gn", in: 66.55, out: 69.6, note: "#29 hands up with phones — the vote" },
  v_blur: { master: "gn", in: 69.6, out: 71.833, note: "#30 the room erupts (dim, behind the reveal card)" },
  // HOW 5
  g_empty: { master: "gn", in: 65.2, out: 66.533, note: "#28 an empty table, a bag, a paper — 'get killed?'" },
  g_alive: { master: "gn", in: 82.1, out: 85.317, note: "#33 (later) the pair laughing and clapping — 'You're not out'" },
  g_ghost: { master: "gn", in: 40.067, out: 41.417, note: "#16 the host, still, staring down the lens as the camera closes in — graded as a GHOST" },
  // WHY
  y_table: { master: "gn", in: 27.59, out: 29.2, note: "#9 a table of friends just talking — 'no script'" },
  y_phones: { master: "gn", in: 68.85, out: 69.6, note: "#29 (late) hands up with phones — 'no app'" },
  y_phone: { master: "gn", in: 48.5, out: 49.55, note: "#21 (late) a guest reading her phone at the mic — 'to download'" },
  y_scooter: { master: "gn", in: 5.3, out: 11.983, note: "#2 the scooter ride — 'come solo'" },
  y_everyone: { master: "gn", in: 62.6, out: 65.2, note: "#27 (later) the room's guests — 'leave knowing everyone'" },
};

/**
 * The two photos were cropped to 1080×1920 for the Greenr ad (public/ad60/);
 * they are copied here as-is.
 */
const AD60 = "S:/Kush/UnityProjects/mystery-game/video/public/ad60";

export const PHOTOS: Record<string, { file: string; vf: string; note: string }> = {
  p1_point: { file: `${AD60}/p1_point.jpg`, vf: "null", note: "the 'Everyone has a secret' poster: pointing at the viewer (its headline is inked over)" },
  p2_table: { file: `${AD60}/p2_table.jpg`, vf: "null", note: "the long table, a bottle in hand — DRINK, then the end-card plate" },
};
