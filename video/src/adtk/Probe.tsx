/**
 * Probe.tsx — a still of one clip with a labelled grid, for mapping where the
 * faces and important things are BEFORE captions are placed.
 *
 * Rendered by scripts/reel/probe.mjs (first / middle / last frame of every
 * clip). A full-frame clip fills the 1920×1080 canvas; a pane clip is drawn in
 * its own 640×1080 box at the left, and its grid labels are PANE-LOCAL px —
 * the same numbers a pane's `clear` bands use. Horizontal lines every 100px
 * (labelled at the left), vertical lines every 100px (labelled at the top).
 */

import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { ASSET_DIR } from "./theme";
import { H, PANE_W, SAFE, W } from "./timeline";

export type ProbeProps = { src: string; pane: boolean; frame: number };

const label: React.CSSProperties = { position: "absolute", font: "700 22px/1 sans-serif", color: "#ffe600", textShadow: "0 0 4px #000, 0 0 2px #000" };

export const Probe: React.FC<ProbeProps> = ({ src, pane, frame }) => {
  const bw = pane ? PANE_W : W;
  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: H, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(`${ASSET_DIR}/${src}.mp4`)} muted trimBefore={frame} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {Array.from({ length: Math.floor(H / 100) }).map((_, i) => {
          const y = (i + 1) * 100;
          const major = y % 500 === 0;
          return (
            <div key={`h${y}`} style={{ position: "absolute", left: 0, right: 0, top: y, height: major ? 3 : 1, background: major ? "rgba(255,230,0,.95)" : "rgba(255,230,0,.6)" }}>
              <span style={{ ...label, left: 6, top: -24 }}>{y}</span>
            </div>
          );
        })}
        {Array.from({ length: Math.floor(bw / 100) }).map((_, i) => {
          const x = (i + 1) * 100;
          const major = x % 500 === 0;
          return (
            <div key={`v${x}`} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: major ? 3 : 1, background: major ? "rgba(0,230,255,.9)" : "rgba(0,230,255,.5)" }}>
              <span style={{ ...label, top: 30, left: 4, color: "#00e6ff" }}>{x}</span>
            </div>
          );
        })}
        {pane ? null : (
          <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, outline: "3px dashed rgba(255,80,200,.9)" }} />
        )}
      </div>
      <div style={{ position: "absolute", right: 16, bottom: 16, font: "700 30px/1 sans-serif", color: "#fff", textShadow: "0 0 6px #000" }}>
        {src} · f{frame}
      </div>
    </AbsoluteFill>
  );
};
