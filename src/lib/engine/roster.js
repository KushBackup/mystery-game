/**
 * Roster churn: guests leaving mid-game, and the Killers topping themselves up.
 *
 * A guest who leaves (taps Leave, or the host removes them) *vanishes* at the
 * next dawn. Their role is never revealed, so leaving early gives nothing away
 * and nobody can use the Leave button to prove their innocence.
 *
 * If a vanished guest was a Killer, the Killer team is now smaller for a
 * reason the Faithful didn't earn. So the next night becomes a recruit night:
 * the Killers pick a living Faithful guest to invite in. On refusal, the guest
 * is murdered, as on the show (see night.js). Banished Killers are *never*
 * replaced; if they were, the Faithful could never win.
 *
 * If the last Killer walks out, there is no den left to choose anyone, so
 * fate recruits directly: one Faithful guest is simply turned.
 */

import { ROLE } from './roles.js';
import { makeRng, pick } from './rng.js';

/** Mark every guest who asked to leave as vanished. Returns the pids that vanished. */
export function applyLeaves(players) {
  const vanished = [];
  for (const [pid, p] of Object.entries(players)) {
    if (p.leaveRequestedAt && (p.status === 'alive' || p.status === 'ghost')) vanished.push(pid);
  }
  return vanished.sort();
}

/**
 * How short-handed the Killers are for reasons the Faithful didn't earn.
 * `secret.killerTarget` is the count dealt at casting; `secret.banishedKillers`
 * counts the ones the room caught.
 */
export function recruitNeed(players, roles, secret) {
  const alive = Object.keys(players).filter((p) => players[p].status === 'alive');
  const killersAlive = alive.filter((p) => roles[p] === ROLE.KILLER).length;
  const faithfulAlive = alive.length - killersAlive;
  const allowed = (secret.killerTarget ?? 0) - (secret.banishedKillers ?? 0);
  if (killersAlive >= allowed || faithfulAlive < 3) return null;
  return killersAlive === 0 ? 'fate' : 'den';
}

/** Fate's recruit, for when no Killer is left in the room to choose one. */
export function fateRecruit(seed, cycle, players, roles) {
  const faithful = Object.keys(players)
    .filter((p) => players[p].status === 'alive' && roles[p] !== ROLE.KILLER)
    .sort();
  return pick(faithful, makeRng(seed, cycle, 'fate-recruit')) ?? null;
}
