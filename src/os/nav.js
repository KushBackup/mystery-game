/**
 * Drill-down navigation inside an app, iOS style: a list pushes a detail in
 * from the right, and Back pops it off to the left. The direction is kept so
 * the screen being revealed knows which way to slide in.
 */

import { useState } from 'react';
import { markSeen, peekSeen } from './seen';

/**
 * `keep` (a seen.js key, game id first) keeps the open page on the phone, so
 * a reload comes back to the same conversation or card, as iOS apps do.
 * An explicit `initial` (a banner opening one thread) wins over it.
 */
export function useStack(initial = null, keep = null) {
  const [s, set] = useState(() => ({ top: initial ?? (keep ? peekSeen(keep) : null), dir: null }));
  const push = (id) => { if (keep) markSeen(keep, id); set({ top: id, dir: 'push' }); };
  const pop = () => { if (keep) markSeen(keep, null); set({ top: null, dir: 'pop' }); };
  return { top: s.top, dir: s.dir, push, pop };
}

/** Whether the viewer asked for less motion. Read once per call; cheap. */
export const prefersLessMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
