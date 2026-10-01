/**
 * What this phone has already looked at: the read marks behind every badge.
 *
 * Local only (localStorage), never Firestore: a badge is one person's state,
 * and 40 phones writing read receipts would cost more than the whole game.
 * Keys are scoped by game id, so a new game starts every badge fresh.
 *
 * A tiny external store, so any component can read a mark with
 * useSeen() and re-render when another component moves it.
 */

import { useSyncExternalStore } from 'react';

const PREFIX = 'deepblue.seen.';
const listeners = new Set();
const cache = new Map();

function read(key) {
  if (cache.has(key)) return cache.get(key);
  let v = null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    v = raw == null ? null : JSON.parse(raw);
  } catch {
    v = null;
  }
  cache.set(key, v);
  return v;
}

export function markSeen(key, value) {
  if (JSON.stringify(read(key)) === JSON.stringify(value)) return;
  cache.set(key, value);
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* private mode: the mark lasts this session */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The stored mark for `key`, or `fallback` if there is none. */
export function useSeen(key, fallback = null) {
  const v = useSyncExternalStore(subscribe, () => read(key), () => null);
  return v ?? fallback;
}

/** Private notes, same store, so the Notes app keeps what you typed across reloads. */
export const noteKey = (gid) => `${gid}.notes`;
