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
 * DEEP BLUE's day: the night resolves when it locks, and that commit is the
 * dawn. The Killers' kill, every clue and the morning news land together
 * (stageDawn). The only night death is the Killers' vote (user's call,
 * 2026-10-15); the morning game kills nobody. The night's clue facts are kept
 * in secret.pendingTop for the game lock, where the day's top three each get
 * one (engine/morning.js topOfDay), told privately. There is no public board.
 *
 * The morning game rotates (engine/minigames.js): Word, Fake Artist, Pack the Bag. The
 * commit that opens dawn also picks the day's game and sends each guest
 * their word, after any recruit has answered, so a guest turned tonight gets
 * the Killers' hint, not the word. The game lock turns whatever the day
 * produced (clues and picks, drawings and guesses, or run scores) into one
 * score each, and topOfDay reads that the same way whatever the game.
 */

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc, getDocFromServer, getDocsFromServer, query, where, runTransaction, setDoc, updateDoc, writeBatch, deleteDoc, onSnapshot, arrayUnion,
} from 'firebase/firestore';
import { auth, authReady, db } from './app.js';
import { serverNow, measureOffset } from '../lib/clockSkew.js';
import { gameRef, sub, col } from './game.js';
import { TRAITS } from '../data/traits.js';
import { PLACES } from '../data/packItems.js';
import { DEFAULT_PACK_ID, packFor, dayKit } from '../data/packs/index.js';
import {
  PHASE, DEFAULT_DURATIONS, DEFAULT_CYCLES, ENDGAME_ROUNDS, phaseTiming, lockFor,
  ROLE, ROLE_INFO, teamOf, DEFAULT_RATIOS, targetCounts, dealRoles, assignLateJoiner,
  makeRng, freshSeed, resolveNight, resolveRecruit, topOfDay, DEFAULT_NIGHT_CONFIG,
  tallyBanish, breakTie, checkWin, applyLeaves, recruitNeed, fateRecruit,
  DEFAULT_GAMES, gameOfDay, introDay, pickWord, dealDrawWords, shownWord, scoreWordDay, scoreDrawDay,
  pickPlace, dealPack, scoreFakeDay, scorePackDay,
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

/** Every ghost's own true clue photos, keyed by pid: what a ghost may pass on at night (engine/night.js). */
async function ghostClues(gid) {
  const held = {};
  for (const d of (await getDocsFromServer(query(col(gid, 'inbox'), where('via', '==', 'ghost')))).docs) {
    const { to, fact } = d.data();
    if (to && fact) (held[to] ??= []).push(fact);
  }
  return held;
}

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
  // A player may have lost access to an old browser, but that browser can come
  // back online later. Keep exactly one binding for the pid so it cannot cast
  // a second vote or overwrite an action after the replacement phone is live.
  const existing = await getDocsFromServer(query(col(gid, 'bindings'), where('pid', '==', pid)));
  const batch = writeBatch(db);
  existing.forEach((binding) => {
    if (binding.id !== newUid) batch.delete(binding.ref);
  });
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
  // The first Word or Sketch morning's alarm rings longer: the tutorial plays in it.
  const intro = phase === PHASE.ALARM && introDay(game.config, cycle);
  return {
    phase,
    ...phaseTiming(phase, now, game.config?.durations ?? DEFAULT_DURATIONS, game.minigame ?? 'word', intro),
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
 * (who the Killers chose, who struck, who a Doctor saved, any frame). Only
 * written once there is a winner, so nothing here can spoil a live game.
 */
const finaleOf = (world) => ({
  finaleRoles: world.roles,
  finaleStory: clean({ nights: world.secret.nights ?? {}, hands: world.secret.hands ?? {} }),
});

/**
 * Dawn bookkeeping, in the commit that closes the night: deaths, leavers, win
 * check, and the morning news. `extra` rides along on the game doc (the day's game).
 */
function stageDawn(tx, gid, g, world, { deaths, publicDawn, recruited = false, extra = {} }) {
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
    ...extra,
    dawn,
    board: null,
    dayGame: null,
    news: arrayUnion({ kind: 'dawn', ...dawn, at: serverNow() }),
    winner: winner ?? null,
    ...(winner ? finaleOf(world) : {}),
  });
}

/**
 * Ghost sight: every clue the living got, and who got it, under the same
 * inbox ids (so each item shows in the same form on every phone,
 * os/evidence.js). Planted clues go in unmarked: a ghost catches a frame by
 * holding it against their own true photos. Rules: ghosts read it.
 */
const sightOf = (delivered, cycle, step) => delivered
  .map((d, i) => ({ ...d, id: `${cycle}-${step}-${i}` }))
  .filter((d) => d.kind === 'fact' && d.fact && d.via !== 'ghost')
  .map(({ id, to, fact, via, from, rank }) => clean({ id, to, fact, via: via ?? null, from, rank }));

/**
 * Written after its commit, outside the transaction, and allowed to fail: a
 * project whose rules predate ghost sight refuses it, and that must never
 * stop the game. Only by the device whose commit landed. `more` appends to
 * the day's doc (the top-three photos at the game lock).
 */
async function writeSight(gid, cycle, items, more = false) {
  const ref = sub(gid, 'ghostSight', String(cycle));
  const prior = more ? ((await getDocFromServer(ref).catch(() => null))?.data()?.items ?? []) : [];
  await setDoc(ref, { cycle, items: [...prior, ...items], at: Date.now() })
    .catch((e) => console.warn('ghostSight', e.code ?? e.message));
}

/** The split clues' pairs go live in the secret when their halves land. */
const pairsPatch = (pairs = {}) => Object.fromEntries(Object.entries(pairs).map(([id, p]) => [`pairs.${id}`, p]));

async function resolveNightPhase(gid) {
  await lock(gid, PHASE.NIGHT);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const [actions, den, held] = await Promise.all([actionsFor(gid, g.cycle), denFor(gid, g.cycle), ghostClues(gid)]);
  const res = resolveNight(nightCtx(gid, g, world, { actions, den, held }));
  // A recruit night picks the day's game after the answer, in the recruit commit.
  const day = res.recruit ? null : planDayGame(g, world);
  const delivered = res.recruit ? [] : clean(res.deliveries);
  const hand = res.hand ?? res.recruit?.hand ?? null;
  // The night as it really happened, kept for the finale's "how it happened".
  const night = clean({
    victim: res.victim ?? null,
    recruit: res.recruit?.target ?? null,
    hand,
    frame: res.frame ?? null,
    protectedList: res.protectedList ?? [],
  });
  // A win at this dawn publishes the finale from this world, so tonight must be in it.
  const after = { ...world, secret: { ...world.secret, nights: { ...world.secret.nights, [g.cycle]: night }, hands: { ...world.secret.hands, [g.cycle]: hand } } };

  const done = await commitOnce(gid, `${g.cycle}-night`, PHASE.NIGHT_LOCKED, (tx) => {
    const secretPatch = {
      ...res.secretPatch,
      recruitDue: false,
      [`hands.${g.cycle}`]: hand,
      [`nights.${g.cycle}`]: night,
      pendingRecruit: res.recruit ? clean({
        ...res.recruit, scourers: res.scourers, protectedList: res.protectedList, cycle: g.cycle,
        held: res.deliveries.filter((d) => d.kind !== 'recruitOffer'),
      }) : null,
      // The morning game's top three each get one of tonight's clues (morning.js).
      pendingTop: res.recruit ? null : { cycle: g.cycle, facts: clean(res.facts ?? []) },
      ...(res.recruit ? {} : pairsPatch(res.pairs)),
    };
    tx.update(sub(gid, 'secret', 'engine'), { ...secretPatch, ...(day?.secretPatch ?? {}) });
    for (const [pid, left] of Object.entries(res.secretPatch.checksLeft ?? {})) {
      if (left !== world.secret.checksLeft?.[pid]) tx.update(sub(gid, 'roles', pid), { checksLeft: left });
    }
    if (res.recruit) {
      // The recruit's offer has to reach them now; everything else waits for their answer.
      writeDeliveries(tx, gid, g.cycle, 'night', res.deliveries.filter((d) => d.kind === 'recruitOffer'));
      tx.update(gameRef(gid), timed(g, PHASE.RECRUIT));
      return;
    }
    writeDeliveries(tx, gid, g.cycle, 'night', delivered);
    writeDayGame(tx, gid, g.cycle, day);
    stageDawn(tx, gid, g, after, { deaths: res.deaths, publicDawn: res.publicDawn, extra: { minigame: day.kind } });
  });
  if (done && !res.recruit) await writeSight(gid, g.cycle, sightOf(delivered, g.cycle, 'night'));
  return done;
}

// --- The day's game ------------------------------------------------------------------

/**
 * Pick the day's game and its words. Words go to every guest still in the
 * game with a role, ghosts included (user's call, 2026-10-15: ghosts felt left
 * out), through their own inbox: the Faithful team gets the word and its hint,
 * the Killers the hint alone. A drawing day gives each guest their own word.
 * A ghost plays and scores too, but only the living can place in the top three (morning.js).
 *
 * @param rolePatch roles changed by tonight's recruit, not yet in `world`
 */
function planDayGame(g, world, rolePatch = {}) {
  const kind = gameOfDay(g.config, g.cycle);
  const roles = { ...world.roles, ...rolePatch };
  const living = Object.keys(world.players).filter((p) => ['alive', 'ghost'].includes(world.players[p].status) && roles[p]).sort();
  const kit = dayKit(packFor(g.packId));
  const { seed } = world.secret;
  if (kind === 'word' || kind === 'fake') {
    // Fake Artist draws from the same pairs as Word, and never repeats one Word used.
    const used = world.secret.wordsUsed ?? [];
    const pair = pickWord(seed, g.cycle, kit.wordPairs, used);
    return {
      kind,
      deliveries: living.map((pid) => (teamOf(roles[pid]) === 'killers'
        ? { to: pid, kind, hint: pair.hint }
        : { to: pid, kind, word: pair.word, hint: pair.hint })),
      secretPatch: { wordsUsed: [...used, pair.id], [`day.${g.cycle}`]: { kind, id: pair.id, word: pair.word, hint: pair.hint } },
    };
  }
  if (kind === 'pack') {
    const used = world.secret.placesUsed ?? [];
    const place = pickPlace(seed, g.cycle, PLACES, used);
    const items = dealPack(seed, g.cycle, place, PLACES);
    return {
      kind,
      deliveries: living.map((pid) => (teamOf(roles[pid]) === 'killers'
        ? { to: pid, kind, hint: place.hint, items }
        : { to: pid, kind, place: place.name, hint: place.hint, items })),
      secretPatch: { placesUsed: [...used, place.id], [`day.${g.cycle}`]: { kind, id: place.id, place: place.name, hint: place.hint, items, fits: place.items } },
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
 * guests' own; the word and drawing scores are computed here from the plays.
 */
async function dayScores(gid, g, world) {
  const day = world.secret.day?.[g.cycle];
  const kind = g.minigame ?? day?.kind ?? 'word';
  if (kind === 'word' && day?.word) {
    const [clues, picks] = await Promise.all([dayDocs(gid, 'clues', g.cycle), dayDocs(gid, 'picks', g.cycle)]);
    return { scores: scoreWordDay({ clues, picks, word: day.word }), reveal: { kind, cycle: g.cycle, word: day.word, hint: day.hint } };
  }
  if (kind === 'fake' && day?.word) {
    const drawings = await dayDocs(gid, 'drawings', g.cycle);
    return { scores: scoreFakeDay({ drawings, seed: world.secret.seed, cycle: g.cycle }), reveal: { kind, cycle: g.cycle, word: day.word, hint: day.hint } };
  }
  if (kind === 'pack' && day?.place) {
    const bags = await dayDocs(gid, 'bags', g.cycle);
    const opened = Object.fromEntries(Object.entries(bags).map(([pid, b]) => [pid, (b.items ?? []).filter((id) => day.items.includes(id)).slice(0, 3)]).filter(([, items]) => items.length));
    return {
      scores: scorePackDay({ bags, fits: day.fits, table: day.items }),
      reveal: { kind, cycle: g.cycle, place: day.place, hint: day.hint, items: day.items, fits: day.fits, bags: opened },
    };
  }
  if (kind === 'draw' && day?.words) {
    const [drawings, guesses] = await Promise.all([dayDocs(gid, 'drawings', g.cycle), dayDocs(gid, 'guesses', g.cycle)]);
    const shown = Object.fromEntries(Object.entries(day.words).map(([pid, w]) => [pid, shownWord(w)]));
    return { scores: scoreDrawDay({ drawings, guesses, words: day.words }), reveal: { kind, cycle: g.cycle, words: shown } };
  }
  return { scores: await dayDocs(gid, 'scores', g.cycle), reveal: { kind: 'run', cycle: g.cycle } };
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
  const delivered = clean([...(pending?.held ?? []), ...(res.deliveries ?? [])]);
  const victim = accepted ? null : res.victim ?? null;
  const nights = world.secret.nights ?? {};
  const after = { ...world, secret: { ...world.secret, nights: { ...nights, [g.cycle]: { ...(nights[g.cycle] ?? {}), victim } } } };

  const done = await commitOnce(gid, `${g.cycle}-recruit`, PHASE.RECRUIT_LOCKED, (tx) => {
    for (const [pid, role] of Object.entries(res.rolePatch)) {
      tx.set(sub(gid, 'roles', pid), { role, team: teamOf(role), dealtCycle: g.cycle, recruited: true });
      tx.set(sub(gid, 'killers', pid), { at: Date.now(), recruited: true });
    }
    tx.update(sub(gid, 'secret', 'engine'), {
      pendingRecruit: null,
      [`nights.${g.cycle}.victim`]: victim,
      pendingTop: { cycle: g.cycle, facts: clean(res.facts ?? []) },
      ...pairsPatch(res.pairs),
      ...day.secretPatch,
    });
    writeDeliveries(tx, gid, g.cycle, 'dawn', delivered);
    writeDayGame(tx, gid, g.cycle, day);
    stageDawn(tx, gid, g, after, { deaths: res.deaths, publicDawn: res.publicDawn, recruited: accepted, extra: { minigame: day.kind } });
  });
  if (done) await writeSight(gid, g.cycle, sightOf(delivered, g.cycle, 'dawn'));
  return done;
}

// --- The morning game ----------------------------------------------------------------

/** What the paper prints about the day's game: the reveal without the room's bags. */
const headline = ({ bags, items, fits, ...rest }) => rest; // eslint-disable-line no-unused-vars

/**
 * The day's game is over: read the scores, send the top three a clue photo,
 * and open daylight. Nobody dies here. `dayGame` is what the room may now see
 * about the game (the word, or who drew what); it goes in the paper too.
 */
async function resolveGamePhase(gid) {
  await lock(gid, PHASE.GAME);
  const g = (await getDocFromServer(gameRef(gid))).data();
  const world = await readWorld(gid);
  const { scores, reveal } = await dayScores(gid, g, world);
  const stash = world.secret.pendingTop;
  const facts = stash?.cycle === g.cycle ? stash.facts ?? [] : [];
  const { top, deliveries } = topOfDay({ seed: world.secret.seed, cycle: g.cycle, players: world.players, roles: world.roles, scores, facts });
  const delivered = clean(deliveries);

  const done = await commitOnce(gid, `${g.cycle}-morning`, PHASE.GAME_LOCKED, (tx) => {
    writeDeliveries(tx, gid, g.cycle, 'morning', delivered);
    tx.update(sub(gid, 'secret', 'engine'), { pendingTop: null, [`tops.${g.cycle}`]: top });
    tx.update(gameRef(gid), {
      ...timed(g, PHASE.INVESTIGATION),
      dayGame: clean(reveal),
      // The paper gets the headline only: a whole room's bags would bloat the game doc twice over.
      news: arrayUnion(clean({ ...headline(reveal), kind: 'day', game: reveal.kind, at: serverNow() })),
    });
  });
  if (done && delivered.length) await writeSight(gid, g.cycle, sightOf(delivered, g.cycle, 'morning'), true);
  return done;
}

// --- Split clues ---------------------------------------------------------------------

/**
 * A guest typed their partner's code to join a torn photo (joins/{pair}_{pid},
 * engine/clues.js splitHalves). The host checks it against the pair it kept
 * in the secret and, if it's right, sends the whole photo to both phones.
 * Runs on any host device; the transaction makes a second one a no-op.
 */
async function resolveJoin(gid, joinId) {
  const ref = sub(gid, 'joins', joinId);
  const secretRef = sub(gid, 'secret', 'engine');
  return runTransaction(db, async (tx) => {
    const join = (await tx.get(ref)).data();
    if (!join || join.ok != null) return;
    const pair = (await tx.get(secretRef)).data()?.pairs?.[join.pair];
    const side = pair ? (join.pid === pair.a ? 'a' : join.pid === pair.b ? 'b' : null) : null;
    const want = side === 'a' ? pair.codeB : side === 'b' ? pair.codeA : null;
    const ok = Boolean(want) && String(join.code ?? '').trim().toUpperCase() === want;
    if (ok && !pair.joined) {
      tx.update(secretRef, { [`pairs.${join.pair}.joined`]: true });
      for (const [to, from] of [[pair.a, pair.b], [pair.b, pair.a]]) {
        tx.set(sub(gid, 'inbox', `join-${join.pair}-${to}`), { to, kind: 'fact', via: 'join', from, pair: join.pair, fact: pair.fact, cycle: pair.cycle, step: 'join', at: Date.now() });
      }
    }
    tx.update(ref, { ok });
  });
}

/** The console keeps this open: every join a phone writes is checked once. */
export const watchJoins = (gid) =>
  listen(col(gid, 'joins'), (rows) => {
    for (const j of rows) if (j.ok == null) resolveJoin(gid, j.id).catch((e) => console.warn('[host] join', e.code ?? e.message));
  }, 'joins');

// --- Ballots -----------------------------------------------------------------------

function ballotShape(g, players) {
  const alive = Object.keys(players).filter((p) => players[p].status === 'alive');
  const ghosts = Object.keys(players).filter((p) => players[p].status === 'ghost');
  // Ghosts vote in every ballot (user's call, 2026-10-15); only the living can be
  // voted for. The vote is open: anyone may vote for any living guest.
  if (g.phase === PHASE.REVOTE_LOCKED) return { voters: [...alive, ...ghosts], targets: g.tied ?? [] };
  return { voters: [...alive, ...ghosts], targets: alive };
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
    case PHASE.DAWN:
      if (g.winner) return step(PHASE.DAWN, timed(g, PHASE.FINALE));
      return step(PHASE.DAWN, timed(g, PHASE.ALARM));
    case PHASE.ALARM:
      return step(PHASE.ALARM, timed(g, PHASE.GAME));
    case PHASE.GAME:
    case PHASE.GAME_LOCKED:
      return resolveGamePhase(gid);
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
