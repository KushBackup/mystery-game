/**
 * SCENE 13 — THE PLATFORM (300 frames / 10s)
 *
 * Six worlds deal in like cards off a deck: each arrives rotated and settles.
 *
 * STATUS HONESTY: exactly one of these has shipped, and only that one gets the
 * filled red tag. The other five carry an outlined ROADMAP tag and the whole
 * grid is captioned so no frame of this film can be screenshotted to imply five
 * shipped genres. Descriptions are the deck's, verbatim.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker, Tag } from "../components/Kicker";
import { Card } from "../components/PinCard";
import { C, F } from "../theme";
import { enter, land, stagger } from "../anim";
import { useLayout } from "../layout";

const WORLDS: { name: string; blurb: string; shipped: boolean }[] = [
  {
    name: "Murder Mystery",
    blurb: "Whodunnit, 32 players, 7 rounds.",
    shipped: true,
  },
  {
    name: "Espionage",
    blurb: "Competing factions, double agents.",
    shipped: false,
  },
  { name: "Fantasy", blurb: "Quest lines, factions, artefacts.", shipped: false },
  { name: "Horror", blurb: "Survival pacing, hidden infection.", shipped: false },
  {
    name: "Treasure Hunt",
    blurb: "Location-gated, venue-native.",
    shipped: false,
  },
  {
    name: "Branded & Edu",
    blurb: "Client IP, onboarding, training.",
    shipped: false,
  },
];

export const S13Platform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { margin, pick, inner } = useLayout();

  const cols = pick(3, 2);
  const gap = pick(26, 20);
  const cardW = (inner - gap * (cols - 1)) / cols;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tr" redLamp />
      <Chrome
        frame={frame}
        topLeft="Chapter 02"
        topRight="One Engine · Many Worlds"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="13"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(172, 210),
          width: inner,
        }}
      >
        <div style={{ ...enter(frame, 2, { y: 14, dur: 18 }) }}>
          <Kicker size={pick(17, 20)}>The strategic claim</Kicker>
        </div>

        <Headline
          frame={frame}
          start={10}
          size={pick(104, 84)}
          step={7}
          lineHeight={0.88}
          style={{ marginTop: pick(20, 24) }}
          lines={[[{ t: "One engine." }], [{ t: "Many worlds.", hot: true }]]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(430, 680),
          width: inner,
          display: "flex",
          flexWrap: "wrap",
          gap,
        }}
      >
        {WORLDS.map((w, i) => {
          const at = stagger(56, i, 14);
          return (
            <Card
              key={w.name}
              top={w.shipped ? "red" : "none"}
              pad={pick(24, 26)}
              style={{
                width: cardW,
                minHeight: pick(186, 210),
                transformOrigin: "top center",
                // Dealt: arrives rotated, settles flat.
                ...land(frame, at, fps, {
                  dur: 34,
                  y: -30,
                  scaleFrom: 0.94,
                  rotateFrom: i % 2 === 0 ? -5 : 5,
                  rotateTo: 0,
                }),
              }}
            >
              <Tag
                variant={w.shipped ? "solid" : "ghost"}
                size={pick(13, 15)}
              >
                {w.shipped ? "Shipped" : "Roadmap"}
              </Tag>

              <h3
                style={{
                  fontFamily: F.disp,
                  fontWeight: 700,
                  fontSize: pick(38, 44),
                  lineHeight: 1.02,
                  textTransform: "uppercase",
                  color: w.shipped ? C.bone : C.dim,
                  margin: `${pick(16, 18)}px 0 ${pick(8, 10)}px`,
                }}
              >
                {w.name}
              </h3>

              <p
                style={{
                  fontFamily: F.read,
                  fontWeight: 300,
                  fontSize: pick(20, 24),
                  lineHeight: 1.45,
                  color: C.dim2,
                }}
              >
                {w.blurb}
              </p>
            </Card>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: margin,
          bottom: pick(146, 150),
          width: inner,
          borderTop: `1px solid ${C.line}`,
          paddingTop: pick(22, 24),
          fontFamily: F.read,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: pick(24, 27),
          lineHeight: 1.45,
          color: C.dim2,
          ...enter(frame, 196, { y: 16, dur: 26 }),
        }}
      >
        One story shipped. Five mapped, none built.{" "}
        <span style={{ fontStyle: "normal", color: C.bone }}>
          Content is data, not code — a new story ships as a pack, not a release.
        </span>
      </div>
    </AbsoluteFill>
  );
};
