/**
 * The Round Table: counting a banishment vote.
 *
 * One vote per eligible voter, for one eligible target. Ghosts are eligible
 * voters in every ballot (2026-10-15), but never targets. Invalid votes (a
 * vote for someone already dead or not on trial) are dropped, not errors. Phones can be a snapshot behind, and a stale vote
 * should cost its voter their say, not break the count.
 *
 * A tie returns every tied pid. The host console then runs one short re-vote
 * between them (phase 'revote'); if that ties too, `breakTie` settles it by
 * seed, so the result is reproducible on any host device.
 */

import { makeRng, pick } from './rng.js';

export function tallyBanish(votes, voters, targets) {
  const voterSet = new Set(voters);
  const targetSet = new Set(targets);
  const tally = {};
  let cast = 0;
  for (const [voter, target] of Object.entries(votes)) {
    if (!voterSet.has(voter) || !targetSet.has(target)) continue;
    tally[target] = (tally[target] ?? 0) + 1;
    cast++;
  }
  const max = Math.max(0, ...Object.values(tally));
  const top = Object.keys(tally).filter((k) => tally[k] === max).sort();
  if (max === 0) return { pid: null, tally, cast, tied: [] };
  if (top.length > 1) return { pid: null, tally, cast, tied: top };
  return { pid: top[0], tally, cast, tied: [] };
}

export function breakTie(seed, cycle, tied) {
  return pick([...tied].sort(), makeRng(seed, cycle, 'tiebreak'));
}

/**
 * Accusations (2026-10-15): the room calls its own vote. In daylight any
 * living guest may accuse one guest a day; any other living guest may second
 * one accusation a day. An accused guest with `SECONDS_NEEDED` seconds goes on
 * trial, and the Round Table votes only between those on trial. If nobody is
 * on trial there is no vote and nobody is killed: silence is the Killers' gift.
 * With one guest on trial the ballot adds `NO_ONE`, so the room can spare them.
 *
 * Pure, like the rest of the engine: the host calls it when daylight ends, and
 * each phone calls it to show who is close to trial.
 */
export const SECONDS_NEEDED = 2;
export const NO_ONE = 'none';

/**
 * @param accusations [{ pid, target }] today's, one per accuser
 * @param seconds     [{ pid, accuser }] today's, one per seconder
 * @param alive       living pids
 * @returns [{ pid, accusers: [pid], seconds: [pid], support }], every accused
 *          guest, most support first (ties by pid). A second accuser of the same
 *          guest counts as a second, so `support` is accusers beyond the first
 *          plus seconds; `onTrial` marks those with SECONDS_NEEDED of it.
 */
export function accusationBoard(accusations, seconds, alive) {
  const living = new Set(alive);
  const byAccuser = new Map(accusations.filter((a) => living.has(a.pid) && living.has(a.target) && a.pid !== a.target).map((a) => [a.pid, a.target]));
  const rows = new Map();
  for (const [accuser, target] of byAccuser) {
    const row = rows.get(target) ?? { pid: target, accusers: [], seconds: [] };
    row.accusers.push(accuser);
    rows.set(target, row);
  }
  for (const s of seconds) {
    const target = byAccuser.get(s.accuser);
    if (!target || !living.has(s.pid) || s.pid === s.accuser || s.pid === target) continue;
    const row = rows.get(target);
    if (!row.seconds.includes(s.pid) && !row.accusers.includes(s.pid)) row.seconds.push(s.pid);
  }
  return [...rows.values()]
    .map((r) => {
      const support = r.accusers.length - 1 + r.seconds.length;
      return { ...r, support, onTrial: support >= SECONDS_NEEDED };
    })
    .sort((a, b) => (b.support - a.support) || (a.pid < b.pid ? -1 : 1));
}

/** Who the Round Table votes between: everyone on trial, plus NO_ONE when there is only one. */
export function ballotFor(board) {
  const trial = board.filter((r) => r.onTrial).map((r) => r.pid);
  return trial.length === 1 ? [...trial, NO_ONE] : trial;
}
