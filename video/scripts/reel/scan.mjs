/**
 * scan.mjs — survey raw footage: find every shot, sheet every shot.
 *
 *   node scripts/reel/scan.mjs <master.mp4> [more masters...] [--out out/scan]
 *
 * For each master: scene-cut detection (ffmpeg select='gt(scene,0.25)'), then
 * one labelled strip per shot (frames at 15% / 50% / 85% of the shot), four
 * shots to a sheet. Writes:
 *
 *   out/scan/<master>/scenes.json   [{ i, start, end, dur }]  -> in/out points for footage.ts
 *   out/scan/<master>/scenes.md     the same as a table, to annotate
 *   out/scan/<master>/sheet_NN.png  the contact sheets — LOOK at every one
 *
 * A shot is the unit of real-speed editing: a clip may never run past its
 * shot's `end` (that would show the next shot). Record `end` as `out` in
 * footage.ts and cut.mjs enforces it.
 */

import { basename, extname, join, resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { ROOT, chunk, duration, ensureDir, fesc, ff, fontFile, tile } from "./lib.mjs";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outRoot = resolve(ROOT, outIdx >= 0 ? args[outIdx + 1] : "out/scan");
const masters = args.filter((a, i) => !a.startsWith("--") && (outIdx < 0 || i !== outIdx + 1));
if (!masters.length) {
  console.error("usage: node scripts/reel/scan.mjs <master.mp4> [...] [--out out/scan]");
  process.exit(1);
}

const font = fontFile();

for (const m of masters) {
  const master = resolve(m);
  const name = basename(master, extname(master));
  const out = ensureDir(join(outRoot, name));
  const total = duration(master);

  // 1. scene cuts. metadata=print to a file in `out` (relative path: no drive-letter escaping).
  ff(["-i", master, "-an", "-vf", "scale=270:480,select='gt(scene,0.25)',metadata=print:file=cuts.txt", "-f", "null", "-"], { cwd: out });
  const { readFileSync } = await import("node:fs");
  const raw = [...readFileSync(join(out, "cuts.txt"), "utf8").matchAll(/pts_time:([0-9.]+)/g)].map((x) => +x[1]);
  // Flash frames trigger several detections in a row; keep cuts at least 0.3s apart.
  const cuts = [];
  for (const t of raw) if (!cuts.length || t - cuts[cuts.length - 1] >= 0.3) cuts.push(t);
  const bounds = [0, ...cuts.filter((t) => t > 0.3 && t < total - 0.3), total];
  const scenes = bounds.slice(0, -1).map((start, i) => ({ i, start: +start.toFixed(3), end: +bounds[i + 1].toFixed(3), dur: +(bounds[i + 1] - start).toFixed(3) }));

  // 2. one strip per shot.
  const strips = [];
  for (const s of scenes) {
    const frames = [0.15, 0.5, 0.85].map((k) => s.start + s.dur * k);
    const shots = frames.map((t, j) => {
      const f = join(out, `s${String(s.i).padStart(2, "0")}_${j}.png`);
      ff(["-ss", t.toFixed(3), "-i", master, "-frames:v", "1", "-vf", "scale=216:384", f]);
      return f;
    });
    const strip = join(out, `strip_${String(s.i).padStart(2, "0")}.png`);
    const label = `#${s.i}   ${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s   (${s.dur.toFixed(2)}s)`;
    const draw = font ? `,drawtext=fontfile='${fesc(font)}':text='${fesc(label)}':x=10:y=8:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.7:boxborderw=6` : "";
    ff(["-i", shots[0], "-i", shots[1], "-i", shots[2], "-filter_complex", `[0][1][2]hstack=inputs=3,pad=iw:ih+44:0:44:black${draw}`, strip]);
    strips.push(strip);
  }

  // 3. sheets of four shots.
  chunk(strips, 4).forEach((group, k) => tile(group, join(out, `sheet_${String(k).padStart(2, "0")}.png`), { cols: 1, w: 648, h: 428 }));

  writeFileSync(join(out, "scenes.json"), JSON.stringify(scenes, null, 2));
  writeFileSync(
    join(out, "scenes.md"),
    [`# ${name} — ${scenes.length} shots, ${total.toFixed(2)}s`, "", "| # | in | out | dur | what (fill in) | usable? |", "|---|---|---|---|---|---|", ...scenes.map((s) => `| ${s.i} | ${s.start} | ${s.end} | ${s.dur} |  |  |`)].join("\n"),
  );
  console.log(`${name}: ${scenes.length} shots -> ${out}`);
  console.log(scenes.map((s) => `  #${s.i} ${s.start.toFixed(2)}-${s.end.toFixed(2)} (${s.dur.toFixed(2)}s)`).join("\n"));
}
