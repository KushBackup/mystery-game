/**
 * When each reveal's beats land, in seconds after the room's `revealAt`, and
 * what the phone is allowed to know before then.
 *
 * The host writes a death at the same instant it opens the reveal, about four
 * seconds *before* every phone flips. So the data arrives early, and anything
 * that reacts to it (a greyed ghost phone, Contacts, the group chat) must wait
 * for the beat that tells the room, or the victim's own phone spoils it for
 * the table.
 */

import { useServerNow } from '../hooks/useKillers';

/** The board: podium, "…and last place", TAKEN, then the whole board. */
export const BOARD_BEAT = { podium: 0, last: 2.8, taken: 5.2, full: 7.2 };
/** The verdict: the name, then KILLER or innocent, then the votes. */
export const VERDICT_BEAT = { name: 0, verdict: 1.8, votes: 2.6 };

/** The instant (server ms) a death this phase may be shown, or 0 if nothing is hidden. */
export function revealGate(game) {
  if (!game?.revealAt) return 0;
  if (game.phase === 'dawn') return game.revealAt + BOARD_BEAT.taken * 1000;
  if (game.phase === 'banish') return game.revealAt + VERDICT_BEAT.verdict * 1000;
  return 0;
}

/** Did this player die in the reveal that is still playing? */
const dyingNow = (p, game) =>
  p.status === 'ghost' && p.diedCycle === game.cycle && (
    (game.phase === 'dawn' && (p.cause === 'murdered' || p.cause === 'deep'))
    || (game.phase === 'banish' && p.cause === 'banished')
  );

/**
 * The players as the room may see them right now: anyone who dies in the
 * current reveal still reads as alive until its beat lands.
 */
export function useMaskedPlayers(players, game) {
  const gate = revealGate(game);
  const now = useServerNow(gate, 250);
  if (!gate || now >= gate) return { players, masked: false };
  return {
    players: players.map((p) => (dyingNow(p, game) ? { ...p, status: 'alive', cause: null, revealedRole: null } : p)),
    masked: true,
  };
}
