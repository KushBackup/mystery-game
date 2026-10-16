/**
 * Toasts: a short line the phone says back when a tap can't do what the guest
 * hoped (a locked app, say). Unlike a banner (chrome.jsx) a toast is never news
 * from the room and never opens anything: it answers the guest's own tap, sits
 * above the dock, and goes on its own. A tap on it puts it away early.
 *
 * One at a time. A new toast replaces the one showing; the same `id` again
 * (the guest tapping the same locked icon twice) keeps it up and restarts its
 * clock instead of playing it in again.
 *
 *   toast('Saved.')
 *   toast({ id: 'locked:deepblue', icon: 'deepblue', title: 'DEEP BLUE', text: '…' })
 *
 * The phone frame renders it (chrome.jsx Toaster); a takeover clears it.
 */

import { useSyncExternalStore } from 'react';

/** How long the exit plays (os.css .os-toast--out). */
const LEAVE_MS = 200;

let current = null; // { id, icon, title, text, leaving, n }
let seq = 0;
let timer = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

/** Long enough to read: about a word every 200ms, never under 2.4s or over 6s. */
const readMs = (t) => Math.min(6000, Math.max(2400, 1400 + `${t.title ?? ''} ${t.text ?? ''}`.length * 45));

const schedule = (ms) => {
  clearTimeout(timer);
  timer = setTimeout(() => dismissToast(), ms);
};

/** Show a toast: a string, or `{ id?, icon?, title?, text }`. Returns its id. */
export function toast(input) {
  const t = typeof input === 'string' ? { text: input } : input;
  const id = t.id ?? `toast${++seq}`;
  if (current && current.id === id && !current.leaving) {
    // The same toast again: same element, fresh clock, and `n` lets it nudge once.
    current = { ...current, ...t, id, n: current.n + 1 };
  } else {
    current = { ...t, id, leaving: false, n: 0 };
  }
  emit();
  schedule(readMs(current));
  return id;
}

/** Put the toast away (or only `id`, if that is the one showing). */
export function dismissToast(id) {
  if (!current || current.leaving || (id && current.id !== id)) return;
  current = { ...current, leaving: true };
  emit();
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, LEAVE_MS);
}

/** Drop it at once, with no exit: a takeover is coming over the screen. */
export function clearToast() {
  clearTimeout(timer);
  if (!current) return;
  current = null;
  emit();
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** The toast showing now, or null. */
export const useToast = () => useSyncExternalStore(subscribe, () => current, () => null);
