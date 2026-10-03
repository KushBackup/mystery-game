/**
 * Hold Home for five seconds: the phone reloads and catches up with the room.
 *
 * Bar wifi drops, and a phone that lost it can be left behind three ways: a
 * listener that stalled without erroring (game.js `resilient` only heals one
 * that errors), a write still sitting in the offline queue, or a clock offset
 * measured through a bad connection. A full reload fixes all three at once: a
 * new Firestore connection, every listener started again, the clock measured
 * fresh. Nothing the guest has done is lost by it:
 *
 *   - sign-in persists (firebase/app.js), so they come back as the same guest;
 *   - queued writes live in Firestore's IndexedDB cache and go out after the
 *     reload;
 *   - drafts, the open app and a half-done set-up live in seen.js;
 *   - the service worker serves the page with no signal at all.
 *
 * Never clear the Firestore cache or terminate it here: that throws the queued
 * writes away, which is the one thing a guest on bad wifi can't afford.
 *
 * A flag in sessionStorage marks the reload, and the phone that comes back
 * checks with the server once and says how it went. No flag, no check, so
 * nothing here can loop.
 */

import { useSyncExternalStore } from 'react';
import { doc, getDocFromServer, waitForPendingWrites, disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from '../firebase/app.js';
import { watchAuth } from '../firebase/game.js';

/** How long Home is held before the phone resyncs. */
export const HOLD_MS = 5000;

const FLAG = 'astral.resync';
const FLUSH_MS = 3000; // waiting for queued writes before reloading anyway
const SHOW_MS = 700; // the overlay stays at least this long, so the guest sees what the hold did
const CHECK_MS = 10_000; // the phone that comes back waiting for the server
const FRESH_MS = 60_000; // an older flag belongs to some other visit

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
/** True if `promise` settles well inside `ms`, false if it fails or runs out of time. */
const within = (promise, ms) => Promise.race([promise.then(() => true), wait(ms).then(() => false)]).catch(() => false);

/** Resolves once a user is signed in: meta/active can't be read before that. */
const signedIn = () => new Promise((resolve) => {
  const stop = watchAuth((user) => {
    if (!user) return;
    resolve();
    setTimeout(() => stop());
  });
});

// --- What the phone says after a resync: null | 'syncing' | 'synced' | 'offline' -----

let note = null;
let clearTimer = null;
const listeners = new Set();
const setNote = (next, clearAfter = 0) => {
  note = next;
  clearTimeout(clearTimer);
  if (clearAfter) clearTimer = setTimeout(() => setNote(null), clearAfter);
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The server answered and every queued write has been dealt with: this phone is where the room is. */
async function confirm() {
  setNote('syncing');
  const ok = await within(
    signedIn().then(() => Promise.all([waitForPendingWrites(db), getDocFromServer(doc(db, 'meta', 'active'))])),
    CHECK_MS,
  );
  setNote(ok ? 'synced' : 'offline', ok ? 2500 : 5000);
}

/** The status pill under the status bar, on every screen (PhoneFrame). */
export const useResyncNote = () => useSyncExternalStore(subscribe, () => note, () => null);

/**
 * The hold finished. Give queued writes a moment to land, then reload.
 * Resolves 'soft' when it restarted the connection in place instead (the page
 * stays), so the caller can take its overlay down; a reload never resolves.
 */
export async function resync() {
  try {
    sessionStorage.setItem(FLAG, String(Date.now()));
  } catch {
    /* storage blocked: the reload still runs, only the note after it is lost */
  }
  await Promise.all([within(waitForPendingWrites(db), FLUSH_MS), wait(SHOW_MS)]);

  // No service worker to serve the page and no signal: a reload would land on
  // the browser's own offline page. Restart the connection in place instead.
  if (!navigator.serviceWorker?.controller && navigator.onLine === false) {
    try { sessionStorage.removeItem(FLAG); } catch { /* nothing to undo */ }
    await disableNetwork(db).catch(() => {});
    await enableNetwork(db).catch(() => {});
    confirm();
    return 'soft';
  }
  window.location.reload();
  return new Promise(() => {});
}

// The phone that comes back from a resync's reload.
(function checkAfterReload() {
  if (typeof window === 'undefined') return;
  let at = 0;
  try {
    at = Number(sessionStorage.getItem(FLAG)) || 0;
    sessionStorage.removeItem(FLAG);
  } catch {
    return;
  }
  if (at && Date.now() - at < FRESH_MS) confirm();
})();
