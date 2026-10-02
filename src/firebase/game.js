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
  doc, collection, query, where, orderBy, limit, onSnapshot, setDoc, updateDoc, writeBatch, serverTimestamp, addDoc,
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
  const run = () => {
    unsub = start((err) => {
      console.warn(`[killers] ${label}:`, err.code ?? err.message);
      unsub = null;
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

const watchDoc = (label, ref, cb) => resilient(label, (onError) => onSnapshot(ref, (s) => cb(docData(s)), onError));
const watchList = (label, q, cb, filter = () => true) =>
  resilient(label, (onError) => onSnapshot(q, (s) => cb(listData(s).filter(filter)), onError));

export const subscribeActive = (cb) =>
  resilient('meta/active', (onError) => onSnapshot(doc(db, 'meta', 'active'), (s) => cb(s.exists() ? s.data().gameId ?? null : null), onError));

export const subscribeGame = (gid, cb) => watchDoc('game', gameRef(gid), cb);

/**
 * The binding decides whether this phone is a guest yet. Only a binding the
 * server has *committed* counts: the local, still-pending copy of a fresh
 * arrival would mount the game screens a beat early, and their listeners,
 * which the rules check against that binding, would reach the server
 * before it exists and be refused.
 */
export const subscribeBinding = (gid, uid, cb) =>
  resilient('binding', (onError) =>
    onSnapshot(sub(gid, 'bindings', uid), { includeMetadataChanges: true }, (s) => {
      if (s.metadata.hasPendingWrites) return;
      cb(s.exists() ? s.data().pid : null);
    }, onError));

export const subscribePlayers = (gid, cb) => watchList('players', col(gid, 'players'), cb);
export const subscribeMyRole = (gid, pid, cb) => watchDoc('role', sub(gid, 'roles', pid), cb);
export const subscribeMyTraits = (gid, pid, cb) => watchDoc('traits', sub(gid, 'traits', pid), cb);
/** Every guest's arrival answers, as { pid: answers }. Public; frozen at the deal. */
export const subscribeAllTraits = (gid, cb) =>
  resilient('traits', (onError) => onSnapshot(col(gid, 'traits'), (s) => cb(Object.fromEntries(s.docs.map((d) => [d.id, d.data()]))), onError));
export const subscribeInbox = (gid, pid, cb) => watchList('inbox', query(col(gid, 'inbox'), where('to', '==', pid)), cb);
export const subscribeMyAction = (gid, cycle, pid, cb) => watchDoc('action', sub(gid, 'actions', `${cycle}_${pid}`), cb);
export const subscribeMyVote = (gid, ballot, pid, cb) => watchDoc('vote', sub(gid, 'votes', `${ballot}_${pid}`), cb);
export const subscribeMyScore = (gid, cycle, pid, cb) => watchDoc('score', sub(gid, 'scores', `${cycle}_${pid}`), cb);

// Killer-only. The rules deny these to everyone else, so only mount them for a Killer.
export const subscribeKillers = (gid, cb) =>
  resilient('killers', (onError) => onSnapshot(col(gid, 'killers'), (s) => cb(s.docs.map((d) => d.id)), onError));
export const subscribeDen = (gid, cycle, cb) =>
  watchList('den', query(col(gid, 'den'), where('cycle', '==', cycle)), cb, (d) => d.id !== 'meta');
/** Tonight's den status: is it a recruit night, is the frame spent. Killer-only. */
export const subscribeDenMeta = (gid, cb) => watchDoc('den meta', sub(gid, 'den', 'meta'), cb);

/** One channel: 'chat', 'denChat' or 'mediumChat'. Newest 100, returned oldest-first. */
export const subscribeChannel = (gid, channel, cb) =>
  resilient(channel, (onError) =>
    onSnapshot(query(col(gid, channel), orderBy('at', 'desc'), limit(100)), (s) => cb(listData(s).reverse()), onError));

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
  await batch.commit();
}

/** Fix one of your own answers. The rules allow it only until you have a role. */
export const updateMyTrait = (gid, pid, trait, value) => updateDoc(sub(gid, 'traits', pid), { [trait]: value });

export const submitAction = (gid, cycle, pid, action) =>
  setDoc(sub(gid, 'actions', `${cycle}_${pid}`), { ...action, pid, cycle, at: serverTimestamp() });

export const submitDen = (gid, cycle, pid, choice) =>
  setDoc(sub(gid, 'den', `${cycle}_${pid}`), { ...choice, pid, cycle, at: serverTimestamp() }, { merge: true });

export const submitVote = (gid, ballot, pid, target) =>
  setDoc(sub(gid, 'votes', `${ballot}_${pid}`), { target, pid, ballot, at: serverTimestamp() });

/** A new best for today's run. Only ever called with a higher score (the rules refuse a lower one). */
export const submitScore = (gid, cycle, pid, best, runs) =>
  setDoc(sub(gid, 'scores', `${cycle}_${pid}`), { pid, cycle, best, runs, at: Date.now() });

// --- The morning games (lib/engine/minigames.js). One doc per guest per day. -----------

/** One day's docs in a public morning-game collection (`clues`, `drawings`), oldest first. */
export const subscribeDayWall = (gid, name, cycle, cb) =>
  watchList(name, query(col(gid, name), where('cycle', '==', cycle)), (list) =>
    cb(list.sort((a, b) => (a.at?.toMillis?.() ?? Infinity) - (b.at?.toMillis?.() ?? Infinity))));
/** This guest's own doc in a private one (`picks`, `guesses`). */
export const subscribeMyPlay = (gid, name, cycle, pid, cb) => watchDoc(name, sub(gid, name, `${cycle}_${pid}`), cb);

/** Post your one clue. Once: the rules refuse an edit, so the wall's order is the order they landed. */
export const postClue = (gid, cycle, pid, clue) =>
  setDoc(sub(gid, 'clues', `${cycle}_${pid}`), { pid, cycle, clue: clue.trim().slice(0, 20), at: serverTimestamp() });

export const savePicks = (gid, cycle, pid, picks) =>
  setDoc(sub(gid, 'picks', `${cycle}_${pid}`), { pid, cycle, picks: picks.slice(0, 3), at: Date.now() });

export const saveDrawing = (gid, cycle, pid, strokes, checks) =>
  setDoc(sub(gid, 'drawings', `${cycle}_${pid}`), { pid, cycle, strokes, checks, at: serverTimestamp() });

export const saveGuesses = (gid, cycle, pid, answers) =>
  setDoc(sub(gid, 'guesses', `${cycle}_${pid}`), { pid, cycle, answers, at: Date.now() });

export const sendToChannel =(gid, channel, pid, name, text) =>
  addDoc(col(gid, channel), { pid, name, text: text.trim().slice(0, 280), at: Date.now() });

export const requestLeave = (gid, pid) => updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: Date.now() });

export const cancelLeave = (gid, pid) => updateDoc(sub(gid, 'players', pid), { leaveRequestedAt: null });

/**
 * A heartbeat only the host reads, never on a doc every phone listens to
 * (quota). The first beat also measures this phone's clock (lib/clockSkew.js).
 */
export const beat = (gid, pid) => measureOffset(sub(gid, 'presence', pid));
