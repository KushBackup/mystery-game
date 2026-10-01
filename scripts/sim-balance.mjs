#!/usr/bin/env node
/**
 * Balance simulator for Killers Night.
 *
 *   node scripts/sim-balance.mjs                    # sweep room sizes x killer ratios
 *   node scripts/sim-balance.mjs --n 35 --games 5000 --verbose
 *   node scripts/sim-balance.mjs --n 35 --watchP 0.5 --budget 2,2,2,3,3 --endgame 2
 *
 * Plays whole games with the real engine (src/lib/engine) and bot players:
 *
 *   Killers  murder a claimed Detective if one exists, otherwise at random;
 *             rotate the hand to whoever is least suspected; frame someone on
 *             night 2; sometimes fake a "I watched X and saw them" claim;
 *             vote as a bloc for the most-suspected Faithful.
 *   Faithful  pool every clue fragment (fragments reach several people, so
 *             the room hears them), work out who fits each night's clues,
 *             watch people they already suspect, and vote for the most
 *             suspicious guest with noise, because a real room is not a
 *             perfect Bayesian.
 *
 * The bots are a model, not a prediction. The point is comparison: does a
 * change make the Faithful win more or less, do clues narrow the room at the
 * intended rate, does any fact name the hand outright? The target is a Faithful
 * win rate of 45–55%.
 *
 * No test framework. This is a plain Node script, like the rest of the
 * project's checks.
 */

import { TRAITS } from '../src/data/traits.js';
import {
  makeRng, pick, chance, targetCounts, dealRoles, resolveNight, resolveMorning, tallyBanish, breakTie,
  checkWin, candidatesFor, fits, DEFAULT_RATIOS, DEFAULT_NIGHT_CONFIG, ROLE, ENDGAME_ROUNDS as DEFAULT_ENDGAME,
} from '../src/lib/engine/index.js';

// ---------------------------------------------------------------------------
// Args

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] == null ? 'true' : arr[i + 1]]);
    return acc;
  }, []),
);
const GAMES = Number(args.games ?? 2000);
const CYCLES = Number(args.cycles ?? 5);
const ENDGAME_ROUNDS = Number(args.endgame ?? DEFAULT_ENDGAME);
const VERBOSE = args.verbose === 'true';
const NOISE = Number(args.noise ?? 0.6); // how far a real room strays from the best guess
const SHARE_Q = Number(args.share ?? 0.75); // chance one fragment-holder speaks up
const config = {
  ...DEFAULT_NIGHT_CONFIG,
  watchP: Number(args.watchP ?? DEFAULT_NIGHT_CONFIG.watchP),
  sizeStep: Number(args.step ?? DEFAULT_NIGHT_CONFIG.sizeStep),
  clueBudget: args.budget ? args.budget.split(',').map(Number) : DEFAULT_NIGHT_CONFIG.clueBudget,
};

// ---------------------------------------------------------------------------
// A plausible bar crowd. Weights are guesses at a Goa/Bombay Friday night;
// the sim reports how the actual split behaves, which is what matters.

const WEIGHTS = {
  top: { black: 30, white: 14, grey: 8, blue: 15, red: 8, green: 5, yellow: 4, print: 16 },
  glasses: { yes: 35, no: 65 },
  shoes: { sneakers: 45, shoes: 18, boots: 8, sandals: 19, heels: 10 },
  drink: { beer: 28, wine: 12, clear: 15, brown: 12, cocktail: 18, zero: 15 },
  season: { q1: 25, q2: 25, q3: 25, q4: 25 },
  siblings: { only: 12, eldest: 35, middle: 15, youngest: 38 },
};

function weighted(obj, rng) {
  const entries = Object.entries(obj);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [k, w] of entries) if ((r -= w) < 0) return k;
  return entries[entries.length - 1][0];
}

function makeRoom(n, rng) {
  const players = {};
  const traits = {};
  for (let i = 0; i < n; i++) {
    const pid = `p${String(i).padStart(2, '0')}`;
    players[pid] = { status: 'alive' };
    traits[pid] = Object.fromEntries(TRAITS.map((t) => [t.id, weighted(WEIGHTS[t.id], rng)]));
  }
  return { players, traits };
}

// ---------------------------------------------------------------------------
// One game

const stats = { candAfter: {}, factShare: [], namedOutright: 0, nights: 0, facts: 0, hitsByCycle: {}, banishByCycle: {} };

function playGame(n, ratios, gameSeed) {
  const rng = makeRng(gameSeed, 'bots');
  const { players, traits } = makeRoom(n, rng);
  const counts = targetCounts(n, ratios);
  const roles = dealRoles(Object.keys(players), counts, makeRng(gameSeed, 'deal'));
  const secret = {
    lastProtected: {},
    checksLeft: Object.fromEntries(Object.keys(roles).filter((p) => roles[p] === ROLE.DETECTIVE).map((p) => [p, ratios.detectiveChecks ?? 2])),
    plantUsed: false,
  };

  const alive = () => Object.keys(players).filter((p) => players[p].status === 'alive').sort();
  // DEEP BLUE: everyone has a skill at the morning run. It only matters when a
  // Firewall blocks the rig and the deep takes the lowest honest score.
  const skill = Object.fromEntries(Object.keys(players).map((p) => [p, 1 + rng() * 30]));
  const isKiller = (p) => roles[p] === ROLE.KILLER;

  // What the room collectively knows.
  const nights = []; // { cycle, facts: [...], pool: [...], explained: bool }
  const claims = {}; // pid -> suspicion weight from watch/detective claims
  const cleared = new Set(); // publicly confirmed Faithful (banished Faithful are dead anyway)
  let detectiveClaimed = null;

  function suspicion(p) {
    let notHand = 1;
    for (const nt of nights) {
      if (nt.explained) continue;
      const pool = nt.pool.filter((q) => players[q].status === 'alive');
      const cands = candidatesFor(TRAITS, traits, pool, nt.facts);
      if (cands.includes(p)) notHand *= 1 - 1 / cands.length;
    }
    return 1 - notHand + (claims[p] ?? 0) + 0.02 - (cleared.has(p) ? 5 : 0);
  }

  function roomVote(voters, targets) {
    const scores = Object.fromEntries(targets.map((t) => [t, suspicion(t)]));
    const faithfulTargets = targets.filter((t) => !isKiller(t));
    const killerPick = faithfulTargets.sort((a, b) => scores[b] - scores[a])[0];
    const votes = {};
    for (const v of voters) {
      if (isKiller(v)) {
        votes[v] = killerPick;
        continue;
      }
      let best = null;
      let bestScore = -Infinity;
      for (const t of targets) {
        if (t === v) continue;
        const g = Math.sqrt(-2 * Math.log(rng() || 1e-9)) * Math.cos(2 * Math.PI * rng());
        const s = scores[t] * Math.exp(NOISE * g) + rng() * 0.01;
        if (s > bestScore) { bestScore = s; best = t; }
      }
      votes[v] = best;
    }
    return votes;
  }

  function banish(cycle, voters, targets) {
    const votes = roomVote(voters, targets);
    let { pid, tied } = tallyBanish(votes, voters, targets);
    if (!pid && tied.length) pid = breakTie(gameSeed, cycle, tied);
    if (!pid) return null;
    players[pid].status = 'ghost';
    if (isKiller(pid)) {
      // The room now knows who struck on nights this killer fits.
      for (const nt of nights) {
        const cands = candidatesFor(TRAITS, traits, nt.pool, nt.facts);
        if (cands.includes(pid)) nt.explained = true;
      }
    } else {
      cleared.add(pid);
    }
    stats.banishByCycle[cycle] = (stats.banishByCycle[cycle] ?? 0) + 1;
    if (isKiller(pid)) stats.hitsByCycle[cycle] = (stats.hitsByCycle[cycle] ?? 0) + 1;
    return pid;
  }

  for (let cycle = 1; cycle <= CYCLES; cycle++) {
    const living = alive();
    const killersAlive = living.filter(isKiller);
    const faithfulAlive = living.filter((p) => !isKiller(p));

    // --- Killer strategy
    const den = {};
    const leastSuspected = [...killersAlive].sort((a, b) => suspicion(a) - suspicion(b))[0];
    const victim = detectiveClaimed && players[detectiveClaimed].status === 'alive' && chance(rng, 0.8)
      ? detectiveClaimed
      : pick(faithfulAlive, rng);
    const frame = cycle === 2 && chance(rng, 0.8) ? pick(faithfulAlive.filter((p) => p !== victim), rng) : null;
    for (const t of killersAlive) den[t] = { victim, hand: leastSuspected, frame };

    // --- Faithful strategy
    const ranked = [...living].sort((a, b) => suspicion(b) - suspicion(a));
    const actions = {};
    for (const p of faithfulAlive) {
      const role = roles[p];
      if (role === ROLE.DOCTOR) {
        actions[p] = { kind: 'protect', target: detectiveClaimed && players[detectiveClaimed]?.status === 'alive' ? detectiveClaimed : pick(living, rng) };
      } else if (role === ROLE.DETECTIVE) {
        // Trace the two most suspected guests not yet cleared.
        const targets = ranked.filter((q) => q !== p && !cleared.has(q)).slice(0, 2);
        actions[p] = targets.length === 2 ? { kind: 'trace', targets } : { kind: 'scour' };
      } else if (role === ROLE.MEDIUM) {
        const ghosts = Object.keys(players).filter((q) => players[q].status === 'ghost');
        actions[p] = ghosts.length ? { kind: 'seance', target: pick(ghosts, rng) } : { kind: 'scour' };
      } else if (chance(rng, 0.35)) {
        actions[p] = { kind: 'watch', target: pick(ranked.filter((q) => q !== p).slice(0, 8), rng) };
      } else {
        actions[p] = { kind: 'scour' };
      }
    }

    const out = resolveNight({ seed: gameSeed, cycle, players, roles, traitsByPid: traits, traitDefs: TRAITS, actions, den, secret, config });
    Object.assign(secret, out.secretPatch);
    const scores = Object.fromEntries(alive().filter(() => chance(rng, 0.95)).map((p) => [p, { best: Math.floor(skill[p] * (0.5 + rng() * 0.5)) }]));
    const morning = resolveMorning({
      seed: gameSeed, cycle, players, roles, scores,
      pending: { victim: out.victim, saved: out.saved, protectedList: out.protectedList, facts: out.facts, trueFacts: out.trueFacts, deliveries: out.deliveries },
    });
    for (const d of morning.deaths) players[d.pid].status = 'ghost';
    if (morning.cause === 'deep') stats.deep = (stats.deep ?? 0) + 1;
    if (morning.cause === 'deep' && isKiller(morning.deaths[0].pid)) stats.deepKiller = (stats.deepKiller ?? 0) + 1;

    // --- What reaches the room
    const pool = alive();
    const heard = [];
    for (const f of out.facts) {
      // Searchers and the day's top three hold the night's clues.
      const holders = morning.deliveries.filter((d) => d.kind === 'fact' && (!d.via || d.via === 'top' || d.via === 'seance') && d.fact.trait === f.trait && d.fact.group === f.group);
      const faithfulHolders = holders.filter((d) => !isKiller(d.to)).length;
      if (1 - (1 - SHARE_Q) ** faithfulHolders > rng()) heard.push(f);
      stats.factShare.push(pool.filter((p) => fits(TRAITS, traits[p], f)).length / pool.length);
      stats.facts++;
    }
    // A contradiction (nobody fits) tells the room one fact is a lie; they drop the newest.
    while (heard.length && candidatesFor(TRAITS, traits, pool, heard).length === 0) heard.pop();
    nights.push({ cycle, facts: heard, pool });
    const trueHeard = heard.filter((f) => !f.planted);
    const cands = candidatesFor(TRAITS, traits, pool, trueHeard).length;
    stats.candAfter[cycle] = stats.candAfter[cycle] ?? [];
    stats.candAfter[cycle].push(cands);
    if (out.hand) {
      stats.nights++;
      if (cands === 1) stats.namedOutright++;
    }

    for (const d of out.deliveries) {
      if (d.kind === 'watch' && d.seen && chance(rng, 0.9)) claims[d.target] = (claims[d.target] ?? 0) + 0.6;
      if (d.kind === 'trace' && chance(rng, 0.7)) {
        if (d.hit) for (const t of d.targets) claims[t] = (claims[t] ?? 0) + 0.7;
        else for (const t of d.targets) claims[t] = (claims[t] ?? 0) - 0.1;
        detectiveClaimed = d.to;
      }
      if (d.kind === 'seance' && d.team === 'killers') claims[d.ghost] = (claims[d.ghost] ?? 0);
      if (d.kind === 'check') {
        if (d.team === 'killers' && chance(rng, 0.6)) {
          claims[d.target] = (claims[d.target] ?? 0) + 1.5;
          detectiveClaimed = d.to;
        } else if (d.team === 'faithful') {
          claims[d.target] = (claims[d.target] ?? 0) - 0.3;
        }
      }
    }
    if (killersAlive.length && chance(rng, 0.25)) {
      const fake = ranked.find((p) => !isKiller(p) && players[p].status === 'alive');
      if (fake) claims[fake] = (claims[fake] ?? 0) + 0.6;
    }

    let w = checkWin(players, roles);
    if (w) return { winner: w, cycle };

    banish(cycle, alive(), alive());
    w = checkWin(players, roles);
    if (w) return { winner: w, cycle };
  }

  // --- Endgame: survivors and ghosts vote; the living are the targets.
  for (let r = 0; r < ENDGAME_ROUNDS; r++) {
    const voters = Object.keys(players).filter((p) => ['alive', 'ghost'].includes(players[p].status));
    banish(CYCLES + 1 + r, voters, alive());
    const w = checkWin(players, roles);
    if (w === 'faithful') return { winner: w, cycle: CYCLES + 1 };
  }
  return { winner: checkWin(players, roles, { endgameDone: true }), cycle: CYCLES + 1 };
}

// ---------------------------------------------------------------------------
// Run

function run(n, ratios, label) {
  let faithfulWins = 0;
  for (let g = 0; g < GAMES; g++) {
    const { winner } = playGame(n, ratios, `${label}-${n}-${g}`);
    if (winner === 'faithful') faithfulWins++;
  }
  return faithfulWins / GAMES;
}

const pct = (x) => `${(x * 100).toFixed(0).padStart(3)}%`;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

if (args.n) {
  const n = Number(args.n);
  const ratios = {
    ...DEFAULT_RATIOS,
    ...(args.killers ? { killers: Number(args.killers) } : {}),
  };
  const rate = run(n, ratios, 'single');
  console.log(`n=${n} killers=${targetCounts(n, ratios).killer} faithful win ${pct(rate)} over ${GAMES} games`);
} else {
  const sizes = [16, 20, 25, 30, 35, 40, 45];
  const pers = [null, 2, 4];
  console.log(`Faithful win rate (${GAMES} games each, ${CYCLES} cycles, endgame ${ENDGAME_ROUNDS}, watchP ${config.watchP}, budget ${config.clueBudget})`);
  console.log(`${'players'.padEnd(8)}${pers.map((p) => (p ? `${p} killers` : 'default').padStart(16)).join('')}`);
  for (const n of sizes) {
    const cells = pers.map((per) => {
      const ratios = { ...DEFAULT_RATIOS, killers: per };
      return `${pct(run(n, ratios, `sweep${per}`))} (${targetCounts(n, ratios).killer}T)`.padStart(16);
    });
    console.log(`${String(n).padEnd(8)}${cells.join('')}`);
  }
}

if (VERBOSE || !args.n) {
  console.log('\nCandidates left after each night\'s heard true clues (median / p10 / p90):');
  for (const [c, xs] of Object.entries(stats.candAfter)) {
    const s = [...xs].sort((a, b) => a - b);
    console.log(`  night ${c}: ${median(xs)} / ${s[Math.floor(s.length * 0.1)]} / ${s[Math.floor(s.length * 0.9)]}`);
  }
  const shares = stats.factShare;
  const out = shares.filter((s) => s < 0.2 || s > 0.8).length;
  const buckets = [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1.01];
  console.log('\nShare of the room each fact fits:');
  for (let i = 0; i < buckets.length - 1; i++) {
    const k = shares.filter((s) => s >= buckets[i] && s < buckets[i + 1]).length;
    console.log(`  ${buckets[i].toFixed(2)}–${Math.min(1, buckets[i + 1]).toFixed(2)}  ${'#'.repeat(Math.round((k / shares.length) * 60))} ${pct(k / shares.length)}`);
  }
  console.log(`  facts outside 0.2–0.8: ${pct(out / shares.length)}; nights where heard clues named the hand outright: ${pct(stats.namedOutright / stats.nights)}`);
  console.log(`
Mornings where a Firewall held and the deep took the lowest score: ${stats.deep ?? 0} (a Killer ${stats.deepKiller ?? 0} times)`);
  console.log('\nBanishments that caught a Killer, by cycle:');
  for (const [c, k] of Object.entries(stats.banishByCycle)) {
    console.log(`  cycle ${c}: ${pct((stats.hitsByCycle[c] ?? 0) / k)}`);
  }
}

