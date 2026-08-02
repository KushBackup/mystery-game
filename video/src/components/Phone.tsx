/**
 * Phone — a CSS phone frame wrapping a real screenshot of the running app.
 *
 * GEOMETRY IS NON-NEGOTIABLE. Every screenshot in public/ is 780x1688
 * (390x844 @2x), aspect 0.4621. The screen cavity is derived from the frame
 * width using that exact ratio, so the image is never stretched, squashed or
 * cropped. Change the ratio only if the source captures change.
 *
 * Frame spec (from the deck's `.phone`): 30px outer radius, 8px bezel in
 * #1C1E22, 1px rgba(237,231,218,.22) border, 0 30px 70px rgba(0,0,0,.7) shadow.
 *
 * `screens` is a bottom-to-top stack of layers with caller-computed opacities,
 * which is how scenes crossfade one screenshot into the next while keeping the
 * component a pure function of the frame.
 */

import React from "react";
import { Img, staticFile } from "remotion";
import { C, F } from "../theme";

/** 780 / 1688 — the native aspect of every capture in public/. */
export const PHONE_ASPECT = 780 / 1688;

export const BEZEL = 8;

export type ScreenLayer = { src: string; opacity: number };

/** Outer height of a phone frame for a given outer width. */
export const phoneHeight = (width: number): number =>
  (width - BEZEL * 2) / PHONE_ASPECT + BEZEL * 2;

export const Phone: React.FC<{
  screens: ScreenLayer[];
  width: number;
  caption?: string;
  note?: React.ReactNode;
  captionOpacity?: number;
  style?: React.CSSProperties;
  notch?: boolean;
  /** Scales the whole frame including its caption. */
  scaleWith?: number;
}> = ({
  screens,
  width,
  caption,
  note,
  captionOpacity = 1,
  style,
  notch = true,
  scaleWith = 1,
}) => {
  const screenW = width - BEZEL * 2;
  const screenH = screenW / PHONE_ASPECT;
  const k = width / 262; // the deck authored this frame at 262px wide

  return (
    <div style={{ width, position: "relative", ...style }}>
      <div
        style={{
          width,
          height: screenH + BEZEL * 2,
          borderRadius: 30 * Math.max(1, k * 0.6),
          background: C.ink3,
          border: "1px solid rgba(237,231,218,.22)",
          padding: BEZEL,
          boxShadow: "0 30px 70px rgba(0,0,0,.7)",
          boxSizing: "content-box",
          position: "relative",
        }}
      >
        <div
          style={{
            width: screenW,
            height: screenH,
            borderRadius: 23 * Math.max(1, k * 0.6),
            overflow: "hidden",
            position: "relative",
            // Backing behind the screenshot. Fully covered at every frame; it
            // exists only to catch sub-pixel rounding at the corners.
            background: C.ink,
          }}
        >
          {screens.map((s, i) => (
            <Img
              key={s.src + i}
              src={staticFile(s.src)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                // The cavity already matches the source aspect exactly, so
                // `cover` crops nothing. It only guards sub-pixel rounding.
                objectFit: "cover",
                objectPosition: "top center",
                display: "block",
                opacity: s.opacity,
              }}
            />
          ))}
        </div>

        {notch ? (
          <div
            style={{
              position: "absolute",
              top: 15 * k,
              left: "50%",
              translate: "-50% 0",
              width: 66 * k,
              height: 6 * k,
              borderRadius: 6 * k,
              background: "#000",
              zIndex: 3,
            }}
          />
        ) : null}
      </div>

      {caption ? (
        <div
          style={{
            marginTop: 16 * scaleWith,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 14 * scaleWith,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.red,
            opacity: captionOpacity,
          }}
        >
          {caption}
        </div>
      ) : null}

      {note ? (
        <div
          style={{
            marginTop: 8 * scaleWith,
            fontFamily: F.read,
            fontWeight: 300,
            fontSize: 18 * scaleWith,
            lineHeight: 1.42,
            color: C.dim,
            opacity: captionOpacity,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
