import { REVEAL_LEAD_MS } from '../../lib/engine/phases.js';

/** When the cards are dealt: the end of the alarm plus the game's reveal hold, or the game's own reveal. */
export function cardsAtOf(game) {
  if (game.phase === 'alarm') return game.phaseEndsAt ? game.phaseEndsAt + REVEAL_LEAD_MS : 0;
  if (game.phase === 'game') return game.revealAt || 0;
  return 0;
}

export const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
