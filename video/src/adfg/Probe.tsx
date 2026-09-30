/**
 * Probe.tsx — a still of one clip or photo with a labelled y-grid, for mapping
 * where the faces and important things are BEFORE captions are placed.
 *
 * Render with scripts/probe-clips.mjs (first / middle / last frame of every
 * clip). Read each shot's head, face, hand-with-phone and product bands off the
 * grid and write them into that shot's `clear` list in timeline.ts. The safe
 * zone (270–1240) is outlined; the lower band is platform UI anyway.
 */

import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { ASSET_DIR } from "./theme";

export type ProbeProps = { src: string; kind: "clip" | "photo"; frame: number };

export const Probe: React.FC<ProbeProps> = ({ src, kind, frame }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {kind === "clip" ? (
      <OffthreadVideo src={staticFile(`${ASSET_DIR}/${src}.mp4`)} muted trimBefore={frame} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <Img src={staticFile(`${ASSET_DIR}/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    )}
    {Array.from({ length: 19 }).map((_, i) => {
      const y = (i + 1) * 100;
      const major = y % 500 === 0;
      return (
        <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: major ? 4 : 2, background: major ? "rgba(255,230,0,.95)" : "rgba(255,230,0,.55)" }}>
          <span
            style={{
              position: "absolute",
              left: 8,
              top: -22,
              font: "700 34px/1 sans-serif",
              color: "#ffe600",
              textShadow: "0 0 4px #000, 0 0 2px #000",
            }}
          >
            {y}
          </span>
        </div>
      );
    })}
    <div style={{ position: "absolute", left: 72, right: 72, top: 270, height: 970, outline: "4px dashed rgba(0,200,255,.9)" }} />
    <div style={{ position: "absolute", right: 16, top: 16, font: "700 40px/1 sans-serif", color: "#fff", textShadow: "0 0 6px #000" }}>
      {src} · f{frame}
    </div>
  </AbsoluteFill>
);
