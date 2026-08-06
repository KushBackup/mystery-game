/**
 * SCENE 04 — WHAT IT IS (300 frames / 10s)
 *
 * The only scene that leads on numbers. Four amber numerals count up, staggered
 * 8 frames apart, each with a mono label and a hairline rule drawing under it.
 *
 * Every figure here is from the deck and is true:
 *   50 simultaneous players · 7 host-gated rounds · 3hr typical runtime ·
 *   1 host per event · 0 professional actors · 0 app-store installs.
 * Nothing about revenue, tickets, attendance or customers appears in this film.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { StatNumber } from "../components/StatNumber";
import { C, F } from "../theme";
import { enter, stagger } from "../anim";
import { useLayout } from "../layout";

const STATS: { value: number; label: string }[] = [
  { value: 50, label: "Players" },
  { value: 7, label: "Rounds" },
  { value: 3, label: "Hours" },
  { value: 1, label: "Host" },
];

export const S04What: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, inner, vertical } = useLayout();

  const numSize = pick(180, 190);
  const colGap = pick(56, 44);
  const cols = pick(4, 2);
  const colW = (inner - colGap * (cols - 1)) / cols;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tr" />
      <Chrome
        frame={frame}
        topLeft="Chapter 05"
        topRight="Definition"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="04"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 220),
          width: pick(1240, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>What is Astral Project?</Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(96, 80)}
          step={7}
          lineHeight={0.9}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "A three-hour story" }],
            [{ t: "played by the whole room", hot: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(30, 34),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(27, 31),
            lineHeight: 1.5,
            color: C.dim,
            maxWidth: pick(1140, 936),
            ...enter(frame, 48, { y: 22, dur: 28 }),
          }}
        >
          Up to 50 guests log in as characters in a single murder case. Each one
          receives a private identity, a secret, a motive and a timeline.
        </p>

        {/* The rest of the deck's definition. The master cut has no room for it
            without crowding the counters; the social cut has the height. */}
        {vertical ? (
          <p
            style={{
              marginTop: 30,
              fontFamily: F.read,
              fontWeight: 300,
              fontSize: 31,
              lineHeight: 1.5,
              color: C.dim2,
              ...enter(frame, 66, { y: 22, dur: 28 }),
            }}
          >
            A host advances the story in rounds; the app releases information;
            players trade what they know face to face; the room votes; the truth
            is revealed on every screen at once.
          </p>
        ) : null}
      </div>

      {/* The counters. Amber, and nothing else in this film is amber. */}
      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(636, 900),
          width: inner,
          display: "flex",
          flexWrap: "wrap",
          gap: `${pick(0, 80)}px ${colGap}px`,
        }}
      >
        {STATS.map((s, i) => (
          <StatNumber
            key={s.label}
            frame={frame}
            start={stagger(96, i, 8)}
            value={s.value}
            label={s.label}
            size={numSize}
            labelSize={pick(17, 20)}
            rulePos="bottom"
            ruleWidth={colW * 0.82}
            dur={34}
            style={{ width: colW }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: margin,
          bottom: pick(148, 190),
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: pick(18, 20),
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.dim2,
          ...enter(frame, 190, { y: 16, dur: 26 }),
        }}
      >
        <span style={{ color: C.bone }}>0</span> professional actors ·{" "}
        <span style={{ color: C.bone }}>0</span> app-store installs ·{" "}
        <span style={{ color: C.bone }}>no</span> built set
      </div>
    </AbsoluteFill>
  );
};
