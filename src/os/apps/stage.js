import { useEffect, useRef } from 'react';
import { useServerNow } from '../../hooks/useKillers';

/**
 * The synced beats of a reveal. Every phone reads the same `revealAt` (server
 * time), so the board, the verdict and the finale land on the same second
 * across the room. `beats` maps a stage name to its offset in seconds.
 */
export function useStage(revealAt, beats) {
  const now = useServerNow(revealAt ? revealAt + (Math.max(...Object.values(beats)) + 1) * 1000 : 0, 100);
  if (!revealAt) return 'full';
  const t = (now - revealAt) / 1000;
  if (t < 0) return 'hold';
  let stage = 'hold';
  for (const [name, at] of Object.entries(beats).sort((a, b) => a[1] - b[1])) if (t >= at) stage = name;
  return stage;
}

/** Run `fx[stage]` when a stage is *reached* while mounted, never for the stage we mounted into. */
export function useStageSounds(stage, fx) {
  const prev = useRef(undefined);
  useEffect(() => {
    if (prev.current === undefined) {
      prev.current = stage;
      return;
    }
    if (prev.current !== stage) {
      prev.current = stage;
      fx[stage]?.();
    }
  });
}

