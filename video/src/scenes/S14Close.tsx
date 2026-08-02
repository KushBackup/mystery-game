/**
 * SCENE 14 — CLOSE (180 frames / 6s)
 *
 * "Trust no one." Then everything strips away except the red thread and the
 * wordmark, the thread retracts, and the film cuts to black.
 *
 * STRUCTURE NOTE: everything that leaves is wrapped in ONE stripping layer, so
 * the exit transform composes with each child's own entrance instead of
 * overwriting it. Spreading an exit style alongside an entrance style on the
 * same element silently cancels the entrance — both write `opacity` and
 * `translate`, and the later spread wins.
 *
 * Copy is the deck's closing slide, verbatim — including the contact block. The
 * deck's illustrative guest line appears nowhere in this film: it is not an
 * attributed testimonial and putting it on screen would read as one.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Tag } from "../components/Kicker";
import { RedThread } from "../components/RedThread";
import { C, F } from "../theme";
import { enter, exitUp } from "../anim";
import { useLayout } from "../layout";

/** Frame everything but the thread and the wordmark starts leaving. */
const STRIP_AT = 104;
/** Frame the thread starts pulling back out of frame. */
const RETRACT_AT = 122;
/** Hard cut to black. */
const BLACK_AT = 172;

const CONTACT: [string, string][] = [
  ["Contact", "kushagra@triplespeed.ai"],
  ["Based in", "Bangalore, India"],
  ["Experience", "Murder Mystery · v1.0"],
];

export const S14Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { margin, pick, inner } = useLayout();

  const strip = exitUp(frame, STRIP_AT, { dur: 26, y: -30 });

  const tagTop = pick(270, 380);
  const headTop = pick(338, 462);
  const headSize = pick(178, 138);
  const proseTop = headTop + headSize * 0.84 * 2 + pick(42, 46);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" redLamp />

      {/* The thread survives the strip, then retracts. */}
      <RedThread
        frame={frame}
        viewBox={`0 0 ${width} ${height}`}
        retractAt={RETRACT_AT}
        retractDur={40}
        paths={pick(
          [
            {
              d: "M 0 700 C 460 640, 760 820, 1180 600 S 1620 380, 1920 240",
              width: 2.5,
              opacity: 0.5,
              start: 2,
              dur: 76,
              len: 2200,
            },
          ],
          [
            {
              d: "M 0 1240 C 300 1140, 640 1380, 860 1020 S 940 620, 1080 380",
              width: 2.5,
              opacity: 0.5,
              start: 2,
              dur: 76,
              len: 1800,
            },
          ],
        )}
      />

      {/* EVERYTHING THAT LEAVES. One layer, one exit. */}
      <AbsoluteFill style={{ ...strip }}>
        <Chrome
          frame={frame}
          rails={false}
          topLeft="Astral Project"
          topRight="● Case Closed"
          bottomRight="14"
        />

        <div
          style={{
            position: "absolute",
            left: margin,
            top: tagTop,
            ...enter(frame, 4, { y: 14, dur: 20 }),
          }}
        >
          <Tag size={pick(15, 18)}>Thank you</Tag>
        </div>

        <p
          style={{
            position: "absolute",
            left: margin,
            top: proseTop,
            width: pick(900, 936),
            fontFamily: F.read,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: pick(32, 34),
            lineHeight: 1.45,
            color: C.dim,
            ...enter(frame, 52, { y: 22, dur: 28 }),
          }}
        >
          Except, briefly, the thirty-one people you just spent three hours
          interrogating.
        </p>

        <div
          style={{
            position: "absolute",
            left: margin,
            bottom: pick(170, 240),
            // An absolutely-positioned flex row with no width shrink-wraps to
            // its content and blows past the margin instead of wrapping.
            width: inner,
            display: "flex",
            flexWrap: "wrap",
            gap: pick("64px", "28px 40px"),
            borderTop: `1px solid ${C.line}`,
            paddingTop: pick(30, 32),
            ...enter(frame, 74, { y: 20, dur: 26 }),
          }}
        >
          {CONTACT.map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: pick(14, 17),
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.dim2,
                  marginBottom: 10,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: F.disp,
                  fontWeight: 700,
                  fontSize: pick(34, 34),
                  color: C.bone,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* THE WORDMARK. Stays until the cut. */}
      <div style={{ position: "absolute", left: margin, top: headTop }}>
        <Headline
          frame={frame}
          start={14}
          fps={fps}
          mode="slam"
          step={10}
          size={headSize}
          lineHeight={0.84}
          lines={[[{ t: "Trust" }], [{ t: "no one.", hot: true }]]}
        />
      </div>

      {frame >= BLACK_AT ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
