/**
 * RedThread — the connective motif. An SVG bezier in #E03127 drawn by animating
 * strokeDashoffset, exactly like the deck's `.thread path`
 * (stroke-dasharray:2600; stroke-dashoffset:2600 -> 0).
 *
 * The thread is what links one scene to the next: it draws in on the cold open,
 * shoots between players on the mechanism beat, traces the loop between the
 * three phones, and retracts on the close.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { ramp } from "../anim";

export type ThreadPath = {
  d: string;
  width?: number;
  opacity?: number;
  /** Frame this path starts drawing. */
  start?: number;
  /** Frames the draw takes. */
  dur?: number;
  /**
   * Dash length for THIS path, in user units. It must be close to the path's
   * own length: the stroke is revealed by walking a single dash of this length
   * across the path, so a dash much longer than the path finishes the reveal in
   * the first few frames and the draw is lost. Roughly the endpoint distance,
   * plus ~15% for the bow.
   */
  len?: number;
};

export const RedThread: React.FC<{
  frame: number;
  paths: ThreadPath[];
  /** SVG user-space box. Defaults to the composition-sized box. */
  viewBox: string;
  /** Dash length — must exceed the longest path length. */
  dashLength?: number;
  color?: string;
  /** Retract the whole bundle: pulls the stroke back out of frame. */
  retractAt?: number;
  retractDur?: number;
  style?: React.CSSProperties;
}> = ({
  frame,
  paths,
  viewBox,
  dashLength = 4200,
  color = C.red,
  retractAt,
  retractDur = 34,
  style,
}) => {
  const retract =
    retractAt === undefined ? 0 : ramp(frame, retractAt, retractDur);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", ...style }}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        {paths.map((p, i) => {
          const L = p.len ?? dashLength;
          const drawn = ramp(frame, p.start ?? 0, p.dur ?? 60);
          // dashoffset L -> 0 draws the stroke in; 0 -> -L pulls it back out.
          const offset = L * (1 - drawn) - L * retract;

          return (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={color}
              strokeWidth={p.width ?? 2.5}
              strokeLinecap="round"
              opacity={p.opacity ?? 0.5}
              strokeDasharray={L}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * ThreadPulse — a short bright dash that travels along a path forever.
 *
 * This is how the film shows a LOOP rather than a one-way draw: the base thread
 * sits drawn at low opacity and a single lit segment cycles around it. Because
 * the position comes from `frame % length`, it is still a pure function of the
 * frame and renders identically on every parallel thread.
 */
export const ThreadPulse: React.FC<{
  frame: number;
  /** One continuous path — the whole loop, not a segment. */
  d: string;
  /** Approximate total length of `d` in user units. */
  len: number;
  viewBox: string;
  /** User units travelled per frame. */
  speed?: number;
  /** Length of the lit segment. */
  dash?: number;
  /** Frame the base thread starts drawing in. */
  start?: number;
  drawDur?: number;
  width?: number;
  baseOpacity?: number;
}> = ({
  frame,
  d,
  len,
  viewBox,
  speed = 7,
  dash = 90,
  start = 0,
  drawDur = 50,
  width = 2,
  baseOpacity = 0.26,
}) => {
  const drawn = ramp(frame, start, drawDur);
  // Travel only begins once the base thread has finished drawing.
  const travel = Math.max(0, frame - (start + drawDur));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <path
          d={d}
          fill="none"
          stroke={C.red}
          strokeWidth={width}
          strokeLinecap="round"
          opacity={baseOpacity * drawn}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - drawn)}
        />
        {travel > 0 ? (
          <path
            d={d}
            fill="none"
            stroke={C.red}
            strokeWidth={width + 1.4}
            strokeLinecap="round"
            opacity={0.95}
            strokeDasharray={`${dash} ${len}`}
            strokeDashoffset={-((travel * speed) % (len + dash))}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * ThreadWipe — a red edge that sweeps the frame. Used sparingly: exactly twice
 * in the film, at the two hard narrative turns. Scene transitions are otherwise
 * straight cuts.
 */
export const ThreadWipe: React.FC<{
  frame: number;
  start: number;
  dur?: number;
  direction?: "left" | "right";
}> = ({ frame, start, dur = 26, direction = "right" }) => {
  const p = ramp(frame, start, dur);
  if (p <= 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.ink,
          transformOrigin: direction === "right" ? "left center" : "right center",
          scale: `${p.toFixed(4)} 1`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 5,
          background: C.red,
          left: direction === "right" ? `${(p * 100).toFixed(3)}%` : undefined,
          right: direction === "left" ? `${(p * 100).toFixed(3)}%` : undefined,
          opacity: p > 0.02 && p < 0.99 ? 1 : 0,
          boxShadow: "0 0 40px rgba(224,49,39,.7)",
        }}
      />
    </AbsoluteFill>
  );
};
