/**
 * SCENE 09 — THE VERDICT (270 frames / 9s)
 *
 * The tallies genuinely move, and the lead genuinely changes hands: the second
 * row leads at the midpoint and is overtaken by the first before the count
 * settles. The red bar marks whoever is ahead RIGHT NOW, so the overtake is an
 * event you can see rather than a number you have to compare.
 *
 * The suspects are redacted rather than named. The cast is fictional and
 * unpublished, so redaction is both the honest choice and the on-theme one — and
 * the totals never exceed the 50 players who exist.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { Phone } from "../components/Phone";
import { RedactedBar } from "../components/Redaction";
import { C, F } from "../theme";
import { EASE, enter, stagger } from "../anim";
import { useLayout } from "../layout";

/**
 * Keyframed tallies. Final total is exactly 50 — the number of players in the
 * room — and no intermediate total exceeds it.
 */
const KEYS = [70, 132, 200];
const TALLIES: { counts: [number, number, number]; nameW: number }[] = [
  { counts: [0, 9, 19], nameW: 0.74 },
  { counts: [0, 13, 15], nameW: 0.58 },
  { counts: [0, 7, 8], nameW: 0.86 },
  { counts: [0, 3, 5], nameW: 0.5 },
  { counts: [0, 2, 3], nameW: 0.68 },
];
const MAX_COUNT = 19;

export const S09Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, width, inner } = useLayout();

  const phoneW = pick(300, 300);
  const phoneX = pick(width - margin - phoneW - 84, (width - phoneW) / 2);
  const phoneY = pick(250, 450);

  const listW = pick(1120, inner);
  const nameColW = pick(190, 190);
  const countColW = pick(84, 84);
  const trackW = listW - nameColW - countColW - pick(48, 40);
  const rowStep = pick(78, 96);

  const live = TALLIES.map((t) =>
    Math.round(
      interpolate(frame, KEYS, t.counts, {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE,
      }),
    ),
  );
  const leader = live.indexOf(Math.max(...live));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tr" redLamp />
      <Chrome
        frame={frame}
        topLeft="Chapter 08"
        topRight="The Verdict"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="09"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 210),
          width: pick(1120, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>Screen 07 · Verdict</Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(88, 74)}
          step={7}
          lineHeight={0.9}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "Public commitment," }],
            [{ t: "publicly visible", hot: true }],
          ]}
        />
      </div>

      {/* The ballot. */}
      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(444, 1180),
          width: listW,
        }}
      >
        {TALLIES.map((t, i) => {
          const isLeader = i === leader && live[i] > 0;
          const row = enter(frame, stagger(56, i, 9), { y: 20, dur: 24 });
          const fill = live[i] / MAX_COUNT;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: pick(24, 20),
                height: rowStep,
                borderBottom: `1px solid ${C.line2}`,
                ...row,
              }}
            >
              <div style={{ width: nameColW, display: "flex", alignItems: "center" }}>
                <RedactedBar
                  width={nameColW * t.nameW}
                  height={pick(20, 22)}
                  opacity={0.9}
                />
              </div>

              <div
                style={{
                  width: trackW,
                  height: pick(18, 22),
                  background: C.ink2,
                  border: `1px solid ${C.line}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${(fill * 100).toFixed(2)}%`,
                    background: isLeader ? C.red : C.bone2,
                    opacity: isLeader ? 1 : 0.42,
                  }}
                />
              </div>

              <div
                style={{
                  width: countColW,
                  textAlign: "right",
                  fontFamily: F.disp,
                  fontWeight: 700,
                  fontSize: pick(52, 58),
                  lineHeight: 0.86,
                  color: C.amber,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {live[i]}
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: pick(26, 32),
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: pick(17, 19),
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.dim2,
            ...enter(frame, 214, { y: 14, dur: 24 }),
          }}
        >
          Ten characters under suspicion ·{" "}
          <span style={{ color: C.red }}>one is the murderer</span>
        </div>
      </div>

      {/* Screen 07 as shipped: two-tap confirm, live counts, changeable votes.
          Slides in from the side in the master, rises in the social cut. */}
      <div
        style={{
          position: "absolute",
          left: phoneX,
          top: phoneY,
          ...enter(frame, 40, {
            x: pick(60, 0),
            y: pick(0, 34),
            dur: 32,
          }),
        }}
      >
        <Phone
          width={phoneW}
          screens={[{ src: "screen-07-vote.png", opacity: 1 }]}
          caption="Live counts"
        />
      </div>
    </AbsoluteFill>
  );
};
