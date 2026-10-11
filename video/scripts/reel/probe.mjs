/**
 * probe.mjs — first / middle / last frame of every clip the reel uses, each on
 * a labelled grid, one sheet per clip.
 *
 *   node scripts/reel/probe.mjs <instance> [--only a,b]   -> out/<out>-probe/sheet_<clip>.png
 *
 * READ EVERY SHEET before placing captions: note the y-range (and, if the
 * subject is off to one side, the x-range) of every head, face, hand holding
 * the product, phone screen, logo or other thing that matters, then write it
 * into that shot's (or pane's) `clear` list in timeline.ts. The grid labels are
 * canvas px — for a split-screen pane, pane-local px — the same numbers
 * `clear` uses.
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, duration, ensureDir, ff, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > 0 ? new Set(process.argv[onlyIdx + 1].split(",")) : null;
const t = await inst.timeline();
const out = ensureDir(`${inst.outBase}-probe`);
const SCALE = 0.4;

// Every picture: the instance's LAYERS (shots + panes), or its clip shots (9:16 reels).
const layers = t.LAYERS ?? t.SHOTS.filter((s) => s.kind === "clip").map((s) => ({ src: s.src, pane: false }));
const items = [];
for (const L of layers) {
  if (!L.src || (only && !only.has(L.src))) continue;
  if (items.some((i) => i.src === L.src)) continue;
  const file = join(inst.pub, `${L.src}.mp4`);
  if (!existsSync(file)) {
    console.log(`missing ${file} — run cut.mjs first`);
    continue;
  }
  items.push({ src: L.src, pane: !!L.pane, file, width: L.width });
}

const serveUrl = await bundle({ entryPoint: resolve(ROOT, "src/index.ts") });
const id = `${inst.REEL.id}-Probe`;
for (const it of items) {
  const last = Math.max(0, Math.floor(duration(it.file) * inst.REEL.fps) - 2);
  const frames = [0, Math.floor(last / 2), last];
  const shots = [];
  for (const frame of frames) {
    const inputProps = it.pane === undefined ? { src: it.src, kind: "clip", frame } : { src: it.src, pane: it.pane, kind: "clip", frame };
    const composition = await selectComposition({ serveUrl, id, inputProps });
    const f = join(out, `${it.src}_${frame}.png`);
    await renderStill({ serveUrl, composition, frame: 0, output: f, scale: SCALE, overwrite: true, inputProps });
    if (it.pane) {
      // Keep only the pane's box (it is drawn at the left of the canvas).
      const cropped = f.replace(/\.png$/, "_c.png");
      ff(["-i", f, "-vf", `crop=${Math.round(it.width * SCALE)}:ih:0:0`, cropped]);
      shots.push(cropped);
    } else shots.push(f);
  }
  const sheet = join(out, `sheet_${it.src}.png`);
  const args = shots.flatMap((s) => ["-i", s]);
  ff(shots.length > 1 ? [...args, "-filter_complex", `hstack=inputs=${shots.length}`, sheet] : [...args, sheet]);
  console.log(`probe ${it.src} (${frames.join(", ")}) -> ${sheet}`);
}
