/**
 * The night: what the Killers did, what everyone else saw.
 *
 * Only the host device runs this, once per night, after the night is locked
 * and every action is frozen. It is a pure function: the same inputs and seed
 * always give the same dawn, so a second host device can re-run it after a
 * crash and agree with the first.
 *
 * What happens, in order:
 *   1. Victim: the Killers' majority pick; ties break by seed. If no Killer
 *      chose anyone, fate picks a living Faithful guest, so a quiet den never
 *      stalls the room.
 *   2. The hand: the Killer who strikes, by majority. If nobody chose, it's
 *      whoever proposed the chosen victim. The hand's traits are what tonight's
 *      clues describe.
 *   3. Doctors protect; a protected victim survives, and dawn says an attempt
 *      was made. Clues still drop, since the hand was still there.
 *   4. Watchers: whoever watched the hand spots them with probability `watchP`;
 *      everyone else gets "a quiet night", which is ambiguous on purpose.
 *      Watching the victim earns one true clue.
 *   5. Detectives: a check reveals a guest's team, until checks run out.
 *   6. Scourers (and anyone who did nothing) each receive one clue fragment.
 *   7. Ghosts each receive one *true* clue, and deliver their whispers.
 *
 * A recruit night (see roster.js) swaps step 1 for an offer, and the murder,
 * if the offer is refused, happens in `resolveRecruit`.
 */

import { makeRng, pick, chance } from './rng.js';
import { ROLE, teamOf } from './roles.js';
import { nightClues, distributeFragments } from './clues.js';

export const DEFAULT_NIGHT_CONFIG = Object.freeze({
  clueBudget: [2, 2, 3, 3, 3], // clues per night at `sizePivot` players, by cycle; the last entry repeats
  // A bigger room needs more clues to find the same hand among more faces, and
  // a smaller one fewer. One clue more or less per `sizeStep` guests either side
  // of the pivot, tuned with scripts/sim-balance.mjs.
  sizePivot: 35,
  sizeStep: 20,
  watchP: 0.6,
});

const sorted = (xs) => [...xs].sort();

function majority(votes, valid, rng) {
  const tally = {};
  for (const v of votes) if (v && valid.has(v)) tally[v] = (tally[v] ?? 0) + 1;
  const max = Math.max(0, ...Object.values(tally));
  if (max === 0) return null;
  const top = sorted(Object.keys(tally).filter((k) => tally[k] === max));
  return top.length === 1 ? top[0] : pick(top, rng);
}

/** Who is alive, who is a ghost, split by team. Sorted, for determinism. */
export function census(players, roles) {
  const alive = sorted(Object.keys(players).filter((p) => players[p].status === 'alive'));
  const ghosts = sorted(Object.keys(players).filter((p) => players[p].status === 'ghost'));
  const killers = alive.filter((p) => roles[p] === ROLE.KILLER);
  const faithful = alive.filter((p) => roles[p] !== ROLE.KILLER);
  return { alive, ghosts, killers, faithful };
}

export function budgetFor(config, cycle, roomSize, rng) {
  const b = config.clueBudget;
  const base = b[Math.min(cycle - 1, b.length - 1)];
  // Fractional on purpose: one whole clue swings the Faithful win rate by far
  // more than one extra guest should, so 2.4 clues means "3 clues, 40% of nights".
  const exact = base + (config.sizeStep ? (roomSize - config.sizePivot) / config.sizeStep : 0);
  const whole = Math.floor(exact) + (rng() < exact - Math.floor(exact) ? 1 : 0);
  return Math.min(4, Math.max(1, whole));
}

/**
 * The murder itself, shared by an ordinary night and a refused recruitment.
 * Returns the deaths, the clue deliveries and the public dawn line.
 */
function murderOutcome(ctx, { victim, hand, framePid, protectedSet, scourers, extraFactTo }) {
  const { traitDefs, traitsByPid, players, roles, config, cycle, rng } = ctx;
  const saved = protectedSet.has(victim);
  const { alive, ghosts } = census(players, roles);
  const deaths = saved ? [] : [{ pid: victim, cause: 'murdered' }];

  // The room could suspect anyone still alive after tonight, the hand included.
  const pool = alive.filter((p) => saved || p !== victim);
  // Room size is everyone still in the game, ghosts included, so the clue
  // budget doesn't shrink just because the night count went up.
  const roomSize = alive.length + ghosts.length;
  const { facts, trueFacts, plantFailed } = nightClues({
    traitDefs, traitsByPid, pool, handPid: hand, framePid, budget: budgetFor(config, cycle, roomSize, rng), rng,
  });

  const deliveries = distributeFragments(facts, scourers, rng);
  for (const pid of extraFactTo) {
    if (trueFacts.length) deliveries.push({ to: pid, kind: 'fact', via: 'watch', fact: strip(pick(trueFacts, rng)) });
  }

  // Ghosts, tonight's victim included (they saw their killer), each get one
  // true clue, cycled so they hold different ones where possible.
  const ghostList = saved ? ghosts : sorted([...ghosts, victim]);
  ghostList.forEach((pid, i) => {
    if (trueFacts.length) deliveries.push({ to: pid, kind: 'fact', via: 'ghost', fact: strip(trueFacts[i % trueFacts.length]) });
  });

  return {
    deaths,
    saved,
    facts,
    plantUsed: Boolean(framePid) && !plantFailed,
    deliveries,
    publicDawn: { victims: deaths.map((d) => d.pid), attempted: saved ? victim : null },
    teamOfVictim: teamOf(roles[victim]),
  };
}

const strip = ({ trait, group }) => ({ trait, group });

/**
 * Resolve one night.
 *
 * @param ctx.players   { [pid]: { status } }, the host's full view
 * @param ctx.roles     { [pid]: role }
 * @param ctx.actions   { [pid]: { kind: 'watch'|'scour'|'protect'|'check'|'whisper', target, word } }
 * @param ctx.den       { [killerPid]: { victim, hand, frame, recruit } }
 * @param ctx.secret    { lastProtected, checksLeft, plantUsed, recruitDue }
 */
export function resolveNight(ctx) {
  const { seed, cycle, players, roles, actions = {}, den = {}, secret = {}, config = DEFAULT_NIGHT_CONFIG } = ctx;
  const rng = makeRng(seed, cycle, 'night');
  const full = { ...ctx, config, rng };
  const { alive, ghosts, killers, faithful } = census(players, roles);
  const killerSet = new Set(killers);
  const faithfulSet = new Set(faithful);

  const denVotes = (key) => killers.map((t) => den[t]?.[key]);
  const deliveries = [];
  const secretPatch = {
    lastProtected: { ...(secret.lastProtected ?? {}) },
    checksLeft: { ...(secret.checksLeft ?? {}) },
  };

  // --- Doctors -------------------------------------------------------------
  const protectedSet = new Set();
  for (const pid of alive) {
    if (roles[pid] !== ROLE.DOCTOR) continue;
    const t = actions[pid]?.kind === 'protect' ? actions[pid].target : null;
    if (t && players[t]?.status === 'alive' && secret.lastProtected?.[pid] !== t) {
      protectedSet.add(t);
      secretPatch.lastProtected[pid] = t;
    } else {
      delete secretPatch.lastProtected[pid];
    }
  }

  // --- Who strikes ---------------------------------------------------------
  const handVote = majority(denVotes('hand'), killerSet, rng);
  const recruitTarget = secret.recruitDue ? majority(denVotes('recruit'), faithfulSet, rng) ?? pick(faithful, rng) : null;
  let victim = null;
  let hand = null;
  if (!recruitTarget && killers.length && faithful.length) {
    victim = majority(denVotes('victim'), faithfulSet, rng) ?? pick(faithful, rng);
    const proposer = killers.find((t) => den[t]?.victim === victim);
    hand = handVote ?? proposer ?? pick(killers, rng);
  }

  // --- Faithful night actions ---------------------------------------------
  const scourers = [];
  const watchedVictim = [];
  for (const pid of faithful) {
    const a = actions[pid];
    const role = roles[pid];
    if (a?.kind === 'watch' && a.target && a.target !== pid && players[a.target]?.status === 'alive') {
      if (a.target === victim) watchedVictim.push(pid);
      const seen = hand != null && a.target === hand && chance(rng, config.watchP);
      deliveries.push({ to: pid, kind: 'watch', target: a.target, seen });
    } else if (role === ROLE.DETECTIVE && a?.kind === 'check' && a.target && players[a.target]?.status === 'alive') {
      const left = secret.checksLeft?.[pid] ?? 0;
      if (left > 0) {
        secretPatch.checksLeft[pid] = left - 1;
        deliveries.push({ to: pid, kind: 'check', target: a.target, team: teamOf(roles[a.target]) });
      } else {
        scourers.push(pid);
      }
    } else if (role === ROLE.DOCTOR && a?.kind === 'protect') {
      // A doctor's night is spent protecting. They learn at dawn whether it mattered.
    } else {
      scourers.push(pid);
    }
  }

  // --- Ghost whispers --------------------------------------------------------
  const whisperDeliveries = [];
  for (const pid of ghosts) {
    const a = actions[pid];
    if (a?.kind === 'whisper' && a.target && players[a.target]?.status === 'alive' && a.word) {
      whisperDeliveries.push({ to: a.target, kind: 'whisper', from: pid, word: a.word });
    }
  }

  // --- A recruit night: no murder yet ---------------------------------------
  if (recruitTarget) {
    return {
      recruit: { target: recruitTarget, hand: handVote ?? pick(killers, rng) },
      deaths: [],
      facts: [],
      deliveries: [
        ...deliveries,
        ...whisperDeliveries,
        { to: recruitTarget, kind: 'recruitOffer' },
      ],
      publicDawn: { victims: [], attempted: null },
      secretPatch,
      // Carried into resolveRecruit: scourers get clues if the offer is refused,
      // a quiet night if it is accepted.
      scourers: scourers.filter((p) => p !== recruitTarget),
      protectedList: sorted(protectedSet),
    };
  }

  if (!victim) {
    return { deaths: [], facts: [], deliveries: [...deliveries, ...whisperDeliveries], publicDawn: { victims: [], attempted: null }, secretPatch };
  }

  // --- The murder ------------------------------------------------------------
  const framePid = secret.plantUsed ? null : majority(denVotes('frame'), new Set(faithful.filter((p) => p !== victim)), rng);
  const out = murderOutcome(full, { victim, hand, framePid, protectedSet, scourers, extraFactTo: watchedVictim });
  if (out.plantUsed) secretPatch.plantUsed = true;

  for (const pid of alive) {
    if (roles[pid] === ROLE.DOCTOR && out.saved && secretPatch.lastProtected[pid] === victim) {
      deliveries.push({ to: pid, kind: 'saved', target: victim });
    }
  }

  return {
    victim,
    hand,
    saved: out.saved,
    deaths: out.deaths,
    facts: out.facts,
    deliveries: [...deliveries, ...out.deliveries, ...whisperDeliveries],
    publicDawn: out.publicDawn,
    secretPatch,
  };
}

/**
 * Resolve the recruit sub-phase. Accept and the target joins the Killers,
 * and nobody dies tonight. Refuse and they are murdered by the hand, exactly
 * as an ordinary night, clues and all.
 */
export function resolveRecruit(ctx, { target, hand, accepted, scourers, protectedList = [] }) {
  const rng = makeRng(ctx.seed, ctx.cycle, 'recruit');
  const config = ctx.config ?? DEFAULT_NIGHT_CONFIG;
  if (accepted) {
    return {
      rolePatch: { [target]: ROLE.KILLER },
      deaths: [],
      facts: [],
      deliveries: [{ to: target, kind: 'recruited' }, ...scourers.map((to) => ({ to, kind: 'quiet' }))],
      publicDawn: { victims: [], attempted: null },
    };
  }
  const out = murderOutcome({ ...ctx, config, rng }, {
    victim: target, hand, framePid: null, protectedSet: new Set(protectedList), scourers, extraFactTo: [],
  });
  return { rolePatch: {}, deaths: out.deaths, facts: out.facts, deliveries: out.deliveries, publicDawn: out.publicDawn, hand };
}
