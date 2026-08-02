/**
 * SCENE 11 — HOST CONTROL (240 frames / 8s)
 *
 * Opens out of the blackout that ended the reveal, so the phone RISES into
 * frame rather than sliding: the first movement after a hard cut should come up
 * out of the floor.
 *
 * The four console controls and their descriptions are the deck's host-console
 * cards, verbatim.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker, EmDash } from "../components/Kicker";
import { Phone } from "../components/Phone";
import { Card } from "../components/PinCard";
import { C, F } from "../theme";
import { enter, stagger } from "../anim";
import { useLayout } from "../layout";

const CONTROLS: [string, string][] = [
  ["Round control", "Advance or step back. Syncs to every device instantly."],
  ["Voting", "Open, close, and decide when the room sees the tally."],
  ["File releases", "Drop each case file on the beat you want it."],
  ["The reveal", "One button. Thirty-two screens. Same second."],
];

export const S11Host: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, width, inner, vertical } = useLayout();

  const phoneW = pick(240, 300);
  const phoneX = pick(margin, (width - phoneW) / 2);
  const phoneY = pick(380, 520);

  const colLeft = pick(margin + phoneW + 96, margin);
  const colW = pick(width - margin - (margin + phoneW + 96), inner);
  const colTop = pick(400, 1270);
  const cardGap = pick(24, 18);
  const cardCols = 2;
  const cardW = (colW - cardGap * (cardCols - 1)) / cardCols;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" redLamp fadeIn={16} />
      <Chrome
        frame={frame}
        start={12}
        topLeft="Chapter 13"
        topRight="The Host"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="11"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 210),
          width: pick(1500, 936),
        }}
      >
        <div style={{ ...enter(frame, 6, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>Chapter 13 · The host experience</Kicker>
        </div>

        <Headline
          frame={frame}
          start={16}
          size={pick(84, 72)}
          step={7}
          lineHeight={0.9}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "The app is the game master." }],
            [{ t: "The host is the MC.", hot: true }],
          ]}
        />
      </div>

      {/* Screen 09, rising. */}
      <div
        style={{
          position: "absolute",
          left: phoneX,
          top: phoneY,
          ...enter(frame, 40, { y: 64, dur: 36 }),
        }}
      >
        <Phone
          width={phoneW}
          screens={[{ src: "screen-09-host.png", opacity: 1 }]}
          caption="Screen 09 · Host"
        />
      </div>

      {/* The callouts, ticking in beside the console. */}
      <div
        style={{
          position: "absolute",
          left: colLeft,
          top: colTop,
          width: colW,
          display: "flex",
          flexWrap: "wrap",
          gap: cardGap,
        }}
      >
        {CONTROLS.map(([title, body], i) => (
          <Card
            key={title}
            top="none"
            pad={pick(22, 24)}
            style={{
              width: cardW,
              ...enter(frame, stagger(72, i, 12), { y: 24, dur: 26 }),
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <EmDash size={pick(15, 17)} />
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: pick(15, 18),
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: C.bone,
                }}
              >
                {title}
              </span>
            </div>
            <p
              style={{
                fontFamily: F.read,
                fontWeight: 300,
                fontSize: pick(19, 23),
                lineHeight: 1.48,
                color: C.dim,
                paddingLeft: pick(26, 29),
              }}
            >
              {body}
            </p>
          </Card>
        ))}
      </div>

      {vertical ? null : (
        <div
          style={{
            position: "absolute",
            left: colLeft,
            bottom: 148,
            width: colW,
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: 22,
            lineHeight: 1.5,
            color: C.dim2,
            borderTop: `1px solid ${C.line}`,
            paddingTop: 22,
            ...enter(frame, 148, { y: 16, dur: 26 }),
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 14,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.red,
              marginRight: 14,
            }}
          >
            Concealed by design
          </span>
          The console is hidden behind a secret gesture, so the host can operate
          it in plain sight without breaking the fiction.
        </div>
      )}
    </AbsoluteFill>
  );
};
