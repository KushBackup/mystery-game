/**
 * Promo.tsx — the 15s portrait ad for Meta (Reels / Stories / Feed 9:16).
 *
 * 1080x1920, 30fps, 450 frames. Eight shots joined with hard cuts on the beat;
 * each shot is a <Sequence> placed from ./timeline.ts, so the studio timeline,
 * the picture and the synthesized soundtrack all read the same numbers.
 *
 * Built to work with the sound OFF (Meta autoplays muted): every beat carries
 * its meaning in on-screen type. The audio is the second layer, not the first.
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { C } from "../theme";
import { SCENE, TOTAL } from "./timeline";
import { Board, End, Hook, Identity, Riddle, Trade, Twist, Vote } from "./scenes";
import { SafeZoneContext } from "./safeZone";

export const PROMO_FRAMES = TOTAL;

const SHOTS: [keyof typeof SCENE, React.FC][] = [
  ["hook", Hook],
  ["identity", Identity],
  ["riddle", Riddle],
  ["trade", Trade],
  ["board", Board],
  ["vote", Vote],
  ["twist", Twist],
  ["end", End],
];

export type PromoProps = { safeZone: boolean; withAudio: boolean };

export const Promo: React.FC<PromoProps> = ({ safeZone, withAudio }) => (
  <SafeZoneContext.Provider value={safeZone}>
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {SHOTS.map(([key, Shot]) => (
        <Sequence key={key} name={key} from={SCENE[key][0]} durationInFrames={SCENE[key][1] - SCENE[key][0]}>
          <Shot />
        </Sequence>
      ))}
      {withAudio ? <Audio src={staticFile("ad/promo-audio.wav")} /> : null}
    </AbsoluteFill>
  </SafeZoneContext.Provider>
);
