/**
 * cut.mjs — cut every clip the timeline uses, to exactly the length it needs.
 *
 *   node --no-warnings scripts/reel/cut.mjs <instance> [--only a,b]
 *
 * Reads <instance>/footage.ts (where each clip starts in which master, and
 * where that master's shot ends) and <instance>/timeline.ts (how long each
 * clip is on screen). Each clip is cut from `in` for (longest shot using it +
 * half a frame), re-encoded H.264 CRF 17, 1080×1920 (cover-cropped), short GOP for
 * fast seeking, no audio. REAL SPEED: a clip is never stretched.
 *
 * It refuses to cut past `out` (the next shot in the master): that would show
 * a flash of the wrong shot. The fix is editorial, and it tells you which:
 * pick an earlier `in`, or split the line across two shots.
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, die, ensureDir, ff, importTs, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > 0 ? new Set(process.argv[onlyIdx + 1].split(",")) : null;
const { SHOTS, FPS } = await inst.timeline();
const { MASTERS, CLIPS, PHOTOS } = await importTs(inst.file("footage.ts"));
ensureDir(inst.pub);

const need = {};
for (const s of SHOTS) if (s.kind === "clip") need[s.src] = Math.max(need[s.src] ?? 0, s.dur);

const problems = [];
for (const [name, frames] of Object.entries(need)) {
  const c = CLIPS[name];
  if (!c) {
    problems.push(`shot uses clip "${name}" but footage.ts has no CLIPS.${name}`);
    continue;
  }
  // The last frame SHOWN is (frames - 1); half a frame past the shot's end is enough to hold it.
  const len = (frames + 0.5) / FPS;
  if (c.out !== undefined && c.in + len > c.out + 1e-3) {
    const users = SHOTS.filter((s) => s.src === name).map((s) => s.key).join(", ");
    problems.push(
      `${name}: needs ${len.toFixed(2)}s from ${c.in}s but its shot ends at ${c.out}s (short by ${(c.in + len - c.out).toFixed(2)}s). ` +
        `Used by: ${users}. Move \`in\` earlier (not before the shot's start), or cut the line into two shots in timeline.ts.`,
    );
  }
}
if (problems.length) die(problems.join("\n"));

for (const [name, frames] of Object.entries(need)) {
  if (only && !only.has(name)) continue;
  const c = CLIPS[name];
  const master = resolve(ROOT, MASTERS[c.master] ?? c.master);
  if (!existsSync(master)) die(`${name}: master not found: ${master}`);
  const len = (frames + 0.5) / FPS;
  ff([
    "-ss", c.in.toFixed(3),
    "-i", master,
    "-t", len.toFixed(3),
    "-an",
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-g", "12",
    join(inst.pub, `${name}.mp4`),
  ]);
  console.log(`clip  ${name.padEnd(14)} ${c.in.toFixed(2)}s +${len.toFixed(2)}s  ${c.note ?? ""}`);
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
