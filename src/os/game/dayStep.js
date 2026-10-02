import { useServerNow } from '../../hooks/useKillers';
import { stepAt } from '../../lib/engine/minigames.js';
import { gameSpan, GAME_GRACE_MS, DEFAULT_DURATIONS } from '../../lib/engine/phases.js';

/**
 * The step every phone is on, derived from the game doc and the server clock
 * (engine/minigames.js stepAt). Re-renders a few times a second while the
 * game runs, never after.
 */
export function useDayStep(game, kind) {
  const live = game.phase === 'game' || game.phase === 'alarm';
  const now = useServerNow(live ? game.phaseEndsAt : 0, 250);
  if (game.phase === 'alarm') return { step: 'wait', endsAt: 0, left: 0 };
  if (game.phase !== 'game') return { step: 'done', endsAt: 0, left: 0 };
  const span = gameSpan(kind, game.config?.durations ?? DEFAULT_DURATIONS);
  const s = stepAt(kind, game, now, { span, grace: GAME_GRACE_MS });
  return { ...s, left: Math.max(0, Math.ceil((s.endsAt - now) / 1000)) };
}
