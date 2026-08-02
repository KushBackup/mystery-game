/**
 * Explainer.tsx — the film.
 *
 * A <Series> of fourteen scenes. Series is used rather than a hand-rolled chain
 * of <Sequence from=...> so the durations compose and it is impossible to leave
 * a gap or an overlap between scenes.
 *
 * TRANSITIONS: hard cuts, by design. @remotion/transitions is deliberately not
 * used to join scenes — a TransitionSeries overlaps its neighbours, which would
 * shorten the film below the sum of SCENES and break the invariant that the
 * composition length is derived from the manifest. The two red thread-wipes the
 * film does use live INSIDE scenes 3 and 10 as diegetic devices.
 *
 * VOICEOVER: optional. `hasVO` gates an <Audio> track so the film renders
 * correctly with or without public/vo.mp3 present. The film is built to work
 * silent — assume it autoplays muted on a laptop.
 */

import React from "react";
import { Audio, Series, staticFile } from "remotion";
import { SCENES } from "./scenes/manifest";
import { S01Cold } from "./scenes/S01Cold";
import { S02Problem } from "./scenes/S02Problem";
import { S03Mechanism } from "./scenes/S03Mechanism";
import { S04What } from "./scenes/S04What";
import { S05Identity } from "./scenes/S05Identity";
import { S06Loop } from "./scenes/S06Loop";
import { S07Codes } from "./scenes/S07Codes";
import { S08Rounds } from "./scenes/S08Rounds";
import { S09Verdict } from "./scenes/S09Verdict";
import { S10Reveal } from "./scenes/S10Reveal";
import { S11Host } from "./scenes/S11Host";
import { S12Why } from "./scenes/S12Why";
import { S13Platform } from "./scenes/S13Platform";
import { S14Close } from "./scenes/S14Close";

const COMPONENTS: Record<string, React.FC> = {
  S01Cold,
  S02Problem,
  S03Mechanism,
  S04What,
  S05Identity,
  S06Loop,
  S07Codes,
  S08Rounds,
  S09Verdict,
  S10Reveal,
  S11Host,
  S12Why,
  S13Platform,
  S14Close,
};

export type ExplainerProps = {
  /**
   * Set true once public/vo.mp3 exists. Left false so a clean checkout renders
   * without a missing-asset failure.
   */
  hasVO: boolean;
};

export const Explainer: React.FC<ExplainerProps> = ({ hasVO }) => (
  <>
    {hasVO ? <Audio src={staticFile("vo.mp3")} /> : null}

    <Series>
      {SCENES.map((scene) => {
        const Component = COMPONENTS[scene.id];
        return (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
            name={`${scene.id} — ${scene.title}`}
          >
            <Component />
          </Series.Sequence>
        );
      })}
    </Series>
  </>
);
