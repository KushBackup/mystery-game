/**
 * scenes.tsx — the reel's layers, bottom to top:
 *
 *   ShotTrack     the footage, one <Sequence> per shot, hard cuts at real speed
 *   SignOff       the Astral Project × Greenr lockup on the plate
 *   Flashes       a soft bone hit on the drop, on NOBODY and on the sign-off
 *   Captions      the text beats, each word popping on its frame
 *   Film          grain, vignette, the thin bands under the platform UI
 *
 * A feel-good brand reel: no drawn explainer graphics, no chip, no button. The
 * footage and the room's own sound carry it; the captions are the story.
 * Every frame comes from ./timeline.ts.
 *
 * Layout law (Meta Reels, 2026): words live inside x 72–1008, y 270–1240.
 */

import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSET_DIR, C } from "./theme";
import { Captions, Film, Flash, INNER, SANS, Shot, Photo, X } from "./kit";
import { EVENT } from "./content";
import { CAPTIONS, CUE, LAYOUT, SHOTS } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A rise-and-settle: critically damped, no wobble. */
const rise = (frame: number, at: number, fps: number, y = 60) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 16 });
  return { opacity: interpolate(s, [0, 0.4], [0, 1], clamp), translate: `0px ${((1 - s) * y).toFixed(2)}px` };
};

// ================================================================== footage ===

const ShotTrack: React.FC = () => (
  <>
    {SHOTS.map((shot) => (
      <Sequence key={shot.key} name={shot.key} from={shot.from} durationInFrames={shot.dur} layout="absolute-fill">
        <ShotMedia shot={shot} />
      </Sequence>
    ))}
  </>
);

const ShotMedia: React.FC<{ shot: (typeof SHOTS)[number] }> = ({ shot }) => {
  const f = useCurrentFrame();
  const Media = shot.kind === "clip" ? Shot : Photo;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Media frame={f} src={shot.src} dur={shot.dur} grade={shot.grade ?? "warm"} origin={shot.origin} push={shot.push} zoom={shot.zoom} />
      {shot.section ? <Flash frame={f} at={0} color={C.bone} peak={0.28} tau={3} /> : null}
    </AbsoluteFill>
  );
};

// ================================================================ sign-off ===

/** The Astral mark's slate "ASTRAL" was built for a mid-tone ground: a thin light edge keeps it legible on ink. */
const LOGO_EDGE = "drop-shadow(0 0 1.5px rgba(237,231,218,.95)) drop-shadow(0 0 1px rgba(237,231,218,.8)) drop-shadow(0 0 14px rgba(237,231,218,.25))";

/** SIGN-OFF — the two logos rise in on the plate. No date, no button: this reel sells nothing. */
const SignOff: React.FC<{ f: number; fps: number }> = ({ f, fps }) => {
  const E = CUE.signoff;
  if (f < E.logos || f >= E.to) return null;
  const a = rise(f, E.logos + 2, fps);
  const b = rise(f, E.logos + 7, fps);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        width: INNER,
        top: LAYOUT.logos.top,
        height: LAYOUT.logos.bottom - LAYOUT.logos.top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
        color: C.bone,
      }}
    >
      <div style={{ ...a, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", textTransform: "uppercase", color: C.dim }}>{EVENT.withLine}</div>
      <div style={{ ...b, marginTop: 30, display: "flex", justifyContent: "center", alignItems: "center", gap: 44 }}>
        <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoA}`)} style={{ height: 80, filter: LOGO_EDGE }} />
        <span style={{ fontWeight: 800, fontSize: 56, color: C.dim }}>×</span>
        <Img src={staticFile(`${ASSET_DIR}/${EVENT.logoB}`)} style={{ height: 186 }} />
      </div>
    </div>
  );
};

// ================================================================== layers ===

export const Layers: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <ShotTrack />
      {/* The plate under the logos sits darker than its own grade. */}
      {f >= CUE.signoff.logos ? <AbsoluteFill style={{ background: "rgba(12,13,15,.25)" }} /> : null}
      <SignOff f={f} fps={fps} />
      {f >= CUE.nobody && f < CUE.nobody + 14 ? <Flash frame={f} at={CUE.nobody} color={C.red} peak={0.35} tau={5} /> : null}
      {f >= CUE.signoff.logos && f < CUE.signoff.logos + 12 ? <Flash frame={f} at={CUE.signoff.logos} color={C.bone} peak={0.18} tau={3} /> : null}
      <Captions frame={f} caps={CAPTIONS} fps={fps} />
      <Film frame={f} />
    </AbsoluteFill>
  );
};
