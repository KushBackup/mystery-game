/**
 * Headline — the deck's `h2` / `.cover-h`, with `.hot` spans in red.
 *
 * Copy is passed as an array of parts so a single line can mix bone and red
 * without any HTML parsing:
 *   [{t: 'Putting people in a room '}, {t: 'does not make them meet', hot: true}]
 *
 * Words animate as whole lines, not letter by letter — letter-by-letter reads
 * as a template. Lines stagger 6 frames apart.
 */

import React from "react";
import { C, F } from "../theme";
import { enter, slam } from "../anim";

export type Part = { t: string; hot?: boolean; underline?: boolean };
export type Line = Part[];

export const Headline: React.FC<{
  lines: Line[];
  frame: number;
  start: number;
  size: number;
  /** Frames between successive lines. */
  step?: number;
  /** `slam` overshoots (cold open only); `rise` is the house entrance. */
  mode?: "rise" | "slam";
  fps?: number;
  weight?: 700 | 800;
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  frame,
  start,
  size,
  step = 6,
  mode = "rise",
  fps = 30,
  weight = 800,
  lineHeight = 0.9,
  style,
}) => (
  <div
    style={{
      fontFamily: F.disp,
      fontWeight: weight,
      fontSize: size,
      lineHeight,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
      color: C.bone,
      ...style,
    }}
  >
    {lines.map((parts, i) => {
      const at = start + i * step;
      const anim =
        mode === "slam"
          ? slam(frame, at, fps, { scaleFrom: 1.16 })
          : enter(frame, at, { y: 34, dur: 28 });

      return (
        <div
          key={i}
          style={{
            display: "block",
            transformOrigin: "left bottom",
            ...anim,
          }}
        >
          {parts.map((p, j) => (
            <span
              key={j}
              style={{
                color: p.hot ? C.red : C.bone,
                position: p.underline ? "relative" : undefined,
                display: p.underline ? "inline-block" : undefined,
              }}
            >
              {p.t}
              {/* The cover's red underscore: `.cover-h .hot::after` */}
              {p.underline ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: size * 0.07,
                    height: Math.max(4, size * 0.035),
                    background: C.red,
                    opacity: 0.28,
                  }}
                />
              ) : null}
            </span>
          ))}
        </div>
      );
    })}
  </div>
);
