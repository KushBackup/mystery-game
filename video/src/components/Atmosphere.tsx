/**
 * Atmosphere — the three signature devices that put every scene in the same room.
 *
 *  1. Halftone dot texture, from the deck's `.dots`
 *  2. Interrogation-lamp pool, from the deck's `.lamp` / `.lamp.r`
 *  3. Vignette, from the deck's `.vig`
 *
 * Every scene renders exactly one of these, first, under everything else.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { ramp } from "../anim";
import { useLayout } from "../layout";

type LampCorner = "tl" | "tr" | "bl" | "br" | "none";

export const Atmosphere: React.FC<{
  frame: number;
  /** Which corner the amber lamp pool bleeds in from. */
  lamp?: LampCorner;
  /** Adds the deck's secondary red pool in the opposite corner. */
  redLamp?: boolean;
  /** Fade the whole atmosphere up over N frames. 0 = already on. */
  fadeIn?: number;
  /** Scales the lamp pool. */
  lampScale?: number;
}> = ({ frame, lamp = "tl", redLamp = false, fadeIn = 0, lampScale = 1 }) => {
  const { width, vertical } = useLayout();
  const up = fadeIn > 0 ? ramp(frame, 0, fadeIn) : 1;

  // The deck's lamp is 1500x1500 on a 1920-wide stage. Keep that proportion.
  const size = (width / 1920) * 1500 * lampScale * (vertical ? 1.35 : 1);
  const off = size * 0.14;

  const lampPos: Record<Exclude<LampCorner, "none">, React.CSSProperties> = {
    tl: { left: -off, top: -size * 0.25 },
    tr: { right: -off, top: -size * 0.25 },
    bl: { left: -off, bottom: -size * 0.3 },
    br: { right: -off, bottom: -size * 0.3 },
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* 2. Interrogation-lamp pool — a large soft amber radial bleeding in. */}
      {lamp !== "none" ? (
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            pointerEvents: "none",
            opacity: up,
            background:
              "radial-gradient(circle, rgba(216,163,60,.11), rgba(216,163,60,.03) 42%, transparent 66%)",
            ...lampPos[lamp],
          }}
        />
      ) : null}

      {redLamp ? (
        <div
          style={{
            position: "absolute",
            width: size,
            height: size,
            pointerEvents: "none",
            opacity: up,
            background:
              "radial-gradient(circle, rgba(224,49,39,.08), transparent 62%)",
            ...(lamp === "tl" || lamp === "bl"
              ? { right: -size * 0.22, bottom: -size * 0.35 }
              : { left: -size * 0.22, bottom: -size * 0.35 }),
          }}
        />
      ) : null}

      {/* 1. Halftone dot texture, over everything below it. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.42 * up,
          backgroundImage:
            "radial-gradient(circle, rgba(237,231,218,.10) 1px, transparent 1.4px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* 3. Vignette. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 320px 80px rgba(0,0,0,.8)",
        }}
      />
    </AbsoluteFill>
  );
};
