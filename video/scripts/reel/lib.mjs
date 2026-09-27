/**
 * lib.mjs — shared plumbing for the reel toolkit (scripts/reel/*.mjs).
 *
 * A "reel instance" is a folder under src/ (e.g. src/reel, src/greenr-oct)
 * holding config.ts, timeline.ts, footage.ts, sfx.ts and the React layers.
 * Every script takes the instance folder as its first argument:
 *
 *   node scripts/reel/check.mjs src/reel
 *
 * Node runs the instance's .ts files directly (type stripping, Node >= 22.18),
 * so they must stay erasable TypeScript: no enums, no namespaces, no JSX.
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The Remotion project root (scripts/reel/ is two levels down). */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

export const importTs = (p) => import(pathToFileURL(p).href);

/** Run a shell command, return stdout (throws on failure). */
export const sh = (cmd, opts = {}) =>
  execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, ...opts }).toString();

/** Run ffmpeg with args (no shell quoting issues). Throws with stderr on failure. */
export const ff = (args, opts = {}) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1 << 28,
    ...opts,
  });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(" ")}\n${r.stderr}`);
  return r;
};

/** ffmpeg that we WANT the log of (filters that print to stderr: silencedetect, ebur128...). */
export const ffLog = (args, opts = {}) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  return `${r.stdout ?? ""}${r.stderr ?? ""}`;
};

export const duration = (file) => parseFloat(sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`));

export const probe = (file) =>
  JSON.parse(sh(`ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate -of json "${file}"`));

export const ensureDir = (d) => {
  mkdirSync(d, { recursive: true });
  return d;
};

/** Load a reel instance folder. */
export const loadInstance = async (dirArg) => {
  if (!dirArg) die("usage: node scripts/reel/<tool>.mjs <instance dir, e.g. src/reel> [...]");
  const dir = resolve(ROOT, dirArg);
  if (!existsSync(join(dir, "config.ts"))) die(`${dir} has no config.ts — is it a reel instance? (copy template/src/reel)`);
  const { REEL } = await importTs(join(dir, "config.ts"));
  const pub = resolve(ROOT, "public", REEL.assets);
  return {
    dir,
    REEL,
    pub,
    outBase: resolve(ROOT, "out", REEL.out),
    timeline: () => importTs(join(dir, "timeline.ts")),
    file: (name) => join(dir, name),
  };
};

/** The VO file in the instance's asset folder, if any. */
export const findVo = (pub) => ["vo.mp3", "vo.wav", "vo.m4a"].map((f) => join(pub, f)).find(existsSync);

/** A bold font for ffmpeg drawtext. Pass it explicitly: fontconfig is often broken (it segfaults on Windows). */
export const fontFile = () =>
  [
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
  ].find(existsSync);

/** Escape a path or text for use inside an ffmpeg filter argument. */
export const fesc = (s) => String(s).replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");

/** Tile images into a grid: `cols` per row, each scaled to w×h. */
export const tile = (files, out, { cols = 6, w = 360, h = 640 } = {}) => {
  if (!files.length) return;
  const args = [];
  files.forEach((f) => args.push("-i", f));
  const scaled = files.map((_, i) => `[${i}]scale=${w}:${h}[s${i}]`).join(";");
  const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
  const inputs = files.map((_, i) => `[s${i}]`).join("");
  const graph = files.length === 1 ? `[0]scale=${w}:${h}` : `${scaled};${inputs}xstack=inputs=${files.length}:layout=${layout}:fill=black`;
  ff([...args, "-filter_complex", graph, "-frames:v", "1", out]);
};

/** Split a list into chunks. */
export const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
