/**
 * verify.mjs — check the ENCODED file, not the plan.
 *
 *   node scripts/reel/verify.mjs <instance>   -> out/<out>-verify/ + a report
 *
 *   spec       1080×1920, 30fps, the expected frame count, H.264 + AAC
 *   loudness   integrated −14 ±1 LUFS, true peak ≤ −1 dBTP
 *   dropouts   per-frame luminance: any frame darker than YAVG 14 is listed
 *   cuts       the first frame of every shot, tiled: each must be a clean, lit frame of THAT
 *              shot (captions pop in with the voice 1–3 frames later, so text may not show yet)
 *   flipbook   2 frames per second of the whole reel, tiled — read it like a storyboard
 *   sync       the VO's envelope cross-correlated against the mix: offset in ms
 *              (AAC priming adds ~40ms; anything past ~80ms is a real drift)
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { chunk, die, ensureDir, ff, ffLog, findVo, loadInstance, probe, tile } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const t = await inst.timeline();
const mp4 = `${inst.outBase}.mp4`;
if (!existsSync(mp4)) die(`no ${mp4} — run render.mjs first`);
const out = ensureDir(`${inst.outBase}-verify`);
const lines = [];
const note = (s) => {
  console.log(s);
  lines.push(s);
};

// spec
const p = probe(mp4);
const v = p.streams.find((s) => s.codec_type === "video");
const a = p.streams.find((s) => s.codec_type === "audio");
note(`spec      ${v.codec_name} ${v.width}×${v.height} ${v.r_frame_rate} ${v.nb_frames} frames (expected ${t.TOTAL}), ${Number(p.format.duration).toFixed(2)}s, audio ${a ? `${a.codec_name} ${a.sample_rate}Hz` : "NONE"}`);

// loudness
const eb = ffLog(["-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"]);
note(`loudness  ${eb.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop() ?? "?"}   ${eb.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop() ?? "?"}   (target −14 LUFS, ≤ −1 dBTP)`);

// dropouts
ff(["-i", mp4, "-vf", "scale=270:480,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=yavg.txt", "-f", "null", "-"], { cwd: out });
const y = [...readFileSync(join(out, "yavg.txt"), "utf8").matchAll(/YAVG=([\d.]+)/g)].map((m) => +m[1]);
const dark = y.map((v2, i) => [i, v2]).filter(([, v2]) => v2 < 14).map(([i]) => i);
note(`dropouts  ${y.length} frames, min YAVG ${Math.min(...y).toFixed(1)}; dark frames: ${dark.length ? dark.join(",") : "none"}`);

// cut frames
const cutsDir = ensureDir(join(out, "cuts"));
const cutFiles = [];
for (const s of t.SHOTS) {
  const f = join(cutsDir, `f${String(s.from).padStart(4, "0")}.png`);
  ff(["-i", mp4, "-vf", `select=eq(n\\,${s.from}),scale=180:320`, "-frames:v", "1", f]);
  cutFiles.push(f);
}
tile(cutFiles, join(out, "cuts.png"), { cols: 10, w: 180, h: 320 });
note(`cuts      ${join(out, "cuts.png")} (first frame of each of ${t.SHOTS.length} shots — look for flashes of the wrong shot or black)`);

// flipbook
const flipDir = ensureDir(join(out, "flip"));
ff(["-i", mp4, "-vf", "fps=2,scale=180:320", join(flipDir, "f%03d.png")]);
const flips = readdirSync(flipDir).filter((f) => f.endsWith(".png")).sort().map((f) => join(flipDir, f));
chunk(flips, 36).forEach((g, k) => tile(g, join(out, `flip_${k}.png`), { cols: 12, w: 180, h: 320 }));
note(`flipbook  ${Math.ceil(flips.length / 36)} sheet(s) at 2 fps in ${out}`);

// sync
const vo = findVo(inst.pub);
if (vo) {
  const tmp = os.tmpdir();
  const mixRaw = join(tmp, `reel-mix-${process.pid}.raw`);
  const voRaw = join(tmp, `reel-vo-${process.pid}.raw`);
  ff(["-i", mp4, "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", mixRaw]);
  ff(["-i", vo, "-ac", "1", "-ar", "8000", "-f", "s16le", voRaw]);
  const read = (f) => {
    const b = readFileSync(f);
    const x = new Float64Array(b.length / 2);
    for (let i = 0; i < x.length; i++) x[i] = Math.abs(b.readInt16LE(i * 2));
    return x;
  };
  const env = (x, hop = 8, win = 80) => {
    const pref = new Float64Array(x.length + 1);
    for (let i = 0; i < x.length; i++) pref[i + 1] = pref[i] + x[i];
    const e = new Float64Array(Math.floor(x.length / hop));
    for (let j = 0; j < e.length; j++) {
      const c = j * hop;
      const lo = Math.max(0, c - win / 2);
      const hi = Math.min(x.length, c + win / 2);
      e[j] = (pref[hi] - pref[lo]) / (hi - lo);
    }
    const mean = e.reduce((s, q) => s + q, 0) / e.length;
    return e.map((q) => q - mean);
  };
  const m = env(read(mixRaw));
  const s2 = env(read(voRaw));
  const n = Math.min(m.length, s2.length);
  let best = -Infinity;
  let lag = 0;
  for (let L = -250; L <= 250; L++) {
    let acc = 0;
    for (let i = Math.max(0, -L); i < n - Math.max(0, L); i++) acc += s2[i] * m[i + L];
    if (acc > best) {
      best = acc;
      lag = L;
    }
  }
  const ms = (lag * 8) / 8000 * 1000;
  note(`sync      VO sits ${ms.toFixed(0)} ms ${ms >= 0 ? "late" : "early"} in the mix${Math.abs(ms) > 80 ? "  ✖ DRIFT — re-check the mix" : "  (ok)"}`);
} else note("sync      no VO in the asset folder — skipped");

writeFileSync(join(out, "report.txt"), lines.join("\n") + "\n");
console.log(`\nreport: ${join(out, "report.txt")} — now LOOK at cuts.png and every flip_N.png`);
