// transcribe.mjs — word timings for the user's voiceover, so the film is cut to it.
//
//   node transcribe.mjs path/to/vo.mp3        copy to vo.<ext>, transcribe, write words.json
//   node transcribe.mjs --from-json           rebuild words.json from the cached raw tokens
//
// whisper.cpp + small.en come from the Remotion project next door (../node_modules,
// @remotion/install-whisper-cpp) and install into ~/.cache/remotion-whisper on first run (~0.5 GB).
// The same snap as video/scripts/reel/transcribe.mjs: whisper starts a phrase's first word at the END
// of the pause before it, so words that begin inside a detected silence move to where speech resumes.
// timeline.mjs reads words.json and aligns the script to it; every cue in film.mjs follows.
import { copyFileSync, existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));

const arg = process.argv[2], fromJson = arg === "--from-json";
if (arg && !fromJson) { const src = path.resolve(arg); if (!existsSync(src)) { console.error("no such file:", src); process.exit(1); }
  const dest = path.join(HERE, "vo" + (path.extname(src).toLowerCase() || ".mp3")); if (src !== dest) copyFileSync(src, dest); console.log("VO ->", dest); }
const vo = readdirSync(HERE).filter((f) => /^vo\.(mp3|wav|m4a)$/i.test(f)).map((f) => path.join(HERE, f))[0];
if (!vo) { console.error("no vo.mp3 / vo.wav / vo.m4a here — pass the voiceover file"); process.exit(1); }
const RAW = path.join(HERE, "out/vo-tokens.json");

if (!fromJson) {
  const mod = pathToFileURL(path.join(HERE, "../node_modules/@remotion/install-whisper-cpp/dist/index.js")).href;
  const { downloadWhisperModel, installWhisperCpp, transcribe, toCaptions } = await import(mod);
  const to = process.env.WHISPER_DIR ?? path.join(os.homedir(), ".cache", "remotion-whisper"), MODEL = "small.en", VERSION = "1.5.5";
  await installWhisperCpp({ to, version: VERSION }); await downloadWhisperModel({ model: MODEL, folder: to });
  const wav = path.join(os.tmpdir(), `drawn-vo-16k-${process.pid}.wav`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", vo, "-ar", "16000", "-ac", "1", wav]);
  const out = await transcribe({ model: MODEL, whisperPath: to, whisperCppVersion: VERSION, inputPath: wav, tokenLevelTimestamps: true });
  writeFileSync(RAW, JSON.stringify(toCaptions({ whisperCppOutput: out }).captions, null, 1));
}
const words = [];
for (const t of JSON.parse(readFileSync(RAW, "utf8"))) { const clean = t.text.trim(); if (!clean || !/[A-Za-z0-9]/.test(clean)) continue;
  if (!words.length || /^\s/.test(t.text)) words.push({ w: clean, s: t.startMs / 1000, e: t.endMs / 1000 }); else { const l = words[words.length - 1]; l.w += clean; l.e = t.endMs / 1000; } }
const log = spawnSync("ffmpeg", ["-i", vo, "-af", "silencedetect=noise=-35dB:d=0.1", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const starts = [...log.matchAll(/silence_start: ([0-9.]+)/g)].map((m) => +m[1]), ends = [...log.matchAll(/silence_end: ([0-9.]+)/g)].map((m) => +m[1]);
for (const x of words) for (const [a, b] of starts.map((a, i) => [a, ends[i] ?? Infinity])) { if (x.s >= a - .02 && x.s < b) x.s = b; if (x.e > a && x.e <= b + .02) x.e = a; }
writeFileSync(path.join(HERE, "words.json"), JSON.stringify(words.map((x) => ({ w: x.w, s: +x.s.toFixed(3), e: +x.e.toFixed(3) })), null, 1));
console.log(`wrote words.json — ${words.length} words, VO ends ${words.length ? words[words.length - 1].e.toFixed(2) : 0}s`);
