/**
 * stills.mjs — precheck stills of the reel, with the safe zone and every
 * keep-clear band drawn, tiled into contact sheets.
 *
 *   node scripts/reel/stills.mjs <instance> [f1,f2,...]   -> out/<out>-stills/
 *
 * With no frame list it picks the frames that matter: the middle of every
 * caption and the third frame of every shot. Renders the `<id>-SafeZone`
 * composition, so a caption sitting on a keep-clear band shows as a solid red
 * box. LOOK AT EVERY SHEET: stills are the only way to judge a frame.
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { join, resolve } from "node:path";
import { ROOT, chunk, ensureDir, loadInstance, tile } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const t = await inst.timeline();
let frames;
// --clean renders the ad itself (no bands), into <out>-clean/, for judging the design.
const clean = process.argv.includes("--clean");
const list = process.argv.slice(3).find((a) => !a.startsWith("--"));
if (list) frames = list.split(",").map(Number);
else {
  const set = new Set();
  for (const c of t.CAPTIONS) set.add(Math.max(0, Math.round((c.from + c.to) / 2)));
  for (const s of t.SHOTS) set.add(s.from + 2);
  frames = [...set].filter((f) => f >= 0 && f < t.TOTAL).sort((a, b) => a - b);
}
const out = ensureDir(`${inst.outBase}-${clean ? "clean" : "stills"}`);
const serveUrl = await bundle({ entryPoint: resolve(ROOT, "src/index.ts") });
const composition = await selectComposition({ serveUrl, id: clean ? inst.REEL.id : `${inst.REEL.id}-SafeZone` });
const files = [];
for (const frame of frames) {
  const f = join(out, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output: f, scale: 0.5, overwrite: true });
  files.push(f);
}
chunk(files, 6).forEach((group, k) => {
  const sheet = join(out, `sheet_${String(k).padStart(2, "0")}.png`);
  tile(group, sheet, { cols: 6, w: 360, h: 640 });
  console.log(`${sheet}: ${group.map((g) => g.match(/f(\d+)\.png$/)[1]).join(" ")}`);
});
