/**
 * cut.mjs — cut every clip the timeline uses, to exactly the length it needs.
 *
 *   node --no-warnings scripts/reel/cut.mjs <instance> [--only a,b]
 *
 * Reads <instance>/footage.ts (where each clip starts in which master, and
 * where that master's shot ends) and <instance>/timeline.ts (how long each
 * clip is on screen). Each clip is cut from `in` for (longest use + half a
 * frame), re-encoded H.264 CRF 17 at the reel's fps, cover-cropped to its size,
 * short GOP for fast seeking, no audio. REAL SPEED: a clip is never stretched.
 *
 * SIZES. A 9:16 reel cuts everything to 1080×1920. A reel whose config.ts has
 * `cut` sizes (the 16:9 4K reels) cuts each clip to its footage.ts `size`:
 * "full" (e.g. 3840×2160) or "pane" (one third of a split screen, 1280×2160).
 *
 * HDR. iPhone footage is HLG (arib-std-b67, BT.2020). Played as-is it looks
 * flat and grey, so every HLG master is tonemapped to SDR BT.709 first.
 * A clip's optional `vf` (e.g. "hflip" for a mirrored selfie) runs after.
 *
 * It refuses to cut past `out` (the next shot in the master): that would show
 * a flash of the wrong shot. The fix is editorial, and it tells you which:
 * pick an earlier `in`, or split the line across two shots.
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, die, ensureDir, ff, importTs, loadInstance, sh } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > 0 ? new Set(process.argv[onlyIdx + 1].split(",")) : null;
const t = await inst.timeline();
const { SHOTS, FPS } = t;
const { MASTERS, CLIPS, PHOTOS } = await importTs(inst.file("footage.ts"));
ensureDir(inst.pub);

// Every picture on screen: the instance's LAYERS (shots + split-screen panes), or its shots.
const layers = t.LAYERS ?? SHOTS.filter((s) => s.kind === "clip").map((s) => ({ key: s.key, src: s.src, dur: s.dur }));
const need = {};
for (const L of layers) if (L.src) need[L.src] = Math.max(need[L.src] ?? 0, L.dur);

const SIZES = inst.REEL.cut ?? { full: [1080, 1920], pane: [1080, 1920] };

const problems = [];
for (const [name, frames] of Object.entries(need)) {
  const c = CLIPS[name];
  if (!c) {
    problems.push(`shot uses clip "${name}" but footage.ts has no CLIPS.${name}`);
    continue;
  }
  const len = (frames + 0.5) / FPS;
  if (c.out !== undefined && c.in + len > c.out + 1e-3) {
    const users = layers.filter((s) => s.src === name).map((s) => s.key).join(", ");
    problems.push(
      `${name}: needs ${len.toFixed(2)}s from ${c.in}s but its shot ends at ${c.out}s (short by ${(c.in + len - c.out).toFixed(2)}s). ` +
        `Used by: ${users}. Move \`in\` earlier (not before the shot's start), or cut the line into two shots in timeline.ts.`,
    );
  }
}
if (problems.length) die(problems.join("\n"));

const transferOf = new Map();
const isHlg = (file) => {
  if (!transferOf.has(file)) transferOf.set(file, sh(`ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "${file}"`).replace(/[^a-z0-9-]/gi, ""));
  return transferOf.get(file) === "arib-std-b67";
};
const TONEMAP = "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p";

for (const [name, frames] of Object.entries(need)) {
  if (only && !only.has(name)) continue;
  const c = CLIPS[name];
  const master = resolve(ROOT, MASTERS[c.master] ?? c.master);
  if (!existsSync(master)) die(`${name}: master not found: ${master}`);
  const len = (frames + 0.5) / FPS;
  const [w, h] = SIZES[c.size ?? "full"];
  const vf = [
    isHlg(master) ? TONEMAP : null,
    c.vf ?? null,
    `fps=${FPS}`,
    `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${w}:${h}`,
  ].filter(Boolean);
  ff([
    "-ss", c.in.toFixed(3),
    "-i", master,
    "-t", len.toFixed(3),
    "-an",
    "-vf", vf.join(","),
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-g", "12",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    join(inst.pub, `${name}.mp4`),
  ]);
  console.log(`clip  ${name.padEnd(14)} ${c.in.toFixed(2)}s +${len.toFixed(2)}s ${w}×${h}${isHlg(master) ? " HLG→SDR" : ""}  ${c.note ?? ""}`);
}

for (const [name, p] of Object.entries(PHOTOS ?? {})) {
  if (only && !only.has(name)) continue;
  const used = SHOTS.some((s) => s.kind === "photo" && s.src === name);
  if (!used) continue;
  const dest = join(inst.pub, `${name}.jpg`);
  if (!existsSync(p.file)) {
    console.log(`photo ${name.padEnd(14)} source gone — keeping ${existsSync(dest) ? dest : "(MISSING!)"}`);
    continue;
  }
  ff(["-i", p.file, "-vf", p.vf, "-q:v", "2", dest]);
  console.log(`photo ${name.padEnd(14)} ${p.note ?? ""}`);
}
const unused = Object.keys(CLIPS).filter((n) => !need[n]);
if (unused.length) console.log(`\nin footage.ts but not on the timeline (not cut): ${unused.join(", ")}`);
