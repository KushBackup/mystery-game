/**
 * fx.ts — small motion helpers and the drawn phone, shared by kit and scenes.
 * Every value is a pure function of the frame: no timers, no Math.random().
 */

import React from "react";
import { Easing, interpolate, random } from "remotion";
import { C } from "./theme";

export const W = 1080;
export const H = 1920;
/** Meta Reels safe zone (2026): words live inside this box. Top ~14% and bottom ~35% sit under platform UI. */
export const SAFE = { left: 72, right: 1008, top: 270, bottom: 1240 } as const;

/** The house ease — every entrance uses it. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 on the house ease between two absolute frames. */
export const prog = (frame: number, from: number, dur: number, easing = EASE) =>
  interpolate(frame, [from, from + dur], [0, 1], { ...clamp, easing });

/** A decaying impact: 1 at `hit`, falling off exponentially. 0 before it. */
export const impact = (frame: number, hit: number, tau = 4) => (frame < hit ? 0 : Math.exp(-(frame - hit) / tau));

/** Glitch — a few-frame chromatic split on a hit. Fringes are accent + bone, never cyan/magenta. */
export const glitch = (frame: number, at: number, len = 5): React.CSSProperties => {
  if (frame < at || frame >= at + len) return {};
  const j = random(`gl-${frame}`) - 0.5;
  return {
    translate: `${(j * 18).toFixed(1)}px 0px`,
    textShadow: `${(-10 * (1 + j)).toFixed(1)}px 0 ${C.red}, ${(8 * (1 - j)).toFixed(1)}px 0 rgba(237,231,218,.55)`,
  };
};

/** Phone — a drawn handset (never a screenshot), so its screen can say anything the script needs. */
export const Phone: React.FC<{ children: React.ReactNode; width: number; style?: React.CSSProperties }> = ({ children, width, style }) => {
  const k = width / 520;
  const height = width * 2.16;
  return React.createElement(
    "div",
    {
      style: {
        position: "absolute",
        width,
        height,
        borderRadius: 72 * k,
        background: C.ink3,
        padding: 14 * k,
        boxShadow: `0 ${60 * k}px ${120 * k}px rgba(0,0,0,.7), inset 0 0 0 ${2 * k}px rgba(237,231,218,.10)`,
        ...style,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 60 * k,
          background: C.ink,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(237,231,218,.06)",
        },
      },
      React.createElement("div", {
        style: {
          position: "absolute",
          top: 16 * k,
          left: "50%",
          translate: "-50% 0",
          width: 150 * k,
          height: 40 * k,
          borderRadius: 20 * k,
          background: "#000",
          zIndex: 3,
        },
      }),
      children,
    ),
  );
};
