/**
 * footage.ts — where every clip comes from.
 *
 * The brand-awareness reel (2026-09-28). Master = the user's own finished edit,
 * "Murder mystery edit.mp4" (1080×1920, 30fps, 74.9s, music + the room's own
 * laughter and voices mixed in). `#n` in each note is its shot number in
 * out/scan/Murder mystery edit/scenes.md; every in/out below is a FRAME of
 * that 30fps master.
 *
 * SYNC. The reel's audio is the master's own track (see timeline.ts), so the
 * body shots must land on exactly the frame their sound does: reel frame =
 * master frame − AUDIO_IN (134). Each clip starts a quarter-frame before its
 * first frame (so `-ss` keeps that frame rather than skipping to the next),
 * and `out` is its shot boundary plus 10ms: cut.mjs cuts half a frame past the
 * shot's length, and the frame that lands in that half is never shown.
 *
 * Pure data (Node imports it).
 */

export const MASTERS: Record<string, string> = {
  mm: "C:/Users/Kush/Downloads/Murder mystery edit.mp4",
};

/** A clip from master frame `a` up to (not including) shot boundary `b`. */
const clip = (a: number, b: number, note: string) => ({ master: "mm", in: +((a - 0.25) / 30).toFixed(3), out: +(b / 30 + 0.01).toFixed(3), note });

export const CLIPS: Record<string, { master: string; in: number; out: number; note: string }> = {
  // HOOK — the edit's strobe flashes, played back to back over its filtered build (the black beats between them are gone).
  // Its selfie (#5) and phone-reader (#7) faces reach the top of frame, where the hook sits, so they play in the
  // last second before the drop, after the hook has left the screen.
  m_gasp: clip(167, 179, "#11 a guest gasping — frame 0 (3 frames in, at the peak of the gasp)"),
  m_think: clip(1410, 1430, "#45 a guest thinking, chin on hand, under the fairy lights (from the edit's later half)"),
  m_table: clip(10, 25, "#1 a table, wide, warm light"),
  m_laugh: clip(194, 208, "#13 a man laughing, clapping, under the fairy lights"),
  m_table2: clip(41, 56, "#3 a table working it out"),
  m_selfie: clip(72, 88, "#5 a guest in glasses, selfie-close — in the clean run-up to the drop"),
  m_phone: clip(104, 119, "#7 a guest reading her phone — in the clean run-up to the drop"),
  m_typing: clip(133, 148, "#9 thumbs on a phone"),
  // BODY — the edit itself from its drop (#17) to hands-on-head (#40), frame-locked to its audio.
  b_crowd: clip(251, 280, "#17 the room on its feet"),
  b_role: clip(280, 311, "#18 a role on a phone"),
  b_group: clip(311, 335, "#19 a group, mid-argument"),
  b_phones: clip(335, 363, "#20 a phone in two hands"),
  b_grin: clip(363, 392, "#21 the host, grinning at camera"),
  b_reader: clip(392, 485, "#22 a man reading to the room"),
  b_laughs: clip(485, 535, "#23 a guest laughing (real laughter on the track)"),
  b_orange: clip(535, 604, "#24 a guest in orange, accusing"),
  b_finger: clip(604, 679, "#25 a guest wagging a finger"),
  b_whip: clip(679, 705, "#26 whip pan onto a guest in green"),
  b_laptop: clip(705, 842, "#27 the host at the laptop, talking to camera"),
  b_scratch: clip(842, 931, "#28 a guest scratching his head over his phone"),
  b_mic: clip(931, 1000, "#29 a man with the mic, pointing"),
  b_whip2: clip(1000, 1012, "#30 whip"),
  b_whip3: clip(1012, 1024, "#31 whip"),
  b_stand: clip(1024, 1060, "#32 the host standing at the back"),
  b_shock1: clip(1060, 1072, "#33 a guest, shocked (wide)"),
  b_shock2: clip(1072, 1085, "#34 the same guest, closer"),
  b_shock3: clip(1085, 1102, "#35 the same guest, close, mouth open"),
  b_man: clip(1102, 1116, "#36 a man with a phone"),
  b_cheek: clip(1116, 1128, "#37 a man, hand on cheek"),
  b_shout: clip(1128, 1140, "#38 a guest shouting"),
  b_orange2: clip(1141, 1156, "#39 the guest in orange, turning — from its 2nd frame: the edit's own frame 1140 is black (33ms early, invisible on a 0.5s shot)"),
  b_heads: clip(1156, 1184, "#40 hands on heads"),
  // SIGN-OFF
  e_mic: clip(1270, 1359, "#43 a guest at the mic, smiling, the host grinning behind her"),
  e_plate: clip(1676, 1930, "#51 a guest talking to camera, blurred to a plate under the logos"),
};

export const PHOTOS: Record<string, { file: string; vf: string; note: string }> = {};
