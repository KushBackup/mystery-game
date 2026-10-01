/**
 * Drill-down navigation inside an app, iOS style: a list pushes a detail in
 * from the right, and Back pops it off to the left. The direction is kept so
 * the screen being revealed knows which way to slide in.
 */

import { useState } from 'react';

export function useStack(initial = null) {
  const [s, set] = useState({ top: initial, dir: null });
  const push = (id) => set({ top: id, dir: 'push' });
  const pop = () => set({ top: null, dir: 'pop' });
  return { top: s.top, dir: s.dir, push, pop };
}

/** Whether the viewer asked for less motion. Read once per call; cheap. */
export const prefersLessMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
