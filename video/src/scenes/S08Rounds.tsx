/**
 * SCENE 08 — SEVEN ROUNDS (330 frames / 11s)
 *
 * A red rail fills left to right (a vertical rail in the social cut). As it
 * reaches each stop the dot pops and the padlock flips open — the visual claim
 * being that information becomes legal to reveal on the host's cue, never
 * before.
 *
 * Beat names and unlock summaries are the deck's round table, verbatim.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Chrome } from "../components/Chrome";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { C, F } from "../theme";
import { EASE, enter, linear, ramp } from "../anim";
import { useLayout } from "../layout";

const ROUNDS: { n: string; beat: string; unlocks: string; guests: string }[] = [
  {
    n: "0",
    beat: "The Incident",
    unlocks: "Incident report; all profiles",
    guests: "Reading, mingling, sizing people up",
  },
  {
    n: "1",
    beat: "Accusations",
    unlocks: "One accusation per player",
    guests: "First public naming of a suspect",
  },
  {
    n: "2",
    beat: "Motives",
    unlocks: "Ten motive codes on cards",
    guests: "Trading begins in earnest",
  },
  {
    n: "3",
    beat: "Evidence",
    unlocks: "Forensics, documents, footage",
    guests: "Theories harden; factions form",
  },
  {
    n: "4",
    beat: "Revelations",
    unlocks: "Records that reframe motive",
    guests: "The leading theory starts to crack",
  },
  {
    n: "5",
    beat: "Bombshells",
    unlocks: "Final revelation codes",
    guests: "Panic, re-lobbying, vote switching",
  },
  {
    n: "6",
    beat: "The Reveal",
    unlocks: "Final tally; confession opens",
    guests: "The room commits, then finds out",
  },
];

const RAIL_START = 40;
const RAIL_DUR = 208;

/** Arrival frame of the rail head at stop `i`. */
const arriveAt = (i: number) => RAIL_START + (i / (ROUNDS.length - 1)) * RAIL_DUR;

/**
 * A padlock that flips open. The shackle rotates about its right foot and the
 * stroke snaps from dim to red at the halfway point, so the change reads as an
 * event rather than a crossfade.
 */
const Padlock: React.FC<{ open: number; size: number }> = ({ open, size }) => {
  const a = -34 * open;
  const stroke = open > 0.5 ? C.red : C.dim2;
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 20 26"
      style={{ display: "block", overflow: "visible" }}
    >
      <g transform={`rotate(${a.toFixed(2)} 15 12)`}>
        <path
          d="M5 12 V7.5 A5 5 0 0 1 15 7.5 V12"
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
      <rect
        x={1}
        y={12}
        width={18}
        height={13}
        rx={2}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
      />
    </svg>
  );
};

export const S08Rounds: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, inner, vertical } = useLayout();

  const railFill = interpolate(frame, [RAIL_START, RAIL_START + RAIL_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const gap = pick(20, 0);
  const colW = vertical ? inner : (inner - gap * (ROUNDS.length - 1)) / ROUNDS.length;
  const railY = 520;
  /** Social cut: seven compact rows down a vertical rail. */
  const rowStep = 132;
  const rowTop = 700;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="tl" />
      <Chrome
        frame={frame}
        topLeft="Chapter 11"
        topRight="Game Mechanics"
        bottomLeft="Astral Project · Murder Mystery"
        bottomRight="08"
      />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(176, 212),
          width: pick(1400, 936),
        }}
      >
        <div style={{ ...enter(frame, 4, { y: 14, dur: 20 }) }}>
          <Kicker size={pick(17, 20)}>Chapter 11 · Game mechanics</Kicker>
        </div>

        <Headline
          frame={frame}
          start={14}
          size={pick(92, 78)}
          step={7}
          lineHeight={0.9}
          style={{ marginTop: pick(20, 24) }}
          lines={[
            [{ t: "Seven rounds," }],
            [{ t: "one release valve at a time", hot: true }],
          ]}
        />
      </div>

      {/* THE RAIL. Horizontal in the master, vertical in the social cut. */}
      {vertical ? (
        <div
          style={{
            position: "absolute",
            left: margin + 9,
            top: rowTop - 22,
            width: 2,
            height: (ROUNDS.length - 1) * rowStep + 44,
            background: C.red,
            opacity: 0.6,
            transformOrigin: "top center",
            scale: `1 ${railFill.toFixed(4)}`,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            left: margin,
            top: railY,
            width: inner,
            height: 2,
            background: C.red,
            opacity: 0.6,
            transformOrigin: "left center",
            scale: `${railFill.toFixed(4)} 1`,
          }}
        />
      )}

      {ROUNDS.map((r, i) => {
        const at = arriveAt(i);
        const dot = ramp(frame, at, 12);
        const open = linear(frame, at + 5, 10);
        const body = enter(frame, at + 4, { y: 16, dur: 22 });
        const last = i === ROUNDS.length - 1;

        return (
          <div key={r.n}>
            {/* The stop marker, sitting on the rail. */}
            <div
              style={{
                position: "absolute",
                left: vertical ? margin + 10 - 8 : margin + i * (colW + gap) - 8,
                top: vertical ? rowTop + i * rowStep - 8 : railY + 1 - 8,
                width: 16,
                height: 16,
                borderRadius: "50%",
                // All stops are red. The deck marks its "now" stop in amber, but
                // amber is numerals only here — the final beat is already
                // distinguished by its red beat name below.
                background: C.red,
                boxShadow: `0 0 0 5px ${C.ink}`,
                opacity: dot,
                scale: `${(0.3 + 0.7 * dot).toFixed(3)}`,
              }}
            />

            {/* The stop's content.
                MASTER: a tall column under the rail — numeral, beat, rule,
                what unlocks, and what the guests do.
                SOCIAL: a compact two-line row beside the rail. Seven columns'
                worth of stacked copy does not fit in 1060px of usable height, so
                the numeral, padlock and beat share one line and the behaviour
                line is dropped rather than overlapped. */}
            {vertical ? (
              <div
                style={{
                  position: "absolute",
                  left: margin + 52,
                  top: rowTop + i * rowStep - 34,
                  width: inner - 52,
                  ...body,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 18 }}
                >
                  <span
                    style={{
                      fontFamily: F.disp,
                      fontWeight: 700,
                      fontSize: 62,
                      lineHeight: 0.86,
                      color: C.amber,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.n}
                  </span>
                  <Padlock open={open} size={25} />
                  <span
                    style={{
                      fontFamily: F.disp,
                      fontWeight: 700,
                      fontSize: 44,
                      lineHeight: 1,
                      textTransform: "uppercase",
                      color: last ? C.red : C.bone,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {r.beat}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: F.read,
                    fontWeight: 300,
                    fontSize: 25,
                    lineHeight: 1.4,
                    color: C.dim,
                    marginTop: 4,
                  }}
                >
                  {r.unlocks}
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: margin + i * (colW + gap),
                  top: railY + 34,
                  width: colW,
                  ...body,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      fontFamily: F.disp,
                      fontWeight: 700,
                      fontSize: 62,
                      lineHeight: 0.86,
                      color: C.amber,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.n}
                  </span>
                  <Padlock open={open} size={25} />
                </div>

                <div
                  style={{
                    fontFamily: F.disp,
                    fontWeight: 700,
                    fontSize: 34,
                    lineHeight: 1.04,
                    textTransform: "uppercase",
                    color: last ? C.red : C.bone,
                    marginTop: 12,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {r.beat}
                </div>

                <div
                  style={{
                    width: colW - 18,
                    height: 1,
                    background: C.line,
                    margin: "14px 0",
                  }}
                />

                <div
                  style={{
                    fontFamily: F.read,
                    fontWeight: 300,
                    fontSize: 19,
                    lineHeight: 1.42,
                    color: C.dim,
                    paddingRight: 18,
                    // Reserve two lines so the italic behaviour line below sits
                    // on the same baseline in every column, whether the unlock
                    // text wraps or not.
                    minHeight: 19 * 1.42 * 2,
                  }}
                >
                  {r.unlocks}
                </div>

                <div
                  style={{
                    fontFamily: F.read,
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.42,
                    color: C.dim2,
                    marginTop: 10,
                    paddingRight: 18,
                  }}
                >
                  {r.guests}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: margin,
          bottom: pick(146, 160),
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: pick(17, 19),
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.dim2,
          ...enter(frame, 262, { y: 14, dur: 24 }),
        }}
      >
        Host-gated · a valid code entered too early is rejected
      </div>
    </AbsoluteFill>
  );
};
