/**
 * manifest.ts — the single source of truth for the film's timeline.
 *
 * `durationInFrames` on the composition is DERIVED from this array, so the
 * composition length can never drift out of sync with the scenes. Change a
 * duration here and the composition, the Series and the studio timeline all
 * follow.
 *
 * Frame boundaries at 30fps (cumulative `at` is computed below):
 *   1 Cold open ........   0- 240      8 Seven rounds .... 2070-2400
 *   2 The problem .....  240- 600      9 The verdict ..... 2400-2670
 *   3 The mechanism ...  600- 870     10 The reveal ...... 2670-2880
 *   4 What it is ......  870-1170     11 Host control .... 2880-3120
 *   5 You become ...... 1170-1470     12 Why it works .... 3120-3420
 *   6 The loop ........ 1470-1830     13 The platform .... 3420-3720
 *   7 Codes ........... 1830-2070     14 Close ........... 3720-3900
 */

export type SceneMeta = {
  id: string;
  title: string;
  durationInFrames: number;
};

export const SCENES: SceneMeta[] = [
  { id: "S01Cold", title: "Cold open", durationInFrames: 240 },
  { id: "S02Problem", title: "The problem", durationInFrames: 360 },
  { id: "S03Mechanism", title: "The mechanism", durationInFrames: 270 },
  { id: "S04What", title: "What it is", durationInFrames: 300 },
  { id: "S05Identity", title: "You become someone", durationInFrames: 300 },
  { id: "S06Loop", title: "The loop", durationInFrames: 360 },
  { id: "S07Codes", title: "Codes are social objects", durationInFrames: 240 },
  { id: "S08Rounds", title: "Seven rounds", durationInFrames: 330 },
  { id: "S09Verdict", title: "The verdict", durationInFrames: 270 },
  { id: "S10Reveal", title: "The reveal", durationInFrames: 210 },
  { id: "S11Host", title: "Host control", durationInFrames: 240 },
  { id: "S12Why", title: "Why it works", durationInFrames: 300 },
  { id: "S13Platform", title: "The platform", durationInFrames: 300 },
  { id: "S14Close", title: "Close", durationInFrames: 180 },
];

/** Total film length. Never hardcode this number anywhere else. */
export const TOTAL_FRAMES = SCENES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);

/** Absolute start frame of each scene, for the VO script and for debugging. */
export const sceneStarts = (): Record<string, number> => {
  const out: Record<string, number> = {};
  let at = 0;
  for (const s of SCENES) {
    out[s.id] = at;
    at += s.durationInFrames;
  }
  return out;
};
