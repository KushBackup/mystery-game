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
 */

import { getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore';

let offsetMs = 0;
let lastMeasured = 0;

export const serverNow = () => Date.now() + offsetMs;
export const clockOffset = () => offsetMs;

const REMEASURE_MS = 5 * 60 * 1000;

/** Measure against `ref`, a doc this device may write and read. Never throws. */
export async function measureOffset(ref, extra = {}) {
  if (Date.now() - lastMeasured < REMEASURE_MS && lastMeasured) return offsetMs;
  try {
    const t0 = Date.now();
    await setDoc(ref, { ...extra, stamp: serverTimestamp(), beatAt: t0 }, { merge: true });
    const snap = await getDocFromServer(ref);
    const t1 = Date.now();
    const stamp = snap.data()?.stamp?.toMillis?.();
    if (stamp) {
      offsetMs = stamp - (t0 + t1) / 2;
      lastMeasured = t1;
    }
  } catch (err) {
    console.warn('[clock] offset not measured:', err.code ?? err.message);
  }
  return offsetMs;
}
