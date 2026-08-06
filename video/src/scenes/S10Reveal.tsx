/**
 * SCENE 10 — THE REVEAL (210 frames / 7s)
 *
 * Fifty screen rectangles. A red wave sweeps across them in a diagonal
 * stagger — and then, on ONE frame, every screen in the venue turns at the same
 * instant. The staggered wave exists only to make the simultaneous flip land:
 * you have to see the room turn unevenly first for "same second" to mean
 * anything.
 *
 * Ends on a hard cut to black. No fade — the film's only true blackout.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Atmosphere } from "../components/Atmosphere";
import { Headline } from "../components/Headline";
import { Kicker } from "../components/Kicker";
import { PHONE_ASPECT } from "../components/Phone";
import { C, F } from "../theme";
import { enter, linear, ramp } from "../anim";
import { useLayout } from "../layout";

/** The one frame on which all 50 screens turn together. */
const SYNC_FRAME = 132;
/** The red field floods the whole frame just after the sync. */
const FLOOD_AT = 140;
/** Hard cut to black. */
const BLACK_AT = 202;

export const S10Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { margin, pick, inner, width } = useLayout();

  // 10 x 5 = the 50 devices in the room, in both cuts.
  // The master is HEIGHT-constrained (a width-derived tile would be 425px tall
  // and four rows would not fit in 1080), the social cut is width-constrained.
  const cols = 10;
  const rows = 5;
  const gap = pick(24, 14);
  const tileH = pick(108, (inner - gap * (cols - 1)) / cols / PHONE_ASPECT);
  const tileW = tileH * PHONE_ASPECT;
  const gridW = cols * tileW + (cols - 1) * gap;
  const gridLeft = pick(width - margin - gridW, margin);
  const gridTop = pick(300, 700);

  const flood = linear(frame, FLOOD_AT, 9);
  const blacked = frame >= BLACK_AT;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Atmosphere frame={frame} lamp="none" />

      <div
        style={{
          position: "absolute",
          left: margin,
          top: pick(168, 214),
          width: pick(900, inner),
        }}
      >
        <div style={{ ...enter(frame, 2, { y: 14, dur: 18 }) }}>
          <Kicker size={pick(17, 20)}>Round 06 · The reveal</Kicker>
        </div>

        <Headline
          frame={frame}
          start={10}
          size={pick(80, 68)}
          step={6}
          lineHeight={0.92}
          style={{ marginTop: pick(18, 22) }}
          lines={[
            [{ t: "One host. One button." }],
            [{ t: "Fifty screens.", hot: true }],
          ]}
        />

        <p
          style={{
            marginTop: pick(40, 44),
            width: pick(760, inner),
            fontFamily: F.read,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: pick(30, 32),
            lineHeight: 1.45,
            color: C.dim,
            ...enter(frame, 54, { y: 22, dur: 28 }),
          }}
        >
          Every screen in the venue turns at the same instant.
        </p>

        <div
          style={{
            marginTop: pick(34, 38),
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: pick(17, 19),
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: C.dim2,
            ...enter(frame, 88, { y: 14, dur: 24 }),
          }}
        >
          Host action · show results, then fire the reveal
        </div>
      </div>

      {/* The venue, as 50 rectangles. */}
      <div style={{ position: "absolute", left: gridLeft, top: gridTop }}>
        {Array.from({ length: cols * rows }, (_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          // Diagonal order, so the wave reads as a sweep and not a raster scan.
          const order = col + row * 1.6;
          const waveAt = 46 + order * 4.2;

          const appear = ramp(frame, 30 + i * 1.4, 18);
          // The wave is a PULSE, not a step: it lights a screen and then decays
          // back to dark. If it latched on, the grid would already be red by the
          // time the sync frame arrives and the simultaneous flip would land on
          // nothing. The decay leaves a few dark frames before the turn.
          const wave =
            ramp(frame, waveAt, 9) * (1 - ramp(frame, waveAt + 11, 18));
          const sync = frame >= SYNC_FRAME ? 1 : 0;
          const hot = Math.max(wave * 0.8, sync);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * (tileW + gap),
                top: row * (tileH + gap),
                width: tileW,
                height: tileH,
                borderRadius: Math.max(6, tileW * 0.11),
                background: sync ? C.red : C.ink3,
                border: `1px solid ${hot > 0.5 ? C.red : C.line}`,
                boxShadow:
                  hot > 0.5
                    ? `0 0 ${(18 + 26 * hot).toFixed(0)}px rgba(224,49,39,.55)`
                    : "0 8px 22px rgba(0,0,0,.5)",
                opacity: appear,
                scale: `${(0.9 + 0.1 * appear).toFixed(3)}`,
                overflow: "hidden",
              }}
            >
              {/* A faint hint of screen content, washed out by the wave. */}
              <div
                style={{
                  position: "absolute",
                  inset: "16% 14%",
                  background: C.bone,
                  opacity: 0.1 * (1 - hot),
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: C.red,
                  opacity: wave * 0.5 * (1 - sync),
                }}
              />
            </div>
          );
        })}
      </div>

      {/* The flood. A fast vertical wipe from the centre, not a crossfade. */}
      <AbsoluteFill
        style={{
          background: C.red,
          transformOrigin: "center center",
          scale: `1 ${flood.toFixed(4)}`,
        }}
      />

      {flood > 0.6 ? (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: margin,
          }}
        >
          <div
            style={{
              fontFamily: F.disp,
              fontWeight: 800,
              fontSize: pick(150, 118),
              lineHeight: 0.86,
              letterSpacing: "-0.012em",
              textTransform: "uppercase",
              color: C.bone,
              textAlign: "center",
              ...enter(frame, FLOOD_AT + 8, { y: 26, dur: 22 }),
            }}
          >
            Same
            <br />
            second.
          </div>
          <div
            style={{
              marginTop: pick(38, 44),
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: pick(19, 21),
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.bone,
              // The entrance opacity is MULTIPLIED by the resting 0.72, not
              // replaced by it — spreading enter() after `opacity` would
              // silently discard the resting value.
              ...(() => {
                const e = enter(frame, FLOOD_AT + 22, { y: 16, dur: 22 });
                return { ...e, opacity: e.opacity * 0.72 };
              })(),
            }}
          >
            Every screen in the venue
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Hard cut. */}
      {blacked ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
