/**
 * The host device: the only writer of outcomes.
 *
 * Every phase that needs resolving goes through the same four beats:
 *
 *   1. lock     flip the phase to its *_locked twin. From this instant the
 *               rules refuse any new action or vote, so the inputs are frozen.
 *   2. read     fetch the frozen inputs from the server (never the cache: a
 *               stale cache would resolve a night on half its actions).
 *   3. resolve  run the pure engine (src/lib/engine). Seeded, so any host
 *               device computes the same outcome from the same inputs.
 *   4. write    one transaction that re-checks the phase and an idempotency
 *               marker (resolutions/<id>), then writes everything at once. A
 *               double tap, or a backup device re-running a crashed
 *               resolution, finds the marker and changes nothing.
 *
 * Inbox docs get deterministic ids for the same reason: a re-run overwrites
 * with identical content instead of duplicating a clue.
 *
 * DEEP BLUE splits a day in two. The night resolves when it locks, but its
 * deaths and deliveries are only *stashed* (secret.pendingMorning). The alarm
 * rings, the room plays the run, and when the game locks the host reads the
 * scores and resolveMorning decides who the board takes. That commit is the
 * dawn: deaths, the board and every held delivery land together, so no clue
 * arrives before the leaderboard does.
 *
 * The morning game rotates (engine/minigames.js): word, drawing, run. The
 * commit that rings the alarm also picks the day's game and sends each guest
 * their word, after any recruit has answered, so a guest turned tonight gets
 * the Killers' hint, not the word. The morning commit turns whatever the day
 * produced (clues and picks, drawings and guesses, or run scores) into one
 * score each, and resolveMorning reads that the same way whatever the game.
 */

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc, getDocFromServer, getDocsFromServer, query, where, runTransaction, setDoc, updateDoc, writeBatch, deleteDoc, onSnapshot, arrayUnion,
} from 'firebase/firestore';
import { auth, authReady, db } from './app.js';
import { serverNow, measureOffset } from '../lib/clockSkew.js';
import { gameRef, sub, col } from './game.js';
import { TRAITS } from '../data/traits.js';
import { DEFAULT_PACK_ID, packFor, dayKit } from '../data/packs/index.js';
import {
  PHASE, DEFAULT_DURATIONS, DEFAULT_CYCLES, ENDGAME_ROUNDS, phaseTiming, lockFor,
  ROLE, ROLE_INFO, teamOf, DEFAULT_RATIOS, targetCounts, dealRoles, assignLateJoiner,
  makeRng, freshSeed, resolveNight, resolveRecruit, resolveMorning, DEFAULT_NIGHT_CONFIG,
  tallyBanish, breakTie, checkWin, applyLeaves, recruitNeed, fateRecruit,
  DEFAULT_GAMES, gameOfDay, pickWord, dealDrawWords, shownWord, scoreWordDay, scoreDrawDay,
  planEvening, clockAtStart,
} from '../lib/engine/index.js';

// --- Auth ----------------------------------------------------------------------

export async function signInHost() {
  await authReady;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export const signOutHost = () => signOut(auth);

/** Measure the host clock against the server, via the lease doc only a host may write. */
export const syncHostClock = (gid) => measureOffset(sub(gid, 'hostLease', 'current'), { host: auth.currentUser?.email ?? '' });

// --- Live views (the console) -------------------------------------------------------
//
// Host-only reads. The rules refuse every one of these to a player.

// Self-healing, like the players' listeners (game.js): a console that silently
// stops hearing the room is worse than one that retries.
function listen(ref, cb, label) {
  let unsub = null;
  let timer = null;
  let stopped = false;
  let attempt = 0;
  const run = () => {
    unsub = onSnapshot(ref, (snap) => cb(snap.docs ? snap.docs.map((d) => ({ id: d.id, ...d.data() })) : snap.data() ?? null), (e) => {
      console.warn(`[host] ${label}:`, e.code ?? e.message);
      if (stopped) return;
      attempt += 1;
      timer = setTimeout(run, Math.min(10_000, 400 * 2 ** attempt));
    });
  };
  run();
  return () => {
    stopped = true;
    clearTimeout(timer);
    unsub?.();
  };
}

export const subscribeRoles = (gid, cb) => listen(col(gid, 'roles'), cb, 'roles');
/** Phones asking to be signed back in (game.js `knock`), oldest first. */
export const subscribeKnocks = (gid, cb) => listen(col(gid, 'knocks'), (rows) => cb(rows.sort((a, b) => a.at - b.at)), 'knocks');
export const subscribePresence = (gid, cb) => listen(col(gid, 'presence'), cb, 'presence');
export const subscribeSecret = (gid, cb) => listen(sub(gid, 'secret', 'engine'), cb, 'secret');
export const subscribeNightActions = (gid, cycle, cb) => listen(query(col(gid, 'actions'), where('cycle', '==', cycle)), cb, 'actions');
export const subscribeNightDen = (gid, cycle, cb) => listen(query(col(gid, 'den'), where('cycle', '==', cycle)), cb, 'den');
export const subscribeBallot = (gid, ballot, cb) => listen(query(col(gid, 'votes'), where('ballot', '==', ballot)), cb, 'votes');
export const subscribeScores = (gid, cycle, cb) => listen(query(col(gid, 'scores'), where('cycle', '==', cycle)), cb, 'scores');
/** One day's plays in a morning game's collection: clues, picks, drawings or guesses. */
export const subscribeDayPlays = (gid, name, cycle, cb) => listen(query(col(gid, name), where('cycle', '==', cycle)), cb, name);

// --- Reading everything ----------------------------------------------------------

const byId = (snap) => Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));

async function readWorld(gid) {
  const [players, roles, traits, secretSnap] = await Promise.all([
    getDocsFromServer(col(gid, 'players')),
    getDocsFromServer(col(gid, 'roles')),
    getDocsFromServer(col(gid, 'traits')),
    getDocFromServer(sub(gid, 'secret', 'engine')),
  ]);
  return {
    players: byId(players),
    roles: Object.fromEntries(Object.entries(byId(roles)).map(([pid, r]) => [pid, r.role])),
    traits: byId(traits),
    secret: secretSnap.exists() ? secretSnap.data() : {},
  };
}

const actionsFor = async (gid, cycle) =>
  Object.fromEntries((await getDocsFromServer(query(col(gid, 'actions'), where('cycle', '==', cycle)))).docs.map((d) => [d.data().pid, d.data()]));

const denFor = async (gid, cycle) =>
  Object.fromEntries((await getDocsFromServer(query(col(gid, 'den'), where('cycle', '==', cycle)))).docs
    .filter((d) => d.id !== 'meta')
    .map((d) => [d.data().pid, d.data()]));

/** One day's docs in `name` (scores, clues, picks, drawings, guesses), keyed by pid. */
const dayDocs = async (gid, name, cycle) =>
  Object.fromEntries((await getDocsFromServer(query(col(gid, name), where('cycle', '==', cycle)))).docs.map((d) => [d.data().pid, d.data()]));

// Firestore refuses `undefined` anywhere in a write; engine output may carry it.
const clean = (v) => JSON.parse(JSON.stringify(v ?? null));

const votesFor = async (gid, ballot) =>
  Object.fromEntries((await getDocsFromServer(query(col(gid, 'votes'), where('ballot', '==', ballot)))).docs.map((d) => [d.data().pid, d.data().target]));

// --- Setup -----------------------------------------------------------------------

/**
 * Start a fresh game and point every phone at it. Nothing old is deleted; a reset is just a new gid.
 *
 * `minutes` is how long the evening should run from the deal to the finale;
 * the open phases stretch to fit it and the game clock gets its speed
 * (engine/clock.js). Without it, `durations` are used as they are. Autopilot
 * starts on: the game clock runs the evening, the host only deals.
 */
export async function createGame({ packId = DEFAULT_PACK_ID, minutes = null, durations = DEFAULT_DURATIONS, cycles = DEFAULT_CYCLES, ratios = DEFAULT_RATIOS, games = DEFAULT_GAMES, autopilot = true } = {}) {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const gid = `g${stamp}-${Math.random().toString(36).slice(2, 6)}`;
  const plan = planEvening({ minutes, cycles, games, base: { ...DEFAULT_DURATIONS, ...durations } });
  await setDoc(gameRef(gid), {
    phase: PHASE.LOBBY,
    cycle: 0,
    packId,
    // Public on purpose: every phone builds the same run from it (os/game/course.js).
    courseSeed: freshSeed(),
    config: { durations: plan.durations, clock: plan.clock, minutes, cycles, ratios: { ...DEFAULT_RATIOS, ...ratios }, games: [...games] },
    autopilot,
    createdAt: Date.now(),
    phaseStartedAt: Date.now(),
    phaseEndsAt: 0,
    revealAt: 0,
    clockAt: null,
  });
  await setDoc(doc(db, 'meta', 'active'), { gameId: gid, at: Date.now() });
  return gid;
}

export const setAutopilot = (gid, on) => updateDoc(gameRef(gid), { autopilot: on });

export const updateConfig = (gid, config) => updateDoc(gameRef(gid), { config });

/** The morning games' rotation. Takes effect at the next alarm. */
export const setDayGames = (gid, games) => updateDoc(gameRef(gid), { 'config.games': [...games] });

/**
 * Before the deal: drop the guest entirely, binding included, so their phone
 * goes back to set-up and they can join again with new answers (the only way
 * answers change: the rules never let a guest edit them). After the deal: they
 * vanish at the next dawn.
 */
export async function removePlayer(gid, pid, phase) {
  if (phase === PHASE.LOBBY) {
    const bindings = await getDocsFromServer(query(col(gid, 'bindings'), where('pid', '==', pid)));
    const batch = writeBatch(db);
    batch.delete(sub(gid, 'players', pid));
    batch.delete(sub(gid, 'traits', pid));
    bindings.forEach((b) => batch.delete(b.ref));
    await batch.commit();
    return;
  }
  await updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: Date.now() });
}

export const cancelRemove = (gid, pid) => updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: null });

/**
 * Relink: a guest lost their session (cleared data, a new phone, the
 * home-screen app). Their new phone asks to be signed back in (a knock, with
 * its code); the host binds that uid to the old pid, and drops the knock and
 * any orphaned self-registration the new device may have made. Leaving is
 * final, so a guest who left (vanished) is never signed back in.
 */
export async function relink(gid, newUid, pid) {
  const batch = writeBatch(db);
  batch.set(sub(gid, 'bindings', newUid), { pid });
  batch.delete(sub(gid, 'knocks', newUid));
  await batch.commit();
  if (newUid !== pid) {
    await deleteDoc(sub(gid, 'players', newUid)).catch(() => {});
    await deleteDoc(sub(gid, 'traits', newUid)).catch(() => {});
  }
}

// --- Phase writes ----------------------------------------------------------------

/**
 * The fields that open `phase` now: its timing, and where the game clock
 * stands (engine/clock.js). `cycle` is the day being opened, for a night.
 */
function timed(game, phase, now = serverNow(), cycle = game.cycle) {
  return {
    phase,
    ...phaseTiming(phase, now, game.config?.durations ?? DEFAULT_DURATIONS, game.minigame ?? 'run'),
    clockAt: clockAtStart(game, phase, now, cycle),
  };
}

/**
 * Lock `from`. If the game is already sitting in the locked twin (a host that
 * crashed between lock and commit), carry on from there: re-running the
 * resolution is exactly the recovery, and commitOnce keeps it single.
 */
async function lock(gid, from) {
  const locked = lockFor(from);
  await runTransaction(db, async (tx) => {
    const g = (await tx.get(gameRef(gid))).data();
    if (g.phase === locked) return;
    if (g.phase !== from) throw new Error(`phase moved: expected ${from}, found ${g.phase}`);
    tx.update(gameRef(gid), { phase: locked });
  });
  return locked;
}

/**
 * Commit a resolution exactly once. `write(tx)` stages every write; it only
 * runs if the phase is still `expectPhase` and the marker is absent.
 */
async function commitOnce(gid, markerId, expectPhase, write) {
  return runTransaction(db, async (tx) => {
    const marker = await tx.get(sub(gid, 'resolutions', markerId));
    const g = (await tx.get(gameRef(gid))).data();
    if (marker.exists() || g.phase !== expectPhase) return false;
    write(tx, g);
    tx.set(sub(gid, 'resolutions', markerId), { at: Date.now() });
    return true;
  });
}

function writeDeliveries(tx, gid, cycle, step, deliveries) {
  deliveries.forEach((d, i) => {
    tx.set(sub(gid, 'inbox', `${cycle}-${step}-${i}`), { ...d, cycle, step, at: Date.now() });
  });
}

// --- Dealing ---------------------------------------------------------------------

/** Deal roles to everyone who has arrived. lobby → casting. */
export async function deal(gid) {
  const snapGame = (await getDocFromServer(gameRef(gid))).data();
  if (snapGame.phase !== PHASE.LOBBY) return false;
  const { players, traits } = await readWorld(gid);
  const pids = Object.keys(players).filter((p) => players[p].status === 'alive' && hasAllTraits(traits[p])).sort();
  if (pids.length < 4) throw new Error('At least 4 guests with answers are needed to deal.');

  const seed = freshSeed();
  const counts = targetCounts(pids.length, snapGame.config?.ratios);
  const roles = dealRoles(pids, counts, makeRng(seed, 'deal'));
  const checks = snapGame.config?.ratios?.detectiveChecks ?? DEFAULT_RATIOS.detectiveChecks;

  return commitOnce(gid, 'deal', PHASE.LOBBY, (tx, g) => {
    for (const pid of pids) {
      tx.set(sub(gid, 'roles', pid), {
        role: roles[pid], team: teamOf(roles[pid]), dealtCycle: 0,
        ...(roles[pid] === ROLE.DETECTIVE ? { checksLeft: checks } : {}),
      });
      if (roles[pid] === ROLE.KILLER) tx.set(sub(gid, 'killers', pid), { at: Date.now() });
    }
    tx.set(sub(gid, 'secret', 'engine'), {
      seed,
      counts,
      killerTarget: counts.killer,
      banishedKillers: 0,
      plantUsed: false,
      lastProtected: {},
      checksLeft: Object.fromEntries(pids.filter((p) => roles[p] === ROLE.DETECTIVE).map((p) => [p, checks])),
      hands: {},
      recruitDue: false,
      log: [{ at: Date.now(), what: 'deal', counts }],
    });
    tx.update(gameRef(gid), { ...timed(g, PHASE.CASTING), cycle: 0, dealtCount: pids.length });
  });
}

export const hasAllTraits = (t) => Boolean(t) && TRAITS.every((q) => typeof t[q.id] === 'string');

/** Deal a role to guests who arrived after casting. Always Faithful-team (see roles.js). */
export async function dealLateJoiners(gid, pids) {
  const { players, roles, traits, secret } = await readWorld(gid);
  const pending = pids.filter((p) => players[p]?.status === 'alive' && !roles[p] && hasAllTraits(traits[p]));
  if (!pending.length || !secret.seed) return;
  const g = (await getDocFromServer(gameRef(gid))).data();
  const batch = writeBatch(db);
  const next = { ...roles };
  const checksLeft = { ...(secret.checksLeft ?? {}) };
  for (const pid of pending.sort()) {
    const roomSize = Object.values(players).filter((p) => ['alive', 'ghost'].includes(p.status)).length;
    const role = assignLateJoiner(next, roomSize, g.config?.ratios, makeRng(secret.seed, 'late', pid));
    next[pid] = role;
    if (role === ROLE.DETECTIVE) checksLeft[pid] = g.config?.ratios?.detectiveChecks ?? DEFAULT_RATIOS.detectiveChecks;
    batch.set(sub(gid, 'roles', pid), {
      role, team: teamOf(role), dealtCycle: g.cycle ?? 0,
      ...(role === ROLE.DETECTIVE ? { checksLeft: checksLeft[pid] } : {}),
    });
  }
  batch.update(sub(gid, 'secret', 'engine'), { checksLeft });
  await batch.commit();
}

// --- Night -------------------------------------------------------------------------

/**
 * Open night `cycle`. Before it opens: if the Killers are short-handed for a
 * reason the room didn't earn (a Killer went home), mark a recruit night, or
 * turn someone directly if no Killer is left to choose.
 */
async function openNight(gid, from, cycle) {
  const { players, roles, secret } = await readWorld(gid);
  const need = recruitNeed(players, roles, secret);
  const fatePid = need === 'fate' ? fateRecruit(secret.seed, cycle, players, roles) : null;
  return runTransaction(db, async (tx) => {
    const g = (await tx.get(gameRef(gid))).data();
    // A double tap finds the night already open and changes nothing.
    if (g.phase !== from) return false;
    if (fatePid) {
      tx.set(sub(gid, 'roles', fatePid), { role: ROLE.KILLER, team: 'killers', dealtCycle: cycle, recruited: true });
      tx.set(sub(gid, 'killers', fatePid), { at: Date.now(), recruited: true });
      tx.set(sub(gid, 'inbox', `${cycle}-fate`), { to: fatePid, kind: 'recruited', cycle, step: 'fate', at: Date.now() });
    }
    tx.update(sub(gid, 'secret', 'engine'), { recruitDue: need === 'den' });
    // What the den needs to know tonight, readable by Killers only (rules: den/*).
    tx.set(sub(gid, 'den', 'meta'), { cycle, recruitDue: need === 'den', plantUsed: Boolean(secret.plantUsed) });
    tx.update(gameRef(gid), { ...timed(g, PHASE.NIGHT, serverNow(), cycle), cycle, ballot: null, tied: [], dawn: null, banish: null });
    return true;
  });
}

function nightCtx(gid, g, world, extra = {}) {
  return {
    seed: world.secret.seed,
    cycle: g.cycle,
    players: world.players,
    roles: world.roles,
    traitsByPid: world.traits,
    traitDefs: TRAITS,
    secret: world.secret,
    config: { ...DEFAULT_NIGHT_CONFIG, ...(g.config?.night ?? {}) },
    ...extra,
  };
}

/**
 * What the finale publishes: every role, and the true story of each night
 * (who the Killers chose, who struck, how they rigged it, any frame). Only
 * written once there is a winner, so nothing here can spoil a live game.
 */
const finaleOf = (world) => ({
  finaleRoles: world.roles,
  finaleStory: clean({ nights: world.secret.nights ?? {}, hands: world.secret.hands ?? {} }),
});

/** Dawn bookkeeping, at the end of the morning: deaths, leavers, the board, win check. */
function stageDawn(tx, gid, g, world, { deaths, publicDawn, recruited = false, board = null, dayGame = null }) {
  const players = structuredClone(world.players);
  for (const d of deaths) {
    players[d.pid].status = 'ghost';
    tx.update(sub(gid, 'players', d.pid), { status: 'ghost', cause: d.cause, diedCycle: g.cycle });
  }
  const vanished = applyLeaves(players);
  for (const pid of vanished) {
    players[pid].status = 'vanished';
    tx.update(sub(gid, 'players', pid), { status: 'vanished', vanishedCycle: g.cycle });
    tx.delete(sub(gid, 'killers', pid));
  }
  const winner = checkWin(players, world.roles);
  const dawn = clean({ cycle: g.cycle, ...publicDawn, vanished, recruited });
  tx.update(gameRef(gid), {
    ...timed(g, PHASE.DAWN),
    dawn,
    board: clean(board),
    dayGame: clean(dayGame),
    news: arrayUnion({ kind: 'dawn', ...dawn, top: board?.top ?? [], at: serverNow() }),
    winner: winner ?? null,
    ...(winner ? finaleOf(world) : {}),
  });
}

async function resolveNightPhase(gid) {
  await lock(gid, PHASE.NIGHT);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const [actions, den] = await Promise.all([actionsFor(gid, g.cycle), denFor(gid, g.cycle)]);
  const res = resolveNight(nightCtx(gid, g, world, { actions, den }));
  // A recruit night picks the day's game after the answer, in the recruit commit.
  const day = res.recruit ? null : planDayGame(g, world);

  return commitOnce(gid, `${g.cycle}-night`, PHASE.NIGHT_LOCKED, (tx) => {
    // The recruit's offer has to reach them now; everything else waits for the board.
    const offer = res.recruit ? res.deliveries.filter((d) => d.kind === 'recruitOffer') : [];
    writeDeliveries(tx, gid, g.cycle, 'night', offer);
    const secretPatch = {
      ...res.secretPatch,
      recruitDue: false,
      [`hands.${g.cycle}`]: res.hand ?? res.recruit?.hand ?? null,
      // The night as it really happened, kept for the finale's "how it happened".
      [`nights.${g.cycle}`]: clean({
        victim: res.victim ?? null,
        recruit: res.recruit?.target ?? null,
        hand: res.hand ?? res.recruit?.hand ?? null,
        rig: res.rig ?? null,
        frame: res.frame ?? null,
        protectedList: res.protectedList ?? [],
      }),
      pendingRecruit: res.recruit ? clean({
        ...res.recruit, scourers: res.scourers, protectedList: res.protectedList, cycle: g.cycle,
        held: res.deliveries.filter((d) => d.kind !== 'recruitOffer'),
      }) : null,
      pendingMorning: res.recruit ? null : pendingMorning(g.cycle, res),
    };
    tx.update(sub(gid, 'secret', 'engine'), { ...secretPatch, ...(day?.secretPatch ?? {}) });
    for (const [pid, left] of Object.entries(res.secretPatch.checksLeft ?? {})) {
      if (left !== world.secret.checksLeft?.[pid]) tx.update(sub(gid, 'roles', pid), { checksLeft: left });
    }
    if (day) writeDayGame(tx, gid, g.cycle, day);
    tx.update(gameRef(gid), { ...timed(g, res.recruit ? PHASE.RECRUIT : PHASE.ALARM), ...(day ? { minigame: day.kind } : {}) });
  });
}

// --- The day's game ------------------------------------------------------------------

/**
 * Pick the day's game and its words. Words go only to living guests with a
 * role, through their own inbox: the Faithful team gets the word and its hint,
 * the Killers the hint alone. A drawing day gives each guest their own word.
 * Ghosts get nothing to clue or draw; they watch the wall and guess drawings.
 *
 * @param rolePatch roles changed by tonight's recruit, not yet in `world`
 */
function planDayGame(g, world, rolePatch = {}) {
  const kind = gameOfDay(g.config, g.cycle);
  const roles = { ...world.roles, ...rolePatch };
  const living = Object.keys(world.players).filter((p) => world.players[p].status === 'alive' && roles[p]).sort();
  const kit = dayKit(packFor(g.packId));
  const { seed } = world.secret;
  if (kind === 'word') {
    const used = world.secret.wordsUsed ?? [];
    const pair = pickWord(seed, g.cycle, kit.wordPairs, used);
    return {
      kind,
      deliveries: living.map((pid) => (teamOf(roles[pid]) === 'killers'
        ? { to: pid, kind: 'word', hint: pair.hint }
        : { to: pid, kind: 'word', word: pair.word, hint: pair.hint })),
      secretPatch: { wordsUsed: [...used, pair.id], [`day.${g.cycle}`]: { kind, id: pair.id, word: pair.word, hint: pair.hint } },
    };
  }
  if (kind === 'draw') {
    const used = world.secret.drawUsed ?? [];
    const words = dealDrawWords(seed, g.cycle, living, kit.drawWords, used);
    return {
      kind,
      deliveries: living.map((pid) => ({ to: pid, kind: 'draw', word: words[pid] })),
      secretPatch: { drawUsed: [...used, ...Object.values(words)], [`day.${g.cycle}`]: { kind, words } },
    };
  }
  return { kind, deliveries: [], secretPatch: { [`day.${g.cycle}`]: { kind } } };
}

/** One inbox doc per guest per day, so a re-run overwrites instead of adding. */
function writeDayGame(tx, gid, cycle, day) {
  for (const d of day.deliveries) tx.set(sub(gid, 'inbox', `${cycle}-day-${d.to}`), { ...d, cycle, step: 'day', at: Date.now() });
}

/**
 * The day's scores, `{ pid: { best } }`, whatever the game, plus what the room
 * may now see about it (the word, or who drew what). Run scores are the
 * guests' own; the word and drawing boards are computed here from the plays.
 */
async function dayScores(gid, g, world) {
  const day = world.secret.day?.[g.cycle];
  const kind = g.minigame ?? day?.kind ?? 'run';
  if (kind === 'word' && day?.word) {
    const [clues, picks] = await Promise.all([dayDocs(gid, 'clues', g.cycle), dayDocs(gid, 'picks', g.cycle)]);
    return { scores: scoreWordDay({ clues, picks, word: day.word }), reveal: { kind, cycle: g.cycle, word: day.word, hint: day.hint } };
  }
  if (kind === 'draw' && day?.words) {
    const [drawings, guesses] = await Promise.all([dayDocs(gid, 'drawings', g.cycle), dayDocs(gid, 'guesses', g.cycle)]);
    const shown = Object.fromEntries(Object.entries(day.words).map(([pid, w]) => [pid, shownWord(w)]));
    return { scores: scoreDrawDay({ drawings, guesses, words: day.words }), reveal: { kind, cycle: g.cycle, words: shown } };
  }
  return { scores: await dayDocs(gid, 'scores', g.cycle), reveal: { kind: 'run', cycle: g.cycle } };
}

/** What the morning needs from the night, stashed where only the host can read it. */
function pendingMorning(cycle, res, extra = {}) {
  return clean({
    cycle,
    victim: res.victim ?? null,
    saved: Boolean(res.saved),
    protectedList: res.protectedList ?? [],
    rig: res.rig ?? 'zero',
    facts: res.facts ?? [],
    trueFacts: res.trueFacts ?? [],
    deliveries: res.deliveries ?? [],
    publicDawn: res.publicDawn ?? { victims: [], attempted: null },
    recruited: false,
    ...extra,
  });
}

async function resolveRecruitPhase(gid) {
  await lock(gid, PHASE.RECRUIT);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const pending = world.secret.pendingRecruit;
  const answer = pending ? (await actionsFor(gid, g.cycle))[pending.target] : null;
  // Silence is refusal: a target who never answers is treated as saying no.
  const accepted = answer?.kind === 'recruitAnswer' && answer.accept === true;
  const res = pending
    ? resolveRecruit(nightCtx(gid, g, world), { ...pending, accepted })
    : { rolePatch: {}, deaths: [], deliveries: [], publicDawn: { victims: [], attempted: null } };
  const day = planDayGame(g, world, res.rolePatch);

  return commitOnce(gid, `${g.cycle}-recruit`, PHASE.RECRUIT_LOCKED, (tx) => {
    for (const [pid, role] of Object.entries(res.rolePatch)) {
      tx.set(sub(gid, 'roles', pid), { role, team: teamOf(role), dealtCycle: g.cycle, recruited: true });
      tx.set(sub(gid, 'killers', pid), { at: Date.now(), recruited: true });
    }
    tx.update(sub(gid, 'secret', 'engine'), {
      pendingRecruit: null,
      pendingMorning: pendingMorning(g.cycle, { ...res, rig: pending?.rig }, {
        victim: accepted ? null : res.victim ?? null,
        protectedList: res.protectedList ?? pending?.protectedList ?? [],
        deliveries: [...(pending?.held ?? []), ...(res.deliveries ?? [])],
        recruited: accepted,
      }),
      ...day.secretPatch,
    });
    writeDayGame(tx, gid, g.cycle, day);
    tx.update(gameRef(gid), { ...timed(g, PHASE.ALARM), minigame: day.kind });
  });
}

// --- The morning ---------------------------------------------------------------------

/** The run is over: read the scores, let the board take someone, and open dawn. */
async function resolveMorningPhase(gid) {
  await lock(gid, PHASE.GAME);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const { scores, reveal } = await dayScores(gid, g, world);
  const stash = world.secret.pendingMorning;
  const pending = stash?.cycle === g.cycle ? stash : {};
  const res = resolveMorning({ seed: world.secret.seed, cycle: g.cycle, players: world.players, roles: world.roles, scores, pending });

  return commitOnce(gid, `${g.cycle}-morning`, PHASE.GAME_LOCKED, (tx) => {
    writeDeliveries(tx, gid, g.cycle, 'morning', clean(res.deliveries));
    tx.update(sub(gid, 'secret', 'engine'), { pendingMorning: null });
    stageDawn(tx, gid, g, world, {
      deaths: res.deaths,
      publicDawn: res.publicDawn,
      recruited: Boolean(pending.recruited),
      board: { cycle: g.cycle, kind: reveal.kind, rows: res.board, ghosts: res.ghostBoard, top: res.top },
      dayGame: reveal,
    });
  });
}

// --- Ballots -----------------------------------------------------------------------

function ballotShape(g, players) {
  const alive = Object.keys(players).filter((p) => players[p].status === 'alive');
  const ghosts = Object.keys(players).filter((p) => players[p].status === 'ghost');
  if (g.phase === PHASE.ENDGAME_LOCKED) return { voters: [...alive, ...ghosts], targets: alive };
  if (g.phase === PHASE.REVOTE_LOCKED) return { voters: alive, targets: g.tied ?? [] };
  return { voters: alive, targets: alive };
}

async function resolveBallotPhase(gid, from) {
  await lock(gid, from);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const votes = await votesFor(gid, g.ballot);
  const { voters, targets } = ballotShape(g, world.players);
  const { pid: winnerPid, tally, cast, tied } = tallyBanish(votes, voters, targets);

  const expect = lockFor(from);
  return commitOnce(gid, `${g.ballot}-ballot`, expect, (tx) => {
    // An ordinary Round Table that ties goes to one short re-vote between the tied.
    if (tied.length && from === PHASE.ROUNDTABLE) {
      tx.update(gameRef(gid), { ...timed(g, PHASE.REVOTE), ballot: `${g.ballot}-re`, tied, lastTally: tally });
      return;
    }
    const banished = winnerPid ?? (tied.length ? breakTie(world.secret.seed, g.ballot, tied) : null);
    const players = structuredClone(world.players);
    let team = null;
    if (banished) {
      players[banished].status = 'ghost';
      team = teamOf(world.roles[banished]);
      tx.update(sub(gid, 'players', banished), {
        status: 'ghost', cause: 'banished', diedCycle: g.cycle, revealedRole: world.roles[banished],
      });
      if (team === 'killers') {
        tx.update(sub(gid, 'secret', 'engine'), { banishedKillers: (world.secret.banishedKillers ?? 0) + 1 });
        tx.delete(sub(gid, 'killers', banished));
      }
    }
    const endgameRound = g.endgameRound ?? 0;
    const endgameDone = from === PHASE.ENDGAME && endgameRound >= (g.config?.endgameRounds ?? ENDGAME_ROUNDS);
    const winner = checkWin(players, world.roles, { endgameDone });
    // Round Table votes are shown after the reveal, as on the show.
    const shown = Object.fromEntries(Object.entries(votes).filter(([v, t]) => voters.includes(v) && targets.includes(t)));
    tx.update(gameRef(gid), {
      ...timed(g, PHASE.BANISH),
      news: arrayUnion({ kind: 'banish', cycle: g.cycle, ballot: g.ballot, pid: banished ?? null, team, endgame: from === PHASE.ENDGAME, at: serverNow() }),
      banish: { pid: banished, team, role: banished ? ROLE_INFO[world.roles[banished]]?.label : null, tally, cast, votes: shown, fromTie: !winnerPid && Boolean(banished) },
      tied: [],
      winner: winner ?? null,
      ...(winner ? finaleOf(world) : {}),
    });
  });
}

// --- The one button ----------------------------------------------------------------

/**
 * Move the evening on by one beat, whatever the phase. Safe to call twice:
 * every resolving step is guarded by a lock and a marker, and plain steps
 * check the phase they expect in a transaction.
 */
export async function advance(gid) {
  const g = (await getDocFromServer(gameRef(gid))).data();
  const cycles = g.config?.cycles ?? DEFAULT_CYCLES;
  const endgameRounds = g.config?.endgameRounds ?? ENDGAME_ROUNDS;

  const step = async (from, patch) =>
    runTransaction(db, async (tx) => {
      const cur = (await tx.get(gameRef(gid))).data();
      if (cur.phase !== from) return false;
      tx.update(gameRef(gid), patch);
      return true;
    });

  switch (g.phase) {
    case PHASE.LOBBY:
      return deal(gid);
    case PHASE.CASTING:
      return openNight(gid, PHASE.CASTING, 1);
    case PHASE.NIGHT:
    case PHASE.NIGHT_LOCKED:
      return resolveNightPhase(gid);
    case PHASE.RECRUIT:
    case PHASE.RECRUIT_LOCKED:
      return resolveRecruitPhase(gid);
    case PHASE.ALARM:
      return step(PHASE.ALARM, timed(g, PHASE.GAME));
    case PHASE.GAME:
    case PHASE.GAME_LOCKED:
      return resolveMorningPhase(gid);
    case PHASE.DAWN:
      if (g.winner) return step(PHASE.DAWN, timed(g, PHASE.FINALE));
      return step(PHASE.DAWN, timed(g, PHASE.INVESTIGATION));
    case PHASE.INVESTIGATION:
      return step(PHASE.INVESTIGATION, { ...timed(g, PHASE.ROUNDTABLE), ballot: `c${g.cycle}`, tied: [] });
    case PHASE.ROUNDTABLE:
    case PHASE.REVOTE:
    case PHASE.ENDGAME:
      return resolveBallotPhase(gid, g.phase);
    case PHASE.ROUNDTABLE_LOCKED:
      return resolveBallotPhase(gid, PHASE.ROUNDTABLE);
    case PHASE.REVOTE_LOCKED:
      return resolveBallotPhase(gid, PHASE.REVOTE);
    case PHASE.ENDGAME_LOCKED:
      return resolveBallotPhase(gid, PHASE.ENDGAME);
    case PHASE.BANISH: {
      if (g.winner) return step(PHASE.BANISH, timed(g, PHASE.FINALE));
      const round = g.endgameRound ?? 0;
      if (round > 0 && round >= endgameRounds) {
        const world = await readWorld(gid);
        return step(PHASE.BANISH, { ...timed(g, PHASE.FINALE), winner: checkWin(world.players, world.roles, { endgameDone: true }), ...finaleOf(world) });
      }
      if (round > 0 || g.cycle >= cycles) {
        return step(PHASE.BANISH, { ...timed(g, PHASE.ENDGAME), endgameRound: round + 1, ballot: `e${round + 1}`, tied: [] });
      }
      return openNight(gid, PHASE.BANISH, g.cycle + 1);
    }
    default:
      return false;
  }
}

/** Host overrides. Each is a plain write; the console asks for confirmation first. */
export const forceStatus = (gid, pid, status) => updateDoc(sub(gid, 'players', pid), { status, cause: 'host' });

export const extendPhase = (gid, ms) =>
  runTransaction(db, async (tx) => {
    const g = (await tx.get(gameRef(gid))).data();
    if (!g.phaseEndsAt) return;
    tx.update(gameRef(gid), { phaseEndsAt: Math.max(Date.now(), g.phaseEndsAt) + ms });
  });

export const endPhaseNow = (gid) => updateDoc(gameRef(gid), { phaseEndsAt: Date.now() });
