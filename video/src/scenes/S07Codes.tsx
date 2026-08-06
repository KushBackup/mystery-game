/**
 * SCENE 07 — CODES ARE SOCIAL OBJECTS (240 frames / 8s)
 *
 * The pinned bone card is the hero. The pushpin lands first, then the card
 * swings down to its resting rotation — see PinCard for why that order matters.
 *
 * The code counts are the deck's own tally, exactly: 10 accusation, 10 motive,
 * 7 evidence, 6 revelation, 1 confession. Plus one personal code per character.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { PinCard } from "../components/PinCard";
import { StatNumber } from "../components/StatNumber";
import { C, F } from "../theme";
import { enter, stagger } from "../anim";
import { useLayout } from "../layout";

const CODES: { value: number; label: string }[] = [
  { value: 10, label: "Accusation · R1" },
  { value: 10, label: "Motive · R2" },
  { value: 7, label: "Evidence · R3" },
  { value: 6, label: "Revelation · R4–5" },
  { value: 1, label: "Confession · R6" },
];

export const S07Codes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { margin, pick, width, inner } = useLayout();

  const cardW = pick(620, 780);
  const cardX = pick(width - margin - cardW, margin + (inner - cardW) / 2);
  const gap = pick(28, 40);
  const cols = pick(5, 3);
  const colW = (inner - gap * (cols - 1)) / cols;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="bl" />
      <Chrome
        frame={frame}
        topLeft="Chapter 11"
        topRight="The Code System"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="07"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(190, 210),
          width: pick(880, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>
            The mechanic that forces the room to talk
          </Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(104, 84)}
          step={7}
          lineHeight={0.88}
          style={{ marginTop: pick(22, 26) }}
          lines={[[{ t: "Codes are" }], [{ t: "social objects", hot: true }]]}
        />

        <p
          style={{
            marginTop: pick(38, 34),
            width: pick(620, 936),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(26, 30),
            lineHeight: 1.52,
            color: C.dim,
            ...enter(frame, 44, { y: 22, dur: 28 }),
          }}
        >
          Codes arrive on printed cards, or belong to a specific character. The
          only way to get one you don&rsquo;t have is to persuade someone to give
          it to you.
        </p>
      </div>

      {/* The pinned exhibit. */}
      <PinCard
        frame={frame}
        start={62}
        fps={fps}
        width={cardW}
        rotate={-1.6}
        quoteSize={pick(31, 36)}
        heading="Why codes and not taps"
        footer="Rejected if entered too early"
        style={{
          position: "absolute",
          left: cardX,
          top: pick(330, 660),
        }}
      >
        A code has to be obtained from someone — the app can&rsquo;t hand it
        over.
      </PinCard>

      {/* The tally. */}
      <div
        style={{
          position: "absolute",
          left: margin,
          bottom: pick(210, 260),
          width: inner,
          display: "flex",
          flexWrap: "wrap",
          gap: `${pick(0, 40)}px ${gap}px`,
        }}
      >
        {CODES.map((c, i) => (
          <StatNumber
            key={c.label}
            frame={frame}
            start={stagger(120, i, 8)}
            value={c.value}
            label={c.label}
            size={pick(76, 80)}
            labelSize={pick(14, 16)}
            ruleWidth={colW * 0.8}
            dur={26}
            style={{ width: colW }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: margin,
          bottom: pick(140, 170),
          width: pick(1300, inner),
          fontFamily: F.read,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: pick(23, 26),
          color: C.dim2,
          ...enter(frame, 176, { y: 14, dur: 24 }),
        }}
      >
        Plus one personal code per character — fifty more reasons to
        introduce yourself to a stranger.
      </div>
    </AbsoluteFill>
  );
};
