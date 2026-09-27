/**
 * check.mjs — the pre-render gate. Exits 1 on any problem.
 *
 *   node --no-warnings scripts/reel/check.mjs <instance>
 *
 * 1. ALIGNMENT  every caption word matches the voiceover (timeline.ts warns on import)
 * 2. COVERAGE   every clip exists and is at least as long as the shot it fills
 *               at 1x (the last frame shown must exist — a short clip freezes)
 * 3. KEEP-CLEAR no caption sits on a head, a face or an important thing, or on
 *               a graphic — every frame, with the lens move applied
 * 4. SAFE ZONE  every caption inside the Meta safe box (y 270–1232)
 * 5. PHOTOS     every photo and logo the reel uses exists
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { duration, importTs, loadInstance } from "./lib.mjs";

const inst = await loadInstance(process.argv[2]);
const warns = [];
const orig = console.warn;
console.warn = (...a) => warns.push(a.join(" "));
const t = await inst.timeline();
console.warn = orig;

const problems = [];
const say = (ok, msg) => {
  console.log(`${ok ? "  ok " : "  ✖  "} ${msg}`);
  if (!ok) problems.push(msg);
};

console.log("\n1. alignment (caption text vs the voiceover)");
if (!warns.length) say(true, `all ${t.CAPTIONS.length} captions align to the VO`);
warns.forEach((w) => say(false, w));

console.log("\n2. coverage (real speed: a clip must outlast its shot)");
for (const s of t.SHOTS) {
  const file = join(inst.pub, `${s.src}.${s.kind === "clip" ? "mp4" : "jpg"}`);
  if (!existsSync(file)) {
    say(false, `${s.key}: missing ${file}`);
    continue;
  }
  if (s.kind !== "clip") continue;
  const d = duration(file);
  const ok = d >= (s.dur - 0.5) / t.FPS;
  say(ok, `${s.key.padEnd(11)} ${s.src.padEnd(13)} shot ${(s.dur / t.FPS).toFixed(2)}s  clip ${d.toFixed(2)}s`);
}

console.log("\n3. keep-clear (no caption on a head, a face, an important thing or a graphic)");
const hits = t.checkCaptions();
if (!hits.length) say(true, "no caption overlaps a keep-clear band");
for (const h of hits) say(false, `${h.caption} y ${Math.round(h.captionY[0])}–${Math.round(h.captionY[1])} sits on ${h.against} (y ${Math.round(h.bandY[0])}–${Math.round(h.bandY[1])}) at frame ${h.frame}`);

console.log("\n4. safe zone (captions inside y 270–1232)");
let outOfSafe = 0;
for (const c of t.CAPTIONS) {
  const b = t.captionBox(c);
  if (b.y[0] < 270 || b.y[1] > 1232) {
    outOfSafe++;
    say(false, `"${c.text}" spans y ${Math.round(b.y[0])}–${Math.round(b.y[1])}`);
  }
}
if (!outOfSafe) say(true, "every caption is inside the safe box");

console.log("\n5. logos and other fixed assets (content.ts)");
const content = existsSync(inst.file("content.ts")) ? await importTs(inst.file("content.ts")) : {};
const logos = Object.values(content.EVENT ?? {}).filter((v) => typeof v === "string" && /\.(png|jpg|jpeg|webp|svg)$/i.test(v));
if (!logos.length) say(true, "no logo files referenced");
for (const l of logos) say(existsSync(join(inst.pub, l)), `${l}${existsSync(join(inst.pub, l)) ? "" : " — missing from public/" + inst.REEL.assets}`);

console.log(problems.length ? `\n✖ ${problems.length} problem(s)\n` : "\n✔ ready to render\n");
process.exit(problems.length ? 1 : 0);
