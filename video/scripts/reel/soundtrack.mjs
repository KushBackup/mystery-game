/**
 * soundtrack.mjs — the audio for a reel that runs on its master's OWN track
 * (music + room sound), not on a voiceover. The alternative to synth + mix.
 *
 *   node --no-warnings scripts/reel/soundtrack.mjs <instance>   -> public/<assets>/audio.wav (+ vo.wav)
 *
 * Reads `AUDIO` from the instance's timeline.ts:
 *
 *   { master, parts: [{ from, to }, ...], crossfade, fadeOut, lufs, truePeak }
 *
 *   parts      master-time segments (seconds), laid end to end. Put every
 *              splice on a measured kick onset, a few ms early, so the cut
 *              hides under the transient.
 *   crossfade  equal-power crossfade at each splice (s). Keep it short (~20ms):
 *              a long one smears the kick.
 *   fadeOut    fade over the last N seconds (the sign-off).
 *
 * The result is trimmed to the reel's exact length and normalised in TWO passes
 * (measure, then a linear gain), so the music keeps its own dynamics instead
 * of being pumped by single-pass loudnorm.
 *
 * It also writes the spliced track BEFORE the fade and normalisation as
 * `vo.wav`. verify.mjs looks for a vo.* to measure sync against, so the check
 * then measures the encoded audio against the master's own sound. With the
 * picture frame-locked to the master, that offset is the picture/sound sync.
 */

import { join, resolve } from "node:path";
import { die, ff, ffLog, importTs, loadInstance, ROOT } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const t = await inst.timeline();
const A = t.AUDIO;
if (!A) die("timeline.ts exports no AUDIO — this reel runs on a voiceover: use synth.mjs + mix.mjs");
const { MASTERS } = await importTs(inst.file("footage.ts"));
const master = resolve(ROOT, MASTERS[A.master] ?? A.master);
const total = t.TOTAL / t.FPS;

const ref = join(inst.pub, "vo.wav");
const out = join(inst.pub, "audio.wav");

// 1. splice
const inputs = A.parts.flatMap((p) => ["-ss", p.from.toFixed(4), "-t", (p.to - p.from).toFixed(4), "-i", master]);
let chain = A.parts.map((_, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo[p${i}]`).join(";");
let last = "p0";
for (let i = 1; i < A.parts.length; i++) {
  chain += `;[${last}][p${i}]acrossfade=d=${A.crossfade}:c1=qsin:c2=qsin[x${i}]`;
  last = `x${i}`;
}
chain += `;[${last}]atrim=0:${total.toFixed(4)},asetpts=PTS-STARTPTS[s]`;
ff([...inputs, "-filter_complex", chain, "-map", "[s]", "-ar", "48000", "-c:a", "pcm_s16le", ref]);

// 2. fade, measure, normalise
const fade = `afade=t=out:st=${(total - A.fadeOut).toFixed(3)}:d=${A.fadeOut}`;
const meas = ffLog(["-i", ref, "-af", `${fade},loudnorm=I=${A.lufs}:TP=${A.truePeak}:LRA=20:print_format=json`, "-f", "null", "-"]);
const j = JSON.parse(meas.slice(meas.lastIndexOf("{"), meas.lastIndexOf("}") + 1));
ff([
  "-i", ref,
  "-af",
  `${fade},loudnorm=I=${A.lufs}:TP=${A.truePeak}:LRA=20:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`,
  "-ar", "48000",
  "-c:a", "pcm_s16le",
  out,
]);

const chk = ffLog(["-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"]);
const I = chk.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
const P = chk.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop();
console.log(`✔ ${out}: ${total.toFixed(2)}s, ${A.parts.length} part(s), input ${j.input_i} LUFS -> ${I}, true peak ${P}`);
console.log(`  (reference for verify's sync check: ${ref})`);
