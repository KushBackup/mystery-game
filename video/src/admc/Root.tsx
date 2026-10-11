import React from "react";
import { Composition } from "remotion";
import { REEL } from "./config";
import { Sample } from "./Sample";
import { TOTAL } from "./timeline";

export const Root: React.FC = () => (
  <Composition id={REEL.id} component={Sample} durationInFrames={TOTAL} fps={REEL.fps} width={REEL.width} height={REEL.height} defaultProps={{ withAudio: true }} />
);
