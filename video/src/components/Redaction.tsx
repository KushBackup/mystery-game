/**
 * Redaction — a solid red block over text that wipes open via scaleX from a left
 * transform-origin. Straight out of the deck's `.rd::after`
 * (transform-origin:left; scaleX(1) -> scaleX(0)).
 *
 * Two uses in the film: revealing a character's SECRET on the identity beat, and
 * standing in for suspect names on the vote beat — the real cast list is
 * fictional and unpublished, so redacting it is both honest and on-theme.
 */

import React from "react";
import { C } from "../theme";
import { ramp } from "../anim";

export const Redaction: React.FC<{
  children: React.ReactNode;
  frame: number;
  /** Frame the bar starts wiping open. */
  openAt: number;
  dur?: number;
  color?: string;
  /** Keep the bar shut forever — used for the redacted suspect names. */
  permanent?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  frame,
  openAt,
  dur = 27,
  color = C.red,
  permanent = false,
  style,
}) => {
  const open = permanent ? 0 : ramp(frame, openAt, dur);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          inset: "-3px -8px",
          background: color,
          transformOrigin: "left center",
          scale: `${(1 - open).toFixed(4)} 1`,
        }}
      />
    </span>
  );
};

/**
 * RedactedBar — a standalone redaction block with no text under it, for where a
 * name would go. Sized in em-like units off its height.
 */
export const RedactedBar: React.FC<{
  width: number;
  height: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ width, height, opacity = 1, style }) => (
  <span
    style={{
      display: "inline-block",
      width,
      height,
      background: C.red,
      opacity,
      verticalAlign: "middle",
      ...style,
    }}
  />
);
