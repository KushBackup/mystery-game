/**
 * Compositions.tsx — registers this reel with the studio. In src/Root.tsx:
 *
 *   import { Compositions as MyReel } from "./<instance>/Compositions";
 *   ...
 *   <MyReel />
 *
 * Three compositions, all named from config.ts:
 *   <id>            the ad (with audio)
 *   <id>-SafeZone   precheck: safe zone + keep-clear bands + caption boxes, no audio
 *   <id>-Probe      one frame of one clip on a labelled grid (scripts/reel/probe.mjs)
 */

import React from "react";
import { Composition, Folder } from "remotion";
import { REEL } from "./config";
import { Reel } from "./Reel";
import { Probe } from "./Probe";
import { LAYERS, TOTAL } from "./timeline";

export const Compositions: React.FC = () => (
  <Folder name={`${REEL.id}-reel`}>
    <Composition
      id={REEL.id}
      component={Reel}
      durationInFrames={TOTAL}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
      defaultProps={{ safeZone: false, withAudio: true }}
    />
    <Composition
      id={`${REEL.id}-SafeZone`}
      component={Reel}
      durationInFrames={TOTAL}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
      defaultProps={{ safeZone: true, withAudio: false }}
    />
    <Composition
      id={`${REEL.id}-Probe`}
      component={Probe}
      durationInFrames={1}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
      defaultProps={{ src: LAYERS[0].src, pane: LAYERS[0].pane, frame: 0 }}
    />
  </Folder>
);
