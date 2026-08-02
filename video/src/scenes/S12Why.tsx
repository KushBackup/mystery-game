/**
 * SCENE 12 — WHY IT WORKS (300 frames / 10s)
 *
 * Six mechanisms, fast. Each one snaps in behind a red em-dash marker — never a
 * dot — on a 38-frame stagger, so the last lands with ~90 frames of still,
 * readable hold before the cut.
 *
 * All six are the deck's behavioural-design chapter, verbatim.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { Card } from "../components/PinCard";
import { C, F } from "../theme";
import { enter, land, stagger } from "../anim";
import { useLayout } from "../layout";

const MECHANISMS: [string, string, string][] = [
  [
    "01",
    "Information asymmetry",
    "No player can complete the picture alone. Approaching a stranger becomes the rational move.",
  ],
  [
    "02",
    "Forced reciprocity",
    "Codes are traded, not given. To receive, you have to offer.",
  ],
  [
    "03",
    "Identity cover",
    "A character licenses behaviour the real person wouldn't risk.",
  ],
  [
    "04",
    "Paced revelation",
    "Round gating replaces one long puzzle with seven short arcs.",
  ],
  [
    "05",
    "Public commitment",
    "A visible vote forces a position, and a position must be defended.",
  ],
  [
    "06",
    "Shared narrative memory",
    "The group leaves with a common story, cast and set of in-jokes.",
  ],
];

export const S12Why: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { margin, pick, inner } = useLayout();

  const cols = pick(3, 2);
  const gap = pick(24, 18);
  const cardW = (inner - gap * (cols - 1)) / cols;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" />
      <Chrome
        frame={frame}
        topLeft="Chapter 14"
        topRight="Behavioural Design"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="12"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(170, 210),
          width: inner,
        }}
      >
        <div style={{ ...enter(frame, 2, { y: 14, dur: 18 }) }}>
          <Kicker size={pick(17, 20)}>Chapter 14 · Why it works</Kicker>
        </div>

        <Headline
          frame={frame}
          start={10}
          size={pick(84, 72)}
          step={6}
          lineHeight={0.92}
          style={{ marginTop: pick(18, 22) }}
          lines={[
            [{ t: "Six mechanisms doing the" }],
            [{ t: "social heavy lifting", hot: true }],
          ]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(410, 620),
          width: inner,
          display: "flex",
          flexWrap: "wrap",
          gap,
        }}
      >
        {MECHANISMS.map(([n, title, body], i) => {
          const at = stagger(46, i, 38);
          return (
            <Card
              key={n}
              top="red"
              pad={pick(26, 28)}
              style={{
                width: cardW,
                minHeight: pick(230, 280),
                ...enter(frame, at, { y: 30, dur: 26 }),
              }}
            >
              {/* The marker snaps in a beat ahead of the copy. */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: pick(12, 14),
                }}
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: pick(20, 24),
                    color: C.red,
                    lineHeight: 1,
                    ...land(frame, at, fps, { dur: 16, scaleFrom: 0.2 }),
                  }}
                >
                  —
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 500,
                    fontSize: pick(15, 18),
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: C.red,
                  }}
                >
                  {n}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: F.disp,
                  fontWeight: 700,
                  fontSize: pick(36, 42),
                  lineHeight: 1.02,
                  textTransform: "uppercase",
                  color: C.bone,
                  letterSpacing: "0.005em",
                  margin: `${pick(14, 16)}px 0 ${pick(14, 16)}px`,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontFamily: F.read,
                  fontWeight: 300,
                  fontSize: pick(21, 25),
                  lineHeight: 1.5,
                  color: C.dim,
                }}
              >
                {body}
              </p>
            </Card>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
