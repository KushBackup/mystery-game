/**
 * The Round Table: counting a banishment vote.
 *
 * One vote per eligible voter, for one eligible target. Invalid votes (a ghost
 * voting at an ordinary Round Table, a vote for someone already dead) are
 * dropped, not errors. Phones can be a snapshot behind, and a stale vote
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
