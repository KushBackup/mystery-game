/**
 * SCENE 03 — THE MECHANISM (270 frames / 9s)
 *
 * The film's turn, and the only scene that must be read against the one before
 * it. The SAME 50 dots start exactly where scene 2 left them — five closed
 * cliques — then each lights up holding one red fragment, red threads shoot
 * between them, and the cliques break apart into a network.
 *
 * Spatial continuity across the cut is load-bearing: the dot rect and the
 * cluster positions are imported from ../dots.ts, shared with scene 2.
 *
 * Copy verbatim from deck chapter 03's mechanism block.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Tag } from "../components/Kicker";
import { DotField, DotState } from "../components/DotField";
import { RedThread, ThreadPath } from "../components/RedThread";
import { C, F } from "../theme";
import { EASE, enter, ramp } from "../anim";
import { useLayout } from "../layout";
import {
  DOT_COUNT,
  EDGES,
  bow,
  clusterPos,
  networkPos,
  toRect,
} from "../dots";

export const S03Mechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, width, height } = useLayout();

  // Identical rect to scene 2 — the dots must not jump across the cut.
  const rect = pick(
    { x: 1136, y: 236, w: 688, h: 640 },
    { x: 72, y: 950, w: 936, h: 650 },
  );
  const dotSize = pick(15, 17);

  const positions = Array.from({ length: DOT_COUNT }, (_, i) => {
    const moveAt = 34 + i * 2.2;
    const p = interpolate(frame, [moveAt, moveAt + 60], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
    const from = toRect(clusterPos(i), rect);
    const to = toRect(networkPos(i), rect);
    return { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
  });

  const dots: DotState[] = positions.map((pos, i) => ({
    x: pos.x,
    y: pos.y,
    opacity: 1,
    lit: ramp(frame, 10 + i * 1.6, 14),
    size: dotSize,
  }));

  // Threads are recomputed each frame against the LIVE dot positions, so the
  // graph is genuinely attached to the players as they move apart.
  const threads: ThreadPath[] = EDGES.map(([a, b], k) => {
    const pa = positions[a];
    const pb = positions[b];
    const dist = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    return {
      d: bow(pa, pb, `${a}-${b}`, 0.13),
      width: 1.6,
      opacity: 0.42,
      start: 88 + k * 2.4,
      dur: 40,
      len: dist * 1.2 + 20,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" redLamp />
      <Chrome
        frame={frame}
        topLeft="Chapter 03"
        topRight="The Mechanism"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="03"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(200, 236),
          width: pick(1000, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Tag size={pick(15, 18)}>The mechanism</Tag>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(112, 92)}
          step={8}
          lineHeight={0.86}
          style={{ marginTop: pick(24, 28) }}
          lines={[[{ t: "Information" }], [{ t: "Asymmetry", hot: true }]]}
        />

        <p
          style={{
            marginTop: pick(36, 40),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(27, 31),
            lineHeight: 1.5,
            color: C.dim,
            ...enter(frame, 56, { y: 24, dur: 28 }),
          }}
        >
          Astral Project distributes unique information across every single
          player. No one can finish alone, and no one can finish with only their
          own table.
        </p>

        <p
          style={{
            marginTop: pick(22, 26),
            fontFamily: F.read,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: pick(29, 33),
            lineHeight: 1.45,
            color: C.bone,
            ...enter(frame, 128, { y: 22, dur: 28 }),
          }}
        >
          Talking to a stranger stops being social bravery and becomes the
          optimal move.
        </p>
      </div>

      {/* Threads sit beneath the dots so the dots read as the nodes. */}
      <RedThread frame={frame} viewBox={`0 0 ${width} ${height}`} paths={threads} />

      <div style={{ position: "absolute", inset: 0 }}>
        <DotField dots={dots} />
      </div>

      <div
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y + rect.h + pick(30, 34),
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: pick(16, 19),
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: C.red,
          ...enter(frame, 186, { y: 14, dur: 24 }),
        }}
      >
        Every player holds a piece nobody else has
      </div>
    </AbsoluteFill>
  );
};
