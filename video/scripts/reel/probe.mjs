/**
 * probe.mjs — first / middle / last frame of every clip and photo the reel
 * uses, each on a labelled y-grid, one sheet per clip.
 *
 *   node scripts/reel/probe.mjs <instance> [--only a,b]   -> out/<out>-probe/sheet_<clip>.png
 *
 * READ EVERY SHEET before placing captions: note the y-range (and, if the
 * subject is off to one side, the x-range) of every head, face, hand holding
 * the product, phone screen, logo or other thing that matters, then write it
 * into that shot's `clear` list in timeline.ts. The grid labels are canvas px
 * (the same numbers `clear` uses); the dashed box is the Meta safe zone.
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, duration, ensureDir, ff, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > 0 ? new Set(process.argv[onlyIdx + 1].split(",")) : null;
const { SHOTS } = await inst.timeline();
const out = ensureDir(`${inst.outBase}-probe`);

const items = [];
for (const s of SHOTS) {
  if (only && !only.has(s.src)) continue;
  if (items.some((i) => i.src === s.src)) continue;
  const file = join(inst.pub, `${s.src}.${s.kind === "clip" ? "mp4" : "jpg"}`);
  if (!existsSync(file)) {
    console.log(`missing ${file} — run cut.mjs first`);
    continue;
  }
  items.push({ src: s.src, kind: s.kind, file });
}

const serveUrl = await bundle({ entryPoint: resolve(ROOT, "src/index.ts") });
const id = `${inst.REEL.id}-Probe`;
for (const it of items) {
  let frames = [0];
  if (it.kind === "clip") {
    const last = Math.max(0, Math.floor(duration(it.file) * 30) - 2);
    frames = [0, Math.floor(last / 2), last];
  }
  const shots = [];
  for (const frame of frames) {
    const inputProps = { src: it.src, kind: it.kind, frame };
    const composition = await selectComposition({ serveUrl, id, inputProps });
    const f = join(out, `${it.src}_${frame}.png`);
    await renderStill({ serveUrl, composition, frame: 0, output: f, scale: 0.4, overwrite: true, inputProps });
    shots.push(f);
  }
  const sheet = join(out, `sheet_${it.src}.png`);
  const args = shots.flatMap((s) => ["-i", s]);
  ff(shots.length > 1 ? [...args, "-filter_complex", `hstack=inputs=${shots.length}`, sheet] : [...args, sheet]);
  console.log(`probe ${it.src} (${frames.join(", ")}) -> ${sheet}`);
}
