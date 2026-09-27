/**
 * Reel.tsx — the composition: a 9:16 footage ad for Meta (Reels / Stories / Feed).
 *
 * 1080x1920, 30fps, timed to the voiceover (public/<assets>/vo.mp3). The layers
 * are in ./scenes.tsx; ./timeline.ts derives every cut, caption and cue from
 * the VO's word timings. The audio track is the VO with the sound design
 * ducked under it (scripts/reel/synth.mjs + mix.mjs). It still works sound-off:
 * the captions are the whole script.
 *
 * With `safeZone` on (the `-SafeZone` composition) it also draws the precheck
 * layer: the Meta safe zone, every keep-clear band of the shot on screen (red,
 * moving with the lens exactly as the check models it), every graphic's band
 * (orange), and the measured box of every caption and of the step chip (cyan,
 * or solid red when it collides). Use it for every still you review.
 */

import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ASSET_DIR, C } from "./theme";
import { SAFE } from "./fx";
import { PUSH, lensScale, onScreen, originPx } from "./lens";
import { MARGIN, OVERLAY_CLEAR, SHOTS, TEXT, TOTAL, checkCaptions } from "./timeline";
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
      background: `repeating-linear-gradient(135deg, ${color}55 0 14px, ${color}22 14px 28px)`,
      outline: `3px solid ${color}`,
      font: "700 26px/1.1 sans-serif",
      color: "#fff",
      textShadow: "0 0 4px #000",
      padding: 6,
      boxSizing: "border-box",
    }}
  >
    {label}
  </div>
);

const overlaps = (a: [number, number], b: [number, number]) => a[0] < b[1] + MARGIN && a[1] + MARGIN > b[0];

/** The precheck layer: safe zone, keep-clear bands at this frame's lens scale, caption boxes. */
const Precheck: React.FC = () => {
  const f = useCurrentFrame();
  const bands: { x: [number, number]; y: [number, number]; what: string; color: string; graphic?: boolean }[] = [];
  for (const s of SHOTS) {
    if (f < s.from || f >= s.from + s.dur) continue;
    const [ox, oy] = originPx(s.origin);
    const sc = lensScale(f - s.from, s.dur, s.push ?? PUSH[s.kind], s.zoom ?? 1);
    for (const k of s.clear ?? []) {
      const rel = f - s.from;
      if (rel < (k.from ?? 0) || rel >= (k.to ?? s.dur)) continue;
      bands.push({ y: onScreen(k.y[0], k.y[1], oy, sc), x: k.x ? onScreen(k.x[0], k.x[1], ox, sc) : [0, 1080], what: k.what, color: "#ff2a2a" });
    }
  }
  for (const g of OVERLAY_CLEAR) if (f >= g.from && f < g.to) bands.push({ y: g.y, x: g.x ?? [0, 1080], what: g.what, color: "#ff9a00", graphic: true });
  // Every text element on screen now: captions and the step chip.
  const caps = TEXT.filter((t) => f >= t.from && f < t.to);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.top, background: "rgba(0,160,255,.18)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: "rgba(0,160,255,.18)" }} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: SAFE.right - SAFE.left,
          height: SAFE.bottom - SAFE.top,
          outline: "3px dashed rgba(0,200,255,.9)",
        }}
      />
      {bands.map((b, i) => (
        <Band key={i} x={b.x} y={b.y} color={b.color} label={b.what} />
      ))}
      {caps.map((t, i) => {
        const box = t.box;
        // Same rule as checkCaptions(): captions are tested against shot bands AND graphics; the chip only against shot bands.
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
              outline: bad ? "8px solid #ff0000" : "3px dashed #00e5ff",
              background: bad ? "rgba(255,0,0,.25)" : "transparent",
            }}
          >
            {bad ? <div style={{ font: "900 34px/1 sans-serif", color: "#fff", background: "#ff0000", padding: 6, display: "inline-block" }}>CAPTION ON A KEEP-CLEAR BAND</div> : null}
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
