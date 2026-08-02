/**
 * SCENE 01 — COLD OPEN (240 frames / 8s)
 *
 * Black. The red thread draws across the frame. The wordmark slams in with a
 * spring and a slight overshoot. Halftone and lamp fade up underneath it.
 *
 * Copy is the deck's cover, verbatim: the tag "Live social gaming platform",
 * the MURDER / MYSTERY wordmark with the red underscore, and the cover
 * paragraph. The deck's illustrative guest line is deliberately NOT used
 * anywhere in this film — it is not an attributed testimonial.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Tag } from "../components/Kicker";
import { RedThread } from "../components/RedThread";
import { C, F } from "../theme";
import { enter } from "../anim";
import { useLayout } from "../layout";

export const S01Cold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { margin, pick } = useLayout();

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* Atmosphere arrives out of black rather than being there on frame 0. */}
      <Atmosphere frame={frame} lamp="tl" fadeIn={44} />

      {/* The deck cover's two threads, drawn rather than static. */}
      <RedThread
        frame={frame}
        viewBox={`0 0 ${width} ${height}`}
        paths={pick(
          [
            {
              d: "M 96 900 C 520 830, 760 980, 1180 760 S 1620 520, 1824 300",
              width: 2.5,
              opacity: 0.5,
              start: 4,
              dur: 92,
              len: 2250,
            },
            {
              d: "M 96 1010 C 600 960, 980 1040, 1400 880 S 1740 700, 1824 640",
              width: 1.5,
              opacity: 0.26,
              start: 18,
              dur: 96,
              len: 2100,
            },
          ],
          [
            {
              d: "M 72 1560 C 300 1460, 640 1700, 860 1340 S 900 900, 1008 620",
              width: 2.5,
              opacity: 0.5,
              start: 4,
              dur: 92,
              len: 1700,
            },
            {
              d: "M 72 1740 C 380 1680, 700 1800, 900 1500 S 1000 1120, 1008 940",
              width: 1.5,
              opacity: 0.26,
              start: 18,
              dur: 96,
              len: 1500,
            },
          ],
        )}
      />

      <Chrome
        frame={frame}
        start={112}
        rails={false}
        topLeft="Astral Project"
        topRight="● Case Open"
        bottomRight="01"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(214, 300),
          width: pick(1180, 940),
        }}
      >
        <div style={{ ...enter(frame, 30, { y: 18, dur: 22 }) }}>
          <Tag size={pick(15, 18)}>Live social gaming platform</Tag>
        </div>

        <Headline
          frame={frame}
          start={44}
          fps={fps}
          mode="slam"
          step={11}
          size={pick(216, 152)}
          lineHeight={0.8}
          style={{ marginTop: pick(32, 40) }}
          lines={[
            [{ t: "Murder" }],
            [{ t: "Mystery", hot: true, underline: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(44, 52),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(33, 36),
            lineHeight: 1.5,
            color: C.dim,
            maxWidth: pick(940, 900),
            ...enter(frame, 92, { y: 26, dur: 30 }),
          }}
        >
          Thirty-two strangers. One story. Every player holds a piece nobody
          else has —{" "}
          <em style={{ fontStyle: "italic", color: C.bone }}>
            and the only way out is to talk to each other.
          </em>
        </p>
      </div>
    </AbsoluteFill>
  );
};
