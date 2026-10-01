/**
 * The morning: the day's run is over, the scores are in, and the board decides
 * who DEEP BLUE takes.
 *
 * Only the host runs this, once per day, after the game phase is locked. Like
 * the night it is pure and seeded, so a backup host device re-running it gets
 * the same board.
 *
 * The rule the room is told: the lowest score on the board is taken. The rule
 * underneath:
 *
 *   - The rig lands (the Killers' target was not protected). The target dies,
 *     whatever they actually scored. Their row shows the rigged value and sits
 *     last. Honest low scores never kill.
 *   - The Firewall holds (a Doctor protected the target). The rig bounces, and
 *     the deep takes the genuinely lowest living scorer instead, protected
 *     guests excepted. That can be a Killer. Nobody learns their role.
 *   - Nobody was targeted (a recruit said yes, or no Killers are left):
 *     nobody dies.
 *
 * A guest who never played scores 0. The day's top three living scorers each
 * earn one of the night's clues, as a photo. They are extra recipients of the
 * same facts, not extra facts, so the clue budget the sim tuned is unchanged.
 */

import { makeRng, pick } from './rng.js';
import { census } from './night.js';

export const TOP_REWARD = 3;
export const MAX_SCORE = 999;

const strip = ({ trait, group }) => ({ trait, group });

/** A guest's best score for the day, or 0 if they never played. */
export function scoreOf(scores, pid) {
  const n = Number(scores?.[pid]?.best ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.min(MAX_SCORE, Math.floor(n))) : 0;
}

/**
 * @param ctx.players  { [pid]: { status } }, before any of this morning's deaths
 * @param ctx.roles    { [pid]: role }
 * @param ctx.scores   { [pid]: { best, runs } }, this day's score docs
 * @param ctx.pending  the stashed night: { victim, saved, protectedList, rig,
 *                     facts, trueFacts, deliveries, publicDawn, recruited }
 */
export function resolveMorning({ seed, cycle, players, roles, scores = {}, pending = {} }) {
  const rng = makeRng(seed, cycle, 'morning');
  const { alive, ghosts } = census(players, roles);
  const aliveSet = new Set(alive);
  const deliveries = [...(pending.deliveries ?? [])];
  const trueFacts = pending.trueFacts ?? [];
  const facts = pending.facts ?? [];
  const score = (pid) => scoreOf(scores, pid);

  let deaths = [];
  let cause = null;
  const victim = pending.victim && aliveSet.has(pending.victim) ? pending.victim : null;

  if (victim && !pending.saved) {
    deaths = [{ pid: victim, cause: 'murdered' }];
    cause = 'rig';
  } else if (victim && pending.saved) {
    const exempt = new Set(pending.protectedList?.length ? pending.protectedList : [victim]);
    const pool = alive.filter((p) => !exempt.has(p));
    if (pool.length) {
      const low = Math.min(...pool.map(score));
      const lowest = pool.filter((p) => score(p) === low).sort();
      const taken = lowest.length === 1 ? lowest[0] : pick(lowest, rng);
      deaths = [{ pid: taken, cause: 'deep' }];
      cause = 'deep';
      // Every ghost holds one true clue; the deep's catch gets theirs now.
      if (trueFacts.length) deliveries.push({ to: taken, kind: 'fact', via: 'ghost', fact: strip(pick(trueFacts, rng)) });
    }
  }

  // --- The board ---------------------------------------------------------------
  const riggedPid = cause === 'rig' ? victim : null;
  const others = alive.filter((p) => p !== riggedPid).map(score);
  const rigged = riggedPid
    ? (pending.rig === 'under' ? Math.max(0, (others.length ? Math.min(...others) : 1) - 1) : 0)
    : null;
  const rowOf = (pid) => ({ pid, score: pid === riggedPid ? rigged : score(pid), played: scores[pid] != null });
  const byScore = (a, b) => (b.score - a.score) || (a.pid < b.pid ? -1 : 1);
  const rows = alive.filter((p) => p !== riggedPid).map(rowOf).sort(byScore);
  if (riggedPid) rows.push(rowOf(riggedPid));
  const board = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  const ghostBoard = ghosts.filter((p) => scores[p] != null).map(rowOf).sort(byScore);

  // --- Top of the board earns a clue -------------------------------------------
  const dead = new Set(deaths.map((d) => d.pid));
  const top = board.filter((r) => !dead.has(r.pid) && r.score > 0).slice(0, TOP_REWARD).map((r) => r.pid);
  if (facts.length) {
    const offset = Math.floor(rng() * facts.length);
    top.forEach((pid, i) => {
      deliveries.push({ to: pid, kind: 'fact', via: 'top', rank: i + 1, fact: strip(facts[(offset + i) % facts.length]) });
    });
  }

  const taken = deaths[0]?.pid ?? null;
  return {
    deaths,
    cause,
    board,
    ghostBoard,
    top,
    deliveries,
    publicDawn: {
      victims: deaths.map((d) => d.pid),
      attempted: pending.saved ? victim : null,
      cause,
      taken,
      rigged,
    },
  };
}
