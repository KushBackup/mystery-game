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
 *   2. The hand: the Killer who strikes. The phone no longer asks (players
 *      discover that the photos describe one of them), so it rotates: the
 *      living Killer with the fewest past strikes, ties by seed. A den vote
 *      for a hand still wins if one is sent. The hand's traits are what
 *      tonight's clues describe.
 *   3. Doctors protect; a protected victim survives, and dawn says an attempt
 *      was made. Clues still drop, since the hand was still there.
 *   4. Watchers: whoever watched the hand spots them with probability `watchP`;
 *      everyone else gets "a quiet night", which is ambiguous on purpose.
 *      Watching the victim earns one true clue.
 *   5. Detectives trace two guests' phones a night against tonight's server
 *      log: did either of them do tonight's hacking (were they the hand)?
 *      "Neither" clears nobody of being a Killer, only of tonight. (The older single `check`, which reveals one
 *      guest's team until checks run out, still resolves if sent.)
 *   6. Scourers (and anyone who did nothing) each receive one clue fragment.
 *   7. The paper's witness: one more true fact about the hand, printed for
 *      everyone in the morning News (`witness`, see clues.js witnessFact).
 *   8. Ghosts each receive one *true* clue, and may pass one of their own
 *      true clue photos to a living guest (`pass`). It arrives whole, in the
 *      guest's Photos. (The whisper, one word from a list, was cut on
 *      2026-10-16, the user's call: passing the photo is the ghost's one move.)
 *      A ghost can only pass a clue it really holds: `ctx.held` lists each
 *      ghost's own clue photos (their via 'ghost' inbox), read by the host.
 *
 * A recruit night (see roster.js) swaps step 1 for an offer, and the murder,
 * if the offer is refused, happens in `resolveRecruit`.
 *
 * DEEP BLUE: the Killers' vote is the only way anyone dies at night (user's
 * call, 2026-10-15; the old "rig the morning board" kill is gone). The host
 * applies `deaths` as soon as the night locks, and dawn is the morning news on
 * every phone. A Doctor's save means nobody dies. The night's `facts` are kept
 * for the morning game, whose top three each get one (morning.js).
 *
 * The frame can be automatic too: on night `autoFrameFrom` (one night, once
 * per game), that night's clues are bent towards a random living Faithful
 * (clues.js). It is off by default. With the hand rotating, the sim
 * (2026-10-02) put the Faithful at 44-61% without it and 27-49% with it on any
 * night, so it would hand the game to the Killers. A den vote for a frame
 * still wins if one is sent.
 */

import { makeRng, pick, chance } from './rng.js';
import { ROLE, teamOf } from './roles.js';
import { nightClues, distributeFragments, witnessFact, splitHalves } from './clues.js';

export const DEFAULT_NIGHT_CONFIG = Object.freeze({
  // Private clues per night at `sizePivot` players, by cycle; the last entry
  // repeats. The paper's witness adds one public clue on top, so the room
  // gets 2, 3, 3, 3, 4. Was [2, 2, 3, 3, 3] before the witness (2026-10-03).
  clueBudget: [1, 2, 2, 2, 3],
  // A bigger room needs more clues to find the same hand among more faces, and
  // a smaller one fewer. One clue more or less per `sizeStep` guests either side
  // of the pivot, tuned with scripts/sim-balance.mjs.
  // sizeStep went from 20 to 15 with the witness (2026-10-03): the extra public
  // clue helped small rooms most. The sim (1500 games) then put the Faithful at
  // 62/54/48/48/47/50/57% for 16/20/25/30/35/40/45 guests.
  sizePivot: 35,
  sizeStep: 15,
  watchP: 0.6,
  // The night the engine frames someone on the Killers' behalf, or null for never.
  // Off: see the header for the sim numbers. Try it with `sim-balance.mjs --frame 2`.
  autoFrameFrom: null,
  // The morning paper prints a witness: one extra true fact about the hand,
  // public to the whole room (clues.js witnessFact). `publicBand` is the share
  // of the narrowed room it may fit; higher means vaguer. Tuned with the sim.
  // At [0.4, 0.8] with the old budget the Faithful won 85% at 35 guests.
  publicWitness: true,
  // [0.5, 0.8] since 2026-10-15. After the playtest (open vote every day, the
  // Killers' vote the only night death, no board), 2000 games each:
  // [0.55, 0.85] gave 61/49/44/46/42/50/57% for 16/20/25/30/35/40/45 guests;
  // [0.5, 0.8] gives 76/56/55/54/51/59/68%. Small and very big rooms lean
  // Faithful; 20-40 sits in the target band.
  publicBand: [0.5, 0.8],
  // Dig clues arrive as two halves on two phones (clues.js splitHalves). Off restores whole photos.
  splitClues: true,
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

/** The Killer who strikes when the den didn't say: whoever has struck least, ties by seed. */
function rotateHand(killers, hands, rng) {
  if (!killers.length) return null;
  const struck = Object.fromEntries(killers.map((k) => [k, 0]));
  for (const h of Object.values(hands ?? {})) if (h in struck) struck[h] += 1;
  const least = Math.min(...Object.values(struck));
  return pick(killers.filter((k) => struck[k] === least), rng);
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

  const fragments = distributeFragments(facts, scourers, rng);
  const deliveries = [];
  for (const pid of extraFactTo) {
    if (trueFacts.length) deliveries.push({ to: pid, kind: 'fact', via: 'watch', fact: strip(pick(trueFacts, rng)) });
  }

  // Ghosts, tonight's victim included (they saw their killer), each get one
  // true clue, cycled so they hold different ones where possible.
  const ghostList = saved ? ghosts : sorted([...ghosts, victim]);
  ghostList.forEach((pid, i) => {
    if (trueFacts.length) deliveries.push({ to: pid, kind: 'fact', via: 'ghost', fact: strip(trueFacts[i % trueFacts.length]) });
  });

  // The paper's witness, drawn last so it leaves every other draw tonight unchanged.
  const witness = config.publicWitness
    ? witnessFact({ traitDefs, traitsByPid, pool, handPid: hand, facts: trueFacts, band: config.publicBand ?? [0.55, 0.85], rng })
    : null;

  // Split last, on its own rng: every draw above is the same with or without it.
  const split = config.splitClues
    ? splitHalves(fragments, pool, makeRng(ctx.seed, cycle, 'halves'), cycle)
    : { deliveries: fragments, pairs: {} };

  return {
    deaths,
    saved,
    facts,
    witness,
    pairs: split.pairs,
    trueFacts: trueFacts.map(strip),
    plantUsed: Boolean(framePid) && !plantFailed,
    deliveries: [...split.deliveries, ...deliveries],
    // The morning news: who died, who the Killers missed, and the paper's witness.
    publicDawn: clean({ victims: deaths.map((d) => d.pid), attempted: saved ? victim : null, taken: saved ? null : victim, witness: witness ? strip(witness) : null }),
    teamOfVictim: teamOf(roles[victim]),
  };
}

const strip = ({ trait, group }) => ({ trait, group });
const clean = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === undefined ? null : v]));

/**
 * Resolve one night.
 *
 * @param ctx.players   { [pid]: { status } }, the host's full view
 * @param ctx.roles     { [pid]: role }
 * @param ctx.actions   { [pid]: { kind: 'watch'|'scour'|'protect'|'check'|'pass', target, fact } }
 * @param ctx.held      { [ghostPid]: [{ trait, group }] }, the true clue photos each ghost holds
 * @param ctx.den       { [killerPid]: { victim, hand, frame, recruit } }
 * @param ctx.secret    { lastProtected, checksLeft, plantUsed, recruitDue, hands }
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
    hand = handVote ?? rotateHand(killers, secret.hands, rng);
  }

  // --- Faithful night actions ---------------------------------------------
  const scourers = [];
  const watchedVictim = [];
  for (const pid of faithful) {
    const a = actions[pid];
    const role = roles[pid];
    const traced = role === ROLE.DETECTIVE && a?.kind === 'trace' ? [...new Set(a.targets ?? [])].filter((t) => t !== pid && players[t]?.status === 'alive') : [];
    if (traced.length === 2) {
      deliveries.push({ to: pid, kind: 'trace', targets: sorted(traced), hit: hand != null && traced.includes(hand) });
    } else if (a?.kind === 'watch' && a.target && a.target !== pid && players[a.target]?.status === 'alive') {
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

  // --- Ghosts' passed clues ---------------------------------------------------
  // A pass carries a copy of one of the ghost's own true clue photos; a fact the
  // ghost doesn't hold (a forged action) is dropped, like any invalid move.
  const passDeliveries = [];
  const holds = (pid, f) => Boolean(f) && (ctx.held?.[pid] ?? []).some((h) => h.trait === f.trait && h.group === f.group);
  for (const pid of ghosts) {
    const a = actions[pid];
    if (!a?.target || players[a.target]?.status !== 'alive') continue;
    if (a.kind === 'pass' && holds(pid, a.fact)) {
      passDeliveries.push({ to: a.target, kind: 'fact', via: 'pass', from: pid, fact: strip(a.fact) });
    }
  }

  // --- A recruit night: no murder yet ---------------------------------------
  if (recruitTarget) {
    return {
      recruit: { target: recruitTarget, hand: handVote ?? rotateHand(killers, secret.hands, rng) },
      deaths: [],
      facts: [],
      deliveries: [
        ...deliveries,
        ...passDeliveries,
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
    return { deaths: [], facts: [], trueFacts: [], deliveries: [...deliveries, ...passDeliveries], publicDawn: { victims: [], attempted: null }, secretPatch };
  }

  // --- The murder ------------------------------------------------------------
  const frameable = faithful.filter((p) => p !== victim);
  const framePid = secret.plantUsed ? null
    : majority(denVotes('frame'), new Set(frameable), rng)
      ?? (config.autoFrameFrom != null && cycle === config.autoFrameFrom && frameable.length ? pick(frameable, rng) : null);
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
    trueFacts: out.trueFacts,
    deliveries: [...deliveries, ...out.deliveries, ...passDeliveries],
    publicDawn: out.publicDawn,
    witness: out.witness,
    pairs: out.pairs,
    protectedList: sorted(protectedSet),
    // Who the frame landed on, for the finale's account of the night (null when none).
    frame: out.plantUsed ? framePid : null,
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
      trueFacts: [],
      deliveries: [{ to: target, kind: 'recruited' }, ...scourers.map((to) => ({ to, kind: 'quiet' }))],
      publicDawn: { victims: [], attempted: null },
    };
  }
  const out = murderOutcome({ ...ctx, config, rng }, {
    victim: target, hand, framePid: null, protectedSet: new Set(protectedList), scourers, extraFactTo: [],
  });
  return {
    rolePatch: {}, victim: target, saved: out.saved, deaths: out.deaths, facts: out.facts, trueFacts: out.trueFacts, witness: out.witness, pairs: out.pairs,
    deliveries: out.deliveries, publicDawn: out.publicDawn, hand, protectedList,
  };
}
