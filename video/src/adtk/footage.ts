/**
 * footage.ts — where every clip comes from.
 *
 * `node scripts/reel/cut.mjs src/adtk` cuts each clip from its master, starting
 * at `in`, for exactly as long as the timeline needs it. `out` is where the
 * usable take ends (here: the end of the file — none of these masters has an
 * internal cut, checked with scene detection); the cut refuses to run past it.
 * Real speed, always.
 *
 * Masters = the user's folder S:\Kush\Videos (2026-10-11).
 *   - 10 HORIZONTAL takes: 4K HLG HEVC from the 3 Oct Greenr Panjim night, plus
 *     three SDR 4K mp4s and one 1080p selfie. They fill the frame (`size: "full"`).
 *   - 10 VERTICAL 1080p HLG takes from older venues (accusing, face palms,
 *     thinking, the mic). The user chose split screens for these: each is cut
 *     to one pane (`size: "pane"`, a third of the frame) and three sit side by side.
 *   cut.mjs tonemaps every HLG (arib-std-b67) master to SDR BT.709 first; without
 *   it the iPhone HDR footage plays flat and grey.
 *
 * Dropped: the drive to the venue (off-topic), CameraZoomingOnPlayersScreen
 * (it shows the OLD game's UI), and the shaky middle of PlayersAccusingEachOther.
 *
 * Pure data (Node imports it).
 */

const V = "S:/Kush/Videos";

export const MASTERS: Record<string, string> = {
  // horizontal
  clap: `${V}/GameEndingPeopleClappingShot.MOV`,
  close: `${V}/CloseRoomPanOfPeoplePlayingGame.MOV`,
  host: `${V}/KushExplainingTheGameToPeople.MOV`,
  card: `${V}/KushNameCardShowing.mp4`,
  laugh2: `${V}/PeopleTalkingAndLaugh.mp4`,
  phone: `${V}/PlayingTheGameOnPhone.MOV`,
  pan: `${V}/RoomPanShot.MOV`,
  table: `${V}/ShotOfTheRoomFromADistance.MOV`,
  thumbs: `${V}/ThumbsUpAndLaughing.MOV`,
  seniors: `${V}/UncleAuntyPanShot.mp4`,
  // vertical
  conf: `${V}/PlayerConfused2.MOV`,
  talkcam: `${V}/PlayerTalkingToTheCamera.MOV`,
  testi: `${V}/PlayerTestimonial.MOV`,
  think: `${V}/PlayerThinking.MOV`,
  accuse: `${V}/PlayersAccusingEachOther.MOV`,
  theory: `${V}/PlayersDiscussingTheirTHeories.MOV`,
  palm: `${V}/PlayersDoingFacePalm.MOV`,
  serious: `${V}/PlayersDoingSeriousDiscussion.MOV`,
  laughv: `${V}/PlayersLaughingNormal.MOV`,
};

/** End of each master (s): the hard limit for `out`. */
const END = {
  clap: 18.43, close: 12.73, host: 5.19, card: 2.75, laugh2: 1.87, phone: 7.86, pan: 13.23, table: 17.16, thumbs: 2.29, seniors: 1.68,
  conf: 8.86, talkcam: 10.53, testi: 23.1, think: 35.46, accuse: 11.06, theory: 72.76, palm: 7.05, serious: 16.3, laughv: 3.76,
} as const;

type Clip = { master: keyof typeof END; in: number; out: number; size: "full" | "pane"; vf?: string; note: string };
const full = (master: keyof typeof END, inS: number, note: string, vf?: string): Clip => ({ master, in: inS, out: END[master], size: "full", vf, note });
const pane = (master: keyof typeof END, inS: number, note: string): Clip => ({ master, in: inS, out: END[master], size: "pane", note });

/** A horizontal 4K take used as a pane: a third of its width, starting `x` (0–1) across. No upscaling. */
const third = (master: keyof typeof END, inS: number, x: number, note: string, pre = ""): Clip => ({
  master,
  in: inS,
  out: END[master],
  size: "pane",
  vf: `${pre}crop=iw/3:ih:iw*${x}:0`,
  note,
});

export const CLIPS: Record<string, Clip> = {
  // HOOK — each game name sits on its own card in the middle pane, footage either side.
  m_crowd: pane("serious", 0.0, "a standing crowd round a table — MAFIA"),
  m_mic: pane("theory", 2.2, "the mic man arguing his theory"),
  a_lit: third("pan", 0.0, 0.08, "a guest lit by his phone in the dark — AMONG US"),
  a_stare: pane("accuse", 0.3, "a standing crowd, staring"),
  u_scratch: pane("conf", 0.2, "a man scratching his head at his phone — UNDERCOVER"),
  u_palm: pane("palm", 0.2, "a table of face palms"),
  p_sketch: third("phone", 0.0, 0.12, "a phone showing the sketch grid — PICTIONARY"),
  p_paper: pane("testi", 15.8, "a guest reading her sheet"),
  f_left: third("close", 2.0, 0.0, "the table tapping their phones (left) — FLAPPY BIRD"),
  f_right: third("close", 2.0, 0.6667, "the table tapping their phones (right)"),
  c_card: third("card", 0.0, 0.2, "the host's name card with the chalk outline — CLUEDO (mirrored selfie, flipped)", "hflip,"),
  c_think: pane("think", 10.2, "the man in glasses, hand on cheek"),
  // A / B
  o_seniors: full("seniors", 0.0, "two guests at a table, one game at a time"),
  o_laugh: full("laugh2", 0.0, "three guests at the long table"),
  b_hands: full("clap", 3.6, "the room, a phone held up (after the exposure settles)"),
  b_room: full("pan", 6.4, "the whole room, every phone out"),
  k_man: pane("testi", 3.4, "a guest, sly, into the lens — THREE OF YOU"),
  k_glasses: pane("think", 0.2, "a woman in glasses, mid-theory"),
  k_eyes: pane("palm", 4.2, "a woman, eyes down, unreadable"),
  // WHAT
  w_title: full("table", 2.0, "the low table shot — a plate under the title"),
  w_phones: full("close", 5.4, "a full table on their phones — 'a live party game on your phone'"),
  // HOW
  s_walk: full("clap", 0.0, "guests walking in past the stairs"),
  s_host: full("host", 0.0, "the host leaning in to a table (dimmed under the role card)"),
  n_room: full("pan", 9.6, "the room, still (night grade, the reticle locks on a guest)"),
  g_room: full("close", 8.3, "the table playing (morning)"),
  g_sketch: full("phone", 2.6, "the sketch grid on a phone (dimmed under the game tiles)"),
  r_board: full("close", 0.0, "the table on their phones (dimmed under the board)"),
  l_phone: full("phone", 4.6, "a phone in hand (dimmed under the clue banners)"),
  l_glasses: pane("theory", 17.0, "a woman in glasses, shocked — GLASSES"),
  l_black: pane("talkcam", 2.4, "a woman in a black top — BLACK TOP (ends before the whip at 6.0s)"),
  v_talk: pane("theory", 24.4, "the mic man making his case — TALK"),
  v_bluff: pane("testi", 9.0, "a guest grinning — BLUFF"),
  v_vote: pane("theory", 50.6, "a table, one hand going up — VOTE"),
  d_empty: full("table", 9.0, "the empty table (noir) — DIE?"),
  d_ghost: full("close", 9.3, "the table, as a ghost sees it"),
  y_phone: full("phone", 5.6, "a phone close-up — no app"),
  y_solo: full("thumbs", 0.0, "a guest's selfie, thumbs up — come solo"),
  y_crew1: pane("laughv", 0.2, "a table laughing — your crew"),
  y_crew2: pane("serious", 8.0, "a crowd round the table"),
  y_crew3: pane("talkcam", 7.6, "a guest laughing at her phone"),
  t_room: full("clap", 6.6, "the whole room — three knives, one room"),
  t_point: pane("accuse", 6.4, "a guest making her accusation"),
  t_mic: pane("theory", 10.0, "the mic man"),
  t_hands: pane("think", 26.0, "a woman in glasses, hands up, making her case"),
  e_clap: full("clap", 11.6, "the room at the end (dimmed under the lockup)"),
  e_plate: full("table", 0.0, "the low table, blurred to a plate under the event card"),
};
