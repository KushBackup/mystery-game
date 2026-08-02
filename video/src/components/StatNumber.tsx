/**
 * StatNumber — the deck's `.stat`: a Big Shoulders numeral in AMBER with a mono
 * label beneath, plus a hairline rule that draws out under it.
 *
 * Amber appears here and nowhere else in the film. If you are reaching for this
 * component to render words, you want `Kicker` instead.
 */

import React from "react";
import { C, F } from "../theme";
import { countTo, enter, ruleScaleX } from "../anim";

export const StatNumber: React.FC<{
  frame: number;
  start: number;
  /** The target value. Counts up from 0 and holds. */
  value: number;
  label: string;
  size: number;
  labelSize?: number;
  /** Zero-pads the numeral, e.g. padTo={2} renders 7 as "07". */
  padTo?: number;
  /** A small trailing unit in dim mono, e.g. "hrs". */
  suffix?: string;
  /** Frames the count takes. */
  dur?: number;
  /** Draws the deck's hairline rule. `top` matches `.statrow`'s border-top. */
  rule?: boolean;
  rulePos?: "top" | "bottom";
  ruleWidth?: number | string;
  style?: React.CSSProperties;
}> = ({
  frame,
  start,
  value,
  label,
  size,
  labelSize = 14,
  padTo,
  suffix,
  dur = 30,
  rule = true,
  rulePos = "top",
  ruleWidth = "100%",
  style,
}) => {
  const n = countTo(frame, start, value, dur);
  const shown = padTo ? String(n).padStart(padTo, "0") : String(n);
  const block = enter(frame, start, { y: 22, dur: 24 });

  const hairline = rule ? (
    <div
      style={{
        width: ruleWidth,
        height: 1,
        background: C.line,
        [rulePos === "top" ? "marginBottom" : "marginTop"]: size * 0.28,
        transformOrigin: "left center",
        scale: ruleScaleX(frame, start, 28),
      }}
    />
  ) : null;

  return (
    <div style={{ ...style }}>
      {rulePos === "top" ? hairline : null}

      <div style={{ ...block }}>
        <div
          style={{
            fontFamily: F.disp,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 0.86,
            color: C.amber,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {shown}
          {suffix ? (
            <span
              style={{
                fontSize: size * 0.38,
                color: C.dim,
                fontWeight: 500,
                fontFamily: F.mono,
                letterSpacing: "0.06em",
              }}
            >
              {" "}
              {suffix}
            </span>
          ) : null}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: labelSize,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.dim2,
            marginTop: size * 0.13,
          }}
        >
          {label}
        </div>
      </div>

      {rulePos === "bottom" ? hairline : null}
    </div>
  );
};
