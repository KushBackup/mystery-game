/**
 * Everything a player's phone reads and writes.
 *
 * A player writes only their own things (arrival, one action per night, one
 * vote per ballot, chat) and never an outcome. The host device (host.js)
 * writes every outcome. The rules in firestore.rules enforce the split; this
 * file just follows it.
 *
 * Each subscription is one listener, and each helper returns its unsubscribe.
 * Keep it that way: a second onSnapshot over the same query is a second read
 * stream on 40 phones (see Lessons.md on the chat channel).
 */

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  doc, collection, query, where, orderBy, limit, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, addDoc,
} from 'firebase/firestore';
import { auth, authReady, db } from './app.js';
import { measureOffset } from '../lib/clockSkew.js';

// --- Paths -------------------------------------------------------------------

export const gameRef = (gid) => doc(db, 'games', gid);
export const sub = (gid, ...path) => doc(db, 'games', gid, ...path);
export const col = (gid, name) => collection(db, 'games', gid, name);

// --- Auth ----------------------------------------------------------------------

/** Calls back with the Firebase user (or null) whenever it changes. */
export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function ensureAnonymous() {
  await authReady;
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}

// --- Subscriptions -----------------------------------------------------------

const docData = (snap) => (snap.exists() ? { id: snap.id, ...snap.data() } : null);
const listData = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// A Firestore write can sit in the offline queue long after the phone has
// updated optimistically. Surface its server acknowledgement in PhoneFrame so
// a guest never mistakes a refused vote or night move for a saved one.
let writeState = null;
let writeTimer = null;
let visibleWrites = 0;
const writeListeners = new Set();
const setWriteState = (next, clearAfter = 0) => {
  writeState = next;
  clearTimeout(writeTimer);
  if (clearAfter) {
    writeTimer = setTimeout(() => {
      setWriteState(visibleWrites ? 'saving' : null);
    }, clearAfter);
  }
  writeListeners.forEach((listener) => listener());
};

export const subscribeWriteState = (listener) => {
  writeListeners.add(listener);
  return () => writeListeners.delete(listener);
};
export const getWriteState = () => writeState;

const failedStreams = new Set();
const streamListeners = new Set();
const notifyStreams = () => streamListeners.forEach((listener) => listener());
const markStreamFailed = (token) => {
  if (failedStreams.has(token)) return;
  failedStreams.add(token);
  notifyStreams();
};
const markStreamReady = (token) => {
  if (!failedStreams.delete(token)) return;
  notifyStreams();
};
export const subscribeStreamState = (listener) => {
  streamListeners.add(listener);
  return () => streamListeners.delete(listener);
};
export const getStreamState = () => (failedStreams.size ? 'reconnecting' : null);

const trackWrite = (promise, { quiet = false } = {}) => {
  if (!quiet) {
    visibleWrites += 1;
    setWriteState('saving');
  }
  return promise.then(
    (value) => {
      if (!quiet) {
        visibleWrites -= 1;
        if (visibleWrites === 0 && writeState !== 'failed') setWriteState('saved', 1600);
      }
      return value;
    },
    (error) => {
      if (!quiet) visibleWrites -= 1;
      setWriteState('failed', 5000);
      throw error;
    },
  );
};

/**
 * A listener that heals itself. If Firestore refuses or drops it (a rule that
 * isn't satisfied *yet*, a wifi blip), it retries with backoff instead of
 * dying quietly. A dead listener is the worst failure at an event: the phone
 * looks fine and simply stops hearing the game. `start(onError)` begins one
 * listen and returns its unsubscribe.
 */
function resilient(label, start) {
  let unsub = null;
  let timer = null;
  let stopped = false;
  let attempt = 0;
  const token = Symbol(label);
  const run = () => {
    unsub = start((err) => {
      console.warn(`[killers] ${label}:`, err.code ?? err.message);
      markStreamFailed(token);
      unsub = null;
      if (stopped) return;
      attempt += 1;
      timer = setTimeout(run, Math.min(10_000, 400 * 2 ** attempt));
    }, () => markStreamReady(token));
  };
  run();
  return () => {
    stopped = true;
    clearTimeout(timer);
    unsub?.();
    markStreamReady(token);
  };
}

const watchDoc = (label, ref, cb) => resilient(label, (onError, onReady) =>
  onSnapshot(ref, (s) => { onReady(); cb(docData(s)); }, onError));
const watchList = (label, q, cb, filter = () => true) =>
  resilient(label, (onError, onReady) =>
    onSnapshot(q, (s) => { onReady(); cb(listData(s).filter(filter)); }, onError));

export const subscribeActive = (cb) =>
  resilient('meta/active', (onError, onReady) =>
    onSnapshot(doc(db, 'meta', 'active'), (s) => { onReady(); cb(s.exists() ? s.data().gameId ?? null : null); }, onError));

export const subscribeGame = (gid, cb) => watchDoc('game', gameRef(gid), cb);

/**
 * The binding decides whether this phone is a guest yet. Only a binding the
 * server has *committed* counts: the local, still-pending copy of a fresh
 * arrival would mount the game screens a beat early, and their listeners,
 * which the rules check against that binding, would reach the server
 * before it exists and be refused.
 */
export const subscribeBinding = (gid, uid, cb) =>
  resilient('binding', (onError, onReady) =>
    onSnapshot(sub(gid, 'bindings', uid), { includeMetadataChanges: true }, (s) => {
      onReady();
      if (s.metadata.hasPendingWrites) return;
      cb(s.exists() ? s.data().pid : null);
    }, onError));

export const subscribePlayers = (gid, cb) => watchList('players', col(gid, 'players'), cb);
export const subscribeMyRole = (gid, pid, cb) => watchDoc('role', sub(gid, 'roles', pid), cb);
export const subscribeMyTraits = (gid, pid, cb) => watchDoc('traits', sub(gid, 'traits', pid), cb);
/** Every guest's arrival answers, as { pid: answers }. Public; written once at arrival, never edited. */
export const subscribeAllTraits = (gid, cb) =>
  resilient('traits', (onError, onReady) =>
    onSnapshot(col(gid, 'traits'), (s) => { onReady(); cb(Object.fromEntries(s.docs.map((d) => [d.id, d.data()]))); }, onError));
export const subscribeInbox = (gid, pid, cb) => watchList('inbox', query(col(gid, 'inbox'), where('to', '==', pid)), cb);
export const subscribeMyAction = (gid, cycle, pid, cb) => watchDoc('action', sub(gid, 'actions', `${cycle}_${pid}`), cb);
export const subscribeMyVote = (gid, ballot, pid, cb) => watchDoc('vote', sub(gid, 'votes', `${ballot}_${pid}`), cb);
export const subscribeMyScore = (gid, cycle, pid, cb) => watchDoc('score', sub(gid, 'scores', `${cycle}_${pid}`), cb);

// Killer-only. The rules deny these to everyone else, so only mount them for a Killer.
/** The Killers' group, Killer-only: `[{ id, at, recruited }]`. `at` is when DEEP BLUE added them. */
export const subscribeKillers = (gid, cb) =>
  resilient('killers', (onError, onReady) =>
    onSnapshot(col(gid, 'killers'), (s) => { onReady(); cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))); }, onError));
export const subscribeDen = (gid, cycle, cb) =>
  watchList('den', query(col(gid, 'den'), where('cycle', '==', cycle)), cb, (d) => d.id !== 'meta');
/** Tonight's den status: is it a recruit night, is the frame spent. Killer-only. */
export const subscribeDenMeta = (gid, cb) => watchDoc('den meta', sub(gid, 'den', 'meta'), cb);

/** One channel: 'chat', 'denChat' or 'spiritsChat'. Newest 100, returned oldest-first. */
export const subscribeChannel = (gid, channel, cb) =>
  resilient(channel, (onError, onReady) =>
    onSnapshot(query(col(gid, channel), orderBy('at', 'desc'), limit(100)), (s) => { onReady(); cb(listData(s).reverse()); }, onError));

// --- Writes --------------------------------------------------------------------

/**
 * Arrive: bind this device, register the guest, store their answers. One batch,
 * so a guest never half-exists (a player with no traits can't be clued).
 */
export async function arrive(gid, uid, { name, traits }) {
  const batch = writeBatch(db);
  batch.set(sub(gid, 'bindings', uid), { pid: uid });
  batch.set(sub(gid, 'players', uid), { name: name.trim().slice(0, 24), status: 'alive', joinedAt: Date.now() });
  batch.set(sub(gid, 'traits', uid), { ...traits });
  await trackWrite(batch.commit());
}

/**
 * Leave before the game starts: this guest is gone entirely (binding, player,
 * answers), so the phone goes back to set-up and they can join again as a new
 * guest. Answers are written once at arrival and never edited (firestore.rules),
 * so this, or the host removing them, is the only way to change them. After
 * the deal, leaving is `requestLeave`: they vanish at the next dawn.
 */
export async function leaveBeforeStart(gid, uid, pid) {
  const batch = writeBatch(db);
  batch.delete(sub(gid, 'players', pid));
  batch.delete(sub(gid, 'traits', pid));
  batch.delete(sub(gid, 'bindings', uid));
  await trackWrite(batch.commit());
}

export const submitAction = (gid, cycle, pid, action) =>
  trackWrite(setDoc(sub(gid, 'actions', `${cycle}_${pid}`), { ...action, pid, cycle, at: serverTimestamp() }));

export const submitDen = (gid, cycle, pid, choice) =>
  trackWrite(setDoc(sub(gid, 'den', `${cycle}_${pid}`), { ...choice, pid, cycle, at: serverTimestamp() }, { merge: true }));

/**
 * Accuse one guest today, once (rules: accusations). `clue` is an optional
 * photo from your own inbox, shown to the room as your reason.
 */
export const accuse = (gid, cycle, pid, target, clue = null) =>
  trackWrite(setDoc(sub(gid, 'accusations', `${cycle}_${pid}`), {
    pid, cycle, target, at: serverTimestamp(),
    ...(clue ? { inboxId: clue.id, fact: { trait: clue.fact.trait, group: clue.fact.group } } : {}),
  }));

/** Second someone's accusation today, once (rules: seconds). */
export const second = (gid, cycle, pid, accuser) =>
  trackWrite(setDoc(sub(gid, 'seconds', `${cycle}_${pid}`), { pid, cycle, accuser, at: serverTimestamp() }));

export const submitVote = (gid, ballot, pid, target) =>
  trackWrite(setDoc(sub(gid, 'votes', `${ballot}_${pid}`), { target, pid, ballot, at: serverTimestamp() }));

/** A new best for today's run. Only ever called with a higher score (the rules refuse a lower one). */
export const submitScore = (gid, cycle, pid, best, runs) =>
  trackWrite(setDoc(sub(gid, 'scores', `${cycle}_${pid}`), { pid, cycle, best, runs, at: Date.now() }), { quiet: true });

// --- The morning games (lib/engine/minigames.js). One doc per guest per day. -----------

/** One day's docs in a public morning-game collection (`clues`, `drawings`), oldest first. */
export const subscribeDayWall = (gid, name, cycle, cb) =>
  watchList(name, query(col(gid, name), where('cycle', '==', cycle)), (list) =>
    cb(list.sort((a, b) => (a.at?.toMillis?.() ?? Infinity) - (b.at?.toMillis?.() ?? Infinity))));
/** This guest's own doc in a private one (`picks`, `guesses`). */
export const subscribeMyPlay = (gid, name, cycle, pid, cb) => watchDoc(name, sub(gid, name, `${cycle}_${pid}`), cb);

/** Post your one clue. Once: the rules refuse an edit, so the wall's order is the order they landed. */
export const postClue = (gid, cycle, pid, clue) =>
  trackWrite(setDoc(sub(gid, 'clues', `${cycle}_${pid}`), { pid, cycle, clue: clue.trim().slice(0, 20), at: serverTimestamp() }));

export const savePicks = (gid, cycle, pid, picks) =>
  trackWrite(setDoc(sub(gid, 'picks', `${cycle}_${pid}`), { pid, cycle, picks: picks.slice(0, 3), at: Date.now() }), { quiet: true });

export const saveDrawing = (gid, cycle, pid, strokes, checks) =>
  trackWrite(setDoc(sub(gid, 'drawings', `${cycle}_${pid}`), { pid, cycle, strokes, checks, at: serverTimestamp() }), { quiet: true });

export const saveGuesses = (gid, cycle, pid, answers) =>
  trackWrite(setDoc(sub(gid, 'guesses', `${cycle}_${pid}`), { pid, cycle, answers, at: Date.now() }), { quiet: true });

/** Ghost sight: one doc per night, every clue the living got (rules: ghosts only). */
export const subscribeGhostSight = (gid, cb) =>
  resilient('ghostSight', (onError, onReady) =>
    onSnapshot(col(gid, 'ghostSight'), (s) => { onReady(); cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))); }, onError));

/** Last words: a guest taken this morning posts one true clue photo to the room, once (rules: lastWords). */
/**
 * Join a torn photo (engine/clues.js splitHalves): type the code shown on your
 * partner's phone. The host checks it and sends both of you the whole photo.
 */
export const joinHalf = (gid, pair, pid, code) =>
  trackWrite(setDoc(sub(gid, 'joins', `${pair}_${pid}`), { pid, pair, code: code.trim().toUpperCase().slice(0, 6), at: serverTimestamp() }));
/** Your join attempt for one pair: `ok` once the host has checked it. */
export const subscribeMyJoin = (gid, pair, pid, cb) => watchDoc('join', sub(gid, 'joins', `${pair}_${pid}`), cb);

export const postLastWords = (gid, pid, name, clue) =>
  trackWrite(setDoc(sub(gid, 'chat', `last_${pid}`), {
    kind: 'last', pid, name, inboxId: clue.id, fact: { trait: clue.fact.trait, group: clue.fact.group }, at: Date.now(),
  }));

export const sendToChannel =(gid, channel, pid, name, text) =>
  trackWrite(addDoc(col(gid, channel), { pid, name, text: text.trim().slice(0, 280), at: Date.now() }));

/** What the host reads off a phone to sign it back in: the first six of its uid. */
export const deviceCode = (uid) => (uid ?? '').slice(0, 6).toUpperCase();

/**
 * Signed out (cleared data, a new phone, the home-screen app, which keeps its
 * own storage): ask the host to sign this phone back in as the guest it was.
 * The host sees the name and the code and binds this uid to that guest
 * (host.js `relink`); the phone's binding listener then opens the game.
 */
export const knock = (gid, uid, name) =>
  trackWrite(setDoc(sub(gid, 'knocks', uid), { name: name.trim().slice(0, 24), code: deviceCode(uid), at: Date.now() }));
export const cancelKnock = (gid, uid) => trackWrite(deleteDoc(sub(gid, 'knocks', uid)));

export const requestLeave = (gid, pid) => trackWrite(updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: Date.now() }));

export const cancelLeave = (gid, pid) => trackWrite(updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: null }));

/**
 * A heartbeat only the host reads, never on a doc every phone listens to
 * (quota). The first beat also measures this phone's clock (lib/clockSkew.js).
 */
export const beat = (gid, pid) => measureOffset(sub(gid, 'presence', pid));
