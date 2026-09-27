/**
 * render.mjs — the deliverable: check, then render, then confirm the file.
 *
 *   node scripts/reel/render.mjs <instance> [--force] [--concurrency 4]
 *
 * Runs check.mjs first (pass --force to render anyway). Renders `<id>` to
 * out/<out>.mp4: H.264 CRF 17, yuv420p, AAC 320k — Meta's recommended upload.
 *
 * The OffthreadVideo cache flag and concurrency 4 are not optional: with the
 * defaults, a full-HD footage reel on a many-core machine evicts frames before
 * they are read and dies with "No frame found at position". The whole log goes
 * to out/<out>.render.log — never judge a render from a tail of it.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, die, loadInstance, probe } from "./lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const dirArg = process.argv[2];
const inst = await loadInstance(dirArg);
const force = process.argv.includes("--force");
const ci = process.argv.indexOf("--concurrency");
const conc = ci > 0 ? process.argv[ci + 1] : "4";

if (!force) {
  const r = spawnSync(process.execPath, ["--no-warnings", join(here, "check.mjs"), dirArg], { stdio: "inherit" });
  if (r.status !== 0) die("check failed — fix the problems above, or pass --force to render anyway");
}
if (!existsSync(join(inst.pub, "audio.wav"))) console.log("⚠ no audio.wav — run synth.mjs + mix.mjs (the render will fail on the missing file)");

const outFile = `${inst.outBase}.mp4`;
const logFile = `${inst.outBase}.render.log`;
const args = [
  "remotion", "render", inst.REEL.id, outFile,
  "--codec=h264", "--crf=17", "--pixel-format=yuv420p",
  "--audio-codec=aac", "--audio-bitrate=320k",
  "--offthreadvideo-cache-size-in-bytes=3000000000", `--concurrency=${conc}`,
];
console.log(`rendering ${inst.REEL.id} -> ${outFile} (log: ${logFile})`);
const r = spawnSync("npx", args, { cwd: ROOT, shell: true, encoding: "utf8", maxBuffer: 1 << 30 });
writeFileSync(logFile, `${r.stdout ?? ""}\n${r.stderr ?? ""}`);
if (r.status !== 0 || !existsSync(outFile)) {
  const errs = readFileSync(logFile, "utf8").split("\n").filter((l) => /error|No frame found/i.test(l)).slice(0, 8);
  die(`render failed (exit ${r.status}). From the log:\n${errs.join("\n")}`);
}
const p = probe(outFile);
const v = p.streams.find((s) => s.codec_type === "video");
console.log(`✔ ${outFile}: ${v.width}×${v.height} ${v.r_frame_rate} ${v.nb_frames} frames, ${Number(p.format.duration).toFixed(2)}s`);
console.log(`next: node scripts/reel/verify.mjs ${dirArg}`);
