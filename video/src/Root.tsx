/**
 * Root.tsx — composition registry.
 *
 * `durationInFrames` is DERIVED from the scene manifest (TOTAL_FRAMES) on every
 * composition, so a scene-length edit can never leave the timeline stale.
 *
 * Compositions:
 *   Explainer          1920x1080  the master
 *   Explainer-Vertical 1080x1920  the social cut — a genuine reflow, not a crop
 *   Scenes/*           one per scene, so any beat can be previewed, scrubbed and
 *                      re-rendered on its own. Double-clicking a sequence in the
 *                      master timeline jumps to the matching scene composition.
 */

import React from "react";
import { Composition, Folder } from "remotion";
import { Explainer } from "./Explainer";
import { Promo, PROMO_FRAMES } from "./ad/Promo";
import { Compositions as FootagePromo } from "./ad60/Compositions";
import { Compositions as KillersPromo } from "./adtn/Compositions";
import { SCENES, TOTAL_FRAMES } from "./scenes/manifest";
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

const SCENE_COMPONENTS: Record<string, React.FC> = {
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ hasVO: false }}
      />

      <Composition
        id="Explainer-Vertical"
        component={Explainer}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ hasVO: false }}
      />

      <Folder name="Scenes">
        {SCENES.map((scene) => (
          <Composition
            key={scene.id}
            id={scene.id}
            component={SCENE_COMPONENTS[scene.id]}
            durationInFrames={scene.durationInFrames}
            fps={30}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>

      {/* The 15s Meta ad — see src/ad/. `-SafeZone` is the precheck cut. */}
      <Folder name="Promo">
        <Composition
          id="Promo-15s"
          component={Promo}
          durationInFrames={PROMO_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ safeZone: false, withAudio: true }}
        />
        <Composition
          id="Promo-15s-SafeZone"
          component={Promo}
          durationInFrames={PROMO_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ safeZone: true, withAudio: false }}
        />
      </Folder>

      {/* The footage ad for Meta — an instance of the footage-reel-ad skill (src/ad60/).
          Registers Promo-60s, Promo-60s-SafeZone and Promo-60s-Probe. */}
      <FootagePromo />
      <KillersPromo />

      <Folder name="Scenes-Vertical">
        {SCENES.map((scene) => (
          <Composition
            key={scene.id}
            id={`${scene.id}-V`}
            component={SCENE_COMPONENTS[scene.id]}
            durationInFrames={scene.durationInFrames}
            fps={30}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
    </>
  );
};
