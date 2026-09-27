/**
 * promo-stills.mjs — precheck stills for the 15s promo, bundled once.
 *
 *   node scripts/promo-stills.mjs [compId] [outDir] [frame,frame,...]
 *
 * Defaults to the safe-zone cut and a frame from every beat. One bundle, many
 * renderStill calls — far faster than N separate `npx remotion still` runs.
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const comp = process.argv[2] ?? "Promo-15s-SafeZone";
const outDir = resolve(here, "..", process.argv[3] ?? "out/promo-stills");
const frames = (process.argv[4] ?? "2,20,48,70,95,125,150,168,176,195,210,222,245,262,290,312,326,340,352,372,386,400,449")
  .split(",")
  .map(Number);

mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: resolve(here, "../src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp });

for (const frame of frames) {
  const output = resolve(outDir, `f${String(frame).padStart(3, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: 0.5, overwrite: true });
  console.log("still", frame);
}
