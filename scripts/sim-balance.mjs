#!/usr/bin/env node
/**
 * Balance simulator for Killers Night.
 *
 *   node scripts/sim-balance.mjs                    # sweep room sizes x killer ratios
 *   node scripts/sim-balance.mjs --n 35 --games 5000 --verbose
 *   node scripts/sim-balance.mjs --n 35 --watchP 0.5 --budget 2,2,2,3,3 --endgame 2
 *   node scripts/sim-balance.mjs --frame 2                 # the engine frames someone on night 2
 *   node scripts/sim-balance.mjs --witness off --last 0    # without the paper's witness or last words
 *   node scripts/sim-balance.mjs --lie 0.3 --sight 0.5     # Killers lie about clues; ghosts catch some
 *   node scripts/sim-balance.mjs --join 0.85 --split off   # torn photos joined less often, or off
 *   node scripts/sim-balance.mjs --ghostvote off   # ghosts sit out the Round Table (before 2026-10-15)
 *
 * Plays whole games with the real engine (src/lib/engine) and bot players:
 *
 *   Killers  murder a claimed Detective if one exists, otherwise at random;
 *             vote as a bloc for the most-suspected Faithful. Like the real
 *             phone, they send only a victim: the engine rotates the hand
 *             (night.js). No frame unless --frame is given.
 *   Faithful  pool every clue fragment (fragments reach several people, so
 *             the room hears them), work out who fits each night's clues,
 *             watch people they already suspect, and vote for the most
 *             suspicious guest with noise, because a real room is not a
 *             perfect Bayesian.
 *   Ghosts    a Faithful ghost passes one of its true clue photos to a
 *             random living guest (--pass, default 0.8 a night); a Faithful
 *             receiver shares it, so a missed or planted night gets a true clue.
 *             A Faithful guest killed in the night posts their true photo as
 *             last words (--last, default 0.7); the whole room sees it.
 *   The paper  prints one more true fact about the hand each murder night
 *             (night.js `witness`). Everyone reads it; nobody can lie about it.
 *   Night     (since the 15 Oct playtest) the Killers' pick dies when the
 *             night locks unless a Doctor protected them; the morning game
 *             kills nobody. Its top three living scorers each get one of the
 *             night's clues (morning.js topOfDay).
 *   Halves    (2026-10-15) a dig gives half a clue (clues.js splitHalves). A
 *             pair of Faithful holders find each other and join with
 *             probability `--join`; a pair with a Killer in it never joins.
 *   The vote  open every day (accusations were removed after the 15 Oct
 *             playtest): every living guest is on the ballot.
 *   Lies      with --lie p, a Killer who holds a clue nobody Faithful spoke
 *             for announces a false one instead. With --sight q a Faithful
 *             ghost (who sees every clue the living got) exposes the lie with
 *             probability q: the false clue is dropped and the liar suspected.
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
  makeRng, pick, chance, targetCounts, dealRoles, resolveNight, topOfDay, tallyBanish, breakTie,
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
const PASS_P = Number(args.pass ?? 0.8); // chance a Faithful ghost passes one of its true clue photos to a living guest (0 = never)
const LAST_P = Number(args.last ?? 0.7); // chance a Faithful guest killed in the night posts their true photo as last words
const LIE_P = Number(args.lie ?? 0); // chance a Killer holding an unspoken clue announces a false one
const SIGHT_P = Number(args.sight ?? 0); // chance a Faithful ghost exposes such a lie (ghost sight)
const JOIN_P = Number(args.join ?? 0.85); // chance two Faithful holders of a torn photo find each other
const GHOST_VOTE = args.ghostvote !== 'off'; // ghosts vote at every Round Table, not only the Endgame
const config = {
  ...DEFAULT_NIGHT_CONFIG,
  watchP: Number(args.watchP ?? DEFAULT_NIGHT_CONFIG.watchP),
  sizeStep: Number(args.step ?? DEFAULT_NIGHT_CONFIG.sizeStep),
  clueBudget: args.budget ? args.budget.split(',').map(Number) : DEFAULT_NIGHT_CONFIG.clueBudget,
  autoFrameFrom: args.frame ? Number(args.frame) : DEFAULT_NIGHT_CONFIG.autoFrameFrom, // --frame N: auto-frame on night N
  publicWitness: args.witness ? args.witness !== 'off' : DEFAULT_NIGHT_CONFIG.publicWitness,
  publicBand: args.publicBand ? args.publicBand.split(',').map(Number) : DEFAULT_NIGHT_CONFIG.publicBand,
  splitClues: args.split ? args.split !== 'off' : DEFAULT_NIGHT_CONFIG.splitClues,
};

// ---------------------------------------------------------------------------
// A plausible bar crowd. Weights are guesses at a Goa/Bombay Friday night;
// the sim reports how the actual split behaves, which is what matters.

const WEIGHTS = {
  top: {
    black: 26, white: 12, grey: 6, navy: 8, blue: 6, red: 5, pink: 4, maroon: 3, purple: 2,
    green: 3, olive: 3, yellow: 2, orange: 2, brown: 3, beige: 4, stripes: 4, checks: 4, print: 8,
  },
  glasses: { yes: 35, no: 65 },
  shoes: {
    sneakers: 34, canvas: 6, loafers: 6, shoes: 8, boots: 6, sandals: 10, slides: 9,
    kolhapuri: 4, crocs: 4, flats: 4, heels: 6, wedges: 3,
  },
  drink: {
    soju: 10, beer: 24, wine: 5, whitewine: 6, gin: 8, vodka: 7, rum: 6, whisky: 8, brandy: 2,
    tequila: 3, feni: 3, cocktail: 12, zero: 10, water: 3,
  },
  season: { q1: 25, q2: 25, q3: 25, q4: 25 },
  siblings: { only: 12, eldest: 35, middle: 15, youngest: 38 },
  pet: { none: 42, dog: 30, cat: 14, bird: 4, fish: 5, small: 3, reptile: 2 },
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
    hands: {},
  };

  const alive = () => Object.keys(players).filter((p) => players[p].status === 'alive').sort();
  // DEEP BLUE: everyone has a skill at the morning game. It decides who makes
  // the top three, who each get a clue photo.
  const skill = Object.fromEntries(Object.keys(players).map((p) => [p, 1 + rng() * 30]));
  const isKiller = (p) => roles[p] === ROLE.KILLER;

  // What the room collectively knows.
  const nights = []; // { cycle, facts: [...], pool: [...], explained: bool }
  const claims = {}; // pid -> suspicion weight from watch/detective claims
  const cleared = new Set(); // publicly confirmed Faithful (banished Faithful are dead anyway)
  let detectiveClaimed = null;
  const ghostHeld = {}; // ghost pid -> [{ fact, cycle }], their own true clue photos

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
    // Killers back the most-suspected Faithful on the ballot.
    const killerPick = faithfulTargets.sort((a, b) => scores[b] - scores[a])[0] ?? pick(targets, rng);
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
    const victim = detectiveClaimed && players[detectiveClaimed].status === 'alive' && chance(rng, 0.8)
      ? detectiveClaimed
      : pick(faithfulAlive, rng);
    for (const t of killersAlive) den[t] = { victim };

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
      } else if (chance(rng, 0.35)) {
        actions[p] = { kind: 'watch', target: pick(ranked.filter((q) => q !== p).slice(0, 8), rng) };
      } else {
        actions[p] = { kind: 'scour' };
      }
    }

    // --- Ghosts: a Faithful ghost passes a held photo to a random living guest.
    const passOrigin = {};
    for (const g of Object.keys(ghostHeld)) {
      if (players[g].status !== 'ghost' || isKiller(g) || !ghostHeld[g].length || !chance(rng, PASS_P)) continue;
      const h = pick(ghostHeld[g], rng);
      actions[g] = { kind: 'pass', target: pick(living, rng), fact: h.fact };
      passOrigin[g] = h.cycle;
    }
    const held = Object.fromEntries(Object.entries(ghostHeld).map(([g, list]) => [g, list.map((h) => h.fact)]));

    const out = resolveNight({ seed: gameSeed, cycle, players, roles, traitsByPid: traits, traitDefs: TRAITS, actions, den, secret, config, held });
    Object.assign(secret, out.secretPatch);
    secret.hands = { ...secret.hands, [cycle]: out.hand ?? null };
    // The night's kill lands at dawn, before the morning game.
    for (const d of out.deaths) players[d.pid].status = 'ghost';
    if (out.saved) stats.saved = (stats.saved ?? 0) + 1;
    const scores = Object.fromEntries(alive().filter(() => chance(rng, 0.95)).map((p) => [p, { best: Math.floor(skill[p] * (0.5 + rng() * 0.5)) }]));
    const top = topOfDay({ seed: gameSeed, cycle, players, roles, scores, facts: out.facts });
    const morning = { deaths: out.deaths, deliveries: [...out.deliveries, ...top.deliveries] };
    // Torn photos: a pair joins only if both halves are with Faithful guests who find each other.
    const joinedHolders = [];
    for (const p of Object.values(out.pairs ?? {})) {
      stats.pairs = (stats.pairs ?? 0) + 1;
      if (isKiller(p.a) || isKiller(p.b) || !chance(rng, JOIN_P)) continue;
      stats.joined = (stats.joined ?? 0) + 1;
      joinedHolders.push({ to: p.a, kind: 'fact', fact: p.fact }, { to: p.b, kind: 'fact', fact: p.fact });
    }
    for (const d of morning.deliveries) if (d.kind === 'fact' && d.via === 'ghost') (ghostHeld[d.to] ??= []).push({ fact: d.fact, cycle });

    // --- What reaches the room
    const pool = alive();
    const heard = [];
    const lies = [];
    const faithfulGhost = Object.keys(players).some((p) => players[p].status === 'ghost' && !isKiller(p));
    for (const f of out.facts) {
      // Searchers and the day's top three hold the night's clues.
      const holders = [...morning.deliveries, ...joinedHolders].filter((d) => d.kind === 'fact' && (!d.via || d.via === 'top') && d.fact.trait === f.trait && d.fact.group === f.group);
      const faithfulHolders = holders.filter((d) => !isKiller(d.to)).length;
      if (1 - (1 - SHARE_Q) ** faithfulHolders > rng()) {
        heard.push(f);
      } else {
        // Nobody Faithful spoke for it. A Killer who holds it may claim a false one.
        const liar = holders.find((d) => isKiller(d.to) && players[d.to].status === 'alive');
        const t = TRAITS.find((x) => x.id === f.trait);
        const wrong = t.groups.filter((g) => !g.members.includes(traits[out.hand]?.[f.trait]));
        if (liar && wrong.length && chance(rng, LIE_P)) {
          stats.lies = (stats.lies ?? 0) + 1;
          if (faithfulGhost && chance(rng, SIGHT_P)) {
            claims[liar.to] = (claims[liar.to] ?? 0) + 0.6;
            stats.liesCaught = (stats.liesCaught ?? 0) + 1;
          } else {
            lies.push({ trait: f.trait, group: pick(wrong, rng).id, planted: true });
          }
        }
      }
      stats.factShare.push(pool.filter((p) => fits(TRAITS, traits[p], f)).length / pool.length);
      stats.facts++;
    }
    heard.push(...lies);
    // The paper's witness: everyone reads it, and it is always true.
    if (out.witness) {
      heard.unshift(out.witness);
      stats.witness = (stats.witness ?? 0) + 1;
    }
    // Last words: a Faithful guest the Killers killed posts their true photo to the room.
    for (const d of morning.deaths) {
      const mine = morning.deliveries.find((x) => x.to === d.pid && x.kind === 'fact' && x.via === 'ghost');
      if (mine && !isKiller(d.pid) && chance(rng, LAST_P) && !heard.some((f) => f.trait === mine.fact.trait && f.group === mine.fact.group)) {
        heard.unshift(mine.fact);
        stats.lastWords = (stats.lastWords ?? 0) + 1;
      }
    }
    // A contradiction (nobody fits) tells the room one fact is a lie; they drop the newest.
    while (heard.length && candidatesFor(TRAITS, traits, pool, heard).length === 0) heard.pop();
    nights.push({ cycle, facts: heard, pool });
    // Passed photos: a Faithful receiver tells the room, and the clue joins the night it came from.
    for (const d of morning.deliveries) {
      if (d.via !== 'pass' || isKiller(d.to) || !chance(rng, SHARE_Q)) continue;
      const nt = nights.find((x) => x.cycle === passOrigin[d.from]);
      if (nt && !nt.facts.some((f) => f.trait === d.fact.trait && f.group === d.fact.group)) {
        nt.facts = nt.facts.filter((f) => f.trait !== d.fact.trait || !f.planted);
        nt.facts.push(d.fact);
        stats.passHeard = (stats.passHeard ?? 0) + 1;
      }
    }
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

    // The open vote: every living guest is on the ballot.
    const voters = Object.keys(players).filter((p) => players[p].status === 'alive' || (GHOST_VOTE && players[p].status === 'ghost'));
    banish(cycle, voters, alive());
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
Nights a Doctor saved the target (nobody died): ${stats.saved ?? 0}
Torn photos joined: ${stats.joined ?? 0} of ${stats.pairs ?? 0} pairs`);
  console.log(`Witnesses printed: ${stats.witness ?? 0} of ${stats.nights} murder nights; last words posted: ${stats.lastWords ?? 0}; Killer lies: ${stats.lies ?? 0} (caught by ghosts ${stats.liesCaught ?? 0})`);
  console.log('\nBanishments that caught a Killer, by cycle:');
  for (const [c, k] of Object.entries(stats.banishByCycle)) {
    console.log(`  cycle ${c}: ${pct((stats.hitsByCycle[c] ?? 0) / k)}`);
  }
}

