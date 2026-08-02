/**
 * PinCard — the deck's `.pin`: a bone paper card, slightly rotated, with a heavy
 * drop shadow and a red circular pushpin at top-centre.
 *
 * The landing choreography matters: the PUSHPIN arrives first, then the card
 * swings down from a steeper rotation to its resting ±1.5-2.5deg. That order is
 * what makes it read as pinned rather than as a div that faded in.
 */

import React from "react";
import { C, F } from "../theme";
import { land, ramp } from "../anim";

export const PinCard: React.FC<{
  frame: number;
  start: number;
  fps: number;
  /** The mono header strip, e.g. "DESIGN CONSTRAINT". */
  heading?: string;
  /** The italic pull quote — the card's reason to exist. */
  children: React.ReactNode;
  /** The dashed-rule footer line. */
  footer?: string;
  width: number;
  /** Resting rotation. The deck uses ±1.4 to ±2.5deg. */
  rotate?: number;
  quoteSize?: number;
  style?: React.CSSProperties;
}> = ({
  frame,
  start,
  fps,
  heading,
  children,
  footer,
  width,
  rotate = 1.8,
  quoteSize = 27,
  style,
}) => {
  const k = width / 470; // the deck authored this card at ~470px wide
  const pin = ramp(frame, start, 12);
  // The card starts 6deg off and 38px high, then settles — the deck's `.drop`.
  const card = land(frame, start + 7, fps, {
    dur: 40,
    y: -38 * k,
    rotateFrom: rotate > 0 ? 6 : -6,
    rotateTo: rotate,
  });

  return (
    <div style={{ width, position: "relative", ...style }}>
      <div
        style={{
          background: C.bone,
          color: C.ink,
          boxShadow: "0 34px 76px rgba(0,0,0,.66)",
          padding: `${34 * k}px ${30 * k}px ${28 * k}px`,
          position: "relative",
          transformOrigin: "top center",
          ...card,
        }}
      >
        {heading ? (
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 14 * k,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.redDeep,
              paddingBottom: 14 * k,
              marginBottom: 18 * k,
              borderBottom: `2px solid ${C.ink}`,
            }}
          >
            {heading}
          </div>
        ) : null}

        <div
          style={{
            fontFamily: F.read,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: quoteSize,
            lineHeight: 1.4,
          }}
        >
          {children}
        </div>

        {footer ? (
          <div
            style={{
              marginTop: 20 * k,
              paddingTop: 16 * k,
              borderTop: "1px dashed rgba(12,13,15,.35)",
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 14 * k,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.boneMeta,
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>

      {/* The pushpin lands first, above the card, and never rotates with it. */}
      <div
        style={{
          position: "absolute",
          top: -12 * k,
          left: "50%",
          translate: "-50% 0",
          scale: `${(0.4 + 0.6 * pin).toFixed(4)}`,
          opacity: pin,
          width: 24 * k,
          height: 24 * k,
          borderRadius: "50%",
          background: C.red,
          boxShadow:
            "0 6px 10px rgba(0,0,0,.6), inset 0 -4px 6px rgba(0,0,0,.32)",
          zIndex: 2,
        }}
      />
    </div>
  );
};

/**
 * Card — the deck's dark `.card`, with the coloured top border variants.
 * Used for the principle grids and the genre cards.
 */
export const Card: React.FC<{
  children: React.ReactNode;
  /**
   * The deck also has a `t-amber` card. Not ported: amber is numerals only in
   * this film, and a card's top rule is neither a numeral nor data.
   */
  top?: "red" | "bone" | "none";
  style?: React.CSSProperties;
  pad?: number;
}> = ({ children, top = "red", style, pad = 28 }) => {
  const topColor =
    top === "red" ? C.red : top === "bone" ? C.bone2 : undefined;

  return (
    <div
      style={{
        background: C.ink2,
        border: `1px solid ${C.line}`,
        borderTop: topColor ? `3px solid ${topColor}` : `1px solid ${C.line}`,
        padding: pad,
        position: "relative",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
