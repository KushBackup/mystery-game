/**
 * Who has won, if anyone.
 *
 *   faithful: no Killer is left alive.
 *   killers: Killers are at least as many as the living Faithful (they could
 *             out-vote the room from here), or any Killer survives the Endgame.
 *
 * Vanished guests (left the bar) are neither alive nor ghosts and count for
 * nobody. If the last Killer walks out, roster.js recruits a replacement
 * before this is asked, so the room never wins because someone went home.
 */

import { ROLE } from './roles.js';

export function checkWin(players, roles, { endgameDone = false } = {}) {
  let killers = 0;
  let faithful = 0;
  for (const [pid, p] of Object.entries(players)) {
    if (p.status !== 'alive') continue;
    if (roles[pid] === ROLE.KILLER) killers++;
    else faithful++;
  }
  if (killers === 0) return 'faithful';
  if (killers >= faithful) return 'killers';
  if (endgameDone) return 'killers';
  return null;
}
