/**
 * One clock for the whole room: the server's.
 *
 * A reveal is written as an instant ("flip at 21:04:07.500") and 40 phones
 * each wait for it. If each phone trusted its own clock, a phone two seconds
 * fast would gasp two seconds before the rest of its table. So every device,
 * the host included, measures how far its clock is from Firestore's and
 * reads time through `serverNow()`.
 *
 * The measurement: write a serverTimestamp to a doc the device owns, read it
 * back from the server, and assume the server stamped it halfway through the
 * round trip. On bar wifi that is accurate to roughly half a round trip, a
 * couple of hundred milliseconds, which is close enough for a room to react
 * together. Re-measured every few minutes because phones re-sync their clocks.
 *
 * Two guards for bad wifi. A slow round trip is thrown away: a write that sat
 * in the offline queue for a minute would put the offset half a minute out.
 * And the last good offset is kept on the device, so a reload (os/resync.js)
 * starts on the right time instead of the phone's own until it measures again.
 */

import { getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore';

const REMEASURE_MS = 5 * 60 * 1000;
const MAX_ROUND_TRIP_MS = 2500;
const SAVE_KEY = 'astral.clock';
const SAVED_FOR_MS = 30 * 60 * 1000;

let offsetMs = 0;
let lastMeasured = 0;
let inFlight = null;

// Start from the last good measurement. `lastMeasured` stays 0, so the first
// beat still measures fresh.
if (typeof window !== 'undefined') {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? 'null');
    if (Number.isFinite(saved?.offset) && Date.now() - saved.at < SAVED_FOR_MS) offsetMs = saved.offset;
  } catch {
    /* no storage: start from the device clock */
  }
}

export const serverNow = () => Date.now() + offsetMs;
export const clockOffset = () => offsetMs;

async function measure(ref, extra) {
  try {
    const t0 = Date.now();
    await setDoc(ref, { ...extra, stamp: serverTimestamp(), beatAt: t0 }, { merge: true });
    const snap = await getDocFromServer(ref);
    const t1 = Date.now();
    const stamp = snap.data()?.stamp?.toMillis?.();
    if (!stamp) return offsetMs;
    if (t1 - t0 > MAX_ROUND_TRIP_MS) {
      console.warn(`[clock] round trip ${t1 - t0} ms, offset kept`);
      return offsetMs;
    }
    offsetMs = stamp - (t0 + t1) / 2;
    lastMeasured = t1;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify({ offset: offsetMs, at: t1 }));
    } catch {
      /* no storage: this tab keeps it */
    }
  } catch (err) {
    console.warn('[clock] offset not measured:', err.code ?? err.message);
  }
  return offsetMs;
}

/**
 * Measure against `ref`, a doc this device may write and read. Never throws.
 * One measurement at a time: offline, the write never returns, and beats
 * would otherwise pile up behind it.
 */
export function measureOffset(ref, extra = {}) {
  if (lastMeasured && Date.now() - lastMeasured < REMEASURE_MS) return Promise.resolve(offsetMs);
  inFlight ??= measure(ref, extra).finally(() => { inFlight = null; });
  return inFlight;
}
