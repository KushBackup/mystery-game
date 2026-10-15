/**
 * The room's progress, in numbers every phone can work out for itself
 * (2026-10-15). After the 3 Oct game, players couldn't see that a clue had
 * done anything. Now each night shows how many living guests still fit what
 * the whole room knows about that night's Killer.
 *
 * Per night, never across nights: the Killers take turns (engine/night.js
 * rotateHand), so night 1's clues and night 2's clues usually describe two
 * different people.
 *
 * Only a count. Nobody is greyed out or named (the user's call): matching
 * the count to faces in the room is the game.
 *
 * Public facts are the ones the whole room has seen: the paper's witness and
 * a killed guest's last message. Everyone's arrival answers are public
 * (traits/{pid}), so every phone gets the same number.
 */

import { candidatesFor } from '../lib/engine/clues.js';
import { targetCounts } from '../lib/engine/roles.js';
import { TRAITS } from '../data/traits';

/** The paper's witnesses (news.js), one per day, already past their reveal. */
export function paperWitnesses(news) {
  return (news?.room ?? []).filter((s) => s.witness).map((s) => ({ cycle: s.day, fact: s.witness, from: 'paper' }));
}

/** Last words in the Room: the killed guest's true photo describes the night they were killed on. */
export function lastMessages(ctx) {
  const died = Object.fromEntries((ctx.players ?? []).map((p) => [p.id, p.diedCycle]));
  return (ctx.chat ?? [])
    .filter((m) => m.kind === 'last' && m.fact && died[m.pid])
    .map((m) => ({ cycle: died[m.pid], fact: m.fact, from: 'last' }));
}

/** Every public fact, as { cycle, fact, from }. */
export const publicFacts = (ctx) => [...paperWitnesses(ctx.news), ...lastMessages(ctx)];

/** How many living guests fit every fact in `facts` (all from one night). */
export function fitCount(ctx, facts) {
  const alive = (ctx.players ?? []).filter((p) => p.status === 'alive').map((p) => p.id);
  return candidatesFor(TRAITS, ctx.traits ?? {}, alive, facts).length;
}

/**
 * The newest night the room has public clues for, as { cycle, n }, or null.
 * The home screen's progress line reads it.
 */
export function latestPublicCount(ctx) {
  const facts = publicFacts(ctx);
  if (!facts.length) return null;
  const cycle = Math.max(...facts.map((f) => f.cycle));
  return { cycle, n: fitCount(ctx, facts.filter((f) => f.cycle === cycle).map((f) => f.fact)) };
}

/** Killers the room has caught (killed by the vote, role shown), and how many were dealt. */
export function killersCaught(game, players) {
  const total = game?.dealtCount ? targetCounts(game.dealtCount, game.config?.ratios).killer : 0;
  const caught = (players ?? []).filter((p) => p.cause === 'banished' && p.revealedRole === 'killer').length;
  return { caught, total };
}
