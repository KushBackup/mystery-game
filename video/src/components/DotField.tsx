/**
 * DotField — the 32 players as dots.
 *
 * Scenes 2 and 3 both draw this. Scene 2 shows them cold and unlit in five
 * closed cliques; scene 3 lights each one and gives it a red fragment to hold.
 * Positions are computed by the scene (see ../dots.ts) and passed in as pixels,
 * so this component stays a dumb renderer.
 */

import React from "react";
import { C } from "../theme";

export type DotState = {
  x: number;
  y: number;
  opacity: number;
  /** 0 = cold and anonymous, 1 = lit and holding a fragment. */
  lit: number;
  size: number;
};

export const DotField: React.FC<{ dots: DotState[] }> = ({ dots }) => (
  <>
    {dots.map((d, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: d.x - d.size / 2,
          top: d.y - d.size / 2,
          width: d.size,
          height: d.size,
          opacity: d.opacity,
        }}
      >
        {/* The faint red halo a lit player carries. */}
        {d.lit > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: -d.size * 0.9,
              top: -d.size * 0.9,
              width: d.size * 2.8,
              height: d.size * 2.8,
              borderRadius: "50%",
              border: `1px solid ${C.red}`,
              opacity: d.lit * 0.55,
              scale: `${(0.6 + 0.4 * d.lit).toFixed(3)}`,
            }}
          />
        ) : null}

        {/* The player. Cold = aged bone, clearly present but inert.
            Lit = full bone. The cold state has to be legible at a glance or the
            five cliques in scene 2 read as scattered noise instead of groups. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: d.lit > 0.5 ? C.bone : C.bone2,
            opacity: 0.62 + 0.38 * d.lit,
          }}
        />

        {/* The one fragment of the story this player holds. */}
        {d.lit > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: d.size * 0.82,
              top: -d.size * 0.42,
              width: d.size * 0.52,
              height: d.size * 0.52,
              background: C.red,
              opacity: d.lit,
              scale: `${d.lit.toFixed(3)}`,
            }}
          />
        ) : null}
      </div>
    ))}
  </>
);
