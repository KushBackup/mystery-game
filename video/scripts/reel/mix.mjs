/**
 * mix.mjs — the reel's final audio: voiceover on top, sound effects ducked under it.
 *
 *   node scripts/reel/mix.mjs <instance> [--sfx 0.55]   -> public/<assets>/audio.wav
 *
 * Needs SYSTEM ffmpeg (sidechaincompress, loudnorm, ebur128). Remotion's
 * bundled ffmpeg is a minimal build without them.
 *
 *   VO    public/<assets>/vo.mp3 | vo.wav | vo.m4a — mono-summed, centred
 *   SFX   public/<assets>/sfx-raw.wav (synth.mjs) × 0.55, sidechain-compressed by
 *         the VO (threshold 0.02, ratio 6, attack 5ms, release 280ms): the
 *         effects dip under every word and come back in the pauses
 *   OUT   loudnorm to −14 LUFS integrated, −1.5 dBTP (Meta / Reels target), 48kHz
 *
 * No VO yet? The SFX alone are normalised, so the reel can be reviewed.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { die, ff, ffLog, findVo, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const k = process.argv.indexOf("--sfx");
const sfxGain = k > 0 ? Number(process.argv[k + 1]) : 0.55;
const raw = join(inst.pub, "sfx-raw.wav");
const out = join(inst.pub, "audio.wav");
if (!existsSync(raw)) die(`no ${raw} — run synth.mjs first`);
const vo = findVo(inst.pub);

const norm = "loudnorm=I=-14:TP=-1.5:LRA=11";
if (vo) {
  ff([
    "-i", raw,
    "-i", vo,
    "-filter_complex",
    `[1:a]aresample=48000,aformat=channel_layouts=mono,pan=stereo|c0=c0|c1=c0,apad[vo];[vo]asplit=2[vomix][vokey];` +
      `[0:a]volume=${sfxGain}[sfx];[sfx][vokey]sidechaincompress=threshold=0.02:ratio=6:attack=5:release=280[duck];` +
      `[vomix][duck]amix=inputs=2:duration=shortest:normalize=0,${norm}`,
    "-ar", "48000",
    out,
  ]);
} else {
  console.log("no vo.mp3/vo.wav yet — normalising the sound effects alone");
  ff(["-i", raw, "-af", norm, "-ar", "48000", out]);
}
const log = ffLog(["-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"]);
const I = log.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
const P = log.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop();
console.log(`wrote ${out}${vo ? ` (VO: ${vo})` : ""} — ${I ?? "?"}, ${P ?? "?"}`);
