/**
 * Chrome — the deck's evidence-room frame: two hairline rails and four corner
 * mono labels. Lifted from `.railT` / `.railB` / `.c-tl` / `.c-tr` / `.c-bl` /
 * `.c-br`. Carrying it into the film is what makes the video read as the same
 * artefact as the deck rather than a generic explainer.
 *
 * Covers and dividers in the deck are chromeless; the same applies here, so the
 * cold open and the close pass `rails={false}`.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { C, monoStyle } from "../theme";
import { useLayout } from "../layout";
import { ramp } from "../anim";

export const Chrome: React.FC<{
  frame: number;
  topLeft?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomRight?: string;
  rails?: boolean;
  /** Frame the chrome fades up on. */
  start?: number;
}> = ({
  frame,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  rails = true,
  start = 0,
}) => {
  const { margin, pick } = useLayout();
  const p = ramp(frame, start, 24);
  const size = pick(17, 20);
  const railTop = pick(112, 132);
  const railBottom = pick(106, 126);
  const labelTop = pick(64, 78);
  const labelBottom = pick(56, 68);

  const label = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    ...monoStyle(size),
    opacity: p,
    ...extra,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {rails ? (
        <>
          <div
            style={{
              position: "absolute",
              top: railTop,
              left: margin,
              right: margin,
              height: 1,
              background: C.line,
              transformOrigin: "left center",
              scale: `${p.toFixed(4)} 1`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: railBottom,
              left: margin,
              right: margin,
              height: 1,
              background: C.line,
              transformOrigin: "right center",
              scale: `${p.toFixed(4)} 1`,
            }}
          />
        </>
      ) : null}

      {topLeft ? (
        <div style={label({ top: labelTop, left: margin, color: C.bone })}>
          {topLeft}
        </div>
      ) : null}
      {topRight ? (
        <div style={label({ top: labelTop, right: margin, color: C.red })}>
          {topRight}
        </div>
      ) : null}
      {bottomLeft ? (
        <div style={label({ bottom: labelBottom, left: margin, color: C.dim2 })}>
          {bottomLeft}
        </div>
      ) : null}
      {bottomRight ? (
        <div
          style={label({ bottom: labelBottom, right: margin, color: C.dim2 })}
        >
          {bottomRight}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
