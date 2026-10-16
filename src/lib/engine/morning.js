/**
 * The morning game's reward: the day's game is over, the scores are in, and
 * the top of the day earns a clue.
 *
 * Only the host runs this, once per day, after the game phase is locked. Like
 * the night it is pure and seeded, so a backup host device re-running it gets
 * the same result.
 *
 * The game kills nobody (user's call, 2026-10-15, after the playtest): the
 * only night death is the Killers' vote, applied when the night locks
 * (night.js). There is no public board either. The day's top three living
 * scorers each earn one of the night's clues, as a photo, told privately.
 * They are extra recipients of the same facts, not extra facts, so the clue
 * budget the sim tuned is unchanged. A guest who never played scores 0 and
 * can't place.
 */

import { makeRng } from './rng.js';
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
 * @param ctx.players  { [pid]: { status } }
 * @param ctx.roles    { [pid]: role }
 * @param ctx.scores   { [pid]: { best, runs } }, this day's score docs
 * @param ctx.facts    the night's clue facts, stashed by the host at night lock
 * @returns {{ top: string[], deliveries: object[] }}
 */
export function topOfDay({ seed, cycle, players, roles, scores = {}, facts = [] }) {
  const rng = makeRng(seed, cycle, 'morning');
  const { alive } = census(players, roles);
  const score = (pid) => scoreOf(scores, pid);
  const top = alive
    .filter((p) => score(p) > 0)
    .sort((a, b) => (score(b) - score(a)) || (a < b ? -1 : 1))
    .slice(0, TOP_REWARD);
  const deliveries = [];
  if (facts.length) {
    const offset = Math.floor(rng() * facts.length);
    top.forEach((pid, i) => {
      deliveries.push({ to: pid, kind: 'fact', via: 'top', rank: i + 1, fact: strip(facts[(offset + i) % facts.length]) });
    });
  }
  return { top, deliveries };
}
