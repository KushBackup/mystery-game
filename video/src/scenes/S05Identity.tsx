/**
 * SCENE 05 — YOU BECOME SOMEONE (300 frames / 10s)
 *
 * The onboarding compression, in the deck's own words: scan -> code -> you are
 * someone else. One phone frame; the screenshot inside it crossfades 01 (join)
 * to 02 (the board) to 03 (identity), and the camera pushes in a few percent as
 * the identity brief lands.
 *
 * The redaction bar over the SECRET field is the deck's `.rd` device: it holds
 * shut, then wipes open from the left.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker, EmDash } from "../components/Kicker";
import { Phone } from "../components/Phone";
import { Redaction } from "../components/Redaction";
import { C, F } from "../theme";
import { enter, ramp, stagger } from "../anim";
import { useLayout } from "../layout";

const CAPTIONS: [string, number][] = [
  ["Screen 01 · Join", 70],
  ["Screen 02 · The Board", 130],
  ["Screen 03 · Identity", 190],
];

const PAYOFF = [
  "No registration desk and no laptop bottleneck at the door",
  "Late arrivals self-onboard without pausing the game",
  "The rules live in the app, so the host never runs a briefing",
];

export const S05Identity: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, width, vertical } = useLayout();

  const phoneW = pick(330, 340);
  const phoneX = pick(width - margin - phoneW - 90, (width - phoneW) / 2);
  const phoneY = pick(214, 850);

  // The push-in: the frame creeps toward the identity brief as it resolves.
  const push = 1 + 0.055 * ramp(frame, 186, 74);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" />
      <Chrome
        frame={frame}
        topLeft="Chapter 08"
        topRight="Onboarding & Identity"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="05"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 210),
          width: pick(880, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>
            Chapter 08 · Inside the mobile application
          </Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(86, 74)}
          step={7}
          lineHeight={0.92}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "Scan → code →" }],
            [{ t: "you are someone else", hot: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(30, 34),
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: pick(25, 30),
            lineHeight: 1.55,
            color: C.dim,
            maxWidth: pick(700, 936),
            ...enter(frame, 46, { y: 22, dur: 28 }),
          }}
        >
          The first four minutes decide whether a guest plays or watches. No
          account, no tutorial, and no host explaining rules to thirty-two
          people at once.
        </p>

        {/* The private brief, with the one field the app never shows anyone else. */}
        <div
          style={{
            marginTop: pick(38, 44),
            maxWidth: pick(700, 936),
            background: C.bone,
            padding: pick("26px 28px 24px", "30px 32px 28px"),
            boxShadow: "0 24px 54px rgba(0,0,0,.5)",
            ...enter(frame, 196, { y: 24, dur: 28, scaleFrom: 0.97 }),
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: pick(14, 17),
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.redDeep,
              paddingBottom: 12,
              marginBottom: 16,
              borderBottom: `2px solid ${C.ink}`,
            }}
          >
            Character brief · Secret
          </div>
          <Redaction frame={frame} openAt={228} dur={27}>
            <span
              style={{
                fontFamily: F.read,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: pick(28, 32),
                lineHeight: 1.35,
                color: C.ink,
              }}
            >
              The thing they will lie to protect.
            </span>
          </Redaction>
        </div>

        {/* Operational payoff — deck chapter 08, verbatim.
            Dropped from the vertical cut, where the phone needs the height. */}
        {vertical ? null : (
          <div style={{ marginTop: 34 }}>
            {PAYOFF.map((line, i) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "baseline",
                  marginBottom: 10,
                  ...enter(frame, stagger(96, i, 9), { y: 16, dur: 22 }),
                }}
              >
                <EmDash size={16} />
                <span
                  style={{
                    fontFamily: F.read,
                    fontWeight: 300,
                    fontSize: 21,
                    lineHeight: 1.45,
                    color: C.dim2,
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The phone. Screens stack bottom-to-top and crossfade in sequence. */}
      <div
        style={{
          position: "absolute",
          left: phoneX,
          top: phoneY,
          transformOrigin: "center center",
          scale: `${push.toFixed(4)}`,
          ...enter(frame, 62, { y: 0, x: 70, dur: 34 }),
        }}
      >
        <Phone
          width={phoneW}
          screens={[
            { src: "screen-01-login.png", opacity: 1 },
            { src: "screen-02-grid.png", opacity: ramp(frame, 128, 30) },
            { src: "screen-03-identity.png", opacity: ramp(frame, 188, 30) },
          ]}
        />

        {/* Captions crossfade with the screens rather than popping. */}
        <div style={{ position: "relative", height: pick(30, 36), marginTop: 18 }}>
          {CAPTIONS.map(([label, at], i) => (
            <div
              key={label}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: pick(15, 18),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.red,
                opacity:
                  ramp(frame, at, 20) *
                  (i < CAPTIONS.length - 1
                    ? 1 - ramp(frame, CAPTIONS[i + 1][1], 20)
                    : 1),
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
