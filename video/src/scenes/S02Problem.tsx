/**
 * SCENE 02 — THE PROBLEM (360 frames / 12s)
 *
 * The 32 dots drift in and pull into five tight cliques, and then nothing
 * happens. That stillness IS the beat — attendance is high, mixing is zero.
 * Deliberately cold: no lamp warmth on the dot field, no thread, no payoff.
 *
 * Copy verbatim from deck chapter 03: the headline, the dek paragraph, and the
 * three named failure modes.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker, EmDash } from "../components/Kicker";
import { DotField, DotState } from "../components/DotField";
import { C, F } from "../theme";
import { EASE, enter, stagger } from "../anim";
import { useLayout } from "../layout";
import { DOT_COUNT, clusterPos, scatterPos, toRect } from "../dots";

const FAILURES: [string, string][] = [
  ["The cluster", "Guests default to the people they came with."],
  ["The capacity ceiling", "Escape rooms and immersive theatre cap at 6–10."],
  ["The friendship tax", "Board and party games assume existing rapport."],
];

export const S02Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick } = useLayout();

  const rect = pick(
    { x: 1136, y: 236, w: 688, h: 640 },
    { x: 72, y: 950, w: 936, h: 650 },
  );
  const dotSize = pick(19, 21);

  const dots: DotState[] = Array.from({ length: DOT_COUNT }, (_, i) => {
    const at = 40 + i * 2.6;
    const p = interpolate(frame, [at, at + 54], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
    const from = toRect(scatterPos(i), rect);
    const to = toRect(clusterPos(i), rect);
    return {
      x: from.x + (to.x - from.x) * p,
      y: from.y + (to.y - from.y) * p,
      opacity: interpolate(frame, [at, at + 16], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      lit: 0,
      size: dotSize,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" lampScale={0.8} />
      <Chrome
        frame={frame}
        topLeft="Chapter 03"
        topRight="The Problem"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="02"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 210),
          width: pick(1000, 936),
        }}
      >
        <div style={{ ...enter(frame, 8, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>Chapter 03 · The problem we solve</Kicker>
        </div>

        <Headline
          frame={frame}
          start={20}
          size={pick(92, 76)}
          step={7}
          lineHeight={0.92}
          style={{ marginTop: pick(18, 22) }}
          lines={[
            [{ t: "Putting people" }],
            [{ t: "in a room " }, { t: "does not", hot: true }],
            [{ t: "make them meet", hot: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(30, 34),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(26, 31),
            lineHeight: 1.5,
            color: C.dim,
            ...enter(frame, 52, { y: 22, dur: 26 }),
          }}
        >
          Parties, offsites, networking nights and mixers all share one failure
          mode: people arrive in a group and leave in the same group. Nothing in
          the format gives a stranger a reason to start talking — or a way to
          stop.
        </p>

        <div style={{ marginTop: pick(40, 46) }}>
          {FAILURES.map(([name, body], i) => (
            <div
              key={name}
              style={{
                display: "flex",
                gap: 18,
                marginBottom: pick(18, 22),
                alignItems: "baseline",
                ...enter(frame, stagger(196, i, 22), { y: 18, dur: 24 }),
              }}
            >
              <EmDash size={pick(19, 22)} />
              <div>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 500,
                    fontSize: pick(16, 19),
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.bone,
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontFamily: F.read,
                    fontWeight: 300,
                    fontSize: pick(21, 25),
                    color: C.dim2,
                    marginLeft: 14,
                  }}
                >
                  {body}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The dot field. Five closed groups, and then no further motion. */}
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
          color: C.dim2,
          ...enter(frame, 210, { y: 14, dur: 24 }),
        }}
      >
        32 guests · five groups · nobody moves
      </div>
    </AbsoluteFill>
  );
};
