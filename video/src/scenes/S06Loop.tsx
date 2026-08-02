/**
 * SCENE 06 — THE LOOP (360 frames / 12s)
 *
 * The loop the whole evening runs on. Three phones stagger in — evidence,
 * decoder, comms — and a red thread traces the circuit between them and keeps
 * cycling: a lit segment travels the loop forever rather than drawing once, so
 * the beat reads as a cycle and not a sequence.
 *
 * THREAD PLACEMENT: the loop runs in the empty band BELOW the phones, anchored
 * to the bottom edge of each screen, with the return leg dipping deeper. An
 * earlier version ran it through the phone centres, where it was completely
 * hidden behind the screenshots in both cuts — the social cut's 26px gutters
 * left nothing visible at all. Both captions therefore sit ABOVE each phone, so
 * the band below stays clear for the thread.
 *
 * Copy verbatim from deck chapter 08, screens 2 of 3.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { Phone, phoneHeight } from "../components/Phone";
import { ThreadPulse } from "../components/RedThread";
import { C, F } from "../theme";
import { enter, stagger } from "../anim";
import { useLayout } from "../layout";

const STEPS: { step: string; src: string; caption: string }[] = [
  {
    step: "Step 01 — Obtain",
    src: "screen-04-evidence.png",
    caption: "Screen 04 · Evidence",
  },
  {
    step: "Step 02 — Enter",
    src: "screen-05-decoder.png",
    caption: "Screen 05 · Decoder",
  },
  {
    step: "Step 03 — Change the case",
    src: "screen-06-comms.png",
    caption: "Screen 06 · Comms",
  },
];

export const S06Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, width, height, inner } = useLayout();

  const gap = pick(64, 26);
  const phoneW = pick(270, (inner - gap * 2) / 3);
  const phoneH = phoneHeight(phoneW);
  /** Top of each column, which starts with two label lines. */
  const rowY = pick(196, 980);
  /** Height of the two label lines above each phone. */
  const labelH = pick(56, 54);
  const rowX = pick(width - margin - (phoneW * 3 + gap * 2), margin);

  // Anchors: bottom-centre of each screen, and the thread band beneath.
  const cx = (i: number) => rowX + i * (phoneW + gap) + phoneW / 2;
  const by = rowY + labelH + phoneH + pick(30, 28);
  const dip = pick(52, 46);

  /** 1 -> 2 -> 3, then a deeper return leg all the way back to 1. */
  const loopD =
    `M ${cx(0)} ${by}` +
    ` Q ${(cx(0) + cx(1)) / 2} ${by + dip} ${cx(1)} ${by}` +
    ` Q ${(cx(1) + cx(2)) / 2} ${by + dip} ${cx(2)} ${by}` +
    ` Q ${(cx(0) + cx(2)) / 2} ${by + dip * 2.4} ${cx(0)} ${by}`;
  const loopLen = (cx(2) - cx(0)) * 2.4;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" redLamp />
      <Chrome
        frame={frame}
        topLeft="Chapter 08"
        topRight="The Loop"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="06"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(166, 200),
          width: pick(660, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>The loop the evening runs on</Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(78, 68)}
          step={7}
          lineHeight={0.9}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "Obtain →" }],
            [{ t: "Enter →" }],
            [{ t: "Change the case", hot: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(34, 34),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(24, 29),
            lineHeight: 1.55,
            color: C.dim,
            ...enter(frame, 52, { y: 22, dur: 28 }),
          }}
        >
          <em style={{ fontStyle: "italic", color: C.bone }}>
            Get a code from a person, type it in, watch the case change.
          </em>{" "}
          The physical card is the social object; the app is what makes it mean
          something.
        </p>

        <p
          style={{
            marginTop: pick(26, 26),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(22, 26),
            lineHeight: 1.5,
            color: C.dim2,
            ...enter(frame, 132, { y: 20, dur: 26 }),
          }}
        >
          A code has to be obtained from someone. Round-gating rejects codes
          entered too early, so nobody outruns the story.
        </p>
      </div>

      {/* The loop, in the clear band under the screens. Keeps circulating. */}
      <ThreadPulse
        frame={frame}
        d={loopD}
        len={loopLen}
        viewBox={`0 0 ${width} ${height}`}
        start={150}
        drawDur={54}
        speed={9}
        dash={110}
        width={2.6}
        baseOpacity={0.42}
      />

      <div
        style={{
          position: "absolute",
          left: rowX,
          top: rowY,
          display: "flex",
          gap,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.src}
            style={{ ...enter(frame, stagger(64, i, 20), { y: 40, dur: 32 }) }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: pick(14, 13),
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.dim2,
              }}
            >
              {s.step}
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: pick(14, 13),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.red,
                marginTop: 6,
                marginBottom: pick(14, 12),
              }}
            >
              {s.caption}
            </div>
            <Phone width={phoneW} screens={[{ src: s.src, opacity: 1 }]} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
