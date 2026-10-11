/**
 * Reel.tsx — the composition: a 16:9 footage ad for Meta (Feed / in-stream),
 * authored on a 1920×1080 canvas and rendered at 2× (3840×2160).
 *
 * Timed to the voiceover (public/<assets>/vo.mp3). The layers are in
 * ./scenes.tsx; ./timeline.ts derives every cut, caption and cue from the VO's
 * word timings. The audio track is the VO with the sound design ducked under
 * it (scripts/reel/synth.mjs + mix.mjs). It still works sound-off: the
 * captions are the whole script.
 *
 * With `safeZone` on (the `-SafeZone` composition) it also draws the precheck
 * layer: the safe box, every keep-clear band of every shot and pane on screen
 * (red, moving with the lens exactly as the check models it), every graphic's
 * band (orange), and the measured box of every caption and of the step chip
 * (cyan, or solid red when it collides). Use it for every still you review.
 */

import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ASSET_DIR, C } from "./theme";
import { LAYERS, MARGIN, OVERLAY_CLEAR, PANE_W, SAFE, TEXT, TOTAL, W, bandOnScreen, checkCaptions } from "./timeline";
import { Layers } from "./scenes";

export const REEL_FRAMES = TOTAL;

// The rule is checked once when the studio or a render loads the timeline.
checkCaptions().forEach((h) => console.warn(`[keep-clear] "${h.caption}" sits on ${h.against} (frame ${h.frame})`));

const Band: React.FC<{ x: [number, number]; y: [number, number]; color: string; label: string }> = ({ x, y, color, label }) => (
  <div
    style={{
      position: "absolute",
      left: x[0],
      top: y[0],
      width: x[1] - x[0],
      height: y[1] - y[0],
      background: `repeating-linear-gradient(135deg, ${color}55 0 12px, ${color}22 12px 24px)`,
      outline: `2px solid ${color}`,
      font: "700 18px/1.1 sans-serif",
      color: "#fff",
      textShadow: "0 0 4px #000",
      padding: 4,
      boxSizing: "border-box",
    }}
  >
    {label}
  </div>
);

const overlaps = (a: [number, number], b: [number, number]) => a[0] < b[1] + MARGIN && a[1] + MARGIN > b[0];

/** The precheck layer: safe box, keep-clear bands at this frame's lens scale, caption boxes. */
const Precheck: React.FC = () => {
  const f = useCurrentFrame();
  const bands: { x: [number, number]; y: [number, number]; what: string; color: string; graphic?: boolean }[] = [];
  for (const L of LAYERS) {
    if (f < L.from || f >= L.from + L.dur) continue;
    const rel = f - L.from;
    for (const k of L.clear) {
      if (rel < (k.from ?? 0) || rel >= (k.to ?? L.dur)) continue;
      const b = bandOnScreen(L, k, rel);
      if (b.x[1] > b.x[0]) bands.push({ ...b, what: k.what, color: "#ff2a2a" });
    }
  }
  for (const g of OVERLAY_CLEAR) if (f >= g.from && f < g.to) bands.push({ y: g.y, x: g.x ?? [0, W], what: g.what, color: "#ff9a00", graphic: true });
  const caps = TEXT.filter((t) => f >= t.from && f < t.to);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.right - SAFE.left,
          height: SAFE.bottom - SAFE.top,
          outline: "2px dashed rgba(0,200,255,.9)",
        }}
      />
      {[1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * PANE_W, top: 0, bottom: 0, width: 1, background: "rgba(0,200,255,.35)" }} />
      ))}
      {bands.map((b, i) => (
        <Band key={i} x={b.x} y={b.y} color={b.color} label={b.what} />
      ))}
      {caps.map((t, i) => {
        const box = t.box;
        const bad = bands.some((b) => (t.isCaption || !b.graphic) && overlaps(box.y, b.y) && overlaps(box.x, b.x));
        return (
          <div
            key={`c${i}`}
            style={{
              position: "absolute",
              left: box.x[0],
              top: box.y[0],
              width: box.x[1] - box.x[0],
              height: box.y[1] - box.y[0],
              outline: bad ? "6px solid #ff0000" : "2px dashed #00e5ff",
              background: bad ? "rgba(255,0,0,.25)" : "transparent",
            }}
          >
            {bad ? <div style={{ font: "900 22px/1 sans-serif", color: "#fff", background: "#ff0000", padding: 4, display: "inline-block" }}>CAPTION ON A KEEP-CLEAR BAND</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type ReelProps = { safeZone: boolean; withAudio: boolean };

export const Reel: React.FC<ReelProps> = ({ safeZone, withAudio }) => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Layers />
    {safeZone ? <Precheck /> : null}
    {withAudio ? <Audio src={staticFile(`${ASSET_DIR}/audio.wav`)} /> : null}
  </AbsoluteFill>
);
